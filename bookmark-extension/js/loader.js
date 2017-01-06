function createLoginPage(tabid,loginApi,signUpUrl,signUpApi) {
    var iframeId = "extension-login-iframe";
    if (document.getElementById(iframeId)) {
        document.getElementById(iframeId).remove();
    }

    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        // Must be declared at web_accessible_resources in manifest.json
        var src = chrome.runtime.getURL('extension-login.html');
        return window.open(src+"?tab="+tabid + "&loginApi="+loginApi + "&signUpUrl="+signUpUrl + "&signUpApi" + signUpApi, "_blank");
    }
}

function openRemoteLoginPage(tabid,loginApi,signUpUrl,signUpApi) {
    return window.open(externalLogin+"?tab="+tabid + "&loginApi="+loginApi + "&signUpUrl="+signUpUrl + "&signUpApi=" + signUpApi, "_blank");
}

function popOpen(tabid,loginApi,signUpUrl,signUpApi) {
    var popup_window = createLoginPage(tabid,loginApi,signUpUrl,signUpApi);
    try {
        popup_window.focus();
    }
    catch (e) {
        alert(
            "Pop-up Blocker is enabled! Please add this site to your exception list. \n\nUse following link to login: \n\n%loginUrl%".replace(
                "%loginUrl%", loginUrl));
    }
}
var superagent = Promise.promisifyAll(superagent);
function bookmark() {
    window.loginUrl = serverUrl + "/login";
    var loginApi = serverUrl + "/login_api";
    sendMessage({from:"content_script",type:"check_login"}).then(msg=>{
        var id = msg.id;
        if(msg.login) {
            init();
        } else {
            popOpen(id,loginApi,signUpUrl,signUpApi);
        }
    });
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.from === 'login_extension_page' && msg.type == 'login_info' && msg.login) {
            init();
        }
    });
}
chromeStorage.getCombinedSettings().then(data=>{
    if(data.settings.enabled) {
        if(Offline.state) {
            bookmark();
        }
        if(data.settings.notes) {
            Offline.options = {checks: {xhr: {url: healthUrl}}};
            Offline.check();
        }
    }
})
