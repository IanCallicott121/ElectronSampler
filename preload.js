const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("appInfo", {
  name: "Electron Sampler"
});
