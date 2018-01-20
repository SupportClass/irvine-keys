'use strict';

// Ours

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var _require = require('../util'),
    updateObjectInArray = _require.updateObjectInArray,
    removeObjectFromArray = _require.removeObjectFromArray;

var profileTypes = require('../profile/profile-reducer').types;

var types = {
	MERGE_KEYS: 'MERGE_KEYS',
	SPLIT_KEY: 'SPLIT_KEY',
	ASSIGN_PROCEDURE_NAME: 'ASSIGN_PROCEDURE_NAME',
	ASSIGN_PROCEDURE_ARGS: 'ASSIGN_PROCEDURE_ARGS'
};

var actions = {
	mergeKeys: function mergeKeys(rootKeyId, keyIds) {
		return {
			type: types.MERGE_KEYS,
			payload: {
				rootKeyId: rootKeyId,
				keyIds: keyIds
			}
		};
	},
	splitKey: function splitKey(rootKeyId) {
		return {
			type: types.SPLIT_KEY,
			payload: rootKeyId
		};
	},
	assignProcedureName: function assignProcedureName(keyId, procedureName) {
		return {
			type: types.ASSIGN_PROCEDURE_NAME,
			payload: {
				keyId: keyId,
				procedureName: procedureName
			}
		};
	},
	assignProcedureArgs: function assignProcedureArgs(keyId, procedureArgs) {
		return {
			type: types.ASSIGN_PROCEDURE_NAME,
			payload: {
				keyId: keyId,
				procedureArgs: procedureArgs
			}
		};
	}
};

function reducer() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case profileTypes.SAVE_PROFILE_FULFILLED:
			return action.payload.loadedState.keyMerges;
		case actions.MERGE_KEYS:
			{
				// Build the array of keyIds which will be contained in this merge.
				// To do this, we have to check to see if any of the provided keyIds are
				// already contained in existing merges.
				var keyIdsArray = action.payload.keyIds.reduce(function (accumulator, currentValue) {
					// Search for an existing merge for this child key.
					// If found, concat all keys of that merge.
					// Else, just push the lone key id.
					var foundMerge = state.find(function (merge) {
						return merge.rootKeyId === currentValue;
					});
					return foundMerge ? accumulator.concat(foundMerge.keyIds) : accumulator.concat([currentValue]);
				}, []);
				var keyIdsSet = new Set(keyIdsArray);

				// If the provided root key is already in a merge, update that merge.
				var existingMergeIndex = state.findIndex(function (merge) {
					return merge.rootKeyId === action.payload.rootKeyId;
				});
				if (existingMergeIndex >= 0) {
					var existingMerge = state[existingMergeIndex];
					return updateObjectInArray(state, {
						idField: 'rootKeyId',
						id: action.payload.rootKeyId,
						newProps: {
							keyIds: [].concat(_toConsumableArray(existingMerge.keyIds), _toConsumableArray(keyIdsSet))
						}
					});
				}

				// Else, create a new merge and append it to the end of the array.
				return [].concat(_toConsumableArray(state), [{
					rootKeyId: action.payload.rootKeyId,
					keyIds: Array.from(keyIdsSet)
				}]);
			}
		case actions.SPLIT_KEY:
			return removeObjectFromArray(state, {
				idField: 'rootKeyId',
				id: action.payload
			});
		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = { types: types, actions: actions, reducer: reducer };