// Controller
// Exports methods for Account model.
var passport = require('passport')
	, socketio = require('socket.io')
	, Account = require('../models/account.js')
	, Timeline = require('../models/timeline')
	, Moment = require('../models/moment')
	, Thought = require('../models/thought')
	, Photo = require('../models/photo')
	, Thought = require('../models/thought')
	, ThoughtElement = require('../models/thought-element')
	, Story = require('../models/story');

// TODO: Delete the following code when done testing... this shouldn't be public :-)
exports.read = [
	passport.authenticate('bearer', { session: false }),
	function(req, res) {

		conditions = {};
		if (req.query['id']) {
			conditions['_id'] = req.query['id'];

			getTimeline();
		} else if (req.query['element_id']) {
			conditions['element'] = req.query['element_id'];

			getTimeline();
		} else {
			console.log("Lookup up timeline for account: " + req.user.id);
			// Lookup timeline for user
			Moment.findOne({ element: req.user.id, elementType: 'Account' }, function(err, moment) {

				if (moment === null) {

					// Create timeline for account
					Story.createTimelineByElement(req.user, function(err, timeline) {

						Moment.findOne({ element: req.user.id, elementType: 'Account' }, function(err, moment) {
							console.log('Found timeline element:' + moment.id);
							conditions['element'] = moment.id;

							getTimeline();
						});
					});

				} else {

					console.log('Found timeline element:' + moment.id);
					conditions['element'] = moment.id;

					getTimeline();
				}
			});
		}

		function getTimeline() {
			console.log("Timeline.find() conditions:");
			console.log(conditions);

			Timeline.findOne(conditions, function(err, timeline) {
				if (err) {
					return console.log(err);
				} else {

					if (timeline === null) {
						console.log('Error: Timeline is null');
						return res.json({});
					}

					// Get timeline elements
					// TODO: Optimize.  There's got to be a better way! Maybe asynchronous? Maybe use sockets for streaming data back? Create "async" version of API and HTTP request-based one?
					Moment.find({ timeline: timeline.id }).sort('date').exec(function(err, moments) {
						if (moments !== null && moments.length > 0) {

							// Populate the timeline
							var count = moments.length; // Hacky. Optimize!
							moments.forEach(function (element) {

								//console.log(element);

								// Populate the moments in the timeline
								// console.log('%s is a %s', element.element, element.elementType);
								element.populate({ path: 'element', model: element.elementType }, function(err, populatedElement) {
									if (populatedElement !== null && populatedElement.element !== null) {

										// console.log("==> popped: " + populatedElement);

										// Populate JSON structure to return based on element types

										if(element.elementType == 'Thought') {
											Thought.getPopulated2(populatedElement.element, function(err, populatedThought) {

												count--;

												if(count <= 0) { // "callback"
													res.json(moments);
												}
											});

											// populatedElement.element.populate({ path: 'latest', model: 'ThoughtElement' }, function(err, populatedThought) {
											// 	if (populatedThought !== null) {

											// 		populatedThought.populate({ path: 'author' }, function(err, populatedAuthor) {
											// 			if (populatedAuthor !== null) {
											// 				//console.log(populatedThought);
											// 				count--;

											// 				if(count <= 0) { // "callback"
											// 					res.json(moments);
											// 				}
											// 			} else {
											// 				//console.log(populatedThought);
											// 				count--;

											// 				if(count <= 0) { // "callback"
											// 					res.json(moments);
											// 				}
											// 			}
											// 		});
											// 	}
											// });
											
										} else if(element.elementType == 'Photo') {
											populatedElement.element.populate({ path: 'latest', model: 'PhotoElement' }, function(err, populatedThought) {
												//console.log(populatedThought);
												count--;

												if(count <= 0) { // "callback"
													res.json(moments);
												}
											});
										} else {
											count--;

											if(count <= 0) {
												// "callback"
												res.json(moments);
											}
										}
									} else {
										count--;
										if(count <= 0) {
											// "callback"
											res.json(moments);
										}
									}
								});




							});
						} else {
							res.json({});
						}
					});
				}
			});
		}
	}
];

// [Source: http://codahale.com/how-to-safely-store-a-password/]
exports.create = [
	passport.authenticate('bearer', { session: false }),
	function(req, res) {

		var timelineTemplate = req.body;

		// Create timeline
		Timeline.create({
			element: timelineTemplate.element,
			elementType: timelineTemplate.elementType
		}, function(err, timeline) {
			console.log('Creating timeline: ' + timeline);
			if (err) {
				console.log('Error creating timeline: ' + timeline);
			}
			console.log('Created timeline: ' + timeline);

			res.json(timeline);
			io.sockets.emit('timeline', timeline);
		});
	}
];