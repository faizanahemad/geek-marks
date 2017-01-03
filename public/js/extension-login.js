var superagent = Promise.promisifyAll(superagent);
var failureMessage = `<span class="small text-danger"> <span class="glyphicon glyphicon-ok"></span>&nbsp; %error% </span>`;
var actionArea = document.getElementById("action-area");

function login() {
    var creds = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value
    };
    actionArea.innerHTML="";
    superagent.post(getQueryParam("loginApi")).send(creds).set('Accept', 'application/json').endAsync()
        .then(function (response) {
            if (response.status < 299) {
                closeSuccess();
            } else {
                actionArea.prepend(htmlToElement(failureMessage.replace("%error%",response.body.error)))
            }
        },(response)=>{actionArea.prepend(htmlToElement(failureMessage.replace("%error%",response.response.body.error)))});
}
var submitButton = document.getElementById("submit-button");
submitButton.onclick = login;

var signupLink = document.getElementById("sign-up-link");
signupLink.href = getQueryParam("signUpUrl") + "?signUpApi=" + getQueryParam("signUpApi");

function closeSuccess() {
    window.close();
}
