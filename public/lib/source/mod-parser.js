const storage = window.localStorage;

function check_local_mod_versions(mods_list) {
    for (let [key, mod] of Object.entries(mods_list)) {
        mod = JSON.parse(mod);
        let remote_mod = JSON.parse(storage.getItem(mod.name.toLowerCase()));
        if (remote_mod) {
            let remote_version = remote_mod.version;
            let local_version = mod.version;

            if (remote_version > local_version) {
                let row = document.getElementById(mod.name.toLowerCase());

                let cell = document.createElement('td');
                let button = document.createElement('button');

                button.onclick = function() { update(mod.name.toLowerCase(), this) };
                button.innerHTML = '<i class="fa fa-cloud-download" aria-hidden="true"></i> ' + remote_version;
                button.style.border = 'none';
                button.style.color = 'white';
                button.style.background = 'none';
                button.style.padding = '0';

                cell.appendChild(button)
                row.appendChild(cell);
            }
        }
    }
}

function create_table(table, key, value) {
    let row = table.insertRow(1);

    row.id = value.name.toLowerCase();

    let th = document.createElement('th');

    th.innerHTML = value.name;
    th.scope = 'row';
    row.appendChild(th);

    let cell1 = row.insertCell(1);
    let cell2 = row.insertCell(2);
    let cell3 = row.insertCell(3);

    cell2.innerHTML = value.description;
    cell3.innerHTML = value.author;
    cell1.innerHTML = value.version;
}

function parse_remote_mods(remote_mods_list) {
    const table = document.getElementById('remote-mods-list');

    document.getElementById('remote-mods-count').innerHTML += Object.keys(remote_mods_list).length;

    for (let [key, url] of Object.entries(remote_mods_list)) {
        httpGetAsync(url, (mod) => {
            create_table(table, key, JSON.parse(mod));
            storage.setItem(key.toLowerCase(), mod);
        });
    }
}

function parse_mods(mods_list) {
    const table = document.getElementById('mods-list');

    document.getElementById('mods-count').innerHTML += mods_list.length;

    for (let [key, mod] of Object.entries(mods_list)) {
        create_table(table, key, JSON.parse(mod));
    }
}