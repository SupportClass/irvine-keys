'use strict';

// Packages
const grpc = require('grpc');

class RpcClient {
	/**
	 * Constructs a new RpcClient with the specified protocol, and connects to the specified server.
	 * @param serverAddress {String} - The full address of the server to connect to.
	 * For gRPC, this is in a simple ip:port format.
	 * @param protoPath {String} - The path to the *.proto file on disk to load.
	 * If not provided, will attempt to use Reflection to automatically grab the protocol from the server.
	 * @param packageName {String} - The name of the package to use from the protocol.
	 * @param serviceName {String} - The name of the service to use from the protocol.
	 */
	constructor({serverAddress, protoPath, packageName, serviceName}) {
		const pkg = grpc.load(protoPath)[packageName];
		this._grpcClient = new pkg[serviceName](serverAddress, grpc.credentials.createInsecure());
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
