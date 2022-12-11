const { app, BrowserWindow } = require('electron');
const { join } = require('path');
const { initialize, enable } = require('@electron/remote/main');
initialize();

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		webPreferences: {
			preload: join(__dirname, 'preload.js'),
			nodeIntegration: true,
		},
		autoHideMenuBar: true,
	});
	// enable remote
	enable(mainWindow.webContents);
	mainWindow.loadFile('index.html');
	mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', function () {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') app.quit();
});
