var assert = require('assert'),
	mongoose = require('mongoose'),
	helpers = require(process.cwd() + '/server/lib/helpers'),
	activityModel = require(process.cwd() + '/server/models/activityModel'),
	userModel = require(process.cwd() + '/server/models/userModel'),
	sportModel = require(process.cwd() + '/server/models/sportModel');

var DB_URL = 'mongodb://superadmin:tomasko4@ds063779.mongolab.com:63779/runeee-test';

describe('Activity', function() {

	describe('#createAndRemove()', function() {
		it('should save without error', function() {

			var newUser = new userModel();
			newUser.local.email = 'test2@test.com';
			newUser.local.password = helpers.generateHash('test');
			newUser.test = 'testURL';
			newUser.isActive = true;
			newUser.isCompleted = false;

			newUser.save(function(err) {
				if (err) {
					console.log(err);
					assert.equal(1, -1);
					return;
				}

				userModel.findOneAndRemove({
					'local.email': 'test2@test.com'
				}, function(err, existingUser) {
					if (err) {
						console.log(err);
						assert.equal(1, -1);
						return;
					}

					var newActivity = new activityModel();

					newActivity.userID = '000000000000000000000000';
					newActivity.title = 'Fake title';
					newActivity.description = 'Description';
					newActivity.sport = '000000000000000000000000';
					newActivity.duration.hours = 10;
					newActivity.duration.minutes = 11;
					newActivity.duration.seconds = 12;
					newActivity.hr.max = 192;
					newActivity.hr.avg = 152;
					newActivity.speed.max = 75;
					newActivity.speed.avg = 31;
					newActivity.distance = 50;
					newActivity.calories = 789;
					newActivity.isPublic = false;
					newActivity.date = new Date();

					newActivity.save(function(err, activity) {
						if (err) {
							console.log(err);
							assert.equal(1, -1);
							return;
						}

						activityModel.findOneAndRemove({
							'_id': activity._id
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
	});

});
