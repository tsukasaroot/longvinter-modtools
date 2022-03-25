function install(mod_name, t) {
    t.onclick = null;
    t.innerHTML = '<i style="display: block" class="fa fa-refresh fa-spin"></i>';

    if (mod_name == null) {
        return;
    }
    ipcRenderer.send('install', storage.getItem(mod_name.toLowerCase()));
    ipcRenderer.on('install', (event, args) => {
        t.parentNode.parentNode = '';
    });
}