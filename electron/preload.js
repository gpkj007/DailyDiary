const { contextBridge, ipcRenderer } = require('electron')

const api = {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setDiaryDir: (dirPath) => ipcRenderer.invoke('settings:setDir', dirPath),
  selectDir: () => ipcRenderer.invoke('dialog:selectDir'),
  getDiaryDir: () => ipcRenderer.invoke('diary:getDir'),
  scanDiary: (dirPath) => ipcRenderer.invoke('diary:scan', dirPath),
  readDiary: (filePath) => ipcRenderer.invoke('diary:read', filePath),
  writeDiary: (filePath, content) => ipcRenderer.invoke('diary:write', filePath, content),
  deleteDiary: (filePath) => ipcRenderer.invoke('diary:delete', filePath),
  createDiary: (dirPath, dateStr) => ipcRenderer.invoke('diary:create', dirPath, dateStr)
}

contextBridge.exposeInMainWorld('electronAPI', api)
console.log('[preload] electronAPI exposed, keys:', Object.keys(api))
