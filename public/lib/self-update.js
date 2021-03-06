/*
* Manage the app's front-end self-update
* Based on ipc communication between main thread and renderer to display popups
 */

const v = document.getElementById('version');

ipcRenderer.send('app_version');
ipcRenderer.on('app_version', (event, arg) => {
    ipcRenderer.removeAllListeners('app_version');
    v.innerText = 'Version ' + arg.version;
});

const notification = document.getElementById('notification');

const message = document.getElementById('message');

const restartButton = document.getElementById('restart-button');
ipcRenderer.on('update_available', () => {
    ipcRenderer.removeAllListeners('update_available');
    message.innerText = 'A new update is available. Downloading now...';
    notification.classList.remove('hidden');
});

ipcRenderer.on('update_downloaded', () => {
    ipcRenderer.removeAllListeners('update_downloaded');
    message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
    restartButton.classList.remove('hidden');
    notification.classList.remove('hidden');
});

function closeNotification(t) {
    t.parentNode.classList.add('hidden');
}

function restartApp() {
    ipcRenderer.send('restart_app');
}
