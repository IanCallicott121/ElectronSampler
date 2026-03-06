const appMeta = document.getElementById("app-meta");
const modal = document.getElementById("demo-modal");
const toastArea = document.getElementById("toast-area");
const range = document.getElementById("priority-range");
const rangeValue = document.getElementById("range-value");
const charCount = document.getElementById("char-count");
const bioInput = document.getElementById("bio-input");
const passwordInput = document.getElementById("password-input");
const passwordToggle = document.getElementById("toggle-password-btn");
const progressBar = document.getElementById("demo-progress");
const progressBtn = document.getElementById("progress-step-btn");
const darkToggle = document.getElementById("dark-toggle");
const fileInput = document.getElementById("file-input");
const fileList = document.getElementById("file-list");
const dropZone = document.getElementById("drop-zone");
const dragList = document.getElementById("drag-list");
const tableBody = document.querySelector("#demo-table tbody");
const tableFilter = document.getElementById("table-filter");
const searchInput = document.getElementById("search-input");
const sortBtn = document.getElementById("sort-table-btn");
const tabButtons = Array.from(document.querySelectorAll(".tab"));
const tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
const canvas = document.getElementById("chart-canvas");
const chartTooltip = document.getElementById("chart-tooltip");
const seriesToggles = Array.from(document.querySelectorAll(".series-toggle"));

let sortDesc = true;
let draggedItem = null;
let hoverIndex = null;

const tableRows = [
  { task: "Landing page redesign", owner: "Avery", status: "Design", score: 78 },
  { task: "Payment API integration", owner: "Mina", status: "In Progress", score: 92 },
  { task: "Regression pass", owner: "Jordan", status: "QA", score: 67 },
  { task: "Docs and release notes", owner: "Chris", status: "Blocked", score: 49 },
  { task: "User onboarding flow", owner: "Sky", status: "Ready", score: 85 }
];

const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
  alpha: [20, 26, 24, 31, 34, 39, 37, 45],
  beta: [15, 18, 23, 20, 29, 27, 32, 35],
  gamma: [8, 12, 16, 17, 15, 22, 25, 28]
};

const seriesColors = {
  alpha: "#1e6fe8",
  beta: "#0d9f84",
  gamma: "#ca5b0d"
};

function showToast(message) {
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  toastArea.appendChild(el);
  setTimeout(() => {
    el.remove();
  }, 2800);
}

function formatAppMeta() {
  if (!window.appInfo) {
    appMeta.textContent = "Electron app shell";
    return;
  }

  appMeta.textContent = `${window.appInfo.name} | Electron ${window.appInfo.electron} | Node ${window.appInfo.node} | ${window.appInfo.platform}`;
}

function syncRange() {
  rangeValue.textContent = range.value;
}

function syncCharCount() {
  charCount.textContent = bioInput.value.length;
}

function togglePassword() {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.textContent = isPassword ? "Hide" : "Show";
}

function advanceProgress() {
  progressBar.value = Math.min(100, progressBar.value + 12);
  if (progressBar.value >= 100) {
    showToast("Progress reached 100%");
  }
}

function renderFiles(files) {
  fileList.innerHTML = "";
  const list = Array.from(files);
  if (list.length === 0) {
    return;
  }

  list.forEach((file) => {
    const item = document.createElement("li");
    const kb = Math.max(1, Math.round(file.size / 1024));
    item.textContent = `${file.name} (${kb} KB)`;
    fileList.appendChild(item);
  });
}

function handleDropZoneState(event, over) {
  event.preventDefault();
  dropZone.classList.toggle("over", over);
}

function setThemeFromToggle() {
  document.body.classList.toggle("alt", darkToggle.checked);
}

function buildStateSnapshot() {
  return {
    text: document.getElementById("text-input").value,
    email: document.getElementById("email-input").value,
    url: document.getElementById("url-input").value,
    number: document.getElementById("number-input").value,
    color: document.getElementById("color-input").value,
    range: range.value,
    features: {
      featureA: document.getElementById("feature-a").checked,
      featureB: document.getElementById("feature-b").checked,
      altTheme: darkToggle.checked
    },
    selectedPlan: document.getElementById("single-select").value,
    selectedModules: Array.from(document.getElementById("multi-select").selectedOptions).map((opt) => opt.value)
  };
}

async function copyState() {
  const payload = JSON.stringify(buildStateSnapshot(), null, 2);

  try {
    await navigator.clipboard.writeText(payload);
    showToast("State copied to clipboard");
  } catch {
    showToast("Clipboard unavailable in this context");
  }
}

function downloadState() {
  const payload = JSON.stringify(buildStateSnapshot(), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ui-state.json";
  link.click();
  URL.revokeObjectURL(url);
  showToast("Downloaded ui-state.json");
}

function renderTable() {
  const keyword = (tableFilter.value || searchInput.value).toLowerCase().trim();
  const filtered = tableRows.filter((row) => {
    return Object.values(row).some((value) => String(value).toLowerCase().includes(keyword));
  });

  filtered.sort((a, b) => (sortDesc ? b.score - a.score : a.score - b.score));

  tableBody.innerHTML = "";
  filtered.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${row.task}</td><td>${row.owner}</td><td>${row.status}</td><td>${row.score}</td>`;
    tableBody.appendChild(tr);
  });
}

function setupTabs() {
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const panel = document.getElementById(btn.dataset.tab);
      panel.classList.add("active");
    });
  });
}

function setupReorderList() {
  dragList.addEventListener("dragstart", (event) => {
    draggedItem = event.target.closest("li");
    if (draggedItem) {
      draggedItem.classList.add("dragging");
      event.dataTransfer.effectAllowed = "move";
    }
  });

  dragList.addEventListener("dragend", () => {
    if (draggedItem) {
      draggedItem.classList.remove("dragging");
      draggedItem = null;
    }
  });

  dragList.addEventListener("dragover", (event) => {
    event.preventDefault();
    const target = event.target.closest("li");
    if (!draggedItem || !target || draggedItem === target) {
      return;
    }

    const rect = target.getBoundingClientRect();
    const shouldInsertAfter = event.clientY > rect.top + rect.height / 2;
    if (shouldInsertAfter) {
      target.after(draggedItem);
    } else {
      target.before(draggedItem);
    }
  });
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.clientWidth;
  const height = 360;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
}

function drawChart() {
  const ctx = canvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const width = canvas.width / ratio;
  const height = canvas.height / ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const activeSeries = seriesToggles.filter((toggle) => toggle.checked).map((toggle) => toggle.value);
  const values = activeSeries.flatMap((key) => chartData[key]);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 50);
  const left = 36;
  const right = width - 20;
  const top = 20;
  const bottom = height - 30;
  const plotW = right - left;
  const plotH = bottom - top;

  ctx.strokeStyle = "rgba(90, 101, 120, 0.24)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i += 1) {
    const y = top + (plotH / 5) * i;
    ctx.beginPath();
    ctx.moveTo(left, y);
    ctx.lineTo(right, y);
    ctx.stroke();
  }

  chartData.labels.forEach((label, index) => {
    const x = left + (plotW / (chartData.labels.length - 1)) * index;
    ctx.fillStyle = "#74839a";
    ctx.font = "12px Segoe UI Variable";
    ctx.textAlign = "center";
    ctx.fillText(label, x, height - 10);
  });

  function yValue(v) {
    return bottom - ((v - min) / (max - min || 1)) * plotH;
  }

  activeSeries.forEach((key) => {
    const points = chartData[key].map((v, i) => {
      return {
        x: left + (plotW / (chartData.labels.length - 1)) * i,
        y: yValue(v),
        v
      };
    });

    ctx.lineWidth = 2;
    ctx.strokeStyle = seriesColors[key];
    ctx.beginPath();
    points.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.stroke();

    points.forEach((point, i) => {
      const highlighted = hoverIndex === i;
      ctx.fillStyle = seriesColors[key];
      ctx.beginPath();
      ctx.arc(point.x, point.y, highlighted ? 4.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  if (hoverIndex !== null) {
    const x = left + (plotW / (chartData.labels.length - 1)) * hoverIndex;
    ctx.strokeStyle = "rgba(117, 129, 145, 0.38)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, bottom);
    ctx.stroke();
    ctx.setLineDash([]);

    const label = chartData.labels[hoverIndex];
    const summary = activeSeries.map((key) => `${key}:${chartData[key][hoverIndex]}`).join(" | ");
    chartTooltip.textContent = `${label} | ${summary}`;
  } else {
    chartTooltip.textContent = "Hover chart for details";
  }
}

function setupChart() {
  resizeCanvas();
  drawChart();

  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const relativeX = event.clientX - rect.left;
    const slots = chartData.labels.length - 1;
    const index = Math.round((relativeX / rect.width) * slots);
    hoverIndex = Math.max(0, Math.min(slots, index));
    drawChart();
  });

  canvas.addEventListener("mouseleave", () => {
    hoverIndex = null;
    drawChart();
  });

  window.addEventListener("resize", () => {
    resizeCanvas();
    drawChart();
  });

  seriesToggles.forEach((toggle) => {
    toggle.addEventListener("change", drawChart);
  });
}

function wireEvents() {
  document.getElementById("open-modal-btn").addEventListener("click", () => modal.showModal());
  document.getElementById("toast-btn").addEventListener("click", () => showToast("Action completed"));
  document.getElementById("download-state-btn").addEventListener("click", downloadState);
  document.getElementById("copy-state-btn").addEventListener("click", copyState);

  range.addEventListener("input", syncRange);
  bioInput.addEventListener("input", syncCharCount);
  passwordToggle.addEventListener("click", togglePassword);
  progressBtn.addEventListener("click", advanceProgress);
  darkToggle.addEventListener("change", setThemeFromToggle);

  tableFilter.addEventListener("input", renderTable);
  searchInput.addEventListener("input", () => {
    tableFilter.value = searchInput.value;
    renderTable();
  });

  sortBtn.addEventListener("click", () => {
    sortDesc = !sortDesc;
    sortBtn.textContent = sortDesc ? "Sort by score" : "Sort by score (asc)";
    renderTable();
  });

  fileInput.addEventListener("change", () => {
    renderFiles(fileInput.files);
    showToast(`${fileInput.files.length} file(s) selected`);
  });

  dropZone.addEventListener("dragover", (event) => handleDropZoneState(event, true));
  dropZone.addEventListener("dragleave", (event) => handleDropZoneState(event, false));
  dropZone.addEventListener("drop", (event) => {
    handleDropZoneState(event, false);
    const files = event.dataTransfer?.files;
    if (files && files.length) {
      renderFiles(files);
      showToast(`${files.length} file(s) dropped`);
    }
  });
}

function init() {
  formatAppMeta();
  syncRange();
  syncCharCount();
  renderTable();
  setupTabs();
  setupReorderList();
  setupChart();
  wireEvents();
}

init();
