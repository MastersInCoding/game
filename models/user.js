const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: {
    type: String,
    rquired: false,
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  teams: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  ]
});

module.exports = mongoose.model('User', userSchema);
