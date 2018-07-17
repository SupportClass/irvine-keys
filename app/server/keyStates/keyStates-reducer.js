'use strict';

// Ours
const {updateObjectInArray} = require('../util');

const types = {
	PRESS_KEY: 'PRESS_KEY',
	RELEASE_KEY: 'RELEASE_KEY',
	SELECT_KEY: 'SELECT_KEY',
	DESELECT_KEY: 'DESELECT_KEY',
	BLOCK_KEY: 'BLOCK_KEY',
	PUT_KEY_ON_COOLDOWN: 'PUT_KEY_ON_COOLDOWN',
	CLEAR_KEY_COOLDOWN: 'CLEAR_KEY_COOLDOWN'
};

const actions = {
	pressKey(keyId) {
		return {
			type: types.PRESS_KEY,
			payload: keyId
		};
	},

	releaseKey(keyId) {
		return {
			type: types.RELEASE_KEY,
			payload: keyId
		};
	},

	selectKey(keyId) {
		return {
			type: types.SELECT_KEY,
			payload: keyId
		};
	},

	deselectKey(keyId) {
		return {
			type: types.DESELECT_KEY,
			payload: keyId
		};
	},

	blockKey(keyId) {
		return {
			type: types.BLOCK_KEY,
			payload: keyId
		};
	},

	putKeyOnCooldown(keyId, expirationTimestamp) {
		return {
			type: types.PUT_KEY_ON_COOLDOWN,
			payload: {
				keyId,
				expirationTimestamp
			}
		};
	},

	clearKeyCooldown(keyId) {
		return {
			type: types.CLEAR_KEY_COOLDOWN,
			payload: keyId
		};
	}
};

function reducer(state = {}, action) {
	switch (action.type) {
		case types.SELECT_DEVICE:
			return action.keyIds.map(keyId => {
				return {
					identifier: keyId,
					pressed: false,
					selected: false,
					blocked: false,
					coolingDown: false,
					cooldownExpirationTimestamp: null
				};
			});
		case types.PRESS_KEY:
			return updateObjectInArray(state, {
				id: action.payload,
				newProps: {
					pressed: true
				}
			});
		case types.RELEASE_KEY:
			return updateObjectInArray(state, {
				id: action.payload,
				newProps: {
					pressed: false
				}
			});
		case types.SELECT_KEY:
			return updateObjectInArray(state, {
				id: action.payload,
				newProps: {
					selected: true
				}
			});
		case types.DESELECT_KEY:
			return updateObjectInArray(state, {
				id: action.payload,
				newProps: {
					selected: true
				}
			});
		case types.BLOCK_KEY:
			return updateObjectInArray(state, {
				id: action.payload,
				newProps: {
					blocked: true,
					coolingDown: false,
					cooldownExpirationTimestamp: null
				}
			});
		case types.PUT_KEY_ON_COOLDOWN:
			return updateObjectInArray(state, {
				id: action.payload.keyId,
				newProps: {
					blocked: false,
					coolingDown: true,
					cooldownExpirationTimestamp: action.payload.expirationTimestamp
				}
			});
		case types.CLEAR_KEY_COOLDOWN:
			return updateObjectInArray(state, {
				id: action.payload,
				newProps: {
					blocked: false,
					coolingDown: false,
					cooldownExpirationTimestamp: null
				}
			});
		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = {types, actions, reducer};
