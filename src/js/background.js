/**
 * Background tasks
 */
class PathmarksBackground {

	static standardIcon() {
		chrome.browserAction.setIcon({path: '../images/icon38.png'});
	}

	static devBadge() {
		chrome.browserAction.setBadgeText({text: "µ"});
		chrome.browserAction.setBadgeBackgroundColor({color: '#753015'});
	}

}

chrome.runtime.onInstalled.addListener(() => {
	if (chrome.runtime.getManifest().short_name === 'PathDev') {
		PathmarksBackground.devBadge();
	}
});

chrome.runtime.onConnect.addListener(function (port) {
	port.onDisconnect.addListener(() => {
		PathmarksBackground.standardIcon();
	});
});
