'use strict';

// Native
const EventEmitter = require('events');

class MockSocketIOClient extends EventEmitter {
	constructor() {
		super();
		this.connected = false;
		process.nextTick(() => {
			this.connected = true;
			this.emit('connect');
		});
	}

	disconnect() {
		this.connected = false;
	}
}

module.exports = function (...args) {
	return new MockSocketIOClient(...args);
};
