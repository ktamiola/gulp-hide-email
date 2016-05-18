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

    describe('for simualted buffered input', function() {
        var file, check;

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
            var stream = obfuscateEmail(options);

            check(stream, done, function(newFile) {
                String(newFile.contents).should.equal(fs.readFileSync('test/fixtures/expected.html', 'utf8'));
            });
        });

        it('should obfuscate <a href="mailto:xxx@xxx.xxx">...</a> and write custom DOM id labels', function(done) {
            options.idPrefix = "test";
            var stream = obfuscateEmail(options);

            check(stream, done, function(newFile) {
                String(newFile.contents).should.equal(fs.readFileSync('test/fixtures/expectedPrefix.html', 'utf8'));
            });
        });

        it('should trigger events so other methods in the pipe don\'t hang up!', function(done) {
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
