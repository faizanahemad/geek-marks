var atags = Array.from(document.getElementsByTagName("a"));
function sendBookmarksRequest() {
    var msg={};
    msg.from = "content_script";
    msg.type = "bookmarks_query";
    sendMessage(msg).then(doc=>{
        renderBookmarkLinks(doc.bookmarks)
    });
}

function renderBookmarkLinks(bookmarks) {
    var hrefBookmarkSet = new Set();
    var titleBookmarkSet = new Set();
    bookmarks.forEach(b=>{
        hrefBookmarkSet.add(b.url);
        titleBookmarkSet.add(b.title);
    });
    atags.filter((e)=>hrefBookmarkSet.has(e.href) || titleBookmarkSet.has(e.innerText.toLowerCase().trim()))
        .forEach((e)=>e.append(htmlToElement(bookmarkIndicatorSpan)));
}
