const electron = require('electron');
const path = require('path');
const url = require('url');
const storageUtil = require('./app/js/main/storageUtil');
const menuTemplate = require('./app/js/main/menuTemplate');
const shortCutUtil = require('./app/js/main/shortCutUtil');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
const ipcMain = electron.ipcMain;
const windowState = storageUtil.getWindowState();
const template = menuTemplate.template;
let mainWindow;

function createWindow() {
  const bounds = (windowState && windowState.bounds) || null;
  // 设置窗口的基本样式和信息
  // Linux下不支持movable,minimizable,maximizable,closable,
  mainWindow = new BrowserWindow({
    title: 'Marker',
    x: (bounds && bounds.x) || undefined,
    y: (bounds && bounds.y) || undefined,
    width: (bounds && bounds.width) || 800,
    height: (bounds && bounds.height) || 600,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    icon: '',
    // 在所有资源加载完成前隐藏窗口
    show: false,
    backgroundColor: '#fff',
  });

  // 当所有资源加载完成后
  // 显示窗口并聚焦
  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();

    // 将窗口最大化
    if (windowState && windowState.isMaximized) {
      mainWindow.maximize();
    }
  });

  // 一开始先显示欢迎页面
  // 2.3s后再显示编辑器页面
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/html/welcome.html'),
    protocol: 'file:',
    slashes: true,
  }));

  setTimeout(() => {
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'app/html/index.html'),
      protocol: 'file',
      slashes: true,
    }));
    // 在加载欢迎页面时，title为Marker
    // 欢迎页面加载结束时，title为untitled
    // 默认第一个文件是未命名的
    mainWindow.setTitle('untitled');
  }, 2300);

  // 打开终端
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 这里函数调用的频率过高，以后考虑是否用函数节流的方式来降低频率
  // 及时保存窗口的有关信息
  ['resize', 'move', 'close'].forEach((e) => {
    mainWindow.on(e, () => {
      storageUtil.setWindowState(mainWindow.isMaximized(), mainWindow.getBounds());
    });
  });

  // 添加菜单
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // 添加全局快捷键
  shortCutUtil.registerSC();
}

app.on('ready', createWindow);

// 当应用即将退出时，
// 注销全局快捷键
app.on('will-quit', () => {
  shortCutUtil.unregisterSC();
});

app.on('window-all-closed', () => {
  // 在 OS X 上，通常用户在明确地按下 Cmd + Q 之前
  // 应用会保持活动状态
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // 在 OS X 上，当用户点击dock图标
  // 而没有打开的窗口时
  // 将会自动创建一个窗口
  if (mainWindow === null) {
    createWindow();
  }
});

// 从渲染进程中获取当前编辑区文件名
// 并在title中显示
ipcMain.on('title', (event, args) => {
  // 只有当标题不为空才设置
  if (args) {
    mainWindow.setTitle(args);
  }
});
