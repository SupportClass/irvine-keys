'use strict';

// Ours

var _require = require('../util'),
    updateObjectInArray = _require.updateObjectInArray;

var types = {
	PRESS_KEY: 'PRESS_KEY',
	RELEASE_KEY: 'RELEASE_KEY',
	SELECT_KEY: 'SELECT_KEY',
	DESELECT_KEY: 'DESELECT_KEY',
	BLOCK_KEY: 'BLOCK_KEY',
	PUT_KEY_ON_COOLDOWN: 'PUT_KEY_ON_COOLDOWN',
	CLEAR_KEY_COOLDOWN: 'CLEAR_KEY_COOLDOWN'
};

var actions = {
	pressKey: function pressKey(keyId) {
		return {
			type: types.PRESS_KEY,
			payload: keyId
		};
	},
	releaseKey: function releaseKey(keyId) {
		return {
			type: types.RELEASE_KEY,
			payload: keyId
		};
	},
	selectKey: function selectKey(keyId) {
		return {
			type: types.SELECT_KEY,
			payload: keyId
		};
	},
	deselectKey: function deselectKey(keyId) {
		return {
			type: types.DESELECT_KEY,
			payload: keyId
		};
	},
	blockKey: function blockKey(keyId) {
		return {
			type: types.BLOCK_KEY,
			payload: keyId
		};
	},
	putKeyOnCooldown: function putKeyOnCooldown(keyId, expirationTimestamp) {
		return {
			type: types.PUT_KEY_ON_COOLDOWN,
			payload: {
				keyId: keyId,
				expirationTimestamp: expirationTimestamp
			}
		};
	},
	clearKeyCooldown: function clearKeyCooldown(keyId) {
		return {
			type: types.CLEAR_KEY_COOLDOWN,
			payload: keyId
		};
	}
};

function reducer() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case types.SELECT_DEVICE:
			return action.keyIds.map(function (keyId) {
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
module.exports = { types: types, actions: actions, reducer: reducer };