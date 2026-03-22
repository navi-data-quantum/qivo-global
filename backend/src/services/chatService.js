const pool = require("../config/db");
const AppError = require("../utils/AppError");

const FREE_MESSAGE_LIMIT = 5;
const MESSAGE_COOLDOWN_SECONDS = 3;
const RATE_LIMIT_PER_MINUTE = 20;

class ChatService {
  static containsPhoneNumber(text) {
    return /(\+?\d[\d\s-]{7,}\d)/g.test(text);
  }

  static containsEmail(text) {
    return /\S+@\S+\.\S+/.test(text);
  }

  static containsLink(text) {
    return /(https?:\/\/|www\.)/i.test(text);
  }

  static checkFreeLimit(count) {
    if (count >= FREE_MESSAGE_LIMIT) {
      return { allowed: false, message: "Free limit reached", upgradeRequired: true };
    }
    return { allowed: true };
  }

  static validateContent(content) {
    if (!content || content.trim() === "") throw new AppError("Empty message", 400);
    if (this.containsPhoneNumber(content)) throw new AppError("Phone numbers not allowed", 400);
    if (this.containsEmail(content)) throw new AppError("Emails not allowed", 400);
    if (this.containsLink(content)) throw new AppError("Links not allowed", 400);
  }

  static async getMessageCount(sessionId) {
    const { rows } = await pool.query(`SELECT COUNT(*) FROM chat_messages WHERE session_id = $1`, [sessionId]);
    return Number(rows[0].count);
  }

  static async checkCooldown(sessionId, senderId) {
    const { rows } = await pool.query(
      `SELECT created_at FROM chat_messages WHERE session_id = $1 AND sender_id = $2 ORDER BY created_at DESC LIMIT 1`,
      [sessionId, senderId]
    );
    if (rows.length === 0) return;
    const lastMessageTime = new Date(rows[0].created_at).getTime();
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_COOLDOWN_SECONDS * 1000) throw new AppError("You're sending messages too fast", 429);
  }

  static async checkRateLimit(senderId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM chat_messages WHERE sender_id = $1 AND created_at > NOW() - INTERVAL '1 minute'`,
      [senderId]
    );
    const count = Number(rows[0].count);
    if (count >= RATE_LIMIT_PER_MINUTE) throw new AppError("Too many messages, slow down", 429);
  }

  static async insertMessage(sessionId, senderId, content, type) {
    const { rows } = await pool.query(
      `INSERT INTO chat_messages (session_id, sender_id, content, type) VALUES ($1, $2, $3, $4) RETURNING *`,
      [sessionId, senderId, content, type]
    );
    return rows[0];
  }

  static async sendMessage({ sessionId, senderId, content, type = "text" }) {
    this.validateContent(content);
    const count = await this.getMessageCount(sessionId);
    const check = this.checkFreeLimit(count);
    if (!check.allowed) return check;
    await this.checkCooldown(sessionId, senderId);
    await this.checkRateLimit(senderId);
    const message = await this.insertMessage(sessionId, senderId, content, type);
    return { allowed: true, message };
  }
}

module.exports = ChatService;