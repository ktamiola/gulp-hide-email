# gulp-hide-email [![Build Status](https://travis-ci.org/ktamiola/gulp-hide-email.svg?branch=master)](https://travis-ci.org/ktamiola/gulp-hide-email)
 A robust gulp email obfuscation plugin with the support for streaming and file buffers.

`gulp-hide-email` can process the most common HTML5 `mailto` cases including:

```html
<a href="mailto:john@appleseed.com?subject=Job%20Application">Apply now</a>
```
after processing becomes,
```javascript
<span id=""><script>document.getElementById("").innerHTML='<n uers="znvygb:wbua@nccyrfrrq.pbz?fhowrpg=Wbo%20Nccyvpngvba">Nccyl abj</n>'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});</script></span>
```
and some relatively nested cases, with multiple DOM elements in-between the `<a></a>` tags:
```html
<a href="mailto:john@appleseed.com?subject=Job%20Application"><span id="something" class="x1 x2 x3" style="padding-bottom: -20px;"><div>Test</div></span></a>
```
which after processing should have the following form:
```javascript
<span id=""><script>document.getElementById("").innerHTML='<n uers="znvygb:wbua@nccyrfrrq.pbz?fhowrpg=Wbo%20Nccyvpngvba"><fcna vq="fbzrguvat" pynff="k1 k2 k3" fglyr="cnqqvat-obggbz: -20ck;"><qvi>Grfg</qvi></fcna></n>'.replace(/[a-zA-Z]/g,function(c){return String.fromCharCode((c<="Z"?90:122)>=(c=c.charCodeAt(0)+13)?c:c-26);});</script></span>
```

## Usage

First, install `gulp-hide-email` as a development dependency:

```shell
npm install --save-dev gulp-hide-email
```

Then, add it to your `gulpfile.js`:

### Email obfuscation
```javascript
var obfuscateEmail = require('gulp-hide-email');

gulp.task('templates', function(){
  gulp.src(['index.html'])
    .pipe(obfuscateEmail())
    .pipe(gulp.dest('build/index.html'));
});
```

## Tests

`gulp-hide-email` can be tested by firing `mocha`. I have implemented the most obvious testing scenarios, that include processing simulated file buffer, stream and sending back event calls.

## API

`gulp-hide-email` accepts options in a form of a typical JSON `Object`.

#### options
Type: `Object`

##### options.test
Type: `boolean`  
Default: `false`

Disable automated generation of DOM id elements. _(This option is implemented only for testing purposes, and should be set to `false` in all `gulp` production scripts.)_
