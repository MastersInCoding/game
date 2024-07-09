const mongoose = require('mongoose');

const textSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  lastUpdatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  content: {
    type: String,
  }
});

module.exports = mongoose.model('TextSchema', textSchema);