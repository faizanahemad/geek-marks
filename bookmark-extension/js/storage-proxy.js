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
var storage = new Storage();
