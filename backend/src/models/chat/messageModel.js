const db = require("../../config/db");

const createMessage = async (conversationId, senderId, content, type = "text") => {
  const { rows } = await db.query(
    `INSERT INTO messages (conversation_id, sender_id, content, type)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [conversationId, senderId, content, type]
  );
  return rows[0];
};

const getMessagesByConversation = async (conversationId) => {
  const { rows } = await db.query(
    `SELECT * FROM messages
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId]
  );
  return rows;
};

module.exports = { createMessage, getMessagesByConversation };