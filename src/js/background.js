/**
 * Background tasks
 */
class PathmarksBackground {

	static standardIcon() {
		chrome.browserAction.setIcon({path: '../images/icon38.png'});
	}

	static devBadge() {
		if (chrome.runtime.getManifest().short_name === 'PathDev') {
			chrome.browserAction.setBadgeText({text: "µ"});
			chrome.browserAction.setBadgeBackgroundColor({color: '#753015'});
		}
	}

}

/**
 * Upgrade tasks
 */
class PathmarksUpgrade {

	static upgradeToSyncStorage() {
		chrome.storage.local.get('pathmarks', (store) => {
			if (store['pathmarks']) {
				console.log("Local storage entries found. Convert to sync storage...");
				chrome.storage.sync.set(store, () => {
					console.log('Copy pathmarks to sync storage.');
					chrome.storage.local.clear(() => {
						console.log("Remove local storage entries");
						console.log('Conversion to sync storage completed.');
					});
				});
			}
		});
	}

}

chrome.runtime.onInstalled.addListener(() => PathmarksUpgrade.upgradeToSyncStorage());

chrome.runtime.onInstalled.addListener(() => PathmarksBackground.devBadge());

chrome.runtime.onConnect.addListener((port) => {
	port.onDisconnect.addListener(() => PathmarksBackground.standardIcon());
});
