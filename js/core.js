/**
 * Javascript core module for pathmarks.
 */
var Pathmarks = Pathmarks || {};

Pathmarks.Core = Class.extend({

    init: function() {
        this.storage = chrome.storage.local;
        this.storageConfigKey = "pathmarks";
    },

    useGetStorage: function(callback) {
        var self = this;
        this.storage.get(this.storageConfigKey, function(items) {
            return callback(items[self.storageConfigKey]);
        });
    },

    useSetStorage: function(value, callback) {
        var storeObject = {};
        storeObject[this.storageConfigKey] = value;
        this.storage.set(storeObject, function() {
            return callback();
        });
    }

});
