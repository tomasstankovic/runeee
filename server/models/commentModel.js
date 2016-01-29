/**
 * Sport model.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var commentModel = new mongoose.Schema({
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'activity'
  },
  training: {
    type: Schema.Types.ObjectId,
    ref: 'training'
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  text: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('comment', commentModel);
