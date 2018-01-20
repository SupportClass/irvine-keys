/**
 * @customElement
 * @polymer
 */
class DeviceXkeysXK80 extends Polymer.Element {
	static get is() {
		return 'device-xkeys-xk80';
	}

	static get properties() {
		return {
			deviceName: {
				type: String,
				value: 'X-keys XK-80',
				reflectToAttribute: true
			},
			rowSize: {
				type: Number,
				value: 10
			},
			columnSize: {
				type: Number,
				value: 8
			},
			keys: Array,
			selectedKeyIndicies: Array,
			selectedKeys: {
				type: Array,
				computed: '_computeSelectedKeys(keys.*, selectedKeyIndicies.*)',
				notify: true
			}
		};
	}

	_computeSelectedKeys() {
		const keys = this.keys;
		const selectedKeyIndicies = this.selectedKeyIndicies;
		if (!keys || !selectedKeyIndicies) {
			return [];
		}
		return selectedKeyIndicies
			.sort((a, b) => a - b)
			.map(keyIndex => keys[keyIndex]);
	}
}

customElements.define(DeviceXkeysXK80.is, DeviceXkeysXK80);
