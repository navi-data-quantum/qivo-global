const validate = (schema) => {
  if (!schema) {
    throw new Error("Validation schema is required");
  }

  return (req, res, next) => {
    try {
      const result = schema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: result.error.errors.map(err => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      }

      req.body = result.data;
      next();
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Validation middleware error",
        error: err.message
      });
    }
  };
};

module.exports = validate;