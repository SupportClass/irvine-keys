'use strict';

// Packages

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var grpc = require('grpc');
var objectPath = require('object-path');

// Ours
var protocolLib = require('./protocol-private');

var _require = require('../util'),
    references = _require.references;

// This method of building the types object may seem unusual,
// but it keeps things DRY while still enabling autocomplete.


var types = {
	LOAD_PROTOCOL: 'LOAD_PROTOCOL'
};
types = _extends({}, types, {
	LOAD_PROTOCOL_PENDING: types.LOAD_PROTOCOL + '_PENDING',
	LOAD_PROTOCOL_FULFILLED: types.LOAD_PROTOCOL + '_FULFILLED',
	LOAD_PROTOCOL_REJECTED: types.LOAD_PROTOCOL + '_REJECTED'
});

var actions = {
	loadProtocol: function loadProtocol(filePath) {
		return function (dispatch) {
			dispatch({
				type: types.LOAD_PROTOCOL,
				payload: protocolLib.loadFromDisk(filePath).then(function (_ref) {
					var pbjsRoot = _ref.pbjsRoot,
					    servicePath = _ref.servicePath,
					    serviceSummary = _ref.serviceSummary;

					var grpcRoot = grpc.loadObject(pbjsRoot);
					var Service = objectPath.get(grpcRoot, servicePath);
					references.activeRpcService = Service;

					// TODO: When either the protocol or the connection changes, re-connect.
					// Or, say that changing protocol will disconnect you from the current server.

					return {
						filePath: filePath,
						full: pbjsRoot,
						servicePath: servicePath,
						serviceSummary: serviceSummary
					};
				})
			});
		};
	}
};

function reducer() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case types.LOAD_PROTOCOL_PENDING:
			return _extends({}, state, {
				loading: true
			});
		case types.LOAD_PROTOCOL_FULFILLED:
			return _extends({}, state, action.payload, {
				loading: false
			});
		case types.LOAD_PROTOCOL_REJECTED:
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