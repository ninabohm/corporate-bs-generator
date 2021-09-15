const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  wordType: {
    type: String,
    required: true
  },
  wordContent: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    required: true,
    default: "public"
  },
  createdAt: {
    type: Date,
    default: Date.now
  },  
  userId: {
    type: String,
    required: true,
  },
});


module.exports = mongoose.model('Entry', entrySchema);