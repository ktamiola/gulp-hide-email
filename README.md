# gulp-hide-email

[![Build Status](https://travis-ci.org/ktamiola/gulp-hide-email.svg?branch=master)](https://travis-ci.org/ktamiola/gulp-hide-email) [![npm version](https://badge.fury.io/js/gulp-hide-email.svg)](https://badge.fury.io/js/gulp-hide-email) [![Dependencies](https://david-dm.org/ktamiola/gulp-hide-email.svg)](https://david-dm.org/ktamiola/gulp-hide-email.svg) [![Coverage Status](https://coveralls.io/repos/github/ktamiola/gulp-hide-email/badge.svg?branch=master)](https://coveralls.io/github/ktamiola/gulp-hide-email?branch=master)

A robust email obfuscation (pseudo-encryption) plugin with the support for streaming and file buffers, perfectly suited for complex **gulp** tasks. `gulp-hide-email` automatically detects email links and replaces them with efficient, non-blocking inline JavaScript.

`gulp-hide-email` can process the most common HTML5 `mailto` cases including:

```html
<a href="mailto:john@appleseed.com?subject=Job%20Application">Apply now</a>
```
which after processing becomes,
```javascript
<span id="">
  <script>document.getElementById("").innerHTML='<n uers="znvygb:wbua@nccyrfrrq.pbz?fhowrpg=Wbo%20Nccyvpngvba">Nccyl abj</n>'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
  </script>
</span>
```
Heavily nested cases with multiple DOM elements in-between the `<a>...</a>` tags can also be processed,
```html
<a href="mailto:john@appleseed.com?subject=Job%20Application">
  <span id="something" class="x1 x2 x3" style="padding-bottom: -20px;">
    <div>Test</div>
  </span>
</a>
```
yielding,
```javascript
<span id="">
  <script>document.getElementById("").innerHTML='<n uers="znvygb:wbua@nccyrfrrq.pbz?fhowrpg=Wbo%20Nccyvpngvba"><fcna vq="fbzrguvat" pynff="k1 k2 k3" fglyr="cnqqvat-obggbz: -20ck;"><qvi>Grfg</qvi></fcna></n>'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});
  </script>
</span>
```
The resultant JavaScript is efficient and unobtrusive, hence you should not observe any noticeable drop in the rendering performance, nor a render-blocking behavior. Please check [http://www.tamiola.com](http://www.tamiola.com) for working **demo**. We have replaced multiple `mailto:` instances on our page.
## Usage

First, install `gulp-hide-email` as a development dependency:

```shell
npm install --save-dev gulp-hide-email
```

Then, add it to your `gulpfile.js`:

### Email obfuscation
```javascript
var obfuscateEmail = require('gulp-hide-email');

gulp.task('obfuscate', function(){
  gulp.src(['index.html'])
    // Obfuscate Block
    .pipe(obfuscateEmail({verbose: true}))
    // End of Obfuscate Block
    .pipe(gulp.dest('build/index.html'));
});
```

## Tests

`gulp-hide-email` can be tested by firing `mocha`. I have implemented the most obvious testing scenarios, that include processing simulated file buffer, data stream and sending back event calls.

In order to run the bundled tests and check the installation, simply execute,

```javascript
npm test
```

## API

`gulp-hide-email` accepts options in a form of a typical JSON `Object`.

#### options
Type: `Object`

##### options.idPrefix
Type: `string`  
Default: `null`

Generate custom DOM `id` tags, labeled in a sequential order for the inline JavaScript code. _This option may come in handy, when you want to do some extra operations on the "injected" JavaScript code, and need to know the DOM `id` tags a priori. By default, `gulp-hide-email` generates random labels._

```javascript
.pipe(obfuscateEmail({ idPrefix:"obfuscate_" }))
```
will yield,
```javascript
<span id="obfuscate_1"><script>document.getElementById("obfuscate_1").innerHTML='<!---OBFUSCATED CODE--->'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});</script></span>
```

##### options.verbose
Type: `boolean`  
Default: `false`

Produce detailed output from obfuscation. _Useful for debugging and supervision, especially when you deal with multiple `mailto:` instances and you want to see what went into `gulp-hide-email`._

```javascript
.pipe(obfuscateEmail({ verbose:true }))
```

##### options.test
Type: `boolean`  
Default: `false`

Disable automated generation of DOM id elements. _(This option is implemented only for testing purposes, and should be set to `false` in all `gulp` production scripts.)_
