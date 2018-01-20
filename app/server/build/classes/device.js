'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Device = function () {
	function Device(devicePath, deviceMetadata) {
		_classCallCheck(this, Device);

		this.metadata = deviceMetadata;
		this.interface = new deviceMetadata.InterfaceClass(devicePath);

		this.interface.on('error', function (error) {
			// TODO: figure out something better for this.
			console.error('Device interface error:', error);
		});
	}

	_createClass(Device, [{
		key: 'destroy',
		value: function destroy() {
			this.__destroyed = true;
			this.interface.destroy();
		}
	}]);

	return Device;
}();

module.exports = Device;