const {
    app,
    BrowserWindow
} = require("electron")

let window

function createWindow() {
    window = new BrowserWindow({
        width: 1200,
        height: 1100
    })

    window.setMenuBarVisibility(false)
    window.webContents.openDevTools()

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
