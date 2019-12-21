'use strict';

var config 		= require('../config');
var Mongoose 	= require('mongoose');
var logger 		= require('../logger');

// Connect to the database
// construct the database URI and encode username and password.
var dbURI = "mongodb://heroku_fg02rhwd:nv4lqhta7g8atdbppncgfdud87@ds125053.mlab.com:25053/heroku_fg02rhwd";
Mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Throw an error if the connection fails
Mongoose.connection.on('error', function(err) {
	if(err) throw err;
});

// mpromise (mongoose's default promise library) is deprecated, 
// Plug-in your own promise library instead.
// Use native promises
Mongoose.Promise = global.Promise;

module.exports = { Mongoose, 
	models: {
		user: require('./schemas/user.js'),
		room: require('./schemas/room.js')
	}
};
