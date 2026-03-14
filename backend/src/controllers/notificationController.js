const db = require("../config/db");

const createNotification = async (req, res) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "userId, title and message are required"
      });
    }

    const result = await db.query(
      `INSERT INTO notifications (user_id, title, message, type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title, message, type || "general"]
    );

    return res.status(201).json({
      success: true,
      notification: result.rows[0]
    });

  } catch (error) {
    console.error("Notification creation error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = {
  createNotification,
};