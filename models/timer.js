const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  endTime: {
    type: String,
    required: true
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Timer', timerSchema);