var body = document.getElementsByTagName("body")[0];
var hrefMap = new Map();
var pathMap = new Map();
var titleMap = new Map();
var iframeId = "bookmark-iframe";
var timeCaptureAreaId = "youtube-time-cature-area";
var uselessIndicatorSpan = `<span class="useless-indicator" style="color: mediumvioletred;">&nbsp;[X]</span>`;




var cld = {};
var cldAugmented = false;

function createIframe(data) {
    var style = data.style || {};
    if (document.getElementById(iframeId)) {
        document.getElementById(iframeId).remove();
    }

    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        var iframe = document.createElement('iframe');
        // Must be declared at web_accessible_resources in manifest.json
        iframe.src = chrome.runtime.getURL('frame.html') + '?page_url=' + encodeURIComponent(location.href);
        document.body.appendChild(iframe);
        iframe.id = iframeId;

        iframe.classList.add("iframe-bookmark-default");
        iframe.style.top = style.top+ "px";
        iframe.style.right = style.right+ "px";
        iframe.style.width = style.width + "px";

        iframe.style.height = style.height+ "px";
        if(data.settings && data.settings.show_on_load) {
        } else {
            iframe.style.height = frameHiddenStyleDefault.height+ "px";
            iframe.style.width = frameHiddenStyleDefault.width + "px";
        }

    }
}

function renderLinks() {
    var atags = Array.from(document.getElementsByTagName("a"));
    atags.filter((e)=> hrefMap.has(e.href) || pathMap.has(e.pathname) || titleMap.has(e.innerText.toLowerCase().trim()))
        .forEach((e)=> {
        var linkConfig = {};

        if (hrefMap.has(e.href)) {
            linkConfig = hrefMap.get(e.href);
        } else if(pathMap.has(e.pathname) && location.hostname!=="www.youtube.com" && e.hostname!=="www.youtube.com") {
            linkConfig = pathMap.get(e.pathname);
        } else if (e.innerText.length>0 && titleMap.has(e.innerText.toLowerCase().trim())) {
            linkConfig = titleMap.get(e.innerText.toLowerCase().trim())
        }
        var df = linkConfig.difficulty || -1;
        if (df>-1) {
            e.style = levelStyleMap.get(df);
        }
        if (linkConfig.useless) {
            e.style = levelStyleMap.get(0);
        }
    });
    redirectedLinkColoring(atags);
}

function recordVisit(id) {
    var timeTracker = 0;
    var visitTimer = setInterval(()=>{
        if(document.hasFocus()) {
            timeTracker+=10;
            if(timeTracker>=60) {
                storage.logVisit(id);
                clearInterval(visitTimer);
            }
        }
    },10000);
}
//TODO: prepareData(true) is called 2 times, optimise to call once
function prepareData(firstRun) {
    if(firstRun) {
        cld = {
            "href": location.href,
            "hostname": location.hostname,
            "pathname": location.pathname,
            "title":getTitle()
        };
        hrefMap.clear();
        pathMap.clear();
        titleMap.clear();
    }
    var el = elapser("Render elapser")
    var allPromise = storage.getAll();
    allPromise.then(locationData=>{
        el("All promise got:")
        locationData.forEach((e)=> {
            hrefMap.set(e["href"], e);
            pathMap.set(e["pathname"],e);
            titleMap.set(e.title, e);
        });
        hrefMap.delete(undefined);
        pathMap.delete(undefined);
        titleMap.delete(undefined);
        hrefMap.delete(null);
        pathMap.delete(null);
        titleMap.delete(null);
        hrefMap.delete("");
        pathMap.delete("");
        titleMap.delete("");
        augmentCLD();
        if (firstRun) {
            sendCLD(1);
            if (hrefMap.has(location.href)) {
                recordVisit(cld._id)
            }
        }
    }).catch(promiseRejectionHandler);
    return allPromise
}

function refreshDisplay() {
    prepareData(false).then(renderLinks)
}

function augmentCLD() {
    var titleBasedLocationData = cld.title.length>0?titleMap.get(cld.title):null;
    var thisLocationData = hrefMap.get(location.href) ||titleBasedLocationData || null;
    if (!thisLocationData) {
        if (location.hostname!=="www.youtube.com") {
            thisLocationData = pathMap.get(location.pathname) || {};
        } else {
            // TODO: reconsider this logic
            var entries = Array.from(hrefMap.entries());
            var entry = entries.filter(e=>e[0].startsWith(location.href))[0];
            if(Array.isArray(entry) && entry.length==1) {
                thisLocationData = entry[1];
            } else {
                thisLocationData = {}
            }
        }
    }
    augmentCldWithData(thisLocationData);
    cldAugmented = true;
}

function augmentCldWithData(thisLocationData) {
    cld.difficulty = thisLocationData.difficulty;
    if(thisLocationData.note) {
        cld.note = thisLocationData.note;
    }
    cld.tags = thisLocationData.tags || [];
    cld.useless = thisLocationData.useless;
    cld._id = thisLocationData._id;
    cld.videoTime = thisLocationData.videoTime || cld.videoTime|| [];
    cld.userId = thisLocationData.userId || cld.userId;
    cld.href= cld.href||thisLocationData.href;
    cld.hostname= cld.hostname||thisLocationData.hostname;
    cld.pathname= cld.pathname||thisLocationData.pathname;
    cld.title=cld.title||getTitle();
    cld.collection = thisLocationData.collection;
    cld._id=thisLocationData._id;
    if (cld.useless==undefined) {
        cld.useless=false;
    }
}
function sendCLD(sequence) {
    cld.from = "content_script";
    cld.type = "page_content";
    cld.sequence = sequence || -1;
    sendMessage(cld,"sendCLD");
}
function sendCLDWithRender(sequence) {
    cld.from = "content_script";
    cld.type = "page_content_render";
    cld.sequence = sequence || -1;
    sendMessage(cld,"sendCLDWithRender");
}

function updateStorage(data) {
    infoLogger("From Page Insert/Update",data);
    storage.insertOrUpdateEntry(data).then((entry)=>{
        augmentCldWithData(entry);
        sendCLDWithRender();
        youtubeTimeCapture();
    });
}
function addListeners() {
    var refreshDisplayIndicator = false;
    var refreshTimer = setInterval(()=>{
        if (refreshDisplayIndicator && document.hasFocus()) {
            refreshDisplay();
            refreshDisplayIndicator = false;
        }
    },500);
    function eventListener(msg, sender, sendResponse) {
        if (msg.from === 'frame' && msg.type == 'frame_size_change' && msg.width && msg.height) {
            var frame=document.getElementById(iframeId);
            frame.style.width = msg.width+ "px";
            frame.style.height = msg.height+ "px";
            frame.style.top = msg.top+ "px";
            frame.style.right = msg.right+ "px";
        } else if (msg.from === 'frame' && msg.type == 'request_cld' && cldAugmented) {
            sendCLD(3);
        } else if (msg.from === 'background_page' && msg.type == 'storage_change') {
            infoLogger("Storage change msg from background page:",msg);
            refreshDisplayIndicator = true;
        } else if(msg.from==="storage_proxy_failure" && msg.type==="storage_failure") {
            toastr["error"]("Not saved, "+msg.message, "Save Error")
        }
    }
    chrome.runtime.onMessage.addListener(eventListener);
    return {listeners:[eventListener],timers:[refreshTimer]}
}
