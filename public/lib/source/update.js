function update(mod_name, t) {
    t.onclick = null;
    t.innerHTML = '<i style="display: block" class="fa fa-refresh fa-spin"></i>';

    ipcRenderer.send('update', storage.getItem(mod_name));
}

ipcRenderer.on('update', (event, args) => {
    args = JSON.parse(args);
    const row = document.getElementById(args.name.toLowerCase());

    row.children[1].innerHTML = JSON.parse(storage.getItem(args.name.toLowerCase())).version;
    row.removeChild(row.children[4]);
});