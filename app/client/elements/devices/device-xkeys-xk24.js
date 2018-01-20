/**
 * @customElement
 * @polymer
 */
class DeviceXkeysXK24 extends Polymer.Element {
	static get is() {
		return 'device-xkeys-xk24';
	}

	static get properties() {
		return {
			deviceName: {
				type: String,
				value: 'X-keys XK-24',
				reflectToAttribute: true
			}
		};
	}
}

customElements.define(DeviceXkeysXK24.is, DeviceXkeysXK24);
