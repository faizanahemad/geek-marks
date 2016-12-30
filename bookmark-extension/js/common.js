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

var convertSecondsToMinute = function (seconds) {
    var minutes = parseInt(seconds/60);
    seconds = seconds - minutes*60;
    return {
        minutes:minutes,
        seconds:seconds,
        "stringRepresentation":minutes+":"+seconds
    }
};
function sendMessage(msg) {
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage(msg,(reply)=>{
            resolve(reply);
        });
    });
}

function isSelected() {
    if(document.hasFocus()) {
        return sendMessage({type:"is_selected"})
    } else {
        return Promise.resolve({active:false})
    }
}
