const electron = require('electron');
const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');

const globalShortcut = electron.globalShortcut;
const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;
const getWebContent = sendMessageToRendererUtil.getWebContent;

// 添加全局快捷键
// 因为主进程无法直接调用渲染进程的代码
// 所以这里采用进程间通信的方式
// 主进程通过一个房间来发送该信息
// 而渲染进程根据信息的不同来调用不同的方法
const addBoldSC = () => {
  globalShortcut.register('CommandOrControl+B', () => {
    sendMessageToRenderer('SC', 'addBold');
  });
};

const addItalicSC = () => {
  globalShortcut.register('CommandOrControl+I', () => {
    sendMessageToRenderer('SC', 'addItalic');
  });
};

const addLinkSC = () => {
  globalShortcut.register('CommandOrControl+H', () => {
    sendMessageToRenderer('SC', 'addLink');
  });
};

const addQuotationSC = () => {
  globalShortcut.register('CommandOrControl+Q', () => {
    sendMessageToRenderer('SC', 'addQuotation');
  });
};

const addCodeSC = () => {
  globalShortcut.register('CommandOrControl+K', () => {
    sendMessageToRenderer('SC', 'addCode');
  });
};

const addImageSC = () => {
  globalShortcut.register('CommandOrControl+G', () => {
    sendMessageToRenderer('SC', 'addImage');
  });
};

const addOrderListSC = () => {
  globalShortcut.register('CommandOrControl+O', () => {
    sendMessageToRenderer('SC', 'addOrderList');
  });
};

const addListSC = () => {
  globalShortcut.register('CommandOrControl+U', () => {
    sendMessageToRenderer('SC', 'addList');
  });
};

const addTitleSC = () => {
  globalShortcut.register('CommandOrControl+T', () => {
    sendMessageToRenderer('SC', 'addTitle');
  });
};

const addLineSC = () => {
  globalShortcut.register('CommandOrControl+R', () => {
    sendMessageToRenderer('SC', 'addLine');
  });
};

const addLineNextSC = () => {
  globalShortcut.register('CommandOrControl+Return', () => {
    sendMessageToRenderer('SC', 'addLineNext');
  });
};

const addLineThisSC = () => {
  globalShortcut.register('CommandOrControl+Shift+Return', () => {
    sendMessageToRenderer('SC', 'addLineThis');
  });
};

// 注册快捷键
const registerSC = () => {
  getWebContent();
  addBoldSC();
  addItalicSC();
  addLinkSC();
  addQuotationSC();
  addCodeSC();
  addImageSC();
  addOrderListSC();
  addListSC();
  addTitleSC();
  addLineSC();
  addLineNextSC();
  addLineThisSC();
};

// 取消快捷键注册
const unregisterSC = () => {
  globalShortcut.unregisterAll();
};

exports.registerSC = registerSC;
exports.unregisterSC = unregisterSC;
