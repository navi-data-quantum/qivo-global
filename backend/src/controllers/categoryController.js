const pool = require("../config/db"); 

exports.getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories WHERE is_active = true");
    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};