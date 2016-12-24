function loginModal(loginApi, callback) {
    function login() {
        var creds = {
            username: this.username.value,
            password: this.password.value
        };
        superagent.post(loginApi).send(creds).set('Accept', 'application/json').endAsync()
            .then(function (response) {
                if (response.status < 299) {
                    callback(undefined, true);
                    closeSuccess();
                } else {

                }
            });
    };
    var body = document.getElementsByTagName("body")[0];
    var modalDiv = document.createElement("div");
    modalDiv.id = "bookmarkModalLogin";

    var modalTemplate = `<div id="myModal" class="modal" style="display: none; position: fixed; z-index: 1; padding-top: 100px; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.4);">

    <div class="modal-content" style="width: 40%; position: relative; margin: auto; padding: 0; border: 1px solid #888; border-radius: 6px; background-color: #fefefe; box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19); -webkit-animation-name: animatetop; -webkit-animation-duration: 0.4s; animation-name: animatetop; animation-duration: 0.4s;">
        <form id="loginForm" onsubmit="return false;">
            <div class="modal-header" style="padding: 2px 12px; background-color: white; color: black; text-align: center; border-bottom: 1px solid #e5e5e5;">
                <span class="close" style="color: black; float: right; font-size: 24px; font-weight: bold;">&times;</span>
                <h3>Enter your credentials</h3>
            </div>
            <div class="modal-body" style="padding: 2px 16px;">
                <div class="form-group" style="margin-bottom: 15px; margin-top: 15px; margin-right: 15px;">
                    <input id="username" minlength="6" type="text" name="username" autofocus="autofocus" placeholder="Username" required class="form-control" style="margin-bottom: 10px; display: block; margin-left: auto; width: 65%; height: 30px; padding: 4px 10px; margin-top: 16px; margin-right: auto; font-size: 14px; line-height: 1.22857143; color: #555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px;">
                    <input id="password" minlength="8" type="password" name="password" placeholder="Password" required class="form-control" style="margin-bottom: 10px; display: block; margin-left: auto; width: 65%; height: 30px; padding: 4px 10px; margin-top: 16px; margin-right: auto; font-size: 14px; line-height: 1.22857143; color: #555; background-color: #fff; background-image: none; border: 1px solid #ccc; border-radius: 4px;">

                </div>

            </div>
            <div class="modal-footer" style="padding: 2px 12px; background-color: white; color: black; border-top: 1px solid #e5e5e5;">
                <div style="padding: 6px;">
                    <button type="submit" id="login" class="btn btn-login" style="white-space: nowrap; color: #000; border-color: #eea236; margin-left: 85%; display: inline-block; padding: 6px 12px; margin-bottom: 0; font-size: 14px; font-weight: 400; line-height: 1.42857143; text-align: center; background: #fbd00e; vertical-align: middle; -ms-touch-action: manipulation; touch-action: manipulation; cursor: pointer; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; background-image: none; border: 1px solid transparent; border-radius: 4px;"><b>Log&nbsp;in</b></button>
                </div>

            </div>
        </form>
    </div>

    </div>`
    var modalElement = htmlToElement(modalTemplate);
    modalDiv.append(modalElement);
    body.append(modalDiv);
    var modal = document.getElementById('myModal');

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    // When the user clicks the button, open the modal
    function show() {
        modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    span.onclick = function close() {
        modal.style.display = "none";
        callback(false);
    };

    function closeSuccess() {
        modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            close();
        }
    };
    var form = document.getElementById("loginForm");
    form.onsubmit = login;
    show();
}

function popOpen(urlToOpen) {
    var popup_window = window.open(urlToOpen, "myWindow",
                                   "toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=yes, width=1000, height=600");
    try {
        popup_window.focus();
    }
    catch (e) {
        alert(
            "Pop-up Blocker is enabled! Please add this site to your exception list. \n\nUse following link to login: \n\n%loginUrl%".replace(
                "%loginUrl%", loginUrl));
    }
}
function bookmark() {
    window.loginUrl = serverUrl + "/login";
    var loginApi = serverUrl + "/login_api";
    var loginModalAsync = Promise.promisify(loginModal);
    superagent.getAsync(serverUrl + "/check_login").then((res)=> {
        if (res.status === 401) {
            // popOpen(loginUrl);
            loginModalAsync(loginApi).then(()=> {
                init()
            }, console.error);
        } else if (res.status === 200) {
            init();
        }
    }).catch((err)=> {
        console.log(err);
        loginModalAsync(loginApi).then((res)=> {
            if (res) {
                init();
            }
        }, console.error);
        // popOpen(loginUrl);
    })
}
bookmark();
