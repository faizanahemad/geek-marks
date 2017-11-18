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
            d.dateString = dateFns.format(new Date(d.lastVisited),"Do MMM YY, hh:mm a");
            return d;
        })).then(docs=> {
            var html = self.template(docs);
            self.elem.innerHTML = html;
            return docs
        });
    }
};

function generateCompletions(docs) {
    
    
    var concated = docs.map(d=>{
        var videoDescriptions = ""
        if(Array.isArray(d.videoTime)) {
            videoDescriptions = d.videoTime.map(v=>v.description).reduce((acc,cur)=>{acc+" | "+cur},"")
        }

        return {
            autos:d.title +  " "+d.pathname+" "+d.note||"",
            hosts:d.hostname||"",
            videoDescriptions:videoDescriptions
        }
    }).reduce((acc,cur)=>{
        acc.autos = acc.autos + " | "+cur.autos
        acc.hosts = acc.hosts +" | "|cur.hosts
        acc.videoDescriptions = acc.videoDescriptions + " | "+cur.videoDescriptions
        return acc
    },{autos:"",hosts:"",videoDescriptions:""})

    var start = Date.now()
    var autos = Array.from(generateAutoComplete(concated.autos).values());
    var hosts = Array.from(generateAutoComplete(concated.hosts).values())
    .filter(word=>!endsWithArray(word,domains)).filter(w=>w.split(" ").length===1);

    var videoDescriptions = Array.from(generateAutoComplete(concated.videoDescriptions).values());
    var all = autos.concat(hosts,videoDescriptions)
    var end = Date.now()
    var total = end-start
    console.log("total="+(total/1000))

    var fulltexts = docs.map(d=>[d.title,d.pathname,d.hostname]).reduce((acc,cur)=>acc.concat(cur),[])

    return all.concat(fulltexts).filter(word=>typeof word==="string" && word.length>3)
    .filter(w=>!containsTwice(w,"."));
}

function enableAutocompletions(docs) {
    superagent.get("/bookmarks/autocompletions").endAsync()
    .then(r=>r.body, console.error).then(body=>{
        var completions = body.completions
        var lastUpdated = body.lastUpdated
        console.log(body)

        var newDocs = docs.filter(d=>d.lastVisited>=lastUpdated)
        var latestUpdated = newDocs.reduce((largest,doc)=>doc.lastVisited>=largest?doc.lastVisited:largest,0)
        var needsUpdates = newDocs.length>0;
        var autocoms = needsUpdates?generateCompletions(newDocs):[];
        autocoms = autocoms.concat(completions)
        .filter(word=>typeof word==="string" && word.length>3)
        .filter(w=>!containsTwice(w,".")).filter(w=>isNaN(w)).map(w=>w.replace(/[^a-zA-Z0-9_$]+/g, " "))
        return [autocoms,needsUpdates,latestUpdated]
    }).then(u=>{
        var autocoms = u[0]
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
                if (event.which === 1 || event.which === 13) {
                    event.preventDefault();
                    var term = data.item.value
                    searchElem.value = term;
                    onSearchChange(event);
                }
            }
        });
        return [autocoms,u[1],u[2]];
    }).then(updates=>{
        var autocoms = updates[0]
        var needsUpdates = updates[1]
        var lastUpdated = updates[2]

        if(needsUpdates) {
            console.log("Updates added to Autocompletions")
            console.log(updates)
            return superagent.post("/bookmarks/autocompletions").send({completions:autocoms,lastUpdated:lastUpdated})
            .endAsync()
        } else {
            Promise.resolve("Updates not needed for Autocompletion index")
        }
    }).then(console.log, console.error);;
    
    return docs;
}
var display = new DisplayBookmarks("renderResultArea", "renderTemplate");
var compact = document.getElementById("compact-select-input");
compact.onchange = ()=>display.render({compact: !compact.checked});
display.fetchWithFilters({}).render({compact: !compact.checked}).then(enableAutocompletions);


var TagManager = class TagManager {
    constructor(elemId, templateId, tagElemsName, onChangeCallback) {
        this.elem = document.getElementById(elemId);
        this.tags = Promise.resolve([]);
        this.source = document.getElementById(templateId).innerHTML;
        this.template = Handlebars.compile(this.source);
        this.tagElemsName = tagElemsName;
        this.onChangeCallback = onChangeCallback;
        this.tagElems = Promise.resolve([]);
        var tagsOrElem = {checked:false}
        var self = this
        this.taggle = new Taggle("tagInput", {
            tags: [],
            duplicateTagClass: 'bounce',
            onTagAdd: function (event, tag) {
                self.check(tag);
            },
            onTagRemove: function (event, tag) {
                self.uncheck(tag);
                
            }
        });
    }

    fetchAll(filters) {
        var self = this
        this.tags = superagent.get("/bookmarks/tags").query(filters).endAsync()
            .then(req => req.body, console.error).then(tags => tags.sort())
            .then(tags => {
                $(self.taggle.getInput()).autocomplete({
                    source: tags, // See jQuery UI documentaton for options
                    appendTo: self.taggle.getContainer(),
                    position: { at: "left bottom", of: self.taggle.getContainer() },
                    select: function (event, data) {
                        event.preventDefault();
                        //Add the tag if user clicks
                        if (event.which === 1) {
                            self.taggle.add(data.item.value);
                        }
                    }
                });
                return tags
            },console.error);;
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
            this.tagsOrElem = document.getElementById('tagCombinerOr');
            this.tagsOrElem.onchange = self.onChangeCallback;
            var tagElems = Array.from(document.getElementsByName(self.tagElemsName));
            tagElems.forEach(t=>t.onchange=()=>self.onChangeCallback(self,t))
            self.tagElems = Promise.resolve(tagElems);
        });
    }

    uncheck(value) {
        this.tagElems.then(tagElems=>{
            tagElems.forEach(t=>{
                if (t.value===value) {
                    t.checked = false;
                    self.onChangeCallback(self,t)
                }
            })
        })
    }
    check(value) {
        this.tagElems.then(tagElems=>{
            tagElems.forEach(t=>{
                if (t.value===value) {
                    t.checked = true;
                    self.onChangeCallback(self,t)
                }
            })
        })
    }

    getTagsOr() {
        return this.tagsOrElem.checked
    }
    getTags() {
        return this.taggle.getTagValues()
    }
    clearAllTags() {
        this.taggle.removeAll();
    }
};
var tagsOrElem = {checked:false}
var tm  = new TagManager("tag-selector-area","tag-area","tagCheckBox",tagChange);
function tagChange(tagManager,elem) {
    if(elem) {
        elem.checked?tagManager.taggle.add(elem.value):tagManager.taggle.remove(elem.value, true)
    }
    onFilterChange();
}
tm.fetchAll().render()




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

function onCollectionChange() {
    var collections = cm.getSelectedCollections().join(",")
    tm.clearAllTags();
    tm.fetchAll({collections:collections}).render();
    onFilterChange();
}
var cm  = new CollectionManager("collection-selector-area","collection-area","collectionCheckBox",onCollectionChange);
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
(function () {
    var oldVal;
    $('#'+"searchInput").on('change textInput input cut propertychange paste', function (e) {
        var val = this.value;
        if (val !== oldVal) {
            oldVal = val;
            onSearchChange(e);
        }
    });
}());
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

function onSearchChange(event) {
    var search = searchElem.value;
    if((search!==null&&search.length>3) 
    || (event.type==="input" && (event.originalEvent.inputType.includes("delete")))) {
        onFilterChange()
    }
}

function getAllFilters() {
    var visitedWithin = parseInt(visitedWithinElem.value);
    var visitedBefore = parseInt(visitedBeforeElem.value);
    var visitsGreaterThan = parseInt(visitsGreaterThanElem.value);
    var search = searchElem.value;
    var useless = uselessElem.checked;
    var tagsOr = tm.getTagsOr();

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
    var tags = tm.getTags().join(",");
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
