const parser = require('./../parser/parser.js');

// 实时渲染
// 控制行号的显示与消失
exports.reload = (fileIndex) => {
  // 保持行号和内容的位置同步
  const top = $('.editor').eq(fileIndex).scrollTop()
  $('#lineNumber').scrollTop(top);

  const fontsize = $('.editor').css('font-size');
  const fontsizeNumber = parseFloat(fontsize);
  const unit = fontsize.slice(-2);
  // 先进行数字的乘法法运算
  // 再进行字符串的连接操作
  const lineHeight = fontsizeNumber * 1.2 + unit;

  // 设置行号和编辑区的line-height
  // 防止中英文字符高度的不一致
  $('#lineNumber div').css('line-height', lineHeight);
  $('.editor').css('line-height', lineHeight);

  const value = $('.editor').eq(fileIndex).val();
  // 这里调用marked进行语法解析
  const hValue = parser.parser(value);

  $('.preview').eq(fileIndex).html(hValue);
  const result = $('.editor').eq(fileIndex).val().match(new RegExp('\n', 'g')); // eslint-disable-line
  const countOfReturn = !result ? 0 : result.length;
  let countOfChildren = $('#lineNumber').children().length;

  // 根据行号的增减来增加或者减少行号元素
  // 如果当前没有内容，则不显示行号
  if (value.length === 0) {
    $('#lineNumber').children().remove();
    return true;
  }

  // 通过换行符来控制行号
  while (countOfChildren !== countOfReturn + 1) {
    if (countOfChildren < countOfReturn + 1) {
      $('<div></div>').html(countOfChildren + 1).appendTo($('#lineNumber'));
      countOfChildren += 1;
    } else if (countOfChildren > countOfReturn + 1) {
      $('#lineNumber').children(':last').remove();
      countOfChildren -= 1;
    }
  }
  // 文件为空时，返回真
  // console.log($('.editor').eq(fileIndex).val().toString().length);
  if ($('.editor').eq(fileIndex).val().toString().length === 0) {
    return true;
  }
  return false;
};
