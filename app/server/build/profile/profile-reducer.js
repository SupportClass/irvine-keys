'use strict';

// Ours

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var profileLib = require('./profile-private');

// This method of building the types object may seem unusual,
// but it keeps things DRY while still enabling autocomplete.
var types = {
	SAVE_PROFILE: 'SAVE_PROFILE',
	LOAD_PROFILE: 'LOAD_PROFILE'
};
types = _extends({}, types, {
	SAVE_PROFILE_PENDING: types.SAVE_PROFILE + '_PENDING',
	SAVE_PROFILE_FULFILLED: types.SAVE_PROFILE + '_FULFILLED',
	SAVE_PROFILE_REJECTED: types.SAVE_PROFILE + '_REJECTED',
	LOAD_PROFILE_PENDING: types.LOAD_PROFILE + '_PENDING',
	LOAD_PROFILE_FULFILLED: types.LOAD_PROFILE + '_FULFILLED',
	LOAD_PROFILE_REJECTED: types.LOAD_PROFILE + '_REJECTED'
});

var actions = {
	saveProfile: function saveProfile(filePath) {
		return function (dispatch, getState) {
			dispatch({
				type: types.SAVE_PROFILE,
				payload: profileLib.save(filePath, getState())
			});
		};
	},
	loadProfile: function loadProfile(filePath) {
		return function (dispatch, getState) {
			dispatch({
				type: types.SAVE_PROFILE,
				payload: profileLib.load(filePath, getState())
			});
		};
	}
};

function reducer() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case types.SAVE_PROFILE_PENDING:
			return _extends({}, state, {
				saving: true
			});
		case types.SAVE_PROFILE_FULFILLED:
			return _extends({}, state, {
				saving: false,
				filePath: action.payload.filePath,
				hasUnsavedChanges: false
			});
		case types.SAVE_PROFILE_REJECTED:
			return _extends({}, state, {
				saving: false
			});

		case types.LOAD_PROFILE_PENDING:
			return _extends({}, state, {
				loading: true
			});
		case types.LOAD_PROFILE_FULFILLED:
			return _extends({}, state, {
				loading: false,
				filePath: action.payload.filePath,
				hasUnsavedChanges: false
			});
		case types.LOAD_PROFILE_REJECTED:
			return _extends({}, state, {
				loading: false
			});

		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = { types: types, actions: actions, reducer: reducer };