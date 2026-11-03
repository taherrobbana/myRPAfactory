import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import xlsx from "xlsx";

const app = express();
const PORT = process.env.PORT || 3002;
const UPLOAD_DIR = path.join(process.cwd(), "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    filename: (_req, _file, cb) => cb(null, "input.xlsx"),
  }),
});

app.use(express.static("public"));
app.use(express.json());

// Upload d'un fichier Excel et lecture de toutes les feuilles
app.post("/api/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier fourni." });
  }

  try {
    const workbook = xlsx.readFile(path.join(UPLOAD_DIR, "input.xlsx"));
    const sheetNames = workbook.SheetNames;
    const allRows = sheetNames.flatMap((name) =>
      xlsx.utils.sheet_to_json(workbook.Sheets[name])
    );

    return res.json({
      success: true,
      filename: req.file.originalname,
      sheetNames,
      sheetCount: sheetNames.length,
      rowCount: allRows.length,
      preview: allRows.slice(0, 5),
    });
  } catch (err) {
    return res.status(500).json({ error: "Erreur de lecture du fichier Excel." });
  }
});

// Streaming des logs SSE et exécution du script RPA
app.get("/api/run", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const sendLog = (type, message) => {
    res.write(`data: ${JSON.stringify({ type, message })}\n\n`);
  };

  const streamOutput = (data, type) => {
    data.toString().split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) sendLog(type, trimmed);
    });
  };

  sendLog("info", "Lancement du script d'automatisation sur toutes les feuilles...");

  const child = spawn(process.execPath, ["index.js"], {
    cwd: process.cwd(),
    env: { ...process.env, FORCE_COLOR: "1" },
  });

  child.stdout.on("data", (data) => streamOutput(data, "stdout"));
  child.stderr.on("data", (data) => streamOutput(data, "stderr"));

  child.on("close", (code) => {
    sendLog("done", `Script terminé (code: ${code})`);
    res.end();
  });

  req.on("close", () => {
    if (child.exitCode === null && !child.killed) child.kill();
  });
});

app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));




