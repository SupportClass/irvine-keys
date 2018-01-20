(function () {
	// Ours
	const store = require('../server/build/store');
	const appReducer = require('../server/build/store/app-reducer').actions;
	const ReduxMixin = PolymerRedux(store);

	/**
	 * @customElement
	 * @polymer
	 */
	class AppDevice extends ReduxMixin(Polymer.Element) {
		static get is() {
			return 'app-device';
		}

		static get properties() {
			return {
				supportedDevices: {
					type: Array,
					statePath: 'supportedDevices'
				},
				desiredDeviceType: {
					type: Object,
					statePath: 'desiredDeviceType'
				},
				availableDevices: Array,
				selectedDevice: String
			};
		}

		ready() {
			this._forwardPropertyNotification = this._forwardPropertyNotification.bind(this);
			super.ready();
		}

		_calcSelectedDevice(supportedDevices, desiredDeviceType) {
			const ret = supportedDevices.find(supportedDevice => {
				return supportedDevice.vendorId === desiredDeviceType.vendorId &&
					supportedDevice.productId === desiredDeviceType.productId;
			});

			this.$.pages.selected = ret.productName;
			return ret;
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

		_handleDeviceSelectorChange(e) {
			if (e.detail.value) {
				store.dispatch(appReducer.setDesiredDeviceType(e.detail.value.vendorId, e.detail.value.productId));
			} else {
				store.dispatch(appReducer.setDesiredDeviceType(null, null));
			}
		}
	}

	customElements.define(AppDevice.is, AppDevice);
})();
