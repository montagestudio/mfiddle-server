/*global module, require */
var Gist = require("./gist");
var Q = require("q");

module.exports = GistCache;

function GistCache(fs, root) {
    this._fs = fs;
    this._root = root;
    this._gist = new Gist();
}

GistCache.prototype.getGist = function(id) {
    var self = this;

    return this._exists(id).then(function(exists) {
        if (exists) {
            return self._read(id);
        } else {
            return self._gist.getGist(id).then(function(contents) {
                return self._write(id, contents);
            });
        }
    });
};

GistCache.prototype.saveGist = function(contents) {
    var self = this;

    return this._gist.saveGist(contents).then(function(data) {
        var gist = JSON.parse(data);
        return self._write(gist.id, data);
    });
};

GistCache.prototype._getFilename = function(id) {
    // Only allow digits
    id = id.replace(/[^\d]/g, "");

    if (id) {
        return Q.resolve(this._fs.join(this._root, id + ".json"));
    } else {
        return Q.reject(new Error("No id given"));
    }
};

GistCache.prototype._exists = function(id) {
    var self = this;

    return this._getFilename(id).then(function(filename) {
        return self._fs.exists(filename);
    });
};

GistCache.prototype._read = function(id) {
    var self = this;

    return this._getFilename(id).then(function(filename) {
        return self._fs.read(filename);
    }).then(function(contents) {
        return contents.toString();
    });
};

GistCache.prototype._write = function(id, contents) {
    var self = this;

    return this._getFilename(id).then(function(filename) {
        return self._fs.write(filename, contents);
    }).then(function() {
        return contents;
    });
};