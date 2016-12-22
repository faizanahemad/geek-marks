chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
    chrome.tabs.sendMessage(sender.tab.id, msg);
    if (msg && msg.from ==="content_script" && msg.type==="bookmarks_query") {
        sendBookmarks(sender.tab.id);
    }
});


function sendBookmarks(asker) {

    chrome.bookmarks.getTree(function (results) {
        var bookmarks = [];
        accumulateBookmarks(results,bookmarks);
        chrome.tabs.sendMessage(asker,{from:"background_page",type:"bookmarks_response",bookmarks:bookmarks})
    });
}

function accumulateBookmarks(root, accumulator) {
    root.forEach(r=>{
        if (r.children && r.children instanceof Array) {
            accumulateBookmarks(r.children, accumulator);
        } else {
            accumulator.push({title:r.title, url:r.url});
        }
    })
}
