const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openRLOptimizer: () => ipcRenderer.send('open-rl-optimizer')
});
