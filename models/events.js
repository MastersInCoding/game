const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['US', 'UK'],
    required: true,
    default: 'US',
  },
  lastUpdatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('Events', eventSchema);