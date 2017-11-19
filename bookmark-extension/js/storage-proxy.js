var Storage = class Storage {
    constructor() {
    }

    _proxy(data,type) {
        var msg={};
        msg.from = "storage_proxy";
        msg.type = type;
        msg = $.extend(msg,data);
        return sendMessage(msg,"_proxy");
    }
    _proxyWithFailure(data,type) {
        return this._proxy(data,type)
            .then(undefined, ()=>sendMessage({from:"storage_proxy_failure",type:"storage_failure"},"_proxyWithFailure"))
    }

    getAll() {
        var msg={};
        return this._proxy(msg,"get_all");
    }

    getAllCount() {
        return this.getAll().then(doc=>doc.length)
    }

    getAllTags() {
        var msg={};
        return this._proxy(msg,"get_all_tags");
    }

    getAllCollections() {
        var msg={};
        return this._proxy(msg,"get_all_collections");
    }


    insertOrUpdateEntry(entry) {
        var msg={};
        msg.entry = entry;
        return this._proxyWithFailure(msg,"insert_or_update");
    }

    remove(id) {
        var msg={};
        msg.id = id;
        return this._proxyWithFailure(msg,"remove");
    }

    logVisit(id) {
        var msg={};
        msg.id = id;
        return this._proxyWithFailure(msg,"visit");
    }
};

var CacheStorage = class CacheStorage {
    constructor() {
        this.storage = new Storage();
        this.cache = {valid:false}
    }

    getFromCache(key){
        var entry = {}
        function orElse(fn) {
            return fn();
        }

        function en() {
            return entry;
        }

        if(this.cache.valid && typeof this.cache[key]!="undefined") {
            entry = this.cache[key];
            return {getOrElse:en};
        }
        
        
        return {getOrElse:orElse};
    }

    getAll() {
        var self = this;
        return this.getFromCache("all").getOrElse(()=>self.storage.getAll());
    }

    getAllCount() {
        var self = this;
        return this.getFromCache("count").getOrElse(()=>self.storage.getAllCount());
    }

    getAllTags() {
        var self = this;
        return this.getFromCache("tags").getOrElse(()=>self.storage.getAllTags());
    }

    getAllCollections() {
        var self = this;
        return this.getFromCache("collections").getOrElse(()=>self.storage.getAllCollections());
    }

    initCache() {
        this.cache["all"] = this.storage.getAll();
        this.cache["count"] = this.storage.getAllCount();
        this.cache["tags"] = this.storage.getAllTags();
        this.cache["collections"] = this.storage.getAllCollections();
        this.cache.valid = true
    }


    insertOrUpdateEntry(entry) {
        this.cache.valid = false
        return this.storage.insertOrUpdateEntry(entry)
    }

    remove(id) {
        this.cache.valid = false
        return this.storage.remove(id);
    }

    logVisit(id) {
        return this.storage.logVisit(id);
    }
};

var storage = new CacheStorage();
