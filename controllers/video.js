// Controller
// Exports methods for Account model.
var passport = require('passport')
  , socketio = require('socket.io')
  , Account = require('../models/account')
  , Video = require('../models/video')
  , Moment = require('../models/moment')
  , Inquiry = require('../models/inquiry');

// [Source: http://codahale.com/how-to-safely-store-a-password/]
exports.create = [
    passport.authenticate('bearer', { session: false }),
    function(req, res, next) {

        console.log("Video Request:");
        console.log(req);

        // Get POST data
        var data     = req.body;
        var timeline = data.timeline;
        console.log("Video Timeline: %s", timeline);

        // Get files
        //console.log(req.files);

        Account.findById(req.user.id, function(err, account) {

            // Create Video template
            var activityTemplate      = {};
            var filenameStart         = req.files.file.path.indexOf("/uploads");
            activityTemplate.file     = req.files.file;
            activityTemplate.uri      = req.files.file.path.substring(filenameStart);
            // activityTemplate.timeline = timeline;
            activityTemplate.account  = account;
            // if (data.hasOwnProperty('activity'))   activityTemplate.activity   = data.activity;
            // if (data.hasOwnProperty('reference')) activityTemplate.reference = data.reference;

            console.log("videoUri = " + activityTemplate.uri);
            console.log(activityTemplate);

            Inquiry.addVideo(activityTemplate, function(err, entry) {
                io.sockets.emit('video', entry); // TODO: is this the wrong place?  better place?  guaranteed here?
                res.json(entry);
              });

        });

    }
];