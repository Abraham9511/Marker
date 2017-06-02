const dialog = require('electron').dialog;
const sendMessageToRendererUtil = require('./sendMessageToRendererUtil');
const ipcMain = require('electron').ipcMain;
const sendMessageToRenderer = sendMessageToRendererUtil.sendMessageToRenderer;
const BrowserWindow =  require('electron').BrowserWindow;
const async = require('async');
//文件的列表，存储文件的路径和保存状态
//默认打开一个空文件
var file_list = new Array({
	path: '',
	// 默认为已保存
	// 0为保存 1为保存中 2为已保存
	saved: 2,
	empty: true,
	closing: false
});

//当前聚焦的文件索引
var index = 0;

const newFile = () => {
	//当前没有任何文件
	if (file_list[index]['path'].length == 0 && file_list[index]['saved'] == 2) {
		file_list[index]['path'] = 'untitled';
		//添加文件标签
		sendMessageToRenderer('file', ['newFile', {index: index}]);
	}
	else {
		// 插入文件
		file_list.splice(index, 0, {
			path: 'untitled',
			saved: 2,
			empty: true,
			closing: false
		});
		index++;
		sendMessageToRenderer('file', ['newFile', {index: index}]);
	}
};

const save = (i) => {
	console.log('save..');
	i = typeof(i) == "undefined" ? index : i;
	// 文件是否保存过
	if (file_list[i]['saved'] == 0) {
		//文件路径为空或者untitled时，文件未被保存过，需另存为
		if(file_list[i]['path'].length == 0 || file_list[i]['path'] == 'untitled') {
			saveAs(i);
		}
		else {
			// 保存中
			file_list[i]['saved'] = 1;
			sendMessageToRenderer('file', ['save', {
				path: file_list[i]['path'],
				index: i
			}]);
		}
		
	}
};

const saveAs = (i) => {
	console.log('saveAs...');
	i = typeof(i) == "undefined" ? index : i;
	dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
		title: 'saveAs',
		defaultPath: './',
		filters: [
			{name: 'Markdown', extensions: ['md']}
		]
  	}, function(filename){
  		//选择文件时点击取消会导致undifined
	if (typeof(filename) != 'undefined') {
  		if (file_list[index]['path'].length == 0) {
  			//todo添加文件标签
  		}
  		file_list[index]['path'] = filename;
  		sendMessageToRenderer('file', ['save', {
  			path: filename,
  			index: i
  		}]);
  		file_list[i]['saved'] = 1;
  	}
    });
};

const saveAll = () => {
	console.log('saveAll...');
	var i;
	for (i = 0; i < file_list.length; i++) {
		save(i);
	}
};

const closeFile = (i) => {
	i = typeof(i) == "undefined" ? index : i;
	// 如果文件不是正在关闭
	if (!file_list[i]['closing']) {
		var showDialog = false;
		var closeFlag = true;
			var args = {
				index: i,
				last: false
			}
		console.log('closing ' + file_list[i]['path']);
		// 默认文件和undefined文件不为空，关闭时需要提示是否保存
		if (file_list[i]['path'].length == 0 || file_list[i]['path'] == 'undefined') {
			if (!file_list[i]['empty'])
				showDialog = true;
		}
		// 其他文件当修改过后，关闭时需要提示是否保存
		else if (file_list[i]['saved'] == 0) {
			showDialog = true;
		}
		if (showDialog) {
			response = dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
				type: 'question',
				buttons: ['不保存', '取消', '保存'],
				defaultId: 2,
				title: '保存文档',
				message: '是否在关闭前保存对文档的修改?',
				cancelId: 1,
				noLink: true
			});
			if (response != 0)
				closeFlag = false;
			if (response == 2) {
				var toSave = true;
				if(file_list[i]['path'].length == 0 || file_list[i]['path'] == 'untitled') {
					var path = dialog.showSaveDialog(BrowserWindow.getFocusedWindow(), {
						title: 'saveAs',
						defaultPath: './',
						filters: [
							{name: 'Markdown', extensions: ['md']}
						]
				  	});
					if (typeof(path) != 'undefined') {
					  	file_list[index]['path'] = path;
				  	}
				  	else
				  		toSave = false;
				}
				if (toSave) {
					file_list[index]['closing'] = true;
					file_list[i]['saved'] = 1;
					args['path'] = file_list[index]['path'];
					if (index != 0) {
						index--;
					}
					else
						index++;
					if (file_list.length == 1) {
						args['last'] = true;
						file_list.push({
							path: '',
							saved: 2,
							empty: true,
							closing: false
						});
					}
					console.log(args['path']);
					sendMessageToRenderer('file', ['saveAndClose', args]);
				}
			}
		}
		if (closeFlag) {
			file_list.splice(i, 1);
			if (file_list.length == 0) {
				args['last'] = true;
				file_list.push({
					path: '',
					saved: 2,
					empty: true,
					closing: false
				});
			}
			if (index != 0) {
				index--;
			}
			sendMessageToRenderer('file', ['close', args]);
		}
	}
};

const clossAll = () => {
  console.log('clossAll...');
  console.log(file_list);
  console.log(file_list.length);
  var length = file_list.length
  for (var i = 0; i < length; i++) {
  	console.log(i);
  	closeFile(0);
  }
  console.log(file_list);
};

const newTab = () => {
  console.log('newTab...');
  newFile();
};

const toPdf = () => {
  console.log('toPdf...');
};

const open = () => {
	console.log('open...');
	dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
		title: 'open file',
		//默认打开当前目录的文件
		defaultPath: './',
		filters: [
		  {name: 'markdown', extensions: ['md']},
		  {name: 'text', extensions: ['txt']},
		  {name: 'all files', extensions: ['*']}
		],
		properties: [
		  'openFile',
		  'multiSelections'
		]
	}, function(filePaths){
		//将对文件的操作和文件路径发送到render进程
	    if (typeof(filePaths) != 'undefined') {
	    	console.log(filePaths);
	    	console.log(file_list);
	    	// 存在找到的文件
	    	var fileFound = -1;
	    	var current = index + 1;
	    	var args = {
	    		index : index,
	    		path: new Array()
	    	}
	    	if (file_list[index]['path'].length != 0 || file_list[index]['saved'] != 2) {
	    		args['index']++;
	    	}
	    	else {
	    		file_list.shift();
	    	}
	    	for (var i = 0; i < filePaths.length; i++) {
	    		var flag = searchFile(filePaths[i]);
	    		if (flag != -1)
	    			fileFound = flag;
	    		else {
	    			args['path'].push(filePaths[i]);
	    			// 插入已打开的文件链表中
	    			file_list.splice(current, 0, {
	    				path: filePaths[i],
	    				saved: 2,
	    				empty: false,
	    				closing: false
	    			});
	    			current++;
	    		}
	    	}
	    	// 现有文件中没有找到要打开的
	    	// 读取文件完成后后将聚焦到将要打开的文件中的第一个
	    	if (fileFound == -1)
	    		args['show'] = true;
	    	else {
	    		args['show'] = false;
	    		sendMessageToRenderer('file', ['focus', {index: fileFound}]);
	    	}
	    	if (args['path'].length != 0) {
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
  console.log('toPdf...');
};

//监听文件修改的信息
ipcMain.on('mainFile', (event, arg) => {
	switch(arg[0]) {
		//文件为空时也一定被修改过
		case 'empty' :
			file_list[arg[1]]['empty'] = true;
			file_list[arg[1]]['saved'] = 0;
			break;
		case 'unsaved' :
			file_list[arg[1]]['saved'] = 0;
			file_list[arg[1]]['empty'] = false;
			break;
		case 'changeFocusedFile' :
			var path =  arg[1];
			var result = searchFile(path);
			index = result;
			sendMessageToRenderer('file', ['focus', {index: index}])
			break;
		case 'saveSuccess' :
			var path =  arg[1];
			var result = searchFile(path);
			if (file_list[result]['saved'] == 1) {
				file_list[result]['saved'] = 2;
			}
			break;
		case 'saveFail' :
			var path =  arg[1];
			var result = searchFile(path);
			file_list[result]['saved'] = 0;
			break;
		case 'closeSuccess' :
			var path =  arg[1];
			var result = searchFile(path);
			file_list.splice(result, 1);
			if (file_list.length == 0) {
				file_list.push({
					path: '',
					saved: 2,
					empty: true,
					closing: false
				});
			}
			if (result < index)
				index--;
			break;
		case 'closeFail' : 
			var path =  arg[1];
			var result = searchFile(path);
			file_list[result]['saved'] = 0;
			file_list[result]['closing'] = false;
			break;
		default:
			break;
	};
});

searchFile = (path) => {
	var i = 0;
	while (i < file_list.length) {
		if (file_list[i]['path'] == path)
			return i;
		i++;
	}
	// 没找到该文件
	return -1;
};
