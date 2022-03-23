function update(mod_name, t) {
    t.onclick = null;
    t.innerHTML = '<i style="display: block" class="fa fa-refresh fa-spin"></i>';

    ipcRenderer.send('update', storage.getItem(mod_name));
    ipcRenderer.on('update', (event, args) => {
    });
}