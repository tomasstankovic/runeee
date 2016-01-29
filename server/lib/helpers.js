/**
 * Helpers file.
 */
var basicAuth = require('basic-auth'),
  bcrypt = require('bcrypt-nodejs'),
  configAuth = require('./auth_keys'),
  removeDiacritics = require('./removeDiacritics'),
  math = require('./math'),
  helpers = {};

/**
 * Redirect to /login if user is not-logged.
 * @param {Object}   req
 * @param {Object}   res
 * @param {Object}   next
 */
helpers.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

/**
 * Redirect to /profile if user is logged.
 * @param {Object}   req
 * @param {Object}   res
 * @param {Object}   next
 */
helpers.notForLoggedUsers = function(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/profile');
  }
  return next();
};

/**
 * isProfileCompleted.
 * @param {Object} data
 */
helpers.isProfileCompleted = function(data) {
  var isCompleted = true;

  if (data.nick === '' ||
    data.name === '' ||
    data.surname === '' ||
    data.age === '' ||
    data.weight === '' ||
    data.height === '' ||
    data.vo2max === '' ||
    data.hr.max === '' ||
    data.hr.avg === '' ||
    data.hr.ap === '') {
    isCompleted = false;
  }

  return isCompleted;
};

/**
 * getSocialKeys
 * @param  {String} env
 * @return {Object}
 */
helpers.getSocialKeys = function(env) {
  var currKeys = configAuth.login.dev;

  if (env === 'PRODUCTION') {
    currKeys = configAuth.login.production;
  } else if (env === 'TEST') {
    currKeys = configAuth.login.test;
  }

  return currKeys;
};

/**
 * Unauthorizes 401 error.
 * @param {Object} res [description]
 */
helpers.unauthorizedStatus = function(res) {
  res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
  return res.sendStatus(401);
};

/**
 * Basic Auth middleware.
 * @param {Object}   req
 * @param {Object}   res
 * @param {Object}    next
 */
helpers.basicAuth = function(req, res, next) {
  var user = basicAuth(req);

  if (!user || !user.name || !user.pass) {
    return helpers.unauthorizedStatus(res);
  }

  if (user.name === 'admin' && user.pass === 'tomasko4') {
    return next();
  } else {
    return helpers.unauthorizedStatus(res);
  }
};

/**
 * return joined object with activity comments and user name.
 * @param {Object} comments
 * @param {Object} users
 */
helpers.joinCommentsAndUsers = function(comments, users) {
  var newComments = [],
    usersLen = users.length;

  for (var i = 0; i < comments.length; i++) {
    var comment = comments[i],
      userData;

    for (var j = 0; j < usersLen; j++) {
      if (users[j]._id.toString() === comments[i].user.toString()) {
        userData = users[j];
      }
    }

    var newComment = {
      _id: comment._id,
      text: comment.text,
      user: comment.user,
      activity: comment.activity,
      date: comment.date,
      nick: userData.nick,
      avatar_url: userData.avatar_url,
      name: userData.name,
      surname: userData.surname
    };

    newComments.push(newComment);
  }

  return newComments;
};

/**
 * Make and return url from user nick.
 * Return {String}
 */
helpers.makeUserUrl = function(nick) {
  return removeDiacritics(nick).replace(/ /g, '');
};

/**
 * Generate random password.
 * @return {String}
 */
helpers.generatePassword = function() {
  var length = 10,
    charset = 'abcdefghijklnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    pass = '';

  for (var i = 0, n = charset.length; i < length; ++i) {
    pass += charset.charAt(Math.floor(Math.random() * n));
  }

  return pass;
};

/**
 * Generate password hash.
 */
helpers.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

/**
 * Valid password hash.
 */
helpers.validPassword = function(password, localPassword) {
  return bcrypt.compareSync(password, localPassword);
};

/**
 * Generate nickname from user email.
 */
helpers.generateNickname = function(email) {
  return email.split('@')[0];
};

/**
 * Calculate HR zone for complete stats.
 */
var getNormalizedZone = function(zone, max) {
  var normalizedZone = {};

  if (zone.beats !== '' && zone.percentage !== '') {

    if (zone.beats === math.simpleProportion(max, zone.percentage, 100)) {
      normalizedZone = zone;
    } else {
      normalizedZone.beats = zone.beats;
      normalizedZone.percentage = math.simpleProportion(100, zone.beats, max);
    }

  } else if (zone.beats !== '' && zone.percentage === '') {

    normalizedZone.beats = zone.beats;
    normalizedZone.percentage = math.simpleProportion(100, zone.beats, max);

  } else if (zone.beats === '' && zone.percentage !== '') {

    normalizedZone.beats = math.simpleProportion(max, zone.percentage, 100);
    normalizedZone.percentage = zone.percentage;

  }
  return normalizedZone;
};

/**
 * Get complete zones in beats & percentage.
 */
helpers.getCompleteZones = function(zones, max) {
  var completeZones = {};

  completeZones.zone5 = getNormalizedZone(zones.zone5, max);
  completeZones.zone4 = getNormalizedZone(zones.zone4, max);
  completeZones.zone3 = getNormalizedZone(zones.zone3, max);
  completeZones.zone2 = getNormalizedZone(zones.zone2, max);
  completeZones.zone1 = getNormalizedZone(zones.zone1, max);

  return completeZones;
};

/**
 * Return true if user has HR zones.
 */
helpers.isCompleteZones = function(zones, max) {
  var completeZones = {};

  completeZones.zone5 = getNormalizedZone(zones.zone5, max);
  completeZones.zone4 = getNormalizedZone(zones.zone4, max);
  completeZones.zone3 = getNormalizedZone(zones.zone3, max);
  completeZones.zone2 = getNormalizedZone(zones.zone2, max);
  completeZones.zone1 = getNormalizedZone(zones.zone1, max);

  if (max === undefined) {
    return false;
  } else if (completeZones.zone5.beats === undefined) {
    return false;
  } else if (completeZones.zone4.beats === undefined) {
    return false;
  } else if (completeZones.zone3.beats === undefined) {
    return false;
  } else if (completeZones.zone2.beats === undefined) {
    return false;
  } else if (completeZones.zone1.beats === undefined) {
    return false;
  }

  return true;
};

/**
 * Return normalized user sports.
 */
helpers.getUserSports = function(sports, userSports) {
  var normalizedSports = [],
    sportsLen = sports.length,
    userSportsLen = userSports.length;

  for (var i = 0; i < sportsLen; i++) {
    for (var j = 0; j < userSportsLen; j++) {
      if (sports[i]._id.toString() === userSports[j].toString()) {
        normalizedSports.push(sports[i]);
      }
    }
  }

  return normalizedSports;
};

helpers.shuffleArray = function(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};

helpers.getConnectedIds = function(relations, userId) {
  var connectedIds = [],
    relationsLen = relations.length;

  for (var i = 0; i < relationsLen; i++) {
    var currRelation = relations[i];

    if (currRelation.userA.toString() === userId) {
      connectedIds.push(currRelation.userB);
    } else if (currRelation.userB.toString() === userId) {
      connectedIds.push(currRelation.userA);
    }
  }

  return connectedIds;
};

/**
 * Return burned calories for activity.
 */
helpers.calculateCalories = function(sport, duration, speed, weight) {
  var tableCals = 0,
    speedCalc = 0;

  if (sport === 'running') {
    var BASE_RUNNING_CALORIES = 0.699,
      RUNNING_CALORIES_MULTIPLIER = 0.067;

    speedCalc = speed - 10;
    tableCals = BASE_RUNNING_CALORIES + (speedCalc * RUNNING_CALORIES_MULTIPLIER);
  } else if (sport === 'cycling') {
    var BASE_CYCLING_CALORIES = 0.559;

    if (speed > 27) {
      BASE_CYCLING_CALORIES = 1.117;
    } else if (speed < 13) {
      BASE_CYCLING_CALORIES = 0.28;
    }

    tableCals = BASE_CYCLING_CALORIES;
  } else if (sport === 'swimming') {
    tableCals = 0.559;
  } else {
    tableCals = 0.419;
  }

  return Math.round(tableCals * duration * weight);
};

module.exports = helpers;
