const db = require("../../config/db");

const createConversation = async ({ bookingId, userId, providerId }) => {
  const { rows } = await db.query(
    `INSERT INTO conversations (booking_id, user_id, provider_id, status)
     VALUES ($1, $2, $3, 'active')
     RETURNING *`,
    [bookingId, userId, providerId]
  );
  return rows[0];
};

const findConversationByBookingId = async (bookingId) => {
  const { rows } = await db.query(
    `SELECT * FROM conversations WHERE booking_id = $1`,
    [bookingId]
  );
  return rows[0];
};

const closeConversation = async (conversationId) => {
  await db.query(
    `UPDATE conversations SET status = 'closed' WHERE id = $1`,
    [conversationId]
  );
};

module.exports = { createConversation, findConversationByBookingId, closeConversation };