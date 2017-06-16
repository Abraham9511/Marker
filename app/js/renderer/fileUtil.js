const fs = require('fs');
const reload = require('./reload').reload;
const async = require('async');
const electron = require('electron');

const ipcRenderer = electron.ipcRenderer;

// after true前面插入 flase后面插入
const addContent = (index, editorText, previewText) => {
  const newEditor = $('<textarea></textarea>').val(editorText);
  const newPreview = $('<div></div>').text(previewText);
  newPreview.addClass('preview');
  newEditor.addClass('editor');
  newEditor.css('display', 'none');
  newPreview.css('display', 'none');
  newEditor.attr('autofocus', 'autofocus');
  $('.editor').eq(index - 1).after(newEditor);
  $('.preview').eq(index - 1).after(newPreview);
};

const fileUtil = {
  read: (args) => {
    const index = args.index;
    let current = index;
    const paths = args.path;
    const toShow = args.show;
    let previewText;
    async.eachSeries(paths, (path, callback) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          throw err;
        }
        // todo转换为markdown
        previewText = data;
        if (current === 0) {
          $('.editor').eq(0).val(data);
          $('.preview').eq(0).text(previewText);
          reload(0);
        } else {
          addContent(current, data, previewText);
          // 显示成功打开的第一个文件
          if (toShow && current === index) {
            // 通知主线程更改聚焦文件
            ipcRenderer.send('mainFile', (event, ['changeFocusedFile', paths[0]]));
          }
        }
        current += 1;
        callback();
      });
    }, (err) => {
      console.log(err); // eslint-disable-line
    });
  },
  save: (args) => {
    const index = args.index;
    const path = args.path;
    fs.writeFile(path, $('.preview').eq(index).text().toString(), (err) => {
      if (err) {
        // 将对应文件改为未保存
        ipcRenderer.send('mainFile', (event, ['saveFail', path]));
        throw err;
      }
      ipcRenderer.send('mainFile', (event, ['saveSuccess', path]));
    });
  },
  newFile: (args) => {
    const index = args.index;
    if (index !== 0) {
      addContent(index, '', '');
    }
    $('.editor').hide();
    $('.editor').eq(index).show();
    $('.preview').hide();
    $('.preview').eq(index).show();
  },
  focus: (args) => {
    const index = args.index;
    $('.editor').hide();
    $('.editor').eq(index).show();
    $('.preview').hide();
    $('.preview').eq(index).show();
    reload(index);
  },
  close: (args) => {
    const index = args.index;
    const isLast = args.last;
    if (isLast === true) {
      $('.editor').eq(index).val('');
      $('.preview').eq(index).text('');
      fileUtil.focus({ index: 0 });
      // todo更改标签
    } else {
      $('.editor').eq(index).remove();
      $('.preview').eq(index).remove();
      // todo删除标签
      if (index === 0) {
        fileUtil.focus({ index });
      } else {
        fileUtil.focus({ index: index - 1 });
      }
    }
  },
  saveAndClose: (args) => {
    const index = args.index;
    const path = args.path;
    const isLast = args.last;
    if (isLast) {
      addContent(1, '', '');
    }
    if (index !== 0) {
      fileUtil.focus({ index: index - 1 });
    } else {
      fileUtil.focus({ index: index + 1 });
    }
    fs.writeFile(path, $('.preview').eq(index).text().toString(), (err) => {
      if (err) {
        // 将对应文件改为未保存
        ipcRenderer.send('mainFile', (event, ['closeFail', path]));
        throw err;
      }
      $('.editor').eq(index).remove();
      $('.preview').eq(index).remove();
      ipcRenderer.send('mainFile', (event, ['closeSuccess', path]));
    });
  },
};


exports.fileUtil = fileUtil;
