function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback && cookie) {
            callback(cookie.value);
        }
    });
}
var loginStatus = {login:false};
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if(sender && sender.tab && sender.tab.id) {
        chrome.tabs.sendMessage(sender.tab.id, msg);
    }
    if (msg && msg.from ==="content_script" && msg.type==="bookmarks_query") {
        sendBookmarks(sendResponse);
        return true;
    }
    if (msg && msg.from ==="content_script" && msg.type==="tab_id_query") {
        sendResponse({from:"background_page",type:"tab_id_response",id:sender.tab.id});
    }
    if (msg && msg.from ==="content_script" && msg.type==="check_login") {
        sendResponse({from:"background_page",type:"check_login_response",id:sender.tab.id,login:loginStatus.login});
    }
    if (msg && msg.from ==="login_extension_page" && msg.type==="login_info") {
        chrome.tabs.sendMessage(msg.id, msg);
    }
    if (msg && msg.from ==="login_extension_page" && msg.type==="sync_request") {
        backgroundSync();
    }
    if(msg && msg.type==="domain_path_query") {
        if(msg.url) {
            sendResponse(getLocation(msg.url))
        } else if(sender && sender.url) {
            sendResponse(getLocation(sender.url))
        } else {
            chrome.tabs.query({active:true,currentWindow: true,windowType:"normal"}, function(tabs){
                sendResponse(getLocation(tabs[0].url));
            });
            return true;
        }
    }
    if(msg.type == "is_selected") {
        chrome.tabs.query({active:true,currentWindow: true,windowType:"normal"}, function(tabs){
            sendResponse({active:tabs.some(tab=>tab.id == sender.tab.id)});
        });
        return true;
    }
});

function getLocation(href) {
    var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
    return match && {
            protocol: match[1],
            host: match[2],
            hostname: match[3],
            port: match[4],
            pathname: match[5],
            search: match[6],
            hash: match[7]
        }
}


function sendBookmarks(sendResponse) {
    chrome.bookmarks.getTree(function (results) {
        var bookmarks = [];
        accumulateBookmarks(results,bookmarks);
        sendResponse({from:"background_page",type:"bookmarks_response",bookmarks:bookmarks})
    });
}

function accumulateBookmarks(root, accumulator) {
    root.forEach(r=>{
        if (Array.isArray(r.children)) {
            accumulateBookmarks(r.children, accumulator);
        } else {
            accumulator.push({title:r.title, url:r.url});
        }
    })
}

var storage = new Storage(dbName);

function backgroundSync() {
    var loginState = new Promise(function(resolve, reject) {
        getCookies(serverUrl,"_id",(userId)=>{
            sync(userId,storage).then(resolve,reject);
        });
    });
    timedPromise(loginState,2000).then(()=>loginStatus.login=true,()=>loginStatus.login=false);
}
function syncCallback() {
    backgroundSync();
    setInterval(()=>{
        backgroundSync();
    },60000);
}
syncCallback();

function addStorageListeners() {
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if(msg.from==="storage_proxy") {
            switch (msg.type) {
                case "get_all":
                    storage.getAll(msg.userId).then(docs=>sendResponse(docs));
                    break;
                case "get_all_tags":
                    storage.getAllTags(msg.userId).then(docs=>sendResponse(docs));
                    break;
                case "insert_or_update":
                    storage.insertOrUpdateEntry(msg.entry,msg.userId).then(docs=>{
                        sendResponse(docs)
                    });
                    break;
                case "remove":
                    storage.remove(msg.id,msg.userId).then(docs=>sendResponse(docs));
                    break;
                case "visit":
                    storage.logVisit(msg.id,msg.userId).then(docs=>sendResponse(docs));
                    break;
                case "user_id_query":
                    getCookies(serverUrl,"_id",(userId)=>{
                        sendResponse({from:"background_page",type:"user_id",userId:userId});
                    });
                    break;
            }
        }
        return true;
    });
}
addStorageListeners();

function storeDefaultGlobalsIfnotPresent() {
    chromeStorage.getGlobalSettings().then(settings=>{
        if(!settings) {
            return chromeStorage.setGlobalSettings(globalSettings);
        } else {
            return settings;
        }
    })
}
storeDefaultGlobalsIfnotPresent();

var defaultSites = ["youtube.com","geeksforgeeks.org","quiz.geeksforgeeks.org","stackoverflow.com","stackexchange.com"];
function storeDefaultSiteSpecificSettings() {
    defaultSites.forEach(ds=>{
        chromeStorage.getSpecificSiteSettings(ds).then(item=>{
            if(!item.present) {
                var newItem = defaultSettingsMap[ds];
                chromeStorage.setSpecificSiteSettings(ds,newItem)
            }
        })
    })
}
storeDefaultSiteSpecificSettings();
