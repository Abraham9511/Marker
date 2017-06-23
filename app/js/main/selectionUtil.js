const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');

const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;

// 通过进程间通信来进行按行操作
exports.expandLine = () => {
  sendMessageToRenderer('SE', 'expandLine');
};

exports.reduceLine = () => {
  sendMessageToRenderer('SE', 'reduceLine');
};
