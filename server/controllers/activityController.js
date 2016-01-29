/**
 * Profile router.
 */
var express = require('express'),
  router = express.Router(),
  helpers = require('./../lib/helpers'),
  userModel = require(process.cwd() + '/server/models/userModel'),
  sportModel = require(process.cwd() + '/server/models/sportModel'),
  commentModel = require(process.cwd() + '/server/models/commentModel'),
  activityModel = require(process.cwd() + '/server/models/activityModel');

/**
 * GET: /activity redirect to homepage.
 */
router.get('/', function(req, res) {
  res.redirect('/');
});

/**
 * GET: Add new activity.
 */
router.get('/add', helpers.isLoggedIn, function(req, res, next) {

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.render('activity/add', {
      title: res.__('Add new activity'),
      sports: sports
    });
  });

});

/**
 * Post: Add new activity.
 */
router.post('/add', helpers.isLoggedIn, function(req, res, next) {
  var formData = req.body.static,
    newActivity = new activityModel();

  var activitySport = '',
    activityDuration = (Number(formData.duration.hours) * 60) + Number(formData.duration.minutes);

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }
    for (var i = 0; i < sports.length; i++) {
      if (formData.sport.toString() === sports[i]._id.toString()) {
        activitySport = sports[i].value;
      }
    }

    newActivity.userID = req.user._id;
    newActivity.title = formData.title;
    newActivity.description = formData.description;
    newActivity.sport = formData.sport;
    newActivity.duration.hours = formData.duration.hours;
    newActivity.duration.minutes = formData.duration.minutes;
    newActivity.duration.seconds = formData.duration.seconds;
    newActivity.hr.max = formData.hr.max;
    newActivity.hr.avg = formData.hr.avg;
    newActivity.speed.max = formData.speed.max;
    newActivity.speed.avg = formData.speed.avg;
    newActivity.distance = formData.distance;
    newActivity.calories = helpers.calculateCalories(activitySport, activityDuration, formData.speed.avg, req.user.weight);
    newActivity.isPublic = formData.isPublic || false;
    newActivity.isCompetition = formData.isCompetition || false;

    if (formData.date === '') {
      newActivity.date = new Date();
    } else {
      var date = formData.date.split('.');
      newActivity.date = new Date(date[2], (date[1] - 1), date[0], (formData.time.hours - 1), formData.time.minutes);
    }

    newActivity.save(function(err, activity) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.redirect('/activity/' + activity._id);
    });
  });
});

/**
 * GET: Activity list.
 */
router.get('/list', function(req, res, next) {
  var searchScope = {
      isPublic: true
    },
    urlPostfix = '';

  if (req.query.type === 'trainings') {
    searchScope.isCompetition = false;
    urlPostfix = 'trainings';
  } else if (req.query.type === 'competitions') {
    searchScope.isCompetition = true;
    urlPostfix = 'competitions';
  }

  activityModel.find(searchScope, null, {
    sort: {
      date: -1
    },
    limit: req.query.limit || 20
  }, function(err, activities) {
    if (err) {
      console.log(err);
      return next(err);
    }

    sportModel.find({}, function(err, sports) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.render('activity/list', {
        activities: activities,
        title: res.__('Activities'),
        sports: sports,
        url: '/activity/list',
        urlPostfix: urlPostfix
      });
    });
  });
});

/**
 * GET: Activity detail.
 */
router.get('/:id', function(req, res, next) {
  var activityQuery = activityModel.where({
    _id: req.params.id
  });

  activityQuery.findOne(function(err, data) {
    if (err || data === null) {
      if (err === null) {
        err = {};
        err.message = 'Activity not found!';
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

        commentModel.find({
          activity: req.params.id
        }, null, {
          sort: {
            date: -1
          }
        }, function(err, comments) {
          if (err) {
            console.log(err);
            return next(err);
          }

          var tmpUsers = [];
          comments.forEach(function(comment) {
            tmpUsers.push(comment.user);
          });

          userModel.find({
            '_id': {
              $in: tmpUsers
            }
          }, function(err, usersComments) {
            if (err) {
              console.log(err);
              return next(err);
            }

            comments = helpers.joinCommentsAndUsers(comments, usersComments);

            var numOfIcons = 1;
            if (data.isPublic) {
              numOfIcons++;
            }
            if (data.isCompetition) {
              numOfIcons++;
            }

            res.render('activity/detail', {
              activity: data,
              date: date,
              time: time,
              user: {
                nick: userData.nick,
                avatar_url: userData.avatar_url,
                name: userData.name,
                surname: userData.surname
              },
              sport: sportType,
              isOwnActivity: (data.userID.toString() === userID) ? true : false,
              isLogged: (userID) ? true : false,
              ownNick: (userID) ? req.user.nick : false,
              update: req.query.update || null,
              title: res.__('Activity detail'),
              comments: comments,
              numOfIcons: numOfIcons
            });
          });

        });

      });

    });
  });
});

/**
 * GET: Activity edit.
 */
router.get('/:id/edit', helpers.isLoggedIn, function(req, res, next) {
  var userId = req.user._id.toString();

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }

    var query = activityModel.where({
      _id: req.params.id
    });

    query.findOne(function(err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      var activityUserId = data.userID.toString();

      if (userId !== activityUserId) {
        return res.redirect('/activity/' + req.params.id);
      }

      var date = data.date;
      res.render('activity/edit', {
        activity: data,
        date: date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(),
        time: {
          hours: (data.date.getHours() + 1),
          minutes: data.date.getMinutes()
        },
        sports: sports,
        title: res.__('Edit activity')
      });

    });
  });
});

/**
 * POST: Activity edit.
 */
router.post('/:id/edit', helpers.isLoggedIn, function(req, res, next) {
  var formData = req.body.static,
    date = formData.date.split('.'),
    newDate;

  if (formData.date === '') {
    newDate = new Date();
  } else {
    newDate = new Date(date[2], (date[1] - 1), date[0], (formData.time.hours - 1), formData.time.minutes);
  }

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }

    userModel.findOne({
      _id: req.user._id
    }, function(err, user) {
      if (err) {
        console.log(err);
        return next(err);
      }

      var activitySport = '',
        activityDuration = (Number(formData.duration.hours) * 60) + Number(formData.duration.minutes);

      for (var i = 0; i < sports.length; i++) {
        if (formData.sport.toString() === sports[i]._id.toString()) {
          activitySport = sports[i].value;
        }
      }

      activityModel.findOneAndUpdate({
        _id: req.params.id
      }, {
        title: formData.title,
        description: formData.description,
        sport: formData.sport,
        date: newDate,
        duration: {
          hours: formData.duration.hours,
          minutes: formData.duration.minutes,
          seconds: formData.duration.seconds
        },
        hr: {
          max: formData.hr.max,
          avg: formData.hr.avg
        },
        speed: {
          max: formData.speed.max,
          avg: formData.speed.avg
        },
        distance: formData.distance,
        calories: helpers.calculateCalories(activitySport, activityDuration, formData.speed.avg, user.weight),
        isPublic: formData.isPublic || false,
        isCompetition: formData.isCompetition || false

      }, function(err) {
        if (err) {
          console.log(err);
          return res.redirect('/activity/' + req.params.id + '?update=ko');
        }

        res.redirect('/activity/' + req.params.id + '?update=ok');
      });
    });
  });
});

/**
 * GET: Activity delete.
 */
router.get('/:id/delete', helpers.isLoggedIn, function(req, res, next) {
  var userId = req.user._id.toString(),
    userUrl = req.user.url,
    activityQuery = activityModel.where({
      _id: req.params.id
    });

  activityQuery.findOneAndRemove(function(err, data) {
    if (err || data === null) {
      if (err === null) {
        err = {};
        err.message = 'Activity not found!';
      }
      err.status = 404;
      return next(err);
    }

    var activityUserId = data.userID.toString();

    if (userId !== activityUserId) {
      return res.redirect('/activity/' + req.params.id);
    }

    commentModel.remove({
      activity: req.params.id
    }, function(err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }
    });

    return res.redirect('/profile/' + userUrl + '?update=eraseOK');
  });
});

module.exports = router;
