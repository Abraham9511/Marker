const marked = require('marked');

const markdownString = '```js\n console.log("hello"); \n```';

marked.setOptions({
  highlight: (code, lang, callback) => {
    require('pygmentize-bundled')({ lang, format: 'html' }, code, (err, result) => {
      callback(err, result.toString());
    });
  },
});

marked(markdownString, (err, content) => {
  if (err) {
    throw err;
  }
  console.log(content); // eslint-disable-line
});

// marked.setOptions({
//     highlight: function(code) {
//         return require('highlight.js').highlightAuto(code).value;
//     }
// });


// console.log(marked(markdownString));
