var superagent = Promise.promisifyAll(superagent);
var DisplayBookmarks = class DisplayBookmarks {
    constructor(elemId, templateId) {
        this.elem = document.getElementById(elemId);
        this.docs = Promise.resolve([]);
        this.source = document.getElementById(templateId).innerHTML;
        this.template = Handlebars.compile(this.source);
    }
    

    fetchWithFilters(filters) {
        this.docs = superagent.get("/bookmarks/search").query(filters).endAsync().then(req=>req.body, console.error);
        return this;
    }

    render(options) {
        var self = this;
        options = options || {};
        return this.docs.then(docs=>docs.map(d=> {
            d.options = options;
            d.dateString = dateFns.format(new Date(d.lastVisited),"Do MMM, hh:mm a");
            return d;
        })).then(docs=> {
            var html = self.template(docs);
            self.elem.innerHTML = html;
            return docs
        });
    }
};

var display = new DisplayBookmarks("renderResultArea", "renderTemplate");
var compact = document.getElementById("compact-select-input");
compact.onchange = ()=>display.render({compact: !compact.checked});
display.fetchWithFilters({}).render({compact: !compact.checked}).then((docs)=>{
    
    var autocoms = docs.map(d=>{
        var all = []
        var autos = generateAutoComplete(d.title +  " "+d.pathname+" "+d.hostname +" "+d.note||"").values();
        var videoDescriptions = []
        if(Array.isArray(d.videoTime)) {
            videoDescriptions = d.videoTime.map(v=>generateAutoComplete(v.description||""))
            .reduce((acc,cur)=>{
                return new Set(Array.from(acc.values()).concat(Array.from(cur.values())))
            },new Set()).values()
        }
        
        return all.concat(Array.from(autos),Array.from(videoDescriptions),[d.title,d.pathname,d.hostname])
    }).reduce((acc,cur)=>acc.concat(cur),[])
    .filter(word=>typeof word==="string" && word.length>3)
    .filter(word=>!endsWithArray(word,domains))
    .filter(w=>!containsTwice(w,"."))
    var autocompleteSet = new FuzzySet(autocoms)
    autocoms = autocompleteSet.values()

    $("#"+"searchInput").autocomplete({
        source: function(req, responseFn) {
          var findings = []
          var term = req.term;
          if(term.length>3) {
              var terms = autocompleteSet.get(term,[],0.6)
              .map(r=>r[1])
              terms.forEach((m)=>findings.push(m))
              
          }
          if(term.length>=4) {
              var terms = autocoms.filter(t=>t.includes(term)||t.startsWith(term))
              terms.forEach((m)=>findings.push(m))
          }
          findings = Array.from(new Set(findings))
          responseFn(findings);
        },
        select: function (event, data) {
            event.preventDefault();
            //Add the tag if user clicks
            if (event.which === 1 || event.which === 13) {
                var term = data.item.value
                searchElem.value = term;
                onSearchChange();
            }
        }
    });
    return docs;
});


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
        return this.tags.then(tags=> {
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
var tagsOrElem = {checked:false}
var tm  = new TagManager("tag-selector-area","tag-area","tagCheckBox",tagChange);
tm.fetchAll().render().then(()=>{
    tagsOrElem = document.getElementById('tagCombinerOr');
    tagsOrElem.onchange = onFilterChange;
});



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




var CollectionManager = class CollectionManager {
    constructor(elemId, templateId, collectionElemsName, onChangeCallback) {
        this.elem = document.getElementById(elemId);
        this.collections = Promise.resolve([]);
        this.source = document.getElementById(templateId).innerHTML;
        this.template = Handlebars.compile(this.source);
        this.collectionElemsName = collectionElemsName;
        this.onChangeCallback = onChangeCallback;
        this.collectionElems = Promise.resolve([]);
    }

    fetchAll() {
        this.collections = superagent.getAsync("/bookmarks/collections")
            .then(req=>req.body, console.error).then(c=>c.sort());
        return this;
    }

    render() {
        var self = this;
        this.collections.then(collections=> {
            var html = self.template(collections);
            self.elem.innerHTML = html;
            var ce = Array.from(document.getElementsByName(self.collectionElemsName));
            ce.forEach(t=>t.onchange=self.onChangeCallback)
            self.collectionElems = Promise.resolve(ce);
        });
        return this;
    }

    getSelectedCollections() {
        var self = this;
        var ce = Array.from(document.getElementsByName(self.collectionElemsName));
        return ce.filter(c=>c.checked).map(c=>c.value)
    }
};
var cm  = new CollectionManager("collection-selector-area","collection-area","collectionCheckBox",onFilterChange);
cm.fetchAll().render();


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
searchElem.onkeypress = onSearchChange;
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

function onSearchChange() {
    var search = searchElem.value;
    if(search!==null&&search.length>3) {
        onFilterChange()
    }
}

function getAllFilters() {
    var visitedWithin = parseInt(visitedWithinElem.value);
    var visitedBefore = parseInt(visitedBeforeElem.value);
    var visitsGreaterThan = parseInt(visitsGreaterThanElem.value);
    var search = searchElem.value;
    var useless = uselessElem.checked;
    var tagsOr = tagsOrElem.checked;

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
    var collections = cm.getSelectedCollections().join(",")
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
        order_by: order_by,
        tags_or: tagsOr,
        collections: collections
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
