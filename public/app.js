// Éléments du DOM
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const fileDetails = document.getElementById("fileDetails");
const fileName = document.getElementById("fileName");
const fileRows = document.getElementById("fileRows");
const btnClear = document.getElementById("btnClear");
const previewTable = document.getElementById("previewTable");
const btnRun = document.getElementById("btnRun");
const consoleBody = document.getElementById("consoleBody");
const btnClearConsole = document.getElementById("btnClearConsole");
const statusIndicator = document.getElementById("statusIndicator");

let eventSource = null;

// Gestion du Drag & Drop et Choix Fichier
dropZone.addEventListener("click", () => fileInput.click());
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});
["dragleave", "drop"].forEach((event) =>
  dropZone.addEventListener(event, () => dropZone.classList.remove("drag-over"))
);

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

btnClear.addEventListener("click", resetUI);
btnClearConsole.addEventListener("click", () => {
  consoleBody.innerHTML = "";
  log("system", "Console réinitialisée.");
});

// Traitement du fichier Excel
async function handleFile(file) {
  if (!file.name.endsWith(".xlsx")) {
    return log("error", "Seuls les fichiers .xlsx sont acceptés.");
  }

  dropZone.style.display = "none";
  fileDetails.style.display = "block";
  fileName.textContent = file.name;
  fileRows.textContent = "Envoi...";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Erreur lors de l'upload.");

    fileRows.textContent = `${data.rowCount} lignes trouvées sur ${data.sheetCount} feuille(s)`;
    btnRun.disabled = false;

    renderPreview(data.preview);
    log("system", `Fichier "${file.name}" importé avec succès (${data.sheetCount} feuille(s), ${data.rowCount} lignes au total).`);
  } catch (err) {
    log("error", err.message);
    resetUI();
  }
}

function resetUI() {
  fileInput.value = "";
  fileDetails.style.display = "none";
  dropZone.style.display = "flex";
  btnRun.disabled = true;
  previewTable.innerHTML = "";
}

function renderPreview(data = []) {
  previewTable.innerHTML = "";
  if (!data.length) return;

  const headers = Object.keys(data[0]);

  const trHead = document.createElement("tr");
  headers.forEach((h) => {
    const th = document.createElement("th");
    th.textContent = h;
    trHead.appendChild(th);
  });
  previewTable.appendChild(trHead);

  data.forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((h) => {
      const td = document.createElement("td");
      td.textContent = row[h] ?? "";
      tr.appendChild(td);
    });
    previewTable.appendChild(tr);
  });
}

// Helpers Console & Statut
function log(type, message) {
  const line = document.createElement("div");
  line.className = `console-line ${type}`;
  line.innerHTML = `<span class="time">[${new Date().toLocaleTimeString()}]</span> <span class="content">${escapeHtml(message)}</span>`;
  consoleBody.appendChild(line);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function setStatus(online, text) {
  statusIndicator.className = `status-indicator ${online ? "online" : "offline"}`;
  statusIndicator.textContent = text;
}

// Lancement du script
btnRun.addEventListener("click", () => {
  btnRun.disabled = true;
  setStatus(true, "En cours");
  log("system", "Lancement du script d'automatisation sur toutes les feuilles...");

  if (eventSource) eventSource.close();
  eventSource = new EventSource("/api/run");

  eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "done") {
      log("system", data.message);
      eventSource.close();
      btnRun.disabled = false;
      setStatus(false, "Terminé");
      return;
    }
    log(data.type, data.message);
  };

  eventSource.onerror = () => {
    if (eventSource.readyState !== EventSource.CLOSED) {
      log("error", "Connexion interrompue.");
      eventSource.close();
      btnRun.disabled = false;
      setStatus(false, "Hors ligne");
    }
  };
});

