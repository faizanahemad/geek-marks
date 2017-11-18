function timer(text) {
    console.log(text+":"+Date.now()+", relative time:"+(Date.now()%100000))
}

function elapser(text) {
    var tn = Date.now();
    var showElapse = function showElapse(extra) {
        var tnew = Date.now()
        var tdiff = tnew - tn;
        console.log("Elapsed time for: "+text+" "+extra+" = "+tdiff);
    }
    return showElapse;
}

var doNothingFunc = ()=>{};

function getLogger() {

    var infoLogger = function(arg1, arg2, arg3, arg4) {
        console.log(arg1);
        if(arg2!=null && arg2!=undefined) {
            console.log(arg2);
        }
        if(arg3!=null && arg3!=undefined) {
            console.log(arg3);
        }
        if(arg4!=null && arg4!=undefined) {
            console.log(arg4);
        }
    }
    if(logEnabled) {
        return infoLogger;
    } else {
        return doNothingFunc;
    }
}

var infoLogger = getLogger();
function getStackLogger() {
    var stackLogger = function(arg1, arg2, arg3) {
        var stack = "";
        try {
            throw new Error;
        } catch(err) {
            stack = err.stack;
        }
        infoLogger(arg1,arg2,arg3,stack);
    };
    if(stackTraceLogging) {
        return stackLogger;
    } else {
        return doNothingFunc;
    }
}
var stackLogger = getStackLogger();

function getErrorLogger() {

    var errorLogger = function(arg1, arg2, arg3, arg4) {
        console.error(arg1);
        if(arg2!=null && arg2!=undefined) {
            console.error(arg2);
        }
        if(arg3!=null && arg3!=undefined) {
            console.error(arg3);
        }
        if(arg4!=null && arg4!=undefined) {
            console.error(arg4);
        }
    }
    if(errorLogEnabled) {
        return errorLogger;
    } else {
        return doNothingFunc;
    }
}
var errorLogger = getErrorLogger();
var convertSecondsToMinute = function (seconds) {
    var minutes = parseInt(seconds/60);
    seconds = parseInt(seconds - minutes*60);
    var secondsString = seconds+"";
    if(seconds/10<1){
        secondsString = "0"+secondsString;
    }
    return {
        minutes:minutes,
        seconds:seconds,
        "stringRepresentation":minutes+":"+secondsString
    }
};

var convertStringToSeconds = function (input) {
    var splittedInput = input.split(":");
    if(splittedInput.length>=2) {
       return parseInt(splittedInput[0])*60 + parseInt(splittedInput[1])
    } else {
        return parseInt(splittedInput[0])
    }
}
function sendMessage(msg,uid) {
    var messageString = "Sending message from:"+msg.from;
    if(uid) {
        messageString = uid+" : "+messageString;
    }
    msg.uid = uid;
    return new Promise(function (resolve, reject) {
        chrome.runtime.sendMessage(msg,(reply)=>{
            if(reply===SEND_RESPONSE_AS_FAILURE) {
                reject()
            } else {
                resolve(reply);
            }
        });
    });
}
function sendMessageToTab(msg, tabId, uid) {
    var messageString = "Sending message from:"+msg.from;
    if(uid) {
        messageString = uid+" : "+messageString;
    }
    msg.uid = uid;
    return new Promise(function (resolve, reject) {
        chrome.tabs.sendMessage(tabId,msg,(reply)=>{
            if(reply===SEND_RESPONSE_AS_FAILURE) {
                reject()
            } else {
                resolve(reply);
            }
        });
    });
}
function promiseRejectionHandler(err) {
    errorLogger(err)
    return Promise.reject(err);
}
function randgen() {
    return (Math.random()*1e16).toString(36)
}
function timedPromise(promise,time,uid) {
    var rand = uid||randgen()
    var timedPromise = new Promise(function (resolve, reject) {
        var timeCounter = setTimeout(()=>{
            reject();
        },time);
        promise.then((v)=>{
            resolve(v)
            clearTimeout(timeCounter)
        }, (err)=>{
            reject(err)
            clearTimeout(timeCounter)
        })
    });
    return timedPromise;
}
function processDomainName(domain) {
    if(domain.startsWith("www.")) {
        domain = domain.substring(4);
    }
    return domain;
}
function clearResources(resources) {
    cld = {};
    resources.timers.forEach(t=>clearInterval(t))
    resources.listeners.forEach(r=>chrome.runtime.onMessage.removeListener(r))
}
