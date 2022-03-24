'use strict';
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const {autoUpdater} = require('electron-updater');
const {Updater} = require('./lib/updater');

const mod_path = '../Longvinter/Content/CoreMods/';

function getDirectories(path, callback) {
    fs.readdir(path, function (err, content) {
        if (err) return callback(err);
        callback(null, content);
    })
}

function getResponse(url) {
    let settings = {method: "Get"};

    return fetch(url, settings)
        .then(res => res.json())
        .then((json) => {
            return json;
        })
        .catch(error => console.warn(error));
}

function scanDirectories(mainWindow, remote_mods_list, path) {
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
    })
}

const loadMainWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        },
        resizable: false,
        autoHideMenuBar: true,
    });

    getResponse('https://raw.githubusercontent.com/tsukasaroot/longvinter-mods/main/modules-list.json')
        .then(remote_mods_list => {
            scanDirectories(mainWindow, remote_mods_list, mod_path);
        });

    mainWindow.once('ready-to-show', () => {
        autoUpdater.checkForUpdatesAndNotify();
    });

    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update_available');
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });

    ipcMain.on('ispackaged', () => {
        mainWindow.webContents.send('ispackaged', app.isPackaged);
    })
}

async function retrieval(args) {
    args = JSON.parse(args);
    let updater = new Updater(args.servers[0]);
    let manifest = await updater.getManifest();
    await updater.downloadManifestFiles(args.name.toLowerCase(), manifest.files);
}

app.disableHardwareAcceleration()

app.on("ready", loadMainWindow);

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
    await retrieval(args);
    event.reply('update');
})