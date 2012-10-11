/**
 * PathMarks - Google Chrome Extension
 */
var PathMarks = PathMarks || {};

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
	var storage = chrome.storage.local;
	storage.set({"jsonConfig": jsonConfig}, function() {
		jQuery(".configarea").removeClass("invalid");
		jQuery(".configarea").addClass("saved");
		PathMarks.setMessage("Configuration saved");
	});
};

PathMarks.resetConfiguration = function() {
	jQuery("#jsonConfig").val("");
	var storage = chrome.storage.local;
	storage.set({"jsonConfig": ""}, function() {
		PathMarks.setMessage("Configuration cleared.");
	});
};

PathMarks.loadConfiguration = function() {
	var storage = chrome.storage.local;
	storage.get("jsonConfig", function(items) {
		if (items.jsonConfig) {
			jQuery("#jsonConfig").val(items.jsonConfig);
		}
	});
};

jQuery().ready(function() {
	jQuery(".configarea").keyup(function() {
		PathMarks.saveConfiguration();
	});
	PathMarks.loadConfiguration();
});