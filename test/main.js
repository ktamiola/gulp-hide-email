'use strict';

var concatStream = require('concat-stream');
var obfuscateEmail = require('../');
var fs = require('fs');
var should = require('should');
var File = require('vinyl');

describe('gulp-hide-email', function() {

    // disable CUID id tags, in order to make fair comparisons
    var options = {
        test: true,
        verbose: false,
    };

    describe('for any type of input', function() {
        var file, check, hook;

        var captureStream = function(stream) {
            var oldWrite = stream.write;
            var buf = '';
            stream.write = function(chunk, encoding, callback) {
                buf += chunk.toString(); // chunk is a String or Buffer
                oldWrite.apply(stream, arguments);
            }
            return {
                unhook: function unhook() {
                    stream.write = oldWrite;
                },
                captured: function() {
                    return buf;
                }
            };
        };

        beforeEach(function() {
            file = new File({
                path: 'test/fixtures/idontexist.html',
                contents: ""
            });
            // Used for the console verbose debugging
            // hook = captureStream(process.stdout);
        });


        check = function(stream, done, callback) {
            stream.on('data', function(newFile) {
                newFile.contents.pipe(concatStream({
                    encoding: 'string'
                }, function(data) {
                    callback(data);
                    done();
                }));
            });

            stream.write(file);
            stream.end();
        };

        it('should fallback gracefully if no file has been served', function(done) {
            options.verbose = false;
            var stream = obfuscateEmail(options);

            stream.on('finish', function() {
                done();
            });
            stream.end();

        });

        it('should generate human readable output if option.verbose is true', function(done) {

            file = new File({
                path: 'test/fixtures/index.html',
                contents: fs.readFileSync('test/fixtures/index.html')
            });

            options.verbose = true;
            var stream = obfuscateEmail(options);

            stream.on('finish', function() {
                // console.log('test');
                // hook.unhook();
                // console.log('Hook:'+hook.captured());
                done();
            });
            stream.end();

        });

        it('should use automatic random DOM tags', function(done) {
            options.verbose = true;
            options.test = false;
            var stream = obfuscateEmail(options);

            stream.on('finish', function() {
                // console.log('test');
                // hook.unhook();
                // console.log('Hook:'+hook.captured());
                done();
            });
            stream.end();

        });

    });

    describe('for simualted buffered input', function() {
        var file, check;
        options.verbose = false;

        beforeEach(function() {
            file = new File({
                path: 'test/fixtures/index.html',
                contents: fs.readFileSync('test/fixtures/index.html')
            });

            check = function(stream, done, callback) {
                stream.on('data', function(newFile) {
                    callback(newFile);
                    done();
                });

                stream.write(file);
                stream.end();
            };
        });

        it('should obfuscate <a href="mailto:xxx@xxx.xxx">...</a>', function(done) {
            options.verbose = false;
            options.test = true;
            var stream = obfuscateEmail(options);

            check(stream, done, function(newFile) {
                String(newFile.contents).should.equal(fs.readFileSync('test/fixtures/expected.html', 'utf8'));
            });
        });

        it('should obfuscate <a href="mailto:xxx@xxx.xxx">...</a> and write custom DOM id labels', function(done) {
            options.idPrefix = "test";
            options.verbose = false;
            var stream = obfuscateEmail(options);

            check(stream, done, function(newFile) {
                String(newFile.contents).should.equal(fs.readFileSync('test/fixtures/expectedPrefix.html', 'utf8'));
            });
        });

        it('should trigger events, so other methods in the pipe don\'t hang up!', function(done) {
            options.verbose = false;
            var stream = obfuscateEmail(options);
            stream.on('finish', function() {
                done();
            });

            stream.write(file);
            stream.end();
        });
    });

    describe('for streamed input', function() {
        var file, check;
        options.verbose = false;

        beforeEach(function() {

            file = new File({
                path: 'test/fixtures/index.html',
                contents: fs.createReadStream('test/fixtures/index.html')
            });

            check = function(stream, done, callback) {
                stream.on('data', function(newFile) {
                    newFile.contents.pipe(concatStream({
                        encoding: 'string'
                    }, function(data) {
                        callback(data);
                        done();
                    }));
                });

                stream.write(file);
                stream.end();
            };
        });

        it('should obfuscate <a href="mailto:xxx@xxx.xxx">...</a>', function(done) {
            options.idPrefix = null;
            options.test = true;

            var stream = obfuscateEmail(options);
            check(stream, done, function(data) {
                data.should.equal(fs.readFileSync('test/fixtures/expected.html', 'utf8'));
            });
        });

        it('should obfuscate <a href="mailto:xxx@xxx.xxx">...</a> and write custom DOM id labels', function(done) {
            options.idPrefix = "test";
            var stream = obfuscateEmail(options);
            check(stream, done, function(data) {
                data.should.equal(fs.readFileSync('test/fixtures/expectedPrefix.html', 'utf8'));
            });
        });

    });

});
