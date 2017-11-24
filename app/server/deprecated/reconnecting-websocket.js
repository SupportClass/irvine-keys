'use strict';

const CLOSE_NORMAL = 1000; // The error code used when a WebSocket is deliberately closed.
const MIN_BACKOFF = 300; // The shortest allowed backoff (in milliseconds).
const MAX_BACKOFF = 10000; // The longest allowed backoff (in milliseconds).
const BACKOFF_INTERVAL = 500; // The amount to increase each successive backoff by (in milliseconds).

// Native
const EventEmitter = require('events');

// Packages
const WebSocket = require('ws');

class WebSocketClient extends EventEmitter {
	constructor(url) {
		super();
		this._reconnecting = false;
		this._attemptNumber = 0;
		this.open(url);
	}

	get connected() {
		return this.instance.readyState === WebSocket.OPEN;
	}

	get send() {
		return this.instance.send;
	}

	open(url) {
		if (this.instance) {
			this.instance.removeAllListeners();
		}

		this.url = url;
		this.instance = new WebSocket(this.url);

		this.instance.on('open', ...args => {
			if (this._reconnecting) {
				this.emit('reconnect', this._attemptNumber);
				this._reconnecting = false;
				this._attemptNumber = 0;
			}
			this.emit('open', ...args);
			safeCall(this.onopen, ...args);
		});

		this.instance.on('message', ...args => {
			this.emit('message', ...args);
			safeCall(this.onmessage, ...args);
		});

		this.instance.on('close', (code, reason) => {
			switch (code) {
				case CLOSE_NORMAL: // Intentional closure, not an error.
					this.emit('close', code, reason);
					break;
				default:
					this.reconnect(reason);
					break;
			}
			safeCall(this.onclose, code, reason);
		});

		this.instance.on('error', error => {
			switch (error.code) {
				case 'ECONNREFUSED':
					this.reconnect(error.code);
					break;
				default:
					this.emit('error', error);
					safeCall(this.onerror, error);
					break;
			}
		});

		this.instance.on('ping', data => {
			this.emit('ping', data);
		});

		this.instance.on('pong', data => {
			this.emit('pong', data);
		});
	}

	close() {
		this.cancelReconnect();
		return this.instance.close(CLOSE_NORMAL, 'closed by user');
	}

	reconnect(reason) {
		if (this._reconnecting || this._reconnectTimeout) {
			// Don't attempt to reconnect if a reconnection attempt is already in-progress.
			return;
		}

		if (reason === undefined) {
			reason = 'no reason provided';
		}

		if (typeof reason !== 'string') {
			throw new Error(`reason must be a string, got a(n) ${typeof reason}`);
		}

		this._reconnecting = true;
		this.emit('disconnect', reason);
		this.instance.removeAllListeners();
		this._reconnectTimeout = setTimeout(() => {
			this._reconnectTimeout = null;
			this.open(this.url);
		}, WebSocketClient.calcBackoffDuration(++this._attemptNumber));
	}

	cancelReconnect() {
		clearTimeout(this._reconnectTimeout);
		this._reconnectTimeout = null;
		this._reconnecting = false;
	}

	static calcBackoffDuration(attemptNumber) {
		return Math.min(
			MIN_BACKOFF + ((attemptNumber - 1) * BACKOFF_INTERVAL),
			MAX_BACKOFF
		);
	}
}

function safeCall(fn, ...args) {
	if (typeof fn === 'function') {
		fn(...args);
	}
}

module.exports = WebSocketClient;
