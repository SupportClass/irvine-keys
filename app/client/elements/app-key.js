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

	updateGridSettings(x, y, width, height) {
		this.style.gridColumnStart = y;
		this.style.gridColumnEnd = y + height;
		this.style.gridRowStart = y;
		this.style.gridRowEnd = x + width;
	}
}

customElements.define(AppKey.is, AppKey);
