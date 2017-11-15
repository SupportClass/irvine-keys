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
	}

	customElements.define(KeysApp.is, KeysApp);
})();
