/**
 * Profile router.
 */
var express = require('express'),
  router = express.Router(),
  nodemailer = require('nodemailer'),
  helpers = require('./../lib/helpers'),
  userModel = require(process.cwd() + '/server/models/userModel'),
  sportModel = require(process.cwd() + '/server/models/sportModel'),
  connectModel = require(process.cwd() + '/server/models/connectModel'),
  lactateModel = require(process.cwd() + '/server/models/lactateModel'),
  trainingModel = require(process.cwd() + '/server/models/trainingModel'),
  activityModel = require(process.cwd() + '/server/models/activityModel');

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'EMAIL_ADDRESS',
    pass: process.env.MAIL_PASSWWORD
  }
});

/**
 * GET: User profile
 */
router.get('/', helpers.isLoggedIn, function(req, res) {
  res.redirect('/profile/' + req.user.url);
});

/**
 * GET: One step more
 */
router.get('/one-more-step', helpers.isLoggedIn, function(req, res) {
  res.render('profile/one-more-step', {
    user: req.user,
    title: res.__('One more step'),
    alert: req.query.alert
  });
});

/**
 * POST: One step more
 */
router.post('/one-more-step', helpers.isLoggedIn, function(req, res) {
  var formData = req.body.static,
    isCompleted = helpers.isProfileCompleted(formData);

  userModel.findOneAndUpdate({
    _id: req.user._id
  }, {
    nick: formData.nick,
    url: helpers.makeUserUrl(formData.nick),
    name: formData.name,
    surname: formData.surname,
    age: formData.age,
    gender: formData.gender,

    isCoach: formData.isCoach,
    weight: formData.weight,
    height: formData.height,
    vo2max: formData.vo2max,

    hr: {
      max: formData.hr.max,
      anp: formData.hr.anp,
      ap: formData.hr.ap
    },

    isCompleted: isCompleted

  }, function(err) {
    if (err) {
      return res.redirect('/profile/' + req.user.url + '?update=ko');
    }

    if (!isCompleted) {
      res.redirect('/profile/one-more-step?alert=true');
    } else {
      res.redirect('/profile/' + req.user.url + '?update=ok');
    }
  });
});

/**
 * GET: Edit user profile
 */
router.get('/edit', helpers.isLoggedIn, function(req, res) {

  sportModel.find({}, function(err, sports) {
    if (err) {
      console.log(err);
      return err;
    }

    res.render('profile/edit', {
      user: req.user,
      title: res.__('Profile edit'),
      sports: sports
    });

  });
});


/**
 * POST: Edit user profile
 */
router.post('/edit', helpers.isLoggedIn, function(req, res, next) {
  var formData = req.body.static,
    isCompleted = helpers.isProfileCompleted(formData);

  userModel.findOne({
    _id: req.user._id
  }, function(err, user) {
    if (err) {
      console.log(err);
      return res.redirect('/profile/' + req.user.url + '?update=ko');
    }

    user.nick = formData.nick;
    user.url = helpers.makeUserUrl(formData.nick);
    user.name = formData.name;
    user.surname = formData.surname;
    user.age = formData.age;
    user.description = formData.description;
    user.gender = formData.gender;
    user.sports = [];

    for (var sport in formData.sports) {
      user.sports.push(sport);
    }

    user.isCoach = formData.isCoach;
    user.weight = formData.weight;
    user.height = formData.height;
    user.vo2max = formData.vo2max;
    user.hr = {
      max: formData.hr.max,
      anp: formData.hr.anp,
      ap: formData.hr.ap,
      zones: helpers.getCompleteZones(formData.hr.zones, formData.hr.max)
    };
    user.isCompleted = isCompleted;

    user.save(function(err) {
      if (err) {
        console.log(err);
        return res.redirect('/profile/' + req.user.url + '?update=ko');
      }

      if (!isCompleted) {
        res.redirect('/profile/one-more-step?alert=true');
      } else {
        res.redirect('/profile/' + req.user.url + '?update=ok');
      }
    });
  });
});

router.get('/edit/password', helpers.isLoggedIn, function(req, res) {
  if (typeof req.user.local.email === 'undefined') {
    return res.redirect('/profile/' + req.user.url);
  }

  res.render('profile/edit-password', {
    message: req.query.message || null
  });
});

router.post('/edit/password', function(req, res) {
  var password = req.body.password,
    user = req.user;

  if (!helpers.validPassword(password.current, user.local.password)) {
    res.redirect('/profile/edit/password?message=currKO');
  } else if (password.new !== password.newAgain) {
    res.redirect('/profile/edit/password?message=futureKO');
  }

  userModel.findOneAndUpdate({
    _id: req.user._id
  }, {
    local: {
      email: user.local.email,
      password: helpers.generateHash(password.new)
    }
  }, function(err) {
    if (err) {
      console.log(err);
      return res.redirect('/profile/' + req.user.url + '?update=ko');
    }

    res.redirect('/profile/' + req.user.url + '?update=ok');
  });

});

/**
 * GET: List of all users.
 */
router.get('/list', function(req, res) {
  var searchQuery = {
      isCompleted: true
    },
    url = '/profile/list',
    urlPostfix = '';

  if (req.query.type === 'coach') {
    searchQuery.isCoach = true;
    url = '/profile/list?type=coach';
    urlPostfix = 'coach';
  } else if (req.query.type === 'athlete') {
    searchQuery.isCoach = false;
    url = '/profile/list?type=athlete';
    urlPostfix = 'athlete';
  }

  userModel.find(searchQuery, null, {
    limit: req.query.limit || 20
  }, function(err, users) {
    res.render('profile/list', {
      users: users,
      title: res.__('Users'),
      url: url,
      urlPostfix: urlPostfix
    });
  });
});

/**
 * GET: Add trainer/user.
 */
router.get('/add-relation', helpers.isLoggedIn, function(req, res, next) {
  var userA = req.query.userA,
    userB = req.query.userB;

  connectModel.find().or([{
    userA: userA,
    userB: userB
  }, {
    userA: userB,
    userB: userA
  }]).exec(function(err, data) {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (data.length === 0) {
      var newConnection = new connectModel();
      newConnection.userA = userA;
      newConnection.userB = userB;
      newConnection.save(function(err, connection) {
        if (err) {
          console.log(err);
          return next(err);
        }

        res.redirect('/profile/' + req.user.url + '?update=connectOK');
      });
    } else {
      res.redirect('/profile/' + req.user.url + '?update=connectOld');
    }
  });
});

/**
 * Post: Add trainer/user.
 */
router.post('/add-relation', helpers.isLoggedIn, function(req, res, next) {
  var userId = req.user._id,
    friendNick = req.body.nick;

  userModel.find({
    nick: friendNick
  }, function(err, users) {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (users[0] === undefined) {
      return res.redirect('/profile/' + req.user.url + '?update=userNotFound');
    }

    var friendId = users[0]._id,
      friendMail = users[0].local.email || users[0].facebook.email;

    connectModel.find().or([{
      userA: userId,
      userB: friendId
    }, {
      userA: friendId,
      userB: userId
    }]).exec(function(err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      if (data.length === 0) {

        var msg = 'Hello, You have new friend request from user ' + req.user.nick +
          '. To accept please click on this link <a href="http://localhost:8080/profile/add-relation?userA=' +
          userId +
          '&userB=' + friendId + '">Accept friendship</a>',
          mailOptions = {
            from: 'Runeee.com <runeeemail@gmail.com>',
            to: friendMail,
            subject: 'Friend request',
            text: msg,
            html: '<strong>' + msg + '</strong>'
          };

        transporter.sendMail(mailOptions, function(err, info) {
          if (err) {
            console.log(err);
            return res.redirect('/profile/' + req.user.url + '?update=userNotFound');
          } else {
            console.log('Message sent: ' + info.response);
            return res.redirect('/profile/' + req.user.url + '?update=userAddOK');
          }
        });
      } else {
        res.redirect('/profile/' + req.user.url + '?update=connectOld');
      }

    });
  });
});

/**
 * GET: User profile public detail.
 */
router.get('/:url', function(req, res, next) {
  var query = userModel.where({
      url: req.params.url
    }),
    userID = false;

  query.findOne(function(err, user) {
    if (err) {
      console.log(err);
      return next(err);
    } else if (user === null) {
      err = {};
      err.status = 404;
      err.message = 'User not found.';
      return next(err);
    }

    activityModel.find({
      userID: user._id
    }, null, {
      sort: {
        date: -1
      },
      limit: 5
    }, function(err, activities) {
      if (err) {
        console.log(err);
        return next(err);
      }

      var isUserCoach = false,
        connectedPeoples = 0,
        activitiesLen = activities.length;

      activities.length = (activitiesLen > 4) ? 4 : activitiesLen;

      var connectSearchQuery = [];
      if (req.user) {
        userID = req.user._id.toString();

        if (userID === user._id.toString()) {
          connectSearchQuery = [{
            userB: user._id.toString()
          }, {
            userA: user._id.toString()
          }];
        } else {
          connectSearchQuery = [{
            userA: userID,
            userB: user._id.toString()
          }, {
            userA: user._id.toString(),
            userB: userID
          }];
        }
      } else {
        connectSearchQuery = [{
          userB: user._id.toString()
        }, {
          userA: user._id.toString()
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
              actualConnect.userB.toString() === user._id.toString()) {
              isUserCoach = true;
            } else if (actualConnect.userB.toString() === userID &&
              actualConnect.userA.toString() === user._id.toString()) {
              isUserCoach = true;
            }
          }
        } else {
          isUserCoach = false;
        }

        userModel.find({
          '_id': {
            $in: helpers.getConnectedIds(connectedPeoplesObj, user._id.toString())
          }
        }, function(err, connectedPeoples) {

          connectedPeoples = helpers.shuffleArray(connectedPeoples);

          var connectedPeoplesLen = connectedPeoples.length;
          if (connectedPeoplesLen > 3) {
            connectedPeoples.length = 3;
          }

          if (user._id.toString() === userID) {
            if (!user.isCompleted) {
              res.redirect('/profile/one-more-step');
              return;
            }
          }

          var date = new Date();

          trainingModel.find({
            userID: user._id,
            date: {
              $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate())
            }
          }, null, {
            sort: {
              date: 1
            },
            limit: 5
          }, function(err, trainings) {
            if (err) {
              console.log(err);
              return next(err);
            }

            var trainingsLen = trainings.length;
            trainings.length = (trainingsLen > 4) ? 4 : trainingsLen;

            sportModel.find({}, function(err, sports) {
              if (err) {
                console.log(err);
                return next(err);
              }

              lactateModel.find({
                userID: user._id,
              }, null, {
                sort: {
                  date: -1
                },
                limit: 2
              }, function(err, lactates) {
                if (err) {
                  console.log(err);
                  return next(err);
                }

                res.render('profile/index', {
                  user: user,
                  title: (user._id.toString() === userID) ? res.__('Your profile') : user.nick + ' ' +
                    res.__(
                      'profile'),
                  activities: activities,
                  activitiesLen: activitiesLen,
                  trainings: trainings,
                  trainingsLen: trainingsLen,
                  lactate: lactates[0] || null,
                  lactatesLen: lactates.length,
                  sports: sports,
                  userSports: helpers.getUserSports(sports, user.sports),
                  isOwnProfile: (user._id.toString() === userID) ? true : false,
                  isUserCoach: isUserCoach,
                  isCompleteZones: helpers.isCompleteZones(user.hr.zones, user.hr.max),
                  update: req.query.update || null,
                  connectedPeoplesLen: connectedPeoplesLen,
                  connectedPeoples: connectedPeoples,
                  urlPrefix: '/profile'
                });
              });
            });
          });
        });
      });
    });
  });
});

/**
 * GET: User activities.
 */
router.get('/:url/activities', function(req, res, next) {
  var url = req.params.url,
    isNotLogged = true,
    urlPostfix = '';

  userModel.find({
    url: url
  }, function(err, user) {
    if (err) {
      console.log(err);
      return next(err);
    }

    var activitySearchScope = {
      userID: user[0]._id
    };

    if (req.query.type === 'trainings') {
      activitySearchScope.isCompetition = false;
      urlPostfix = 'trainings';
    } else if (req.query.type === 'competitions') {
      activitySearchScope.isCompetition = true;
      urlPostfix = 'competitions';
    }

    if (req.user && user[0]._id.toString() === req.user._id.toString()) {
      isNotLogged = false;
    }

    if (isNotLogged) {
      activitySearchScope.isPublic = true;
    }

    activityModel.find(activitySearchScope, null, {
      sort: {
        date: -1
      }
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
          title: res.__('%s activities', user[0].nick),
          nick: user[0].nick,
          sports: sports,
          url: '/profile/' + url + '/activities',
          urlPostfix: urlPostfix
        });
      });
    });
  });
});

/**
 * GET: User activities.
 */
router.get('/:url/trainings', function(req, res, next) {
  var url = req.params.url,
    isNotLogged = true,
    urlPostfix = '';

  userModel.find({
    url: url
  }, function(err, user) {
    if (err) {
      console.log(err);
      return next(err);
    }

    var trainingSearchScope = {
      userID: user[0]._id
    };

    if (req.query.type === 'trainings') {
      trainingSearchScope.isCompetition = false;
      urlPostfix = 'trainings';
    } else if (req.query.type === 'competitions') {
      trainingSearchScope.isCompetition = true;
      urlPostfix = 'competitions';
    }

    if (req.user && user[0]._id.toString() === req.user._id.toString()) {
      isNotLogged = false;
    }

    if (isNotLogged) {
      trainingSearchScope.isPublic = true;
    }

    trainingModel.find(trainingSearchScope, null, {
      sort: {
        date: 1
      }
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
          title: res.__('%s trainings', user[0].nick),
          nick: user[0].nick,
          sports: sports,
          url: '/profile/' + url + '/trainings',
          urlPostfix: urlPostfix
        });
      });
    });
  });
});

/**
 * GET: User connected peoples.
 */
router.get('/:url/connected-peoples', function(req, res, next) {
  var connectSearchQuery = [],
    userID;

  userModel.findOne({
    url: req.params.url
  }, function(err, user) {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (req.user) {
      userID = req.user._id.toString();

      if (userID === user._id.toString()) {
        connectSearchQuery = [{
          userB: user._id.toString()
        }, {
          userA: user._id.toString()
        }];
      } else {
        connectSearchQuery = [{
          userA: userID,
          userB: user._id.toString()
        }, {
          userA: user._id.toString(),
          userB: userID
        }];
      }
    } else {
      connectSearchQuery = [{
        userB: user._id.toString()
      }, {
        userA: user._id.toString()
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
            actualConnect.userB.toString() === user._id.toString()) {
            isUserCoach = true;
          } else if (actualConnect.userB.toString() === userID &&
            actualConnect.userA.toString() === user._id.toString()) {
            isUserCoach = true;
          }
        }
      } else {
        isUserCoach = false;
      }

      var searchQuery = {
          '_id': {
            $in: helpers.getConnectedIds(connectedPeoplesObj, user._id.toString())
          }
        },
        urlPostfix = '';

      if (req.query.type === 'coach') {
        url = '/profile/list?type=coach';
        urlPostfix = 'coach';
        searchQuery.isCoach = true;
      } else if (req.query.type === 'athlete') {
        url = '/profile/list?type=athlete';
        urlPostfix = 'athlete';
        searchQuery.isCoach = false;
      }

      userModel.find(searchQuery, null, {
        limit: req.query.limit || 20
      }, function(err, connectedPeoples) {
        if (err) {
          console.log(err);
          next(err);
        }

        res.render('profile/list', {
          users: connectedPeoples,
          title: res.__('All %s connected users', user.nick),
          url: '/profile/' + user.url + '/connected-peoples',
          urlPostfix: urlPostfix
        });
      });
    });
  });
});

/**
 * GET: User lactate tests.
 */
router.get('/:url/lactate-tests', function(req, res, next) {
  userModel.findOne({
    url: req.params.url
  }, function(err, user) {
    if (err) {
      console.log(err);
      return next(err);
    }

    lactateModel.find({
      userID: user._id,
    }, null, {
      sort: {
        date: -1
      }
    }, function(err, lactates) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.render('lactate/list', {
        lactates: lactates,
        title: res.__('All %s lactate tests', user.nick),
        url: '/profile/' + user._id + '/lactate-tests'
      });
    });
  });
});

module.exports = router;
