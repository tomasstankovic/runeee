var assert = require('assert'),
	mongoose = require('mongoose'),
	helpers = require(process.cwd() + '/server/lib/helpers'),
	userModel = require(process.cwd() + '/server/models/userModel');

var DB_URL = 'mongodb://superadmin:tomasko4@ds063779.mongolab.com:63779/runeee-test';

describe('User', function() {

	describe('#createAndRemove()', function() {
		it('should save without error', function() {
			var newUser = new userModel();
			newUser.local.email = 'test@test.com';
			newUser.local.password = helpers.generateHash('test');
			newUser.test = 'testURL';
			newUser.isActive = true;
			newUser.isCompleted = false;

			newUser.save(function(err) {
				if (err) {
					console.log(err);
					assert.equal(1, -1);
				}

				userModel.findOneAndRemove({
					'local.email': 'test@test.com'
				}, function(err, existingUser) {
					if (err) {
						console.log(err);
						assert.equal(1, -1);
						return;
					}

					if (existingUser) {
						assert.equal(1, 1);
					} else {
						assert.equal(1, -1);
					}
				});
			});
		});
	});

});
