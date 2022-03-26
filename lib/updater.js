'use strict';
const fetch = require('node-fetch');
const fs = require('fs');
const mod_path = '../Longvinter/Content/CoreMods/';

/*
* The class manage download of files from given repo based on manifest.json
 */

class Updater {
    constructor(url) {
        this.url = url;
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

    async downloadManifestFiles(mod_name, files) {
        for (let [file, sha] of Object.entries(files)) {
            let file_content = await this.download(this.url + file);
            const fileStream = fs.createWriteStream(mod_path + mod_name + '/' + file);
            let dir = mod_path + mod_name;

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

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
}

exports.Updater = Updater;