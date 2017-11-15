(function () {
	'use strict';

	const {ipcRenderer} = require('electron');

	/**
	 * @customElement
	 * @polymer
	 */
	class AppKey extends Polymer.Element {
		static get is() {
			return 'app-key';
		}

		static get properties() {
			return {
				index: Number,
				pressed: {
					type: Boolean,
					reflectToAttribute: true
				},
				gridX: Number,
				gridY: Number,
				gridWidth: Number,
				gridHeight: Number
			};
		}

		static get observers() {
			return [
				'updateGridSettings(gridX, gridY, gridWidth, gridHeight)'
			];
		}

		ready() {
			super.ready();
			ipcRenderer.on('xkeys:pressedKeys', (event, pressedKeys) => {
				this.pressed = pressedKeys.includes(this.index);
			});
		}

		updateGridSettings(x, y, width, height) {
			this.style.gridColumnStart = x;
			this.style.gridColumnEnd = x + width;
			this.style.gridRowStart = y;
			this.style.gridRowEnd = y + height;
		}

		_calcDisplayIndex(index) {
			return index + 1;
		}
	}

	customElements.define(AppKey.is, AppKey);
})();
