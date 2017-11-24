/**
 * @customElement
 * @polymer
 */
class AppDevice extends Polymer.Element {
	static get is() {
		return 'app-device';
	}

	static get properties() {
		return {
			availableDevices: {
				type: Array,
				value() {
					return [{
						name: 'xkeys-xk24',
						prettyName: 'X-keys XK-24',
						foo: 'hi'
					}, {
						name: 'xkeys-xk80',
						prettyName: 'X-keys XK-80',
						foo: 'test'
					}];
				}
			},
			selectedDevice: String
		};
	}

	ready() {
		this._forwardPropertyNotification = this._forwardPropertyNotification.bind(this);
		super.ready();

		this.$.deviceSelector.selectedItem = this.availableDevices[1]; // TODO: remove this
	}

	_updateBindings() {
		const newDevice = this.$.pages.selectedItem;
		if (newDevice === this._currentlySelectedDevice) {
			return;
		}

		const oldDevice = this._currentlySelectedDevice;
		if (oldDevice) {
			oldDevice.removeEventListener('selected-keys-changed', this._forwardPropertyNotification);
		}

		if (newDevice) {
			newDevice.addEventListener('selected-keys-changed', this._forwardPropertyNotification);
		}

		this._currentlySelectedDevice = newDevice;
	}

	_forwardPropertyNotification(e) {
		console.log('_forwardPropertyNotification:', e);
	}
}

customElements.define(AppDevice.is, AppDevice);
