const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  createdBy: {
    type: String,
    required: true
  },
  users: [
    { id : {type: mongoose.Schema.Types.ObjectId, ref: 'Player'},
      points: Number,
      name: String
     }
  ],
  totalPoints: {
    type: Number,
    required: true,
  },
  event : {
    type: String,
    enum: ['US', 'UK'],
    // default: 'US'
  },
  createdOn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', teamSchema);
