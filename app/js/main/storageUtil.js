const electron = require('electron');
const nodeStorage = require('node-localstorage');

const app = electron.app;
const JSONStorage = nodeStorage.JSONStorage;
const storageLocation = app.getPath('userData');
const storage = new JSONStorage(storageLocation);

// 用来获取和窗口相关的所有信息
exports.getWindowState = () => storage.getItem('windowState');

/**
 * [用来设置和窗口有关的所有信息]
 * @param  {[boolean]} isMaxmized [窗口是否最大化]
 * @param  {[object]}  bounds     [窗口位置信息]
 */
exports.setWindowState = (isMaxmized, bounds) => {
  const windowState = {
    isMaxmized,
    bounds,
  };
  storage.setItem('windowState', windowState);
};
