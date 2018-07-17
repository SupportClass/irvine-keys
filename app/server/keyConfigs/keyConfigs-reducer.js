'use strict';

// Ours
const {updateObjectInArray} = require('../util');
const profileTypes = require('../profile/profile-reducer').types;
const appTypes = require('../store/app-types');

const types = {
	DISABLE_KEY: 'DISABLE_KEY',
	ENABLE_KEY: 'ENABLE_KEY'
};

const actions = {
	disableKey(keyId) {
		return {
			type: types.DISABLE_KEY,
			payload: keyId
		};
	},
	enableKey(keyId) {
		return {
			type: types.DISABLE_KEY,
			payload: keyId
		};
	},
	assignProcedureName(keyId, procedureName) {
		return {
			type: types.ASSIGN_PROCEDURE_NAME,
			payload: {
				keyId,
				procedureName
			}
		};
	},
	assignProcedureArgs(keyId, procedureArgs) {
		return {
			type: types.ASSIGN_PROCEDURE_NAME,
			payload: {
				keyId,
				procedureArgs
			}
		};
	}
};

function reducer(state = {}, action) {
	switch (action.type) {
		case profileTypes.SAVE_PROFILE_FULFILLED:
			return action.payload.loadedState.keyConfigs;
		case appTypes.SELECT_DEVICE:
			console.log('keyConfigs-reducer | SELECT_DEVICE:', action);
			return action.payload.keyIds.map(keyId => {
				return {
					id: keyId,
					label: '',
					procedureName: undefined,
					procedureArgs: []
				};
			});
		case actions.ASSIGN_PROCEDURE_NAME:
			return updateObjectInArray(state, {
				id: action.payload.keyId,
				newProps: {
					procedureName: action.payload.procedureName,
					procedureArgs: []
				}
			});
		case actions.ASSIGN_PROCEDURE_ARGS:
			return updateObjectInArray(state, {
				id: action.payload.keyId,
				newProps: {
					procedureArgs: action.payload.procedureArgs
				}
			});
		case actions.DISABLE_KEY:
			return updateObjectInArray(state, {
				id: action.payload.keyId,
				newProps: {
					disabled: true
				}
			});
		case actions.ENABLE_KEY:
			return updateObjectInArray(state, {
				id: action.payload.keyId,
				newProps: {
					disabled: false
				}
			});
		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = {types, actions, reducer};
