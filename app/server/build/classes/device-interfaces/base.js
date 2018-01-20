'use strict';

// Native

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EventEmitter = require('events');

var BaseDeviceInterface = function (_EventEmitter) {
	_inherits(BaseDeviceInterface, _EventEmitter);

	_createClass(BaseDeviceInterface, null, [{
		key: 'PROGRAMMING_KEY_ID',
		get: function get() {
			return 'programming';
		}
	}]);

	function BaseDeviceInterface() {
		_classCallCheck(this, BaseDeviceInterface);

		var _this = _possibleConstructorReturn(this, (BaseDeviceInterface.__proto__ || Object.getPrototypeOf(BaseDeviceInterface)).call(this));

		_this.__pressedKeys = new Set();
		return _this;
	}

	_createClass(BaseDeviceInterface, [{
		key: 'destroy',
		value: function destroy() {
			this.__destroyed = true;
			this.removeAllListeners();
		}
	}, {
		key: 'pressKey',
		value: function pressKey(keyIndex) {
			if (this.__pressedKeys.has(keyIndex)) {
				return;
			}

			if (keyIndex === this.constructor.PROGRAMMING_KEY_ID) {
				keyIndex = BaseDeviceInterface.PROGRAMMING_KEY_ID;
			}

			this.__pressedKeys.add(keyIndex);
			this.emit('keyPressed', keyIndex);
		}
	}, {
		key: 'releaseKey',
		value: function releaseKey(keyIndex) {
			if (!this.__pressedKeys.has(keyIndex)) {
				return;
			}

			if (keyIndex === this.constructor.PROGRAMMING_KEY_ID) {
				keyIndex = BaseDeviceInterface.PROGRAMMING_KEY_ID;
			}

			this.__pressedKeys.delete(keyIndex);
			this.emit('keyReleased', keyIndex);
		}
	}, {
		key: 'getPressedKeys',
		value: function getPressedKeys() {
			return Array.from(this.__pressedKeys);
		}

		/* eslint-disable lines-between-class-members */
		// Stubs

	}, {
		key: 'procedureCleared',
		value: function procedureCleared() {}
	}, {
		key: 'procedureReady',
		value: function procedureReady() {}
	}, {
		key: 'procedureInvoked',
		value: function procedureInvoked() {}
	}, {
		key: 'procedureCompleted',
		value: function procedureCompleted() {}
		/* eslint-enable lines-between-class-members */

	}]);

	return BaseDeviceInterface;
}(EventEmitter);

module.exports = BaseDeviceInterface;