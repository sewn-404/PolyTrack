const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electron", {
  quit: () => ipcRenderer.send("quit"),
  addFullscreenChangeListener: (e) =>
    ipcRenderer.on("fullscreen-change", () => e()),
  isFullscreen: () => ipcRenderer.sendSync("is-fullscreen"),
  setFullscreen: (e) => ipcRenderer.send("set-fullscreen", e),
  readImages: (folderPath) => ipcRenderer.invoke("read-images", folderPath),
  
  // <--- NEW: Function for mods to send key logs to the Main Process
  logKey: (key, action, time) => ipcRenderer.send('log-key-to-python', {
      key: key,
      action: action, // 'down' or 'up'
      time: time // JavaScript performance.now() timestamp
  }),
});