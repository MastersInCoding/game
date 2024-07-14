const mongoose = require('mongoose');
const Counter = require('./counter'); 


const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },

  uniqueId :{
    type: String
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    default: 'user'
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

userSchema.pre('save', async function (next) {
  const user = this;
  if(user.isNew){
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const seq = counter.seq;
      const uniqueId = `AA${seq}`;

      user.uniqueId = uniqueId;
      next();
    } catch (error) {
      next(error);
    }
  }
});

module.exports = mongoose.model('User', userSchema);
