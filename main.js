'use strict';
const {app, BrowserWindow, ipcMain, shell, globalShortcut} = require('electron');
const path = require('path');
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

async function getUnrealModLoader(url, path) {
    console.log(url)
    let updater = new Updater(url, path);
    let manifest = await updater.getManifest();
    await updater.coreDownloadManifestFiles('unrealmodloader', manifest.files);
}

async function createProfileFolder(pathToProfile)
{

}

async function checkUnrealModLoader() {
    if (config.data.pathtogame === '')
        return;

    let unreal_remote_info = await networking.get('https://raw.githubusercontent.com/Longvinter-Modtools/UnrealModLoader/main/unrealmodloader/module.json');
    let unreal_path = config.data.pathtogame.split('\\');
    let module = null;

    unreal_path.pop();
    unreal_path.pop();
    unreal_path.pop();

    unreal_path = path.join.apply(null, unreal_path) + '\\Binaries\\Win64';
    let unreal_path_core = unreal_path + '\\unrealmodloader';
    let error = false;

    if (!fs.existsSync(unreal_path + '\\xinput1_3.dll')) {
        console.log("xinput")
        error = true;
    }

    if (!fs.existsSync(unreal_path + '\\ModLoaderInfo.ini')) {
        let mod_loader_info_root = "[INFO]\nLoaderPath=";
        mod_loader_info_root += unreal_path + '\\UnrealEngineModLoader.dll';

        fs.writeFileSync(unreal_path + '\\ModLoaderInfo.ini', mod_loader_info_root);
    }

    if (!fs.existsSync(unreal_path_core + '\\UnrealEngineModLauncher.exe')
        || !fs.existsSync(unreal_path_core + '\\UnrealEngineModLoader.dll') || !fs.existsSync(unreal_path_core + '\\module.json')) {
        console.log(".exe or .dll")
        error = true;
    } else {
        module = JSON.parse(fs.readFileSync(unreal_path_core + '\\module.json' , 'utf8'));
    }

    if (!fs.existsSync(unreal_path_core + '\\ModLoaderInfo.ini')) {
        let mod_loader_info = "[DEBUG]\n" +
            "#Enables the default console, used for debugging and finding errors, Set to 1 for true\n" +
            "UseConsole=1";

        fs.writeFileSync(unreal_path_core + '\\ModLoaderInfo.ini', mod_loader_info);
    }

    if (fs.existsSync(unreal_path_core + '\\Profiles')) {
        if (!fs.existsSync(unreal_path_core + '\\Profiles\\Longvinter-Win64-Shipping.profile')) {
            let profileToWrite = "#Games Basic Information\n" +
                "[GameInfo]\n" +
                "\n" +
                "#Set to 1 (true) if the games engine version is 4.23 and up\n" +
                "UsesFNamePool=1\n" +
                "\n" +
                "#Set to 1 (true) if the game engine version is 4.18 and up (this can vary)\n" +
                "IsUsingFChunkedFixedUObjectArray=1\n" +
                "\n" +
                "#Fallback if Spawn Actor can't be found or refuses to work. You should almost NEVER use.\n" +
                "IsUsingDeferedSpawn=0\n" +
                "\n" +
                "#UE4.22 changes the namepool weird, only set this to 1 if the game uses 4.22\n" +
                "#IsUsing4_22=0";

            fs.writeFileSync(unreal_path_core + '\\Profiles\\Longvinter-Win64-Shipping.profile', profileToWrite);
        }
    } else {
        fs.mkdirSync(unreal_path_core + '\\Profiles');
        let profileToWrite = "#Games Basic Information\n" +
            "[GameInfo]\n" +
            "\n" +
            "#Set to 1 (true) if the games engine version is 4.23 and up\n" +
            "UsesFNamePool=1\n" +
            "\n" +
            "#Set to 1 (true) if the game engine version is 4.18 and up (this can vary)\n" +
            "IsUsingFChunkedFixedUObjectArray=1\n" +
            "\n" +
            "#Fallback if Spawn Actor can't be found or refuses to work. You should almost NEVER use.\n" +
            "IsUsingDeferedSpawn=0\n" +
            "\n" +
            "#UE4.22 changes the namepool weird, only set this to 1 if the game uses 4.22\n" +
            "#IsUsing4_22=0";

        fs.writeFileSync(unreal_path_core + '\\Profiles\\Longvinter-Win64-Shipping.profile', profileToWrite);
    }

    if (error || module.version !== unreal_remote_info.version) {
        console.log(module.version + ' + ' + unreal_remote_info.version)
        await getUnrealModLoader(unreal_remote_info.servers[0], unreal_path + '\\');
    }
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

    await checkUnrealModLoader();

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