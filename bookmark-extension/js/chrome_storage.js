var ChromeStorage = class ChromeStorage {
    constructor() {
        this.db = chrome.storage.sync;
        this.globalKey = "bookmarks_extension_global_settings"
    }

    _processDomainName(domain) {
        if(domain.startsWith("www.")) {
            domain = domain.substring(4);
        }
        return domain;
    }

    _transformForStorage(item){
        item = item || {};
        item.style = item.style || {};
        item.settings = item.settings || {};
        item.settings.path = item.settings.path || {};
        var storeItem = {}
        storeItem["style"] = {
            "top":item.style.top||globalSettings.style.top,
            "right":item.style.right||globalSettings.style.right,
            "height":item.style.height||globalSettings.style.height,
            "width":item.style.width||globalSettings.style.width
        };
        var settings = {};
        storeItem["settings"] = settings;
        if(item.settings.enabled===undefined || item.settings.enabled==null) {
            settings.enabled = globalSettings.settings.enabled;
        } else {
            settings.enabled = item.settings.enabled
        }
        if(item.settings.show_on_load===undefined || item.settings.show_on_load==null) {
            settings.show_on_load = globalSettings.settings.show_on_load;
        } else {
            settings.show_on_load = item.settings.show_on_load
        }
        if(item.settings.bookmarks===undefined || item.settings.bookmarks==null) {
            settings.bookmarks = globalSettings.settings.bookmarks;
        } else {
            settings.bookmarks = item.settings.bookmarks
        }
        if(item.settings.notes===undefined || item.settings.notes==null) {
            settings.notes = globalSettings.settings.notes;
        } else {
            settings.notes = item.settings.notes
        }

        var path = {};
        settings.path = path;
        if(item.settings.path.startsWith===undefined || item.settings.path.startsWith==null) {
            path.startsWith = globalSettings.settings.path.startsWith;
        } else {
            path.startsWith = item.settings.path.startsWith
        }
        if(item.settings.path.endsWith===undefined || item.settings.path.endsWith==null) {
            path.endsWith = globalSettings.settings.path.endsWith;
        } else {
            path.endsWith = item.settings.path.endsWith
        }
        if(item.settings.path.equals===undefined || item.settings.path.equals==null) {
            path.equals = globalSettings.settings.path.equals;
        } else {
            path.equals = item.settings.path.equals
        }
        if(item.settings.path.contains===undefined || item.settings.path.contains==null) {
            path.contains = globalSettings.settings.path.contains;
        } else {
            path.contains = item.settings.path.contains
        }
        if(item.settings.path.value===undefined || item.settings.path.value==null) {
            path.value = globalSettings.settings.path.value;
        } else {
            path.value = item.settings.path.value || "";
        }

        return storeItem;
    }

    _transformForView(item) {
        var itemPresent = item?true:false;
        item = this._transformForStorage(item);
        item.present = itemPresent;
        return item;
    }

    _currentDomainPath() {
        return sendMessage({type:"domain_path_query"})
    }

    get(key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            try {
                return self.db.get(key,(result)=>{
                    if(chrome.runtime.lastError) {
                        reject(chrome.runtime.lastError);
                        return false;
                    }
                    resolve(result)
                })
            } catch(e) {
                return null;
            }
        }).then((d)=>d,console.error);
    }

    set(persist) {
        var self = this;
        return new Promise(function (resolve, reject) {
            return self.db.set(persist,()=>{
                if(chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return false;
                }
                resolve()
            })
        }).then((d)=>d,console.error);
    }

    getGlobalSettings() {
        var self = this;
        return self.get(self.globalKey).then(data=>{
            data = data||{};
            return data[self.globalKey]
        })
            .then((data)=>{
                return self._transformForView(data)
            })
    }

    getSpecificSiteSettings(domain) {
        domain = this._processDomainName(domain);
        var self = this;
        return self.get(domain)
            .then(data=>{
                data = data||{};
                return data[domain]
            }).then((data)=>{
                return self._transformForView(data)
            })
    }

    getSiteSettings() {
        var self = this;
        return this._currentDomainPath().then(uri=>{
            return self.getSpecificSiteSettings(uri.hostname)
        })
    }

    setGlobalSettings(settings) {
        settings = this._transformForStorage(settings);
        var self = this;
        var persist = {}
        persist[self.globalKey] = settings;
        return self.set(persist)
    }

    setSpecificSiteSettings(domain, settings) {
        domain = this._processDomainName(domain);
        var self = this;
        settings = this._transformForStorage(settings);
        var store = {};
        store[domain] = settings;
        return self.set(store);
    }

    setSiteSettings(settings) {
        var self = this;
        return this._currentDomainPath().then(uri=>{
            return self.setSpecificSiteSettings(uri.hostname, settings)
        })
    }
};
var chromeStorage = new ChromeStorage();
