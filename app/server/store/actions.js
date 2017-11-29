'use strict';

// Ours
const profile = require('../profile/profile');

const ACTIONS_AND_TYPES = {
	CONNECTING_TO_SERVER: 'CONNECTING_TO_SERVER',
	connectingToServer(address) {
		return {
			type: ACTIONS_AND_TYPES.CONNECTING_TO_SERVER,
			payload: address
		};
	},

	SERVER_CONNECTION_FAILURE: 'SERVER_CONNECTION_FAILURE',
	serverConnectionFailed(address, error) {
		return {
			type: ACTIONS_AND_TYPES.SERVER_CONNECTION_FAILURE,
			error: true,
			payload: error,
			meta: {
				address
			}
		};
	},

	SERVER_CONNECTION_SUCCESS: 'SERVER_CONNECTION_SUCCESS',
	serverConnectionSuccess(address) {
		return {
			type: ACTIONS_AND_TYPES.SERVER_CONNECTION_SUCCESS,
			payload: address
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
