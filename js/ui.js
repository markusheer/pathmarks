/**
 * User interface
 */
Pathmarks.UI = Class.extend({

    init: function() {
        this.CSS_INVALID = "invalid";
    },

    checkInputRequiredState: function(inputField) {
        if (!inputField.attr("required")) {
            return;
        }
        if (!inputField.val()) {
            inputField.addClass(this.CSS_INVALID);
        } else {
            inputField.removeClass(this.CSS_INVALID);
        }
    },

    getValueFromInputAndCheckRequired: function(selector) {
        var inputField = jQuery(selector);
        this.checkInputRequiredState(inputField);
        return inputField.val();
    },

    resetInputField: function(selector) {
        jQuery(selector).val("");
    }

});