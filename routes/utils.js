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
function subtractDaysFromNow(days) {
    return Date.now() - days*86400*1000
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
            "protocol": newRecord.protocol || oldRecord.protocol,
            "hostname": newRecord.hostname || oldRecord.hostname,
            "pathname": newRecord.pathname || oldRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty || oldRecord.difficulty,
            "note": newRecord.note || oldRecord.note,
            "title":newRecord.title || oldRecord.title,
            "visits": oldRecord.visits && typeof oldRecord.visits==="number"?oldRecord.visits:1,
            "tags": newRecord.tags || oldRecord.tags || []
        };
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
            "protocol": newRecord.protocol,
            "hostname": newRecord.hostname,
            "pathname": newRecord.pathname,
            "lastVisited": lastVisited,
            "difficulty": newRecord.difficulty,
            "note": newRecord.note,
            "visits": 1,
            "tags": newRecord.tags || [],
            "useless":newRecord.useless || false
        };
        return record
    } else {
        return {}
    }
}

function mergeUserRecord(oldRecord, newRecord) {
    var record = {};
    if (oldRecord && newRecord) {
        record = {
            "username":oldRecord.username,
            "password":newRecord.password||oldRecord.password,
            "email":newRecord.email||oldRecord.email
        };
        return record;
    } else if (oldRecord) {
        return oldRecord
    } else if (newRecord) {
        record = {};
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
    "mergeUserRecord":mergeUserRecord,
    "minsToMilliseconds":minsToMilliseconds,
    "isSuperSet":isSuperSet,
    "subtractDaysFromNow":subtractDaysFromNow,
    "csvToArrayString":csvToArrayString,
    "csvToArrayNumber":csvToArrayNumber
};
