/**
 * PathMarks - Google Chrome Extension
 */
var PathMarks = PathMarks || {};

PathMarks.storage = chrome.storage.local;

PathMarks.setMessage = function(msg) {
	var messageContainer = jQuery(".message");
	messageContainer.removeClass("error");
	messageContainer.html(msg);
};

PathMarks.setErrorMessage = function(errorMsg) {
	var messageContainer = jQuery(".message");
	messageContainer.addClass("error");
	messageContainer.html(errorMsg);
};

PathMarks.saveConfiguration = function() {
	var jsonConfig = jQuery("#jsonConfig").val();
	if (!jsonConfig) {
		PathMarks.resetConfiguration();
		return;
	}
	try {
		JSON.parse(jsonConfig);
	} catch (e) {
		jQuery(".configarea").addClass("invalid");
		PathMarks.setErrorMessage("Error: Can not save illegal JSON configuration " + e);
		return;
	}
	PathMarks.storage.set({"jsonConfig": jsonConfig}, function() {
		jQuery(".configarea").removeClass("invalid");
		jQuery(".configarea").addClass("saved");
		PathMarks.setMessage("Configuration saved");
	});
};

PathMarks.resetConfiguration = function() {
	jQuery("#jsonConfig").val("");
	PathMarks.storage.set({"jsonConfig": ""}, function() {
		PathMarks.setMessage("Configuration cleared.");
	});
};

PathMarks.loadConfiguration = function() {
	PathMarks.storage.get("jsonConfig", function(items) {
		if (items.jsonConfig) {
			jQuery("#jsonConfig").val(items.jsonConfig);
		}
	});
};

PathMarks.addEntryFromInputFields = function() {
    var titleField = jQuery("input[name=title]");
    var valueField = jQuery("input[name=value]");
    var title = titleField.val();
    var value = valueField.val();
    if (!title) {
        titleField.addClass("invalid");
    } else {
        titleField.removeClass("invalid");
    }
    if (!value) {
        valueField.addClass("invalid");
    } else {
        valueField.removeClass("invalid");
    }
    if (!title || !value) {
        return;
    }
    PathMarks.storage.get("jsonConfig", function(items) {
        var configValues = [];
        if (items.jsonConfig) {
            configValues = JSON.parse(items.jsonConfig);
        }
        var newEntry = {"title": title, "value": value };
        configValues.push(newEntry);
        jQuery(".configarea").val(JSON.stringify(configValues, null, 0));
        PathMarks.saveConfiguration();
        titleField.val("");
        valueField.val("");
    });
};

jQuery().ready(function() {
	jQuery(".configarea").on("keyup", function() {
		PathMarks.saveConfiguration();
	});
    jQuery(".add").on("click", function() {
        PathMarks.addEntryFromInputFields();
    });
	PathMarks.loadConfiguration();
});