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
/**
 * @param {String} HTML representing a single element
 * @return {Element}
 */
function htmlToElement(html) {
    var template = document.createElement('template');
    template.innerHTML = html;
    return template.content.firstChild;
}

/**
 * @param {String} HTML representing any number of sibling elements
 * @return {NodeList}
 */
function htmlToElements(html) {
    var template = document.createElement('template');
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
var serverUrl = "https://localhost:8444";
var superagent = Promise.promisifyAll(superagent);

var postInput = function postInput(data, callback) {
    var storageData = $.extend(true, {}, data);
    if (storageData.notes && storageData.notes.length > 0 && storageData.notes[0]) {
        if (typeof storageData.notes[0] === "object") {
            storageData.notes = storageData.notes.map(n=>n.note);
        }
    }
    storageData.notes = storageData.notes.filter(e=> {
        if (e) {
            return true;
        }
    });
    var postData = {
        "href": storageData.href,
        "protocol": storageData.protocol,
        "hostname": storageData.hostname,
        "pathname": storageData.pathname,
        "title": storageData.title,
        "notes": storageData.notes,
        "tags": storageData.tags,
        "difficulty":storageData.difficulty,
        "userId": storageData.userId,
        "useless":storageData.useless
    };
    var time = (new Date()).getTime();
    postData["lastVisited"] = time;
    superagent.post("%server%/bookmarks/entry".replace("%server%", serverUrl), postData)
        .end(function (err, resp) {
            if (err !== null) {
                console.log(err);
            }
            if (callback != undefined && callback !== null) {
                callback()
            }
        });
};
