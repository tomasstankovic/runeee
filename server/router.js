/**
 * App router.
 */
var setup = function(app, passport) {
  var staticController = require('./controllers/staticController')(passport),
    profileController = require('./controllers/profileController'),
    activityController = require('./controllers/activityController'),
    trainingController = require('./controllers/trainingController'),
    commentController = require('./controllers/commentController'),
    lactateController = require('./controllers/lactateController'),
    apiController = require('./controllers/apiController');

  app.use('/', staticController);
  app.use('/profile', profileController);
  app.use('/activity', activityController);
  app.use('/training', trainingController);
  app.use('/comment', commentController);
  app.use('/lactate-test', lactateController);
  app.use('/api', apiController);
};

module.exports.setup = setup;
