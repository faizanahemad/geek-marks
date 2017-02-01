var body = document.getElementsByTagName("body")[0];
var atags = Array.from(document.getElementsByTagName("a"));

var hrefMap = new Map();
var pathMap = new Map();
var titleMap = new Map();
var iframeId = "bookmark-iframe";
var timeCaptureAreaId = "youtube-time-cature-area";
var uselessIndicatorSpan = `<span class="useless-indicator" style="color: mediumvioletred;">&nbsp;[X]</span>`;




var cld = {};

function createIframe(data) {
    var style = data.style || {};
    if (document.getElementById(iframeId)) {
        document.getElementById(iframeId).remove();
    }

    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        var iframe = document.createElement('iframe');
        // Must be declared at web_accessible_resources in manifest.json
        iframe.src = chrome.runtime.getURL('frame.html');
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
    atags = Array.from(document.getElementsByTagName("a"));
    atags.filter((e)=> hrefMap.has(e.href) || pathMap.has(e.pathname) || titleMap.has(e.innerText.toLowerCase().trim()))
        .forEach((e)=> {
        var linkConfig = {};

        if (hrefMap.has(e.href)) {
            linkConfig = hrefMap.get(e.href);
        } else if(pathMap.has(e.pathname) && location.hostname!=="www.youtube.com") {
            linkConfig = pathMap.get(e.pathname);
        } else if (titleMap.has(e.innerText.toLowerCase().trim())) {
            linkConfig = titleMap.get(e.innerText.toLowerCase().trim())
        }
        var df = linkConfig.difficulty || -1;
        if (df>-1) {
            e.style = levelStyleMap.get(df);
        }
        if (linkConfig.useless && e.getElementsByClassName("useless-indicator").length==0) {
            e.append(htmlToElement(uselessIndicatorSpan))
        } else if (!linkConfig.useless && e.getElementsByClassName("useless-indicator").length>0) {
            e.getElementsByClassName("useless-indicator")[0].remove();
        }
    });
    redirectedLinkColoring();
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
            "protocol": location.protocol,
            "hostname": location.hostname,
            "pathname": location.pathname,
            "title":getTitle()
        };
        hrefMap.clear();
        pathMap.clear();
        titleMap.clear();
    }
    var allPromise = storage.getAll();
    allPromise.then(locationData=>{
        locationData.forEach((e)=> {
            hrefMap.set(e["href"], e);
            pathMap.set(e["pathname"],e);

            if (e.title) {
                titleMap.set(e.title, e)
            }
        });
        if (firstRun) {
            infoLogger("CLD before Augment",cld);
            augmentCLD();
            infoLogger("CLD after Augment",cld);
            sendCLD(1);
            if (hrefMap.has(location.href)) {
                recordVisit(cld._id)
            }
        }
    });
    allPromise.then(undefined,console.error);
    return allPromise
}

function firstRunDisplay() {
    prepareData(true).then(()=>{
        youtubeTimeCapture();
        renderLinks();
    });
}

function refreshDisplay() {
    prepareData(false).then(renderLinks)
}

function augmentCLD() {
    var thisLocationData = hrefMap.get(location.href) ||titleMap.get(cld.title) || null;
    if (!thisLocationData) {
        if (location.hostname!=="www.youtube.com") {
            thisLocationData = pathMap.get(location.pathname) || {};
        } else {
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
    cld.protocol= cld.protocol||thisLocationData.protocol;
    cld.hostname= cld.hostname||thisLocationData.hostname;
    cld.pathname= cld.pathname||thisLocationData.pathname;
    cld.title=cld.title||getTitle();
    if (cld.useless==undefined) {
        cld.useless=false;
    }
}
function sendCLD(sequence) {
    cld.from = "content_script";
    cld.type = "page_content";
    cld.sequence = sequence || -1;
    infoLogger("Sending CLD",cld);
    sendMessage(cld);
}
function sendCLDWithRender(sequence) {
    cld.from = "content_script";
    cld.type = "page_content_render";
    cld.sequence = sequence || -1;
    sendMessage(cld);
}

function updateStorage(data) {
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
    },1000);
    function eventListener(msg, sender, sendResponse) {
        if (msg.from === 'frame' && msg.type == 'frame_size_change' && msg.width && msg.height) {
            var frame=document.getElementById(iframeId);
            frame.style.width = msg.width+ "px";
            frame.style.height = msg.height+ "px";
            frame.style.top = msg.top+ "px";
            frame.style.right = msg.right+ "px";
        } else if (msg.from === 'frame' && msg.type == 'request_cld') {
            sendCLD(3);
        } else if (msg.from === 'background_page' && msg.type == 'storage_change') {
            refreshDisplayIndicator = true;
        }
    }
    chrome.runtime.onMessage.addListener(eventListener);
    return {listeners:[eventListener],timers:[refreshTimer]}
}
