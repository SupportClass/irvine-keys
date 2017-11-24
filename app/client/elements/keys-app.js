(function () {
	'use strict';

	const {ipcRenderer} = require('electron');
	Polymer.setPassiveTouchGestures(true); // Added in Polymer v2.1.0

	/**
	 * @customElement
	 * @polymer
	 */
	class KeysApp extends Polymer.Element {
		static get is() {
			return 'keys-app';
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
				selectedKeys: Array
			};
		}

		ready() {
			super.ready();
			ipcRenderer.send('init');
		}

		_groupKeys(e) {
			return;
			const keys = e.detail.keys;
			const firstIndex = keys[0].index;
			const lastIndex = keys[keys.length - 1].index;
			const mergedKey = {};
			this.keys.splice(firstIndex, keys.length, mergedKey);
		}
	}

	customElements.define(KeysApp.is, KeysApp);
})();
