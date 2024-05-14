const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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

module.exports = mongoose.model('Player', playerSchema);


// http://15.207.88.203:3000   