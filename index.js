import { chromium } from "playwright";
import xlsx from "xlsx";
import path from "path";

// Chargement des données du fichier Excel
function loadExcelData() {
  const filePath = path.join(process.cwd(), "uploads", "input.xlsx");
  try {
    const workbook = xlsx.readFile(filePath);
    const sheetMap = {};
    const allData = workbook.SheetNames.flatMap((sheetName) => {
      const rows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
      sheetMap[sheetName] = rows;
      console.log(`[Excel] Feuille "${sheetName}" : ${rows.length} lignes`);
      return rows;
    });

    console.log(`[Excel Total] ${allData.length} lignes chargées sur ${workbook.SheetNames.length} feuille(s).`);
    return { allData, sheetMap };
  } catch {
    console.log("[Excel] Aucun fichier d'entrée valide trouvé.");
    return { allData: [], sheetMap: {} };
  }
}

// Moteur RPA Playwright
async function runRPA() {
  const { allData } = loadExcelData();
  let browser = null;

  try {
    console.log("[RPA] Lancement du navigateur...");
    browser = await chromium.launch({
      headless: false,
      slowMo: 2000,
      args: ["--start-maximized"],
    });

    const context = await browser.newContext({ viewport: null });
    const page = await context.newPage();

    console.log("[RPA] Navigation vers l'application...");
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });

    // --- SCÉNARIO D'AUTOMATISATION ---
    await page.getByRole("button", { name: "Créer un compte" }).click();
    await page.getByRole("textbox", { name: "Prénom" }).fill("qqq");
    await page.getByRole("textbox", { name: "Mot de passe", exact: true }).fill("qqq");
    await page.getByRole("button", { name: "Se connecter" }).click();

    console.log("[RPA] Scénario terminé avec succès.");
  } catch (err) {
    console.error("[RPA Erreur]", err.message);
  } finally {
    if (browser) await browser.close();
  }
}

runRPA();



