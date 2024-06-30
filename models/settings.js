const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'Team Creation Settings',
    unique: true
  },
  lastUpdatedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    required: true,
  }
});

module.exports = mongoose.model('Settings', settingsSchema);