var Mongoose  = require('mongoose');

var RoomSchema = new Mongoose.Schema({
    title: { type: String, required: true },
    connections: { type: [{ userId: String, socketId: String }]}
});

var roomModel = Mongoose.model('room', RoomSchema);

module.exports = roomModel;