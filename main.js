const {app, BrowserWindow, Menu, protocol, ipcMain} = require('electron');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

let win;

var osvar = process.platform; /* Detecting OS */
if (osvar == 'darwin') {app.whenReady().then(() => {createWindowMac()})
}else if(osvar == 'win32'){app.whenReady().then(() => {createWindowWin()})
}else{app.whenReady().then(() => {createWindowLinux()})}


function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}



function createWindowWin () { /* Windows */
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    closable: true,
    maximizable: true,
    minimizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);
}
function createWindowMac () { /* macOS */
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    closable: true,
    maximizable: true,
    minimizable: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })
  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);
}
function createWindowLinux () { /* Linux */
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true,
    closable: true,
    maximizable: true,
    minimizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadURL(`file://${__dirname}/index.html#v${app.getVersion()}`);
  mainWindow.webContents.on('did-finish-load', function() {
    mainWindow.webContents.insertCSS('#titlebar{display: none !important;}') /* Remove Windows Titlebar if OS is Linux */
 });
}

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
})

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
