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
			},
			keys: {
				type: Array,
				value() {
					const keyArray = [];
					const NUM_ROWS = 6;
					const NUM_COLUMNS = 4;
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
			}
		};
	}
}

customElements.define(DeviceXkeysXK24.is, DeviceXkeysXK24);
