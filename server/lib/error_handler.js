/**
 * Error handler.
 */
var DEV_ENV = 'DEVELOPMENT',
  CURRENT_ENV = process.env.NODE_ENV || DEV_ENV;

var setup = function(app) {

  app.use(function(req, res, next) {
    res.render('error', {
      status: 404,
      message: 'Page not found!'
    });
  });

  app.use(function(err, req, res, next) {
    if (CURRENT_ENV === DEV_ENV) {
      console.error(err.stack);
      next(err);
    }
    res.render('error', {
      status: err.status || 500,
      message: err
    });
  });
};

module.exports.setup = setup;
