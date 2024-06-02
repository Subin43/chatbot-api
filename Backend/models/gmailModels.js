const mongoose = require('mongoose');

const demoUserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone_number: { type: String, required: true }
});

const Demo_users = mongoose.model('Demo_users', demoUserSchema);

module.exports = { Demo_users };
