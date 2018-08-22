
/**
 * Javascript core module for pathmarks.
 */
export default class Core {

	constructor() {
		this.storage = chrome.storage.sync;
		this.storageConfigKey = 'pathmarks';
	}

	useGetStorage(callback) {
		this.storage.get(this.storageConfigKey, (items) => {
			return callback(items[this.storageConfigKey]);
		});
	}

	useSetStorage(value, callback) {
		const storeObject = {};
		storeObject[this.storageConfigKey] = value;
		this.storage.set(storeObject, () => {
			return callback();
		});
	}

	static serializeConfigValues(configValues) {
		const serialized = JSON.stringify(configValues);
		return serialized.replace(/},/g, '},\n');
	}
}
