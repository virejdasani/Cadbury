const {
    app,
    BrowserWindow,
    Tray,
    globalShortcut,
    Menu,
    electron
} = require('electron')

// This is the npm package `open`, it is used here to open all links in an external browser
const open = require('open')

const path = require('path')

const assetsDirectory = path.join(__dirname, 'assets')

let tray = undefined
let window = undefined

// Hide the menu and dev tools
// Menu.setApplicationMenu(null)

app.on('ready', () => {
    createTray()
    createWindow()
})

// Quit the app when the window is closed
app.on('window-all-closed', () => {
    app.quit()
})

const createTray = () => {
    tray = new Tray(path.join(assetsDirectory, 'trayIcons/sunTemplate.png'))
    tray.on('right-click', toggleWindow)
    tray.on('double-click', toggleWindow)
    tray.on('click', function (event) {
        toggleWindow()
    })
}

const createWindow = () => {
    window = new BrowserWindow({
        width: 427,
        height: 53,
        show: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        webPreferences: {
            // Prevents renderer process code from not running when window is
            backgroundThrottling: false,
            nodeIntegration: true
        }
    })

    // Load index.html
    window.loadURL(`file://${path.join(__dirname, 'index.html')}`)

    // This is a global shortcut to activate Cadbury with hotkey(s)
    globalShortcut.register('Control+Space', () => {
        if (window.isVisible()) {
            hideWindow()
        } else {
            showWindow()
        }
    })

    // If 'esc' is pressed, hide the app window
    window.webContents.on('before-input-event', (event, input) => {
        if (input.key === "Escape") {
            hideWindow()
            // event.preventDefault()
        }
    })

    // This opens all links with `target="_blank"` in external browser
    window.webContents.on('new-window', function (event, url) {
        event.preventDefault()
        open(url)
    })

    // Hide the window when it loses focus
    window.on('blur', () => {
        hideWindow()
    })

    if (process.platform == 'darwin') {
        // Don't show the app in the dock for macOS
        app.dock.hide()
    } else {
        // To hide the app in the dock for windows and linux
        window.setSkipTaskbar(true)
    }
}

const toggleWindow = () => {
    if (window.isVisible()) {
        hideWindow()
    } else {
        showWindow()
    }
}

const showWindow = () => {
    window.show()
    // Reload so the results from the previous session don't show
    window.reload()
}

const hideWindow = () => {
    // This is required because app.hide() is not defined in windows and linux
    if (process.platform == 'darwin') {
        // Both of these are needed because they help restore focus back to the previous window
        app.hide()
        window.hide()
    } else {
        // Both of these are needed because they help restore focus back to the previous window
        window.minimize()
        window.hide()
    }
}