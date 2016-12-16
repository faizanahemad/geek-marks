var body = document.getElementsByTagName("body")[0];
var atags = Array.from(document.getElementsByTagName("a"));

var pathnameSet = new Set();
var hrefSet = new Set();
var hrefMap = new Map();
var pathMap = new Map();
var titleMap = new Map();


var colorButtonId = "color-button-";
var difficultyIdString = "difficulty-";
var showHideButtonId = "show-hide-id";
var colors=["Magenta","LimeGreen","Silver","DodgerBlue","SandyBrown"];
var visibilityState = true;
var tagId = "tag-id";
var noteId = "notebook-id";
//=====================



var pinkStyle = new Map();
pinkStyle.set(1, "color: Plum !important; font-weight:lighter;");
pinkStyle.set(2, "color: Violet !important;");
pinkStyle.set(3, "color: Magenta !important;");
pinkStyle.set(4, "color: BlueViolet !important;");
pinkStyle.set(5, "color: Indigo !important; font-weight:bolder;");

var greenStyle = new Map();
greenStyle.set(1, "color: GreenYellow !important; font-weight:lighter;");
greenStyle.set(2, "color: Lime !important;");
greenStyle.set(3, "color: LimeGreen !important;");
greenStyle.set(4, "color: SeaGreen !important;");
greenStyle.set(5, "color: ForestGreen !important; font-weight:bolder;");

var grayStyle = new Map();
grayStyle.set(1, "color: Gainsboro !important; font-weight:lighter;");
grayStyle.set(2, "color: Silver !important;");
grayStyle.set(3, "color: DarkGray !important;");
grayStyle.set(4, "color: DarkSlateGray !important;");
grayStyle.set(5, "color: Black !important; font-weight:bolder;");

var blueStyle = new Map();
blueStyle.set(1, "color: LightSkyBlue !important; font-weight:lighter;");
blueStyle.set(2, "color: DeepSkyBlue !important;");
blueStyle.set(3, "color: DodgerBlue !important;");
blueStyle.set(4, "color: MediumBlue !important;");
blueStyle.set(5, "color: DarkBlue !important; font-weight:bolder;");

var redStyle = new Map();
redStyle.set(1, "color: Wheat !important; font-weight:lighter;");
redStyle.set(2, "color: BurlyWood !important;");
redStyle.set(3, "color: DarkGoldenrod !important;");
redStyle.set(4, "color: IndianRed !important;");
redStyle.set(5, "color: DarkRed !important; font-weight:bolder;");


var levelStyleMap = blueStyle;

function renderLinks() {
    var atagsHref = new Set();
    atags.filter((e)=>hrefSet.has(e.href)).forEach((e)=>atagsHref.add(e));
    atags.filter((e)=>pathnameSet.has(e.pathname)).forEach((e)=>atagsHref.add(e));
    atags.filter((e)=>titleMap.has(e.innerText.toLowerCase().trim())).forEach((e)=>atagsHref.add(e));
    atagsHref.forEach((e)=> {
        var df =3;
        if (hrefMap.get(e.href)) {
            df = hrefMap.get(e.href).difficulty;
        } else if(pathMap.get(e.pathname)) {
            df = pathMap.get(e.pathname).difficulty;
        }
        e.style = levelStyleMap.get(df);
    });
}


function changeStyle(style) {
    if (style==1) {
        levelStyleMap = pinkStyle;
    } else if (style==2) {
        levelStyleMap = greenStyle;
    } else if (style==3) {
        levelStyleMap = grayStyle;
    }   else if (style==4) {
        levelStyleMap = blueStyle;
    } else {
        levelStyleMap = redStyle;
    }
    var curBtn = document.getElementById(colorButtonId + style);
    curBtn.style =
        `top:60px; 
        right:%rw%; 
        position:fixed;
        color:red; 
        font-weight:bold;
        background-color:%bgcol%;
        border: 2px solid black;
        border-radius: 2px;`
            .replaceAll("%rw%", (5 - style) * 25 + 10 + "px")
            .replaceAll("%bgcol%",colors[style-1]);
}

function createColorButtons() {
    for (var i = 1; i <= 5; i++) {
        if (document.getElementById(colorButtonId + i)) {
            document.getElementById(colorButtonId + i).remove();
        }
        var btn = document.createElement("button");
        btn.id = colorButtonId + i;
        body.appendChild(btn);
        btn.style =
            "top:60px; right:%rw%; position:fixed;background-color:%bgcol%;"
                .replaceAll("%rw%", (5 - i) * 25 + 10 + "px")
                .replaceAll("%bgcol%",colors[i-1]);
        btn.onclick = (function (style) {
            return function () {
                createColorButtons();
                changeStyle(style);
                renderLinks();
            }
        })(i);
    }
}
createColorButtons();
changeStyle(4);

function createShowHideButton() {
    if (document.getElementById(showHideButtonId)) {
        document.getElementById(showHideButtonId).remove();
    }
    var btn = document.createElement("button");
    btn.id = showHideButtonId;
    function getBtnInnerHtml(visibleState) {
        return visibleState?`<img src="%server%/img/up-600px.png" height="12" width="12"></img>`.replace("%server%",serverUrl):`<img src="%server%/img/down-120px.png" height="12" width="12"></img>`.replace("%server%",serverUrl);
    }
    btn.innerHTML = getBtnInnerHtml(visibilityState);
    body.appendChild(btn);
    btn.style =
        "top:25px; right:%rw%; position:fixed;background-color:DeepSkyBlue;"
            .replaceAll("%rw%",10 + "px");
    btn.onclick = (function () {
        return function () {
            visibilityState = !visibilityState;
            var toAdd = visibilityState?"show":"hide";
            var toRemove = visibilityState?"hide":"show";
            var noteArea = document.getElementById(noteId);
            var tagArea = document.getElementById(tagId);
            if (noteArea) {
                noteArea.classList.remove(toRemove);
                noteArea.classList.add(toAdd);
            }
            if (tagArea) {
                tagArea.classList.remove(toRemove);
                tagArea.classList.add(toAdd);
            }
            btn.innerHTML = getBtnInnerHtml(visibilityState);
            for (var i = 1; i <= 5; i++) {
                var colorBtn = document.getElementById(colorButtonId + i);
                var diffBtn = document.getElementById(difficultyIdString + i);
                if (colorBtn) {
                    colorBtn.classList.remove(toRemove);
                    colorBtn.classList.add(toAdd);
                }
                if (diffBtn) {
                    diffBtn.classList.remove(toRemove);
                    diffBtn.classList.add(toAdd);
                }
            }

        }
    })();
}
createShowHideButton();
function getTitle() {

    var s1 = function () {
        var h1s = document.getElementsByTagName("h1");
        var h1Elem = h1s[0];
        if (h1Elem) {
            return h1Elem.textContent.trim().toLowerCase();
        }
        return "";
    };

    var s2 = function () {
        var h1s = document.getElementsByTagName("h1");
        var h1Elem = h1s[h1s.length-1];
        if (h1Elem) {
            return h1Elem.textContent.trim().toLowerCase();
        }
        return "";
    };
    var s3 = function () {
        var h1s = document.getElementsByClassName("entry-title");
        var h1Elem = h1s[0];
        if (h1Elem) {
            return h1Elem.textContent.trim().toLowerCase();
        }
        return "";
    };

    var tmap = new Map();
    var strategyArray = [s1, s2, s3];
    tmap.set("www.geeksforgeeks.org",s3);
    tmap.set("www.quiz.geeksforgeeks.org",s3);
    var curStrategy = tmap.get(location.hostname);
    var title = "";
    if (curStrategy) {
        title = curStrategy();
    }
    if (title.length==0) {
        title = strategyArray.reduce((prev,cur)=>{
            if (prev && prev.length>0) {
                return prev;
            } else {
                return cur();
            }
        },title);
    }
    return title;

}

var cld = {
    "href": location.href,
    "protocol": location.protocol,
    "hostname": location.hostname,
    "pathname": location.pathname,
    "title":getTitle()
};

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
    superagent.post("%server%/bookmarks".replace("%server%",serverUrl), cld)
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
setTimeout(function () {
    refreshData(true)
}, 1000);
setInterval(function () {
    refreshData(false);
},5000);

function refreshData(firstRun) {
    superagent.get("%server%/bookmarks".replace("%server%",serverUrl), function (err, resp) {
        if (err !== null) {
            console.log(err);
        }
        var locationData = resp.body;
        locationData.forEach((e)=> {
            pathnameSet.add(e["pathname"]);
            hrefSet.add(e["href"]);
            hrefMap.set(e["href"], e);
            pathMap.set(e["pathname"],e);

            if (e.title) {
                titleMap.set(e.title, e)
            }
        });

        renderLinks();
        if (firstRun) {
            augmentCLD();
            render();
        }
        if (hrefSet.has(location.href)) {
            postInput();
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


function cleanPage() {
    var discusPrompt = document.getElementById("onboard");
    var practiceText = document.getElementById("practice");
    var removables = [];
    removables.push(discusPrompt);
    removables.push(practiceText);
    removables.forEach(e=>{
        if (e) {
            e.remove();
        }
    });
}

cleanPage();


var note = document.createElement("div");
note.id = noteId;
body.appendChild(note);
note.style =
    "top:180px; right:%rw%; position:fixed; width: 35em;".replaceAll("%rw%",10 + "px");


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
