const mongoose = require('mongoose');

const timerSchema = new mongoose.Schema({
  endTime: {
    type: String,
    required: true
  },
  active:{
    type: Boolean,
    required: true,
    default: false
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Timer', timerSchema);