const dialog = require('electron').dialog;
const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');
const ipcMain = require('electron').ipcMain;
const BrowserWindow = require('electron').BrowserWindow;
const markdownpdf = require('markdown-pdf');
const fs = require('fs');
// const async = require('async');

const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;
// 文件的列表，存储文件的路径和保存状态
// 默认打开一个空文件
const fileList = new Array({
  path: 'untitled',
  // 默认为已保存
  // 0未保存 1为保存中 2为已保存
  saved: 2,
  empty: true,
  closing: false,
  // 每个文件都有唯一的编号
  num: 1,
});

// 当前聚焦的文件索引
let index = 0;
let fileNum = 1;
// 用于关闭所有文件
let nextToClose;

// 搜索文件
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

// 搜索文件标号
const searchNum = (number) => {
  let i = 0;

  while (i < fileList.length) {
    if (fileList[i].num === number) {
      return i;
    }
    i += 1;
  }
  // 没找到该编码
  return -1;
};

// 打开对话框
const showPdfDialog = (index) => {
  dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
    title: 'toPdf',
    defaultPath: './',
    filters: [{
      name: 'pdf',
      extensions: ['pdf'],
    }],
  }, (filename) => {
      // 选择文件时点击取消会导致undifined
    if (typeof (filename) !== 'undefined') {
      markdownpdf().from(fileList[index].path).to(filename, function () {
        console.log("Done");
      });
    }
  });
}

// 新建文件
const newFile = () => {
  // 递增文件编号
  fileNum += 1;
  // 插入文件
  fileList.splice(index + 1, 0, {
    path: 'untitled',
    saved: 2,
    empty: true,
    closing: false,
    num: fileNum,
  });
  index += 1;
  sendMessageToRenderer('file', ['newFile', {
    index,
    num: fileNum,
  }]);
};

// 另存为
const saveAs = (_i, _type) => {
  const i = (typeof (_i) === 'undefined') ? index : _i;
  const type = (typeof (_type) === 'undefined') ? 0 : _type;

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
      fileList[index].path = filename;
      sendMessageToRenderer('file', ['save', {
        path: filename,
        index: i,
        changeName: true,
        type: type,
      }]);
      fileList[i].saved = 1;
    }
  });
};

// 保存文件
const save = (_i, _type) => {
  const i = (typeof (_i) === 'undefined') ? index : _i;
  const type = (typeof (_type) === 'undefined') ? 0 : _type;

  // 文件是否保存过
  if (fileList[i].saved === 0) {
    // 文件路径为空或者untitled时，文件未被保存过，需另存为
    if (fileList[i].path === 'untitled') {
      saveAs(i, type);
    } else {
      // 保存中
      fileList[i].saved = 1;
      sendMessageToRenderer('file', ['save', {
        path: fileList[i].path,
        index: i,
        type: type,
      }]);
    }
  }
};

// 全部保存
const saveAll = () => {
  for (let i = 0; i < fileList.length; i += 1) {
    save(i);
  }
};

// 关闭文件
const closeFile = (_i) => {
  const i = (typeof (_i) === 'undefined') ? index : _i;

  // 如果文件不是正在关闭
  if (!fileList[i].closing) {
    let showDialog = false;
    let closeFlag = true;
    const args = {
      index: i,
    };
    // 默认文件和undefined文件不为空，关闭时需要提示是否保存
    if (fileList[i].path === 'undefined') {
      if (!fileList[i].empty) {
        showDialog = true;
      }
    } else if (fileList[i].saved === 0) {
      // 其他文件当修改过后，关闭时需要提示是否保存
      showDialog = true;
    }
    if (showDialog) {
      sendMessageToRenderer('file', ['focus', { index: i }]);
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
        nextToClose++;
      }
      if (response === 2) {
        let toSave = true;
        if (fileList[i].path === 'untitled') {
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
            index--;
            newFile();
          }
          sendMessageToRenderer('file', ['saveAndClose', args]);
        }
      }
    }
    if (closeFlag) {
      if (fileList.length === 1) {
        newFile();
      }
      fileList.splice(i, 1);
      if (index !== 0) {
        index -= 1;
      }
      sendMessageToRenderer('file', ['close', args]);
    }
  }
};

// 关闭所有文件
const clossAll = () => {
  const length = fileList.length;
  nextToClose = 0;
  for (let i = 0; i < length; i += 1) {
    closeFile(nextToClose);
  }
  nextToClose = 0;
};

// 新建一个tab
const newTab = () => {
  newFile();
};

// 生成pdf
const toPdf = () => {
  if (fileList[index].path === 'untitled') {
    saveAs(index, 2);
  } else {
    // 文件未保存
    if (fileList[index].saved === 0) {
      save(index, 2);
    } else {
      showPdfDialog(index);
    }
  }
};

// 打开文件
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
      openFileWithPaths(filePaths);
    }
  });
};

const openFileWithPaths = (paths) => {
  // console.log(paths);
  // console.log(fileList);
  // 存在找到的文件
  let fileFound = -1;
  let current = index + 1;
  const args = {
    index,
    path: [],
    num: [],
    change: false,
  };

  if (fileList[index].path !== 'untitled' || fileList[index].saved !== 2) {
    args.index += 1;
  } else {
    fileList.splice(index, 1);
    args.change = true;
  }
  for (let i = 0; i < paths.length; i += 1) {
    const flag = searchFile(paths[i]);
    if (flag !== -1) {
      fileFound = flag;
    } else {
      args.path.push(paths[i]);
      fileNum += 1;
      args.num.push(fileNum);
      // 插入已打开的文件链表中
      fileList.splice(current, 0, {
        path: paths[i],
        saved: 2,
        empty: false,
        closing: false,
        num: fileNum,
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

// 修改聚焦文件
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
exports.toPdf = toPdf;

// 监听文件修改的信息
ipcMain.on('mainFile', (event, arg) => {
  let path;
  let result;
  let num;
  let paths;

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
      num = arg[1];
      result = searchNum(num);
      index = result;
      sendMessageToRenderer('file', ['focus', {
        index: index,
        path : fileList[index].path,
      }]);
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
        // 通过更改index为-1
        index = -1;
        newFile();
      }
      nextToClose--;
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
    case 'openFail' :
      paths = arg[1];
      for (let i = 0; i < paths.length; i += 1) {
        result = searchFile(paths[i]);
        if (result !== -1) {
          fileList.splice(result, 1);
        }
      }
      break;
    case 'toPdf' :
      path = arg[1];
      result = searchFile(path);
      showPdfDialog(result);
      break;
    case 'openFile' :
      paths = arg[1];
      openFileWithPaths(paths);
      break;
    default:
      break;
  }
});
