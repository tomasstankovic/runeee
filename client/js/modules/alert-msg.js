/**
 * Alert msg closing.
 */
var classie = require('../lib/classie.js');

exports.init = function() {
  var alert = document.querySelector('.alert-msg');

  if (alert) {
    alert.addEventListener('click', function() {
      classie.add(alert, 'hide');
    });
  }
};
