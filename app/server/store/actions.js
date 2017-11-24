'use strict';

// Packages
const Joi = require('joi');

// Ours
const SCHEMAS = require('./schemas');

const ACTIONS_AND_TYPES = {
	UPDATE_DETECTED_DEVICES: 'UPDATE_DETECTED_DEVICES',
	updateDetectedDevices(devices) {
		const {error: validationError} = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE));
		if (validationError) {
			throw validationError;
		}

		return {
			type: ACTIONS_AND_TYPES.UPDATE_DETECTED_DEVICES,
			devices
		};
	},

	INITIALIZE_KEY_STATES: 'INITIALIZE_KEY_STATES',
	initializeKeyStates(keyIds) {
		return {
			type: ACTIONS_AND_TYPES.INITIALIZE_KEY_STATES,
			keyIds
		};
	},

	PRESS_KEY: 'PRESS_KEY',
	pressKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.PRESS_KEY,
			keyId
		};
	},

	RELEASE_KEY: 'RELEASE_KEY',
	releaseKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.RELEASE_KEY,
			keyId
		};
	},

	SELECT_KEY: 'SELECT_KEY',
	selectKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.SELECT_KEY,
			keyId
		};
	},

	DESELECT_KEY: 'DESELECT_KEY',
	deselectKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.DESELECT_KEY,
			keyId
		};
	},

	BLOCK_KEY: 'BLOCK_KEY',
	blockKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.BLOCK_KEY,
			keyId
		};
	},

	PUT_KEY_ON_COOLDOWN: 'PUT_KEY_ON_COOLDOWN',
	putKeyOnCooldown(keyId, expirationTimestamp) {
		return {
			type: ACTIONS_AND_TYPES.PUT_KEY_ON_COOLDOWN,
			keyId,
			expirationTimestamp
		};
	},

	CLEAR_KEY_COOLDOWN: 'CLEAR_KEY_COOLDOWN',
	clearKeyCooldown(keyId) {
		return {
			type: ACTIONS_AND_TYPES.CLEAR_KEY_COOLDOWN,
			keyId
		};
	}
};

Object.freeze(ACTIONS_AND_TYPES);
module.exports = ACTIONS_AND_TYPES;
