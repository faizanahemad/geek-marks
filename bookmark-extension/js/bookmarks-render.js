var bookmarkIndicatorSpan = `<span class="bookmarks-indicator" style="color: Violet;">&nbsp;[B]</span>`;
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
    var atags = Array.from(document.getElementsByTagName("a"));
    atags.filter((e)=>hrefBookmarkSet.has(e.href) || titleBookmarkSet.has(e.innerText.toLowerCase().trim()))
        .forEach((e)=>{
            if(e.getElementsByClassName("bookmarks-indicator").length==0) {
                e.append(htmlToElement(bookmarkIndicatorSpan))
            }
        });
}
