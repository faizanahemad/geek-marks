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

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function closeSuccess() {
    var tabid = getQueryParam("tab");
    console.log(chrome.runtime);
    chrome.runtime.sendMessage({from:"login_extension_page",type:"sync_request",login:true,id:parseInt(tabid)});
    chrome.runtime.sendMessage({from:"login_extension_page",type:"login_info",login:true,id:parseInt(tabid)});

    window.close();
}

var failureMessage = `<span class="small text-danger"> <span class="glyphicon glyphicon-ok"></span>&nbsp; %error% </span>`;
var actionArea = document.getElementById("action-area");

function login() {
    var creds = {
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    actionArea.innerHTML="";
    var emailValidity = validateEmail(creds.email);
    if(!emailValidity) {
        actionArea.prepend(htmlToElement(failureMessage.replace("%error%","Invalid Email Address!")));
        return false;
    }
    if(!creds.password|| (creds.password && creds.password.length<8)) {
        actionArea.prepend(htmlToElement(failureMessage.replace("%error%","Password should be 8 characters atleast!")));
        return false;
    }

    superagent.post(loginApi).send(creds).set('Accept', 'application/json').endAsync()
        .then(function (response) {
            if(response.status < 210 && response.body.created) {
                alert("User created\nemail: %email% \npassword: %password%\n\nEnable the extension on your previous page by clicking on its icon and changing its options".replace("%email%",creds.email).replace("%password%",creds.password));
                closeSuccess();
            } else if (response.status < 210) {
                closeSuccess();
            } else {
                actionArea.prepend(htmlToElement(failureMessage.replace("%error%",response.body.error)))
            }
        },(response)=>{actionArea.prepend(htmlToElement(failureMessage.replace("%error%",response.response.body.error)))});
}
var submitButton = document.getElementById("submit-button");
submitButton.onclick = login;
