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

  if (index !== 0) {
    $('.editor').eq(index - 1).after(newEditor);
    $('.preview').eq(index - 1).after(newPreview);
  } else {
    $('#editorContainer').append(newEditor);
    $('#previewContainer').append(newPreview);
  }
};

// 新建tab
const newTab = (path, index, num) => {
  let pathSplited = path.split('/');
  if (pathSplited.length === 1) {
    pathSplited = path.split('\\');
  }
  const name = pathSplited[pathSplited.length - 1];
  const newTitle1 = $('<div></div>');
  const newTitle2 = $('<div></div>');

  newTitle1.addClass('title-container');
  newTitle1.append($('<span></span>').text(name));
  newTitle1.data('path', num);
  newTitle2.addClass('title-container');
  newTitle2.append($('<span></span>').text(name));
  newTitle2.data('path', num);
  // 没有任何标签
  if ($('.title-container').children().length === 0) {
    $('#editorContainer').children('.inner-header').append(newTitle1);
    $('#previewContainer').children('.inner-header').append(newTitle2);
  } else {
    $('#editorContainer').children('.inner-header').children().eq(index - 1)
    .after(newTitle1);
    $('#previewContainer').children('.inner-header').children().eq(index - 1)
    .after(newTitle2);
  }
};

const fileUtil = {
  // 打开文件
  read: (args) => {
    const index = args.index;
    let current = index;
    const paths = args.path;
    const toShow = args.show;
    const num = args.num;
    const change = args.change;
    let previewText;

    async.eachSeries(paths, (path, callback) => {
      fs.readFile(path, (err, data) => {
        if (err) {
          // 将读取出错的序号抛出
          callback(new Error(current));
        }
        // todo转换为markdown
        previewText = data;
        if (change && current === index) {
          $('.editor').eq(index).val(data);
          $('.preview').eq(index).text(previewText);
          $('#editorContainer').children('.inner-header').children().eq(index)
          .remove();
          $('#previewContainer').children('.inner-header').children().eq(index)
          .remove();
          reload(0);
        } else {
          addContent(current, data, previewText);
        }
        newTab(path, current, num[current - index]);
        // 显示成功打开的第一个文件
        if (toShow && current === index) {
          // 通知主线程更改聚焦文件
          ipcRenderer.send('mainFile', (event, ['changeFocusedFile', num[0]]));
        }
        current += 1;
        callback();
      });
    }, (error) => {
      if (error !== null) {
        const number = parseInt(error.message, 10);
        paths.splice(0, number - index);
        ipcRenderer.send('mainFile', (event, ['openFail', paths]));
      }
    });
  },
  // 保存文件
  save: (args) => {
    const index = args.index;
    const path = args.path;
    const changeName = args.changeName;
    const type = args.type;

    fs.writeFile(path, $('.editor').eq(index).val().toString(), (err) => {
      if (err) {
        // 将对应文件改为未保存
        ipcRenderer.send('mainFile', (event, ['saveFail', path]));
        throw err;
      }
      if (changeName) {
        let title = $('#editorContainer').children('.inner-header').children().eq(index);
        let pathSplited = path.split('/');
          if (pathSplited.length === 1) {
          pathSplited = path.split('\\');
        }
        title.children().text(pathSplited[pathSplited.length - 1]);
        title = $('#previewContainer').children('.inner-header').children().eq(index);
        title.children().text(pathSplited[pathSplited.length - 1]);
        ipcRenderer.send('title', path);;
      }
      ipcRenderer.send('mainFile', (event, ['saveSuccess', path]));
      if (type === 2) {
        ipcRenderer.send('mainFile', (event, ['toPdf', path]));
      }
    });
  },
  // 新建文件
  newFile: (args) => {
    const index = args.index;
    const num = args.num;

    newTab('untitled', index, num);
    addContent(index, '', '');
    ipcRenderer.send('mainFile', (event, ['changeFocusedFile', num]));
  },
  // 文件聚焦
  focus: (args) => {
    const index = args.index;
    const path = args.path;

    $('.editor').hide();
    $('.editor').eq(index).show();
    $('.preview').hide();
    $('.preview').eq(index).show();
    // 显示标签
    $('.active-container').removeClass('active-container');
    $('#editorContainer').children('.inner-header').children().eq(index)
    .addClass('active-container');
    $('#previewContainer').children('.inner-header').children().eq(index)
    .addClass('active-container');
    reload(index);
    ipcRenderer.send('title', path);
  },
  // 关闭文件
  close: (args) => {
    const index = args.index;

    $('#editorContainer').children('.inner-header').children().eq(index)
    .remove();
    $('#previewContainer').children('.inner-header').children().eq(index)
    .remove();
    $('.editor').eq(index).remove();
    $('.preview').eq(index).remove();
    if (index !== 0) {
      index -= 1;
    }
    const num = $('#editorContainer').children('.inner-header').children().eq(index).data('path');
    console.log(num);
    ipcRenderer.send('mainFile', (event, ['changeFocusedFile', num]));
  },
  // 保存并关闭文件
  saveAndClose: (args) => {
    const index = args.index;
    const path = args.path;
    let num;

    if (index !== 0) {
      num = $('#editorContainer').children('.inner-header').children().eq(index-1).data('path');
    } else {
      if ($('.editor').length > 1) {
        num = $('#editorContainer').children('.inner-header').children().eq(index+1).data('path');
      }
    }
    ipcRenderer.send('mainFile', (event, ['changeFocusedFile', num]));
    fs.writeFile(path, $('.preview').eq(index).text().toString(), (err) => {
      if (err) {
        // 将对应文件改为未保存
        ipcRenderer.send('mainFile', (event, ['closeFail', path]));
        throw err;
      }
      $('.editor').eq(index).remove();
      $('.preview').eq(index).remove();
      $('#editorContainer').children('.inner-header').children().eq(index)
      .remove();
      $('#previewContainer').children('.inner-header').children().eq(index)
      .remove();
      ipcRenderer.send('mainFile', (event, ['closeSuccess', path]));
    });
  },
};

exports.fileUtil = fileUtil;
