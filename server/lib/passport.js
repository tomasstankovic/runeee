/**
 * Login / registration handler.
 */
var LocalStrategy = require('passport-local').Strategy,
  FacebookStrategy = require('passport-facebook').Strategy,
  User = require('./../models/userModel'),
  helpers = require('./helpers');

module.exports = function(passport, SOCIAL_KEYS) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  /**
   * Local Sign Up
   */
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    process.nextTick(function() {
      User.findOne({
        'local.email': email
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
        }

        if (req.user) {
          var existingUser = req.user;
          existingUser.local.email = email;
          existingUser.local.password = helpers.generateHash(password);

          existingUser.save(function(err) {
            if (err){
              throw err;
            }
            return done(null, existingUser);
          });

        } else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = helpers.generateHash(password);
          newUser.nick = helpers.generateNickname(email);
          newUser.url = helpers.makeUserUrl(newUser.nick);
          newUser.isActive = true;
          newUser.isCompleted = false;

          newUser.save(function(err) {
            if (err) {
              throw err;
            }
            return done(null, newUser);
          });
        }

      });
    });
  }));

  /**
   * Local Login
   */
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function(req, email, password, done) {
    User.findOne({
      'local.email': email
    }, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, req.flash('loginMessage', 'No user found.'));
      }
      if (!helpers.validPassword(password, user.local.password)) {
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
      }
      return done(null, user);
    });
  }));

  /**
   * Facebook login/registration.
   */

  passport.use(new FacebookStrategy({
    clientID: SOCIAL_KEYS.facebook.appID,
    clientSecret: SOCIAL_KEYS.facebook.appSecret,
    callbackURL: SOCIAL_KEYS.facebook.callbackURL,
    passReqToCallback: true
  },
  function(req, token, refreshToken, profile, done) {
    process.nextTick(function() {

      if (!req.user) {

        User.findOne({
          'facebook.id': profile.id
        }, function(err, user) {
          if (err) {
            return done(err);
          }

          if (user) {

            if (!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.email = profile.emails[0].value;

              user.save(function(err) {
                if (err) {
                  throw err;
                }
                return done(null, user);
              });
            }

            return done(null, user);
          } else {
            var newUser = new User();

            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.email = profile.emails[0].value;

            newUser.save(function(err) {
              if (err) {
                throw err;
              }

              return done(null, newUser);
            });
          }
        });

      } else {
        var user = req.user;

        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.email = profile.emails[0].value;

        user.save(function(err) {
          if (err) {
            throw err;
          }

          return done(null, user);
        });
      }
    });
  }));
};
