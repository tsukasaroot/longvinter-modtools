'use strict';
const {app, BrowserWindow, ipcMain, shell, globalShortcut} = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const fs = require('fs');
const {autoUpdater} = require('electron-updater');
const {Updater} = require('./lib/updater');
const {AppConfig} = require('./lib/config');
const {Networking} = require('./lib/networking');

const config = new AppConfig();
config.getConfig();

const networking = new Networking();

/*
 * check if app is called through protocol or not
 */

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('electron-test', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('electron-test')
}

// Get instance lock
const gotTheLock = app.requestSingleInstanceLock()

let mainWindow;

/*
 * If lock is not set, we quit, else we either focus on existing instance
 * or we launch a fresh instance if no first instance
 */

if (!gotTheLock) {
    app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore()
            mainWindow.focus()
        }
    })

    // Create mainWindow, load the rest of the app, etc...
    app.on("ready", loadMainWindow);

    app.on('open-url', (event, url) => {
        console.log("test");
    })
}

/**
 * Retrieve all directories from given path and return it through callback
 */

function getDirectories(path, callback) {
    fs.readdir(path, function (err, content) {
        if (err) return callback(err);
        callback(null, content);
    })
}

/**
 * Scan mod directories to find all installed mods to load module.json and store result in array.
 * load html file with args stringify when needed, and send them through querystring
 */

function scanDirectories(mainWindow, remote_mods_list, path) {
    if (path !== "") {
        getDirectories(path, function (err, content) {
            let all_mods = [];

            if (content != null)
                for (const folder of content) {
                    let file = path + folder + '/module.json';
                    if (fs.existsSync(file)) {
                        let text = fs.readFileSync(file, 'utf8');
                        all_mods.push(text);
                    }
                }

            mainWindow.loadFile("public/index.html", {
                query: {
                    "data": JSON.stringify(all_mods),
                    "version": app.getVersion(),
                    "remote_mods_list": JSON.stringify(remote_mods_list),
                }
            });
        });
    } else {
        mainWindow.loadFile("public/index.html", {
            query: {
                "error": "No path defined",
                "version": app.getVersion()
            }
        });
    }

    globalShortcut.register('f5', function () {
        app.relaunch();
        app.exit(0);
    });
    globalShortcut.register('CommandOrControl+R', function () {
        app.relaunch();
        app.exit(0);
    });
}

/**
 * Create the window
 * Retrieve list of all mods from linked Github repo
 * create IPC channels to listen to for available self-updates / software env query
 */

async function loadMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        enableRemoteModule: true,
        autoHideMenuBar: true,
    });

    const ses = mainWindow.webContents.session;

    ses.clearCache();

    let remote_mods_list = await networking.get('https://raw.githubusercontent.com/tsukasaroot/longvinter-mods/main/modules-list.json');
    await scanDirectories(mainWindow, remote_mods_list, config.data.pathtogame);

    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });
}

autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
});

autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
});

ipcMain.on('ispackaged', () => {
    mainWindow.webContents.send('ispackaged', app.isPackaged);
});

/**
 * Called by update / install ipcMain to update or install a mod on user machine
 * arg is a stringify JSON containing the mod's informations
 */

async function retrieval(args, mp) {
    args = JSON.parse(args);
    let updater = new Updater(args.servers[0], mp);
    let manifest = await updater.getManifest();
    await updater.downloadManifestFiles(args.name.toLowerCase(), manifest.files);
}

async function uninstall(args) {
    args = JSON.parse(args);

    fs.rmSync(config.data.pathtogame + args.name.toLowerCase(), {recursive: true, force: true});
}

app.disableHardwareAcceleration();

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        loadMainWindow();
    }
});

ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

ipcMain.on('update', async (event, args) => {
    await retrieval(args, config.data.pathtogame);
    event.reply('update', args);
});

ipcMain.on('install', async (event, args) => {
    await retrieval(args, config.data.pathtogame);
    event.reply('install', args);
});

ipcMain.on('uninstall', async (event, args) => {
    await uninstall(args);
    event.reply('uninstall', args);
});

ipcMain.on('refresh', () => {
    app.relaunch();
    app.exit(0);
});

ipcMain.on('add-game-path', (event, path) => {
    config.setConfig('pathtogame', path);
    event.reply('add-game-path');
})

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
    const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
    const pagePath = path.join('file://', pageDirectory, 'index.html')
    shell.openExternal(pagePath)
})