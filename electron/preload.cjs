const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  selectFortniteFolder: () => ipcRenderer.invoke('select-fortnite-folder'),
  downloadDll: (opts) => ipcRenderer.invoke('download-dll', opts),
  launchGame: (opts) => ipcRenderer.invoke('launch-game', opts),
})
