const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: '#f4f7fb',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (process.env.ELECTRON_PRODUCTION === 'true') {
    window.loadFile(path.join(__dirname, '..', 'frontend', 'dist', 'telemetry-monitor', 'browser', 'index.html'));
  } else {
    window.loadURL('http://localhost:4200');
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
