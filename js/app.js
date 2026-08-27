/**
 * ARCHITEKTŪRA - Main Application Controller
 * Eurocode 7 Geotechnics, Eurocode 5 FEA Heatmap, STR 2.01.02:2016 A++ Glaser Energy,
 * Splicing Engineering (>6m), Direct OpenBIM (IFC4) & CNC (BTLx) Exporters, and 1D Cutting Stock CSP.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Application State
  const state = {
    parts: [],
    stockLengths: [
      { length: 6000, enabled: true },
      { length: 5000, enabled: true },
      { length: 4000, enabled: true },
      { length: 3000, enabled: true }
    ],
    settings: {
      kerf: 4,
      trim: 15,
      pricePerM3: 280,
      density: 460,
      algorithm: "exact"
    },
    foundation: {
      type: "piles", // 'piles' | 'slab' | 'strip'
      soilKey: "sand_loam",
      roofCladding: "steel",
      customDepthM: 0,
      customDiamMm: 0,
      lastCalculation: null
    },
    fea: {
      timberClass: "C24",
      snowLoadKNm2: 1.6,
      deadLoadKNm2: 0.65,
      windLoadKNm2: 0.35,
      lastResult: null
    },
    energy: {
      insulationType: "mineral_wool",
      roofInsulationMm: 350,
      wallInsulationMm: 250,
      hasVaporBarrier: true,
      indoorTempC: 21,
      outdoorTempC: -15,
      indoorHumidityPct: 50,
      outdoorHumidityPct: 85,
      lastResult: null
    },
    splicing: {
      jointType: "steel_plates",
      maxStandardLengthMm: 6000,
      lastResult: null
    },
    dimensions3D: {
      spanM: 8.0,
      pitchDeg: 30,
      overhangM: 0.6,
      lengthM: 12.0,
      stepM: 0.6,
      wallHeightM: 2.8,
      wallTotalLenM: 40.0,
      floorSpanM: 4.5,
      floorWidthM: 10.0,
      foundationType: "piles",
      pilesCount: 22,
      pileDiameterMm: 300,
      pileDepthM: 2.0
    },
    lastResults: null
  };

  // Engines Initialization
  const foundationEngine = new FoundationEngine();
  const feaEngine = new StructuralFEAEngine();
  const energyEngine = new EnergyEnvelopeEngine();
  const splicingEngine = new TimberSplicingEngine();
  const houseWizardEngine = new FullHouseMasterEngine();
  let visualizer = null;
  let assembler = null;
  let viewer3d = null;

  try {
    visualizer = new TimberVisualizer("cutting-layouts-container");
  } catch (e) {
    console.error("Visualizer init error:", e);
  }

  try {
    assembler = new ConstructionAssembler("blueprint-container");
  } catch (e) {
    console.error("Assembler init error:", e);
  }

  try {
    if (window.THREE && typeof Timber3DViewer !== "undefined") {
      viewer3d = new Timber3DViewer("three-canvas-container");
    }
  } catch (err) {
    console.warn("3D WebGL init note:", err);
  }

  try {
    if (typeof ConstructionTutorial !== "undefined") {
      ConstructionTutorial.init(viewer3d);
    }
  } catch (err) {
    console.warn("Tutorial init note:", err);
  }

  // DOM Elements
  const partsTableBody = document.getElementById("parts-table-body");
  const stockLengthsList = document.getElementById("stock-lengths-list");
  const summaryTotalParts = document.getElementById("summary-total-parts-count");
  const summaryNetVolume = document.getElementById("summary-net-volume");
  const geotechLiveSummary = document.getElementById("geotech-live-summary");
  const feaLiveSummary = document.getElementById("fea-live-summary");
  const energyLiveSummary = document.getElementById("energy-live-summary");
  const splicingLiveSummary = document.getElementById("splicing-live-summary");
  const fullHouseResultsContainer = document.getElementById("full-house-results-container");
  const wizardKpiTotalPrice = document.getElementById("wizard-kpi-total-price");
  const wizardKpiM2Price = document.getElementById("wizard-kpi-m2-price");

  /**
   * 1. RECALCULATE GEOTECHNICAL FOUNDATION (Eurocode 7)
   */
  function updateFoundationCalculation() {
    let netTimberM3 = 0;
    state.parts.forEach(p => {
      const q = parseInt(p.quantity) || 0;
      const lenMm = parseInt(p.length) || 0;
      const prof = TimberOptimizer.parseProfile(p.profile);
      netTimberM3 += (lenMm / 1000) * q * prof.areaM2;
    });

    const fdCalc = foundationEngine.calculate({
      foundationType: state.foundation.type,
      houseLengthM: state.dimensions3D.lengthM || 12.0,
      houseWidthM: state.dimensions3D.spanM || 8.0,
      wallHeightM: state.dimensions3D.wallHeightM || 2.8,
      roofPitchDeg: state.dimensions3D.pitchDeg || 30,
      roofOverhangM: state.dimensions3D.overhangM || 0.6,
      soilKey: state.foundation.soilKey,
      timberVolumeM3: netTimberM3,
      roofCladdingType: state.foundation.roofCladding,
      customPileDepthM: state.foundation.customDepthM,
      customPileDiamMm: state.foundation.customDiamMm
    });

    state.foundation.lastCalculation = fdCalc;

    if (fdCalc.metrics) {
      if (fdCalc.metrics.totalPilesCount) {
        state.dimensions3D.pilesCount = fdCalc.metrics.totalPilesCount;
        state.dimensions3D.pileDiameterMm = fdCalc.metrics.pileDiameterMm;
        state.dimensions3D.pileDepthM = parseFloat(fdCalc.metrics.pileDepthM);
      }
    }
    state.dimensions3D.foundationType = state.foundation.type;

    renderGeotechSummaryUI(fdCalc);

    // Sync 2D & 3D
    if (assembler) assembler.render(state.dimensions3D);
    if (viewer3d) viewer3d.buildModel(state.dimensions3D);

    // Update FEA, Energy & Splicing
    updateFEACalculation();
    updateEnergyCalculation();
    updateSplicingCalculation();
  }

  /**
   * Render Geotechnical Live UI Summary Card
   */
  function renderGeotechSummaryUI(calc) {
    if (!geotechLiveSummary) return;

    if (calc.foundationType === "piles") {
      geotechLiveSummary.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-stone-800">
          <div class="font-bold text-white flex items-center space-x-1.5">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>${calc.foundationTitle}</span>
          </div>
          <span class="text-[10px] font-mono text-stone-400">${calc.soilName}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Namo Masė + Sniegas:</span>
            <span class="font-bold text-amber-400 font-mono text-sm">${calc.metrics.totalBuildingMassTons} t</span>
            <span class="text-[9px] text-stone-500 block">(${calc.metrics.totalDesignLoadKN} kN)</span>
          </div>

          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Polių Kiekis & Žingsnis:</span>
            <span class="font-bold text-white font-mono text-sm">${calc.metrics.totalPilesCount} vnt.</span>
            <span class="text-[9px] text-stone-400 block">kas ~${calc.metrics.pileSpacingM} m</span>
          </div>

          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Polio Matmenys:</span>
            <span class="font-bold text-sky-400 font-mono text-xs">Ø ${calc.metrics.pileDiameterMm} mm</span>
            <span class="text-[10px] text-stone-300 block font-mono">Gylis: ${calc.metrics.pileDepthM} m</span>
          </div>

          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Betonas & Armatūra:</span>
            <span class="font-bold text-emerald-400 font-mono text-xs">${calc.metrics.totalConcreteM3} m³</span>
            <span class="text-[10px] text-stone-300 block font-mono">${calc.metrics.totalRebarKg} kg</span>
          </div>
        </div>

        <div class="p-2 rounded bg-amber-950/30 border border-amber-500/20 text-[10px] text-amber-300 flex items-center justify-between">
          <span>Rostverkas: <b>${calc.metrics.rostverkDimensions}</b> (C20/25 betonas)</span>
          <span class="font-mono text-stone-300">1 polio galia: ~${calc.metrics.singlePileCapacityTons} t</span>
        </div>
      `;
    } else if (calc.foundationType === "piles_no_rostverk") {
      geotechLiveSummary.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-stone-800">
          <div class="font-bold text-amber-300 flex items-center space-x-1.5">
            <i data-lucide="check-circle-2" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>${calc.foundationTitle}</span>
          </div>
          <span class="text-[10px] font-mono text-stone-400">${calc.soilName}</span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Namo Masė:</span>
            <span class="font-bold text-amber-400 font-mono text-sm">${calc.metrics.totalBuildingMassTons} t</span>
            <span class="text-[9px] text-stone-500 block">(${calc.metrics.totalDesignLoadKN} kN)</span>
          </div>

          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Viso Polių (Tinklas):</span>
            <span class="font-bold text-emerald-400 font-mono text-sm">${calc.metrics.totalPilesCount} vnt.</span>
            <span class="text-[9px] text-stone-400 block">Perimetras ${calc.metrics.perimeterPilesCount} + Vidaus ${calc.metrics.internalRoomPilesCount}</span>
          </div>

          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Polio Matmenys:</span>
            <span class="font-bold text-sky-400 font-mono text-xs">Ø ${calc.metrics.pileDiameterMm} mm</span>
            <span class="text-[10px] text-stone-300 block font-mono">Gylis: ${calc.metrics.pileDepthM} m</span>
          </div>

          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Betonas (Tik poliams):</span>
            <span class="font-bold text-white font-mono text-xs">${calc.metrics.totalConcreteM3} m³</span>
            <span class="text-[10px] text-stone-400 block font-mono">0 m³ rostverko</span>
          </div>
        </div>

        <div class="p-2 rounded bg-stone-900 border border-stone-800 text-[10px] space-y-1">
          <div class="flex items-center justify-between text-stone-300">
            <span>🪵 Medinis aprišamasis padas: <b>C24 150x200 mm (${calc.metrics.bearerLengthM} m, ${calc.metrics.bearerTimberM3} m³)</b></span>
            <span class="text-amber-400 font-mono">Žingsnis: ${calc.metrics.pileSpacingM} m</span>
          </div>
          <div class="flex items-center justify-between text-stone-400">
            <span>🔩 Tvirtinimas: <b>${calc.metrics.steelBracketsCount} vnt. cinkuotų U-ankerių M20/M24</b></span>
            <span>1 polio galia: ~${calc.metrics.singlePileCapacityTons} t</span>
          </div>
        </div>
      `;
    } else {
      geotechLiveSummary.innerHTML = `
        <div class="flex items-center justify-between pb-2 border-b border-stone-800">
          <div class="font-bold text-white">${calc.foundationTitle}</div>
          <span class="text-[10px] font-mono text-stone-400">${calc.soilName}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 pt-1 text-xs">
          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Namo Masė:</span>
            <span class="font-bold text-amber-400 font-mono">${calc.metrics.totalBuildingMassTons} t</span>
          </div>
          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Betono tūris:</span>
            <span class="font-bold text-white font-mono">${calc.metrics.totalConcreteM3} m³</span>
          </div>
          <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
            <span class="text-[10px] text-stone-400 block">Armatūra:</span>
            <span class="font-bold text-emerald-400 font-mono">${calc.metrics.totalRebarKg} kg</span>
          </div>
        </div>
      `;
    }

    if (window.lucide) lucide.createIcons();
  }

  /**
   * 2. RECALCULATE FEA MECHANICS (Eurocode 5)
   */
  function updateFEACalculation() {
    const span = (state.dimensions3D.spanM || 8.0) / 2; // half span for symmetric pitch
    const pitch = state.dimensions3D.pitchDeg || 30;
    const step = state.dimensions3D.stepM || 0.6;
    const snowLoad = parseFloat(state.fea.snowLoadKNm2) || 1.6;
    const timberClass = state.fea.timberClass || "C24";

    const feaRes = feaEngine.analyzeRafter({
      spanM: span,
      spacingM: step,
      pitchDeg: pitch,
      widthMm: 50,
      heightMm: 200,
      timberClass,
      snowLoadKNm2: snowLoad,
      deadLoadKNm2: 0.65,
      windLoadKNm2: 0.35
    });

    state.fea.lastResult = feaRes;
    renderFEASummaryUI(feaRes);

    if (viewer3d && viewer3d.isFEAMode) {
      viewer3d.setFEAMode(true, feaRes);
    }
  }

  /**
   * Render Live FEA Summary Card
   */
  function renderFEASummaryUI(fea) {
    if (!feaLiveSummary) return;

    feaLiveSummary.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-stone-800">
        <div class="font-bold text-white flex items-center space-x-1.5">
          <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${fea.colorCss}"></span>
          <span>${fea.elementName} (${fea.dimensions})</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded ${fea.isSafe ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30' : 'bg-rose-950 text-rose-300 border border-rose-600/30'}">
          ${fea.isSafe ? '✅ SAUGU (EC5)' : '⚠️ PERKROVA'}
        </span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
          <span class="text-[10px] text-stone-400 block">Lenkimo momentas:</span>
          <span class="font-bold text-white font-mono text-xs">${fea.M_Ed_kNm} kNm</span>
          <span class="text-[9px] text-stone-500 block">M_Ed</span>
        </div>

        <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
          <span class="text-[10px] text-stone-400 block">Įtempis σ vs leistinas:</span>
          <span class="font-bold text-amber-400 font-mono text-xs">${fea.sigma_m_MPa} / ${fea.sigma_limit_MPa}</span>
          <span class="text-[9px] text-stone-500 block">MPa (${fea.bendingUtilPct}%)</span>
        </div>

        <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
          <span class="text-[10px] text-stone-400 block">Įlinkis f vs L/300:</span>
          <span class="font-bold font-mono text-xs" style="color: ${fea.colorCss}">${fea.w_inst_mm} mm</span>
          <span class="text-[9px] text-stone-400 block">L/300 = ${fea.w_limit_inst_mm} mm</span>
        </div>

        <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
          <span class="text-[10px] text-stone-400 block">Bendra apkrova:</span>
          <span class="font-bold text-white font-mono text-xs" style="color: ${fea.colorCss}">${fea.utilizationPct}%</span>
          <span class="text-[9px] text-stone-400 block">Laikomoji galia</span>
        </div>
      </div>

      <div class="p-2.5 rounded-lg text-[11px] leading-relaxed border ${fea.isSafe ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-200' : 'bg-rose-950/40 border-rose-500/30 text-rose-200'}">
        ${fea.recommendation}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  }

  /**
   * 3. RECALCULATE ENERGY & GLASER CONDENSATION (STR 2.01.02:2016)
   */
  function updateEnergyCalculation() {
    const energyRes = energyEngine.calculateEnvelope({
      roofInsulationMm: parseInt(state.energy.roofInsulationMm) || 350,
      wallInsulationMm: parseInt(state.energy.wallInsulationMm) || 250,
      insulationType: state.energy.insulationType,
      indoorTempC: state.energy.indoorTempC,
      outdoorTempC: state.energy.outdoorTempC,
      indoorHumidityPct: state.energy.indoorHumidityPct,
      outdoorHumidityPct: state.energy.outdoorHumidityPct,
      hasVaporBarrier: state.energy.hasVaporBarrier
    });

    state.energy.lastResult = energyRes;
    renderEnergySummaryUI(energyRes);
  }

  /**
   * Render Live Energy & Glaser SVG Summary Card
   */
  function renderEnergySummaryUI(energy) {
    if (!energyLiveSummary) return;

    const glChart = energyEngine.renderGlaserChartSVG(energy.glasser);

    energyLiveSummary.innerHTML = `
      <div class="flex items-center justify-between pb-2 border-b border-stone-800">
        <div class="font-bold text-white flex items-center space-x-1.5">
          <i data-lucide="shield-check" class="w-3.5 h-3.5 text-cyan-400"></i>
          <span>A++ Šiluminė Varža (STR 2.01.02:2016)</span>
        </div>
        <span class="text-[10px] font-mono px-2 py-0.5 rounded ${energy.roof.isAplusplus ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/30' : 'bg-amber-950 text-amber-300 border border-amber-600/30'}">
          ${energy.roof.isAplusplus ? 'A++ KLASĖ' : 'A+ KLASĖ'}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
          <span class="text-[10px] text-stone-400 block">Stogo U-vertė (max 0.10):</span>
          <span class="font-bold text-white font-mono text-sm">${energy.roof.U_val} W/m²K</span>
          <span class="text-[9px] text-stone-400 block">R = ${energy.roof.R_val} m²K/W (${energy.roof.insulationMm} mm)</span>
        </div>

        <div class="p-2 rounded-lg bg-stone-900 border border-stone-800">
          <span class="text-[10px] text-stone-400 block">Sienos U-vertė (max 0.12):</span>
          <span class="font-bold text-white font-mono text-sm">${energy.wall.U_val} W/m²K</span>
          <span class="text-[9px] text-stone-400 block">R = ${energy.wall.R_val} m²K/W (${energy.wall.insulationMm} mm)</span>
        </div>
      </div>

      <!-- Glaser Vapor Condensation Profile Chart -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between text-[10px] text-stone-400 font-mono">
          <span>Glaserio Rasos Taško Kreivė (Drėgmės difuzija):</span>
          <div class="flex items-center space-x-2">
            <span class="text-sky-400">● P_sat</span>
            <span class="text-amber-400">● P_act</span>
            <span class="text-yellow-400">● Temp</span>
          </div>
        </div>
        <div class="p-2 rounded-xl bg-stone-950 border border-stone-800/90 overflow-hidden">
          ${glChart}
        </div>
      </div>

      <div class="p-2 rounded-lg text-[10px] ${energy.glasser.hasCondensation ? 'bg-rose-950/40 border border-rose-500/30 text-rose-200' : 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-200'}">
        ${energy.glasser.condensationText}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  }

  /**
   * 4. RECALCULATE TIMBER SPLICING (>6m)
   */
  function updateSplicingCalculation() {
    const spliceRes = splicingEngine.processParts(state.parts, state.splicing.jointType, state.splicing.maxStandardLengthMm);
    state.splicing.lastResult = spliceRes;
    renderSplicingSummaryUI(spliceRes.hardware);
  }

  /**
   * Render Live Splicing Summary Card
   */
  function renderSplicingSummaryUI(hardware) {
    if (!splicingLiveSummary) return;
    splicingLiveSummary.innerHTML = splicingEngine.renderSpliceSummaryHTML(hardware);
    if (window.lucide) lucide.createIcons();
  }

  /**
   * 5. VISO NAMO MASTER GENERATION (Kambariai, WC, 10 Kategorijų Sąmata ir 15 Žingsnių Gidas)
   */
  function runFullHouseGeneration() {
    const lengthM = parseFloat(document.getElementById("wiz-house-length")?.value) || 12.0;
    const widthM = parseFloat(document.getElementById("wiz-house-width")?.value) || 8.0;
    const storeys = parseInt(document.getElementById("wiz-house-storeys")?.value) || 1;
    const bedroomsCount = parseInt(document.getElementById("wiz-bedrooms-count")?.value) || 3;
    const bathroomsCount = parseInt(document.getElementById("wiz-bathrooms-count")?.value) || 2;
    const foundationType = document.getElementById("wiz-foundation-type")?.value || "piles";
    const roofCladding = document.getElementById("wiz-roof-cladding")?.value || "steel";
    const insulationThick = parseInt(document.getElementById("wiz-insulation-thick")?.value) || 350;

    const houseConfig = houseWizardEngine.generateHouseConfiguration({
      houseLengthM: lengthM,
      houseWidthM: widthM,
      storeys,
      bedroomsCount,
      bathroomsCount,
      hasLivingKitchen: true,
      foundationType,
      roofType: "gable",
      roofPitchDeg: 30,
      roofCladding,
      insulationThicknessMm: insulationThick,
      facadeType: "timber_cladding"
    });

    // Update Top KPI
    if (wizardKpiTotalPrice) {
      wizardKpiTotalPrice.textContent = `~${houseConfig.summary.totalCostEur.toLocaleString()} €`;
    }
    if (wizardKpiM2Price) {
      wizardKpiM2Price.textContent = `(${houseConfig.summary.costPerM2Eur} €/m² | ${houseConfig.summary.totalAreaM2} m²)`;
    }

    // Generate Standard Construction Parts List for Cutting Stock Optimizer
    const generatedParts = [];
    
    // Roof rafters
    const rafterLenMm = Math.round((((widthM / 2) / Math.cos((30 * Math.PI) / 180)) + 0.6) * 1000);
    const rafterPairs = Math.ceil(lengthM / 0.6) + 1;
    generatedParts.push({ id: "wh-r1", label: "Stogo gegnė šiaurė", profile: "50x200", length: rafterLenMm, quantity: rafterPairs });
    generatedParts.push({ id: "wh-r2", label: "Stogo gegnė pietūs", profile: "50x200", length: rafterLenMm, quantity: rafterPairs });
    generatedParts.push({ id: "wh-r3", label: "Stogo styga / lubų karkasas", profile: "50x150", length: Math.round(widthM * 0.45 * 1000), quantity: rafterPairs });
    generatedParts.push({ id: "wh-r4", label: "Mūrlotas", profile: "100x150", length: 6000, quantity: Math.ceil((lengthM * 2) / 6.0) });

    // Exterior Wall Framing
    const perimeterM = 2 * (lengthM + widthM);
    const studsCount = Math.round((perimeterM / 0.6) * 1.15);
    generatedParts.push({ id: "wh-w1", label: "Išorinės sienos statramstis (2.8m)", profile: "50x150", length: 2800, quantity: studsCount });
    generatedParts.push({ id: "wh-w2", label: "Sienos apatinis/viršutinis bėgis (6.0m)", profile: "50x150", length: 6000, quantity: Math.ceil((perimeterM * 3) / 6.0) });

    // Interior Room Partition Studs (Kambariai + WC)
    const partStudsCount = Math.round((bedroomsCount + bathroomsCount + 1) * 16);
    generatedParts.push({ id: "wh-p1", label: "Vidaus kambarių/WC pertvarų statramstis", profile: "50x100", length: 2800, quantity: partStudsCount });

    // Floor joists (Perdanga)
    const floorJoistsCount = Math.ceil(lengthM / 0.4) + 1;
    generatedParts.push({ id: "wh-f1", label: "Perdangos laikančioji sija", profile: "50x220", length: Math.round(widthM * 1000), quantity: floorJoistsCount });

    // Heavy Timber Bearer Girders on Piles (if No Rostverkas)
    if (foundationType === "piles_no_rostverk") {
      const gridW = Math.ceil(widthM / 1.4) + 1;
      const bearerGirdersCount = gridW + 2;
      generatedParts.push({ id: "wh-bg1", label: "Medinis aprišamasis padas ant polių", profile: "150x200", length: 6000, quantity: Math.ceil((lengthM * bearerGirdersCount) / 6.0) });
    }

    state.parts = generatedParts;
    state.dimensions3D.lengthM = lengthM;
    state.dimensions3D.spanM = widthM;
    state.dimensions3D.wallHeightM = 2.8;
    state.dimensions3D.roofLengthM = lengthM;
    state.dimensions3D.roofSpanM = widthM;
    state.dimensions3D.foundationType = foundationType;
    state.foundation.type = foundationType;

    renderPartsTable();
    renderStockLengths();
    updateLiveSummaries();
    updateFoundationCalculation();

    // Render Full House UI Results (Rooms, BOM, 15 Steps)
    renderFullHouseResultsUI(houseConfig);
  }

  /**
   * Render Full House Master Results UI
   */
  function renderFullHouseResultsUI(config) {
    if (!fullHouseResultsContainer) return;

    fullHouseResultsContainer.innerHTML = `
      <!-- Sub-Tabs Switcher -->
      <div class="flex flex-wrap items-center gap-2 p-1.5 bg-stone-950/80 rounded-2xl border border-stone-800 text-xs">
        <button type="button" class="btn-wiz-tab active px-4 py-2 rounded-xl font-bold bg-brand-500 text-white shadow" data-wiz-tab="rooms">
          🛏️ Kambariai & Patalpos (${config.rooms.length})
        </button>
        <button type="button" class="btn-wiz-tab px-4 py-2 rounded-xl font-bold text-stone-300 hover:text-white" data-wiz-tab="bom">
          📋 10-ies Kategorijų Sąmata (${config.summary.totalCostEur.toLocaleString()} €)
        </button>
        <button type="button" class="btn-wiz-tab px-4 py-2 rounded-xl font-bold text-stone-300 hover:text-white" data-wiz-tab="timeline">
          🏗️ 15 Žingsnių Statybų Gidas Step-by-Step
        </button>
      </div>

      <!-- PANE 1: ROOMS MATRIX -->
      <div id="wiz-pane-rooms" class="wiz-pane space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${config.rooms.map(room => `
            <div class="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 hover:border-brand-500/50 transition-all space-y-2 relative overflow-hidden shadow-lg">
              <div class="absolute top-0 left-0 w-1.5 h-full" style="background-color: ${room.color}"></div>
              <div class="flex items-center justify-between pl-2">
                <span class="font-bold text-white text-xs">${room.name}</span>
                <span class="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-stone-900 border border-stone-800" style="color: ${room.color}">
                  ${room.areaM2} m²
                </span>
              </div>
              <p class="text-[11px] text-stone-400 pl-2 leading-relaxed">${room.description}</p>
              <div class="flex items-center justify-between text-[10px] text-stone-500 font-mono pl-2 pt-1 border-t border-stone-900">
                <span>📐 Matmenys: ~${room.widthM} × ${room.lengthM} m</span>
                <span>🪟 Langai: ${room.windows} vnt.</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- PANE 2: COMPLETE 10-CATEGORY MASTER BOM -->
      <div id="wiz-pane-bom" class="wiz-pane hidden space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${config.masterBOM.categories.map((cat, idx) => `
            <div class="p-4 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-3 shadow-lg">
              <div class="flex items-center justify-between pb-2 border-b border-stone-800">
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-white text-xs">${cat.name}</span>
                </div>
                <span class="font-mono font-bold text-emerald-400 text-xs">${cat.totalEur.toLocaleString()} €</span>
              </div>
              <div class="space-y-1.5">
                ${cat.items.map(item => `
                  <div class="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-stone-900/60 border border-stone-850">
                    <span class="text-stone-300">${item.name}</span>
                    <div class="flex items-center space-x-2 font-mono">
                      <span class="text-stone-400">${item.qty} ${item.unit}</span>
                      <span class="text-stone-200 font-bold">${item.totalEur.toLocaleString()} €</span>
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>

        <div class="p-4 rounded-2xl bg-gradient-to-r from-stone-900 via-brand-950 to-stone-900 border border-brand-500/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span class="text-stone-400 block text-[11px]">BENDRA VISO NAMO STATYBOS SĄMATA:</span>
            <span class="text-2xl font-extrabold text-emerald-400 font-mono">${config.masterBOM.totalCostEur.toLocaleString()} €</span>
          </div>
          <div class="text-right">
            <span class="text-stone-400 block text-[11px]">Savikaina už kvadratinį metrą:</span>
            <span class="text-lg font-bold text-white font-mono">${config.summary.costPerM2Eur} € / m² (${config.summary.totalAreaM2} m²)</span>
          </div>
        </div>
      </div>

      <!-- PANE 3: 15-STEP CHRONOLOGICAL CONSTRUCTION MASTER GUIDE -->
      <div id="wiz-pane-timeline" class="wiz-pane hidden space-y-4">
        <div class="p-3 bg-stone-950/60 rounded-xl border border-stone-800 text-xs text-stone-300 flex items-center justify-between">
          <span>Pasirinkite statybų etapą, kad pamatytumėte instrukcijas, medžiagas, įrankius ir suderinamumą:</span>
          <span class="text-brand-400 font-mono font-bold">15 Žingsnių Gidas</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          ${config.constructionGuide15Steps.map(st => `
            <button type="button" class="btn-wiz-step text-left p-2.5 rounded-xl border transition-all ${st.step === 1 ? 'bg-brand-500/20 border-brand-500 text-white active-step' : 'bg-stone-950/70 border-stone-800/80 text-stone-300 hover:border-stone-700'}" data-step-idx="${st.step}">
              <div class="flex items-center justify-between text-[10px] font-mono mb-1">
                <span class="text-brand-400 font-bold">Žingsnis #${st.step}</span>
                <span class="text-stone-400">${st.days}</span>
              </div>
              <div class="font-bold text-xs leading-snug line-clamp-1">${st.title}</div>
            </button>
          `).join("")}
        </div>

        <!-- Selected Step Detail Card -->
        <div id="wiz-step-detail-card" class="p-5 rounded-2xl bg-stone-950/90 border border-brand-500/40 space-y-4 shadow-xl">
          <!-- Injected dynamically on step select -->
        </div>
      </div>
    `;

    // Bind sub-tabs
    const wizTabBtns = fullHouseResultsContainer.querySelectorAll(".btn-wiz-tab");
    wizTabBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        wizTabBtns.forEach(b => {
          b.classList.remove("active", "bg-brand-500", "text-white", "shadow");
          b.classList.add("text-stone-300");
        });
        btn.classList.add("active", "bg-brand-500", "text-white", "shadow");
        btn.classList.remove("text-stone-300");

        const tab = btn.dataset.wizTab;
        fullHouseResultsContainer.querySelectorAll(".wiz-pane").forEach(p => p.classList.add("hidden"));
        const activePane = fullHouseResultsContainer.querySelector(`#wiz-pane-${tab}`);
        if (activePane) activePane.classList.remove("hidden");
      });
    });

    // Helper to render active step
    function renderStepDetail(stepNum) {
      const stepData = config.constructionGuide15Steps.find(s => s.step === stepNum) || config.constructionGuide15Steps[0];
      const card = fullHouseResultsContainer.querySelector("#wiz-step-detail-card");
      if (!card) return;

      card.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-800">
          <div class="flex items-center space-x-2.5">
            <span class="px-2.5 py-1 rounded-lg bg-brand-500 text-white font-mono font-extrabold text-xs">#${stepData.step}</span>
            <h3 class="text-base font-bold text-white">${stepData.title}</h3>
          </div>
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded bg-stone-900 text-amber-300 text-xs font-mono border border-stone-800">⏱️ Trukmė: ${stepData.days}</span>
            <button type="button" class="btn-sync-3d-step px-3 py-1 bg-sky-950/80 text-sky-300 border border-sky-600/40 rounded-lg text-xs font-bold hover:bg-sky-900 transition-all flex items-center space-x-1.5" data-cad-step="${Math.min(10, stepData.step)}">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i>
              <span>Rodyti 3D modelyje</span>
            </button>
          </div>
        </div>

        <div class="space-y-2 text-xs">
          <div class="font-semibold text-stone-200">📋 Meistro Darbo Eiga:</div>
          <p class="text-stone-300 leading-relaxed bg-stone-900/60 p-3 rounded-xl border border-stone-850">${stepData.instructions}</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="p-3 rounded-xl bg-stone-900/60 border border-stone-850 space-y-1">
            <div class="text-[11px] font-bold text-stone-400 flex items-center space-x-1">
              <i data-lucide="package" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Pagrindinės Medžiagos:</span>
            </div>
            <div class="text-stone-200">${stepData.keyMaterials}</div>
          </div>

          <div class="p-3 rounded-xl bg-stone-900/60 border border-stone-850 space-y-1">
            <div class="text-[11px] font-bold text-stone-400 flex items-center space-x-1">
              <i data-lucide="award" class="w-3.5 h-3.5 text-emerald-400"></i>
              <span>Statybos Etapas:</span>
            </div>
            <div class="text-emerald-300 font-mono">${stepData.phase}</div>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
          ${stepData.proTip}
        </div>
      `;

      if (window.lucide) lucide.createIcons();

      // Bind 3D view button
      const syncBtn = card.querySelector(".btn-sync-3d-step");
      if (syncBtn) {
        syncBtn.addEventListener("click", () => {
          const cStep = parseInt(syncBtn.dataset.cadStep) || 1;
          if (viewer3d) {
            viewer3d.setStep(cStep);
            const canvasElem = document.getElementById("three-canvas-container");
            if (canvasElem) canvasElem.scrollIntoView({ behavior: "smooth" });
          }
        });
      }
    }

    // Bind step clickers
    const stepBtns = fullHouseResultsContainer.querySelectorAll(".btn-wiz-step");
    stepBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        stepBtns.forEach(b => {
          b.classList.remove("bg-brand-500/20", "border-brand-500", "text-white", "active-step");
          b.classList.add("bg-stone-950/70", "border-stone-800/80", "text-stone-300");
        });
        btn.classList.add("bg-brand-500/20", "border-brand-500", "text-white", "active-step");
        btn.classList.remove("bg-stone-950/70", "border-stone-800/80", "text-stone-300");

        const sIdx = parseInt(btn.dataset.stepIdx) || 1;
        renderStepDetail(sIdx);
      });
    });

    // Render initial step 1
    renderStepDetail(1);

    if (window.lucide) lucide.createIcons();
  }

  /**
   * FOUNDATION TYPE BUTTONS BINDING
   */
  const fdBtns = document.querySelectorAll(".btn-foundation-type");
  fdBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      fdBtns.forEach(b => {
        b.classList.remove("active", "bg-brand-500", "text-white", "border-brand-400");
        b.classList.add("bg-stone-900", "text-stone-400", "border-stone-800");
      });
      btn.classList.add("active", "bg-brand-500", "text-white", "border-brand-400");
      btn.classList.remove("bg-stone-900", "text-stone-400", "border-stone-800");

      state.foundation.type = btn.dataset.ftype;
      updateFoundationCalculation();
    });
  });

  const soilSelect = document.getElementById("soil-type-select");
  if (soilSelect) {
    soilSelect.addEventListener("change", (e) => {
      state.foundation.soilKey = e.target.value;
      updateFoundationCalculation();
    });
  }

  const roofCladdingSelect = document.getElementById("roof-cladding-weight");
  if (roofCladdingSelect) {
    roofCladdingSelect.addEventListener("change", (e) => {
      state.foundation.roofCladding = e.target.value;
      updateFoundationCalculation();
    });
  }

  // FEA Listeners
  const feaTimberSelect = document.getElementById("fea-timber-class");
  if (feaTimberSelect) {
    feaTimberSelect.addEventListener("change", (e) => {
      state.fea.timberClass = e.target.value;
      updateFEACalculation();
    });
  }

  const feaSnowSelect = document.getElementById("fea-snow-load");
  if (feaSnowSelect) {
    feaSnowSelect.addEventListener("change", (e) => {
      state.fea.snowLoadKNm2 = parseFloat(e.target.value) || 1.6;
      updateFEACalculation();
    });
  }

  // Energy Listeners
  const energyInsSelect = document.getElementById("energy-insulation-type");
  if (energyInsSelect) {
    energyInsSelect.addEventListener("change", (e) => {
      state.energy.insulationType = e.target.value;
      updateEnergyCalculation();
    });
  }

  const energyThickInput = document.getElementById("energy-roof-thickness");
  if (energyThickInput) {
    energyThickInput.addEventListener("input", (e) => {
      state.energy.roofInsulationMm = parseInt(e.target.value) || 350;
      updateEnergyCalculation();
    });
  }

  const energyVaporCb = document.getElementById("energy-vapor-barrier");
  if (energyVaporCb) {
    energyVaporCb.addEventListener("change", (e) => {
      state.energy.hasVaporBarrier = e.target.checked;
      updateEnergyCalculation();
    });
  }

  // Splicing Listeners
  const splicingJointSelect = document.getElementById("splicing-joint-type");
  if (splicingJointSelect) {
    splicingJointSelect.addEventListener("change", (e) => {
      state.splicing.jointType = e.target.value;
      updateSplicingCalculation();
    });
  }

  const btnApplySplicing = document.getElementById("btn-apply-splicing-to-parts");
  if (btnApplySplicing) {
    btnApplySplicing.addEventListener("click", () => {
      if (state.parts.length === 0) {
        alert("Pirmiausia pridėkite elementų arba sugeneruokite stogo karkasą!");
        return;
      }
      const processed = splicingEngine.processParts(state.parts, state.splicing.jointType, state.splicing.maxStandardLengthMm);
      if (processed.hardware.splicedElements.length === 0) {
        alert("Visi elementai yra trumpesni nei 6.0 m. Sudūrimų atlikti nereikia.");
        return;
      }
      state.parts = processed.optimizedParts;
      renderPartsTable();
      updateLiveSummaries();
      updateFoundationCalculation();
      alert(`Sėkmingai pritaikytas inžinerinis sudūrimas ${processed.hardware.splicedElements.length} ilgiems elementams!`);
    });
  }

  /**
   * Load Default Sample Data
   */
  function loadSampleData() {
    state.parts = [
      { id: "p-1", label: "Gegnė šiaurė (4.8m)", profile: "50x200", length: 4800, quantity: 18 },
      { id: "p-2", label: "Gegnė pietūs (4.8m)", profile: "50x200", length: 4800, quantity: 18 },
      { id: "p-3", label: "Styga / Suveržimas (3.2m)", profile: "50x150", length: 3200, quantity: 18 },
      { id: "p-4", label: "Mūrlotas (6.0m)", profile: "100x150", length: 6000, quantity: 4 },
      { id: "p-5", label: "Statramstis pagrindinis (2.65m)", profile: "50x150", length: 2650, quantity: 42 },
      { id: "p-6", label: "Sienos apatinis bėgis (4.0m)", profile: "50x150", length: 4000, quantity: 8 },
      { id: "p-7", label: "Sienos viršutinis bėgis (4.0m)", profile: "50x150", length: 4000, quantity: 16 },
      { id: "p-8", label: "Perdangos sija (4.2m)", profile: "50x220", length: 4200, quantity: 24 }
    ];

    renderPartsTable();
    renderStockLengths();
    updateLiveSummaries();
    updateFoundationCalculation();
  }

  /**
   * 3D CAMERA VIEW ANGLE BUTTONS BINDING
   */
  const cameraViewBtns = document.querySelectorAll(".btn-camera-view");
  cameraViewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      cameraViewBtns.forEach(b => b.classList.remove("bg-brand-500", "text-white"));
      btn.classList.add("bg-brand-500", "text-white");
      const view = btn.getAttribute("data-view");
      if (viewer3d && view) viewer3d.setView(view);
    });
  });

  // 3D Model Mode Switcher Buttons
  const model3dBtns = document.querySelectorAll(".btn-3d-model");
  model3dBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      model3dBtns.forEach(b => {
        b.classList.remove("active", "bg-brand-500", "text-white", "shadow");
        b.classList.add("text-stone-400");
      });
      btn.classList.add("active", "bg-brand-500", "text-white", "shadow");
      btn.classList.remove("text-stone-400");

      const mode = btn.getAttribute("data-3d-model");
      if (viewer3d && mode) {
        viewer3d.currentMode = mode;
        viewer3d.buildModel(state.dimensions3D);
      }
    });
  });

  // 3D Wireframe Toggle
  const btnWireframe = document.getElementById("btn-toggle-wireframe");
  if (btnWireframe) {
    btnWireframe.addEventListener("click", () => {
      if (viewer3d) {
        const isWire = viewer3d.toggleWireframe();
        btnWireframe.classList.toggle("bg-brand-500", isWire);
        btnWireframe.classList.toggle("text-white", isWire);
      }
    });
  }

  // 3D FEA Heatmap Toggle
  const btnToggleFEA = document.getElementById("btn-toggle-fea");
  if (btnToggleFEA) {
    btnToggleFEA.addEventListener("click", () => {
      if (viewer3d) {
        const isFEA = viewer3d.toggleFEAMode();
        btnToggleFEA.classList.toggle("bg-amber-600", isFEA);
        btnToggleFEA.classList.toggle("text-white", isFEA);
        btnToggleFEA.classList.toggle("bg-amber-950/90", !isFEA);
        btnToggleFEA.classList.toggle("text-amber-300", !isFEA);
      }
    });
  }

  // 3D Splicing Joint Toggle
  const btnToggleSplicing = document.getElementById("btn-toggle-splicing");
  if (btnToggleSplicing) {
    btnToggleSplicing.addEventListener("click", () => {
      if (viewer3d) {
        viewer3d.splicingEnabled = !viewer3d.splicingEnabled;
        viewer3d.buildModel();
        btnToggleSplicing.classList.toggle("bg-sky-600", viewer3d.splicingEnabled);
        btnToggleSplicing.classList.toggle("text-white", viewer3d.splicingEnabled);
      }
    });
  }

  // 3D Camera Reset
  const btnResetCam = document.getElementById("btn-reset-3d-cam");
  if (btnResetCam) {
    btnResetCam.addEventListener("click", () => {
      if (viewer3d) viewer3d.resetCamera();
      cameraViewBtns.forEach(b => b.classList.remove("bg-brand-500", "text-white"));
      const isoBtn = document.querySelector('.btn-camera-view[data-view="iso"]');
      if (isoBtn) isoBtn.classList.add("bg-brand-500", "text-white");
    });
  }

  /**
   * Render Stock Lengths
   */
  function renderStockLengths() {
    if (!stockLengthsList) return;
    stockLengthsList.innerHTML = "";
    state.stockLengths.forEach((stock, idx) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-xs";
      row.innerHTML = `
        <div class="flex items-center space-x-2.5">
          <input type="checkbox" id="stock-cb-${idx}" ${stock.enabled ? "checked" : ""} class="rounded bg-stone-800 border-stone-700 text-brand-500">
          <span class="font-mono font-bold text-white text-sm">${(stock.length / 1000).toFixed(2)} m</span>
          <span class="text-stone-400 font-mono">(${stock.length} mm)</span>
        </div>
        <button class="btn-delete-stock text-stone-500 hover:text-rose-400 p-1 transition-colors" data-index="${idx}">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      `;

      row.querySelector(`#stock-cb-${idx}`).addEventListener("change", (e) => {
        state.stockLengths[idx].enabled = e.target.checked;
      });

      row.querySelector(".btn-delete-stock").addEventListener("click", () => {
        state.stockLengths.splice(idx, 1);
        renderStockLengths();
      });

      stockLengthsList.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();
  }

  const btnAddStock = document.getElementById("btn-add-stock-length");
  if (btnAddStock) {
    btnAddStock.addEventListener("click", () => {
      const val = prompt("Įveskite naujo tašo ilgį milimetrais (pvz. 6200 arba 4500):", "6200");
      if (val) {
        const num = parseInt(val);
        if (!isNaN(num) && num > 500 && num <= 20000) {
          state.stockLengths.push({ length: num, enabled: true });
          state.stockLengths.sort((a, b) => b.length - a.length);
          renderStockLengths();
        } else {
          alert("Neteisingas ilgis. Įveskite skaičių nuo 500 iki 20000 mm.");
        }
      }
    });
  }

  /**
   * Render Parts Table
   */
  function renderPartsTable() {
    if (!partsTableBody) return;
    partsTableBody.innerHTML = "";
    state.parts.forEach((p, idx) => {
      const tr = document.createElement("tr");
      tr.className = "hover:bg-stone-900/60 transition-colors";
      tr.innerHTML = `
        <td class="p-2">
          <input type="text" value="${p.label}" class="w-full bg-stone-950/70 border border-stone-800 rounded px-2 py-1 text-white text-xs focus:border-brand-500 focus:outline-none input-part-label" data-idx="${idx}">
        </td>
        <td class="p-2">
          <input type="text" value="${p.profile}" class="w-24 bg-stone-950/70 border border-stone-800 rounded px-2 py-1 text-brand-400 font-mono text-xs focus:border-brand-500 focus:outline-none input-part-profile" data-idx="${idx}">
        </td>
        <td class="p-2">
          <input type="number" value="${p.length}" step="10" min="50" class="w-24 bg-stone-950/70 border border-stone-800 rounded px-2 py-1 text-white font-mono text-xs focus:border-brand-500 focus:outline-none input-part-length" data-idx="${idx}">
        </td>
        <td class="p-2">
          <input type="number" value="${p.quantity}" min="1" class="w-16 bg-stone-950/70 border border-stone-800 rounded px-2 py-1 text-white font-mono text-xs focus:border-brand-500 focus:outline-none input-part-qty" data-idx="${idx}">
        </td>
        <td class="p-2 text-center">
          <button class="btn-delete-part text-stone-500 hover:text-rose-400 p-1 transition-colors" data-idx="${idx}">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      `;

      tr.querySelector(".input-part-label").addEventListener("change", (e) => {
        state.parts[idx].label = e.target.value;
      });
      tr.querySelector(".input-part-profile").addEventListener("change", (e) => {
        state.parts[idx].profile = e.target.value.trim();
        updateLiveSummaries();
        updateFoundationCalculation();
      });
      tr.querySelector(".input-part-length").addEventListener("change", (e) => {
        state.parts[idx].length = parseInt(e.target.value) || 0;
        updateLiveSummaries();
        updateFoundationCalculation();
      });
      tr.querySelector(".input-part-qty").addEventListener("change", (e) => {
        state.parts[idx].quantity = parseInt(e.target.value) || 1;
        updateLiveSummaries();
        updateFoundationCalculation();
      });
      tr.querySelector(".btn-delete-part").addEventListener("click", () => {
        state.parts.splice(idx, 1);
        renderPartsTable();
        updateLiveSummaries();
        updateFoundationCalculation();
      });

      partsTableBody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  }

  function updateLiveSummaries() {
    let totalQty = 0;
    let netVolM3 = 0;

    state.parts.forEach(p => {
      const q = parseInt(p.quantity) || 0;
      const lenMm = parseInt(p.length) || 0;
      const prof = TimberOptimizer.parseProfile(p.profile);
      totalQty += q;
      netVolM3 += (lenMm / 1000) * q * prof.areaM2;
    });

    if (summaryTotalParts) summaryTotalParts.textContent = totalQty;
    if (summaryNetVolume) summaryNetVolume.textContent = netVolM3.toFixed(3);
  }

  const btnAddPart = document.getElementById("btn-add-part");
  if (btnAddPart) {
    btnAddPart.addEventListener("click", () => {
      state.parts.push({
        id: `p-${Date.now()}`,
        label: `Nauja detalė #${state.parts.length + 1}`,
        profile: "50x150",
        length: 3000,
        quantity: 1
      });
      renderPartsTable();
      updateLiveSummaries();
      updateFoundationCalculation();
    });
  }

  const btnClearParts = document.getElementById("btn-clear-parts");
  if (btnClearParts) {
    btnClearParts.addEventListener("click", () => {
      if (state.parts.length > 0 && confirm("Ar tikrai norite išvalyti visų detalių sąrašą?")) {
        state.parts = [];
        renderPartsTable();
        updateLiveSummaries();
        updateFoundationCalculation();
      }
    });
  }

  const presetTabs = document.querySelectorAll(".preset-tab-btn");
  presetTabs.forEach(btn => {
    btn.addEventListener("click", () => {
      presetTabs.forEach(b => {
        b.classList.remove("active", "bg-brand-500", "text-white", "shadow");
        b.classList.add("text-stone-400");
      });
      btn.classList.add("active", "bg-brand-500", "text-white", "shadow");
      btn.classList.remove("text-stone-400");

      const target = btn.getAttribute("data-preset-tab");
      document.querySelectorAll(".preset-pane").forEach(pane => pane.classList.add("hidden"));
      const activePane = document.getElementById(`preset-content-${target}`);
      if (activePane) activePane.classList.remove("hidden");
    });
  });

  /**
   * PRESET GENERATORS ACTIONS
   */
  // 1. Roof
  const btnApplyRoof = document.getElementById("btn-apply-roof");
  if (btnApplyRoof) {
    btnApplyRoof.addEventListener("click", () => {
      const span = parseFloat(document.getElementById("roof-span").value) || 8.0;
      const pitch = parseFloat(document.getElementById("roof-pitch").value) || 30;
      const overhang = parseFloat(document.getElementById("roof-overhang").value) || 0.6;
      const length = parseFloat(document.getElementById("roof-length").value) || 12.0;
      const step = parseFloat(document.getElementById("roof-step").value) || 0.6;

      const generated = HousePresets.generateRoof({
        spanM: span,
        pitchDeg: pitch,
        overhangM: overhang,
        lengthM: length,
        stepM: step,
        profile: document.getElementById("roof-profile").value,
        includeTies: document.getElementById("roof-include-ties").checked,
        includeMurlot: document.getElementById("roof-include-murlot").checked
      });
      state.parts.push(...generated);
      renderPartsTable();
      updateLiveSummaries();

      state.dimensions3D.spanM = span;
      state.dimensions3D.pitchDeg = pitch;
      state.dimensions3D.overhangM = overhang;
      state.dimensions3D.lengthM = length;
      state.dimensions3D.stepM = step;
      state.dimensions3D.roofSpanM = span;
      state.dimensions3D.roofPitchDeg = pitch;
      state.dimensions3D.roofOverhangM = overhang;
      state.dimensions3D.roofLengthM = length;
      state.dimensions3D.rafterPairs = Math.ceil(length / step) + 1;

      updateFoundationCalculation();
      alert(`Stogo elementai įkelti! Polių skaičius, FEA įtempimų modelis ir 3D karkasas atnaujinti.`);
    });
  }

  // 2. Wall
  const btnApplyWall = document.getElementById("btn-apply-wall");
  if (btnApplyWall) {
    btnApplyWall.addEventListener("click", () => {
      const totalLen = parseFloat(document.getElementById("wall-total-len").value) || 40.0;
      const height = parseFloat(document.getElementById("wall-height").value) || 2.8;
      const step = parseFloat(document.getElementById("wall-step").value) || 0.6;

      const generated = HousePresets.generateWall({
        totalLenM: totalLen,
        heightM: height,
        stepM: step,
        profile: document.getElementById("wall-profile").value,
        doubleTopPlate: document.getElementById("wall-double-top-plate").checked
      });
      state.parts.push(...generated);
      renderPartsTable();
      updateLiveSummaries();

      state.dimensions3D.wallHeightM = height;
      state.dimensions3D.wallTotalLenM = totalLen;
      state.dimensions3D.studsCount = Math.round(Math.ceil(totalLen / step) * 1.15) + 4;

      updateFoundationCalculation();
      alert(`Sienų karkaso elementai įkelti!`);
    });
  }

  // 3. Floor
  const btnApplyFloor = document.getElementById("btn-apply-floor");
  if (btnApplyFloor) {
    btnApplyFloor.addEventListener("click", () => {
      const span = parseFloat(document.getElementById("floor-span").value) || 4.5;
      const width = parseFloat(document.getElementById("floor-width").value) || 10.0;

      const generated = HousePresets.generateFloor({
        spanM: span,
        widthM: width,
        stepM: 0.4,
        profile: "50x220"
      });
      state.parts.push(...generated);
      renderPartsTable();
      updateLiveSummaries();

      state.dimensions3D.floorSpanM = span;
      state.dimensions3D.floorWidthM = width;

      updateFoundationCalculation();
      alert(`Perdangos elementai įkelti!`);
    });
  }

  // 4. Deck
  const btnApplyDeck = document.getElementById("btn-apply-deck");
  if (btnApplyDeck) {
    btnApplyDeck.addEventListener("click", () => {
      const generated = HousePresets.generateDeck({
        lenM: parseFloat(document.getElementById("deck-len").value) || 6.0,
        widthM: parseFloat(document.getElementById("deck-width").value) || 4.0,
        stepM: 0.4,
        profile: "50x100"
      });
      state.parts.push(...generated);
      renderPartsTable();
      updateLiveSummaries();
      updateFoundationCalculation();
      alert(`Terasos karkaso elementai įkelti!`);
    });
  }

  /**
   * RUN OPTIMIZATION ACTION
   */
  const btnRunOpt = document.getElementById("btn-run-optimization");
  if (btnRunOpt) {
    btnRunOpt.addEventListener("click", () => {
      if (state.parts.length === 0) {
        alert("Prašome pridėti bent vieną detalę arba pasirinkti konstrukcinį šabloną!");
        return;
      }

      const optimizer = new TimberOptimizer({
        kerf: 4,
        trim: 15,
        pricePerM3: 280,
        density: 460,
        algorithm: "exact"
      });

      try {
        const results = optimizer.optimize(state.parts, state.stockLengths);
        state.lastResults = results;
        if (visualizer) {
          visualizer.render(results);
        }

        const resultsSec = document.getElementById("results-section");
        if (resultsSec) {
          resultsSec.scrollIntoView({ behavior: "smooth" });
        }
      } catch (err) {
        alert(`Klaida skaičiuojant: ${err.message}`);
      }
    });
  }

  /**
   * EXPORT ACTIONS (BIM IFC 4.0, CNC BTLx, CSV & Print)
   */
  const handleExportIFC = () => {
    if (state.parts.length === 0) {
      alert("Pirmiausia sugeneruokite arba pridėkite medienos elementus!");
      return;
    }
    BimCncExporter.exportToIFC(state);
  };

  const handleExportBTLx = () => {
    if (state.parts.length === 0) {
      alert("Pirmiausia sugeneruokite arba pridėkite medienos elementus!");
      return;
    }
    BimCncExporter.exportToBTLx(state.parts);
  };

  const btnExportIFCTop = document.getElementById("btn-export-ifc-top");
  if (btnExportIFCTop) btnExportIFCTop.addEventListener("click", handleExportIFC);

  const btnExportBTLxTop = document.getElementById("btn-export-btlx-top");
  if (btnExportBTLxTop) btnExportBTLxTop.addEventListener("click", handleExportBTLx);

  const btnExportIFC = document.getElementById("btn-export-ifc");
  if (btnExportIFC) btnExportIFC.addEventListener("click", handleExportIFC);

  const btnExportBTLx = document.getElementById("btn-export-btlx");
  if (btnExportBTLx) btnExportBTLx.addEventListener("click", handleExportBTLx);

  const btnExportCSV = document.getElementById("btn-export-csv");
  if (btnExportCSV) {
    btnExportCSV.addEventListener("click", () => {
      if (!state.lastResults) {
        alert("Pirmiausia paleiskite optimizavimą paspausdami 'Apskaičiuoti optimalų pjovimą'!");
        return;
      }
      Exporter.exportToCSV(state.lastResults, state.parts);
    });
  }

  const btnSaveProj = document.getElementById("btn-save-project");
  if (btnSaveProj) {
    btnSaveProj.addEventListener("click", () => {
      const proj = {
        version: "4.0",
        date: new Date().toISOString(),
        parts: state.parts,
        stockLengths: state.stockLengths,
        foundation: state.foundation,
        fea: state.fea,
        energy: state.energy,
        splicing: state.splicing,
        dimensions3D: state.dimensions3D
      };
      Exporter.saveProject(proj);
    });
  }

  const inputLoadProj = document.getElementById("input-load-project");
  if (inputLoadProj) {
    inputLoadProj.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const loaded = JSON.parse(ev.target.result);
          if (loaded.parts) state.parts = loaded.parts;
          if (loaded.stockLengths) state.stockLengths = loaded.stockLengths;
          if (loaded.foundation) state.foundation = loaded.foundation;
          if (loaded.fea) state.fea = loaded.fea;
          if (loaded.energy) state.energy = loaded.energy;
          if (loaded.splicing) state.splicing = loaded.splicing;
          if (loaded.dimensions3D) state.dimensions3D = loaded.dimensions3D;
          renderPartsTable();
          renderStockLengths();
          updateLiveSummaries();
          updateFoundationCalculation();
          alert("Projektas sėkmingai įkeltas su visais inžineriniais FEA ir A++ duomenimis!");
        } catch (err) {
          alert("Klaida skaitant JSON failą: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }

  const btnPrint = document.getElementById("btn-print");
  if (btnPrint) {
    btnPrint.addEventListener("click", () => {
      if (!state.lastResults && btnRunOpt) {
        btnRunOpt.click();
      }
      setTimeout(() => {
        window.print();
      }, 400);
    });
  }

  // Full House Master Wizard Button Listener
  const btnGenFullHouse = document.getElementById("btn-generate-full-house");
  if (btnGenFullHouse) {
    btnGenFullHouse.addEventListener("click", () => {
      runFullHouseGeneration();
      const cont = document.getElementById("full-house-results-container");
      if (cont) cont.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Initialize with Full House Master Generation
  renderStockLengths();
  runFullHouseGeneration();
});

