const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');

const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;

// 通过进程间通信来进行字体大小的设置
exports.setFontfamily = (fontfamily) => {
  sendMessageToRenderer('FF', fontfamily);
};
