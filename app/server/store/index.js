'use strict';

// Packages
const {createStore, compose, combineReducers} = require('redux');
const {electronEnhancer} = require('redux-electron-store');

// Ours
const reducers = require('./reducers');

let store; // eslint-disable-line prefer-const

/* eslint-disable function-paren-newline */
const enhancer = compose(
	// Must be placed after any enhancers which dispatch
	// their own actions such as redux-thunk or redux-saga
	electronEnhancer({
		// Necessary for synched actions to pass through all enhancers
		dispatchProxy: a => store.dispatch(a)
	})
);
/* eslint-enable function-paren-newline */

const rootReducer = combineReducers(reducers);

const initialState = {
	// @Implemented
	profile: {},

	// @Implemented
	selectedDevice: null,

	// @Persistent
	// TODO: Implement
	protocol: {},

	// @Persistent
	// @Implemented
	keyMerges: [],

	// @Persistent
	// @Implemented
	keyConfigs: [],

	// @Implemented
	supportedDevices: [],

	// @Implemented
	detectedDevices: [],

	// @Implemented
	keyStates: [],

	// TODO: Implement
	updater: {},

	// TODO: Implement
	recentConnections: [],

	connection: {

	}
};

store = createStore(rootReducer, initialState, enhancer);

store.subscribe(() => {

});

module.exports = store;
