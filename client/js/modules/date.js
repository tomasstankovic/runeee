/**
 * Convert activity dates.
 */

var moment = require('../bower_components/moment/moment');

exports.init = function() {
  moment.locale(ACTUAL_LOCALE);

  var datesEl = document.querySelectorAll('.activity-date'),
    datesElLen = datesEl.length;

  for (var i = 0; i < datesElLen; i++) {
    var actualDateEl = datesEl[i],
      actualDate = new Date(actualDateEl.innerText);

    actualDateEl.innerText = moment(actualDate).fromNow();
  }
};
