var serverUrl = "https://localhost:8444";
var bookmarksUrl = "%server%/bookmarks".replace("%server%",serverUrl);
var entryUrl = "%server%/bookmarks/entry".replace("%server%", serverUrl);
var tagsUrl = "%server%/bookmarks/tags".replace("%server%", serverUrl);
var browsePageUrl = "%server%/browse.html".replace("%server%", serverUrl);
var syncUrl = "%server%/bookmarks/sync".replace("%server%", serverUrl);
var getVisitUrl = function (id) {
    return "%server%/bookmarks/visit/%id%".replace("%server%", serverUrl).replace("%id%",id);
};
var getDeleteUrl = function (id) {
    return "%server%/bookmarks/entry/%id%".replace("%server%", serverUrl).replace("%id%",id);
}
var dbName = "history.db";
