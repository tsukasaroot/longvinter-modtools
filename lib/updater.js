const fetch = require("node-fetch");

class Updater {
    constructor(url) {
        this.url = url;
    }

    async getManifest() {
        let settings = {
            method: "GET",
            headers: {
                Accept: "application/json; charset=UTF-8",
            }
        };

        const response = await fetch(this.url, settings);
        return await response.json();
    }

    async downloadManifestFiles(files) {
        for (let [file] of Object.entries(files)) {
            console.log(file)
        }
    }
}

exports.Updater = Updater;