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
