'use strict';

// Packages
const StreamDeck = require('elgato-stream-deck');

// Ours
const BaseDeviceInterface = require('./base');
const {sleep} = require('../../util');

class StreamDeckInterface extends BaseDeviceInterface {
	static get CONFIRMATION_BLINK_INTERVAL() {
		return 50;
	}

	static get NUM_CONFIRMATION_BLINKS() {
		return 3;
	}

	constructor(devicePath) {
		super();

		const streamDeckDevice = new StreamDeck(devicePath);
		this._streamDeck = streamDeckDevice;

		streamDeckDevice.on('down', keyIndex => {
			this.pressKey(keyIndex);
		});

		streamDeckDevice.on('up', keyIndex => {
			this.releaseKey(keyIndex);
		});

		streamDeckDevice.on('error', error => {
			this.emit('error', error);
		});
	}

	destroy() {
		super.destroy();
		if (this._streamDeck) {
			this._streamDeck.removeAllListeners();
			this._streamDeck = null;
		}
	}

	async procedureCleared(keyIndex) {

	}

	async procedureReady(keyIndex) {

	}

	async procedureInvoked(keyIndex) {

	}

	async procedureCompleted(keyIndex, successful) {

	}
}

module.exports = StreamDeckInterface;
