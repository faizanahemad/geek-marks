function createLoginPage(tabid) {

    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        // Must be declared at web_accessible_resources in manifest.json
        var src = chrome.runtime.getURL('extension-login.html');
        return window.open(src+"?tab="+tabid, "_blank");
    }
}

function openRemoteLoginPage(tabid,loginApi,signUpUrl,signUpApi) {
    return window.open(externalLogin+"?tab="+tabid + "&loginApi="+loginApi + "&signUpUrl="+signUpUrl + "&signUpApi=" + signUpApi, "_blank");
}

function popOpen(tabid) {
    infoLogger("Opening Login Page in new tab for tabId: "+tabid);
    var popup_window = createLoginPage(tabid);
    try {
        popup_window.focus();
    }
    catch (e) {
        alert(
            "Pop-up Blocker is enabled! Please add this site to your exception list. \n\nUse following link to login: \n\n%loginUrl%".replace(
                "%loginUrl%", loginUrl));
    }
}
function bookmark(settings) {
    sendMessage({from:"content_script",type:"check_login"},"bookmark").then(msg=>{
        var id = msg.id;
        if(msg.login) {
            init(settings);
        } else if(!msg.inProgress) {
            var toastrString = `
                <div id="toast-container" class="toast-top-right">
                    <div class="toast toast-error" aria-live="assertive">
                        <button type="button" class="toast-close-button" role="button">×</button>
                        <div class="toast-title">Login Error</div>
                        <div class="toast-message">
                            <a><u>Click here to Login to Geek-marks</u></a></div>
                    </div>
                </div>`
            var toastrHtml = htmlToElement(toastrString);
            document.body.appendChild(toastrHtml);
            toastrHtml.getElementsByClassName("toast-message")[0].onclick = ()=>popOpen(id)
            setTimeout(()=>toastrHtml.remove(),10000)

        }
    });
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.from === 'login_extension_page' && msg.type == 'login_info' && msg.login) {
            init(settings);
        }
    });
}
chromeStorage.getCombinedSettings().then(data=>{
    if(data.settings.enabled) {
        bookmark(Promise.resolve(data));
    }
});
