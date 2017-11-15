/**
 * @customElement
 * @polymer
 */
class AppConnectionStatus extends Polymer.Element {
	static get is() {
		return 'app-connection-status';
	}

	static get properties() {
		return {
			status: {
				type: String,
				value: 'disconnected',
				reflectToAttribute: true
			}
		};
	}
}

customElements.define(AppConnectionStatus.is, AppConnectionStatus);
