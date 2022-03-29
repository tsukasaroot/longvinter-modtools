'use strict';

const fs = require('fs');
const {Updater} = require("./updater");

class UnrealModLoader {
    constructor() {
        this.error = false;
        this.module = null;
    }

    async downloadFiles(url, path) {
        let updater = new Updater(url, path);
        let manifest = await updater.getManifest();
        await updater.coreDownloadManifestFiles('unrealmodloader', manifest.files);
    }

    pop_array(array, i_delete) {
        for (i_delete; i_delete > 0; --i_delete) {
            array.pop();
        }
        return array;
    }

    checkModLoaderInfoRoot(path) {
        if (!fs.existsSync(path + '\\ModLoaderInfo.ini')) {
            let mod_loader_info_root = "[INFO]\nLoaderPath=";
            mod_loader_info_root += path + '\\unrealmodloader\\UnrealEngineModLoader.dll';

            fs.writeFileSync(path + '\\ModLoaderInfo.ini', mod_loader_info_root);
        }
    }

    checkModLoader(path) {
        if (!fs.existsSync(path)) {
            let mod_loader_info = "[DEBUG]\n" +
                "#Enables the default console, used for debugging and finding errors, Set to 1 for true\n" +
                "UseConsole=1";

            fs.writeFileSync(path, mod_loader_info);
        }
    }

    async createProfileFolder(pathToProfile)
    {
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

        fs.writeFileSync(pathToProfile, profileToWrite);
    }

    async checkProfile(path) {
        if (fs.existsSync(path)) {
            if (!fs.existsSync(path + '\\Longvinter-Win64-Shipping.profile')) {
                await this.createProfileFolder(path + '\\Longvinter-Win64-Shipping.profile');
            }
        } else {
            fs.mkdirSync(path);
            await this.createProfileFolder(path + '\\Longvinter-Win64-Shipping.profile');
        }
    }

    checkXinput(path) {
        if (!fs.existsSync(path)) {
            this.error = true;
        }
    }

    checkUnrealFolder(path) {
        if (!fs.existsSync(path + '\\UnrealEngineModLauncher.exe')
            || !fs.existsSync(path + '\\UnrealEngineModLoader.dll') || !fs.existsSync(path + '\\module.json')) {
            this.error = true;
        } else {
            this.module = JSON.parse(fs.readFileSync(path + '\\module.json' , 'utf8'));
        }
    }

    async finalize(url, path, remote_version) {
        if (this.error || this.module.version !== remote_version)
            await this.downloadFiles(url, path);
    }
}

exports.UnrealModLoader = UnrealModLoader;