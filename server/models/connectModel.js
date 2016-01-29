/**
 * Sport model.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var connectModel = new mongoose.Schema({
  userA: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  userB: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
});

module.exports = mongoose.model('connect', connectModel);
