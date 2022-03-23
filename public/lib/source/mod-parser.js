const storage = window.localStorage;

function create_table(table, key, value) {
    var row = table.insertRow(1);
    var th = document.createElement('th');

    th.innerHTML = value.name;
    th.scope = 'row';
    row.appendChild(th);

    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);

    cell2.innerHTML = value.description;
    cell3.innerHTML = value.author;
    cell1.innerHTML = value.version;
}

function parse_remote_mods(remote_mods_list) {
    const table = document.getElementById('remote-mods-list');

    document.getElementById('remote-mods-count').innerHTML += Object.keys(remote_mods_list).length;

    for (let [key, url] of Object.entries(remote_mods_list)) {
        httpGetAsync(url, (response) => {
            create_table(table, key, JSON.parse(response));
            storage.setItem(key, response);
        });
    }
}

function parse_mods(data) {
    const table = document.getElementById('mods-list');

    document.getElementById('mods-count').innerHTML += data.length;

    for (let [key, value] of Object.entries(data)) {
        create_table(table, key, JSON.parse(value));
    }
}