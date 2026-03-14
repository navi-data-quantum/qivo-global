const fs = require("fs");
const path = require("path");
const sendEmail = require("../utils/email");

const getResetPasswordTemplate = (resetUrl, userName) => {
  return `
  <html>
    <body style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>Hello ${userName},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
        <p style="color: #999; font-size: 12px;">QIVO Team</p>
      </div>
    </body>
  </html>
  `;
};

const sendResetPasswordEmail = async (to, resetUrl, userName) => {
  const html = getResetPasswordTemplate(resetUrl, userName);
  return sendEmail({
    to,
    subject: "Reset Your QIVO Password",
    html,
  });
};

module.exports = {
  sendResetPasswordEmail,
};