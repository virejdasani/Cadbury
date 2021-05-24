const { app, BrowserWindow, globalShortcut, Tray, systemPreferences, shell } = require("electron");
const open = require("open");
const { platform } = require("os");
const path = require("path");
const { electron } = require("process");
const assetsDirectory = path.join(__dirname, 'assets')

let window;
let tray;

app.on("ready", () => {
    initializeApp();
    initializeTray();
});

app.on('window-all-closed', () => {
    app.quit()
});

const initializeTray = () => {
    tray = new Tray(path.join(assetsDirectory, 'tray_icon.png'))
    tray.on('right-click', toggleCadburyVisibility)
    tray.on('double-click', toggleCadburyVisibility)
    tray.on('click', function (event) {
        toggleCadburyVisibility()
    });
}

const initializeApp = () => {
    window = new BrowserWindow({
        height: 500,
        width: 800,
        transparent: true,
        thickFrame: false,
        hasShadow: true,
        alwaysOnTop: true,
        fullscreenable: false,
        frame: false,
        webPreferences: {
            nodeIntegration: true,
            backgroundThrottling: false,
            devTools: true,
        }
    });

    window.loadURL(`file://${path.join(__dirname, 'index.html')}`);

    globalShortcut.register("Control + Space", () => {
        toggleCadburyVisibility();
    });

    window.webContents.on('before-input-event', (event, input) => {
        if (input.key === "Escape") {
            destroyCadbury()
            // event.preventDefault()
        }
    })

    window.on("blur", () => {
        destroyCadbury();
    });

    window.webContents.on('new-window', function (event, url) {
        event.preventDefault()
        shell.openExternal(url);
    })

    if (process.platform == 'darwin') {
        // Don't show the app in the dock for macOS
        app.dock.hide()
    } else {
        // To hide the app in the dock for windows and linux
        window.setSkipTaskbar(true)
    }
}

const toggleCadburyVisibility = () => {
    if (window.isVisible()) {
        destroyCadbury()
    } else {
        launchCadbury();
    }
}

const launchCadbury = () => {
    window.reload();
    window.setSize(800, 500);
    setTimeout(() => {
        window.show();
    }, 150)
}

const destroyCadbury = () => {
    if (process.platform == "darwin") {
        app.hide();
        window.hide();
    } else {
        window.minimize();
        window.hide();
    }
}