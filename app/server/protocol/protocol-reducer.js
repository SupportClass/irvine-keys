'use strict';

// Packages
const grpc = require('grpc');
const objectPath = require('object-path');

// Ours
const protocolLib = require('./protocol-private');
const {references} = require('../util');

// This method of building the types object may seem unusual,
// but it keeps things DRY while still enabling autocomplete.
let types = {
	LOAD_PROTOCOL: 'LOAD_PROTOCOL'
};
types = {
	...types,
	LOAD_PROTOCOL_PENDING: `${types.LOAD_PROTOCOL}_PENDING`,
	LOAD_PROTOCOL_FULFILLED: `${types.LOAD_PROTOCOL}_FULFILLED`,
	LOAD_PROTOCOL_REJECTED: `${types.LOAD_PROTOCOL}_REJECTED`
};

const actions = {
	loadProtocol(filePath) {
		return {
			type: types.LOAD_PROTOCOL,
			async payload() {
				const {pbjsRoot, servicePath, serviceSummary} = await protocolLib.loadFromDisk(filePath);
				console.log(pbjsRoot, servicePath, serviceSummary);
				const grpcRoot = grpc.loadObject(pbjsRoot);
				const Service = objectPath.get(grpcRoot, servicePath);
				references.activeRpcService = Service;

				// TODO: When either the protocol or the connection changes, re-connect.
				// Or, say that changing protocol will disconnect you from the current server.

				return {
					filePath,
					full: pbjsRoot,
					servicePath,
					serviceSummary
				};
			}
		};
	}
};

function reducer(state = {}, action) {
	switch (action.type) {
		case types.LOAD_PROTOCOL_PENDING:
			return {
				...state,
				loading: true
			};
		case types.LOAD_PROTOCOL_FULFILLED:
			return {
				...state,
				...action.payload,
				loading: false
			};
		case types.LOAD_PROTOCOL_REJECTED:
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
