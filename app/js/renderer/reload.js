const parser = require('./../parser/parser.js');

// 实时渲染
// 控制行号的显示与消失
exports.reload = (fileIndex) => {
  // 保持行号和内容的位置同步
  const top = $('.editor').eq(fileIndex).scrollTop()
  $('#lineNumber').scrollTop(top);

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
