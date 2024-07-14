const mongoose = require('mongoose');


const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    required: true,
    default: 'active'
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  teams: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }
  ],
  eventId : {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  event : {
    type: String,
    default: 'US'
  },
});

playerSchema.pre('save', async function (next) {
  // Only check uniqueness when status is "active"
  if (this.status === 'active' && this.isModified('name')) {
      const existingPlayer = await this.model('Player').findOne({ name: this.name, status: 'active' });
      if (existingPlayer) {
          const err = new Error('Player name must be unique when status is active');
          return next(err);
      }
  }
  next();
});

module.exports = mongoose.model('Player', playerSchema);


// http://15.207.88.203:3000   