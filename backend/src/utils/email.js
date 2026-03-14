const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const sendEmail = async ({ to, subject, html }) => {
  if (!to || !validateEmail(to)) {
    throw new Error("Invalid email address");
  }
  if (!subject) {
    throw new Error("Email subject is required");
  }
  if (!html) {
    throw new Error("Email content is required");
  }

  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: [to],
      subject,
      html,
    });

    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;