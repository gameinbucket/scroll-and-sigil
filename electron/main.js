const { app, BrowserWindow } = require("electron");

let window = null;

function createWindow() {
  window = new BrowserWindow({
    width: 1200,
    height: 1100,
    webPreferences: {
      webSecurity: false,
    },
  });

  window.setMenuBarVisibility(false);

  window.on("closed", () => {
    window = null;
  });

  window.loadURL(`file://${__dirname}/main.html`);

  window.webContents.openDevTools();
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (window === null) {
    createWindow();
  }
});
