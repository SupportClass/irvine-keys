'use strict';

// Packages

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var StreamDeck = require('elgato-stream-deck');

// Ours
var BaseDeviceInterface = require('./base');

var _require = require('../../util'),
    sleep = _require.sleep;

var StreamDeckInterface = function (_BaseDeviceInterface) {
	_inherits(StreamDeckInterface, _BaseDeviceInterface);

	_createClass(StreamDeckInterface, null, [{
		key: 'CONFIRMATION_BLINK_INTERVAL',
		get: function get() {
			return 50;
		}
	}, {
		key: 'NUM_CONFIRMATION_BLINKS',
		get: function get() {
			return 3;
		}
	}]);

	function StreamDeckInterface(devicePath) {
		_classCallCheck(this, StreamDeckInterface);

		var _this = _possibleConstructorReturn(this, (StreamDeckInterface.__proto__ || Object.getPrototypeOf(StreamDeckInterface)).call(this));

		var streamDeckDevice = new StreamDeck(devicePath);
		_this._streamDeck = streamDeckDevice;

		streamDeckDevice.on('down', function (keyIndex) {
			_this.pressKey(keyIndex);
		});

		streamDeckDevice.on('up', function (keyIndex) {
			_this.releaseKey(keyIndex);
		});

		streamDeckDevice.on('error', function (error) {
			_this.emit('error', error);
		});
		return _this;
	}

	_createClass(StreamDeckInterface, [{
		key: 'destroy',
		value: function destroy() {
			_get(StreamDeckInterface.prototype.__proto__ || Object.getPrototypeOf(StreamDeckInterface.prototype), 'destroy', this).call(this);
			if (this._streamDeck) {
				this._streamDeck.removeAllListeners();
				this._streamDeck = null;
			}
		}
	}, {
		key: 'procedureCleared',
		value: function () {
			var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(keyIndex) {
				return regeneratorRuntime.wrap(function _callee$(_context) {
					while (1) {
						switch (_context.prev = _context.next) {
							case 0:
							case 'end':
								return _context.stop();
						}
					}
				}, _callee, this);
			}));

			function procedureCleared(_x) {
				return _ref.apply(this, arguments);
			}

			return procedureCleared;
		}()
	}, {
		key: 'procedureReady',
		value: function () {
			var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(keyIndex) {
				return regeneratorRuntime.wrap(function _callee2$(_context2) {
					while (1) {
						switch (_context2.prev = _context2.next) {
							case 0:
							case 'end':
								return _context2.stop();
						}
					}
				}, _callee2, this);
			}));

			function procedureReady(_x2) {
				return _ref2.apply(this, arguments);
			}

			return procedureReady;
		}()
	}, {
		key: 'procedureInvoked',
		value: function () {
			var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(keyIndex) {
				return regeneratorRuntime.wrap(function _callee3$(_context3) {
					while (1) {
						switch (_context3.prev = _context3.next) {
							case 0:
							case 'end':
								return _context3.stop();
						}
					}
				}, _callee3, this);
			}));

			function procedureInvoked(_x3) {
				return _ref3.apply(this, arguments);
			}

			return procedureInvoked;
		}()
	}, {
		key: 'procedureCompleted',
		value: function () {
			var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(keyIndex, successful) {
				return regeneratorRuntime.wrap(function _callee4$(_context4) {
					while (1) {
						switch (_context4.prev = _context4.next) {
							case 0:
							case 'end':
								return _context4.stop();
						}
					}
				}, _callee4, this);
			}));

			function procedureCompleted(_x4, _x5) {
				return _ref4.apply(this, arguments);
			}

			return procedureCompleted;
		}()
	}]);

	return StreamDeckInterface;
}(BaseDeviceInterface);

module.exports = StreamDeckInterface;