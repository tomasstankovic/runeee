/**
 * Header scroll fixing.
 */

var classie = require('../lib/classie.js');

exports.init = function() {
  var profileHeader = document.querySelector('.fixed-header');

  if (profileHeader !== null) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 70) {
        if (!classie.has(profileHeader, 'fixed')) {
          classie.add(profileHeader, 'fixed');
        }
      } else {
        classie.remove(profileHeader, 'fixed');
      }
    });
  }
};
