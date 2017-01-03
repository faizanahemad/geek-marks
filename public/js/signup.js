var superagent = Promise.promisifyAll(superagent);
var actionArea = document.getElementById("action-area");
var successMessage = `<span class="small text-success"> <span class="glyphicon glyphicon-ok"></span>&nbsp; User Created. Close this page. </span>`;
var failureMessage = `<span class="small text-danger"> <span class="glyphicon glyphicon-ok"></span>&nbsp; %error% </span>`;
function signup() {
    var creds = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    actionArea.innerHTML="";
    superagent.post(getQueryParam("signUpApi")).send(creds).set('Accept', 'application/json').endAsync()
        .then(function (response) {
            if (response.status < 299) {
                actionArea.prepend(htmlToElement(successMessage))
            } else {
                actionArea.prepend(htmlToElement(failureMessage.replace("%error%",response.body.error)))
            }
        },(response)=>{
            actionArea.prepend(htmlToElement(failureMessage.replace("%error%",response.response.body.error)))
        });
};


var submitButton = document.getElementById("submit-button");
submitButton.onclick = signup;
