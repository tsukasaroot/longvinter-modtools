/*
* Send mod_name to uninstall function in main process
 */


function uninstall(mod_name, t) {
    t.onclick = null;

    ipcRenderer.send('uninstall', storage.getItem(mod_name.toLowerCase()));
}

/*
* After main process uninstalled mod, it sends back a response with mod informations
* We delete mod from mods-list and update mods-count
* Then we add mod informations into remote-mods-list and update the linked remote-mods-count
 */

ipcRenderer.on('uninstall', (event, args) => {
    args = JSON.parse(args);
    let mod_to_delete = document.getElementById(args.name.toLowerCase());
    const table = document.getElementById('mods-list').getElementsByTagName('tbody')[0];

    table.removeChild(mod_to_delete);

    let counter = document.getElementById('mods-count');
    let cleaned_counter = counter.innerHTML.replace(/[^0-9]/g,'');

    cleaned_counter -= 1;
    counter.innerHTML = 'Available mods: ' + cleaned_counter;

    const table_remote = document.getElementById('remote-mods-list').getElementsByTagName('tbody')[0];

    let counter_remote = document.getElementById('remote-mods-count');
    let cleaned_counter_remote = counter.innerHTML.replace(/[^0-9]/g,'');

    cleaned_counter_remote++;
    counter_remote.innerHTML = 'Available mods: ' + cleaned_counter_remote;

    create_table(table_remote, args, true);
});