const { app, BrowserWindow } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Set the update server URL
autoUpdater.setFeedURL({
  "provider": "github",
  "owner": "NathanDevStuffs",
  "repo": "Teecue-AI",
  "releaseType": "release"
});

app.on("ready", () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 1000,
    autoHideMenuBar: true,
    icon: __dirname + 'icon.ico',
  });

  // Check for updates on app startup
  autoUpdater.checkForUpdatesAndNotify();

  win.loadFile('index.html');
});
