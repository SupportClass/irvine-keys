'use strict';

// Packages
const Joi = require('joi');
const {combineReducers} = require('redux');

// Ours
const profileTypes = require('./profile/profile-reducer').types;
const protocolTypes = require('./profile/profile-reducer').types;
const SCHEMAS = require('./store/schemas');

const types = {
	ACKNOWLEDGE_ERROR: 'ACKNOWLEDGE_ERROR',
	SELECT_DEVICE: 'SELECT_DEVICE',
	SET_SUPPORTED_DEVICES: 'SET_SUPPORTED_DEVICES',
	UPDATE_DETECTED_DEVICES: 'UPDATE_DETECTED_DEVICES',
};

const actions = {
	selectDevice(deviceMetadata) {
		const {error: validationError} = Joi.validate(deviceMetadata, SCHEMAS.DEVICE);
		if (validationError) {
			throw validationError;
		}

		return {
			type: types.SELECT_DEVICE,
			payload: deviceMetadata
		};
	},
	setSupportedDevices(devices) {
		const {error: validationError} = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE));
		if (validationError) {
			throw validationError;
		}

		return {
			type: types.SET_SUPPORTED_DEVICES,
			payload: devices
		};
	},
	updateDetectedDevices(devices) {
		const {error: validationError} = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE));
		if (validationError) {
			throw validationError;
		}

		return {
			type: types.UPDATE_DETECTED_DEVICES,
			payload: devices
		};
	}
};

const reducer = combineReducers({
	error(state = false, action) {
		switch (action.type) {
			case profileTypes.SAVE_PROFILE_REJECTED:
			case profileTypes.LOAD_PROFILE_REJECTED:
			case protocolTypes.LOAD_PROTOCOL_REJECTED:
				return action.payload;
			case types.ACKNOWLEDGE_ERROR:
				return false;
			default:
				return state;
		}
	},
	selectedDevice(state = null, action) {
		switch (action.type) {
			case types.SELECT_DEVICE: {
				return action.payload;
			}
			default:
				return state;
		}
	},
	detectedDevices(state = [], action) {
		switch (action.type) {
			case types.UPDATE_DETECTED_DEVICES:
				return action.payload;
			default:
				return state;
		}
	}
});

Object.freeze(types);
Object.freeze(actions);
module.exports = {types, actions, reducer};
