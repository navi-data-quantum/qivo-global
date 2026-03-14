const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const chatService = require("../services/chatService");
const db = require("../config/db");
const MESSAGE_LIMIT = 20;

exports.createConversation = asyncHandler(async (req, res) => {
  const { booking_id, provider_id } = req.body;
  const userId = req.user.id;
  if (!booking_id || !provider_id) throw new AppError("Invalid payload", 400);
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const bookingCheck = await client.query(
      `SELECT id FROM bookings WHERE id = $1 AND user_id = $2`,
      [booking_id, userId]
    );
    if (bookingCheck.rowCount === 0) throw new AppError("Unauthorized booking reference", 403);
    const existing = await client.query(
      `SELECT id, booking_id, user_id, provider_id, created_at
       FROM conversations
       WHERE booking_id = $1
       FOR UPDATE`,
      [booking_id]
    );
    if (existing.rowCount > 0) {
      await client.query("COMMIT");
      return res.status(200).json({ success: true, data: existing.rows[0] });
    }
    const result = await client.query(
      `INSERT INTO conversations (booking_id, user_id, provider_id)
       VALUES ($1, $2, $3)
       RETURNING id, booking_id, user_id, provider_id, created_at`,
      [booking_id, userId, provider_id]
    );
    await client.query("COMMIT");
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
});

exports.sendMessage = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const { content, type = "text" } = req.body;
  const senderId = req.user.id;
  if (!content || content.trim().length === 0) throw new AppError("Message cannot be empty", 400);
  const conversationCheck = await db.query(
    `SELECT id FROM conversations WHERE id = $1 AND (user_id = $2 OR provider_id = $2)`,
    [conversationId, senderId]
  );
  if (conversationCheck.rowCount === 0) throw new AppError("Access denied", 403);
  const result = await chatService.sendMessage({ conversationId, senderId, content: content.trim(), type });
  if (!result.allowed) throw new AppError(result.message, 403);
  res.status(201).json({ success: true, data: result.message });
});

exports.getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = MESSAGE_LIMIT;
  const offset = (page - 1) * limit;
  const accessCheck = await db.query(
    `SELECT id FROM conversations WHERE id = $1 AND (user_id = $2 OR provider_id = $2)`,
    [conversationId, userId]
  );
  if (accessCheck.rowCount === 0) throw new AppError("Access denied", 403);
  const messages = await db.query(
    `SELECT id, conversation_id, sender_id, content, type, created_at
     FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [conversationId, limit, offset]
  );
  res.status(200).json({
    success: true,
    page,
    hasMore: messages.rowCount === limit,
    data: messages.rows.reverse(),
  });
});

exports.typing = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  await db.query(
    `INSERT INTO chat_typing_status (session_id, user_id, is_typing, last_update)
     VALUES ($1, $2, TRUE, NOW())
     ON CONFLICT (session_id, user_id)
     DO UPDATE SET is_typing = TRUE, last_update = NOW()`,
    [conversationId, userId]
  );
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ action: 'typing', conversationId, userId }));
    }
  });
  res.status(200).json({ success: true });
});