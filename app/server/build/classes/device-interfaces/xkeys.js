'use strict';

// Packages

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var XKeys = require('xkeys');

// Ours
var BaseDeviceInterface = require('./base');

var _require = require('../../util'),
    sleep = _require.sleep;

var XkeysInterface = function (_BaseDeviceInterface) {
	_inherits(XkeysInterface, _BaseDeviceInterface);

	_createClass(XkeysInterface, null, [{
		key: 'PROGRAMMING_KEY_ID',

		// The small black circular button on the rear of an X-keys device.
		get: function get() {
			return 'PS';
		}
	}, {
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

	function XkeysInterface(devicePath) {
		_classCallCheck(this, XkeysInterface);

		var _this = _possibleConstructorReturn(this, (XkeysInterface.__proto__ || Object.getPrototypeOf(XkeysInterface)).call(this));

		var xkeysDevice = new XKeys(devicePath);
		_this._streamDeck = xkeysDevice;

		xkeysDevice.setFrequency(33); // Set the flashing frequency (1 - 255).
		xkeysDevice.setAllBacklights(false, false); // Turn off all blue LEDs.
		xkeysDevice.setAllBacklights(false, true); // Turn off all red LEDs.

		xkeysDevice.on('down', function (keyIndex) {
			_this.pressKey(keyIndex);
		});

		xkeysDevice.on('up', function (keyIndex) {
			_this.releaseKey(keyIndex);
		});

		xkeysDevice.on('error', function (error) {
			_this.emit('error', error);
		});
		return _this;
	}

	_createClass(XkeysInterface, [{
		key: 'destroy',
		value: function destroy() {
			_get(XkeysInterface.prototype.__proto__ || Object.getPrototypeOf(XkeysInterface.prototype), 'destroy', this).call(this);
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
								this.setBlueLED(keyIndex, { on: false });
								this.setRedLED(keyIndex, { on: false });

							case 2:
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
								this.setBlueLED(keyIndex, { on: true });
								this.setRedLED(keyIndex, { on: false });

							case 2:
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
								this.setBlueLED(keyIndex, { on: true, flashing: true });
								this.setRedLED(keyIndex, { on: true, flashing: true });

							case 2:
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
				var colorBool, i;
				return regeneratorRuntime.wrap(function _callee4$(_context4) {
					while (1) {
						switch (_context4.prev = _context4.next) {
							case 0:
								colorBool = !successful; // If successful, color used will be blue. Else, red.

								this._streamDeck.setBacklight(keyIndex, true, colorBool); // Turn on the LED.
								this._streamDeck.setBacklight(keyIndex, false, !colorBool); // Turn off the opposite LED.

								/* eslint-disable no-await-in-loop */
								i = 0;

							case 4:
								if (!(i < XkeysInterface.NUM_CONFIRMATION_BLINKS)) {
									_context4.next = 14;
									break;
								}

								_context4.next = 7;
								return sleep(XkeysInterface.CONFIRMATION_BLINK_INTERVAL);

							case 7:
								this._streamDeck.setBacklight(keyIndex, false, colorBool);
								_context4.next = 10;
								return sleep(XkeysInterface.CONFIRMATION_BLINK_INTERVAL);

							case 10:
								this._streamDeck.setBacklight(keyIndex, true, colorBool);

							case 11:
								i++;
								_context4.next = 4;
								break;

							case 14:
								_context4.next = 16;
								return sleep(XkeysInterface.CONFIRMATION_BLINK_INTERVAL);

							case 16:
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
	}, {
		key: 'setBlueLED',
		value: function setBlueLED(keyIndex, _ref5) {
			var on = _ref5.on,
			    flashing = _ref5.flashing;

			this._streamDeck.setBacklight(keyIndex, on, false, flashing);
		}
	}, {
		key: 'setRedLED',
		value: function setRedLED(keyIndex, _ref6) {
			var on = _ref6.on,
			    flashing = _ref6.flashing;

			this._streamDeck.setBacklight(keyIndex, on, true, flashing);
		}
	}]);

	return XkeysInterface;
}(BaseDeviceInterface);

module.exports = XkeysInterface;