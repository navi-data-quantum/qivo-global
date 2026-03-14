const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/conversation", chatController.createConversation);

router.post(
  "/conversation/:conversationId/message",
  chatController.sendMessage
);

router.get(
  "/conversation/:conversationId/messages",
  chatController.getMessages
);

module.exports = router;