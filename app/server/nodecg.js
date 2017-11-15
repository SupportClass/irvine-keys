'use strict';

// Native
const EventEmitter = require('events');

// Packages
const equal = require('fast-deep-equal');
const log = require('electron-log');
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

		if (!url.endsWith('/')) {
			url += '/';
		}

		url = `${url}irvine-keys`;
		log.debug('Attempting to connect to:', url);
		this.socket = socketIOClient(url);

		// Socket.IO events
		this.socket.on('connect', () => {
			log.debug('Connected.');
		});

		/* eslint-disable no-unused-vars */
		this.socket.on('connect_error', error => {
			log.error('Failed to connect:', error);
		});

		this.socket.on('connect_timeout', timeout => {
			log.error('Connection timed out:', timeout);
		});

		this.socket.on('reconnect', attemptNumber => {
			log.debug('Reconnected on attempt %d.', attemptNumber);
		});

		this.socket.on('reconnect_attempt', attemptNumber => {});

		this.socket.on('reconnect_error', error => {
			log.error('Failed to reconnect:', error);
		});

		this.socket.on('disconnect', reason => {
			// reason is either: 'io server disconnect' or 'io client disconnect'
			log.debug('Disconnected, reason:', url, reason);
		});

		this.socket.on('error', error => {
			log.error('Socket error:', error);
		});

		this.socket.on('pong', latency => {
			sendToMainWindow('nodecg:pong', latency);
		});
		/* eslint-enable no-unused-vars */

		this.socket.on('availableMethods', availableMethods => {
			if (!equal(availableMethods, this.availableMethods)) {
				this.availableMethods = availableMethods;
				log.debug('availableMethodsChanged:', this.availableMethods);
				this.emit('availableMethodsChanged', this.availableMethods);
			}
		});

		this.socket.on('availableScenes', availableScenes => {
			if (!equal(availableScenes, this.availableScenes)) {
				this.availableScenes = availableScenes;
				log.debug('availableScenesChanged:', this.availableScenes);
				this.emit('availableScenesChanged', this.availableScenes);
			}
		});

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

	invokeMethod(methodName) {
		return new Promise((resolve, reject) => {
			if (!this.socket || !this.socket.connected) {
				return reject(new Error('Socket is not connected'));
			}

			if (!this.availableMethods.includes(methodName)) {
				return reject(new Error(`Method "${methodName}" is not one of the availableMethods`));
			}

			this.socket.emit('invokeMethod', methodName, (error, response) => {
				if (error) {
					return reject(error);
				}

				resolve(response);
			});
		});
	}

	previewScene(sceneName) {
		return new Promise((resolve, reject) => {
			if (!this.socket || !this.socket.connected) {
				return reject(new Error('Socket is not connected'));
			}

			if (!this.availableScenes.includes(sceneName)) {
				return reject(new Error(`Scene "${sceneName}" is not one of the availableScenes`));
			}

			this.socket.emit('previewScene', sceneName, (error, response) => {
				if (error) {
					return reject(error);
				}

				resolve(response);
			});
		});
	}
}

const singletonInstance = new NodeCG();
ipcMain.on('nodecg:getAvailableMethodsSync', event => {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableMethods;
});
ipcMain.on('nodecg:getAvailableScenesSync', event => {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableScenes;
});

module.exports = singletonInstance;
module.exports.__NodeCGClass__ = NodeCG; // Used for testing.
