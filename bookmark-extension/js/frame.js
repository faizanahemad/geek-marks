var displayData = {
    useless:false
};
var combinedSetting = {};
var body;
var anchorm = function (text) {
    return anchorme(text,{
        attributes:{
            "target":"_blank"
        }
    })
};

var browseButtonId = "browse-button-id";

var tagId = "tag-id";

function setDisplayStatus(status,data) {
    // show = true
    if (status) {
        var showHideBtn = document.getElementById("show-hide-bookmarks-button");
        var innerSpan = showHideBtn.getElementsByTagName("span")[0];
        body = document.getElementById("main");
        var htmlArea = document.getElementById("bookmark-view-container");
        var controllerArea = document.getElementById("hide-show-controller-area");

        htmlArea.classList.remove("hide");
        htmlArea.classList.add("show");
        body.classList.add("main-show");
        innerSpan.classList.add("glyphicon-menu-up");
        innerSpan.classList.remove("glyphicon-menu-down");
        controllerArea.classList.add("hide-show-controller-area-show");
        controllerArea.classList.remove("hide-show-controller-area-hide");
        sendIframeAreaChange(data.style)
    } else {
        var showHideBtn = document.getElementById("show-hide-bookmarks-button");
        var innerSpan = showHideBtn.getElementsByTagName("span")[0];
        body = document.getElementById("main");
        var htmlArea = document.getElementById("bookmark-view-container");
        var controllerArea = document.getElementById("hide-show-controller-area");

        htmlArea.classList.remove("show");
        body.classList.remove("main-show");
        htmlArea.classList.add("hide");
        innerSpan.classList.remove("glyphicon-menu-up");
        innerSpan.classList.add("glyphicon-menu-down");
        controllerArea.classList.remove("hide-show-controller-area-show");
        controllerArea.classList.add("hide-show-controller-area-hide");
        var style = $.extend(true,{},data.style);
        style.height = frameHiddenStyleDefault.height;
        style.width = frameHiddenStyleDefault.width;
        sendIframeAreaChange(style)
    }
}

var toggleDisplayStatus = ()=>{
    combinedSetting.settings.show_on_load = !combinedSetting.settings.show_on_load;
    setDisplayStatus(combinedSetting.settings.show_on_load,combinedSetting);
    chromeStorage.updateSiteSettings({settings:{show_on_load:combinedSetting.settings.show_on_load}})
};

function updateStorage() {
    storage.insertOrUpdateEntry(displayData).then(doc=>{
        $.extend(displayData,doc);
        initialiseDifficultyButton()
    });
}
function deleteFromStorage() {
    if(displayData._id) {
        storage.remove(displayData._id).then(()=>sendMessage({from:"frame",type:"delete_bookmark"}))
    }
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
        displayData.difficulty = parseInt(value);
        updateStorage();
    });
}

function saveNoteText(simplemde) {
    var newNoteText = simplemde.value();
    displayData.note = newNoteText;
    updateStorage();
}

function triggerSaveIfChanged(simplemde) {
    var newNoteText = simplemde.value();
    if(newNoteText!==displayData.note) {
        saveNoteText(simplemde)
    }
}

function markAsUseless() {
    var useless = this.checked;
    displayData.useless = useless;
    updateStorage();
}


function renderTags() {
    var tags = displayData.tags || [];
    var pageTagWords = generateAutoComplete(displayData.title||"");
    var taggle = new Taggle(tagId, {
        tags: tags,
        duplicateTagClass: 'bounce',
        onTagAdd: function (event, tag) {
            displayData.tags.push(tag);
            updateStorage();
        },
        onTagRemove: function (event, tag) {
            displayData.tags = displayData.tags.filter(item => item !== tag);
            updateStorage();
        }
    });
    storage.getAllTags().then(tags=> {
        var tagSet = new Set(tags);
        pageTagWords.forEach(tw=>tagSet.add(tw));
        $(taggle.getInput()).autocomplete({
                                              source: Array.from(tagSet), // See jQuery UI
                                                                                 // documentaton
                                                                                 // for
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

function sendIframeAreaChange(style) {
    style = style || {};
    var msg = {from: 'frame', type: 'frame_size_change'};
    $.extend(msg,style);
    chrome.runtime.sendMessage(msg);
}

function addDomHandlers(simplemde) {
    if (displayData.note && displayData.note.length>1 ) {
        if (!simplemde.isPreviewActive()) {
            simplemde.togglePreview();
        }

    }

    setInterval(()=>{
        triggerSaveIfChanged(simplemde)
    },1000);
    simplemde.codemirror.on("blur", function(){
        triggerSaveIfChanged(simplemde);
    });
    simplemde.codemirror.on("beforeChange", function(instance , event){
        console.log("beforeChange");
        console.log(instance);
        console.log(event);
        var from = event.from;
        var to = event.to;
        if (event.origin === "paste") {
            var lineText = instance.doc.getLine(from.line);
            var toBePasted = [];
            for (var i=0;i<event.text.length;i++) {
                if ((from.ch>1 && lineText.substring(from.ch-2, from.ch)!=="](")  || from.ch<= 1) {
                    var anchormedText = anchorm(event.text[i]);
                    toBePasted.push(anchormedText)
                } else {
                    toBePasted.push(event.text[i])
                }
            }
            event.update(from, to, toBePasted);
        }

    });
    var showHideBtn = document.getElementById("show-hide-bookmarks-button");
    showHideBtn.onclick = toggleDisplayStatus;
    var uselessBtn = document.getElementById("useless-input-id");
    uselessBtn.onclick = markAsUseless;
    var deleteBtn = document.getElementById("delete-button-id");
    deleteBtn.onclick = deleteFromStorage;
}

function render() {
    body = document.getElementById("main");
    var htmlArea = document.getElementById("bookmark-view-container");
    var templateString = document.getElementById("bookmark-bar-template").innerHTML;
    var template = Handlebars.compile(templateString);
    var html = template(displayData);
    htmlArea.innerHTML = html;
    chromeStorage.getCombinedSettings().then(data=>$.extend(true,combinedSetting,data)).then(()=>setDisplayStatus(combinedSetting.settings.show_on_load,combinedSetting));
    var simplemde = new SimpleMDE({
        element: document.getElementById("editable-note"),
        placeholder:"Enter Note Content...",
        promptURLs:false,
        previewRender:function (text) {
            var html = htmlToElements(simplemde.markdown(text));
            var htmlString = Array.from(html).reduce((prev,cur)=>{
                var nextText = "";
                if (cur instanceof Text) {
                    nextText =cur.data;
                } else if (cur instanceof Node && cur.getElementsByTagName && typeof cur.getElementsByTagName==="function") {
                    Array.from(cur.getElementsByTagName("a")).forEach(a=>a.target="_blank");
                    nextText =cur.outerHTML;
                } else {

                }
                return prev+nextText;
            },"");
            return htmlString;

        },
        spellChecker: false,
        renderingConfig: {
            singleLineBreaks: true,
            codeSyntaxHighlighting: true,
        },
        toolbar: ["bold",
                  "code","unordered-list","ordered-list","|", "link","image","horizontal-rule","|","preview","clean-block"],
        spellChecker: false,
        status: false,
        autosave: {
            enabled: false,
            unique_id: "editable-note",
        },
    });
    simplemde.value(displayData.note);


    renderTags();
    initialiseDifficultyButton();

    document.getElementById(browseButtonId).href = browsePageUrl;
    addDomHandlers(simplemde);
}
function addListeners() {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.from === 'content_script' && msg.type == 'page_content') {
            timer("CLD sequence="+msg.sequence);
            displayData = msg;
            displayData.note = displayData.note || "";
            displayData.useless = msg.useless;

        }
    });
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        if (msg.from === 'content_script' && msg.type == 'page_content_render') {
            timer("CLD sequence="+msg.sequence);
            $.extend(true,displayData,msg);
            displayData.note = displayData.note || "";
            render();

        }
    });
}
addListeners();

var renderOnload = function renderOnLoad() {
    var renderAttemptCount = 0;
    var renderTimer = setInterval(function () {
        renderAttemptCount++;
        if ((document.readyState === "complete"||document.readyState === "interactive") && displayData.note!==undefined) {
            render();
            clearInterval(renderTimer);
        }
        if (renderAttemptCount>20 && renderAttemptCount < 60) {
            console.log("Cld request: "+renderAttemptCount);
            sendMessage({from:"frame",type:"request_cld"})
        }
        if (renderAttemptCount>120) {
            clearInterval(renderTimer);
        }
    },50);
};
renderOnload();
