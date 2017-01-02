var body = document.getElementsByTagName("body")[0];
var atags = Array.from(document.getElementsByTagName("a"));

var hrefMap = new Map();
var pathMap = new Map();
var titleMap = new Map();
var iframeId = "bookmark-iframe";
var timeCaptureAreaId = "youtube-time-cature-area";
var uselessIndicatorSpan = `<span class="useless-indicator" style="color: mediumvioletred;">&nbsp;[X]</span>`;
var bookmarkIndicatorSpan = `<span style="color: Violet;">&nbsp;[B]</span>`;




var cld = {
    "href": location.href,
    "protocol": location.protocol,
    "hostname": location.hostname,
    "pathname": location.pathname,
    "title":getTitle()
};

function createIframe() {
    if (document.getElementById(iframeId)) {
        document.getElementById(iframeId).remove();
    }

    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        var iframe = document.createElement('iframe');
        // Must be declared at web_accessible_resources in manifest.json
        iframe.src = chrome.runtime.getURL('frame.html');
        iframe.id = iframeId;

        iframe.classList.add("iframe-bookmark-default");
        iframe.classList.add(getSiteSpecificStyle(location.host));
        document.body.appendChild(iframe);
    }
}

function renderLinks() {
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

function refreshData(firstRun) {
    if(firstRun){
        timer("RefreshData with firstRun");
    }
    var allPromise = storage.getAll();
    Promise.all([allPromise]).spread(locationData=>{
        locationData.forEach((e)=> {
            hrefMap.set(e["href"], e);
            pathMap.set(e["pathname"],e);

            if (e.title) {
                titleMap.set(e.title, e)
            }
        });
        renderLinks();
        if (firstRun) {
            augmentCLD();
            sendCLD();
            youtubeTimeCapture();
            setTimeout(()=>sendCLD(),300);
            if (hrefMap.has(location.href)) {
                recordVisit(cld._id)
            }
        }
    });
    allPromise.then(undefined,console.error);
    return allPromise
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
    cld.difficulty = thisLocationData.difficulty;
    cld.note = thisLocationData.note;
    cld.tags = thisLocationData.tags || [];
    cld.useless = thisLocationData.useless;
    cld._id = thisLocationData._id;
    cld.videoTime = thisLocationData.videoTime || cld.videoTime|| [];
    cld.userId = thisLocationData.userId || cld.userId;
    if (cld.useless==undefined) {
        cld.useless=false;
    }
}
function sendCLD() {
    cld.from = "content_script";
    cld.type = "page_content";
    sendMessage(cld);
}
function addListeners() {
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.from === 'frame' && msg.type == 'color_change') {
            levelStyleMap = styleMaps[msg.style];
        } else if (msg.from === 'frame' && msg.type == 'frame_size_change' && msg.width && msg.height) {
            var frame=document.getElementById(iframeId);
            frame.style.width = msg.width;
            frame.style.height = msg.height;
        } else if (msg.from === 'frame' && msg.type == 'request_cld') {
            sendCLD();
        }
    });
}
