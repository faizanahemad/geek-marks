var bookmarkIndicatorSpan = `<span class="bookmarks-indicator" style="color: Violet;">&nbsp;[B]</span>`;
function sendBookmarksRequest() {
    var msg={};
    msg.from = "content_script";
    msg.type = "bookmarks_query";
    return sendMessage(msg,"sendBookmarksRequest")
}

function renderBookmarkLinks(bookmarks) {
    var hrefBookmarkSet = new Set();
    bookmarks.forEach(b=>{
        hrefBookmarkSet.add(b.url);
    });
    var atags = Array.from(document.getElementsByTagName("a"));
    atags.forEach((e)=>{
            if(hrefBookmarkSet.has(e.href) && e.getElementsByClassName("bookmarks-indicator").length==0) {
                e.append(htmlToElement(bookmarkIndicatorSpan))
            }
        });
}
