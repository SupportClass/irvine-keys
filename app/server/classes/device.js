'use strict';

class Device {
	constructor(devicePath, deviceMetadata) {
		this.metadata = deviceMetadata;
		this.interface = new deviceMetadata.InterfaceClass(devicePath);

		this.interface.on('error', error => {
			// TODO: figure out something better for this.
			console.error('Device interface error:', error);
		});
	}

	destroy() {
		this.__destroyed = true;
		this.interface.destroy();
	}
}

module.exports = Device;
