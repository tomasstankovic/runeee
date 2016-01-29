/**
 * Statics inputs handlers.
 */

var classie = require('../lib/classie.js');

exports.init = function() {
  (function() {
    if (!String.prototype.trim) {
      (function() {
        var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
        String.prototype.trim = function() {
          return this.replace(rtrim, '');
        };
      })();
    }

    [].slice.call(document.querySelectorAll('.input__field')).forEach(function(inputEl) {
      if (inputEl.value.trim() !== '') {
        classie.add(inputEl.parentNode, 'input--filled');
      }

      // events:
      inputEl.addEventListener('focus', onInputFocus);
      inputEl.addEventListener('blur', onInputBlur);
    });

    function onInputFocus(ev) {
      classie.add(ev.target.parentNode, 'input--filled');
    }

    function onInputBlur(ev) {
      console.log(ev.target.value);

      if (ev.target.value.trim() === '') {
        classie.remove(ev.target.parentNode, 'input--filled');
      }
    }
  })();

  /**
   * Change label of custom select menu.
   */
  var changeSelectLabel = function(select) {
    select.parentNode.querySelector('.select-menu__top-label').innerHTML = select.options[select.selectedIndex].text;
  };

  /**
   * Add change listener to custom select menu.
   */
  var addSelectListener = function(select) {
    select.addEventListener('change', function() {
      changeSelectLabel(select);
    });
  };

  var selectMenus = document.querySelectorAll('.select-menu select');

  [].slice.call(selectMenus).forEach(function(select) {
    changeSelectLabel(select);
    addSelectListener(select);
  });

};
