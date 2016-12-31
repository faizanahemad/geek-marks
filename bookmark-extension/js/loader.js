function createLoginPage(tabid,loginApi) {
    var iframeId = "extension-login-iframe";
    if (document.getElementById(iframeId)) {
        document.getElementById(iframeId).remove();
    }

    var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
    if (!location.ancestorOrigins.contains(extensionOrigin)) {
        // Must be declared at web_accessible_resources in manifest.json
        var src = chrome.runtime.getURL('extension-login.html');
        return window.open(src+"?tab="+tabid + "&loginApi="+loginApi, "_blank");
    }
}

function popOpen(tabid,loginApi) {
    var popup_window = createLoginPage(tabid,loginApi);
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
    sendMessage({from:"content_script",type:"tab_id_query"}).then(msg=>{
        return msg.id
    }).then(id=>{
        superagent.getAsync(serverUrl + "/check_login").then((res)=> {
            if (res.status === 401) {
                popOpen(id,loginApi);
                return Promise.reject();
            } else if (res.status === 200) {
                init();
            }
        }).catch((err)=> {
            console.log(err);
            popOpen(id,loginApi);
        });
    })
    chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
        if (msg.from === 'login_extension_page' && msg.type == 'login_info' && msg.login) {
            init();
        }
    });
}
bookmark();
