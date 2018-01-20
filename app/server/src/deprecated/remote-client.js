'use strict';

// Native
const EventEmitter = require('events');

// Packages
const equal = require('fast-deep-equal');
const log = require('electron-log');
const WebSocket = require('./reconnecting-websocket');
const {ipcMain} = require('electron');
const {sendToMainWindow} = require('./util');

class RemoteClient extends EventEmitter {
	constructor() {
		super();
		this.socket = null;
		this.availableMethods = [];
	}

	connect(url) {
		if (this.socket) {
			// Close any existing socket before attempting to connect a new one.
			this.disconnect();
		}

		log.debug('Attempting to connect to:', url);
		this.socket = new WebSocket();

		// WebSocket events.
		this.socket.on('connect', () => {
			log.debug('Connected.');
		});

		this.socket.on('reconnect', attemptNumber => {
			log.debug('Reconnected on attempt %d.', attemptNumber);
		});

		this.socket.on('disconnect', reason => {
			log.debug('Disconnected, reason:', reason);
		});

		this.socket.on('close', (code, reason) => {
			log.debug('Intentionally closed (code: %s, reason: %s)', code, reason);
		});

		this.socket.on('error', error => {
			log.error('Socket error:', error);
		});

		this.socket.on('pong', latency => {
			log.debug(latency, latency.toString());
			sendToMainWindow('remote:pong', latency);
		});

		// Protocol events.
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

		return this.socket.open(url);
	}

	disconnect() {
		if (!this.socket) {
			return;
		}

		this.socket.close();
		this.socket.removeAllListeners();
		this.socket = null;
	}

	emit(eventName, ...restArgs) {
		super.emit(eventName, ...restArgs);
		sendToMainWindow(`remote:${eventName}`, ...restArgs);
	}

	invokeMethod(methodName) {
		return new Promise((resolve, reject) => {
			if (!this.socket || !this.socket.connected) {
				return reject(new Error('Socket is not connected'));
			}

			if (!this.availableMethods.includes(methodName)) {
				return reject(new Error(`Method "${methodName}" is not one of the availableMethods`));
			}

			this.socket.send('invokeMethod', methodName, (error, response) => {
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

			this.socket.send('previewScene', sceneName, (error, response) => {
				if (error) {
					return reject(error);
				}

				resolve(response);
			});
		});
	}
}

const singletonInstance = new RemoteClient();
ipcMain.on('remote:getAvailableMethodsSync', event => {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableMethods;
});
ipcMain.on('remote:getAvailableScenesSync', event => {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableScenes;
});

module.exports = singletonInstance;
module.exports.__NodeCGClass__ = RemoteClient; // Used for testing.
