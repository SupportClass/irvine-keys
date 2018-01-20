'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CLOSE_NORMAL = 1000; // The error code used when a WebSocket is deliberately closed.
var MIN_BACKOFF = 300; // The shortest allowed backoff (in milliseconds).
var MAX_BACKOFF = 10000; // The longest allowed backoff (in milliseconds).
var BACKOFF_INTERVAL = 500; // The amount to increase each successive backoff by (in milliseconds).

// Native
var EventEmitter = require('events');

// Packages
var WebSocket = require('ws');

var WebSocketClient = function (_EventEmitter) {
	_inherits(WebSocketClient, _EventEmitter);

	function WebSocketClient(url) {
		_classCallCheck(this, WebSocketClient);

		var _this = _possibleConstructorReturn(this, (WebSocketClient.__proto__ || Object.getPrototypeOf(WebSocketClient)).call(this));

		_this._reconnecting = false;
		_this._attemptNumber = 0;
		_this.open(url);
		return _this;
	}

	_createClass(WebSocketClient, [{
		key: 'open',
		value: function open(url) {
			var _instance,
			    _this2 = this,
			    _instance2;

			if (this.instance) {
				this.instance.removeAllListeners();
			}

			this.url = url;
			this.instance = new WebSocket(this.url);

			(_instance = this.instance).on.apply(_instance, ['open'].concat(_toConsumableArray(function (args) {
				if (_this2._reconnecting) {
					_this2.emit('reconnect', _this2._attemptNumber);
					_this2._reconnecting = false;
					_this2._attemptNumber = 0;
				}
				_this2.emit.apply(_this2, ['open'].concat(_toConsumableArray(args)));
				safeCall.apply(undefined, [_this2.onopen].concat(_toConsumableArray(args)));
			})));

			(_instance2 = this.instance).on.apply(_instance2, ['message'].concat(_toConsumableArray(function (args) {
				_this2.emit.apply(_this2, ['message'].concat(_toConsumableArray(args)));
				safeCall.apply(undefined, [_this2.onmessage].concat(_toConsumableArray(args)));
			})));

			this.instance.on('close', function (code, reason) {
				switch (code) {
					case CLOSE_NORMAL:
						// Intentional closure, not an error.
						_this2.emit('close', code, reason);
						break;
					default:
						_this2.reconnect(reason);
						break;
				}
				safeCall(_this2.onclose, code, reason);
			});

			this.instance.on('error', function (error) {
				switch (error.code) {
					case 'ECONNREFUSED':
						_this2.reconnect(error.code);
						break;
					default:
						_this2.emit('error', error);
						safeCall(_this2.onerror, error);
						break;
				}
			});

			this.instance.on('ping', function (data) {
				_this2.emit('ping', data);
			});

			this.instance.on('pong', function (data) {
				_this2.emit('pong', data);
			});
		}
	}, {
		key: 'close',
		value: function close() {
			this.cancelReconnect();
			return this.instance.close(CLOSE_NORMAL, 'closed by user');
		}
	}, {
		key: 'reconnect',
		value: function reconnect(reason) {
			var _this3 = this;

			if (this._reconnecting || this._reconnectTimeout) {
				// Don't attempt to reconnect if a reconnection attempt is already in-progress.
				return;
			}

			if (reason === undefined) {
				reason = 'no reason provided';
			}

			if (typeof reason !== 'string') {
				throw new Error('reason must be a string, got a(n) ' + (typeof reason === 'undefined' ? 'undefined' : _typeof(reason)));
			}

			this._reconnecting = true;
			this.emit('disconnect', reason);
			this.instance.removeAllListeners();
			this._reconnectTimeout = setTimeout(function () {
				_this3._reconnectTimeout = null;
				_this3.open(_this3.url);
			}, WebSocketClient.calcBackoffDuration(++this._attemptNumber));
		}
	}, {
		key: 'cancelReconnect',
		value: function cancelReconnect() {
			clearTimeout(this._reconnectTimeout);
			this._reconnectTimeout = null;
			this._reconnecting = false;
		}
	}, {
		key: 'connected',
		get: function get() {
			return this.instance.readyState === WebSocket.OPEN;
		}
	}, {
		key: 'send',
		get: function get() {
			return this.instance.send;
		}
	}], [{
		key: 'calcBackoffDuration',
		value: function calcBackoffDuration(attemptNumber) {
			return Math.min(MIN_BACKOFF + (attemptNumber - 1) * BACKOFF_INTERVAL, MAX_BACKOFF);
		}
	}]);

	return WebSocketClient;
}(EventEmitter);

function safeCall(fn) {
	if (typeof fn === 'function') {
		for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
			args[_key - 1] = arguments[_key];
		}

		fn.apply(undefined, args);
	}
}

module.exports = WebSocketClient;