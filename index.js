// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog, Menu, screen } = require('electron');
const path = require('path')

try {
	require('electron-reload')(__dirname);
} catch { }

let mainWindow;

function createWindow() {
	// Create the browser window.
	mainWindow = new BrowserWindow({
		width: 1040,
		minWidth: 800,
		height: 750,
		minHeight: 600,
		icon: 'build/icon.png',
		webPreferences: {
			preload: path.join(__dirname, 'preload.js')
		}
	})

	// and load the index.html of the app.
	mainWindow.loadFile('./src/index.html')

	// Open the DevTools.
	// mainWindow.webContents.openDevTools()
}

let menuTemplate = [{
	label: "File",
	submenu: [
		{
			label: "Open",
			click() {
				let src = process.argv[1];
				if (!src || !src.includes('.json')) src = fromFile();
				mainWindow.webContents.send('file', src);
			}
		},
		{
			label: "New",
			click() {
				mainWindow.webContents.send('new', dialog.showSaveDialogSync({
					defaultPath: getDate(),
					filters: [{
						name: "Swim Practice",
						extensions: ["swim.json", "json"]
					}]
				}))
			}
		},
		{
			label: "Print",
			click() {
				mainWindow.webContents.send('print');
			}
		},
		{
			role: 'reload'
		}
	]
},
{
	label: "Section",
	submenu: [
		{
			label: "Add",
			click() {
				mainWindow.webContents.send('newSection');
			}
		},
		{
			label: "Delete",
			click() {
				mainWindow.webContents.send('delete');
			}
		}
	]
},
{
	label: "Exercise",
	submenu: [
		{
			label: "Add",
			click() {
				mainWindow.webContents.send('newExercise');
			}
		},
		{
			label: "Delete",
			click() {
				mainWindow.webContents.send('delete');
			}
		}
	]
},
{
	role: 'toggleDevTools'
}]

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

ipcMain.on('open', () => {
	let src = process.argv[1];
	if (!src || !src.includes('.json')) src = fromFile();
	mainWindow.webContents.send('file', src);
})

ipcMain.on('new', () => {
	mainWindow.webContents.send('new', dialog.showSaveDialogSync({
		defaultPath: getDate(),
		filters: [{
			name: "Swim Practice",
			extensions: ["swim.json", "json"]
		}]
	}))
})

ipcMain.on('zoom', () => {
	calcZoom()
})

function calcZoom() {
	mainWindow.webContents.send('zoom', screen.getDisplayNearestPoint(screen.getCursorScreenPoint()).scaleFactor);
}

function getDate() {
	const d = new Date();
	let year = d.getFullYear();
	let month = (d.getMonth() + 1).toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});
	let day = d.getDate().toLocaleString('en-US', {
		minimumIntegerDigits: 2,
		useGrouping: false
	});

	return `${year}-${month}-${day}`;
}

function fromFile() {
	return dialog.showOpenDialogSync({
		properties: ['openFile'],
		filters: [{
			name: "Swim Practice",
			extensions: ["swim.json", "json"]
		}]
	});
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow()

	app.on('activate', function () {
		// On macOS it's common to re-create a window in the app when the
		// dock icon is clicked and there are no other windows open.
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})

	mainWindow.on('resize', () => {
		calcZoom();
	})
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.