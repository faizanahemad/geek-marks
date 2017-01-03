var serverUrl = "https://139.162.25.64:8444";
var healthUrl = "%server%/health".replace("%server%",serverUrl);
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

var globalSettings = {
    "style":{
        "top":21,
        "right":21,
        "height":570,
        "width":360
    },
    "settings":{
        "enabled":true,
        "show_on_load":false,
        "path":{
            "startsWith":false,
            "endsWith":false,
            "equals":false,
            "contains":false,
            "value":""
        },
        "bookmarks":false,
        "notes":false
    }
};

var frameHiddenStyleDefault = {
    height:35,
    width:35
}
var defaultSettingsMap = {
    "www.youtube.com":{
        "style":{
            "top":90,
            "right":2,
            "height":570,
            "width":400
        },
        "settings":{
            "enabled":false,
            "show_on_load":false,
            "path":{
                "startsWith":true,
                "endsWith":false,
                "equals":false,
                "contains":false,
                "value":"/watch"
            },
            "bookmarks":true,
            "notes":false
        }
    },
    "quiz.geeksforgeeks.org":{
        "style":{
            "top":21,
            "right":21,
            "height":650,
            "width":440
        },
        "settings":{
            "enabled":true,
            "show_on_load":true,
            "path":{
                "startsWith":false,
                "endsWith":false,
                "equals":false,
                "contains":false,
                "value":""
            },
            "bookmarks":true,
            "notes":true
        }
    },
    "geeksforgeeks.org":{
        "style":{
            "top":21,
            "right":21,
            "height":650,
            "width":440
        },
        "settings":{
            "enabled":true,
            "show_on_load":true,
            "path":{
                "startsWith":false,
                "endsWith":false,
                "equals":false,
                "contains":false,
                "value":""
            },
            "bookmarks":true,
            "notes":true
        }
    },
    "stackoverflow.com":{
        "style":{
            "top":21,
            "right":21,
            "height":600,
            "width":400
        },
        "settings":{
            "enabled":false,
            "show_on_load":true,
            "path":{
                "startsWith":false,
                "endsWith":false,
                "equals":false,
                "contains":false,
                "value":""
            },
            "bookmarks":true,
            "notes":true
        }
    },
    "stackexchange.com":{
        "style":{
            "top":21,
            "right":21,
            "height":600,
            "width":400
        },
        "settings":{
            "enabled":false,
            "show_on_load":true,
            "path":{
                "startsWith":false,
                "endsWith":false,
                "equals":false,
                "contains":false,
                "value":""
            },
            "bookmarks":true,
            "notes":true
        }
    }
};
