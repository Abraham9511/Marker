var marked = require('marked');
var renderer = new marked.Renderer();

renderer.heading = function(text, level) {
    var escapedText = text.toLowerCase().replace(/[^\w]+/g, '-');

    return '<h' + level+ '><a name="' +
        escapedText + '" class="archor" href="#' +
        escapedText +
        '"><span class="header-link"></span></a>' +
        text + '</h' + level + '>';
}

console.log(marked('# heading+', {renderer: renderer}));
