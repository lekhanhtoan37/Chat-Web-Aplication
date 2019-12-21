var Mongoose 	= require('mongoose');

var dbURI = "mongodb://heroku_fg02rhwd:nv4lqhta7g8atdbppncgfdud87@ds125053.mlab.com:25053/heroku_fg02rhwd";
Mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

Mongoose.connection.on('error', function(err) {
	if(err) throw err;
});

Mongoose.Promise = global.Promise;

module.exports = { Mongoose, 
	models: {
		user: require('./schemas/user.js'),
		room: require('./schemas/room.js')
	}
};
