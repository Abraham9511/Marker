const cursorUtil = require('./cursorUtil');

const addContent = cursorUtil.addContent;
const moveCursorEnd = cursorUtil.moveCursorEnd;
const moveCursorThisLineStart = cursorUtil.moveCursorThisLineStart;

const toolUtil = {
  addBold: (i) => {
    addContent(i, '**粗体文字**', 2, 6);
  },
  addItalic: (i) => {
    addContent(i, '*斜体文字*', 1, 5);
  },
  addLink: (i) => {
    addContent(i, '[](此处插入链接)', 3, 9);
  },
  addQuotation: (i) => {
    addContent(i, '> 段落引用', 2, 6);
  },
  addCode: (i) => {
    addContent(i, '    代码块', 4, 7);
  },
  addImage: (i) => {
    addContent(i, '![](此处插入图片路径)', 4, 12);
  },
  addOrderList: (i) => {
    addContent(i, '1. 列表项', 3, 6);
  },
  addList: (i) => {
    addContent(i, '* 列表项', 2, 5);
  },
  addTitle: (i) => {
    addContent(i, '# 标题', 2, 4);
  },
  addLine: (i) => {
    addContent(i, '***\n', -1, -1);
  },
  addLineNext: (i) => {
    // 先将光标移到当前行尾部
    // 然后在尾部插入一个换行
    // 最后再将光标移到换行符后面
    moveCursorEnd(i);
    addContent(i, '\n', 1, 1);
  },
  addLineThis: (i) => {
    moveCursorThisLineStart(i);
    addContent('\n', 0, 0);
  },
};

exports.toolUtil = toolUtil;
