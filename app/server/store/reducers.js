'use strict';

// Ours
const actions = require('./actions');

const REDUCERS = {
	detectedDevices(state = [], action) {
		switch (action.type) {
			case actions.UPDATE_DETECTED_DEVICES:
				return action.devices;
			default:
				return state;
		}
	},
	keyStates(state = [], action) {
		switch (action.type) {
			case actions.INITIALIZE_KEY_STATES:
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
			case actions.PRESS_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						pressed: true
					}
				});
			case actions.RELEASE_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						pressed: false
					}
				});
			case actions.SELECT_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						selected: true
					}
				});
			case actions.DESELECT_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						selected: true
					}
				});
			case actions.BLOCK_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						blocked: true,
						coolingDown: false,
						cooldownExpirationTimestamp: null
					}
				});
			case actions.PUT_KEY_ON_COOLDOWN:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						blocked: false,
						coolingDown: true,
						cooldownExpirationTimestamp: action.expirationTimestamp
					}
				});
			case actions.CLEAR_KEY_COOLDOWN:
				return updateObjectInArray(state, {
					id: action.keyId,
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
};

function updateObjectInArray(array, {
	idField = 'id',
	id,
	newProps
}) {
	const valueIndex = array.findIndex(value => value[idField] === id);
	if (valueIndex < 0) {
		return array;
	}

	const newArray = array.slice(0);
	newArray[valueIndex] = {
		...array[valueIndex],
		...newProps
	};

	return newArray;
}

Object.freeze(REDUCERS);
module.exports = REDUCERS;
