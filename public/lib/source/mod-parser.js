const storage = window.localStorage;

/**
* Add a download button to given the row
* Adapt the function called from onclick if its a remote or a local mod
 */

function add_download_button(mod_name, row, is_remote) {
    let cell4 = document.createElement('td');
    let button = document.createElement('button');

    if (is_remote)
        button.onclick = () => {
            install(mod_name.toLowerCase(), button);
        };
    else
        button.onclick = () => {
            update(mod_name.toLowerCase(), button);
        };

    button.innerHTML = '<i class="fa fa-cloud-download"></i>';
    button.style.border = 'none';
    button.style.color = 'white';
    button.style.background = 'none';
    button.style.padding = '0';

    cell4.appendChild(button)
    row.appendChild(cell4);
}

/**
* Verify the mod's version by comparing it from remote infos
* Call add_download_button if an update is available
 */

function check_local_mod_versions(mods_list) {
    for (let [key, mod] of Object.entries(mods_list)) {
        mod = JSON.parse(mod);
        let remote_mod = JSON.parse(storage.getItem(mod.name.toLowerCase()));
        if (remote_mod) {
            let remote_version = remote_mod.version;
            let local_version = mod.version;

            if (remote_version > local_version) {
                let row = document.getElementById(mod.name.toLowerCase());
                add_download_button(mod.name, row, false);
            }
        }
    }
}

/**
* Create tables on a given table object, a value that contains mod's informations and last argument is bool
* to know if its remote or local
 */

function create_table(table, value, is_remote) {
    let row = table.insertRow(0);

    row.id = value.name.toLowerCase();

    let th = document.createElement('th');

    th.innerHTML = value.name;
    th.scope = 'row';
    row.appendChild(th);

    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);

    cell1.innerHTML = value.version;
    cell2.innerHTML = value.description;
    cell3.innerHTML = value.author;

    if (is_remote) {
        add_download_button(value.name, row, is_remote);
    } else {
        let cell4 = document.createElement('td');
        let button = document.createElement('button');
        button.onclick = () => {
            uninstall(value.name.toLowerCase(), button);
        };
        button.innerHTML = '<i class="fa fa-trash"></i>';
        button.style.border = 'none';
        button.style.color = 'white';
        button.style.background = 'none';
        button.style.padding = '0';

        cell4.appendChild(button)
        row.appendChild(cell4);
    }
}

/**
/ Find given mod name into a list of Object containing mods informations
 */

function find_mod_in_list(haystack, list) {
    for (let [key, value] of Object.entries(list)) {
        if (haystack === JSON.parse(value).name.toLowerCase())
            return false;
    }
    return true
}

/**
* Parse given list of remote mods to create the table in the front-end
* Mods installed are filtered to not be shown in remote-mods-list
* Store mods informations into storage
 */

async function parse_remote_mods(mods_list, remote_mods_list) {
    const table = document.getElementById('remote-mods-list').getElementsByTagName('tbody')[0];
    let counter = 0;

    for (let [key, url] of Object.entries(remote_mods_list)) {
        let mod = await httpGet(url)
        if (find_mod_in_list(key, mods_list)) {
            create_table(table, mod, true);
        } else {
            counter++;
        }
        storage.setItem(key.toLowerCase(), JSON.stringify(mod));
    }
    document.getElementById('remote-mods-count').innerHTML += Object.keys(remote_mods_list).length - counter;
}

/**
* Parse locally installed mods and display them in mods-list
 */

function parse_mods(mods_list) {
    const table = document.getElementById('mods-list').getElementsByTagName('tbody')[0];

    document.getElementById('mods-count').innerHTML += mods_list.length;

    for (let [key, mod] of Object.entries(mods_list)) {
        create_table(table, JSON.parse(mod), false);
    }
}