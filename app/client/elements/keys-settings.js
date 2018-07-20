(function () {
	'use strict';

	// Packages
	const {ipcRenderer} = require('electron');

	// Ours
	const store = require('../server/store');
	const appReducer = require('../server/store/app-reducer').actions;
	const connectionReducer = require('../server/connection/connection-reducer').actions;

	/**
	 * @customElement
	 * @polymer
	 */
	class KeysSettings extends window.ReduxMixin(Polymer.Element) {
		static get is() {
			return 'keys-settings';
		}

		static get properties() {
			return {
				recentConnections: {
					type: Array,
					value: []
				},
				url: String,
				connection: {
					type: Object,
					statePath: 'connection'
				}
			};
		}

		static get observers() {
			return [
				'_updateSelectedRecentConnection(url)'
			];
		}

		submit() {
			ipcRenderer.sendSync('connectionWindow:submit', this.url);
		}

		cancel() {
			ipcRenderer.send('connectionWindow:close');
		}

		formatTimestamp(timestamp) {
			return new Date(timestamp).toLocaleString({
				year: 'numeric',
				month: 'numeric',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				second: '2-digit'
			});
		}

		_updateSelectedRecentConnection(url) {
			this.$.recentConnections.selected = this.recentConnections.findIndex(rc => {
				return rc.url === url;
			});
		}

		_handleInputKeyDown(e) {
			// Enter key
			if (e.which === 13) {
				this.submit();
			}
		}

		_calcRecentConnectionsHidden(recentConnections) {
			return !recentConnections || recentConnections.length <= 0;
		}

		_selectedRecentConnectionChanged(e) {
			const selectedRecentConnection = this.recentConnections[e.detail.value];
			if (selectedRecentConnection) {
				this.url = selectedRecentConnection.url;
			}
		}
	}

	customElements.define(KeysSettings.is, KeysSettings);
})();
