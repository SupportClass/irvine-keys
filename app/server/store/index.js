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
	profileName: 'My Profile',

	selectedDevice: {
		manufacturer: 'X-keys',
		model: 'XK-80'
	},

	supportedDevices: [{
		manufacturer: 'X-keys',
		model: 'XK-24',
		vendorId: 1523,
		productId: [1029, 1028, 1027, 1249],
		columns: 4,
		rows: 6
	}, {
		manufacturer: 'X-keys',
		model: 'XK-80',
		vendorId: 1523,
		productId: [1237, 1238, 1089, 1090, 1091, 1250],
		columns: 10,
		rows: 8
	}],

	// @Implemented
	detectedDevices: [{
		path: '',
		vendorId: '',
		productId: ''
	}],

	// @Implemented
	keyStates: [{ // Transient information about keys which we do not persist.
		identifier: 0,
		pressed: false,
		selected: false,
		blocked: false,
		coolingDown: false,
		cooldownExpirationTimestamp: 1511281488860
	}],

	keyConfigs: [{ // Persistent information about keys which we need to be able to save and recall.
		identifier: 0,
		label: 'Cut',
		gridX: 0,
		gridY: 0,
		gridWidth: 1,
		gridHeight: 2,
		procedureName: 'transition',
		procedureArgs: ['Cut']
	}],

	selectedProtocol: 'myProtocol.proto',
	availableProcedures: [{
		name: 'transition',
		args: [{
			name: 'transition_name',
			type: String
		}, {
			name: 'transition_duration',
			type: Number
		}, {
			name: 'scene_name',
			type: String
		}]
	}]
};

store = createStore(rootReducer, initialState, enhancer);
module.exports = store;
