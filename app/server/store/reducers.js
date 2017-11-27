'use strict';

// Ours
const actions = require('./actions');

const REDUCERS = {
	profile(state = {}, action) {
		switch (action.type) {
			case actions.SAVING_PROFILE:
				return {
					...state,
					saving: true
				};
			case actions.SAVE_PROFILE_SUCCESS:
				return {
					...state,
					saving: false,
					filePath: action.filePath,
					hasUnsavedChanges: false
				};
			case actions.SAVE_PROFILE_FAILURE:
				return {
					...state,
					saving: false,
					saveError: action.error
				};
			case actions.LOADING_PROFILE:
				return {
					...state,
					loading: true
				};
			case actions.LOAD_PROFILE_SUCCESS:
				return {
					...state,
					loading: false,
					filePath: action.filePath,
					hasUnsavedChanges: false
				};
			case actions.LOAD_PROFILE_FAILURE:
				return {
					...state,
					loading: false,
					loadError: action.error
				};
			default:
				return state;
		}
	},
	protocol(state = {}, action) {
		switch (action.type) {
			case actions.LOAD_PROFILE_SUCCESS:
				return action.loadedState.protocol;
			default:
				return state;
		}
	},
	detectedDevices(state = [], action) {
		switch (action.type) {
			case actions.UPDATE_DETECTED_DEVICES:
				return action.products;
			default:
				return state;
		}
	},
	selectedDevice(state = null, action) {
		switch (action.type) {
			case actions.SELECT_DEVICE: {
				const device = {...action};
				delete device.type;
				return device;
			}
			default:
				return state;
		}
	},
	keyStates(state = [], action) {
		switch (action.type) {
			case actions.SELECT_DEVICE:
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
	},
	keyConfigs(state = [], action) {
		switch (action.type) {
			case actions.LOAD_PROFILE_SUCCESS:
				return action.loadedState.keyConfigs;
			case actions.SELECT_DEVICE:
				return action.keyIds.map(keyId => {
					return {
						id: keyId,
						label: '',
						procedureName: undefined,
						procedureArgs: []
					};
				});
			case actions.ASSIGN_PROCEDURE_NAME:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						procedureName: action.procedureName,
						procedureArgs: []
					}
				});
			case actions.ASSIGN_PROCEDURE_ARGS:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						procedureArgs: action.procedureArgs
					}
				});
			case actions.DISABLE_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						disabled: true
					}
				});
			case actions.ENABLE_KEY:
				return updateObjectInArray(state, {
					id: action.keyId,
					newProps: {
						disabled: false
					}
				});
			default:
				return state;
		}
	},
	keyMerges(state = [], action) {
		switch (action.type) {
			case actions.LOAD_PROFILE_SUCCESS:
				return action.loadedState.keyMerges;
			case actions.MERGE_KEYS: {
				// Build the array of keyIds which will be contained in this merge.
				// To do this, we have to check to see if any of the provided keyIds are
				// already contained in existing merges.
				const keyIdsArray = action.keyIds.reduce((accumulator, currentValue) => {
					// Search for an existing merge for this child key.
					// If found, concat all keys of that merge.
					// Else, just push the lone key id.
					const foundMerge = state.find(merge => merge.rootKeyId === currentValue);
					return foundMerge ?
						accumulator.concat(foundMerge.keyIds) :
						accumulator.concat([currentValue]);
				}, []);
				const keyIdsSet = new Set(keyIdsArray);

				// If the provided root key is already in a merge, update that merge.
				const existingMergeIndex = state.findIndex(merge => merge.rootKeyId === action.rootKeyId);
				if (existingMergeIndex >= 0) {
					const existingMerge = state[existingMergeIndex];
					return updateObjectInArray(state, {
						idField: 'rootKeyId',
						id: action.rootKeyId,
						newProps: {
							keyIds: [
								...existingMerge.keyIds,
								...keyIdsSet
							]
						}
					});
				}

				// Else, create a new merge and append it to the end of the array.
				return [
					...state,
					{
						rootKeyId: action.rootKeyId,
						keyIds: Array.from(keyIdsSet)
					}
				];
			}
			case actions.SPLIT_KEY:
				return removeObjectFromArray(state, {
					idField: 'rootKeyId',
					id: action.rootKeyId
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

function removeObjectFromArray(array, {
	idField = 'id',
	id
}) {
	return array.filter(item => item[idField] !== id);
}

Object.freeze(REDUCERS);
module.exports = REDUCERS;
