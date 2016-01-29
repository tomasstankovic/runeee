/**
 * Statics router.
 */
var express = require('express'),
  router = express.Router(),
  helpers = require('./../lib/helpers'),
  auth = require('./../lib/auth_keys'),
  aws = require('aws-sdk'),
  nodemailer = require('nodemailer'),
  gm = require('gm'),
  request = require('request'),
  sportModel = require(process.cwd() + '/server/models/sportModel'),
  userModel = require(process.cwd() + '/server/models/userModel'),
  AWS = auth.amazon;

var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'EMAIL_ADDRESS',
    pass: 'process.env.MAIL_PASSWWORD'
  }
});

module.exports = function(passport) {

  /**
   * Index
   */
  router.get('/', function(req, res) {
    res.render('static/index');
  });

  /**
   * GET: Login
   */
  router.get('/login', helpers.notForLoggedUsers, function(req, res) {
    var loginMessage = String(req.flash('loginMessage'));

    res.render('static/login', {
      message: loginMessage,
      passwordReset: req.query.passwordReset || null,
      next: req.query.next || '/profile'
    });
  });

  /**
   * POST: Login
   */
  router.post('/login', function(req, res, next) {
    passport.authenticate('local-login', function(err, user, info) {
      if (err || !user) {
        return res.redirect('/login');
      } else {
        req.logIn(user, function(err) {
          return res.redirect(req.query.next);
        });
      }
    })(req, res, next);
  });

  /**
   * GET: Sign Up
   */
  router.get('/signup', helpers.notForLoggedUsers, function(req, res) {
    var signupMessage = String(req.flash('signupMessage'));

    res.render('static/signup', {
      message: signupMessage
    });
  });

  /**
   * POST: Sign Up
   */
  router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  }));

  /**
   * GET: Logout
   */
  router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  /**
   * GET: Forgott password
   */
  router.get('/forgott-password', helpers.notForLoggedUsers, function(req, res) {
    res.render('static/forgott-password');
  });

  /**
   * POST: Forgott password
   */
  router.post('/forgott-password', function(req, res) {
    var email = req.body.email;

    userModel.findOne({
      'local.email': email
    }, function(err, user) {
      if (err) {
        console.log(err);
        return res.render('static/forgott-password', {
          message: err
        });
      } else if (user === null) {
        return res.render('static/forgott-password', {
          message: 'User not found!'
        });
      }

      var newPass = helpers.generatePassword(),
        msg = 'Hello, here is your new password for Runeee account: ' + newPass,
        mailOptions = {
          from: 'YOUR_EMAIL',
          to: email,
          subject: 'Password reset',
          text: msg,
          html: '<strong>' + msg + '</strong>'
        };

      userModel.findOneAndUpdate({
        _id: user._id
      }, {
        local: {
          email: user.local.email,
          password: helpers.generateHash(newPass)
        }
      }, function(err, doc) {
        transporter.sendMail(mailOptions, function(err, info) {
          if (err) {
            console.log(err);
            res.render('static/forgott-password', {
              message: 'Sorry... error with email sending :( Please, try again later!)'
            });
          } else {
            console.log('Message sent: ' + info.response);
            res.redirect('login?passwordReset=ok');
          }
        });
      });
    });
  });

  /**
   * Facebook login routes
   */
  router.get('/auth/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }));

  router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );

  /**
   * Connect Facebook.
   */
  router.get('/connect/facebook', passport.authorize('facebook', {
    scope: 'email'
  }));

  router.get('/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    }));

  /**
   * Connect local account.
   */
  router.get('/connect/local', helpers.isLoggedIn, function(req, res) {
    res.render('static/connect-local', {
      message: req.flash('loginMessage'),
      user: req.user
    });
  });

  router.post('/connect/local', passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/connect/local',
    failureFlash: true
  }));

  /**
   * Unlink accounts.
   */
  router.get('/unlink/local', function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });

  router.get('/unlink/facebook', function(req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });


  var photoUpload = function(url, name, type, width) {

    var params = {
      Bucket: AWS.S3_BUCKET,
      Key: 'avatar/' + name + '_' + width + 'x' + width,
      ContentType: type,
      ACL: 'public-read'
    };

    gm(request(url), name)
      .quality(100)
      .resize(width + '^', width + '^')
      .crop(width, width, 0, 0)
      .stream(function(err, stdout, stderr) {

        var s3obj = new aws.S3({
          params: params
        });

        s3obj
          .upload({
            Body: stdout
          })
          .send(function(err, data) {
            if (err) {
              console.log(err);
            }
          });
      });
  };

  /**
   * Amazon S3 photo Upload.
   */
  router.get('/sign-s3', function(req, res, next) {
    aws.config.update({
      accessKeyId: AWS.ACCESS_KEY,
      secretAccessKey: AWS.SECRET_KEY
    });

    var s3 = new aws.S3();
    var s3_params = {
      Bucket: AWS.S3_BUCKET,
      Key: 'avatar/' + req.query.s3_object_name,
      Expires: 60,
      ContentType: req.query.s3_object_type,
      ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3_params, function(err, data) {
      if (err) {
        console.log(err);
        return next(err);
      } else {
        var return_data = {
          signed_request: data,
          url: 'https://' + AWS.S3_BUCKET + '.s3.amazonaws.com/avatar/' + req.query.s3_object_name
        };

        userModel.findOneAndUpdate({
          _id: req.user._id
        }, {
          avatar_url: return_data.url,
          avatarDate: new Date().getTime(),
          avatarType: req.query.s3_object_type
        }, function(err) {
          if (err) {
            console.log(err);
            return res.redirect('/profile?update=ko');
          }

          res.write(JSON.stringify(return_data));
          res.end();
        });
      }
    });
  });

  router.get('/resize-s3', function(req, res, next) {
    var URL = req.user.avatar_url,
      NAME = URL.split('/');

    NAME = NAME[NAME.length - 1];

    photoUpload(URL, NAME, req.user.avatarType, 300);
    photoUpload(URL, NAME, req.user.avatarType, 100);
    photoUpload(URL, NAME, req.user.avatarType, 40);

    res.write(JSON.stringify({
      result: 'DONE'
    }));
    res.end();
  });

  /**
   * Add new sport type to DB
   */
  router.get('/add-sport-type', helpers.basicAuth, function(req, res, next) {
    var newSport = new sportModel();

    if (req.query.title && req.query.value) {
      newSport.title = req.query.title;
      newSport.value = req.query.value;
    } else {
      res.json({
        error: 'Chyba req.query.title || req.query.value pre pridanie do DB!'
      });
      return;
    }

    newSport.save(function(err, activity) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.redirect('/');
    });
  });

  return router;
};
