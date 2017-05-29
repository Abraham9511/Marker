var marked = require('marked');

var markdownString = '```js\n console.log("hello"); \n```';

marked.setOptions({
    highlight: function(code, lang, callback) {
        require('pygmentize-bundled')({ lang: lang, format: 'html' },
            code, function(err, result) {
                callback(err, result.toString());
            });
    }
});

marked(markdownString, function(err, content) {
    if (err) throw err;
    console.log(content);
});

/*marked.setOptions({
    highlight: function(code) {
        return require('highlight.js').highlightAuto(code).value;
    }
});
*/

console.log(marked(markdownString));
