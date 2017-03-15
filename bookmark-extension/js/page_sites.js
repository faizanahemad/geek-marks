function getTitle() {

    var s0 = function () {
        var title = document.getElementsByTagName("title");
        if (Array.isArray(title) && title.length>0) {
            return title[0].innerText
        }
        return "";
    };

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
    tmap.set("www.youtube.com",s2);
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

function bootstrapGlyph() {
    var fa = document.createElement('style');
    fa.type = 'text/css';
    var f1 = chrome.extension.getURL('lib/fonts/glyphicons-halflings-regular.eot');
    var f2 = chrome.extension.getURL('lib/fonts/glyphicons-halflings-regular.eot?#iefix');
    var f3 = chrome.extension.getURL('lib/fonts/glyphicons-halflings-regular.woff2');
    var f4 = chrome.extension.getURL('lib/fonts/glyphicons-halflings-regular.woff');
    var f5 = chrome.extension.getURL('lib/fonts/glyphicons-halflings-regular.ttf');
    var f6 = chrome.extension.getURL('lib/fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular');
    var css = `@font-face {
  font-family: 'Glyphicons Halflings';

  src: url('%f1%');
  src: url('%f2%') format('embedded-opentype'), url('%f3%') format('woff2'), url('%f4%') format('woff'), url('%f5%') format('truetype'), url('%f6%') format('svg');
}`.replace("%f1%",f1)
        .replace("%f2%",f2)
        .replace("%f3%",f3)
        .replace("%f4%",f4)
        .replace("%f5%",f5)
        .replace("%f6%",f6);
    fa.textContent = css;
    document.head.appendChild(fa);
}
function youtubeTimeCapture() {
    if(location.hostname==="www.youtube.com" && location.pathname==="/watch") {
        cld.videoTime = cld.videoTime || [];
        bootstrapGlyph();
        var videoElem = document.getElementsByTagName("video")[0];
        var container = document.getElementById("watch7-main-container");
        var data = cld.videoTime;
        var template =
            `<div class="container-fluid" id="youtube-time-cature-area"></div>`;
        var innerTemplate = `<div class="row"></div>`;
        var eachTimerTemplate = `<div class="col-md-4 youtube-time-cature-display"><a>%description% <b>@</b> %time%</a></div>`;
        var deleteSpanTemplate = `<span class="glyphicon glyphicon-trash pull-right youtube-timer-delete"></span>`;
        var addTimerTemplate = `<div class="row">
    <div class="col-md-5 time-capture-description-area">
          <div class="form-group">
            <input type="text" class="form-control time-capture-description-input" id="time-capture-description-input" placeholder="description...">
            <span><b>:</b></span>
          </div>
    </div>
    <div class="col-md-1 time-capture-timer-area">
          <div class="form-group">
            <input type="text" class="form-control" id="time-capture-timer-input" value="0:00">
          </div>
    </div>
    <div class="col-md-2 time-capture-timer-area">
        <button class="btn btn-default time-capture-add-button" id="time-capture-add-button"><span class="glyphicon glyphicon-plus"></span></button>
    </div>
</div>`;



        var tcapArea = document.getElementById(timeCaptureAreaId);
        if(tcapArea){
            tcapArea.remove();
        }

        function timerUpdate(timer,description) {
            var updater = setInterval(()=>{
                if(timer !== document.activeElement && description !==document.activeElement) {
                    timer.value = convertSecondsToMinute(videoElem.currentTime).stringRepresentation
                }
            },500);
            timer.onchange = (e)=>{
                clearInterval(updater);
            };
        }
        function addCallBack() {
            var description = document.getElementById("time-capture-description-input").value;
            var time = document.getElementById("time-capture-timer-input").value;
            time = convertStringToSeconds(time);
            cld.videoTime.push({description:description,time:time});
            updateStorage(cld);

        }
        function playCallBackGenerator(time) {
            return ()=>videoElem.currentTime=time;
        }
        function deleteCallBackGenerator(index) {
            return ()=>{
                cld.videoTime.splice( index, 1 );
                updateStorage(cld);
            };
        }
        var addTimerRow = htmlToElement(addTimerTemplate);
        addTimerRow.getElementsByClassName("time-capture-add-button")[0].onclick = addCallBack;

        // On pressing Enter Add the time with the description.
        addTimerRow.getElementsByClassName("time-capture-description-input")[0].onkeypress = function(e){
            if (!e) e = window.event;
            var keyCode = e.keyCode || e.which;
            if (keyCode == '13'){
                addCallBack();
                return false;
            }
        }

        var htmlContainer = htmlToElement(template);
        var innerContent = htmlToElement(innerTemplate);
        for(var i=0;i<data.length;i++) {
            if(i%3==0) {
                innerContent = htmlToElement(innerTemplate);
                htmlContainer.appendChild(innerContent);
            }
            var eachTimerTemplateHtml = eachTimerTemplate
                .replace("%description%",data[i].description)
                .replace("%time%",convertSecondsToMinute(data[i].time).stringRepresentation);
            var elem = htmlToElement(eachTimerTemplateHtml);
            elem.firstElementChild.onclick = playCallBackGenerator(data[i].time);
            var delSpan = htmlToElement(deleteSpanTemplate);
            delSpan.onclick = deleteCallBackGenerator(i);
            elem.appendChild(delSpan);
            innerContent.appendChild(elem);
        }
        htmlContainer.appendChild(addTimerRow);
        container.prepend(htmlContainer);
        var timer = document.getElementById("time-capture-timer-input");
        var description = document.getElementById("time-capture-description-input");
        timerUpdate(timer,description);
    }
}

function g4gSpecific() {
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
    var a=document.getElementById("comment");
    if(a) {
        a.click();
    }
}
function redirectedLinkColoring(atags) {
    atags.forEach(e=>{
        var domain = processDomainName(e.hostname);
        if(redirectsConfig[domain]) {
            var pathname = e.pathname;
            if(pathname.indexOf("/")===0)
                pathname = pathname.substring(1);
            if(pathname.lastIndexOf("/")===(pathname.length-1))
                pathname = pathname.substring(0,pathname.length-1);

            var followCondition = redirectsConfig[domain].reduce((prev,rc)=>{
                if(prev)
                    return prev;
                else {
                   return pathname.indexOf(rc)===0
                }
            },false);
            if(followCondition) {
                fetch(e.href,{method:'head',redirect:'follow'})
                    .then(res=>res.url,console.error).then(href=>{
                    if (hrefMap.has(href)) {
                        var linkConfig = hrefMap.get(href);
                        var df = linkConfig.difficulty || -1;
                        if (df>-1) {
                            e.style = levelStyleMap.get(df);
                        }
                        if (linkConfig.useless && e.getElementsByClassName("useless-indicator").length==0) {
                            e.append(htmlToElement(uselessIndicatorSpan))
                        } else if (!linkConfig.useless && e.getElementsByClassName("useless-indicator").length>0) {
                            e.getElementsByClassName("useless-indicator")[0].remove();
                        }
                    }
                })
            }
        }
        return false;
    })
}
