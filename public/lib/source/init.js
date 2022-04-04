const querystring = require('querystring');
const path = require("path")

let query = querystring.parse(global.location.search);
let ver = query['?version'];

window.jQuery = require('jquery');

/*
* Load all needed functions to parse and check remotely available mods and versions
 */

window.onload = async function () {
    storage.clear();

    openTab('mods-installed', document.getElementsByClassName('nav-item')[0].children[0]);

    ipcRenderer.send('init');

    document.getElementById('version').innerText += ' ' + ver;
}

function add_game_path() {
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

ipcRenderer.on('init', async (event, mods_list, remote_mods_list, error) => {
    if (mods_list !== null)
        parse_mods(mods_list);
    if (mods_list !== null && remote_mods_list !== null)
        await parse_remote_mods(mods_list, remote_mods_list)
    if (mods_list !== null)
        check_local_mod_versions(mods_list);

    if (error !== undefined) {
        document.getElementById('modal-title').innerText = 'Select path to Longvinter';
        let content = document.getElementById('modal-content');

        let form = document.createElement('form');
        form.onsubmit = () => {
            add_game_path();
        };

        let label = document.createElement('label');
        let input = document.createElement('input');
        let button = document.createElement('button');

        label.innerText = 'Enter the path to your game longvinter.exe:';
        label.htmlFor = 'path';

        input.type = 'file';
        input.id = 'path';
        input.className = 'mb-3';

        button.className = 'btn btn-primary';
        button.innerText = 'Validate';

        form.appendChild(label);
        form.innerHTML += '<br />';
        form.appendChild(input);
        form.innerHTML += '<br />';
        form.appendChild(button);
        form.innerHTML += '<br />';
        content.appendChild(form);

        jQuery('#modal').modal('show');
    }

    if (error === undefined) {
        ipcRenderer.send('unrealmodloader-check');
    }
});