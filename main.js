'use strict';
const {app, BrowserWindow, ipcMain, shell, globalShortcut} = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const {autoUpdater} = require('electron-updater');
const {Updater} = require('./lib/updater');

var mod_path = '';

if (process.defaultApp) {
    if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient('electron-test', process.execPath, [path.resolve(process.argv[1])])
    }
} else {
    app.setAsDefaultProtocolClient('electron-test')
}

let mainWindow;

const gotTheLock = app.requestSingleInstanceLock()

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
* Get response from GitHub repo then return the JSON's body
 */

function getResponse(url) {
    let settings = {method: "Get"};

    return fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            return json;
        })
        .catch(error => console.warn(error));
}

/**
* Scan mod directories to find all installed mods to load module.json and store result in array.
* load html file with args stringify when needed, and send them through querystring
 */

function scanDirectories(mainWindow, remote_mods_list, path) {
    if (path !== "") {
        getDirectories(path + '\\', function (err, content) {
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

    globalShortcut.register('f5', function() {
        app.relaunch();
        app.exit(0);
    });
    globalShortcut.register('CommandOrControl+R', function() {
        app.relaunch();
        app.exit(0);
    });
}

/**
* Create the window
* Retrieve list of all mods from linked Github repo
* create IPC channels to listen to for available self-updates / software env query
 */

function loadMainWindow() {
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

    let file = 'config.json';
    if (fs.existsSync(file)) {
        let config = JSON.parse(fs.readFileSync(file, 'utf8'));
        mod_path = config.pathtogame;
    } else {
        let config = {};
        config.uilanguage = "en";
        config.noselfupdate = false;
        config.noupdate = false;
        config.autostart = true;
        config.pathtogame = "";

        fs.writeFileSync('config.json', JSON.stringify(config), 'utf-8');
    }

    getResponse('https://raw.githubusercontent.com/tsukasaroot/longvinter-mods/main/modules-list.json')
        .then(remote_mods_list => {
            scanDirectories(mainWindow, remote_mods_list, mod_path);
        });

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

    fs.rmSync(mod_path + args.name.toLowerCase(), {recursive: true, force: true});
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
    await retrieval(args, mod_path);
    event.reply('update', args);
});

ipcMain.on('install', async (event, args) => {
    await retrieval(args, mod_path);
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
    let config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    config.pathtogame = path;
    fs.writeFileSync('config.json', JSON.stringify(config), 'utf-8');
    event.reply('add-game-path');
})

// Handle window controls via IPC
ipcMain.on('shell:open', () => {
    const pageDirectory = __dirname.replace('app.asar', 'app.asar.unpacked')
    const pagePath = path.join('file://', pageDirectory, 'index.html')
    shell.openExternal(pagePath)
})