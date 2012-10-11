/**
 * PathMarks - Google Chrome Extension
 */
var PathMarks = PathMarks || {};

PathMarks.getHostAndPort = function(url) {
	var virtualLink = jQuery("<a />");
	virtualLink.prop("href", url);
	var port = virtualLink.prop("port") ? ":" + virtualLink.prop("port") : "";
	return virtualLink.prop("protocol") + "//" + virtualLink.prop("hostname") + port;
};

PathMarks.changeUrls = function(urlTarget) {
	chrome.tabs.getSelected(null, function(tab) {
		var targetForTab = PathMarks.getHostAndPort(tab.url) + urlTarget;
		chrome.tabs.create({url: targetForTab});
	});
};

PathMarks.loadConfiguration = function() {
	var storage = chrome.storage.local;
	storage.get("jsonConfig", function(items) {
		if (items.jsonConfig) {
			var configs = JSON.parse(items.jsonConfig);
			var urls = jQuery(".urls");
			for (entryIdx in configs) {
				var entry = configs[entryIdx];
				var url = jQuery("<div />");
				url.addClass("url");
				url.attr("data-path", entry.value);
				url.attr("title", entry.value);
				url.html(entry.title);
				url.click(function () {
					PathMarks.changeUrls(jQuery(this).attr("data-path"));
				});
				urls.append(url);
			}
		} else {
			jQuery(".urls").html("<div class=\"error\">No paths configured, use options of this extension to configure paths.</div>");
		}
	});
};

jQuery().ready(function() {
	PathMarks.loadConfiguration();
});