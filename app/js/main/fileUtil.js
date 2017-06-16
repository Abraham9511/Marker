const dialog = require('electron').dialog;
const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');
const ipcMain = require('electron').ipcMain;
const BrowserWindow = require('electron').BrowserWindow;
// const async = require('async');

const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;
// 文件的列表，存储文件的路径和保存状态
// 默认打开一个空文件
const fileList = new Array({
  path: '',
  // 默认为已保存
  // 0为保存 1为保存中 2为已保存
  saved: 2,
  empty: true,
  closing: false,
});

// 当前聚焦的文件索引
let index = 0;

const searchFile = (path) => {
  let i = 0;
  while (i < fileList.length) {
    if (fileList[i].path === path) {
      return i;
    }
    i += 1;
  }
  // 没找到该文件
  return -1;
};

const newFile = () => {
  // 当前没有任何文件
  if (fileList[index].path.length === 0 && fileList[index].saved === 2) {
    fileList[index].path = 'untitled';
    // 添加文件标签
    sendMessageToRenderer('file', ['newFile', { index }]);
  } else {
    // 插入文件
    fileList.splice(index, 0, {
      path: 'untitled',
      saved: 2,
      empty: true,
      closing: false,
    });
    index += 1;
    sendMessageToRenderer('file', ['newFile', { index }]);
  }
};

const saveAs = (_i) => {
  const i = (typeof (_i) === 'undefined') ? index : _i;
  dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    title: 'saveAs',
    defaultPath: './',
    filters: [{
      name: 'Markdown',
      extensions: ['md'],
    }],
  }, (filename) => {
      // 选择文件时点击取消会导致undifined
    if (typeof (filename) !== 'undefined') {
      if (fileList[index].path.length === 0) {
        // todo添加文件标签
      }
      fileList[index].path = filename;
      sendMessageToRenderer('file', ['save', {
        path: filename,
        index: i,
      }]);
      fileList[i].saved = 1;
    }
  });
};

const save = (_i) => {
  const i = (typeof (_i) === 'undefined') ? index : _i;
  // 文件是否保存过
  if (fileList[i].saved === 0) {
    // 文件路径为空或者untitled时，文件未被保存过，需另存为
    if (fileList[i].path.length === 0 || fileList[i].path === 'untitled') {
      saveAs(i);
    } else {
      // 保存中
      fileList[i].saved = 1;
      sendMessageToRenderer('file', ['save', {
        path: fileList[i].path,
        index: i,
      }]);
    }
  }
};

const saveAll = () => {
  for (let i = 0; i < fileList.length; i += 1) {
    save(i);
  }
};

const closeFile = (_i) => {
  const i = (typeof (_i) === 'undefined') ? index : _i;
  // 如果文件不是正在关闭
  if (!fileList[i].closing) {
    let showDialog = false;
    let closeFlag = true;
    const args = {
      index: i,
      last: false,
    };
    // 默认文件和undefined文件不为空，关闭时需要提示是否保存
    if (fileList[i].path.length === 0 || fileList[i].path === 'undefined') {
      if (!fileList[i].empty) {
        showDialog = true;
      }
    } else if (fileList[i].saved === 0) {
      // 其他文件当修改过后，关闭时需要提示是否保存
      showDialog = true;
    }
    if (showDialog) {
      const response = dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
        type: 'question',
        buttons: ['不保存', '取消', '保存'],
        defaultId: 2,
        title: '保存文档',
        message: '是否在关闭前保存对文档的修改?',
        cancelId: 1,
        noLink: true,
      });
      if (response !== 0) {
        closeFlag = false;
      }
      if (response === 2) {
        let toSave = true;
        if (fileList[i].path.length === 0 || fileList[i].path === 'untitled') {
          const path = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
            title: 'saveAs',
            defaultPath: './',
            filters: [
              { name: 'Markdown', extensions: ['md'] },
            ],
          });
          if (typeof (path) !== 'undefined') {
            fileList[index].path = path;
          } else {
            toSave = false;
          }
        }
        if (toSave) {
          fileList[index].closing = true;
          fileList[i].saved = 1;
          args.path = fileList[index].path;
          if (index !== 0) {
            index -= 1;
          } else {
            index += 1;
          }
          if (fileList.length === 1) {
            args.last = true;
            fileList.push({
              path: '',
              saved: 2,
              empty: true,
              closing: false,
            });
          }
          sendMessageToRenderer('file', ['saveAndClose', args]);
        }
      }
    }
    if (closeFlag) {
      fileList.splice(i, 1);
      if (fileList.length === 0) {
        args.last = true;
        fileList.push({
          path: '',
          saved: 2,
          empty: true,
          closing: false,
        });
      }
      if (index !== 0) {
        index -= 1;
      }
      sendMessageToRenderer('file', ['close', args]);
    }
  }
};

const clossAll = () => {
  const length = fileList.length;
  for (let i = 0; i < length; i += 1) {
    closeFile(0);
  }
};

const newTab = () => {
  newFile();
};

const toPdf = () => {
  console.log('toPdf...'); // eslint-disable-line
};

const open = () => {
  dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    title: 'open file',
    // 默认打开当前目录的文件
    defaultPath: './',
    filters: [
      { name: 'markdown', extensions: ['md'] },
      { name: 'text', extensions: ['txt'] },
      { name: 'all files', extensions: ['*'] },
    ],
    properties: [
      'openFile',
      'multiSelections',
    ],
  }, (filePaths) => {
    // 将对文件的操作和文件路径发送到render进程
    if (typeof (filePaths) !== 'undefined') {
      // console.log(filePaths);
      // console.log(fileList);
      // 存在找到的文件
      let fileFound = -1;
      let current = index + 1;
      const args = {
        index,
        path: [],
      };
      if (fileList[index].path.length !== 0 || fileList[index].saved !== 2) {
        args.index += 1;
      } else {
        fileList.shift();
      }
      for (let i = 0; i < filePaths.length; i += 1) {
        const flag = searchFile(filePaths[i]);
        if (flag !== -1) {
          fileFound = flag;
        } else {
          args.path.push(filePaths[i]);
          // 插入已打开的文件链表中
          fileList.splice(current, 0, {
            path: filePaths[i],
            saved: 2,
            empty: false,
            closing: false,
          });
          current += 1;
        }
      }
      // 现有文件中没有找到要打开的
      // 读取文件完成后后将聚焦到将要打开的文件中的第一个
      if (fileFound === -1) {
        args.show = true;
      } else {
        args.show = false;
        sendMessageToRenderer('file', ['focus', { index: fileFound }]);
      }
      if (args.path.length !== 0) {
        sendMessageToRenderer('file', ['read', args]);
      }
    }
  });
};


exports.changeFocusedFile = (i) => {
  index = i;
};
exports.newFile = newFile;
exports.open = open;
exports.save = save;
exports.saveAs = saveAs;
exports.saveAll = saveAll;
exports.closeFile = closeFile;
exports.clossAll = clossAll;
exports.newTab = newTab;

exports.toPdf = () => {
  console.log('toPdf...'); // eslint-disable-line
};

// 监听文件修改的信息
ipcMain.on('mainFile', (event, arg) => {
  let path;
  let result;

  switch (arg[0]) {
    // 文件为空时也一定被修改过
    case 'empty' :
      fileList[arg[1]].empty = true;
      fileList[arg[1]].saved = 0;
      break;
    case 'unsaved' :
      fileList[arg[1]].saved = 0;
      fileList[arg[1]].empty = false;
      break;
    case 'changeFocusedFile' :
      path = arg[1];
      result = searchFile(path);
      index = result;
      sendMessageToRenderer('file', ['focus', { index }]);
      break;
    case 'saveSuccess' :
      path = arg[1];
      result = searchFile(path);
      if (fileList[result].saved === 1) {
        fileList[result].saved = 2;
      }
      break;
    case 'saveFail' :
      path = arg[1];
      result = searchFile(path);
      fileList[result].saved = 0;
      break;
    case 'closeSuccess' :
      path = arg[1];
      result = searchFile(path);
      fileList.splice(result, 1);
      if (fileList.length === 0) {
        fileList.push({
          path: '',
          saved: 2,
          empty: true,
          closing: false,
        });
      }
      if (result < index) {
        index -= 1;
      }
      break;
    case 'closeFail' :
      path = arg[1];
      result = searchFile(path);
      fileList[result].saved = 0;
      fileList[result].closing = false;
      break;
    default:
      break;
  }
});

