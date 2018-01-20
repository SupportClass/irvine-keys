'use strict';

// Native

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');

// Packages
var equal = require('fast-deep-equal');
var log = require('electron-log');
var WebSocket = require('./reconnecting-websocket');

var _require = require('electron'),
    ipcMain = _require.ipcMain;

var _require2 = require('./util'),
    sendToMainWindow = _require2.sendToMainWindow;

var RemoteClient = function (_EventEmitter) {
	_inherits(RemoteClient, _EventEmitter);

	function RemoteClient() {
		_classCallCheck(this, RemoteClient);

		var _this = _possibleConstructorReturn(this, (RemoteClient.__proto__ || Object.getPrototypeOf(RemoteClient)).call(this));

		_this.socket = null;
		_this.availableMethods = [];
		return _this;
	}

	_createClass(RemoteClient, [{
		key: 'connect',
		value: function connect(url) {
			var _this2 = this;

			if (this.socket) {
				// Close any existing socket before attempting to connect a new one.
				this.disconnect();
			}

			log.debug('Attempting to connect to:', url);
			this.socket = new WebSocket();

			// WebSocket events.
			this.socket.on('connect', function () {
				log.debug('Connected.');
			});

			this.socket.on('reconnect', function (attemptNumber) {
				log.debug('Reconnected on attempt %d.', attemptNumber);
			});

			this.socket.on('disconnect', function (reason) {
				log.debug('Disconnected, reason:', reason);
			});

			this.socket.on('close', function (code, reason) {
				log.debug('Intentionally closed (code: %s, reason: %s)', code, reason);
			});

			this.socket.on('error', function (error) {
				log.error('Socket error:', error);
			});

			this.socket.on('pong', function (latency) {
				log.debug(latency, latency.toString());
				sendToMainWindow('remote:pong', latency);
			});

			// Protocol events.
			this.socket.on('availableMethods', function (availableMethods) {
				if (!equal(availableMethods, _this2.availableMethods)) {
					_this2.availableMethods = availableMethods;
					log.debug('availableMethodsChanged:', _this2.availableMethods);
					_this2.emit('availableMethodsChanged', _this2.availableMethods);
				}
			});

			this.socket.on('availableScenes', function (availableScenes) {
				if (!equal(availableScenes, _this2.availableScenes)) {
					_this2.availableScenes = availableScenes;
					log.debug('availableScenesChanged:', _this2.availableScenes);
					_this2.emit('availableScenesChanged', _this2.availableScenes);
				}
			});

			return this.socket.open(url);
		}
	}, {
		key: 'disconnect',
		value: function disconnect() {
			if (!this.socket) {
				return;
			}

			this.socket.close();
			this.socket.removeAllListeners();
			this.socket = null;
		}
	}, {
		key: 'emit',
		value: function emit(eventName) {
			var _get2;

			for (var _len = arguments.length, restArgs = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
				restArgs[_key - 1] = arguments[_key];
			}

			(_get2 = _get(RemoteClient.prototype.__proto__ || Object.getPrototypeOf(RemoteClient.prototype), 'emit', this)).call.apply(_get2, [this, eventName].concat(restArgs));
			sendToMainWindow.apply(undefined, ['remote:' + eventName].concat(restArgs));
		}
	}, {
		key: 'invokeMethod',
		value: function invokeMethod(methodName) {
			var _this3 = this;

			return new Promise(function (resolve, reject) {
				if (!_this3.socket || !_this3.socket.connected) {
					return reject(new Error('Socket is not connected'));
				}

				if (!_this3.availableMethods.includes(methodName)) {
					return reject(new Error('Method "' + methodName + '" is not one of the availableMethods'));
				}

				_this3.socket.send('invokeMethod', methodName, function (error, response) {
					if (error) {
						return reject(error);
					}

					resolve(response);
				});
			});
		}
	}, {
		key: 'previewScene',
		value: function previewScene(sceneName) {
			var _this4 = this;

			return new Promise(function (resolve, reject) {
				if (!_this4.socket || !_this4.socket.connected) {
					return reject(new Error('Socket is not connected'));
				}

				if (!_this4.availableScenes.includes(sceneName)) {
					return reject(new Error('Scene "' + sceneName + '" is not one of the availableScenes'));
				}

				_this4.socket.send('previewScene', sceneName, function (error, response) {
					if (error) {
						return reject(error);
					}

					resolve(response);
				});
			});
		}
	}]);

	return RemoteClient;
}(EventEmitter);

var singletonInstance = new RemoteClient();
ipcMain.on('remote:getAvailableMethodsSync', function (event) {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableMethods;
});
ipcMain.on('remote:getAvailableScenesSync', function (event) {
	/* istanbul ignore next: this is annoying to test and it's simple enough that we know it just works */
	event.returnValue = singletonInstance.availableScenes;
});

module.exports = singletonInstance;
module.exports.__NodeCGClass__ = RemoteClient; // Used for testing.