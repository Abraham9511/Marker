const electron = require('electron');
const fileUtil = require('./fileUtil');
const selectionUtil = require('./selectionUtil');
const fontsizeUtil = require('./fontsizeUtil');
const fontfamilyUtil = require('./fontfamilyUtil');

const shell = electron.shell;

// 定义菜单栏
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'CommandOrControl+N',
        click() {
          fileUtil.newFile();
        },
      },
      {
        label: 'Open...',
        accelerator: 'CommandOrControl+Shift+O',
        click() {
          fileUtil.open();
        },
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() {
          fileUtil.save();
        },
      },
      {
        label: 'Save As...',
        accelerator: 'CommandOrControl+Shift+S',
        click() {
          fileUtil.saveAs();
        },
      },
      {
        label: 'Save All',
        accelerator: 'Alt+S',
        click() {
          fileUtil.saveAll();
        },
      },
      {
        label: 'Close File',
        accelerator: 'CommandOrControl+W',
        click() {
          fileUtil.closeFile();
        },
      },
      {
        label: 'Close All',
        accelerator: 'CommandOrControl+Shift+W',
        click() {
          fileUtil.clossAll();
        },
      },
      {
        label: 'New Tab',
        accelerator: 'CommandOrControl+Shift+T',
        click() {
          fileUtil.newTab();
        },
      },
      {
        label: 'ToPdf',
        accelerator: 'CommandOrControl+P',
        click() {
          fileUtil.toPdf();
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
      {
        role: 'delete',
      },
    ],
  },
  {
    label: 'Selection',
    submenu: [
      {
        role: 'selectall',
        accelerator: 'CommandOrControl+A',
      },
      {
        label: 'Expand Selection to Line',
        accelerator: 'CommandOrControl+L',
        click() {
          selectionUtil.expandLine();
        },
      },
      {
        label: 'Reduce Selection to Line',
        accelerator: 'CommandOrControl+Shift+L',
        click() {
          selectionUtil.reduceLine();
        },
      },
    ],
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'reload',
      },
      {
        role: 'togglefullscreen',
      },
      {
        type: 'separator',
      },
      {
        label: 'Increase Font Size',
        accelerator: 'CommandOrControl+=',
        click() {
          fontsizeUtil.increaseFontSize();
        },
      },
      {
        label: 'Decrease Font Size',
        accelerator: 'CommandOrControl+-',
        click() {
          fontsizeUtil.decreaseFontSize();
        },
      },
      {
        label: 'Reset Font Size',
        click() {
          fontsizeUtil.resetFontSize();
        },
      },
    ],
  },
  {
    label: 'Setting',
    submenu: [
      {
        label: 'Font Family',
        submenu: [
          {
            label: 'sans-serif',
            type: 'radio',
            checked: true,
            click() {
              fontfamilyUtil.setFontfamily('sans-serif');
            },
          },
          {
            label: '宋体(SimSun)',
            type: 'radio',
            checked: false,
            click() {
              fontfamilyUtil.setFontfamily('SimSun');
            },
          },
          {
            label: '黑体(SimHei)',
            type: 'radio',
            checked: false,
            click() {
              fontfamilyUtil.setFontfamily('SimHei');
            },
          },
          {
            label: '微软雅黑(Microsoft YaHei)',
            type: 'radio',
            checked: false,
            click() {
              fontfamilyUtil.setFontfamily('Microsoft YaHei');
            },
          },
          {
            label: '楷体(KaiTi)',
            type: 'radio',
            checked: false,
            click() {
              fontfamilyUtil.setFontfamily('KaiTi');
            },
          },
          {
            label: '华文黑体(STHeiti)',
            type: 'radio',
            checked: false,
            click() {
              fontfamilyUtil.setFontfamily('STHeiti');
            },
          },
          {
            label: '华文宋体(STSong)',
            type: 'radio',
            checked: false,
            click() {
              fontfamilyUtil.setFontfamily('STSong');
            },
          },
        ],
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About Marker',
        click() {
          shell.openExternal('https://github.com/Abraham9511/Marker');
        },
      },
    ],
  },
];

exports.template = template;
