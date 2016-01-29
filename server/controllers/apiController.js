/**
 * API controller.
 */
var express = require('express'),
  router = express.Router(),
  helpers = require('./../lib/helpers'),
  userModel = require(process.cwd() + '/server/models/userModel'),
  connectModel = require(process.cwd() + '/server/models/connectModel'),
  activityModel = require(process.cwd() + '/server/models/activityModel');

/**
 * GET: Users json.
 */
router.get('/users', function(req, res, next) {
  var searchConditions = {
    skip: req.query.skip || 0
  };

  if (req.query.limit !== 'all') {
    searchConditions.limit = req.query.limit || 100;
  }

  userModel.find({}, null, searchConditions,
    function(err, users) {
      if (err) {
        console.log(err);
        return next(err);
      }

      users.forEach(function(user) {
        if (user.local.password) {
          user.local.password = undefined;
        }
        if (user.facebook) {
          user.facebook.token = undefined;
          user.facebook.id = undefined;
        }
      });

      res.json(users);
    });
});

/**
 * GET: Activities json.
 */
router.get('/activities', function(req, res, next) {
  activityModel.find({
    isPublic: true
  }, null, {
    skip: req.query.skip || 0,
    limit: req.query.limit || 100
  }, function(err, data) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.json(data);
  });
});

/**
 * GET: User activities json.
 */
router.get('/profile/:url/activities', function(req, res, next) {

  var url = req.params.url,
    isNotLogged = true;

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

    if (req.user && user[0]._id.toString() === req.user._id.toString()) {
      isNotLogged = false;
    }

    if (isNotLogged) {
      activitySearchScope.isPublic = true;
    }

    activityModel.find(activitySearchScope, null, {
      sort: {
        date: -1
      },
      skip: req.query.skip || 0,
      limit: req.query.limit || 100
    }, function(err, data) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.json(data);
    });
  });
});

/**
 * GET: User connected peoples json.
 */
router.get('/profile/:url/connected-peoples', function(req, res, next) {

  var nick = req.params.nick,
    isNotLogged = true;

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
      var isUserCoach;

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
      }, null, {
        skip: req.query.skip || 0,
        limit: req.query.limit || 100
      }, function(err, connectedPeoples) {
        if (err) {
          console.log(err);
          next(err);
        }

        connectedPeoples.forEach(function(people) {
          if (people.local.password) {
            people.local.password = undefined;
          }
          if (people.facebook) {
            people.facebook.token = undefined;
            people.facebook.id = undefined;
          }
        });

        res.json(connectedPeoples);
      });
    });
  });
});

module.exports = router;
