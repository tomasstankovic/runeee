/**
 * Show modal window.
 */

var classie = require('../lib/classie.js');

exports.init = function() {
  var modalButtons = document.querySelectorAll('.showModal'),
    modalButtonsLen = modalButtons.length,
    modalShadow = document.getElementById('modal-shadow'),
    ACTUAL_MODAL;

  /**
   * Hide modal.
   */
  var hideModal = function() {
    classie.removeClass(ACTUAL_MODAL, 'show-modal');

    setTimeout(function() {
      classie.removeClass(ACTUAL_MODAL, 'show');
    }, 500);

    classie.removeClass(modalShadow, 'show-bg');
    setTimeout(function() {
      classie.removeClass(modalShadow, 'show');
    }, 500);
  };

  /**
   * Show modal.
   */
  var addModalListener = function(el) {
    el.addEventListener('click', function(e) {
      e.preventDefault();

      var modalId = this.getAttribute('href').substring(1),
        modal = document.getElementById(modalId);

      ACTUAL_MODAL = modal;

      if (!classie.hasClass(modalShadow, 'show')) {
        classie.addClass(modalShadow, 'show');

        setTimeout(function() {
          classie.addClass(modalShadow, 'show-bg');
        }, 1);

        setTimeout(function() {
          classie.addClass(modal, 'show');

          setTimeout(function() {
            classie.addClass(modal, 'show-modal');
          }, 10);
        }, 200);
      }

      modal.addEventListener('click', function() {
        if (e.target.getAttribute('class') === 'modal-close') {
          e.preventDefault();
          hideModal();
        }
      });

      modal.querySelector('.modal-close').addEventListener('click', function() {
        e.preventDefault();
        hideModal();
      });
    });
  };

  if (modalButtons.length > 0) {
    modalShadow.addEventListener('click', function() {
      if (classie.hasClass(modalShadow, 'show')) {
        hideModal();
      }
    });

    for (var i = 0; i < modalButtonsLen; i++) {
      addModalListener(modalButtons[i]);
    }
  }
};
