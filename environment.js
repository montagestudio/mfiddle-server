var URL = require("url");

function Env(options) {
    var env = options || {  production: process.env.NODE_ENV === "production" };

    env.port = process.env.MFIDDLE_PORT || 2440;

    if(env.production) {
        env.domain = "http://montagejs.github.io";
    } else {
        env.domain = "http://localhost";
    }

    return env;
}

module.exports = Env();
// for testing
module.exports.Env = Env;
