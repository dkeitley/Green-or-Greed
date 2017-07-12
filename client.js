"use strict"

function Client() {
	this.socket;
}

Client.prototype = {
	connect: function() {
		var mic = '169.254.141.252:8080';
		var me = '169.254.2.84:9001'
		this.socket = io.connect(me);

	},

	emitJoin: function(name) {
		this.socket.emit('join_request', name);
	}
}