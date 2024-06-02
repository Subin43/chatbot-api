const mongoose = require('mongoose');

const botSchema = new mongoose.Schema({
  message: { type: String, required: true },
  reply:{type:String,required:true},
  
},{timestamps:true});

const Bot_User = mongoose.model('botSchema', botSchema);

module.exports = { Bot_User };
