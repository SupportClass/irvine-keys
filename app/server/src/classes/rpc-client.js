'use strict';

// Packages
const grpc = require('grpc');
const objectPath = require('object-path');

class RpcClient {
	/**
	 * Constructs a new RpcClient with the specified protocol, and connects to the specified server.
	 * @param serverAddress {String} - The full address of the server to connect to.
	 * For gRPC, this is in a simple ip:port format.
	 * @param protoPath {String|Object} - The path to the *.proto file on disk to load.
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
	 * [Copied from https://grpc.io/grpc/node/grpc.Client.html#waitForReady]
	 * Wait up to 30 seconds for the client to be ready.
	 * The callback will be called when the client has successfully connected to the server,
	 * and it will be called with an error if the attempt to connect to the server has
	 * unrecoverablly failed or if the deadline expires.
	 *
	 * This function will make the channel start connecting if it has not already done so.
	 */
	waitForReady() {
		return new Promise((resolve, reject) => {
			if (!this._grpcClient) {
				return reject(new Error('Client has not yet been initialized.'));
			}

			this._grpcClient.waitForReady(Date.now() + 30000, error => {
				if (error) {
					reject(error);
				} else {
					resolve();
				}
			});
		});
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
