/**
 * User interface
 */
class PathmarksUI {

	constructor() {
		this.CSS_INVALID = 'invalid';
	}

	checkInputRequiredState(inputField) {
		if (!inputField.attr('required')) {
			return;
		}
		if (!inputField.val()) {
			inputField.addClass(this.CSS_INVALID);
		} else {
			inputField.removeClass(this.CSS_INVALID);
		}
	}

	getValueFromInputAndCheckRequired(selector) {
		const inputField = jQuery(selector);
		this.checkInputRequiredState(inputField);
		return inputField.val();
	}

	static resetInputField(selector) {
		jQuery(selector).val('');
	}

}
