const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("appInfo", {
  name: "Electron UI Playground",
  electron: process.versions.electron,
  node: process.versions.node,
  platform: process.platform
});
