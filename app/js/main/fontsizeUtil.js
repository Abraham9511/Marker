const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');

const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;

// 通过进程间通信来进行字体大小的设置
exports.increaseFontSize = () => {
  sendMessageToRenderer('FS', 'increaseFontSize');
};

exports.decreaseFontSize = () => {
  sendMessageToRenderer('FS', 'decreaseFontSize');
};

exports.resetFontSize = () => {
  sendMessageToRenderer('FS', 'resetFontSize');
};
