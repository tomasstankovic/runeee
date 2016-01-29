/**
 * Training router.
 */
var express = require('express'),
  router = express.Router(),
  helpers = require('./../lib/helpers'),
  userModel = require(process.cwd() + '/server/models/userModel'),
  sportModel = require(process.cwd() + '/server/models/sportModel'),
  connectModel = require(process.cwd() + '/server/models/connectModel'),
  commentModel = require(process.cwd() + '/server/models/commentModel'),
  trainingModel = require(process.cwd() + '/server/models/trainingModel');

/**
 * GET: /activity redirect to homepage.
 */
router.get('/', function(req, res) {
  res.redirect('/');
});

/**
 * GET: Add new training.
 */
router.get('/add', helpers.isLoggedIn, function(req, res, next) {

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (req.query.coachFor) {
      var userQuery = userModel.where({
        _id: req.query.coachFor
      });

      userQuery.findOne(function(err, data) {
        if (err) {
          console.log(err);
          return next(err);
        }

        res.render('training/add', {
          title: res.__('Add new training'),
          sports: sports,
          user: data,
          isOwnProfile: false
        });

      });
    } else {
      res.render('training/add', {
        title: res.__('Add new training'),
        sports: sports,
        user: req.user,
        isOwnProfile: true
      });
    }
  });
});

/**
 * GET: Add new training.
 */
router.post('/add', helpers.isLoggedIn, function(req, res, next) {
  var formData = req.body.static,
    newActivity = new trainingModel(),
    userID = req.user._id;

  if (req.query.userID) {
    userID = req.query.userID;
  }

  newActivity.userID = userID;
  newActivity.title = formData.title;
  newActivity.description = formData.description;
  newActivity.sport = formData.sport;
  newActivity.hrZone = formData.hrZone;
  newActivity.duration.hours = formData.duration.hours;
  newActivity.duration.minutes = formData.duration.minutes;
  newActivity.duration.seconds = formData.duration.seconds;
  newActivity.distance = formData.distance;
  newActivity.isPublic = formData.isPublic || false;
  newActivity.isCompetition = formData.isCompetition || false;

  if (formData.date === '') {
    newActivity.date = new Date();
  } else {
    var date = formData.date.split('.');
    newActivity.date = new Date(date[2], (date[1] - 1), date[0]);
  }

  newActivity.save(function(err, training) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.redirect('/training/' + training._id);
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

  if (req.query.type !== 'old') {
    var date = new Date();
    searchScope.date = {
      $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate())
    };
  } else {
    urlPostfix = 'old';
  }

  trainingModel.find(searchScope, null, {
    sort: {
      date: 1
    },
    limit: req.query.limit || 20
  }, function(err, trainings) {
    if (err) {
      console.log(err);
      return next(err);
    }

    sportModel.find({}, function(err, sports) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.render('training/list', {
        trainings: trainings,
        title: res.__('Trainings'),
        sports: sports,
        url: '/training/list',
        urlPostfix: urlPostfix
      });
    });
  });
});

/**
 * GET: Training detail.
 */
router.get('/:id', function(req, res, next) {
  var trainingQuery = trainingModel.where({
    _id: req.params.id
  });

  trainingQuery.findOne(function(err, data) {
    if (err || data === null) {
      if (err === null) {
        err = {};
        err.message = 'Training not found!';
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
      var userID = false;

      if (req.user) {
        userID = req.user._id.toString();
      }

      var isUserCoach = false;

      var connectSearchQuery = [];
      if (req.user) {
        userID = req.user._id.toString();

        if (userID === userData._id.toString()) {
          connectSearchQuery = [{
            userB: userData._id.toString()
          }, {
            userA: userData._id.toString()
          }];
        } else {
          connectSearchQuery = [{
            userA: userID,
            userB: userData._id.toString()
          }, {
            userA: userData._id.toString(),
            userB: userID
          }];
        }
      } else {
        connectSearchQuery = [{
          userB: userData._id.toString()
        }, {
          userA: userData._id.toString()
        }];
      }

      connectModel.find().or(connectSearchQuery).exec(function(err, connectedPeoplesObj) {
        if (err) {
          console.log(err);
          isUserCoach = false;
        }

        if (req.user) {
          for (var i = 0; i < connectedPeoplesObj.length; i++) {
            var actualConnect = connectedPeoplesObj[i];

            if (actualConnect.userA.toString() === userID &&
              actualConnect.userB.toString() === userData._id.toString()) {
              isUserCoach = true;
            } else if (actualConnect.userB.toString() === userID &&
              actualConnect.userA.toString() === userData._id.toString()) {
              isUserCoach = true;
            }
          }
        } else {
          isUserCoach = false;
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
            training: req.params.id
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

              res.render('training/detail', {
                training: data,
                date: date,
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
                title: res.__('Training detail'),
                comments: comments,
                numOfIcons: numOfIcons,
                isUserCoach: isUserCoach
              });
            });
          });
        });
      });
    });
  });
});

/**
 * GET: Training edit.
 */
router.get('/:id/edit', helpers.isLoggedIn, function(req, res, next) {
  var userID = req.user._id.toString();

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return next(err);
    }

    var query = trainingModel.where({
      _id: req.params.id
    });

    query.findOne(function(err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      var activityUserId = data.userID.toString();

      var userQuery = userModel.where({
        _id: data.userID
      });

      userQuery.findOne(function(err, userData) {
        if (err) {
          console.log(err);
          return next(err);
        }
        var date = data.date;

        var isUserCoach = false,
          connectedPeoples = 0,
          connectSearchQuery = [];

        if (req.user) {
          userID = req.user._id.toString();

          if (userID === userData._id.toString()) {
            connectSearchQuery = [{
              userB: userData._id.toString()
            }, {
              userA: userData._id.toString()
            }];
          } else {
            connectSearchQuery = [{
              userA: userID,
              userB: userData._id.toString()
            }, {
              userA: userData._id.toString(),
              userB: userID
            }];
          }
        } else {
          connectSearchQuery = [{
            userB: userData._id.toString()
          }, {
            userA: userData._id.toString()
          }];
        }

        connectModel.find().or(connectSearchQuery).exec(function(err, connectedPeoplesObj) {
          if (err) {
            console.log(err);
            isUserCoach = false;
          }

          if (req.user) {
            for (var i = 0; i < connectedPeoplesObj.length; i++) {
              var actualConnect = connectedPeoplesObj[i];

              if (actualConnect.userA.toString() === userID &&
                actualConnect.userB.toString() === userData._id.toString()) {
                isUserCoach = true;
              } else if (actualConnect.userB.toString() === userID &&
                actualConnect.userA.toString() === userData._id.toString()) {
                isUserCoach = true;
              }
            }
          } else {
            isUserCoach = false;
          }
          var isOwnActivity = (userData._id.toString() === userID) ? true : false;

          if (isUserCoach || isOwnActivity) {
            res.render('training/edit', {
              training: data,
              date: date.getDate() + '.' + (date.getMonth() + 1) + '.' + date.getFullYear(),
              sports: sports,
              title: res.__('Edit training'),
              user: {
                _id: userData._id,
                nick: userData.nick,
                avatar_url: userData.avatar_url,
                name: userData.name,
                surname: userData.surname
              }
            });
          } else {
            res.redirect('/training/' + req.params.id);
          }
        });
      });
    });
  });
});

/**
 * POST: Training edit.
 */
router.post('/:id/edit', helpers.isLoggedIn, function(req, res) {
  var formData = req.body.static,
    date = formData.date.split('.'),
    newDate;

  if (formData.date === '') {
    newDate = new Date();
  } else {
    newDate = new Date(date[2], (date[1] - 1), date[0]);
  }

  trainingModel.findOneAndUpdate({
    _id: req.params.id
  }, {
    title: formData.title,
    description: formData.description,
    sport: formData.sport,
    date: newDate,
    hrZone: formData.hrZone,
    duration: {
      hours: formData.duration.hours,
      minutes: formData.duration.minutes,
      seconds: formData.duration.seconds
    },
    distance: formData.distance,
    isPublic: formData.isPublic || false,
    isCompetition: formData.isCompetition || false

  }, function(err) {
    if (err) {
      console.log(err);
      return res.redirect('/training/' + req.params.id + '?update=ko');
    }

    res.redirect('/training/' + req.params.id + '?update=ok');
  });
});

/**
 * GET: Training delete.
 */
router.get('/:id/delete', helpers.isLoggedIn, function(req, res, next) {

  var userId = req.user._id.toString(),
    userUrl = req.user.url,
    trainingQuery = trainingModel.where({
      _id: req.params.id
    });

  trainingQuery.findOneAndRemove(function(err, data) {
    if (err || data === null) {
      if (err === null) {
        err = {};
        err.message = 'Training not found!';
      }
      err.status = 404;
      return next(err);
    }

    var activityUserId = data.userID.toString();

    if (userId !== activityUserId) {
      return res.redirect('/training/' + req.params.id);
    }

    commentModel.remove({
      training: req.params.id
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
