'use strict';

// Packages
const Joi = require('joi');

// Ours
const SCHEMAS = require('./schemas');

const ACTIONS_AND_TYPES = {
	SET_SUPPORTED_DEVICES: 'SET_SUPPORTED_DEVICES',
	setSupportedDevices(devices) {
		const {error: validationError} = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE));
		if (validationError) {
			throw validationError;
		}

		return {
			type: ACTIONS_AND_TYPES.SET_SUPPORTED_DEVICES,
			products: devices
		};
	},

	UPDATE_DETECTED_DEVICES: 'UPDATE_DETECTED_DEVICES',
	updateDetectedDevices(devices) {
		const {error: validationError} = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE));
		if (validationError) {
			throw validationError;
		}

		return {
			type: ACTIONS_AND_TYPES.UPDATE_DETECTED_DEVICES,
			products: devices
		};
	},

	SELECT_DEVICE: 'SELECT_DEVICE',
	selectDevice(deviceMetadata) {
		const {error: validationError} = Joi.validate(deviceMetadata, SCHEMAS.DEVICE);
		if (validationError) {
			throw validationError;
		}

		return {
			type: ACTIONS_AND_TYPES.SELECT_DEVICE,
			...deviceMetadata
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
	},

	ASSIGN_PROCEDURE_NAME: 'ASSIGN_PROCEDURE_NAME',
	assignProcedureName(keyId, procedureName) {
		return {
			type: ACTIONS_AND_TYPES.ASSIGN_PROCEDURE_NAME,
			keyId,
			procedureName
		};
	},

	ASSIGN_PROCEDURE_ARGS: 'ASSIGN_PROCEDURE_ARGS',
	assignProcedureArgs(keyId, procedureArgs) {
		return {
			type: ACTIONS_AND_TYPES.ASSIGN_PROCEDURE_NAME,
			keyId,
			procedureArgs
		};
	},

	DISABLE_KEY: 'DISABLE_KEY',
	disableKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.DISABLE_KEY,
			keyId
		};
	},

	ENABLE_KEY: 'ENABLE_KEY',
	enableKey(keyId) {
		return {
			type: ACTIONS_AND_TYPES.DISABLE_KEY,
			keyId
		};
	},

	MERGE_KEYS: 'MERGE_KEYS',
	mergeKeys(rootKeyId, keyIds) {
		return {
			type: ACTIONS_AND_TYPES.MERGE_KEYS,
			rootKeyId,
			keyIds
		};
	},

	SPLIT_KEY: 'SPLIT_KEY',
	splitKey(rootKeyId) {
		return {
			type: ACTIONS_AND_TYPES.SPLIT_KEY,
			rootKeyId
		};
	},

	SAVE_PROFILE: 'SAVE_PROFILE',
	saveProfile(filePath) {
		// TODO: Implement save method here.
		return {
			type: ACTIONS_AND_TYPES.SAVE_PROFILE,
			filePath
		};
	},

	LOAD_PROFILE: 'LOAD_PROFILE',
	loadProfile(filePath) {
		// TODO: Implement load method here.
		return {
			type: ACTIONS_AND_TYPES.LOAD_PROFILE,
			filePath
		};
	}
};

Object.freeze(ACTIONS_AND_TYPES);
module.exports = ACTIONS_AND_TYPES;
