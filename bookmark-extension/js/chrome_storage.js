var ChromeStorage = class ChromeStorage {
    constructor() {
        this.db = chrome.storage.sync;
        this.globalKey = "bookmarks_extension_global_settings"
    }

    _transformForStorage(item){
        item = item || {};
        item.style = item.style || {};
        item.settings = item.settings || {};
        item.settings.path = item.settings.path || {};
        var storeItem = {};
        storeItem["style"] = {
            "top":item.style.top||globalSettings.style.top,
            "right":item.style.right||globalSettings.style.right,
            "height":item.style.height||globalSettings.style.height,
            "width":item.style.width||globalSettings.style.width
        };
        if(item.style.color!==undefined && item.style.color!=null) {
            storeItem.style.color=item.style.color;
        }
        var settings = {};
        storeItem["settings"] = settings;
        if(item.settings.enabled===undefined || item.settings.enabled==null) {
            settings.enabled = false;
        } else {
            settings.enabled = item.settings.enabled
        }
        if(item.settings.show_on_load===undefined || item.settings.show_on_load==null) {
            settings.show_on_load = false;
        } else {
            settings.show_on_load = item.settings.show_on_load
        }
        if(item.settings.bookmarks===undefined || item.settings.bookmarks==null) {
            settings.bookmarks = false;
        } else {
            settings.bookmarks = item.settings.bookmarks
        }
        if(item.settings.notes===undefined || item.settings.notes==null) {
            settings.notes = false;
        } else {
            settings.notes = item.settings.notes
        }

        var path = {};
        settings.path = path;
        if(item.settings.path.startsWith===undefined || item.settings.path.startsWith==null) {
            path.startsWith = false;
        } else {
            path.startsWith = item.settings.path.startsWith
        }
        if(item.settings.path.endsWith===undefined || item.settings.path.endsWith==null) {
            path.endsWith = false;
        } else {
            path.endsWith = item.settings.path.endsWith
        }
        if(item.settings.path.equals===undefined || item.settings.path.equals==null) {
            path.equals = false;
        } else {
            path.equals = item.settings.path.equals
        }
        if(item.settings.path.contains===undefined || item.settings.path.contains==null) {
            path.contains = false;
        } else {
            path.contains = item.settings.path.contains
        }
        path.value = item.settings.path.value || "";

        return storeItem;
    }

    _transformForView(item) {
        var itemPresent = item?true:false;
        item = this._transformForStorage(item);
        item.present = itemPresent;
        return item;
    }

    _currentDomainPath() {
        return sendMessage({type:"domain_path_query"},"_currentDomainPath")
    }

    get(key) {
        var self = this;
        return new Promise(function (resolve, reject) {
            try {
                return self.db.get(key,function (result) {
                    if(chrome.runtime.lastError || chrome.extension.lastError) {
                        var error = chrome.runtime.lastError || chrome.extension.lastError;
                        infoLogger("Error in Chrome Storage get",error);
                        resolve(false);
                    }
                    resolve(result)
                })
            } catch(e) {
                return null;
            }
        }).then((d)=>d,promiseRejectionHandler);
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
        }).then((d)=>d,promiseRejectionHandler);
    }

    getGlobalSettings() {
        var self = this;
        return self.get(self.globalKey).then(data=> {
            data = data || {};
            return data[self.globalKey]
        }).then((data)=> {
            return self._transformForView(data)
        })
    }

    getSpecificSiteSettings(domain) {
        domain = processDomainName(domain);
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

    getCombinedSettings() {
        return Promise.join(this.getGlobalSettings(),this.getSiteSettings())
            .then(combined=>{
                var site = combined[1];
                var global = combined[0];
                var item = {};
                item.style = site.style || global.style;
                if(item.style.color==undefined) {
                    if( global.style.color!==undefined) {
                        item.style.color = global.style.color
                    } else {
                        item.style.color = globalSettings.style.color
                    }
                }
                item["settings"] = site.settings;
                if(!global.settings.enabled || !site.settings.enabled) {
                    item.settings.enabled = false;
                    item.settings.show_on_load = false;
                    item.settings.bookmarks =  false;
                    item.settings.notes = false;
                }
                return item;
        })
    }

    setGlobalSettings(settings) {
        settings = this._transformForStorage(settings);
        var self = this;
        var persist = {};
        persist[self.globalKey] = settings;
        return self.set(persist)
    }

    setSpecificSiteSettings(domain, settings) {
        domain = processDomainName(domain);
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

    updateSiteSettings(settings) {
        var self = this;
        this.getSiteSettings().then(data=>{
            $.extend(true,data,settings);
            return data;
        }).then(data=>self.setSiteSettings(data))
    }
};
var chromeStorage = new ChromeStorage();
