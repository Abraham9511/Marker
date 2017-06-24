const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');

const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;

// 通过进程间通信来进行行号显示与隐藏
exports.toggleLinenumber = () => {
  sendMessageToRenderer('LN', true);
};
