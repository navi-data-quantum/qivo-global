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
      return {
        allowed: false,
        message: "Free limit reached",
        upgradeRequired: true
      };
    }
    return { allowed: true };
  }

  static validateContent(content) {
    if (!content || content.trim() === "") {
      throw new AppError("Empty message", 400);
    }

    if (this.containsPhoneNumber(content)) {
      throw new AppError("Phone numbers not allowed", 400);
    }

    if (this.containsEmail(content)) {
      throw new AppError("Emails not allowed", 400);
    }

    if (this.containsLink(content)) {
      throw new AppError("Links not allowed", 400);
    }
  }

  static async getMessageCount(conversationId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM messages WHERE conversation_id = $1`,
      [conversationId]
    );
    return Number(rows[0].count);
  }

  static async checkCooldown(conversationId, senderId) {
    const { rows } = await pool.query(
      `SELECT created_at
       FROM messages
       WHERE conversation_id=$1 AND sender_id=$2
       ORDER BY created_at DESC
       LIMIT 1`,
      [conversationId, senderId]
    );

    if (rows.length === 0) return;

    const lastMessageTime = new Date(rows[0].created_at).getTime();
    const now = Date.now();

    if (now - lastMessageTime < MESSAGE_COOLDOWN_SECONDS * 1000) {
      throw new AppError("You're sending messages too fast", 429);
    }
  }

  static async checkRateLimit(senderId) {
    const { rows } = await pool.query(
      `SELECT COUNT(*) 
       FROM messages
       WHERE sender_id=$1
       AND created_at > NOW() - INTERVAL '1 minute'`,
      [senderId]
    );

    const count = Number(rows[0].count);

    if (count >= RATE_LIMIT_PER_MINUTE) {
      throw new AppError("Too many messages, slow down", 429);
    }
  }

  static async insertMessage(conversationId, senderId, content, type) {
    const { rows } = await pool.query(
      `INSERT INTO messages
       (conversation_id, sender_id, content, type)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [conversationId, senderId, content, type]
    );
    return rows[0];
  }

  static async sendMessage({ conversationId, senderId, content, type = "text" }) {
    this.validateContent(content);

    const count = await this.getMessageCount(conversationId);
    const check = this.checkFreeLimit(count);
    if (!check.allowed) return check;

    await this.checkCooldown(conversationId, senderId);
    await this.checkRateLimit(senderId);

    const message = await this.insertMessage(
      conversationId,
      senderId,
      content,
      type
    );

    return {
      allowed: true,
      message
    };
  }
}

module.exports = ChatService;
