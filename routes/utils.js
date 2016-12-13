var path = require('path');
const resolve = path.resolve;

const workingDir = process.cwd();
function convertRelativeToAbsolutePath(path) {
    return resolve(path);
}
function minsToMilliseconds(mins) {
    if (mins && typeof mins=="number") {
        return mins*60*1000;
    }
}
function merge(oldRecord, newRecord) {
    var vr = {
        "href": newRecord.href || oldRecord.href,
        "protocol": "http:",
        "hostname": "quiz.geeksforgeeks.org",
        "pathname": "/binary-heap/",
        "lastVisited": 1481303301330,
        "difficulty": 1,
        "notes": [
            "Max Heap:\n<a href='http://ideone.com/9Gr3iQ'><a href='http://ideone.com/9Gr3iQ'>http://ideone.com/9Gr3iQ</a></a>",
            "Min Heap:\n<a href='http://ideone.com/HvUBZM'>http://ideone.com/HvUBZM</a>"
        ],
        "visits": 1,
        "tags": []
    }
    var record = {};
    if (oldRecord && newRecord) {
        var lastVisited = (new Date()).getTime();
        record = {
            "href": newRecord.href || oldRecord.href,
            "protocol": newRecord.protocol || oldRecord.protocol,
            "hostname": newRecord.hostname || oldRecord.hostname,
            "pathname": newRecord.pathname || oldRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty || oldRecord.difficulty,
            "notes": newRecord.notes || oldRecord.notes || [],
            "visits": oldRecord.visits && typeof oldRecord.visits==="number"?oldRecord.visits+1:1,
            "tags": newRecord.tags || oldRecord.tags || []
        };
        return record;
    } else if (oldRecord) {
        return oldRecord
    } else if (newRecord) {
        return newRecord
    } else {
        return {}
    }
}
module.exports = {
    "convertRelativeToAbsolutePath": convertRelativeToAbsolutePath,
    "workingDir": workingDir,
    "merge": merge,
    "minsToMilliseconds":minsToMilliseconds
};
