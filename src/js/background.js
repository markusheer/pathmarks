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
			chrome.browserAction.setBadgeBackgroundColor({color: 'rgb(80,80,80)'});
		}
	}

}

/**
 * Upgrade tasks
 */
class PathmarksUpgrade {

	static upgradeToSyncStorage() {

		PathmarksUpgrade.storageLocalGet().then(store => {
			if (store['pathmarks']) {
				console.log('Local storage entries found. Convert to sync storage...');
				return PathmarksUpgrade.storageSyncSet(store);
			}
			return Promise.reject('No conversion needed');
		}).then(() => {
			console.log('Copied pathmarks to sync storage.');
			return PathmarksUpgrade.storageLocalClear();
		}).then(() => {
			console.log('Removed local storage entries');
			console.log('Conversion to sync storage completed.');
		}).catch((reason) => {
			console.debug(`Storage upgrade: ${reason}`);
		});

	}

	static storageLocalGet() {
		return new Promise(resolve => {
			chrome.storage.local.get('pathmarks', resolve);
		});
	}

	static storageSyncSet(store) {
		return new Promise(resolve => {
			chrome.storage.sync.set(store, resolve);
		});
	}

	static storageLocalClear() {
		return new Promise(resolve => {
			chrome.storage.local.clear(resolve);
		});
	}

}

chrome.runtime.onInstalled.addListener(() => PathmarksUpgrade.upgradeToSyncStorage());

chrome.runtime.onInstalled.addListener(() => PathmarksBackground.devBadge());

chrome.runtime.onConnect.addListener((port) => {
	port.onDisconnect.addListener(() => PathmarksBackground.standardIcon());
});
