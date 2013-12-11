var environment = require("./environment");
var joey = require("joey");
var FS = require("q-io/fs");
var log = require("logging").from(__filename);
var GistCache = require("./gist-cache");

var commandOptions = {
    "port": {
        alias: "p",
        describe: "The port to run the server on",
        default: environment.port
    },
    "cache-dir": {
        alias: "d",
        describe: "The directory to cache gists",
        default: __dirname + "/../gists"
    }
};
module.exports = main;
function main(options) {
    var fs = options.fs || FS;
    var cache;
    var cacheDir = fs.normal(options["cache-dir"]);

    return fs.makeTree(cacheDir)
    .then(function() {
        cache = new GistCache(fs, cacheDir);
    })
    .then(function() {

        return joey
            .cors(environment.domain, "*", "*")
            .route(function(route) {
                route("gists/:id")
                .method("GET")
                .contentApp(function (request) {
                    return cache.getGist(request.params.id)
                    .then(function(content) {
                        return content;
                    }).fail(function(error) {
                        log("get error: " + error.message);
                        return JSON.stringify({message: "Server error."});
                    });
                });

                route("gists")
                .method("POST")
                .contentApp(function (request) {
                    return request.body.read()
                    .then(function(body) {
                        return cache.saveGist(body)
                        .then(function(content) {
                            return content;
                        }).fail(function(error) {
                            log("save error: " + error.message);
                            return JSON.stringify({message: "Server error."});
                        });
                    });
                });
            })
            .listen(options.port)
            .then(function (server) {
                console.log("Listening on " + options.port);
            });
    });
}

if (require.main === module) {
    var argv = require("optimist")
        .usage("Usage: $0 [--port=<port>] [--cache-dir=<cache-dir>] [--mfiddle-domain=<mfiddle-domain>]")
        //.demand(["port"])
        .options(commandOptions).argv;

    main(argv).done();
}
