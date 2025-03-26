const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Re_Store <${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV == 'production') {
      // transporter for sendgrid
      return nodemailer.createTransport({
        host: 'smtp-relay.sendinblue.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_USERNAME,
          pass: process.env.BREVO_PASSWORD, // Your Brevo SMTP key
        },
      });
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    try {
      console.log(`Starting email send process for template: ${template}, subject: ${subject}`);
      console.log(`Sending to: ${this.to}`);
      
      // 1) Render HTML based on pug template
      const templatePath = `${__dirname}/../views/emails/${template}.pug`;
      console.log(`Rendering template from: ${templatePath}`);
      
      const html = pug.renderFile(
        templatePath,
        {
          firstName: this.firstName,
          url: this.url,
          auctionDetails: this.auctionDetails
        }
      );
      
      // 2) Define Mail Options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        html: html,
        text: htmlToText.convert(html),
      };
      
      console.log(`Creating email transport`);
      const transport = this.newTransport();
      
      // 3) create a transport and send email
      console.log(`Sending email...`);
      const info = await transport.sendMail(mailOptions);
      console.log(`Email sent successfully. Response:`, info.response);
    } catch (error) {
      console.error(`Error sending email for template ${template}:`, error);
      throw error;
    }
  }
  async sendWelcome() {
    this.send('welcome', 'Welcome To Re_Store');
  }
  async sendVerification() {
    this.send('verification', 'Email Verification');
  }
  async sendPasswordReset() {
    this.send('passwordReset', 'Reset Password');
  }
  async sendAuctionWinner(auctionDetails) {
    // Store auction details for the template
    this.auctionDetails = auctionDetails;
    this.send('auctionWinner', 'Congratulations! You Won the Auction');
  }
  async sendAuctionSeller(auctionDetails) {
    // Store auction details for the template
    this.auctionDetails = auctionDetails;
    this.send('auctionSeller', 'Your Auction Has Ended');
  }
};
