'use strict';

const fs = require('fs');
const fetch = require('node-fetch');
const crypto = require('crypto');

/**
 * The class manage download of files from given repo based on manifest.json
 */

class Updater {
    constructor(url, path) {
        this.url = url;
        this.path = path;
    }

    async download(url) {
        let settings = {
            method: "GET",
            headers: {
                Accept: "application/json; charset=UTF-8",
            }
        };

        return await fetch(url, settings);
    }

    async getManifest() {
        let settings = {
            method: "GET",
            headers: {
                Accept: "application/json; charset=UTF-8",
            }
        };

        const response = await fetch(this.url + 'manifest.json', settings);
        return await response.json();
    }

    async coreDownloadManifestFiles(mod_name, files) {
        for (let [file, sha] of Object.entries(files)) {
            let file_content = await this.download(this.url + file);
            const fileStream = fs.createWriteStream(this.path + file);
            let dir = this.path;

            let directories = file.split('/');

            if (directories) {
                for (let directory of directories) {
                    if (!directory.includes('.')) {
                        dir += '/' + directory;

                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, {
                                recursive: true
                            });
                        }
                    }
                }
            }

            await new Promise((resolve, reject) => {
                file_content.body.pipe(fileStream);
                file_content.body.on("error", reject);
                fileStream.on("finish", resolve);
            });

            console.log('verifying checksum');
        }
        console.log('download and installation done')
    }

    async downloadManifestFiles(mod_name, mod_category, files) {
        if (mod_category === 'coremods')
            mod_category = 'CoreMods';
        if (mod_category === 'paks')
            mod_category = 'Paks';

        for (let [file, sha] of Object.entries(files)) {
            let dir = this.path + mod_category + '\\' + mod_name;
            let file_path = dir + '/' + file;
            let file_content = await this.download(this.url + file);
            const fileStream = fs.createWriteStream(file_path);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            let directories = file.split('/');

            if (directories) {
                for (let directory of directories) {
                    if (!directory.includes('.')) {
                        dir = dir + '\\' + directory;

                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, {
                                recursive: true
                            });
                        }
                    }
                }
            }

            await new Promise((resolve, reject) => {
                file_content.body.pipe(fileStream);
                file_content.body.on("error", reject);
                fileStream.on("finish", resolve);
            });

            let content = fs.readFileSync(file_path);
            let hash = crypto.createHash('sha256')
                .update(content)
                .digest('hex');

            if (hash !== sha) {
                fs.rmSync(file_path, {recursive: true, force: true});
                return false;
            }
        }
        return true;
    }
}

exports.Updater = Updater;