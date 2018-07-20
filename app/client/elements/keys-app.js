(function () {
	'use strict';

	// Packages
	const {ipcRenderer} = require('electron');

	// Ours
	const store = require('../server/store');
	const appReducer = require('../server/store/app-reducer').actions;
	console.log(store.getState());

	Polymer.setPassiveTouchGestures(true); // Added in Polymer v2.1.0

	/**
	 * @customElement
	 * @polymer
	 */
	class KeysApp extends window.ReduxMixin(Polymer.Element) {
		static get is() {
			return 'keys-app';
		}

		static get properties() {
			return {
				selectedKeys: Array,
				error: {
					type: String,
					statePath: 'error'
				}
			};
		}

		ready() {
			super.ready();
			ipcRenderer.send('init');
		}

		ackError() {
			store.dispatch(appReducer.acknowledgeError(null, null));
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
