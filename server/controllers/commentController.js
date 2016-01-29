/**
 * API controller.
 */
var express = require('express'),
  router = express.Router(),
  helpers = require('./../lib/helpers'),
  commentModel = require(process.cwd() + '/server/models/commentModel');

/**
 * GET: Delete comment.
 */
router.get('/:id/delete', function(req, res, next) {
  var nextURL = '/' + req.query.next,
    commentID = req.params.id;

  if (res.locals.isAuthenticated) {
    commentModel.findOneAndRemove({
      _id: commentID,
      user: res.locals.loggedUser._id
    }, function(err, comment) {
      if (err) {
        console.log(err);
        return next(err);
      }

      res.redirect(nextURL + '?update=commentRemoveOK');
    });
  } else {
    res.redirect(nextURL);
  }

});

/**
 * POST: Activity comment.
 */
router.post('/:id/post', helpers.isLoggedIn, function(req, res, next) {
  var formData = req.body.static,
    activityId = req.params.id,
    urlPrefix = '';

  var newComment = new commentModel();
  if (req.query.type === 'training') {
    newComment.training = activityId;
    urlPrefix = '/training/';
  } else {
    newComment.activity = activityId;
    urlPrefix = '/activity/';
  }
  newComment.user = req.user._id.toString();
  newComment.text = formData.comment;

  newComment.save(function(err, comment) {
    if (err) {
      console.log(err);
      return next(err);
    }

    res.redirect(urlPrefix + activityId + '?update=commentOK');
  });
});

module.exports = router;
