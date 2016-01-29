/**
 * Comment scroll fix.
 *
 */
var classie = require('../lib/classie.js');


exports.init = function() {
  var commentBox = document.getElementById('comment-fixed');

  if (commentBox !== null) {
    var commentBoxPosition = commentBox.getBoundingClientRect().top + window.scrollY - 65;

    window.addEventListener('scroll', function() {
      if (window.scrollY >= commentBoxPosition) {
        if (!classie.has(commentBox, 'fixed')) {
          classie.add(commentBox, 'fixed');
        }
      } else {
        classie.remove(commentBox, 'fixed');
      }
    });
  }
};
