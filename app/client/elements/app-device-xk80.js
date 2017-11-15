/**
 * @customElement
 * @polymer
 */
class AppDeviceXK80 extends Polymer.Element {
	static get is() {
		return 'app-device-xk80';
	}

	static get properties() {
		return {
			keys: {
				type: Array,
				value() {
					const keyArray = [];
					const NUM_ROWS = 8;
					const NUM_COLUMNS = 10;
					for (let c = 0; c < NUM_COLUMNS; c++) {
						for (let r = 0; r < NUM_ROWS; r++) {
							keyArray.push({
								index: keyArray.length,
								gridX: c + 1,
								gridY: r + 1,
								gridWidth: 1,
								gridHeight: 1
							});
						}
					}
					return keyArray;
				}
			},
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
		return selectedKeyIndicies.map(keyIndex => keys[keyIndex]);
	}
}

customElements.define(AppDeviceXK80.is, AppDeviceXK80);
