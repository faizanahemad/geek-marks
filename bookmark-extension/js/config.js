var serverUrl = "http://localhost:8443";
var serverUrlHttps = "https://localhost:8444";
var couchStoreUrl = 'http://localhost:5984/history'
var loginApi = serverUrl + "/login_api";
var loginUrl = serverUrl + "/login";
var healthUrl = "%server%/health".replace("%server%",serverUrlHttps);
var checkLoginUrl = "%server%/check_login".replace("%server%",serverUrl);
var externalLogin = "%server%/extension-login.html".replace("%server%",serverUrl);
var bookmarksUrl = "%server%/bookmarks".replace("%server%",serverUrl);
var entryUrl = "%server%/bookmarks/entry".replace("%server%", serverUrl);
var tagsUrl = "%server%/bookmarks/tags".replace("%server%", serverUrl);
var browsePageUrl = "%server%/browse.html".replace("%server%", serverUrl);
var syncUrl = "%server%/bookmarks/sync".replace("%server%", serverUrl);

var logEnabled = true;
var stackTraceLogging = true;
var errorLogEnabled = true;
var nonRelayedTypesAndFroms = new Set(["frame_size_change","page_content","storage_proxy", "bookmarks_query", "check_login", "login_info", "sync_request", "domain_path_query", "is_selected"]);
var getVisitUrl = function (id) {
    return "%server%/bookmarks/visit/%id%".replace("%server%", serverUrl).replace("%id%",id);
};
var getDeleteUrl = function (id) {
    return "%server%/bookmarks/entry/%id%".replace("%server%", serverUrl).replace("%id%",id);
};
var dbName = "history.db";

var redirectsConfig = {
    "geeksforgeeks.org":["archives"],
    "quiz.geeksforgeeks.org":["archives"]
}

var globalSettings = {
    "style":{
        "color":3,
        "top":21,
        "right":21,
        "height":620,
        "width":380
    },
    "settings":{
        "enabled":true
    }
};

var frameHiddenStyleDefault = {
    height:35,
    width:35
};
var defaultSettingsMap = {
    "youtube.com":{
        "style":{
            "color":1,
            "top":90,
            "right":2,
            "height":580,
            "width":400
        },
        "settings":{
            "enabled":true,
            "show_on_load":false,
            "path":{
                "startsWith":true,
                "endsWith":false,
                "equals":false,
                "contains":false,
                "value":"/watch"
            },
            "bookmarks":true,
            "notes":true
        }
    },
    "google.co.in":{
        "style":{
            "color":4,
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
            "top":60,
            "right":21,
            "height":620,
            "width":400
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
            "enabled":true,
            "show_on_load":false,
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
var apiTimeout = 10000;
toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": true,
    "onclick": null,
    "showDuration": "300",
    "hideDuration": "1000",
    "timeOut": "3000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut"
}

var defaultCollections = ["Misc","Data Structures and Algorithms","Machine Learning & AI",
"Software Engineering","Personal Development"]

var cacheRefreshTime = 3600*1000
