"use strict"

function Client() {
	this.socket;
}

Client.prototype = {
	connect: function() {
		// change to match server ip & port
		var server = 'http://localhost:9001';
		this.socket = io.connect(server);

	},

	emitJoin: function(name) {
		this.socket.emit('join_request', name);
	}
}
