'use strict';

// Packages
const XKeys = require('xkeys');

// Ours
const BaseDeviceInterface = require('./base');
const {sleep} = require('../../util');

class XkeysInterface extends BaseDeviceInterface {
	// The small black circular button on the rear of an X-keys device.
	static get PROGRAMMING_KEY_INDEX() {
		return 'PS';
	}

	static get CONFIRMATION_BLINK_INTERVAL() {
		return 50;
	}

	static get NUM_CONFIRMATION_BLINKS() {
		return 3;
	}

	constructor(devicePath) {
		super();

		const xkeysDevice = new XKeys(devicePath);
		this._streamDeck = xkeysDevice;

		xkeysDevice.setFrequency(33); // Set the flashing frequency (1 - 255).
		xkeysDevice.setAllBacklights(false, false); // Turn off all blue LEDs.
		xkeysDevice.setAllBacklights(false, true); // Turn off all red LEDs.

		xkeysDevice.on('down', keyIndex => {
			this.pressKey(keyIndex);
		});

		xkeysDevice.on('up', keyIndex => {
			this.releaseKey(keyIndex);
		});

		xkeysDevice.on('error', error => {
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
		this.setBlueLED(keyIndex, {on: false});
		this.setRedLED(keyIndex, {on: false});
	}

	async procedureReady(keyIndex) {
		this.setBlueLED(keyIndex, {on: true});
		this.setRedLED(keyIndex, {on: false});
	}

	async procedureInvoked(keyIndex) {
		this.setBlueLED(keyIndex, {on: true, flashing: true});
		this.setRedLED(keyIndex, {on: true, flashing: true});
	}

	async procedureCompleted(keyIndex, successful) {
		const colorBool = !successful; // If successful, color used will be blue. Else, red.
		this._streamDeck.setBacklight(keyIndex, true, colorBool); // Turn on the LED.
		this._streamDeck.setBacklight(keyIndex, false, !colorBool); // Turn off the opposite LED.

		/* eslint-disable no-await-in-loop */
		for (let i = 0; i < XkeysInterface.NUM_CONFIRMATION_BLINKS; i++) {
			await sleep(XkeysInterface.CONFIRMATION_BLINK_INTERVAL);
			this._streamDeck.setBacklight(keyIndex, false, colorBool);
			await sleep(XkeysInterface.CONFIRMATION_BLINK_INTERVAL);
			this._streamDeck.setBacklight(keyIndex, true, colorBool);
		}
		/* eslint-enable no-await-in-loop */

		await sleep(XkeysInterface.CONFIRMATION_BLINK_INTERVAL);
	}

	setBlueLED(keyIndex, {on, flashing}) {
		this._streamDeck.setBacklight(keyIndex, on, false, flashing);
	}

	setRedLED(keyIndex, {on, flashing}) {
		this._streamDeck.setBacklight(keyIndex, on, true, flashing);
	}
}

module.exports = XkeysInterface;
