const querystring = require('querystring');
const path = require("path")
let query = querystring.parse(global.location.search);
let mods_list = "";
let remote_mods_list = "";

if (query['?data'])
    mods_list = JSON.parse(query['?data']);

if (query['remote_mods_list'])
    remote_mods_list = JSON.parse(query['remote_mods_list']);

let ver = query['version'];

window.jQuery = require('jquery');

/*
* Load all needed functions to parse and check remotely available mods and versions
 */

window.onload = async function () {
    storage.clear();

    if (!query['?error'])
        ipcRenderer.send('unrealmodloader-check');

    if (mods_list !== null)
        parse_mods(mods_list);
    if (mods_list !== null && remote_mods_list !== null)
        await parse_remote_mods(mods_list, remote_mods_list)
    if (mods_list !== null)
        check_local_mod_versions(mods_list);

    if (query['?error']) {
        jQuery('#modal').modal('show');
    }

    document.getElementById('version').innerText += ' ' + ver;
    openTab('mods-installed', document.getElementsByClassName('nav-item')[0].children[0]);
}

function add_game_path(t) {
    jQuery('#modal').modal('hide');
    let game_path = path.dirname(document.getElementById('path').files[0].path) + '\\Longvinter\\Content\\';
    ipcRenderer.send('add-game-path', game_path);
}

ipcRenderer.on('unrealmodloader-check', (event, version) => {
    document.getElementById('unreal-version').innerText += ' ' + version;
});

ipcRenderer.on('add-game-path', () => {
    ipcRenderer.send('refresh');
});