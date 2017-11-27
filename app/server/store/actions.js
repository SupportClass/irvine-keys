'use strict';

// Packages
const grpc = require('grpc');
const Joi = require('joi');
const objectPath = require('object-path');

// Ours
const profile = require('../profile');
const protocol = require('../protocol');
const SCHEMAS = require('./schemas');
const {references} = require('../util');

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

	SAVING_PROFILE: 'SAVING_PROFILE',
	savingProfile(filePath) {
		return {
			type: ACTIONS_AND_TYPES.SAVING_PROFILE,
			filePath
		};
	},

	SAVE_PROFILE_SUCCESS: 'SAVE_PROFILE_SUCCESS',
	savingProfileSuccess(filePath) {
		return {
			type: ACTIONS_AND_TYPES.SAVE_PROFILE_SUCCESS,
			filePath
		};
	},

	SAVE_PROFILE_FAILURE: 'SAVE_PROFILE_FAILURE',
	saveProfileFailure(filePath, error) {
		return {
			type: ACTIONS_AND_TYPES.SAVE_PROFILE_FAILURE,
			filePath,
			error
		};
	},

	saveProfile(filePath) {
		return function (dispatch, getState) {
			dispatch(ACTIONS_AND_TYPES.savingProfile(filePath));
			return profile.save(filePath, getState()).then(
				() => dispatch(ACTIONS_AND_TYPES.savingProfileSuccess(filePath)),
				error => dispatch(ACTIONS_AND_TYPES.saveProfileFailure(filePath, error))
			);
		};
	},

	LOADING_PROFILE: 'LOADING_PROFILE',
	loadingProfile(filePath) {
		return {
			type: ACTIONS_AND_TYPES.LOADING_PROFILE,
			filePath
		};
	},

	LOAD_PROFILE_SUCCESS: 'LOAD_PROFILE_SUCCESS',
	loadProfileSuccess(filePath, loadedState) {
		return {
			type: ACTIONS_AND_TYPES.LOAD_PROFILE_SUCCESS,
			filePath,
			loadedState
		};
	},

	LOAD_PROFILE_FAILURE: 'LOAD_PROFILE_FAILURE',
	loadProfileFailure(filePath, error) {
		return {
			type: ACTIONS_AND_TYPES.LOAD_PROFILE_FAILURE,
			filePath,
			error
		};
	},

	loadProfile(filePath) {
		return function (dispatch, getState) {
			dispatch(ACTIONS_AND_TYPES.loadingProfile(filePath));
			return profile.load(filePath, getState()).then(
				loadedState => dispatch(ACTIONS_AND_TYPES.loadProfileSuccess(filePath, loadedState)),
				error => dispatch(ACTIONS_AND_TYPES.loadProfileFailure(filePath, error))
			);
		};
	},

	LOAD_PROTOCOL_SUCCESS: 'LOAD_PROTOCOL_SUCCESS',
	loadProtocolSuccess(filePath, serviceSummary) {
		return {
			type: ACTIONS_AND_TYPES.LOAD_PROTOCOL_SUCCESS,
			filePath,
			serviceSummary
		};
	},

	LOAD_PROTOCOL_FAILURE: 'LOAD_PROTOCOL_FAILURE',
	loadProtocolFailure(filePath, error) {
		return {
			type: ACTIONS_AND_TYPES.LOAD_PROTOCOL_FAILURE,
			filePath,
			error
		};
	},

	loadProtocol(filePath) {
		return function (dispatch) {
			dispatch(ACTIONS_AND_TYPES.loadingProtocol(filePath));
			return protocol.loadFromDisk(filePath).then(
				({pbjsRoot, serviceSummary}) => {
					const grpcRoot = grpc.loadObject(pbjsRoot);
					const Service = objectPath.get(grpcRoot, pbjsRoot);
					references.activeRpcClient = new Service();
					dispatch(ACTIONS_AND_TYPES.loadProtocolSuccess(filePath, serviceSummary));
				},
				error => dispatch(ACTIONS_AND_TYPES.loadProtocolFailure(filePath, error))
			);
		};
	},

	CONNECTING_TO_SERVER: 'CONNECTING_TO_SERVER',
	connectingToServer(address) {
		return {
			type: ACTIONS_AND_TYPES.CONNECTING_TO_SERVER,
			address
		};
	},

	SERVER_CONNECTION_FAILURE: 'SERVER_CONNECTION_FAILURE',
	serverConnectionFailed(address, reason) {
		return {
			type: ACTIONS_AND_TYPES.SERVER_CONNECTION_FAILURE,
			address,
			reason
		};
	},

	SERVER_CONNECTION_SUCCESS: 'SERVER_CONNECTION_SUCCESS',
	serverConnectionSuccess(address) {
		return {
			type: ACTIONS_AND_TYPES.SERVER_CONNECTION_SUCCESS,
			address
		};
	},

	SERVER_CONNECTION_LOST: 'SERVER_CONNECTION_LOST',
	serverConnectionLost() {},

	connectToServer(address) {
		return function (dispatch, getState) {
			dispatch(ACTIONS_AND_TYPES.loadingProfile(filePath));
			return profile.load(filePath, getState()).then(
				loadedState => dispatch(ACTIONS_AND_TYPES.loadProfileSuccess(filePath, loadedState)),
				error => dispatch(ACTIONS_AND_TYPES.loadProfileFailure(filePath, error))
			);
		};
	}
};

Object.freeze(ACTIONS_AND_TYPES);
module.exports = ACTIONS_AND_TYPES;
