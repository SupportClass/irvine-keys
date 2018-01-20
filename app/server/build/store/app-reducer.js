'use strict';

// Packages

var Joi = require('joi');

var _require = require('redux'),
    combineReducers = _require.combineReducers;

// Ours


var profileTypes = require('../profile/profile-reducer').types;
var protocolTypes = require('../protocol/protocol-reducer').types;
var connectionTypes = require('../connection/connection-reducer').types;
var SCHEMAS = require('./schemas');

var types = {
	ACKNOWLEDGE_ERROR: 'ACKNOWLEDGE_ERROR',
	SET_DESIRED_DEVICE_TYPE: 'SET_DESIRED_DEVICE_TYPE',
	SELECT_DEVICE: 'SELECT_DEVICE',
	SET_SUPPORTED_DEVICES: 'SET_SUPPORTED_DEVICES',
	UPDATE_DETECTED_DEVICES: 'UPDATE_DETECTED_DEVICES'
};

var actions = {
	setDesiredDeviceType: function setDesiredDeviceType(vendorId, productId) {
		return {
			type: types.SET_DESIRED_DEVICE_TYPE,
			payload: {
				vendorId: vendorId,
				productId: productId
			}
		};
	},
	selectDevice: function selectDevice(deviceMetadata) {
		var _Joi$validate = Joi.validate(deviceMetadata, SCHEMAS.DEVICE),
		    validationError = _Joi$validate.error;

		if (validationError) {
			throw validationError;
		}

		return {
			type: types.SELECT_DEVICE,
			payload: deviceMetadata
		};
	},
	setSupportedDevices: function setSupportedDevices(devices) {
		var _Joi$validate2 = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE)),
		    validationError = _Joi$validate2.error;

		if (validationError) {
			throw validationError;
		}

		return {
			type: types.SET_SUPPORTED_DEVICES,
			payload: devices
		};
	},
	updateDetectedDevices: function updateDetectedDevices(devices) {
		var _Joi$validate3 = Joi.validate(devices, Joi.array().items(SCHEMAS.DEVICE)),
		    validationError = _Joi$validate3.error;

		if (validationError) {
			throw validationError;
		}

		return {
			type: types.UPDATE_DETECTED_DEVICES,
			payload: devices
		};
	}
};

var reducer = combineReducers({
	error: function error() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
		var action = arguments[1];

		switch (action.type) {
			case profileTypes.SAVE_PROFILE_REJECTED:
			case profileTypes.LOAD_PROFILE_REJECTED:
			case protocolTypes.LOAD_PROTOCOL_REJECTED:
			case connectionTypes.CONNECT_TO_SERVER_REJECTED:
				return action.payload;
			case types.ACKNOWLEDGE_ERROR:
				return false;
			default:
				return state;
		}
	},
	supportedDevices: function supportedDevices() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		var action = arguments[1];

		switch (action.type) {
			case types.SET_SUPPORTED_DEVICES:
				return action.payload;
			default:
				return state;
		}
	},
	desiredDeviceType: function desiredDeviceType() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
		var action = arguments[1];

		switch (action.type) {
			case types.SET_DESIRED_DEVICE_TYPE:
				return action.payload;
			default:
				return state;
		}
	},
	selectedDevice: function selectedDevice() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		var action = arguments[1];

		switch (action.type) {
			case types.SELECT_DEVICE:
				return action.payload;
			default:
				return state;
		}
	},
	detectedDevices: function detectedDevices() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
		var action = arguments[1];

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
module.exports = { types: types, actions: actions, reducer: reducer };