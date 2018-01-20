'use strict';

// Packages

var _require = require('redux'),
    createStore = _require.createStore,
    compose = _require.compose,
    applyMiddleware = _require.applyMiddleware;

var _require2 = require('redux-electron-store'),
    electronEnhancer = _require2.electronEnhancer;

var promiseMiddleware = require('redux-promise-middleware').default;

var store = void 0; // eslint-disable-line prefer-const

var enhancer = compose(
// applyMiddleware(promiseMiddleware),
// Must be placed after any enhancers which dispatch
// their own actions such as redux-thunk or redux-saga
electronEnhancer({
	// Necessary for synched actions to pass through all enhancers
	dispatchProxy: function dispatchProxy(a) {
		return store.dispatch(a);
	}
}));
var rootReducer = require('./app-reducer').reducer;

var initialState = {
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