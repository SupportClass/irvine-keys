'use strict';

// Native
const EventEmitter = require('events');

// Packages
const equal = require('fast-deep-equal');
const socketIOClient = require('socket.io-client');
const {ipcMain} = require('electron');
const {sendToMainWindow} = require('./util');

class NodeCG extends EventEmitter {
	constructor() {
		super();
		this.socket = null;
		this.availableMethods = [];
	}

	connect(url) {
		if (this.socket) {
			this.disconnect();
		}

		this.socket = socketIOClient(url);

		// Socket.IO events
		this.socket.on('connect', () => {
			this.enumerateAvailableMethods();
		});

		/* eslint-disable no-unused-vars */
		this.socket.on('connect_error', error => {});

		this.socket.on('connect_timeout', timeout => {});

		this.socket.on('reconnect', attemptNumber => {
			this.enumerateAvailableMethods();
		});

		this.socket.on('reconnect_attempt', attemptNumber => {});

		this.socket.on('reconnect_error', error => {});

		this.socket.on('disconnect', reason => {
			// reason is either: 'io server disconnect' or 'io client disconnect'
		});

		this.socket.on('error', error => {});

		this.socket.on('pong', latency => {
			sendToMainWindow('nodecg:pong', latency);
		});
		/* eslint-enable no-unused-vars */

		return new Promise(resolve => {
			this.socket.once('connect', resolve);
		});
	}

	disconnect() {
		if (!this.socket) {
			return;
		}

		this.socket.disconnect();
		this.socket.removeAllListeners('connect');
		this.socket.removeAllListeners('connect_error');
		this.socket.removeAllListeners('connect_timeout');
		this.socket.removeAllListeners('reconnect');
		this.socket.removeAllListeners('reconnect_attempt');
		this.socket.removeAllListeners('reconnect_error');
		this.socket.removeAllListeners('disconnect');
		this.socket.removeAllListeners('error');
		this.socket.removeAllListeners('pong');
		this.socket = null;
	}

	emit(eventName, ...restArgs) {
		super.emit(eventName, ...restArgs);
		sendToMainWindow(`nodecg:${eventName}`, ...restArgs);
	}

	enumerateAvailableMethods() {
		return new Promise((resolve, reject) => {
			if (!this.socket || !this.socket.connected) {
				return reject(new Error('Socket is not connected'));
			}

			this.socket.emit('irvine:enumerateAvailableMethods', availableMethods => {
				resolve(availableMethods);
				if (!equal(availableMethods, this.availableMethods)) {
					this.availableMethods = availableMethods;
					this.emit('availableMethodsChanged', this.availableMethods);
				}
			});
		});
	}

	invokeMethod(methodName) {
		return new Promise((resolve, reject) => {
			if (!this.socket || !this.socket.connected) {
				return reject(new Error('Socket is not connected'));
			}

			if (!this.availableMethods.includes(methodName)) {
				return reject(new Error(`Method "${methodName}" is not one of the availableMethods`));
			}

			this.socket.emit('irvine:invokeMethod', methodName, (error, response) => {
				if (error) {
					return reject(error);
				}

				resolve(response);
			});
		});
	}
}

const singletonInstance = new NodeCG();
ipcMain.on('nodecg:enumerateAvailableMethodsSync', event => {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableMethods;
});

module.exports = singletonInstance;
module.exports.__NodeCGClass__ = NodeCG; // Used for testing.
