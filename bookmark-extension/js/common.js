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

function appendMany(elem,children) {
    Array.from(htmlToElements(children)).forEach(child=>elem.appendChild(child))
}
function prependMany(elem,children) {
    Array.from(htmlToElements(children)).forEach(child=>elem.prepend(child))
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

function infoLogger(arg1, arg2, arg3, arg4) {
    console.log(arg1);
    console.log(arg2);
    console.log(arg3);
    console.log(arg4);
}

var convertSecondsToMinute = function (seconds) {
    var minutes = parseInt(seconds/60);
    seconds = parseInt(seconds - minutes*60);
    var secondsString = seconds+"";
    if(seconds/10<1){
        secondsString = "0"+secondsString;
    }
    return {
        minutes:minutes,
        seconds:seconds,
        "stringRepresentation":minutes+":"+secondsString
    }
};

var convertStringToSeconds = function (input) {
    var splittedInput = input.split(":");
    if(splittedInput.length>=2) {
       return parseInt(splittedInput[0])*60 + parseInt(splittedInput[1])
    } else {
        return parseInt(splittedInput[0])
    }
}
function sendMessage(msg) {
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage(msg,(reply)=>{
            resolve(reply);
        });
    });
}
function timedPromise(promise,time) {
    var timedPromise = new Promise(function (resolve, reject) {
        setTimeout(()=>{
            reject();
        },time);
        promise.then(resolve,reject)
    });
    return timedPromise;
}
