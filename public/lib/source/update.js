/**
* Activate loading FA then send mod informations through storage with mod's name to main process
 */

function update(mod_name, t) {
    t.onclick = null;
    t.innerHTML = '<i style="display: block" class="fa fa-refresh fa-spin"></i>';

    ipcRenderer.send('update', storage.getItem(mod_name.toLowerCase()));
}

/*
* After main process installed mod, it sends back a response with mod informations
* We delete mod from remote-mods-list and update remote-mods-count
* Then we add mod informations into mods-list and update the linked mods-count
 */

ipcRenderer.on('update', (event, args, response) => {
    args = JSON.parse(args);
    const row = document.getElementById(args.name.toLowerCase());

    row.children[1].innerHTML = JSON.parse(storage.getItem(args.name.toLowerCase())).version;
    row.removeChild(row.children[5]);

    storage.removeItem(args.name.toLowerCase());
    storage.setItem(args.name.toLowerCase(), JSON.stringify(args));
});