const Joi = require("joi");

const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/;

const registerSchema = Joi.object({
  name: Joi.string().trim().min(3).max(50).required(),

  email: Joi.string().trim().lowercase().email().required(),

  password: Joi.string()
    .min(8)
    .max(30)
    .pattern(strongPasswordPattern)
    .required()
    .messages({
      "string.pattern.base":
        "Password must contain uppercase, lowercase, number and special character",
    }),

  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Passwords must match",
    }),

  role: Joi.string().valid("user", "provider", "admin").default("user"),

  language: Joi.string()
    .valid("en", "fr", "es", "ar", "de")
    .default("en"),
}).options({ abortEarly: false });

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().required(),
}).options({ abortEarly: false });

module.exports = {
  registerSchema,
  loginSchema,
};
