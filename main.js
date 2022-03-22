'use strict';
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');
const {autoUpdater} = require('electron-updater');

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
            scanDirectories(mainWindow, remote_mods_list, '../mods/');
        });

    mainWindow.once('ready-to-show', () => {
        //autoUpdater.checkForUpdates();
        autoUpdater.checkForUpdatesAndNotify();
    });

    autoUpdater.on('update-available', () => {
        mainWindow.webContents.send('update_available');
    });

    autoUpdater.on('update-downloaded', () => {
        mainWindow.webContents.send('update_downloaded');
    });
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