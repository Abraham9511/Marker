// 此处负责相关的markdown的解析
// 直接调用marked包解析文法并返回

exports.parser = (value) => {
	// marked 用于解析文档为对应的html
	const marked = require('marked');

	marked.setOptions({
	  renderer: new marked.Renderer(),
	  gfm: true,
	  tables: true,
	  breaks: true,
	  pedantic: false,
	  sanitize: true,
	  smartLists: true,
	  smartypants: false,
	  // 使用hightlight进行高亮
	  highlight: function (code) {
	     return require('highlight.js').highlightAuto(code).value;
	  }
	});

	return marked(value);
};
