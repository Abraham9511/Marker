const electron = require('electron');
const fileUtil = require('./fileUtil');
const selectionUtil = require('./selectionUtil');

const shell = electron.shell;

// 定义菜单栏
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
        accelerator: 'CommandOrControl+N',
        click() { fileUtil.newFile(); },
      },
      {
        label: 'Open...',
        accelerator: 'CommandOrControl+Shift+O',
        click() { fileUtil.open(); },
      },
      {
        label: 'Save',
        accelerator: 'CommandOrControl+S',
        click() { fileUtil.save(); },
      },
      {
        label: 'Save As...',
        accelerator: 'CommandOrControl+Shift+S',
        click() { fileUtil.saveAs(); },
      },
      {
        label: 'Save All',
        accelerator: 'Alt+S',
        click() { fileUtil.saveAll(); },
      },
      {
        label: 'Close File',
        accelerator: 'CommandOrControl+W',
        click() { fileUtil.closeFile(); },
      },
      {
        label: 'Close All',
        accelerator: 'CommandOrControl+Shift+W',
        click() { fileUtil.clossAll(); },
      },
      {
        label: 'New Tab',
        accelerator: 'CommandOrControl+Shift+T',
        click() { fileUtil.newTab(); },
      },
      {
        label: 'ToPdf',
        accelerator: 'CommandOrControl+P',
        click() { fileUtil.toPdf(); },
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
        click() { selectionUtil.expandLine(); },
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
        role: 'resetzoom',
      },
      {
        role: 'zoomin',
      },
      {
        role: 'zoomout',
      },
      {
        role: 'togglefullscreen',
      },
    ],
  },
  {
    label: 'Setting',
    submenu: [
      {
        label: 'Theme',
      },
      {
        label: 'Font Family',
      },
      {
        label: 'lineWrapping',
        type: 'checkbox',
        checked: true,
      },
      {
        label: 'lineNumbers',
        type: 'checkbox',
        checked: true,
      },
    ],
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'About Marker',
        click() { shell.openExternal('https://github.com/Abraham9511/Marker'); },
      },
    ],
  },
];

exports.template = template;
