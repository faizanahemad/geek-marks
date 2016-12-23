var body = document.getElementsByTagName("body")[0];
var atags = Array.from(document.getElementsByTagName("a"));

var pathnameSet = new Set();
var hrefSet = new Set();
var hrefMap = new Map();
var pathMap = new Map();
var titleMap = new Map();
var iframeId = "bookmark-iframe";

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

var styleMaps = [pinkStyle,greenStyle,grayStyle,blueStyle,redStyle];

var levelStyleMap = blueStyle;


function getTitle() {

    var s0 = function () {
        var title = document.getElementsByTagName("title");
        if (title && title instanceof Array && title.length>0) {
            return title[0].innerText
        }
        return "";
    }

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
    var strategyArray = [s0, s1, s2, s3];
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

        iframe.classList.add(getSiteSpecificStyle(location.host));
        document.body.appendChild(iframe);
    }
}

function getSiteSpecificStyle(host) {
    if (host.indexOf("youtube")>-1) {
        return "iframe-bookmark-youtube";
    }
    return "iframe-bookmark-default"
}

function renderLinks() {
    var uselessIndicatorSpan = `<span style="color: orangered;">&nbsp;[X]</span>`;
    atags.filter((e)=> {

        if (hrefMap.has(e.href) || pathMap.has(e.pathname) || titleMap.has(e.innerText.toLowerCase().trim())) {
            return true;
        }
        return false;
    }).forEach((e)=> {
        var linkConfig = {};

        if (hrefMap.has(e.href)) {
            linkConfig = hrefMap.get(e.href);
        } else if(pathMap.has(e.pathname)) {
            linkConfig = pathMap.get(e.pathname);
        } else if (titleMap.has(e.innerText.toLowerCase().trim())) {
            linkConfig = titleMap.get(e.innerText.toLowerCase().trim())
        }
        var df = linkConfig.difficulty || -1;
        if (df>-1) {
            e.style = levelStyleMap.get(df);
        }
        if (linkConfig.useless) {
            e.append(htmlToElement(uselessIndicatorSpan))
        }
    });
}

function sendBookmarksRequest() {
    var msg={};
    msg.from = "content_script";
    msg.type = "bookmarks_query";
    chrome.runtime.sendMessage(msg);
}

function renderBookmarkLinks(bookmarks) {
    var hrefBookmarkSet = new Set();
    var titleBookmarkSet = new Set();
    var bookmarkIndicatorSpan = `<span style="color: Violet;">&nbsp;[B]</span>`;
    bookmarks.forEach(b=>{
        hrefBookmarkSet.add(b.url);
        titleBookmarkSet.add(b.title);
    });
    atags.filter((e)=>hrefBookmarkSet.has(e.href) || titleBookmarkSet.has(e.innerText.toLowerCase().trim()))
        .forEach((e)=>e.append(htmlToElement(bookmarkIndicatorSpan)));
}


function refreshData(firstRun) {
    superagent.get("%server%/bookmarks".replace("%server%",serverUrl), function (err, resp) {
        if (err !== null) {
            console.log(err);
        }
        var locationData = resp.body || [];
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
            sendCLD();

        }
        if (hrefSet.has(location.href) && firstRun) {
            postInput(cld);
        }
    });
}

function augmentCLD() {
    var thisLocationData = hrefMap.get(location.href) || pathMap.get(location.pathname) ||titleMap.get(cld.title) || {};
    cld.difficulty = thisLocationData.difficulty;
    cld.notes = thisLocationData.notes || [];
    cld.tags = thisLocationData.tags || [];
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

function enableComments() {
    var a=document.getElementById("comment");
    if(a) {
        a.click();
    }
}

function sendCLD() {
    cld.from = "content_script";
    cld.type = "page_content";
    chrome.runtime.sendMessage(cld);
}
function addListeners() {
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.from === 'frame' && msg.type == 'color_change') {
            levelStyleMap = styleMaps[msg.style];
        } else if (msg.from === 'frame' && msg.type == 'frame_size_change' && msg.width && msg.height) {
            var frame=document.getElementById(iframeId);
            frame.style.width = msg.width;
            frame.style.height = msg.height;
        } else if (msg.from === 'background_page' && msg.type == 'bookmarks_response' && msg.bookmarks && msg.bookmarks instanceof Array) {
            renderBookmarkLinks(msg.bookmarks)
        }
    });
}
