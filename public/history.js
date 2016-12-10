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
String.prototype.replaceAll = function(search, replacement) {
    search = escapeRegExp(search);
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};

//=====================


var levelStyleMap = new Map();
levelStyleMap.set(1, "color: LightSkyBlue !important; font-weight:lighter;");
levelStyleMap.set(2, "color: DeepSkyBlue !important;");
levelStyleMap.set(3, "color: DodgerBlue !important;");
levelStyleMap.set(4, "color: MediumBlue !important;");
levelStyleMap.set(5, "color: DarkBlue !important; font-weight:bolder;");

var cld = {
    "href": location.href,
    "protocol": location.protocol,
    "hostname": location.hostname,
    "pathname": location.pathname
};

var body = document.getElementsByTagName("body")[0];
var difficultyIdString = "difficulty-";
function boldDifficultyButton() {
    var curBtn = document.getElementById(difficultyIdString + cld.difficulty);
    if (curBtn && cld.difficulty) {
        curBtn.style =
            "top:80px; right:%rw%; position:fixed;".replaceAll("%rw%", (5 - cld.difficulty) * 30 + 10 + "px")
            + "color:red; font-weight:bold;";
    }
}
var postInput = function postInput(callback) {
    var time = (new Date()).getTime();
    cld["lastVisited"] = time;
    superagent.post("https://localhost:8443", cld)
        .end(function (err, resp) {
            if (err !== null) {
                console.log(err);
            }
            if (callback!=undefined&&callback!==null) {
                callback()
            }
        });
};
function createButtons() {
    for (var i = 1; i <= 5; i++) {
        if (document.getElementById(difficultyIdString + i)) {
            document.getElementById(difficultyIdString + i).remove();
        }
        var btn = document.createElement("button");
        btn.id = difficultyIdString + i;
        btn.innerText = i;
        body.appendChild(btn);
        btn.style =
            "top:80px; right:%rw%; position:fixed;".replaceAll("%rw%", (5 - i) * 30 + 10 + "px");
        btn.onclick = (function (ctr) {
            return function () {
                cld.difficulty = ctr;
                postInput();
                createButtons();
                boldDifficultyButton();
            }
        })(i);
    }
}
var pathnameSet = new Set();
var hrefSet = new Set();
var hrefMap = new Map();
var pathMap = new Map();
var tagAutoCompleteSet = new Set();
setTimeout(function () {
    refreshData(true)
}, 1000);
setInterval(function () {
    refreshData(false);
},5000);

function refreshData(firstRun) {
    superagent.get("https://localhost:8443", function (err, resp) {
        if (err !== null) {
            console.log(err);
        }
        var locationData = resp.body;
        locationData.forEach((e)=> {
            pathnameSet.add(e["pathname"]);
            hrefSet.add(e["href"]);
            hrefMap.set(e["href"], e);
            pathMap.set(e["pathname"],e);
        });
        var atags = Array.from(document.getElementsByTagName("a"));
        var atagsHref = new Set();
        atags.filter((e)=>hrefSet.has(e.href)).forEach((e)=>atagsHref.add(e));
        atags.filter((e)=>pathnameSet.has(e.pathname)).forEach((e)=>atagsHref.add(e));
        atagsHref.forEach((e)=> {
            var df =3
            if (hrefMap.get(e.href)) {
                df = hrefMap.get(e.href).difficulty;
            } else if(pathMap.get(e.pathname)) {
                df = pathMap.get(e.pathname).difficulty;
            }
            e.style = levelStyleMap.get(df);
        });
        if (firstRun) {
            augmentCLD();
            render();
        }
    });
}

function augmentCLD() {
    var thisLocationData = hrefMap.get(location.href) || pathMap.get(location.pathname) || {};
    cld.difficulty = thisLocationData.difficulty;
    cld.notes = thisLocationData.notes || [];
    cld.tags = thisLocationData.tags || [];
}

function render() {
    createButtons();
    renderNoteText();
    boldDifficultyButton();
    renderTags();
}

var noteId = "notebook-id";
var note = document.createElement("div");
note.id = noteId;
body.appendChild(note);
note.style =
    "top:180px; right:%rw%; position:fixed; width: 35em;".replaceAll("%rw%",10 + "px");

var tagId = "tag-id";
var tagger = document.createElement("div");
tagger.id = tagId;
body.appendChild(tagger);
tagger.style =
    "top:120px; right:%rw%; position:fixed; width: 20em; padding:2px;".replaceAll("%rw%",10 + "px");
tagger.className += "panel panel-default";

function addButton() {
    var addButton =  document.createElement("button");
    addButton.style = "color: darkcyan;";
    addButton.className += " pull-right";
    addButton.id = "add-note-button";
    addButton.innerHTML = "Add";
    addButton.onclick = function () {
        addNewNote();
    };
    note.appendChild(addButton);
}

var template =
    `<div id="note-inner-content-%index%" class="well well-sm">
        <p id="note-content-%index%" class="note-content-%index%">
        %note%
        </p>
        <br>
        <button style="color: darkcyan" onclick="makeNoteTextEditable(%index%)">EDIT</button>
        <button class="pull-right" style="color: firebrick" onclick="removeNoteText(%index%)">REMOVE</button>
        <p>&nbsp;</p>
    </div>
    `;

var editTemplate =
    `<div>
        <textarea rows="4" id="editable-note-%index%" style="width: 33em;">%note%</textarea>
        <br>
        <button onclick="saveNoteText(%index%)">SAVE</button>
        <p>&nbsp;</p>
    </div>
    `

function renderNoteText() {
    if (document.getElementById(noteId)) {
        document.getElementById(noteId).innerHTML="";
    }

    for (var i = 0; i < cld.notes.length; i++) {
        var str = template.replaceAll("%index%",i+"");
        var htmlElement = htmlToElement(str);
        htmlElement.getElementsByClassName("note-content-"+i)[0].innerHTML = cld.notes[i];
        note.appendChild(htmlElement);
    }
    addButton();
}

function makeNoteTextEditable(index) {
    if (document.getElementById(noteId)) {
        document.getElementById(noteId).innerHTML="";
    }
    for (var i = 0; i < cld.notes.length; i++) {
        if (i == index) {
            var str = editTemplate.replaceAll("%note%",cld.notes[i]).replaceAll("%index%",i+"");
            var htmlElement = htmlToElement(str);
            note.appendChild(htmlElement);
        } else {
            var str = template.replaceAll("%index%",i+"");
            var htmlElement = htmlToElement(str);
            htmlElement.getElementsByClassName("note-content-"+i)[0].innerHTML = cld.notes[i];
            note.appendChild(htmlElement);
        }
    }
    addButton();
}

function saveNoteText(index) {
    var newNoteText = document.getElementById("editable-note-"+index).value;
    newNoteText = anchorme(newNoteText);
    cld.notes[index] = newNoteText;
    postInput(renderNoteText);
}
function removeNoteText(index) {
    cld.notes.splice( index, 1 );
    postInput(renderNoteText);
}

function addNewNote() {
    cld.notes.push("");
    makeNoteTextEditable(cld.notes.length-1)
}

function renderTags() {
    var tags = cld.tags || [];
    new Taggle(tagId, {
        tags: tags,
        duplicateTagClass: 'bounce',
        onTagAdd: function(event, tag) {
            cld.tags.push(tag);
            postInput();
        },
        onTagRemove: function(event, tag) {
            cld.tags = cld.tags.filter(item => item !== tag);
            postInput();
        }
    });
}

function removeStopWords(input) {
    var inputWords = input.split(" ").map(w=>w.trim());
    for (var i=0;i<inputWords.length;) {
        if (i<inputWords.length) {
            if (stopWordSet.has(inputWords[i].toLowerCase()) ||
                stopWordSet.has(inputWords[i]) ||
                stopWordSet.has(inputWords[i].toUpperCase()) ||
                list.includes(inputWords[i]) ||
                list.includes(inputWords[i].toLowerCase()) ||
                list.includes(inputWords[i].toUpperCase())) {
                inputWords.splice( i, 1 );
            } else {
                i++;
            }
        }
    }
    return inputWords
}

function generateAutoComplete(input) {
    var inputWords = removeStopWords(input);
    var inputWordsTakenTwo = [];
    for (var i=0;i<=(inputWords.length-1)/2;i++) {
        var i1=2*i;
        var i2=2*i +1;
        if (i2>(inputWords.length-1)) {
            i2 = i1;
            i1 = 2*i -1;
        }
        inputWordsTakenTwo.push(inputWords[i1]+" "+inputWords[i2])
    }
    var words = inputWords.concat(inputWordsTakenTwo);
    words.forEach(w=>tagAutoCompleteSet.add(w));
    return Array.from(tagAutoCompleteSet);
}

function getTags() {
    superagent.get("https://localhost:8443/tags",function (err, resp) {
        if (err !== null) {
            console.log(err);
        }
        resp.body.forEach(t=>tagAutoCompleteSet.add(t));
    })
}
