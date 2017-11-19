var combinedSettings = chromeStorage.getCombinedSettings();
storage.initCache();
var collectionsPromise = storage.getAllCollections();
var tagsPromise = storage.getAllTags();
var displayData = {
    useless:false
};
var cld = {useless:false};
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

var collectionsId = "collection-selector"

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

function storageFailureHandler() {
    displayData = {};
    $.extend(true,displayData,cld);
    render();
}

function updateStorage() {
    storage.insertOrUpdateEntry(displayData).then(doc=>{
        $.extend(displayData,doc);
        initialiseDifficultyButton()
    },storageFailureHandler);
}
function deleteFromStorage() {
    if(displayData._id) {
        storage.remove(displayData._id).then(()=>sendMessage({from:"frame",type:"delete_bookmark"},"deleteFromStorage"),storageFailureHandler)
    }
}
function initialiseDifficultyButton() {
    $("#difficulty-input").rating('destroy');
    $("#difficulty-input").rating({
        min: 0,
        max: 5,
        step: 1,
        size: 'xs',
        stars: 5,
        showClear: false,
        showCaption: true,
        hoverEnabled: true,
        clearCaptionClass: "width60 label label-default",
        starCaptionClasses: {
            1: 'width60 label label-ok',
            2: 'width60 label label-warning',
            3: 'width60 label label-info',
            4: 'width60 label label-primary',
            5: 'width60 label label-success'
        },
        starCaptions: {
            1: 'Ok',
            2: 'Good',
            3: 'Very Good',
            4: 'Awesome',
            5: 'Greatest'
        }
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
        infoLogger("Current Text = "+newNoteText + " Old Text = "+displayData.note,newNoteText,displayData.note);
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
    var pageTagWords = generateAutoComplete(displayData.title || "");
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
    tagsPromise.then(tags => {
        var tagSet = pageTagWords;
        tags.forEach(tw => {
            tw = singularize(tw);
            tagSet.add(tw)
        });
        var tagArray = Array.from(tagSet);
        tagSet = FuzzySet(tagArray);
        $(taggle.getInput()).autocomplete({
            source: function (req, responseFn) {
                var findings = []
                var term = req.term;
                if (term.length > 3) {
                    var terms = tagSet.get(term, [], 0.6)
                        .map(r => r[1])
                    terms.forEach((m) => findings.push(m))

                }
                if (term.length >= 4) {
                    var terms = tagArray.filter(t => t.includes(term) || t.startsWith(term))
                    terms.forEach((m) => findings.push(m))
                }
                findings = Array.from(new Set(findings))
                responseFn(findings);

            },
            appendTo: taggle.getContainer(),
            position: {
                at: "left bottom",
                of: taggle.getContainer()
            },
            select: function (event, data) {
                event.preventDefault();
                //Add the tag if user clicks
                if (event.which === 1 || event.which === 13) {
                    taggle.add(data.item.value);
                }
            }
        });

    }, promiseRejectionHandler);
}

function renderCollections() {
    var domCollectionElement = document.getElementById(collectionsId)
    var currentCollection = displayData.collection;
    domCollectionElement.onchange = (event)=>{
        if(typeof domCollectionElement.value!=='undefined' 
        && domCollectionElement.value!==null
        && domCollectionElement.value!==displayData.collection) {
            // persist the collection value
            displayData.collection = domCollectionElement.value;
            updateStorage();
        }
    }
    var el=elapser("collections")
    var $select = $("#"+collectionsId)
    collectionsPromise.then(collections=>{
        collections.forEach(c=>{
            var $option = $("<option>")
            $option.attr("value", c)
            if(c===displayData.collection) {
                $option.attr("selected", "selected")
            }
            $option.text(c);
            $select.append($option);
        })
        return collections
    }).then((collections)=>{
        $("#"+collectionsId).dropdown({ "dropdownClass":"dropdown-div"});
        el("rendered")
    }).then((collections)=>{
        if((typeof displayData.collection==='undefined' || displayData.collection===null) 
        && (typeof displayData.lastVisited!=='undefined' && displayData.lastVisited!==null)) {
            displayData.collection=domCollectionElement.value || collections[0]
            
        }
        
    })
}

function sendIframeAreaChange(style) {
    style = style || {};
    var msg = {from: 'frame', type: 'frame_size_change'};
    $.extend(msg,style);
    getTabId().then((tabid)=>sendMessageToTab(msg,tabid,"sendIframeAreaChange"));
}

function addDomHandlers(simplemde) {
    if (displayData.note && displayData.note.length>1 ) {
        if (!simplemde.isPreviewActive()) {
            simplemde.togglePreview();
        }

    }

    window.onbeforeunload = function () {
        triggerSaveIfChanged(simplemde);
    };
    simplemde.codemirror.on("blur", function(){
        triggerSaveIfChanged(simplemde);
    });
    simplemde.codemirror.on("cut", function(instance , event){
        triggerSaveIfChanged(simplemde);
    });
    var timing = false;
    simplemde.codemirror.on("changes", function(instance , event){
        if(!timing) {
            timing = true;
            var to = setTimeout(()=>{
                triggerSaveIfChanged(simplemde);
                timing = false;
                clearTimeout(to);
            },2000)
        }
    });
    simplemde.codemirror.on("beforeChange", function(instance , event){
        infoLogger("beforeChange CodeMirror Event",instance,event);
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
    combinedSettings.then(data=>$.extend(true,combinedSetting,data)).then(()=>setDisplayStatus(combinedSetting.settings.show_on_load,combinedSetting));
    renderCollections();
    renderTags();
    initialiseDifficultyButton();
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
    document.getElementById(browseButtonId).href = browsePageUrl;
    addDomHandlers(simplemde);
}

function getTabId() {
    return new Promise(function (resolve, reject) {
        chrome.tabs.getCurrent(function(tab){
            if(tab && tab.id) {
                resolve(tab.id)
            } else {
                reject("Unable to get current tab id")
            }
        })
    });
}
var tabId = getTabId()
function addListeners() {
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        tabId.then((tab) => {
            if (sender.tab && sender.tab.id === tab) {
                if (msg.from === 'content_script' && msg.type == 'page_content') {
                    displayData = {};
                    $.extend(true, displayData, msg);
                    displayData.note = displayData.note || "";
                    displayData.useless = msg.useless;
                    infoLogger("Iframe: Displaydata init:" + msg.href, displayData, msg);
                    $.extend(true, cld, displayData);

                } else if (msg.from === 'content_script' && msg.type == 'page_content_render') {
                    displayData = {};
                    $.extend(true, displayData, msg);
                    displayData.note = displayData.note || "";
                    $.extend(true, cld, displayData);
                    infoLogger("Iframe: Displaydata init with Render:" + msg.href, displayData, msg);
                    render();
                }
            }
        }, promiseRejectionHandler);
    });
}
addListeners();

var renderOnload = function renderOnLoad() {
    var renderAttemptCount = 0;
    tabId.then(tabid=>sendMessageToTab({from:"frame",type:"request_cld"},tabid,"renderOnload"));
    var renderTimer = setInterval(function () {
        renderAttemptCount++;
        if ((document.readyState === "complete"||document.readyState === "interactive") && displayData.note!==undefined) {
            infoLogger("Rendering frame after attempts:"+renderAttemptCount,displayData);
            render();
            clearInterval(renderTimer);
        } else if (renderAttemptCount>10 && renderAttemptCount < 80) {
            tabId.then(tabid=>sendMessageToTab({from:"frame",type:"request_cld"},tabid,"renderOnload"));
        } else if (renderAttemptCount>120) {
            clearInterval(renderTimer);
        }
    },20);
};
renderOnload();
