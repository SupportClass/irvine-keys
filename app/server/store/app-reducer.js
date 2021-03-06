'use strict';

// Packages
const Joi = require('joi');
const {combineReducers} = require('redux');

// Ours
const connectionTypes = require('../connection/connection-reducer').types;
const profileTypes = require('../profile/profile-reducer').types;
const protocolTypes = require('../protocol/protocol-reducer').types;
const SCHEMAS = require('./schemas');
const types = require('./app-types');

const actions = {
	openDeviceError(error) {
		return {
			type: types.OPEN_DEVICE_ERROR,
			payload: error && error.message
		};
	},
	acknowledgeError() {
		return {
			type: types.ACKNOWLEDGE_ERROR
		};
	},
	setDesiredDeviceType(vendorId, productId, usage) {
		return {
			type: types.SET_DESIRED_DEVICE_TYPE,
			payload: {
				vendorId,
				productId,
				usage
			}
		};
	},
	selectDevice(deviceMetadata) {
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
			case connectionTypes.CONNECT_TO_SERVER_REJECTED:
			case types.OPEN_DEVICE_ERROR:
				return action.payload;
			case types.ACKNOWLEDGE_ERROR:
				return false;
			default:
				return state;
		}
	},
	supportedDevices(state = [], action) {
		switch (action.type) {
			case types.SET_SUPPORTED_DEVICES:
				return action.payload;
			default:
				return state;
		}
	},
	desiredDeviceType(state = {}, action) {
		switch (action.type) {
			case types.SET_DESIRED_DEVICE_TYPE:
				return action.payload;
			default:
				return state;
		}
	},
	selectedDevice(state = null, action) {
		switch (action.type) {
			case types.SELECT_DEVICE:
				return action.payload;
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
	},

	connection: require('../connection/connection-reducer').reducer,
	keyConfigs: require('../keyConfigs/keyConfigs-reducer').reducer,
	keyMerges: require('../keyMerges/keyMerges-reducer').reducer,
	keyStates: require('../keyStates/keyStates-reducer').reducer,
	profile: require('../profile/profile-reducer').reducer,
	protocol: require('../protocol/protocol-reducer').reducer
});

Object.freeze(types);
Object.freeze(actions);
module.exports = {types, actions, reducer};
