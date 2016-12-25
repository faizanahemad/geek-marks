Element.prototype.remove = function () {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
    for (var i = this.length - 1; i >= 0; i--) {
        if (this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
};
var template = document.createElement('template');
/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList}
 */
function htmlToElements(html) {
    template.innerHTML = html;
    return template.content.childNodes;
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
String.prototype.replaceAll = function (search, replacement) {
    search = escapeRegExp(search);
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

function timer(text) {
    console.log(text+":"+Date.now()+", relative time:"+(Date.now()%10000))
}
timer("common loaded @ " + location.href);
var serverUrl = "https://localhost:8444";
var bookmarksUrl = "%server%/bookmarks".replace("%server%",serverUrl);
var entryUrl = "%server%/bookmarks/entry".replace("%server%", serverUrl);
var tagsUrl = "%server%/bookmarks/tags".replace("%server%", serverUrl);
var superagent = Promise.promisifyAll(superagent);

var convertSecondsToMinute = function (seconds) {
    var minutes = parseInt(seconds/60);
    seconds = seconds - minutes*60;
    return {
        minutes:minutes,
        seconds:seconds,
        "stringRepresentation":minutes+":"+seconds
    }
};

var postInput = function postInput(data, callback) {
    var storageData = $.extend(true, {}, data);

    var postData = {
        "href": storageData.href,
        "protocol": storageData.protocol,
        "hostname": storageData.hostname,
        "pathname": storageData.pathname,
        "title": storageData.title,
        "note": storageData.note,
        "tags": storageData.tags,
        "difficulty":storageData.difficulty,
        "userId": storageData.userId,
        "useless":storageData.useless
    };
    var time = (new Date()).getTime();
    postData["lastVisited"] = time;
    superagent.post(entryUrl, postData)
        .end(function (err, resp) {
            if (err !== null) {
                console.log(err);
            }
            if (callback != undefined && callback !== null) {
                callback()
            }
        });
};
