'use strict';

// Ours
const RpcClient = require('../classes/rpc-client');
const {references} = require('../util');
const log = require('electron-log');

// This method of building the types object may seem unusual,
// but it keeps things DRY while still enabling autocomplete.
let types = {
	CONNECT_TO_SERVER: 'CONNECT_TO_SERVER'
};
types = {
	...types,
	CONNECT_TO_SERVER_PENDING: `${types.CONNECT_TO_SERVER}_PENDING`,
	CONNECT_TO_SERVER_FULFILLED: `${types.CONNECT_TO_SERVER}_FULFILLED`,
	CONNECT_TO_SERVER_REJECTED: `${types.CONNECT_TO_SERVER}_REJECTED`
};

const actions = {
	connectToServer(serverAddress) {
		return {
			type: types.CONNECT_TO_SERVER,
			async payload() {
				log.debug(`Connecting to gRPC server at "${serverAddress}"...`);
				const client = new RpcClient({
					serverAddress,
					Service: references.activeRpcService
				});
				await client.waitForReady();
				log.debug(`Connection success.`);
				references.activeRpcClient = client;
				return client;
			}
		};
	}
};

function reducer(state = {}, action) {
	switch (action.type) {
		case types.CONNECT_TO_SERVER_PENDING:
			return {
				...state,
				connecting: true
			};
		case types.CONNECT_TO_SERVER_FULFILLED:
			return {
				...state,
				connecting: false,
				address: action.payload.address
			};
		case types.CONNECT_TO_SERVER_REJECTED:
			return {
				...state,
				connecting: false
			};
		default:
			return state;
	}
}

Object.freeze(types);
Object.freeze(actions);
module.exports = {types, actions, reducer};
