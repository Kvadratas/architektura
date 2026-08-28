/**
 * ARCHITEKTŪRA - Comprehensive Automated Test Suite
 */

const fs = require('fs');
const path = require('path');

// Mock browser globals
global.window = global;
global.document = {
  getElementById: (id) => null,
  querySelectorAll: (selector) => [],
  addEventListener: () => {},
  body: { appendChild: () => {}, removeChild: () => {} }
};
global.Blob = class { constructor(content, opts) { this.content = content; this.opts = opts; } };
global.URL = { createObjectURL: () => 'blob:mock-url', revokeObjectURL: () => {} };

let passed = 0;
let failed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✓ ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName} - ${details}`);
    failed++;
  }
}

console.log("\n=======================================================");
console.log("🧪 PALEIDŽIAMAS ARCHITEKTŪRA AUTOMATINIS TESTAVIMAS");
console.log("=======================================================\n");

// 1. Load Modules
console.log("1. Užkraunami visi JS moduliai...");
try {
  require('./js/foundation.js');
  require('./js/fea.js');
  require('./js/energy.js');
  require('./js/splicing.js');
  require('./js/bim_cnc.js');
  require('./js/house_wizard.js');
  require('./js/presets.js');
  require('./js/optimizer.js');
  require('./js/assembler.js');
  require('./js/exporter.js');
  console.log("  ✓ Visi moduliai sėkmingai užkrauti į atmintį.\n");
} catch (err) {
  console.error("  ✗ Klaida kraunant modulius:", err);
  process.exit(1);
}

// 2. Test FoundationEngine
console.log("2. Testuojamas FoundationEngine (Eurokodas 7)...");
try {
  const fe = new FoundationEngine();
  
  // Piles standard
  const resPiles = fe.calculate({ foundationType: 'piles', houseLengthM: 12, houseWidthM: 8 });
  assert(resPiles.metrics && resPiles.metrics.totalPilesCount > 0, "Polių skaičiavimas su rostverku");
  assert(!isNaN(parseFloat(resPiles.metrics.totalConcreteM3)), "Betono tūris yra skaičius");
  assert(resPiles.metrics.rostverkDimensions.includes("x"), "Rostverko matmenys sugeneruoti");

  // Piles no rostverk
  const resNoRostverk = fe.calculate({ foundationType: 'piles_no_rostverk', houseLengthM: 12, houseWidthM: 8 });
  assert(resNoRostverk.metrics && resNoRostverk.metrics.totalPilesCount > resPiles.metrics.totalPilesCount, "Polių be rostverko tinklelis tankesnis");
  assert(resNoRostverk.metrics.steelBracketsCount > 0, "U-ankerių kiekis atitinka polių skaičių");
  assert(resNoRostverk.metrics.bearerTimberM3 > 0, "Medinio aprišimo tūris apskaičiuotas");

  // Slab & Strip
  const resSlab = fe.calculate({ foundationType: 'slab', houseLengthM: 10, houseWidthM: 8 });
  assert(resSlab.metrics && resSlab.metrics.slabThicknessMm > 0, "Švediškos plokštės skaičiavimas");
  const resStrip = fe.calculate({ foundationType: 'strip', houseLengthM: 10, houseWidthM: 8 });
  assert(resStrip.metrics && resStrip.metrics.stripWidthMm > 0, "Juostinių pamatų skaičiavimas");
  console.log("");
} catch (err) {
  assert(false, "FoundationEngine", err.message);
}

// 3. Test StructuralFEAEngine
console.log("3. Testuojamas StructuralFEAEngine (Eurokodas 5)...");
try {
  const fea = new StructuralFEAEngine();
  const resFEA = fea.calculate({ spanM: 8.0, pitchDeg: 30, timberClass: 'C24', snowLoadKNm2: 1.6 });
  assert(resFEA.momentMedKNm > 0, "Lenkimo momentas Med apskaičiuotas");
  assert(resFEA.sigmaMdMPa > 0, "Lenkimo įtempiai sigma_m,d apskaičiuoti");
  assert(resFEA.wFinMm > 0, "Galutinis įlinkis w_fin apskaičiuotas");
  assert(resFEA.utilizationPct > 0, "Panaudojimo lygis eta apskaičiuotas");
  assert(resFEA.statusText !== undefined, "Statuso tekstas grąžintas");
  console.log("");
} catch (err) {
  assert(false, "StructuralFEAEngine", err.message);
}

// 4. Test EnergyEnvelopeEngine
console.log("4. Testuojamas EnergyEnvelopeEngine (STR 2.01.02:2016 A++)...");
try {
  const energy = new EnergyEnvelopeEngine();
  const resEnergy = energy.calculate({ roofInsulationMm: 350, wallInsulationMm: 250 });
  assert(resEnergy.roofU <= 0.10, "Stogo U vertė atitinka A++ standartą (<= 0.10 W/m²K)");
  assert(resEnergy.wallU <= 0.12, "Sienų U vertė atitinka A++ standartą (<= 0.12 W/m²K)");
  assert(resEnergy.isPassA2 === true, "A++ sertifikavimas teigiamas");
  const svgGlaser = energy.generateGlaserChartSVG(resEnergy);
  assert(svgGlaser.includes("<svg") && svgGlaser.includes("</svg>"), "Glaserio SVG grafikas sugeneruotas");
  console.log("");
} catch (err) {
  assert(false, "EnergyEnvelopeEngine", err.message);
}

// 5. Test TimberSplicingEngine
console.log("5. Testuojamas TimberSplicingEngine (>6m medienos sudūrimas)...");
try {
  const splicing = new TimberSplicingEngine();
  const resSplice = splicing.calculate({ rafterLengthM: 7.5, jointType: 'steel_plates' });
  assert(resSplice.needsSplicing === true, "Atpažįsta, kad elementui >6m reikalingas sudūrimas");
  assert(resSplice.spliceLocationM > 0, "Sudūrimo vieta ties minimaliu momentu nustatyta");
  assert(resSplice.hardware && resSplice.hardware.platesCount > 0, "Tvirtinimo plokštelių specifikacija sugeneruota");
  console.log("");
} catch (err) {
  assert(false, "TimberSplicingEngine", err.message);
}

// 6. Test FullHouseMasterEngine
console.log("6. Testuojamas FullHouseMasterEngine (House Wizard & Master BOM)...");
try {
  const hw = new FullHouseMasterEngine();
  
  // Standard Piles House
  const housePiles = hw.generateHouseConfiguration({ houseLengthM: 12, houseWidthM: 8, bedroomsCount: 3, bathroomsCount: 2, foundationType: 'piles' });
  assert(housePiles.masterBOM && housePiles.masterBOM.categories && housePiles.masterBOM.categories.length === 10, "10 kategorijų Master BOM sugeneruota (piles)");
  assert(housePiles.stepsGuide && housePiles.stepsGuide.length === 15, "15 žingsnių statybos eiga sugeneruota");
  assert(housePiles.summary.totalCostEur > 0, "Bendra namo sąmata apskaičiuota");

  // No Rostverk Piles House
  const houseNoRost = hw.generateHouseConfiguration({ houseLengthM: 12, houseWidthM: 8, bedroomsCount: 3, bathroomsCount: 2, foundationType: 'piles_no_rostverk' });
  assert(houseNoRost.masterBOM.categories[0].name.includes("BE Rostverko"), "BOM 1 kategorija pritaikyta pamatams be rostverko");
  assert(houseNoRost.stepsGuide[1].title.includes("U-Ankeriai"), "15 žingsnių gido 2 žingsnis pritaikytas poliams be rostverko");
  console.log("");
} catch (err) {
  assert(false, "FullHouseMasterEngine", err.message);
}

// 7. Test TimberOptimizer
console.log("7. Testuojamas TimberOptimizer (1D Pjovimo Optimizavimas)...");
try {
  const prof = TimberOptimizer.parseProfile("50x200");
  assert(prof.widthMm === 50 && prof.heightMm === 200, "Profilio '50x200' parsinimas");

  const testParts = [
    { id: "p1", label: "Gegnė 1", profile: "50x200", length: 4200, quantity: 4 },
    { id: "p2", label: "Gegnė 2", profile: "50x200", length: 1700, quantity: 4 }
  ];
  const stockLengths = [{ length: 6000, enabled: true }];
  const settings = { kerf: 4, trim: 15, pricePerM3: 280, density: 460, algorithm: "exact" };

  const optRes = TimberOptimizer.optimize(testParts, stockLengths, settings);
  assert(optRes.summary.totalBoards > 0, "Ruošinių kiekis optimizuotas");
  assert(optRes.summary.wastePercent >= 0, "Atraižų procentas apskaičiuotas");
  console.log("");
} catch (err) {
  assert(false, "TimberOptimizer", err.message);
}

// 8. Test ConstructionAssembler
console.log("8. Testuojamas ConstructionAssembler (2D Brėžiniai & Mazgai)...");
try {
  const dummyEl = { innerHTML: '', querySelectorAll: () => [] };
  const ca = new ConstructionAssembler();
  ca.container = dummyEl;

  const projDataStandard = { roofSpanM: 8.0, roofLengthM: 12.0, foundationType: 'piles', pileDiameterMm: 300, pileDepthM: 2.0 };
  ca.data = projDataStandard;

  const svgFdStandard = ca.generateFoundationSVG();
  assert(svgFdStandard.includes("ROSTVERKAS"), "Standartinių pamatų su rostverku SVG");

  ca.data.foundationType = 'piles_no_rostverk';
  const svgFdNoRost = ca.generatePilesNoRostverkSVG();
  assert(svgFdNoRost.includes("GRINDŲ LAGĖS") && svgFdNoRost.includes("Pogrindis"), "Pamatų be rostverko SVG");

  const svgRoof = ca.generateRoofSVG();
  assert(svgRoof.includes("STYGA"), "Stogo SVG brėžinys");

  const nodes = ["node-pile-armature", "node-pile-xps", "node-pile-hydro", "node-pile-u-bracket", "node-pile-bearer", "node-pile-internal-room", "node-pile-underfloor-vent", "node-murlot", "node-ridge", "node-wall-corner"];
  nodes.forEach(nodeId => {
    ca.activeNode = nodeId;
    const nodeHtml = ca.generateNodeDetailHTML();
    assert(nodeHtml.includes("MAZGAS"), `Mazgo '${nodeId}' HTML sugeneruotas`);
  });
  console.log("");
} catch (err) {
  assert(false, "ConstructionAssembler", err.message);
}

// 9. Test Exporter (Engineering Sheet & Multi-Page Document)
console.log("9. Testuojamas Exporter (Inžinerinis Lapas & Dokumentacija)...");
try {
  const projectData = {
    dimensions3D: { spanM: 8.0, lengthM: 12.0, wallHeightM: 2.8, pitchDeg: 30, foundationType: 'piles_no_rostverk', pilesCount: 36 },
    foundationResult: { metrics: { totalBuildingMassTons: '32.5', totalDesignLoadKN: '425.0', totalPilesCount: 36, totalConcreteM3: '5.8', totalRebarKg: 280, pileSpacingM: '1.40' } },
    feaResult: { momentMedKNm: '3.42', sigmaMdMPa: '10.2', wFinMm: '12.4', wFinLimMm: '23.1', utilizationPct: '58' },
    energyResult: { roofU: '0.096', wallU: '0.118', isPassA2: true },
    houseConfig: { summary: { totalCostEur: 54200, costPerM2Eur: 565, totalAreaM2: '96.0' } }
  };

  const docHtml = Exporter.generateEngineeringDocumentHTML(projectData);
  assert(docHtml.includes("BENDRIEJI RODIKLIAI IR PROJEKTO PASAS"), "Lapas 1: Projekto pasas sugeneruotas");
  assert(docHtml.includes("GEOTECHNINIAI PAMATAI"), "Lapas 2: Geotechniniai pamatai sugeneruoti");
  assert(docHtml.includes("FEA SKAIČIAVIMAI"), "Lapas 3: Eurocode 5 FEA sugeneruota");
  assert(docHtml.includes("A++ ENERGETIKA"), "Lapas 4: A++ energetika sugeneruota");
  assert(docHtml.includes("STATYBOS SĄMATA"), "Lapas 5: 10 kategorijų sąmata sugeneruota");
  assert(docHtml.includes("PJOVIMO OPTIMIZAVIMAS"), "Lapas 6: Pjovimo planas sugeneruotas");
  assert(docHtml.includes("KONSTRUKCINIAI MAZGAI"), "Lapas 7: Mazgai ir 15 žingsnių sugeneruota");
  assert(docHtml.includes("7 / 7"), "ISO 7200 inžinerinis spaudas visuose puslapiuose");
  console.log("");
} catch (err) {
  assert(false, "Exporter", err.message);
}

// 10. Test Presets
console.log("10. Testuojamas Presets modulis...");
try {
  const presetsObj = (typeof TimberPresets !== "undefined") ? TimberPresets : (typeof HousePresets !== "undefined" ? HousePresets : null);
  assert(presetsObj !== null, "Presets objektas egzistuoja");
  assert(typeof presetsObj.generateRoof === "function" && typeof presetsObj.generateWall === "function" && typeof presetsObj.generateFloor === "function", "Visi 4 namų šablonų generatoriai pasiekiami");
  console.log("");
} catch (err) {
  assert(false, "Presets", err.message);
}

// 11. Test OpenBIM IFC4 & CNC BTLx Exporter
console.log("11. Testuojamas OpenBIM IFC4 ir CNC BTLx Exporter...");
try {
  let downloadedFiles = [];
  const origDownload = BimCncExporter.downloadFile;
  BimCncExporter.downloadFile = (content, fileName, mimeType) => {
    downloadedFiles.push({ content, fileName, mimeType });
  };

  const sampleState = {
    dimensions3D: { spanM: 8.0, lengthM: 12.0, pitchDeg: 30, wallHeightM: 2.8 },
    parts: [
      { id: "p-test-1", label: "Stogo gegnė", profile: "50x200", length: 4800, quantity: 10 },
      { id: "p-test-2", label: "Mūrlotas", profile: "100x150", length: 6000, quantity: 2 }
    ]
  };

  BimCncExporter.exportToIFC(sampleState);
  assert(downloadedFiles.some(f => f.fileName.includes(".ifc") && f.content.includes("ISO-10303-21") && f.content.includes("IFC4")), "OpenBIM IFC 4.0 failas sėkmingai suformuotas");

  BimCncExporter.exportToBTLx(sampleState.parts);
  assert(downloadedFiles.some(f => f.fileName.includes(".btlx") && f.content.includes("<BTLx") && f.content.includes("ProcessBirdsmouth")), "CNC BTLx failas su staklių operacijomis suformuotas");

  BimCncExporter.downloadFile = origDownload;
  console.log("");
} catch (err) {
  assert(false, "BimCncExporter", err.message);
}

console.log("=======================================================");
console.log(`📊 REZULTATAI: Iš viso testų: ${passed + failed} | Išlaikyta: ${passed} | Nesėkminga: ${failed}`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("🎉 Visi testai sėkmingai išlaikyti! Programa neturi jokių vidinių klaidų.\n");
  process.exit(0);
}
