var environment = require("./environment");
var joey = require("joey");
var FS = require("q-io/fs");
var log = require("logging").from(__filename);


var commandOptions = {
    "port": {
        alias: "p",
        describe: "The port to run the server on",
        default: environment.port
    },
    "cache-dir": {
        alias: "d",
        describe: "The directory to cache gists",
        default: "../gists"
    }
};
module.exports = main;
function main(options) {
    var fs = options.fs || FS;
    return joey
        .listen(options.port)
        .then(function (server) {
            console.log("Listening on " + options.port);
        });
}

if (require.main === module) {
    var argv = require("optimist")
        .usage("Usage: $0 [--port=<port>] [--cache-dir=<cache-dir>]")
        //.demand(["port"])
        .options(commandOptions).argv;

    main(argv).done();
}
