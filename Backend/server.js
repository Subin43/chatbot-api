const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE', 'PUT']
}));

// Import the email route
const emailRoute = require('./routes/emailRoute');
const botRoute = require('./routes/botRoutes');
app.use('/email', emailRoute);
app.use('/bot', botRoute);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('App connected to database');
    app.listen(port, () => {
      console.log(`App is listening to port: ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to database:', error);
  });
