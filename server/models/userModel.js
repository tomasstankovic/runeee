/**
 * User model.
 */
var mongoose = require('mongoose');

var userModel = new mongoose.Schema({
  reg_date: {
    type: Date,
    required: true,
    default: Date.now
  },
  local: {
    email: String,
    password: String
  },
  url: {
    type: String
  },
  facebook: {
    id: String,
    token: String,
    email: String
  },
  avatar_url: {
    type: String,
    default: '/build/img/default.png'
  },
  avatarDate: {
    type: String
  },
  avatarType: {
    type: String
  },
  isActive: {
    type: Boolean,
    required: true
  },
  isCoach: {
    type: Boolean
  },
  isCompleted: {
    type: Boolean,
    required: true
  },
  nick: {
    type: String
  },
  name: {
    type: String
  },
  surname: {
    type: String
  },
  age: {
    type: Number,
    min: 1,
    max: 150
  },
  description: {
    type: String
  },
  gender: {
    type: String
  },
  sports: [mongoose.Schema.Types.ObjectId],
  weight: {
    type: Number
  },
  height: {
    type: Number
  },
  vo2max: {
    type: Number
  },
  hr: {
    max: Number,
    anp: Number,
    ap: Number,
    zones: {
      zone5: {
        beats: Number,
        percentage: Number
      },
      zone4: {
        beats: Number,
        percentage: Number
      },
      zone3: {
        beats: Number,
        percentage: Number
      },
      zone2: {
        beats: Number,
        percentage: Number
      },
      zone1: {
        beats: Number,
        percentage: Number
      }
    }
  }
});

module.exports = mongoose.model('user', userModel);
