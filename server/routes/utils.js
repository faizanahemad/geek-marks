var path = require('path');
var addDays = require('date-fns/add_days');
var subDays = require('date-fns/sub_days')
var _ = require('lodash')
var CSet = require("collections/set");
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

function isSuperSet(superSet, subSet) {
    return subSet.every(elem => superSet.indexOf(elem) > -1);
}

function isSetIntersect(first,second) {
    if(Array.isArray(first) && Array.isArray(second)) {
        var s1 = new CSet(first)
        var inters = s1.intersection(second).toArray();
        if(inters.length>0) {
            return true;
        }
    }
    return false;
    
}

function _singleSort(a,b,s) {
    var comparedVal = 0
    for (const [ key, value ] of Object.entries(s)) {
        if((_.isNil(a[key])||_.isNaN(a[key]))&& (_.isNil(b[key])||_.isNaN(b[key]))) {
            return 0
        } else if(_.isNil(a[key])||_.isNaN(a[key])) {
            return 1
        } else if(_.isNil(b[key])||_.isNaN(b[key])) {
            return -1
        } else if(value===1) {
            comparedVal = a[key] - b[key];
            
        } else if(value===-1) {
            comparedVal = b[key] - a[key];
        }
        
        if(_.isNil(comparedVal)||_.isNaN(comparedVal)) {
            return 0
        } else {
            return comparedVal
        }
    }
}

function createSortFn(sort) {
    if(typeof sort==='undefined'|| sort===null||!Array.isArray(sort)||sort.length===0) {
        return (a,b)=>0
    }
    // null or undefined last
    var sortFn = (a,b)=>{
        var sortVal = 0
        for(s of sort) {
            if(sortVal===0) {
                sortVal = _singleSort(a,b,s)
            }
        }
        return sortVal;
    }
    return sortFn;
}
module.exports = {
    "convertRelativeToAbsolutePath": convertRelativeToAbsolutePath,
    "workingDir": workingDir,
    "minsToMilliseconds":minsToMilliseconds,
    "isSuperSet":isSuperSet,
    "subtractDaysFromNow":subtractDaysFromNow,
    "csvToArrayString":csvToArrayString,
    "createSortFn":createSortFn,
    "isSetIntersect":isSetIntersect,
    "csvToArrayNumber":csvToArrayNumber
};
