var displayData = {};
var storageData = {};
var colors = [{color: "Magenta", active: false},
    {color: "LimeGreen", active: false},
    {color: "Silver", active: false},
    {color: "DodgerBlue", active: true},
    {color: "SandyBrown", active: false}];
var body = document.getElementsByTagName("body")[0];

var browseButtonId = "browse-button-id";
var colorButtonId = "color-button-";
var saveButtonId = "save-note-";
var editButtonId = "edit-note-";
var removeButtonId = "remove-note-";
var addButtonId = "add-note-button";
var showNoteId = "show-note-";
var displayStatus = true;

var tagId = "tag-id";

function toggleDisplayStatus() {
    var showHideBtn = document.getElementById("show-hide-bookmarks-button");
    var innerSpan = showHideBtn.getElementsByTagName("span")[0];
    body = document.getElementById("main");
    var htmlArea = document.getElementById("bookmark-view-container");
    var controllerArea = document.getElementById("hide-show-controller-area");
    if (displayStatus) {
        htmlArea.classList.remove("show");
        body.classList.remove("main-show");
        htmlArea.classList.add("hide");
        innerSpan.classList.remove("glyphicon-menu-up");
        innerSpan.classList.add("glyphicon-menu-down");
        controllerArea.classList.remove("hide-show-controller-area-show");
        controllerArea.classList.add("hide-show-controller-area-hide");
        sendIframeAreaChange("35px","35px");
    } else {
        htmlArea.classList.remove("hide");
        htmlArea.classList.add("show");
        body.classList.add("main-show");
        innerSpan.classList.add("glyphicon-menu-up");
        innerSpan.classList.remove("glyphicon-menu-down");
        controllerArea.classList.add("hide-show-controller-area-show");
        controllerArea.classList.remove("hide-show-controller-area-hide");
        sendIframeAreaChange("360px","442px");
    }

    displayStatus = !displayStatus;
}

function changeStyle(style) {
    if (style >= 0 && style <= 4) {
        sendColorChange(style)
    }
    displayData.colors.forEach(c=>c.active = false);
    displayData.colors[style].active = true;
    render();
}

function initialiseDifficultyButton() {
    $("#difficulty-input").rating({
                                      min: 0,
                                      max: 5,
                                      step: 1,
                                      size: 'xs',
                                      stars: 5,
                                      showClear: false,
                                      showCaption: false,
                                      hoverEnabled: false
                                  });
    $('#difficulty-input').rating('update', displayData.difficulty);
    $('#difficulty-input').on('rating.change', function (event, value, caption) {
        displayData.difficulty = value;
        postInput(displayData);
    });
}

function editNoteText(index) {
    displayData.notes[index].editable = true;
    render();
}

function saveNoteText(index) {
    var newNoteText = document.getElementById("editable-note-" + index).value;
    displayData.notes[index].note = newNoteText;
    displayData.notes[index].editable = false;
    postInput(displayData, render);
}
function removeNoteText(index) {
    displayData.notes.splice(index, 1);
    postInput(displayData, render);
}

function addNewNote() {
    displayData.notes.push({note: "", editable: true});
    render();
}

function renderTags() {
    var tags = displayData.tags || [];
    var taggle = new Taggle(tagId, {
        tags: tags,
        duplicateTagClass: 'bounce',
        onTagAdd: function (event, tag) {
            displayData.tags.push(tag);
            postInput(displayData);
        },
        onTagRemove: function (event, tag) {
            displayData.tags = displayData.tags.filter(item => item !== tag);
            postInput(displayData);
        }
    });
    superagent.getAsync("%server%/bookmarks/tags".replace("%server%", serverUrl))
        .then(req=>req.body)
        .then(tags=> {
            $(taggle.getInput()).autocomplete({
                                                  source: tags, // See jQuery UI documentaton for
                                                                // options
                                                  appendTo: taggle.getContainer(),
                                                  position: {
                                                      at: "left bottom",
                                                      of: taggle.getContainer()
                                                  },
                                                  select: function (event, data) {
                                                      event.preventDefault();
                                                      //Add the tag if user clicks
                                                      if (event.which === 1) {
                                                          taggle.add(data.item.value);
                                                      }
                                                  }
                                              });

        }, console.error);
}

function sendIframeAreaChange(width, height) {
    chrome.runtime.sendMessage({from: 'frame', type: 'frame_size_change', width: width, height:height});
}
function sendColorChange(styleId) {
    chrome.runtime.sendMessage({from: 'frame', type: 'color_change', style: styleId});
}
function addListeners() {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        console.log("Received from content_script");
        console.log(msg);
        if (msg.from === 'content_script' && msg.type == 'page_content') {
            displayData = msg;
            displayData.colors = colors;
            if (displayData.notes && displayData.notes.length > 0 && displayData.notes[0]) {
                displayData.notes = displayData.notes.filter(e=>{
                    if (e) {
                        return true;
                    }
                });
                if (typeof displayData.notes[0] === "string") {
                    displayData.notes = displayData.notes.map(e=> {
                        return {note: e, editable: false}
                    });
                }
            }

        }
    });
}

function addDomHandlers() {
    for (var i=0;i<=4;i++ ) {
        var btn=document.getElementById(colorButtonId+i);
        btn.onclick = (function (index) {
            return function () {
                changeStyle(index)
            }
        })(i);
    }
    for (var j=0;j<displayData.notes.length;j++) {

        var noteShowArea = document.getElementById(showNoteId+j);
        if (noteShowArea) {
            var noteText = anchorme(displayData.notes[j].note, {
                attributes:{
                    "target":"_blank"
                }
            });
            noteShowArea.innerHTML = noteText;
        }

        var saveBtn=document.getElementById(saveButtonId+j);
        if (saveBtn) {
            saveBtn.onclick = (function (index) {
                return function () {
                    saveNoteText(index)
                }
            })(j);
        }

        var editBtn=document.getElementById(editButtonId+j);
        if (editBtn) {
            editBtn.onclick = (function (index) {
                return function () {
                    editNoteText(index)
                }
            })(j);
        }
        var removeButton = document.getElementById(removeButtonId+j);
        if (removeButton) {
            removeButton.onclick = (function (index) {
                return function () {
                    removeNoteText(index)
                }
            })(j);
        }
    }
    var addButton = document.getElementById("add-note-button");
    if (addButton) {
        addButton.onclick = addNewNote;
    }
    var showHideBtn = document.getElementById("show-hide-bookmarks-button");
    showHideBtn.onclick = toggleDisplayStatus;
}
function render() {
    body = document.getElementById("main");
    var htmlArea = document.getElementById("bookmark-view-container");
    var templateString = document.getElementById("bookmark-bar-template").innerHTML;
    var template = Handlebars.compile(templateString);
    var html = template(displayData);
    htmlArea.innerHTML = html;
    renderTags();
    initialiseDifficultyButton();

    document.getElementById(browseButtonId).href =
        "%server%/browse.html".replace("%server%", serverUrl);
    addDomHandlers();

}
addListeners();

var renderOnload = function renderOnLoad() {
    var renderTimer = setInterval(function () {
        if (document.readyState === "complete" && displayData.notes) {
            render();
            clearInterval(renderTimer);
        }
    })
};
window.onload = renderOnload;
