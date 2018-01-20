'use strict';

// Packages

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var grpc = require('grpc');
var objectPath = require('object-path');

var RpcClient = function () {
	/**
  * Constructs a new RpcClient with the specified protocol, and connects to the specified server.
  * @param serverAddress {String} - The full address of the server to connect to.
  * For gRPC, this is in a simple ip:port format.
  * @param protoPath {String|Object} - The path to the *.proto file on disk to load.
  * If not provided, will attempt to use Reflection to automatically grab the protocol from the server.
  * @param servicePath {String|Array<String>} - The object path to the service to use from the protocol.
  */
	function RpcClient(_ref) {
		var serverAddress = _ref.serverAddress,
		    proto = _ref.proto,
		    servicePath = _ref.servicePath;

		_classCallCheck(this, RpcClient);

		var root = void 0;
		if (typeof proto === 'string') {
			root = grpc.load(proto);
		} else if ((typeof proto === 'undefined' ? 'undefined' : _typeof(proto)) === 'object') {
			root = grpc.loadObject(proto);
		} else {
			throw new Error('proto must be a string filepath or a ProtoBuf.js object');
		}

		var Service = objectPath.get(root, servicePath);
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


	_createClass(RpcClient, [{
		key: 'waitForReady',
		value: function waitForReady() {
			var _this = this;

			return new Promise(function (resolve, reject) {
				if (!_this._grpcClient) {
					return reject(new Error('Client has not yet been initialized.'));
				}

				_this._grpcClient.waitForReady(Date.now() + 30000, function (error) {
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

	}, {
		key: 'callProcedure',
		value: function callProcedure(name) {
			var _this2 = this;

			var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

			return new Promise(function (resolve, reject) {
				var _grpcClient;

				(_grpcClient = _this2._grpcClient)[name].apply(_grpcClient, _toConsumableArray(args).concat([function (error) {
					for (var _len = arguments.length, responseArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
						responseArgs[_key - 1] = arguments[_key];
					}

					if (error) {
						reject(error);
						return;
					}

					resolve.apply(undefined, responseArgs);
				}]));
			});
		}
	}]);

	return RpcClient;
}();

module.exports = RpcClient;