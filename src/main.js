const { URL } = require('url');
const { app, BrowserWindow, Menu, powerSaveBlocker } = require('electron');
const { updateElectronApp } = require('update-electron-app');
const windowStateKeeper = require('electron-window-state');

if (require('electron-squirrel-startup')) {
    app.quit();
}

updateElectronApp();

function createWindow() {
    Menu.setApplicationMenu(false);

    const mainWindowState = windowStateKeeper({
        defaultWidth: 1024,
        defaultHeight: 768
    });

    const win = new BrowserWindow({
        backgroundColor: '#000000',
        icon: 'assets/icon.png',
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        show: false,
        webPreferences: {
            pageVisibility: true,
            backgroundThrottling: false
        }
    });
    mainWindowState.manage(win);

    win.loadURL('https://2004.lostcity.rs/title');

    win.once('ready-to-show', () => {
        win.show();
    });

    win.webContents.on('zoom-changed', (event, zoomDirection) => {
        if (zoomDirection === 'in') {
            if (win.webContents.zoomFactor < 5.0) {
                win.webContents.zoomFactor += 0.1;
            }
        } else if (zoomDirection === 'out') {
            if (win.webContents.zoomFactor > 0.6) {
                win.webContents.zoomFactor -= 0.1;
            }
        }
    });

    win.webContents.on('before-input-event', (event, input) => {
        if (input.control && !input.alt) {
            if (input.key === '=') { // +
                // zoom out
                event.preventDefault();

                if (win.webContents.zoomFactor < 5.0) {
                    win.webContents.zoomFactor += 0.1;
                }
            } else if (input.key === '-') {
                // zoom in
                event.preventDefault();

                if (win.webContents.zoomFactor > 0.6) {
                    win.webContents.zoomFactor -= 0.1;
                }
            } else if (input.key === '0') {
                // reset zoom
                event.preventDefault();

                win.webContents.zoomFactor = 1.0;
            } else if (input.key.toLowerCase() === 'h') {
                // navigate home
                event.preventDefault();

                win.loadURL('https://2004.lostcity.rs/title');
            }
        } else if (input.key === 'F5') {
            // reload
            event.preventDefault();

            win.reload();
        } else if (input.key === 'F11') {
            // toggle fullscreen
            event.preventDefault();

            win.setFullScreen(!win.isFullScreen());
        }
    });
}

app.whenReady().then(() => {
    powerSaveBlocker.start('prevent-display-sleep');

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

app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
        const parsedUrl = new URL(navigationUrl)

        if (parsedUrl.origin !== 'https://lostcity.rs' && !parsedUrl.origin.endsWith('.lostcity.rs')) {
            event.preventDefault();
        }
    });
});
