var config 	= require('../config/config');
var redis 	= require('redis').createClient;
var adapter = require('socket.io-redis');

var Room = require('../models/room');

var ioEvents = function(io) {
	io.of('/rooms').on('connection', function(socket) {

		socket.on('createRoom', function(title) {
			Room.findOne({'title': new RegExp('^' + title + '$', 'i')}, function(err, room){
				if(err) throw err;
				if(room){
					socket.emit('updateRoomsList', { error: 'Room title already exists.' });
				} else {
					Room.create({ 
						title: title
					}, function(err, newRoom){
						if(err) throw err;
						socket.emit('updateRoomsList', newRoom);
						socket.broadcast.emit('updateRoomsList', newRoom);
					});
				}
			});
		});
	});

	io.of('/chatroom').on('connection', function(socket) {
		socket.on('join', function(roomId) {
			Room.findById(roomId, function(err, room){
				if(err) throw err;

				if(!room){
					socket.emit('updateUsersList', { error: 'Room doesnt exist.' });
				} else {
					if(socket.request.session.passport == null){
						return;
					}

					Room.addUser(room, socket, function(err, newRoom){
						socket.join(newRoom.id);

						Room.getUsers(newRoom, socket, function(err, users, cuntUserInRoom){
							if(err) throw err;

							socket.emit('updateUsersList', users, true);

							if(cuntUserInRoom === 1){
								socket.broadcast.to(newRoom.id).emit('updateUsersList', users[users.length - 1]);
							}
						});
					});
				}
			});
		});

		socket.on('disconnect', function() {
			if(socket.request.session.passport == null){
				return;
			}

			Room.removeUser(socket, function(err, room, userId, cuntUserInRoom){
				if(err) throw err;

				socket.leave(room.id);

				if(cuntUserInRoom === 1){
					socket.broadcast.to(room.id).emit('removeUser', userId);
				}
			});
		});

		socket.on('newMessage', function(roomId, message) {
			socket.broadcast.to(roomId).emit('addMessage', message);
		});

	});
}

var init = function(app){

	var server 	= require('http').Server(app);
	var io 		= require('socket.io')(server);

	io.set('transports', ['websocket']);

	let port = config.redis.port;
	let host = config.redis.host;
	let password = config.redis.password;
	let pubClient = redis(port, host, { auth_pass: password });
	let subClient = redis(port, host, { auth_pass: password, return_buffers: true, });
	io.adapter(adapter({ pubClient, subClient }));

	io.use((socket, next) => {
		require('../session/session')(socket.request, {}, next);
	});

	ioEvents(io);

	return server;
}

module.exports = init;