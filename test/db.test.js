var assert = require('assert'),
  mongoose = require('mongoose'),
  userModel = require(process.cwd() + '/server/models/userModel');

var DB_URL = 'mongodb://superadmin:tomasko4@ds063779.mongolab.com:63779/runeee-test';

describe('DB', function() {

  describe('#connect()', function() {
    it('should return -1 when the db is not connected', function() {
      mongoose.connect(DB_URL, function(err, res) {
        if (err) {
          assert.equal(1, -1);
        } else {
          assert.equal(1, 1);
        }
      });
    });
  });

});
