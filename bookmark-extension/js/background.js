function getCookies(domain, name) {
    return new Promise(function (resolve, reject) {
        chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
            if(cookie) {
                resolve(cookie.value);
            } else {
                reject();
            }
        });
    })
}
var loginStatus = new Promise((resolve,reject)=>resolve({login:false,inProgress:true}));
var userId = "";
function broadcast(msg) {
    msg = msg || {};
    msg.from = "background_page";
    chrome.tabs.query({windowType:"normal"},(tabs)=>{
        tabs.forEach(tab=>{
            chrome.tabs.sendMessage(tab.id,msg);
        })
    })
}
function broadcastStoreChange() {
    broadcast({type:"storage_change"})
}
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    if(sender && sender.tab && sender.tab.id
       && msg && msg.type && msg.from &&
       !(nonRelayedTypesAndFroms.has(msg.type) || nonRelayedTypesAndFroms.has(msg.from))) {
        msg.tab_id = sender.tab.id;
        chrome.tabs.sendMessage(sender.tab.id, msg);
        infoLogger("Relayed msg with href:"+msg.href+" to tabid: "+sender.tab.id,msg)
    }
    if(msg.from==="storage_proxy_failure" && msg.type==="storage_failure") {
        loginStatus = new Promise((resolve,reject)=>resolve({login:false}));
        userId="";
    } else if(msg && msg.from === 'popup' && msg.type==="settings_change") {
        chrome.tabs.query({active:true,currentWindow: true,windowType:"normal"}, function(tabs){
            tabs.forEach((tab)=>{
                chrome.tabs.sendMessage(tab.id,msg)
            })
        });
    } else if (msg && msg.from ==="content_script" && msg.type==="bookmarks_query") {
        sendBookmarks(sendResponse);
        return true;
    } else if (msg && msg.from ==="content_script" && msg.type==="check_login") {
        loginStatus.then((ls)=>sendResponse({from:"background_page",type:"check_login_response",id:sender.tab.id,login:ls.login,inProgress:ls.inProgress}));
        return true;
    } else if (msg && msg.from ==="login_extension_page" && msg.type==="login_info") {
        chrome.tabs.sendMessage(msg.id, msg);
    } else if (msg && msg.from ==="login_extension_page" && msg.type==="sync_request") {
        backgroundSync();
    } else if(msg && msg.type==="domain_path_query") {
        if(msg.url) {
            sendResponse(getLocation(msg.url))
        } else if(sender && sender.url && sender.url.indexOf("chrome-extension://")===-1) {
            sendResponse(getLocation(sender.url))
        } else if(sender && sender.tab && sender.tab.url && sender.tab.url.indexOf("chrome-extension://")===-1) {
            sendResponse(getLocation(sender.tab.url))
        } {
            chrome.tabs.query({active:true,currentWindow: true,windowType:"normal"}, function(tabs){
                if(tabs.length>0) {
                    sendResponse(getLocation(tabs[0].url));
                }
            
            });
            return true;
        }
    } else if(msg && msg.type == "is_selected") {
        chrome.tabs.query({active:true,currentWindow: true,windowType:"normal"}, function(tabs){
            sendResponse({active:tabs.some(tab=>tab.id == sender.tab.id)});
        });
        return true;
    } else if(msg && msg.from==="storage_proxy") {
        storageHandler(msg, sender, sendResponse);
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
    var stack=[];
    stack.push(root[0]);
    while(stack.length>0) {
        var node = stack.pop();
        if(node) {
            if(Array.isArray(node.children)) {
                node.children.forEach((n)=>stack.push(n));
            } else {
                accumulator.push({title:node.title, url:node.url});
            }
        }
    }
}

function backgroundSync() {
    var loginState = new Promise(function(resolve, reject) {
        getCookies(serverUrl,"_id").then((userId)=>{
            return superagent.get(checkLoginUrl)
            .then((body)=>resolve(userId))
            .catch(err=>reject())
        },()=>reject());
    });
    loginStatus = timedPromise(loginState,2000,"loginState-"+randgen()).then((userId)=>{
        initStorageOnce(dbName,couchStoreUrl,userId)
        return {userId:userId,login:true,inProgress:false}
    },()=>{
        return {login:false,inProgress:false}
    });
    loginStatus.then(u=>{
        if(u.login) {
            userId = u.userId
        } else {
            userId = "";
        }
    })
}
function syncCallback() {
    backgroundSync();
    setInterval(()=>{
        backgroundSync();
    },6000);
}
syncCallback();

function storageHandler(msg, sender, sendResponse) {
    switch (msg.type) {
        case "get_all":
            storage.getAll(userId).then(docs=>sendResponse(docs),()=>sendResponse(SEND_RESPONSE_AS_FAILURE));
            break;
        case "get_all_tags":
            storage.getAllTags(userId).then(docs=>sendResponse(docs),()=>sendResponse(SEND_RESPONSE_AS_FAILURE));
            break;
        case "insert_or_update":
            storage.insertOrUpdateEntry(msg.entry,userId).then(docs=>{
                sendResponse(docs);
                broadcastStoreChange();
            },()=>sendResponse(SEND_RESPONSE_AS_FAILURE));
            break;
        case "remove":
            storage.remove(msg.id,userId).then(docs=>{
                sendResponse(docs);
                broadcastStoreChange();
            },()=>sendResponse(SEND_RESPONSE_AS_FAILURE));
            break;
        case "visit":
            storage.logVisit(msg.id,userId).then(docs=>sendResponse(docs),()=>sendResponse(SEND_RESPONSE_AS_FAILURE));
            break;
    }
}

function storeDefaultGlobalsIfnotPresent() {
    chromeStorage.setGlobalSettings(globalSettings);
}


function storeDefaultSiteSpecificSettings() {
    Object.keys(defaultSettingsMap).forEach(ds=>{
        var newItem = defaultSettingsMap[ds];
        chromeStorage.setSpecificSiteSettings(ds,newItem)
    });
}

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("Installed Extension - Storing Defaults");
        storeDefaultGlobalsIfnotPresent();
        storeDefaultSiteSpecificSettings();
    }else if(details.reason == "update"){

    }
});
