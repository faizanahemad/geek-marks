function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie.value);
        }
    });
}
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.tabs.sendMessage(sender.tab.id, msg);
    if (msg && msg.from ==="content_script" && msg.type==="bookmarks_query") {
        sendBookmarks(sendResponse);
        return true;
    }
    if (msg && msg.from ==="content_script" && msg.type==="tab_id_query") {
        sendResponse({from:"background_page",type:"tab_id_response",id:sender.tab.id});
        return true;
    }
    if (msg && msg.from ==="login_extension_page" && msg.type==="login_info") {
        chrome.tabs.sendMessage(msg.id, msg);
    }
    if(msg.type == "is_selected") {
        chrome.tabs.query({active:true}, function(tabs){
            sendResponse({active:tabs.some(tab=>tab.id == sender.tab.id)});
        });
        return true;
    }
});


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
function syncCallback() {
    getCookies(serverUrl,"_id",(userId)=>{
        sync(userId,storage);
    });
    setInterval(()=>{
        getCookies(serverUrl,"_id",(userId)=>{
            sync(userId,storage);
        });

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
                    storage.insertOrUpdateEntry(msg.entry,msg.userId).then(docs=>sendResponse(docs));
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
