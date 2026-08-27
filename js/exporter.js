/**
 * ARCHITEKTŪRA - Exporter Module (CSV, JSON, Printable Carpenter Cut Sheet)
 */

const Exporter = {
  /**
   * Export Purchase Order & Cut List to CSV format
   */
  exportToCSV(results, parts) {
    if (!results || !results.profiles) {
      alert("Pirmiausia atlikite optimizavimą!");
      return;
    }

    let csv = "\uFEFF"; // UTF-8 BOM for Excel
    csv += "ARCHITEKTŪRA - MEDIENOS PJOVIMO IR PIRKIMO SPECIFIKACIJA\n";
    csv += `Data:;${new Date().toLocaleDateString("lt-LT")} ${new Date().toLocaleTimeString("lt-LT")}\n`;
    csv += `Pjūklo storis (Kerf):;${results.params.kerf} mm\n`;
    csv += `Galo nulyginimas (Trim):;${results.params.trim} mm\n`;
    csv += `Medienos kaina:;${results.params.pricePerM3} EUR/m3\n\n`;

    // 1. SUMMARY
    csv += "1. BENDRAS SUVESTINĖ\n";
    csv += "Rodiklis;Reikšmė;Vienetai\n";
    csv += `Iš viso standartinių tašų;${results.summary.totalBoards};vnt.\n`;
    csv += `Bendras perkamos medienos tūris;${results.summary.totalVolumeM3.toFixed(3)};m³\n`;
    csv += `Grynasis detalių tūris;${results.summary.netPartsVolumeM3.toFixed(3)};m³\n`;
    csv += `Atraižos / Nuostolis;${results.summary.wastePercent.toFixed(2)};%\n`;
    csv += `Atraižų tūris;${results.summary.wasteVolumeM3.toFixed(3)};m³\n`;
    csv += `Bendras bėginių metrų kiekis;${results.summary.totalStockLengthM.toFixed(1)};m\n`;
    csv += `Bendras medienos svoris;${Math.round(results.summary.totalWeightKg)};kg\n`;
    csv += `Bendra sąmata;${results.summary.totalCostEur.toFixed(2)};EUR\n\n`;

    // 2. PURCHASE ORDER SPECIFICATION
    csv += "2. UŽSAKYMAS MEDIENOS TIEKĖJUI\n";
    csv += "Skerspjūvis (mm);Ruošinio ilgis (mm);Kiekis (vnt);Bėginiai metrai (m);Tūris (m³);Svoris (kg);Kaina (EUR)\n";

    Object.entries(results.profiles).forEach(([profKey, prof]) => {
      Object.entries(prof.purchaseCounts).forEach(([stockLenMm, count]) => {
        if (count <= 0) return;
        const lenM = Number(stockLenMm) / 1000;
        const runningM = lenM * count;
        const volM3 = runningM * prof.profile.areaM2;
        const weightKg = volM3 * results.params.density;
        const costEur = volM3 * results.params.pricePerM3;
        csv += `${profKey};${stockLenMm};${count};${runningM.toFixed(1)};${volM3.toFixed(3)};${Math.round(weightKg)};${costEur.toFixed(2)}\n`;
      });
    });

    csv += "\n";

    // 3. STEP-BY-STEP CARPENTER CUTTING PLAN
    csv += "3. PJOVIMO PLANAS MEISTRUI\n";
    csv += "Skerspjūvis;Ruošinio Nr.;Ruošinio ilgis (mm);Pjūvis Nr.;Detalės pavadinimas;Ilgis (mm);Pozicija nuo-iki (mm);Atraiža (mm)\n";

    Object.entries(results.profiles).forEach(([profKey, prof]) => {
      prof.boards.forEach((b, bIdx) => {
        b.items.forEach((it, itIdx) => {
          csv += `${profKey};#${bIdx + 1};${b.stockLength};${itIdx + 1};"${it.label}";${it.length};${it.startPos}-${it.endPos};${itIdx === b.items.length - 1 ? b.wasteMm : ""}\n`;
        });
      });
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Architektura_Medienos_Specifikacija_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Save Project to JSON file
   */
  saveProject(projectData) {
    const jsonStr = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Architektura_Projektas_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  /**
   * Print View Execution
   */
  triggerPrint() {
    window.print();
  }
};

if (typeof window !== "undefined") {
  window.Exporter = Exporter;
}
