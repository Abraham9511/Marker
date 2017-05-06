const electron = require('electron');

const app = electron.app;
const Menu = electron.Menu;

// 定义菜单栏
const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'New File',
      },
      {
        label: 'Open...',
      },
      {
        label: 'Save',
      },
      {
        label: 'Save As...',
      },
      {
        label: 'Save All',
      },
      {
        label: 'Close File',
      },
      {
        label: 'Close All',
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
        role: 'selectall',
      },
      {
        role: 'delete',
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
      {
        label: 'Increase Font Size',
      },
      {
        label: 'Decrease Font Size',
      },
      {
        label: 'Reset Font Size',
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
      },
    ],
  },
];

exports.template = template;
