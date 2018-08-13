/**
 * Updater for Pathmarks in case of changes on the
 * data structure to handle compatibility with new
 * versions.
 */

class PathmarksUpdater {

    constructor() {
        this.storage = chrome.storage.local;
    }

    start() {
        this.updateJsonConfigStorageKey();
    }

    updateJsonConfigStorageKey() {
	    const oldKey = 'jsonConfig';
	    const newKey = 'pathmarks';
        this.storage.get(oldKey, (items) => {
            if (items[oldKey]) {
                console.log('Updating from jsonConfig key to pathmarks key');
	            const storeValues = {};
                storeValues[newKey] = items[oldKey];
                this.storage.set(storeValues, function() {
                    console.log('Updated to pathmarks key');
                });
                this.storage.remove(oldKey, function() {
                    console.log('Removed old key jsonConfig');
                });
            }
        });
    }

}

jQuery().ready(function() {
	const updater = new PathmarksUpdater();
    updater.start();
});
