var assert = require('assert'),
  mongoose = require('mongoose'),
  commentModel = require(process.cwd() + '/server/models/commentModel');

var DB_URL = 'mongodb://superadmin:tomasko4@ds063779.mongolab.com:63779/runeee-test';

describe('Comments - activity', function() {

  describe('#createAndRemove()', function() {
    it('should save without error', function() {

      var newComment = new commentModel();
      newComment.activity = '000000000000000000000000';
      newComment.user = '000000000000000000000000';
      newComment.text = 'Test_Text';

      newComment.save(function(err, comment) {
        if (err) {
          console.log(err);
          assert.equal(1, -1);
          return;
        }

        commentModel.findOneAndRemove({
          '_id': comment._id
        }, function(err, activityFind) {
          if (err) {
            console.log(err);
            assert.equal(1, -1);
            return;
          }

          assert.equal(1, 1);
        });

      });
    });
  });

});
