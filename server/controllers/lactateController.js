/**
 * Profile router.
 */
var express = require('express'),
  router = express.Router(),
  helpers = require('./../lib/helpers'),
  lactateMath = require('./../lib/lactateMath'),
  userModel = require(process.cwd() + '/server/models/userModel'),
  sportModel = require(process.cwd() + '/server/models/sportModel'),
  lactateModel = require(process.cwd() + '/server/models/lactateModel');

/**
 * GET: /lactate-test redirect to homepage.
 */
router.get('/', function(req, res) {
  res.redirect('/');
});

/**
 * GET: Add new lactate test.
 */
router.get('/add', helpers.isLoggedIn, function(req, res, next) {
  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.render('lactate/add', {
      title: res.__('Add new lactate test'),
      sports: sports
    });
  });
});

/**
 * Post: Add new lactate test.
 */
router.post('/add', helpers.isLoggedIn, function(req, res, next) {
  var formData = req.body.static,
    newLactate = new lactateModel(),
    userID = req.user._id;

  if (req.query.userID) {
    userID = req.query.userID;
  }

  newLactate.userID = userID;
  newLactate.intervalDistance = formData.intervalDistance;
  newLactate.temperature = formData.temperature;
  newLactate.place = formData.place;
  newLactate.sport = formData.sport;

  if (formData.date === '') {
    newLactate.date = new Date();
  } else {
    var date = formData.date.split('.');
    newLactate.date = new Date(date[2], (date[1] - 1), date[0], (formData.time.hours - 1), formData.time.minutes);
  }

  newLactate.test = [{
    index: 1,
    lactate: formData['int-1']['lactate'],
    hrMax: formData['int-1']['hr-max'],
    time: formData['int-1']['time']
  }, {
    index: 2,
    lactate: formData['int-2']['lactate'],
    hrMax: formData['int-2']['hr-max'],
    time: formData['int-2']['time']
  }, {
    index: 3,
    lactate: formData['int-3']['lactate'],
    hrMax: formData['int-3']['hr-max'],
    time: formData['int-3']['time']
  }, {
    index: 4,
    lactate: formData['int-4']['lactate'],
    hrMax: formData['int-4']['hr-max'],
    time: formData['int-4']['time']
  }];


  /*
   *  TODO: SEM VYPOCET ANP;
   *    - Dalej predpokladame ze mame hodnoty vypocitane.
   */

  var HR_ANP = 174,
    SPEED_ANP = 4.32,
    PACE_ANP = 3.51,
    HR_TEST_MAX = Math.max(formData['int-1']['hr-max'], formData['int-2']['hr-max'], formData['int-3']['hr-max'], formData['int-4']['hr-max']);

  var AP_OBJ = lactateMath.calcAp(HR_ANP, SPEED_ANP);

  userModel.findOne({
    _id: userID
  }, function(err, user) {
    if (err) {
      console.log(err);
      return next(err);
    }

    var HR_MAX = user['hr']['max'];
    var ZONES_OBJ = lactateMath.calcHrZones(HR_ANP, HR_MAX);

    var HR_TRUE_MAX = (HR_TEST_MAX > HR_MAX) ? HR_TEST_MAX : HR_MAX;

    userModel.findOneAndUpdate({
      _id: req.user._id
    }, {
      hr: {
        max: HR_TRUE_MAX,
        anp: HR_ANP,
        ap: AP_OBJ.hr,
        zones: helpers.getCompleteZones(ZONES_OBJ, HR_TRUE_MAX)
      }
    }, function(err, userUpdated) {
      if (err) {
        console.log(err);
        return next(err);
      }

      newLactate.save(function(err, lactateTest) {
        if (err) {
          console.log(err);
          return next(err);
        }

        res.redirect('/lactate-test/' + lactateTest._id);
      });
    });
  });
});

/**
 * GET: Lactate test detail.
 */
router.get('/:id', function(req, res, next) {
  var lactateQuery = lactateModel.where({
    _id: req.params.id
  });

  lactateQuery.findOne(function(err, data) {
    if (err || data === null) {
      if (err === null) {
        err = {};
        err.message = 'Lactate test not found!';
      }
      err.status = 404;
      return next(err);
    }

    var userQuery = userModel.where({
      _id: data.userID
    });

    userQuery.findOne(function(err, userData) {
      if (err) {
        console.log(err);
        return next(err);
      }

      var date = data.date.getDate() + '.' + (data.date.getMonth() + 1) + '.' + data.date.getFullYear();
      var time = (
        data.date.getHours() + 1) + ':' + data.date.getMinutes();
      var userID = false;

      if (req.user) {
        userID = req.user._id.toString();
      }

      var sportQuery = sportModel.where({
        _id: data.sport
      });
      sportQuery.findOne(function(err, sportType) {
        if (err) {
          console.log(err);
          return next(err);
        }

        res.render('lactate/detail', {
          lactate: data,
          date: date,
          time: time,
          user: userData,
          sport: sportType,
          isOwnActivity: (data.userID.toString() === userID) ? true : false,
          isLogged: (userID) ? true : false,
          ownNick: (userID) ? req.user.nick : false,
          update: req.query.update || null,
          title: res.__('Lactate test detail')
        });
      });
    });
  });
});


/**
 * GET: Lactate test delete.
 */
router.get('/:id/delete', helpers.isLoggedIn, function(req, res, next) {
  var userId = req.user._id.toString(),
    userUrl = req.user.url,
    lactateQuery = lactateModel.where({
      _id: req.params.id
    });

  lactateQuery.findOneAndRemove(function(err, data) {
    if (err || data === null) {
      if (err === null) {
        err = {};
        err.message = 'Lactate test not found!';
      }
      err.status = 404;
      return next(err);
    }

    var lactateUserId = data.userID.toString();

    if (userId !== lactateUserId) {
      return res.redirect('/lactate-test/' + req.params.id);
    }

    return res.redirect('/profile/' + userUrl + '?update=eraseTestOK');
  });
});

module.exports = router;
