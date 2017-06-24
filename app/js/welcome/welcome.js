const electron = require('electron');

const shell = electron.shell;

// 点击图标在浏览器中打开链接
$('.github').on('click', () => {
  shell.openExternal('https://github.com/Abraham9511/Marker');
});
