/**
 * Updater for Pathmarks in case of changes on the
 * data structure to handle compatibility with new
 * versions.
 */

Pathmarks.Updater = Class.extend({

    init: function() {
        this.storage = chrome.storage.local;
    },

    start: function() {
        this.updateJsonConfigStorageKey();
    },

    updateJsonConfigStorageKey: function() {
        var oldKey = "jsonConfig";
        var newKey = "pathmarks";
        var that = this;
        this.storage.get(oldKey, function(items) {
            if (items[oldKey]) {
                console.log("Updating from jsonConfig key to pathmarks key");
                var storeValues = {};
                storeValues[newKey] = items[oldKey];
                that.storage.set(storeValues, function() {
                    console.log("Updated to pathmarks key");
                });
                that.storage.remove(oldKey, function() {
                    console.log("Removed old key jsonConfig");
                });
            }
        });
    }

});

jQuery().ready(function() {
    var updater = new Pathmarks.Updater();
    updater.start();
});