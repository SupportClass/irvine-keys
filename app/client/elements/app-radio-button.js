/**
 * @customElement
 * @polymer
 */
class AppRadioButton extends Polymer.Element {
	static get is() {
		return 'app-radio-button';
	}

	static get properties() {
		return {
			checked: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			}
		};
	}
}

customElements.define(AppRadioButton.is, AppRadioButton);
