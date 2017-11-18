var superagent = Promise.promisifyAll(superagent);
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
Array.prototype.remove = function (element) {
    var index = this.indexOf(element);
    if(index!=-1) {
        this.splice(index, 1);
    }
}
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
function getQueryParam(name) {
    var parameters = {};
    var query = location.search.substring(1);
    var keyValues = query.split(/&/);
    keyValues.forEach(keyValue => {
        var keyValuePairs = keyValue.split(/=/);
        var key = keyValuePairs[0];
        var value = keyValuePairs[1];
        parameters[key] = value;
    });
    return parameters[name];
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}