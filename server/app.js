/**
 * Main app start point.
 */
var newrelic = require('newrelic'),
  express = require('express'),
  prettyError = require('pretty-error').start();

var app = express();

prettyError.skipNodeFiles();
prettyError.skipPackage('newrelic');
prettyError.skipPackage('express');

var config = require('./config'),
  error = require('./lib/error_handler');

config.appSetup(app);
config.dbConnect();
error.setup(app);
app.listen(config.port, function() {
  console.log('Listening on port %d', config.port);
});
