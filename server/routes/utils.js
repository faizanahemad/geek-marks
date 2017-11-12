var path = require('path');
var addDays = require('date-fns/add_days');
var subDays = require('date-fns/sub_days')
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
function subtractDaysFromNow(days) {
    var dt = new Date(new Date().toDateString());
    days = days - 1;
    if(days<0)
        days=0;
    return subDays(dt,days).getTime();
}
function csvToArrayNumber(values) {
    return csvToArrayString(values)
        .map(v=>parseInt(v.trim()))
        .filter(n=>!isNaN(n))
}
function csvToArrayString(values) {
    if (values && values.length>0) {
        return values.split(",")
    }
    return [];
}
function merge(oldRecord, newRecord) {
    var record = {};
    var lastVisited = Date.now();
    if (oldRecord && newRecord) {
        record = {
            "_id":oldRecord._id,
            "userId":newRecord.userId||oldRecord.userId,
            "href": newRecord.href || oldRecord.href,
            "hostname": newRecord.hostname || oldRecord.hostname,
            "pathname": newRecord.pathname || oldRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty || oldRecord.difficulty,
            "title":newRecord.title || oldRecord.title,
            "videoTime": newRecord.videoTime || oldRecord.videoTime || [],
            "visits": oldRecord.visits && typeof oldRecord.visits==="number"?oldRecord.visits:1,
            "tags": newRecord.tags || oldRecord.tags || []
        };
        if(newRecord.note===undefined) {
            record.note = oldRecord.note;
        } else {
            record.note = newRecord.note;
        }
        if (newRecord.useless!=undefined && newRecord.useless!=null) {
            record.useless = newRecord.useless;
        } else if (oldRecord.useless!=undefined && oldRecord.useless!=null) {
            record.useless = oldRecord.useless;
        } else {
            record.useless = false;
        }
        return record;
    } else if (oldRecord) {
        oldRecord.lastVisited = lastVisited;
        return oldRecord
    } else if (newRecord) {
        record = {
            "userId":newRecord.userId,
            "href": newRecord.href,
            "hostname": newRecord.hostname,
            "pathname": newRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty,
            "note": newRecord.note,
            "visits": 1,
            "tags": newRecord.tags || [],
            "videoTime": newRecord.videoTime || [],
            "useless":newRecord.useless || false
        };
        return record
    } else {
        return {}
    }
}

function isSuperSet(superSet, subSet) {
    return subSet.every(elem => superSet.indexOf(elem) > -1);
}
module.exports = {
    "convertRelativeToAbsolutePath": convertRelativeToAbsolutePath,
    "workingDir": workingDir,
    "merge": merge,
    "minsToMilliseconds":minsToMilliseconds,
    "isSuperSet":isSuperSet,
    "subtractDaysFromNow":subtractDaysFromNow,
    "csvToArrayString":csvToArrayString,
    "csvToArrayNumber":csvToArrayNumber
};
