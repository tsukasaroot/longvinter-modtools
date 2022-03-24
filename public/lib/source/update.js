function update(mod_name, t) {
    t.onclick = null;
    t.innerHTML = '<i style="display: block" class="fa fa-refresh fa-spin"></i>';

    ipcRenderer.send('update', storage.getItem(mod_name));
    ipcRenderer.on('update', (event, args) => {
        t.parentNode.parentNode.children[1].innerHTML = JSON.parse(storage.getItem(mod_name)).version;
        t.parentNode.removeChild(t);
    });
}