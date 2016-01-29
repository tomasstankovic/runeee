/**
 * Activity model.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var activityModel = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  sport: {
    type: Schema.Types.ObjectId,
    ref: 'sport',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    hours: Number,
    minutes: Number,
    seconds: Number
  },
  hr: {
    max: Number,
    avg: Number
  },
  speed: {
    max: Number,
    avg: Number
  },
  distance: Number,
  calories: Number,
  regeneration: Number,
  isPublic: {
    type: Boolean,
    required: true,
    default: true
  },
  isCompetition: {
    type: Boolean,
    required: true,
    default: false
  }
});

module.exports = mongoose.model('activity', activityModel);
