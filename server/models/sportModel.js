/**
 * Sport model.
 */
var mongoose = require('mongoose');

var userModel = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('sport', userModel);
