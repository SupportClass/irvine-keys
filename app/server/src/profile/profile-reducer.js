'use strict';

// Ours
const profileLib = require('./profile-private');

// This method of building the types object may seem unusual,
// but it keeps things DRY while still enabling autocomplete.
let types = {
	SAVE_PROFILE: 'SAVE_PROFILE',
	LOAD_PROFILE: 'LOAD_PROFILE'
};
types = {
	...types,
	SAVE_PROFILE_PENDING: `${types.SAVE_PROFILE}_PENDING`,
	SAVE_PROFILE_FULFILLED: `${types.SAVE_PROFILE}_FULFILLED`,
	SAVE_PROFILE_REJECTED: `${types.SAVE_PROFILE}_REJECTED`,
	LOAD_PROFILE_PENDING: `${types.LOAD_PROFILE}_PENDING`,
	LOAD_PROFILE_FULFILLED: `${types.LOAD_PROFILE}_FULFILLED`,
	LOAD_PROFILE_REJECTED: `${types.LOAD_PROFILE}_REJECTED`
};

const actions = {
	saveProfile(filePath) {
		return (dispatch, getState) => {
			dispatch({
				type: types.SAVE_PROFILE,
				payload: profileLib.save(filePath, getState())
			});
		};
	},
	loadProfile(filePath) {
		return function (dispatch, getState) {
			dispatch({
				type: types.SAVE_PROFILE,
				payload: profileLib.load(filePath, getState())
			});
		};
	}
};

function reducer(state = {}, action) {
	switch (action.type) {
		case types.SAVE_PROFILE_PENDING:
			return {
				...state,
				saving: true
			};
		case types.SAVE_PROFILE_FULFILLED:
			return {
				...state,
				saving: false,
				filePath: action.payload.filePath,
				hasUnsavedChanges: false
			};
		case types.SAVE_PROFILE_REJECTED:
			return {
				...state,
				saving: false
			};

		case types.LOAD_PROFILE_PENDING:
			return {
				...state,
				loading: true
			};
		case types.LOAD_PROFILE_FULFILLED:
			return {
				...state,
				loading: false,
				filePath: action.payload.filePath,
				hasUnsavedChanges: false
			};
		case types.LOAD_PROFILE_REJECTED:
			return {
				...state,
				loading: false
			};

		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = {types, actions, reducer};
