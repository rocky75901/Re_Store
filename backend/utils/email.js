const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Creating a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Setting email options
  const mailOptions = {
    from: `"Re_Store" <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4152b3;">Re_Store Email Verification</h2>
        <p>Hello,</p>
        <p>Thank you for signing up with Re_Store. Please use the following verification code to verify your email address:</p>
        <div style="background-color: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0; font-size: 24px; font-weight: bold; color: #4152b3;">
          ${options.message}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't create an account with Re_Store, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
      </div>
    `,
  };

  // Sending the mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
