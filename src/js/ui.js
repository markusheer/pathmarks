/**
 * User interface
 */
class PathmarksUI {

	static checkInputRequiredState(inputField) {
		if (!inputField.attr('required')) {
			return;
		}
		if (!inputField.val()) {
			inputField.addClass('invalid');
		} else {
			inputField.removeClass('invalid');
		}
	}

	static getValueFromInputAndCheckRequired(selector) {
		const inputField = $(selector);
		PathmarksUI.checkInputRequiredState(inputField);
		return inputField.val();
	}

	static resetInputField(selector) {
		$(selector).val('');
	}

}
