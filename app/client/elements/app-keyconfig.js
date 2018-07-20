(function () {
	'use strict';

	const {ipcRenderer} = require('electron');

	/**
	 * @customElement
	 * @polymer
	 */
	class AppKeyconfig extends window.ReduxMixin(Polymer.Element) {
		static get is() {
			return 'app-keyconfig';
		}

		static get properties() {
			return {
				selectedKeyIds: Array,
				availableMethods: {
					statePath(state) {
						if (!state.protocol || !state.protocol.serviceSummary) {
							return [];
						}

						return state.protocol.serviceSummary.availableProcedures;
					}
				}
			};
		}

		raiseButton(e) {
			e.target.raised = true;
		}

		lowerButton(e) {
			e.target.raised = false;
		}

		ungroup() {
			console.log('ungroup method not yet implemented');
		}

		group() {
			this.dispatchEvent(new CustomEvent('group-keys', {
				detail: {
					keys: this.selectedKeyIds
				},
				bubbles: false,
				composed: false
			}));
		}

		_computeSelectedKeyLabel(selectedKeyIds) {
			if (!Array.isArray(selectedKeyIds) || selectedKeyIds.length === 0) {
				return 'None';
			}

			if (selectedKeyIds.length === 1) {
				return `Key #${selectedKeyIds[0] + 1}`;
			}

			return `${selectedKeyIds.length} Keys`;
		}

		_areMultipleKeysSelected(selectedKeys) {
			return selectedKeys && selectedKeys.length > 1;
		}

		_formatSelectedKeys(selectedKeys) {
			if (selectedKeys && selectedKeys.length > 0) {
				return selectedKeys.map(k => k.index + 1).join(', ');
			}

			return 'No keys selected.';
		}

		_isGroupRectangular(selectedKeyIds) {

		}
	}

	customElements.define(AppKeyconfig.is, AppKeyconfig);
})();
