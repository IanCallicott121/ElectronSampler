const label = document.getElementById("app-name");

if (label && window.appInfo?.name) {
  label.textContent = `App: ${window.appInfo.name}`;
}
