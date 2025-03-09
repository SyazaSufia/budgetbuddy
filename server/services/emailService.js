const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

// Email Transporter (Using Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const BASE_URL = process.env.NODE_ENV === "production" 
  ? "https://budgetbuddy.space" 
  : "http://localhost:5173";

// Function to send password reset email
exports.sendResetEmail = async (userEmail, resetToken) => {
  const resetLink = `${BASE_URL}/reset-password?token=${resetToken}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Password Reset Request',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', userEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email sending failed');
  }
};
