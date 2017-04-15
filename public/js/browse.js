var superagent = Promise.promisifyAll(superagent);
var DisplayBookmarks = class DisplayBookmarks {
    constructor(elemId, templateId) {
        this.elem = document.getElementById(elemId);
        this.docs = Promise.resolve([]);
        this.source = document.getElementById(templateId).innerHTML;
        this.template = Handlebars.compile(this.source);
    }

    fetchAll() {
        this.docs = superagent.getAsync("/bookmarks").then(req=>req.body, console.error);
        return this;
    }

    fetchWithFilters(filters) {
        this.docs = superagent.get("/bookmarks/search").query(filters).endAsync().then(req=>req.body, console.error);
        return this;
    }

    render(options) {
        var self = this;
        options = options || {};
        this.docs.then(docs=>docs.filter(d=>!d.useless).map(d=> {
            d.options = options;
            d.dateString = dateFns.format(new Date(d.lastVisited),"Do MMM, hh:mm a");
            return d;
        })).then(docs=> {
            var html = self.template(docs);
            self.elem.innerHTML = html;
        });
        return this;
    }
};

var display = new DisplayBookmarks("renderResultArea", "renderTemplate");
var compact = document.getElementById("compact-select-input");
compact.onchange = ()=>display.render({compact: !compact.checked});
display.fetchAll().render({compact: !compact.checked});


var TagManager = class TagManager {
    constructor(elemId, templateId, tagElemsName, onChangeCallback) {
        this.elem = document.getElementById(elemId);
        this.tags = Promise.resolve([]);
        this.source = document.getElementById(templateId).innerHTML;
        this.template = Handlebars.compile(this.source);
        this.tagElemsName = tagElemsName;
        this.onChangeCallback = onChangeCallback;
        this.tagElems = Promise.resolve([]);
    }

    fetchAll() {
        this.tags = superagent.getAsync("/bookmarks/tags")
            .then(req=>req.body, console.error).then(tags=>tags.sort());
        return this;
    }

    render() {
        var self = this;
        this.tags.then(tags=> {
            var html = self.template(tags);
            self.elem.innerHTML = html;
            var hiderButton = document.getElementById("tag-area-show-hide");
            var hider = document.getElementById("tag-area-show-hide-control");
            hiderButton.onclick = function (event) {
                if(this.classList.contains("glyphicon-chevron-down")) {
                    this.classList.add("glyphicon-chevron-up");
                    this.classList.remove("glyphicon-chevron-down");
                    hider.classList.remove("hide");
                } else {
                    this.classList.remove("glyphicon-chevron-up");
                    this.classList.add("glyphicon-chevron-down");
                    hider.classList.add("hide");
                }
            }
            var tagElems = Array.from(document.getElementsByName(self.tagElemsName));
            tagElems.forEach(t=>t.onchange=self.onChangeCallback)
            self.tagElems = Promise.resolve(tagElems);
        });
        return this;
    }

    uncheck(value) {
        this.tagElems.then(t=>{
            t.forEach(tm=>{
                if (tm.value ===value) {
                    tm.checked = false;
                }
            })
        })
    }
    check(value) {
        this.tagElems.then(t=>{
            t.forEach(tm=>{
                if (tm.value ===value) {
                    tm.checked = true;
                }
            })
        })
    }
};
var tm  = new TagManager("tag-selector-area","tag-area","tagCheckBox",tagChange);
tm.fetchAll().render();



var taggle = new Taggle("tagInput", {
    tags: [],
    duplicateTagClass: 'bounce',
    onTagAdd: function (event, tag) {
        onFilterChange();
        tm.check(tag);
    },
    onTagRemove: function (event, tag) {
        onFilterChange();
        tm.uncheck(tag);
    }
});

superagent.getAsync("/bookmarks/tags")
    .then(req=>req.body)
    .then(tags=> {
        $(taggle.getInput()).autocomplete({
                                              source: tags, // See jQuery UI documentaton for options
                                              appendTo: taggle.getContainer(),
                                              position: { at: "left bottom", of: taggle.getContainer() },
                                              select: function(event, data) {
                                                  event.preventDefault();
                                                  //Add the tag if user clicks
                                                  if (event.which === 1) {
                                                      taggle.add(data.item.value);
                                                  }
                                              }
                                          });

    },console.error);

var visitedForm=document.getElementById("date-range-selector-area-form");
var customVisitedSelectorArea = document.getElementById("custom-visited-range-area");
var visitedWithinElem = document.getElementById("visitedWithinInput");
var visitedBeforeElem = document.getElementById("visitedBeforeInput");
var visitsGreaterThanElem = document.getElementById("visitCountInput");
var searchElem = document.getElementById("searchInput");
var uselessElem = document.getElementById("useless-select-input");

var difficultyElemAsc = document.getElementById("difficultyOrderAsc");
var difficultyElemDesc = document.getElementById("difficultyOrderDesc");
var lastVisitedElemAsc = document.getElementById("lastSeenOrderAsc");
var lastVisitedElemDesc = document.getElementById("lastSeenOrderDesc");
var visitsElemAsc = document.getElementById("visitsOrderAsc");
var visitsElemDesc = document.getElementById("visitsOrderDesc");

var difficultiesElem = Array.from(document.getElementsByName("difficultyCheckBox"));



visitedWithinElem.onchange = onFilterChange;
visitedBeforeElem.onchange = onFilterChange;
visitsGreaterThanElem.onchange = onFilterChange;
searchElem.onchange = onFilterChange;
uselessElem.onchange = onFilterChange;

difficultyElemAsc.onchange=onFilterChange;
difficultyElemDesc.onchange=onFilterChange;
lastVisitedElemAsc.onchange=onFilterChange;
lastVisitedElemDesc.onchange=onFilterChange;
visitsElemAsc.onchange=onFilterChange;
visitsElemDesc.onchange=onFilterChange;

difficultiesElem.forEach(d=>d.onchange=onFilterChange);
visitedForm.onchange = visitedFormChangeHandler;

function deleteBookmark(elemId,bookmarkId) {
    var bookmarkElem = document.getElementById(elemId);
    superagent.deleteAsync("bookmarks/entry/"+bookmarkId).then((res)=>{
        bookmarkElem.remove();
    },console.error)
}

function hideCustomVisitedArea() {
    customVisitedSelectorArea.classList.add("hide");
}
function showCustomVistedArea() {
    customVisitedSelectorArea.classList.remove("hide");
}
function visitedFormChangeHandler() {
    console.log("Visited Form change handler called");
    var datePref = parseInt(visitedForm.elements["visitedRadios"].value);
    var visitedWithin = 2;
    var visitedBefore = 1;
    switch(datePref) {
        case 0:
            visitedWithin = 1;
            visitedBefore = 0;
            break;
        case 1:
            visitedWithin = 2;
            visitedBefore = 1;
            break;
        case 2:
            visitedWithin = 3;
            visitedBefore = 2;
            break;
        case 3:
            visitedWithin = 14;
            visitedBefore = 7;
            break;
        case 4:
            visitedWithin = 60;
            visitedBefore = 30;
            break;
        case 5:
            var weekday = (new Date()).getDay();
            visitedWithin = weekday+8;
            visitedBefore = weekday+1;
            break;
        case 6:
            var monthDay = (new Date()).getDate();
            visitedWithin = monthDay+dateFns.getDaysInMonth(dateFns.subMonths(new Date(),1));
            visitedBefore = monthDay;
            break;
    }
    if(datePref!=7) {
        hideCustomVisitedArea();
        visitedBeforeElem.value = visitedBefore;
        visitedWithinElem.value = visitedWithin;
        onFilterChange();
    } else {
        showCustomVistedArea();
    }
}

function getSortOrder(elemAsc,elemDesc) {
    if(elemAsc.checked) {
        return 1
    } else if(elemDesc.checked) {
        return -1
    } else {
        return 0
    }
}


function getAllFilters() {
    var visitedWithin = parseInt(visitedWithinElem.value);
    var visitedBefore = parseInt(visitedBeforeElem.value);
    var visitsGreaterThan = parseInt(visitsGreaterThanElem.value);
    var search = searchElem.value;
    var useless = uselessElem.checked;

    var sort = {
        difficulty: getSortOrder(difficultyElemAsc,difficultyElemDesc),
        lastVisited: getSortOrder(lastVisitedElemAsc,lastVisitedElemDesc),
        visits: getSortOrder(visitsElemAsc,visitsElemDesc)
    };
    if(sort.difficulty==0 && sort.lastVisited==0 && sort.visits==0) {
        sort = {
            lastVisited: -1,
            difficulty: -1,
            visits: -1
        };
    }
    var sort_by = Object.entries(sort).map(pair=>pair[0]).join(",");
    var order_by = Object.entries(sort).map(pair=>pair[1]).join(",");
    var tags = taggle.getTagValues().join(",");
    var difficulty = difficultiesElem.filter(
        i=>i.checked).map(v=>v.value).join(",");
    var qp = {
        tags: tags,
        useless:useless,
        difficulty: difficulty,
        search: search,
        days_within: visitedWithin,
        days_beyond: visitedBefore,
        visits_gte: visitsGreaterThan,
        sort_by: sort_by,
        order_by: order_by
    };
    var query = Object.entries(qp).reduce((prev, cur)=> {
        if (cur[1]) {
            if (typeof cur[1]==="string" && cur[1].length>0) {
                prev[cur[0]] = cur[1];
            } else if (typeof cur[1]!=="string") {
                prev[cur[0]] = cur[1];
            }
        }
        return prev;
    }, {});
    return query;
}

function onFilterChange() {
    display.fetchWithFilters(getAllFilters()).render({compact: !compact.checked});
}

function tagChange() {
    if (this.checked) {
        taggle.add(this.value)
    } else {

        taggle.remove(this.value, true);
    }
}
