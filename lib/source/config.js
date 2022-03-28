'use strict';
const fs = require('fs');

/**
 * This class handle all configs contained within config.json
 */

class AppConfig {
    constructor() {
        this.data = null
    }

    getConfig() {
        let file = 'config.json';
        if (fs.existsSync(file)) {
            this.data = JSON.parse(fs.readFileSync(file, 'utf8'));
        } else {
            this.data = {};
            this.data.uilanguage = "en";
            this.data.noselfupdate = false;
            this.data.noupdate = false;
            this.data.autostart = true;
            this.data.pathtogame = "";

            fs.writeFileSync('config.json', JSON.stringify(this.data), 'utf-8');
        }
    }

    setConfig(property, v) {
        this.data[property] = v;
        fs.writeFileSync('config.json', JSON.stringify(this.data), 'utf-8');
    }
}

exports.AppConfig = AppConfig;