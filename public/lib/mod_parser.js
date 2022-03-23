const querystring = require('querystring');
let query = querystring.parse(global.location.search);
let mods_list = JSON.parse(query['?data']);
let remote_mods_list = JSON.parse(query['remote_mods_list']);
let ver = query['version'];

window.jQuery = require('jquery')

window.onload = function () {
    parse_mods(mods_list);
    parse_remote_mods(remote_mods_list);

    document.getElementById('version').innerText = ver;
    openTab('mods-installed', document.getElementsByClassName('nav-item')[0].childNodes[0]);
}

function parse_remote_mods(remote_mods_list) {
    const table = document.getElementById('remote-mods-list');

    document.getElementById('remote-mods-count').innerHTML += Object.keys(remote_mods_list).length;

    for (let [key, value] of Object.entries(remote_mods_list)) {
        console.log(key + ' = ' + value);
    }
}

function parse_mods(data) {
    const table = document.getElementById('mods-list');

    document.getElementById('mods-count').innerHTML += data.length;

    for (let [key, value] of Object.entries(data)) {
        value = JSON.parse(value);

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
}