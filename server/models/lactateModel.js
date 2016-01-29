/**
 * Sport model.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var commentModel = new mongoose.Schema({
  userID: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  intervalDistance: {
    type: Number,
    required: true
  },
  temperature: {
    type: Number
  },
  place: {
    type: String
  },
  test: [{
    index: {
      type: Number,
      required: true
    },
    lactate: {
      type: Number,
      required: true
    },
    hrMax: {
      type: Number,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  }]

});

module.exports = mongoose.model('lactate', commentModel);
