const electron = require('electron');
const toolUtil = require('./toolUtil').toolUtil;
const cursorUtil = require('./cursorUtil');
const reload = require('./reload').reload;
const fileUtil = require('./fileUtil').fileUtil;
const fontsizeUtil = require('./fontsizeUtil');
const fontfamilyUtil = require('./fontfamilyUtil');

const ipcRenderer = electron.ipcRenderer;

// 文件的索引
let fileIndex = 0;

//阻止浏览器默认行
$(document).on({
  dragleave: function(e) { // 拖离
    e.preventDefault();
  },
  drop: function(e) { // 拖后放
    e.preventDefault();
  },
  dragenter: function(e) { // 拖进
    e.preventDefault();
  },
  dragover: function(e) { // 拖来拖去
    e.preventDefault();
  }
});

// 文件拖拽上传
$('.editor').on('drop', function(e) {
  e.preventDefault();
  const fileList = e.originalEvent.dataTransfer.files;

  // 如果文件为空则返回
  if (fileList.length === 0) {
    return;
  }
  // 如果不是markdown文件则返回
  if (fileList[0].type !== 'text/markdown') {
    return;
  }
});

// 这里使用事件代理
$('.outer-header').delegate('img', 'click', function click() {
  // 由于这里需要用到this，所以不实用箭头函数
  const index = $(this).attr('data');
  if (index === 'bold') {
    toolUtil.addBold(fileIndex);
  } else if (index === 'italic') {
    toolUtil.addItalic(fileIndex);
  } else if (index === 'link') {
    toolUtil.addLink(fileIndex);
  } else if (index === 'quotation') {
    toolUtil.addQuotation(fileIndex);
  } else if (index === 'code') {
    toolUtil.addCode(fileIndex);
  } else if (index === 'img') {
    toolUtil.addImage(fileIndex);
  } else if (index === 'orderlist') {
    toolUtil.addOrderList(fileIndex);
  } else if (index === 'list') {
    toolUtil.addList(fileIndex);
  } else if (index === 'title') {
    toolUtil.addTitle(fileIndex);
  } else if (index === 'line') {
    toolUtil.addLine(fileIndex);
  }
});

$('#editorContainer').on('input propertychange', 'textarea', () => {
  // 发送文件的状态信息
  if (reload(fileIndex) === true) {
    ipcRenderer.send('mainFile', (event, ['empty', fileIndex]));
  } else {
    ipcRenderer.send('mainFile', (event, ['unsaved', fileIndex]));
  }
});

$('.inner-header').on('click', 'div', (event) => {
  // 通知主进程聚焦点击的标签
  const data = $(event.target).data('path') ? $(event.target).data('path') : $(event.target).parent().data('path');
  ipcRenderer.send('mainFile', (event, ['changeFocusedFile', data]));
});

// 监听编辑区的滚动条滚动，
// 同时保持文字和行号位置的一致
$('.editor').scroll( function () {
  $('#lineNumber').scrollTop($(this).scrollTop());
});

// 监听快捷键操作
ipcRenderer.on('SC', (event, args) => {
  toolUtil[args](fileIndex);
});

// 监听按行操作
ipcRenderer.on('SE', (event, args) => {
  cursorUtil[args](fileIndex);
});

// 监听字号变化
ipcRenderer.on('FS', (event, args) => {
  fontsizeUtil[args]();
});

// 监听字体变化
ipcRenderer.on('FF', (event, args) => {
  fontfamilyUtil.setFontfamily(args);
});

// 监听file通道的上的信息，调用对应的文件操作函数
ipcRenderer.on('file', (event, args) => {
  if (args[0] === 'focus' || args[0] === 'newFile' || args[0] === 'close') {
    fileIndex = args[1].index;
  }
  fileUtil[args[0]](args[1]);
});
