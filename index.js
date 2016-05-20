"use strict";

var Transform = require("readable-stream/transform");
var objectAssign = require("object-assign");
var cuid = require("cuid");

// Counter
var idCounter;

// What are we looking for?
var regex = /\<a([^>]+)href\=\"mailto\:([^">]+)\"([^>]*)\>([\s\S]*?)\<\/a\>/ig;
// var protocolRegex = function(protocol) {
    // return new RegExp('/\<a([^>]+)href\=\"' + protocol + '\:([^" > ] + )\"([^>]*)\>([\s\S]*?)\<\/a\>/ig');
// };

String.prototype.encrypt = function() {
    return this.replace(/[a-zA-Z]/ig, function(chr) {
        var cc = chr.charCodeAt(0);
        if (cc >= 65 && cc <= 90) cc = 65 + ((cc - 52) % 26);
        else if (cc >= 97 && cc <= 122) cc = 97 + ((cc - 84) % 26);
        else if (cc >= 48 && cc <= 57) cc = 48 + ((cc - 43) % 10);
        return String.fromCharCode(cc);
    });
};
String.prototype.findAndParseEncrypted = function(options) {
    return this.replace(regex, function(data) {
        var id = (options && options.test) ? "" : cuid();
        id = (options && options.idPrefix) ? options.idPrefix.toString() + idCounter : id;
        if (options && options.verbose) {
            console.log(" - obfuscate [" + idCounter + "] new DOM element id=" + id + " source HTML: " + data);
        }
        idCounter++;
        return "<span id=\"" + id + "\"><script>document.getElementById(\"" + id + "\").innerHTML=\'" + data.encrypt().replace(/(?:\r\n|\t\n|\t\r|\r|\n|\t)/g, " ") + "\'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<=\"Z\"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});</script></span>";
    });
};
String.prototype.parseEncrypted = function(options) {
    return this.replace(this, function(data) {
        var id = (options && options.test) ? "" : cuid();
        id = (options && options.idPrefix) ? options.idPrefix.toString() + idCounter : id;
        if (options && options.verbose) {
            console.log(" - obfuscate [" + idCounter + "] new DOM element id=" + id + " source HTML: " + data);
        }
        idCounter++;
        return "<span id=\"" + id + "\"><script>document.getElementById(\"" + id + "\").innerHTML=\'" + data.encrypt().replace(/(?:\r\n|\t\n|\t\r|\r|\n|\t)/g, " ") + "\'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<=\"Z\"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});</script></span>";
    });
};

// The replacement block given a passing stream
// adopted with modifications from https://github.com/eugeneware/replacestream/blob/master/index.js
function parseEncryptedInStream(options) {
    var tail = "";
    var totalMatches = 0;

    function matchFromRegex(r, o) {
        if (o.regExpOptions) {
            r = new RegExp(r.source, o.regExpOptions);
        }
        // If there is no global flag then there can only be one match
        if (!r.global) {
            o.limit = 1;
        }
        return r;
    }

    var localOptions = objectAssign({
        limit: Infinity,
        encoding: "utf8",
        maxMatchLen: 100
    });

    var match = matchFromRegex(regex, localOptions);

    function transform(buffer, encoding, callback) {
        var matches;
        var lastPos = 0;
        var matchCount = 0;
        var rewritten = "";
        var haystack = tail + buffer.toString(localOptions.encoding);
        tail = "";

        while (totalMatches < localOptions.limit &&
            (matches = match.exec(haystack)) !== null) {

            matchCount++;
            var before = haystack.slice(lastPos, matches.index);
            var regexMatch = matches;
            lastPos = matches.index + regexMatch[0].length;

            if (lastPos > haystack.length && regexMatch[0].length < localOptions.maxMatchLen) {
                tail = regexMatch[0];
            } else {
                var dataToAppend = getDataToAppend(before, regexMatch);
                rewritten += dataToAppend;
            }
        }

        if (tail.length < 1)
            tail = haystack.slice(lastPos) > localOptions.maxMatchLen ? haystack.slice(lastPos).slice(0 - localOptions.maxMatchLen) : haystack.slice(lastPos);

        var dataToQueue = getDataToQueue(matchCount, haystack, rewritten, lastPos);
        callback(null, dataToQueue);
    }

    function getDataToAppend(before, match) {
        var dataToAppend = before;
        totalMatches++;
        // The replacement happens here
        dataToAppend += match[0].parseEncrypted(options);
        return dataToAppend;
    }

    function getDataToQueue(matchCount, haystack, rewritten, lastPos) {
        if (matchCount > 0) {
            if (haystack.length > tail.length) {
                return rewritten + haystack.slice(lastPos, haystack.length - tail.length);
            }
            return rewritten;
        }
        return haystack.slice(0, haystack.length - tail.length);
    }

    function flush(callback) {
        if (tail) {
            this.push(tail);
        }
        callback();
    }

    return new Transform({
        transform: transform,
        flush: flush
    });
}

// The working module
module.exports = function(options) {
    return new Transform({
        objectMode: true,
        transform: function(file, encoding, callback) {
            function obfuscate() {
                // If we are dealing with the stream
                if (file.isStream()) {
                    idCounter = 1;
                    file.contents = file.contents.pipe(parseEncryptedInStream(options));
                    return callback(null, file);
                }
                // If we are dealing with a typical buffer
                if (file.isBuffer()) {
                    idCounter = 1;
                    file.contents = new Buffer(String(file.contents).findAndParseEncrypted(options));
                    return callback(null, file);
                }
                callback(null, file);
            }
            // Do the magic
            obfuscate();
        }
    });
};
