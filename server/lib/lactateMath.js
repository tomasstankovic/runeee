/**
 * Lactate math helpers.
 */

var lactateMath = {};

/**
 * TODO
 */
lactateMath.calculate = function(data) {};

/**
 * Calculate and return Aerobic values from Anaerobic valuse.
 * @param  {Number} HR_ANP    [description]
 * @param  {Number} SPEED_ANP [description]
 * @return {Object}           [description]
 */
lactateMath.calcAp = function(HR_ANP, SPEED_ANP) {
  var hr, speed, pace;

  hr = Math.round((HR_ANP / 100) * 88);
  speed = (SPEED_ANP / 100) * 83.5;
  pace = (1 / ((speed * 60) / 1000)) / 24;

  return {
    hr: hr,
    speed: speed.toFixed(2),
    pace: pace
  };
};

lactateMath.calcZone = function(hrPercentage, multiple) {
  var hr = Math.round(hrPercentage * multiple);

  return hr;
};

lactateMath.calcHrZones = function(HR_ANP, HR_MAX) {
  var zones = {};
  var hrPercentage = HR_ANP / 100;

  zones.zone1 = {};
  zones.zone2 = {};
  zones.zone3 = {};
  zones.zone4 = {};
  zones.zone5 = {};

  zones.zone1.beats = lactateMath.calcZone(hrPercentage, 76);
  zones.zone2.beats = lactateMath.calcZone(hrPercentage, 83);
  zones.zone3.beats = lactateMath.calcZone(hrPercentage, 85);
  zones.zone4.beats = HR_ANP + 1;
  zones.zone5.beats = lactateMath.calcZone(hrPercentage, 102);

  return zones;
};

module.exports = lactateMath;
