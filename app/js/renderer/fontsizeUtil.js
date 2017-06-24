// 增大字号
exports.increaseFontSize = () => {
  const oldFontsize = $('.editor').css('font-size');
  const fontsize = parseFloat(oldFontsize);
  const unit = oldFontsize.slice(-2);
  // 先进行数字的加法运算
  // 再进行字符串的连接操作
  const newFontsize = fontsize + 2 + unit;

  // 最大字体为30px
  if (fontsize < 30) {
    // 行号，编辑区和预览区的字体大小修改
    $('#lineNumber div').css('font-size', newFontsize);
    $('.editor').css('font-size', newFontsize);
    $('.preview').css('font-size', newFontsize);
  }
};

// 减小字号
exports.decreaseFontSize = () => {
  const oldFontsize = $('.editor').css('font-size');
  const fontsize = parseFloat(oldFontsize);
  const unit = oldFontsize.slice(-2);
  // 先进行数字的减法运算
  // 再进行字符串的连接操作
  const newFontsize = fontsize - 2 + unit;

  // 最小字体为10px
  if (fontsize > 12) {
    // 行号，编辑区和预览区的字体大小修改
    $('#lineNumber div').css('font-size', newFontsize);
    $('.editor').css('font-size', newFontsize);
    $('.preview').css('font-size', newFontsize);
  }
};

// 重置字号
exports.resetFontSize = () => {
  const newFontsize = '14px';

  // 行号，编辑区和预览区的字体大小修改
  $('#lineNumber div').css('font-size', newFontsize);
  $('.editor').css('font-size', newFontsize);
  $('.preview').css('font-size', newFontsize);
};
