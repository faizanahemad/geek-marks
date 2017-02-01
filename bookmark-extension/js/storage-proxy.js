function sendUserIdRequest() {
    var msg={};
    msg.from = "storage_proxy";
    msg.type = "user_id_query";
    return sendMessage(msg).then(msg=>msg.userId);
}
var Storage = class Storage {
    constructor() {
        this.userId = "";
        var self = this;
        sendUserIdRequest().then(userId=>self.userId = userId)
    }

    _proxy(data,type) {
        var msg={};
        msg.from = "storage_proxy";
        msg.type = type;
        msg = $.extend(msg,data);
        msg.userId = this.userId;
        return sendMessage(msg);
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
        return this._proxy(msg,"insert_or_update");
    }

    remove(id) {
        var msg={};
        msg.id = id;
        return this._proxy(msg,"remove");
    }

    logVisit(id) {
        var msg={};
        msg.id = id;
        return this._proxy(msg,"visit");
    }
};
var storage = new Storage();
