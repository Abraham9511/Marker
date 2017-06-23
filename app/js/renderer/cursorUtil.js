const reload = require('./reload').reload;

/**
 * 用于光标的显示
 * @param  {[number]} start [起始位置]
 * @param  {[number]} end   [结束位置]
 */
const setSelection = (index, start, end) => {
  const editor = $('.editor')[index];

  editor.setSelectionRange(start, end);
  $('.editor').eq(index).focus();

  // 因为这样改变输入内容时，
  // 并不会触发input和propertyChange事件
  // 所以这里需要自行待用该事件
  reload(index);
};

/**
 * 用于点击图标进行文字的快捷输入
 * @param  {[string]} content [文字内容]
 * @param  {[number]} start   [选择区的开始]
 * @param  {[number]} end     [选择区的结束]
 */
exports.addContent = (index, content, start, end) => {
  let cursor = 0;
  const editor = $('.editor')[index];

  // 获取光标的位置
  if (editor.selectionEnd) {
    cursor = editor.selectionEnd;
  }
  const oldValue = $('.editor').eq(index).val();
  const oldValue1 = oldValue.substring(0, cursor);
  const oldValue2 = oldValue.substring(cursor, oldValue.length);

  // 因为插入行时，不需要提示文字
  // 所以这里将光标至于最后
  if (start === -1 && end === -1) {
    $('.editor').eq(index).val(oldValue + content);
    const len = oldValue.length + content.length;
    setSelection(index, len, len);
  } else {
    $('.editor').eq(index).val(oldValue1 + content + oldValue2);
    setSelection(index, oldValue1.length + start, oldValue1.length + end);
  }
};

// 将光标移到尾部
exports.moveCursorEnd = (fileIndex) => {
  const editor = $('.editor')[fileIndex];
  const value = $('.editor').eq(fileIndex).val();
  const cursor = editor.selectionEnd;
  let index = value.indexOf('\n', cursor);

  // 如果没有找到，说明这是最后一行
  if (index === -1) {
    index = value.length;
  }

  editor.setSelectionRange(index, index);
};

exports.moveCursorThisLineStart = (fileIndex) => {
  const editor = $('.editor')[fileIndex];
  const value = $('.editor').eq(fileIndex).val();
  const cursor = editor.selectionEnd;
  let index = value.lastIndexOf('\n', cursor);

  // 当不存在换行符时，说明这是在第一行
  // 直接将光标移到第一行起始位置
  if (index === -1) {
    index = 0;
  } else {
    // 不加1的话，就是将光标移到上一行的末尾
    index += 1;
  }

  editor.setSelectionRange(index, index);
};

// 按行选择
exports.expandLine = (fileIndex) => {
  const editor = $('.editor')[fileIndex];
  const value = $('.editor').eq(fileIndex).val();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const indexBeforeStart = value.lastIndexOf('\n', start);
  const indexAfterStart = value.indexOf('\n', start);
  const indexBeforeEnd = value.lastIndexOf('\n', end);
  const indexAfterEnd = value.indexOf('\n', end);

  // 说明所有内容都已经被选择了
  if (start === 0 && end === value.length) {
    return; // eslint-disable-line
  } else if (indexBeforeStart === indexBeforeEnd && indexAfterStart === indexAfterEnd) {
    // 说明这是第一次按行选择
    // 加1，使得高亮位于换行符后面
    let index1 = (indexBeforeStart === -1) ? 0 : indexBeforeStart + 1;
    const index2 = (indexAfterStart === -1) ? value.length : indexAfterStart;
    /*
    当光标位于该行结尾处时，
    进行特殊处理
     */
    if (indexBeforeStart === indexAfterStart) {
      index1 = value.lastIndexOf('\n', indexBeforeStart - 1);
    }
    editor.setSelectionRange(index1, index2);
  } else {
    const index1 = (indexBeforeStart === -1) ? 0 : indexBeforeStart + 1;
    const tempIndex = value.indexOf('\n', indexAfterEnd + 1);
    const index2 = (tempIndex === -1) ? value.length : tempIndex;
    editor.setSelectionRange(index1, index2);
  }
};

exports.reduceLine = (fileIndex) => {
  const editor = $('.editor')[fileIndex];
  const value = $('.editor').eq(fileIndex).val();
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const indexBeforeStart = value.lastIndexOf('\n', start);
  const indexAfterStart = value.indexOf('\n', start);
  const indexBeforeEnd = value.lastIndexOf('\n', end);
  const indexAfterEnd = value.indexOf('\n', end);

  // 说明没有内容被选择
  if (start === end) {
    return;
  } else if (indexAfterEnd === indexAfterStart) {
    // 仅有一行被选择
    editor.setSelectionRange(start, start);
  } else if (indexAfterEnd === -1) {
    // 多行选择且最后一行被选择
    editor.setSelectionRange(start, indexBeforeEnd);
  } else {
    // 多行且最后一行没被选择
    const tempIndex = value.lastIndexOf('\n', indexBeforeEnd - 1);
    editor.setSelectionRange(start, tempIndex);
  }
};
