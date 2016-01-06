var MAX_BUFFER = 1024 * 10000;

var childProcess = require('child_process');
var RSVP = require('rsvp');

exports.exec = function (cmd) {
    return new RSVP.Promise(function (resolve, reject) {
        var options = {maxBuffer: MAX_BUFFER}
        console.log('Executing:', cmd);
        childProcess.exec(cmd, options, function (error, stdout, stderr) {
            if(stdout){ console.log("STDOUT:", stdout); }
            if(stderr){ console.warn("STDERR:", stderr); }
            if (error !== null) {
                console.error(error);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}