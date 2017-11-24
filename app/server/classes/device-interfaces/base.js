'use strict';

// Native
const EventEmitter = require('events');

class BaseDeviceInterface extends EventEmitter {
	static get PROGRAMMING_KEY_INDEX() {
		return 'programming';
	}

	constructor() {
		super();
		this.__pressedKeys = new Set();
	}

	destroy() {
		this.__destroyed = true;
		this.removeAllListeners();
	}

	pressKey(keyIndex) {
		if (this.__pressedKeys.has(keyIndex)) {
			return;
		}

		if (keyIndex === this.constructor.PROGRAMMING_KEY_INDEX) {
			keyIndex = BaseDeviceInterface.PROGRAMMING_KEY_INDEX;
		}

		this.__pressedKeys.add(keyIndex);
		this.emit('keyPressed', keyIndex);
	}

	releaseKey(keyIndex) {
		if (!this.__pressedKeys.has(keyIndex)) {
			return;
		}

		if (keyIndex === this.constructor.PROGRAMMING_KEY_INDEX) {
			keyIndex = BaseDeviceInterface.PROGRAMMING_KEY_INDEX;
		}

		this.__pressedKeys.delete(keyIndex);
		this.emit('keyReleased', keyIndex);
	}

	getPressedKeys() {
		return Array.from(this.__pressedKeys);
	}

	/* eslint-disable lines-between-class-members */
	// Stubs
	procedureCleared() {}
	procedureReady() {}
	procedureInvoked() {}
	procedureCompleted() {}
	/* eslint-enable lines-between-class-members */
}

module.exports = BaseDeviceInterface;