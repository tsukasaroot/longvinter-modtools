const storage = window.localStorage;

function add_download_button(mod_name, row, is_remote) {
    let cell4 = document.createElement('td');
    let button = document.createElement('button');

    if (is_remote)
        button.onclick = () => {
            install(mod_name.toLowerCase(), button)
        };
    else
        button.onclick = () => {
            update(mod_name.toLowerCase(), button)
        };

    button.innerHTML = '<i class="fa fa-cloud-download"></i>';
    button.style.border = 'none';
    button.style.color = 'white';
    button.style.background = 'none';
    button.style.padding = '0';

    cell4.appendChild(button)
    row.appendChild(cell4);
}

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

function create_table(table, key, value, is_remote) {
    let row = table.insertRow(1);

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
    }
}

function find_mod_in_list(haystack, list) {
    for (let [key, value] of Object.entries(list)) {
        if (haystack === JSON.parse(value).name.toLowerCase())
            return false;
    }
    return true
}

async function parse_remote_mods(mods_list, remote_mods_list) {
    const table = document.getElementById('remote-mods-list');
    let counter = 0;

    for (let [key, url] of Object.entries(remote_mods_list)) {
        let mod = await httpGet(url)
        let counter = 0;
        if (find_mod_in_list(key, mods_list)) {
            create_table(table, key, mod, true);
        } else {
            counter++;
        }
        storage.setItem(key.toLowerCase(), JSON.stringify(mod));

    }
    document.getElementById('remote-mods-count').innerHTML += Object.keys(remote_mods_list).length - counter;
}

function parse_mods(mods_list) {
    const table = document.getElementById('mods-list');

    document.getElementById('mods-count').innerHTML += mods_list.length;

    for (let [key, mod] of Object.entries(mods_list)) {
        create_table(table, key, JSON.parse(mod), false);
    }
}