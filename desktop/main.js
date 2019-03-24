const {
    app,
    BrowserWindow
} = require("electron")

let window

function createWindow() {
    window = new BrowserWindow({
        width: 800,
        height: 600
    })

    // win.webContents.openDevTools()

    window.setMenuBarVisibility(false)

    window.on("closed", () => {
        window = null
    })

    // win.loadFile("index.html")
    // win.loadFile("../public/app.html")
    window.loadURL("http://localhost:3000/app.html")
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (window === null) {
        createWindow()
    }
})
