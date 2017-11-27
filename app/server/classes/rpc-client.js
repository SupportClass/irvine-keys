'use strict';

// Packages
const grpc = require('grpc');
const objectPath = require('object-path');

class RpcClient {
	/**
	 * Constructs a new RpcClient with the specified protocol, and connects to the specified server.
	 * @param serverAddress {String} - The full address of the server to connect to.
	 * For gRPC, this is in a simple ip:port format.
	 * @param protoPath {String} - The path to the *.proto file on disk to load.
	 * If not provided, will attempt to use Reflection to automatically grab the protocol from the server.
	 * @param servicePath {String|Array<String>} - The object path to the service to use from the protocol.
	 */
	constructor({serverAddress, proto, servicePath}) {
		let root;
		if (typeof proto === 'string') {
			root = grpc.load(proto);
		} else if (typeof proto === 'object') {
			root = grpc.loadObject(proto);
		} else {
			throw new Error('proto must be a string filepath or a ProtoBuf.js object');
		}

		const Service = objectPath.get(root, servicePath);
		if (!Service) {
			throw new Error('Service not found in protocol');
		}
		this._grpcClient = new Service(serverAddress, grpc.credentials.createInsecure());
	}

	/**
	 * Calls a remote procedure and returns a promise for that call.
	 * @param name {String} - The name of the remote procedure to call.
	 * @param [args=[]] {Array} - Arguments to provide to the procedure call.
	 * @returns {Promise} - Resolves with the response, rejects with any errors.
	 */
	callProcedure(name, args = []) {
		return new Promise((resolve, reject) => {
			this._grpcClient[name](...args, (error, ...responseArgs) => {
				if (error) {
					reject(error);
					return;
				}

				resolve(...responseArgs);
			});
		});
	}
}

module.exports = RpcClient;
