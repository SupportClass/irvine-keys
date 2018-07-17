'use strict';

// Packages
const {createStore, compose, applyMiddleware} = require('redux');
const {electronEnhancer} = require('redux-electron-store');
const promiseMiddleware = require('redux-promise-middleware').default;

let store; // eslint-disable-line prefer-const

const enhancer = compose(
	// applyMiddleware(promiseMiddleware),
	// Must be placed after any enhancers which dispatch
	// their own actions such as redux-thunk or redux-saga
	electronEnhancer({
		// Necessary for synched actions to pass through all enhancers
		dispatchProxy: a => store.dispatch(a)
	})
);
const rootReducer = require('./app-reducer').reducer;

const initialState = {
	// @Persistent
	// TODO: Implement
	protocol: {},

	// @Implemented
	detectedDevices: [],

	// TODO: Implement
	updater: {},

	// TODO: Implement
	recentConnections: [],

	connection: {}
};

store = createStore(rootReducer, {}, enhancer);

module.exports = store;
