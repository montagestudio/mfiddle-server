/*global module, require*/
var https = require("https");
var Q = require("q");
var log = require("logging").from(__filename);

var GITHUB_HOSTNAME = "api.github.com";
var CLIENT_ID = "4c7857dab25eac35def6";
var CLIENT_SECRET = "65368bf982fc52f92b0b72bf15363c0f50d12f40";

module.exports = Gist;

function Gist() {}

Gist.prototype.getGist = function(id) {
    return this._request({
        path: "/gists/" + id,
        method: "GET"
    });
};

Gist.prototype.saveGist = function(contents) {
    return this._request({
        path: "/gists",
        method: "POST",
        data: contents
    });
};

Gist.prototype._request = function(o) {
    var options = {
            hostname: GITHUB_HOSTNAME,
            path: o.path + "?client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET,
            method: o.method
        },
        deferred = Q.defer(),
        request;

    request = https.request(options, function(response) {
        var data = "";

        response.on("data", function(chunk) {
            data += chunk;
        });
        response.on("end", function() {
            var statusCode = response.statusCode;

            if (statusCode >= 200 && statusCode < 300) {
                var limit = response.headers['x-ratelimit-limit'];
                var remaining = response.headers['x-ratelimit-remaining'];
                log("ratelimit: " + remaining + "/" + limit);

                deferred.resolve(data);
            } else {
                deferred.reject(new Error("Github response error: " + statusCode + " " + data));
            }
        });
    });

    request.setHeader("Accept", "application/vnd.github.v3");
    request.setHeader("User-Agent", "montagejs/mfiddle");
    if (o.data) {
        request.setHeader("Content-Type", "application/x-www-form-urlencoded");
        request.write(o.data);
    }

    request.on("error", function() {
        deferred.reject(new Error("Problem while communicating with github."));
    });

    request.end();

    return deferred.promise;
};