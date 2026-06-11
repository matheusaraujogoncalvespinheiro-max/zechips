const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    readDb: (key) => ipcRenderer.invoke('read-db', key),
    writeDb: (key, data) => ipcRenderer.invoke('write-db', key, data)
});
