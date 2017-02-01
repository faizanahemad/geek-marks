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
        this.docs.then(docs=>docs.map(d=> {
            d.options = options;
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

var visitedWithinElem = document.getElementById("visitedWithinInput");
var visitedBeforeElem = document.getElementById("visitedBeforeInput");
var visitsGreaterThanElem = document.getElementById("visitCountInput");
var searchElem = document.getElementById("searchInput");
var uselessElem = document.getElementById("useless-select-input");
var difficultyElem = Array.from(document.getElementsByName("difficultyOrder"));
var lastVisitedElem = Array.from(document.getElementsByName("lastSeenOrder"));
var visitsElem = Array.from(document.getElementsByName("visitsOrder"));
var difficultiesElem = Array.from(document.getElementsByName("difficultyCheckBox"));



visitedWithinElem.onchange = onFilterChange;
visitedBeforeElem.onchange = onFilterChange;
visitsGreaterThanElem.onchange = onFilterChange;
searchElem.onchange = onFilterChange;
uselessElem.onchange = onFilterChange;
difficultyElem.forEach(d=>d.onchange=onFilterChange);
lastVisitedElem.forEach(d=>d.onchange=onFilterChange);
visitsElem.forEach(d=>d.onchange=onFilterChange);
difficultiesElem.forEach(d=>d.onchange=onFilterChange);

function deleteBookmark(elemId,bookmarkId) {
    var bookmarkElem = document.getElementById(elemId);
    superagent.deleteAsync("bookmarks/entry/"+bookmarkId).then((res)=>{
        bookmarkElem.remove();
    },console.error)
}


function getAllFilters() {
    var visitedWithin = parseInt(visitedWithinElem.value);
    var visitedBefore = parseInt(visitedBeforeElem.value);
    var visitsGreaterThan = parseInt(visitsGreaterThanElem.value);
    var search = searchElem.value;
    var useless = uselessElem.checked;

    var sort = {
        difficulty: difficultyElem[0].checked ? -1 : 1,
        lastVisited: lastVisitedElem[0].checked ? -1 : 1,
        visits: visitsElem[0].checked ? -1 : 1
    };
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
