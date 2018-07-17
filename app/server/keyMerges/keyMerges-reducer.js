'use strict';

// Ours
const {updateObjectInArray, removeObjectFromArray} = require('../util');
const profileTypes = require('../profile/profile-reducer').types;

const types = {
	MERGE_KEYS: 'MERGE_KEYS',
	SPLIT_KEY: 'SPLIT_KEY',
	ASSIGN_PROCEDURE_NAME: 'ASSIGN_PROCEDURE_NAME',
	ASSIGN_PROCEDURE_ARGS: 'ASSIGN_PROCEDURE_ARGS'
};

const actions = {
	mergeKeys(rootKeyId, keyIds) {
		return {
			type: types.MERGE_KEYS,
			payload: {
				rootKeyId,
				keyIds
			}
		};
	},
	splitKey(rootKeyId) {
		return {
			type: types.SPLIT_KEY,
			payload: rootKeyId
		};
	}
};

function reducer(state = {}, action) {
	switch (action.type) {
		case profileTypes.SAVE_PROFILE_FULFILLED:
			return action.payload.loadedState.keyMerges;
		case actions.MERGE_KEYS: {
			// Build the array of keyIds which will be contained in this merge.
			// To do this, we have to check to see if any of the provided keyIds are
			// already contained in existing merges.
			const keyIdsArray = action.payload.keyIds.reduce((accumulator, currentValue) => {
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
			const existingMergeIndex = state.findIndex(merge => merge.rootKeyId === action.payload.rootKeyId);
			if (existingMergeIndex >= 0) {
				const existingMerge = state[existingMergeIndex];
				return updateObjectInArray(state, {
					idField: 'rootKeyId',
					id: action.payload.rootKeyId,
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
					rootKeyId: action.payload.rootKeyId,
					keyIds: Array.from(keyIdsSet)
				}
			];
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
module.exports = {types, actions, reducer};
