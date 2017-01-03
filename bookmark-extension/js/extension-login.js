var superagent = Promise.promisifyAll(superagent);
function getQueryParam(name) {
    var parameters = {};
    var query = location.search.substring(1);
    var keyValues = query.split(/&/);
    keyValues.forEach(keyValue => {
        var keyValuePairs = keyValue.split(/=/);
        var key = keyValuePairs[0];
        var value = keyValuePairs[1];
        parameters[key] = value;
    });
    return parameters[name];
}

function login() {
    var creds = {
        username: this.username.value,
        password: this.password.value
    };
    superagent.post(getQueryParam("loginApi")).send(creds).set('Accept', 'application/json').endAsync()
        .then(function (response) {
            if (response.status < 299) {
                closeSuccess();
            } else {

            }
        });
};

var signupLink = document.getElementById("sign-up-link");
signupLink.href = getQueryParam("signUpUrl") + "?signUpApi=" + getQueryParam("signUpApi");

var form = document.getElementById("loginForm");
form.onsubmit = login;

function closeSuccess() {
    var tabid = getQueryParam("tab");
    console.log(chrome.runtime);
    chrome.runtime.sendMessage({from:"login_extension_page",type:"login_info",login:true,id:parseInt(tabid)});
    window.close();
}
