const express = require('express');
const nodemailer = require('nodemailer');
const { Demo_users } = require('../models/gmailModels'); // Adjust the import according to your file structure
require('dotenv').config(); // Ensure dotenv is configured at the start

const router = express.Router();

// Nodemailer transport configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USERNAME, // Your Gmail address
    pass: process.env.MAIL_PASSWORD  // Your Gmail password or app password
  }
});

router.post('/auth', async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Missing parameters' });
    }

    const newUser = new Demo_users({ name, email, phone_number: phone });
    await newUser.save();

    // Mail options for the user
    const userMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: email,
      subject: 'Registration Confirmation',
      text: `Dear ${name}, thank you for registering!`
    };

    // Mail options for the owner
    const ownerMailOptions = {
      from: process.env.MAIL_USERNAME,
      to: 'selvin472001@gmail.com', // Replace with the actual owner email
      subject: 'New Registration',
      text: `New registration details:\nName: ${name}\nEmail: ${email}\nPhone Number: ${phone}`
    };

    // Send emails
    await transporter.sendMail(userMailOptions);
    await transporter.sendMail(ownerMailOptions);

    res.json({ message: 'Emails sent successfully!' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
