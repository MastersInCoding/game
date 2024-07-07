const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  active: {
    type: Boolean,
    default: false
  },
  lastUpdatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('Events', eventSchema);