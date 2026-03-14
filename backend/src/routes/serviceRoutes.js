const express = require("express");
const router = express.Router();
const {
  addService,
  listServices,
  getService,
  editService,
  removeService,
} = require("../controllers/serviceController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addService);
router.get("/", listServices);
router.get("/:id", getService);
router.put("/:id", protect, editService);
router.delete("/:id", protect, removeService);

module.exports = router;

