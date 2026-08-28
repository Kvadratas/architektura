/**
 * ARCHITEKTŪRA - Visualizer Engine for Interactive Timber Cutting Maps
 */

class TimberVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.colors = [
      "cut-color-0", "cut-color-1", "cut-color-2", "cut-color-3",
      "cut-color-4", "cut-color-5", "cut-color-6", "cut-color-7"
    ];
  }

  /**
   * Main render method for optimization results
   */
  render(results) {
    if (!this.container) return;
    this.container.innerHTML = "";

    // 1. Update KPI Dashboard Cards
    this.updateKPIs(results.summary);

    // 2. Render Purchase Order Specification Table
    this.renderPurchaseOrderTable(results.profiles, results.params);

    // 3. Render Visual Timber Cutting Maps grouped by Profile
    const profileEntries = Object.entries(results.profiles);
    if (profileEntries.length === 0) {
      this.container.innerHTML = `
        <div class="p-8 text-center text-stone-500 border border-dashed border-stone-800 rounded-2xl">
          Nėra rezultatų atvaizdavimui.
        </div>
      `;
      return;
    }

    profileEntries.forEach(([profileKey, profData], profIndex) => {
      const profileSection = this.createProfileSection(profileKey, profData, profIndex);
      this.container.appendChild(profileSection);
    });

    // Re-initialize any dynamic Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
  }

  /**
   * Update KPI Cards
   */
  updateKPIs(summary) {
    document.getElementById("kpi-total-boards").innerHTML = `${summary.totalBoards} <span class="text-xs font-normal text-stone-400">vnt.</span>`;
    document.getElementById("kpi-total-m3").innerHTML = `${summary.totalVolumeM3.toFixed(3)} <span class="text-xs font-normal text-stone-400">m³</span>`;
    document.getElementById("kpi-waste-percent").textContent = `${summary.wastePercent.toFixed(1)}%`;
    document.getElementById("kpi-waste-m3").textContent = `${summary.wasteVolumeM3.toFixed(3)} m³ atraižų (${summary.wastePercent < 5 ? "Ypatingai mažas" : "Optimalus"})`;
    document.getElementById("kpi-total-length").innerHTML = `${summary.totalStockLengthM.toFixed(1)} <span class="text-xs font-normal text-stone-400">m</span>`;
    document.getElementById("kpi-total-weight").innerHTML = `${Math.round(summary.totalWeightKg)} <span class="text-xs font-normal text-stone-400">kg</span>`;
    document.getElementById("kpi-total-price").innerHTML = `${summary.totalCostEur.toFixed(2)} <span class="text-xs font-normal text-stone-400">€</span>`;

    // Make results section visible
    const resultsSection = document.getElementById("results-section");
    if (resultsSection) {
      resultsSection.classList.remove("hidden");
    }
  }

  /**
   * Render Purchase Order Table for lumber mills
   */
  renderPurchaseOrderTable(profiles, params) {
    const tbody = document.getElementById("purchase-order-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    Object.entries(profiles).forEach(([profKey, prof]) => {
      Object.entries(prof.purchaseCounts).forEach(([stockLenMm, count]) => {
        if (count <= 0) return;
        const lenM = Number(stockLenMm) / 1000;
        const totalRunningM = lenM * count;
        const volM3 = totalRunningM * prof.profile.areaM2;
        const weightKg = volM3 * params.density;
        const costEur = volM3 * params.pricePerM3;

        const tr = document.createElement("tr");
        tr.className = "hover:bg-stone-900/50 transition-colors";
        tr.innerHTML = `
          <td class="p-2.5 font-bold text-brand-400 font-mono">${profKey} mm</td>
          <td class="p-2.5 font-semibold text-white font-mono">${lenM.toFixed(2)} m (${stockLenMm} mm)</td>
          <td class="p-2.5 font-extrabold text-white text-base font-mono">${count} vnt.</td>
          <td class="p-2.5 text-stone-300 font-mono">${totalRunningM.toFixed(1)} m</td>
          <td class="p-2.5 text-stone-300 font-mono">${volM3.toFixed(3)} m³</td>
          <td class="p-2.5 text-stone-300 font-mono">${Math.round(weightKg)} kg</td>
          <td class="p-2.5 font-bold text-emerald-400 text-right font-mono">${costEur.toFixed(2)} €</td>
        `;
        tbody.appendChild(tr);
      });
    });
  }

  /**
   * Create Profile Section with visual boards
   */
  createProfileSection(profileKey, profData, profIndex) {
    const section = document.createElement("div");
    section.className = "space-y-4 pt-4 border-t border-stone-800/80 first:border-t-0 first:pt-0";

    // Profile header
    section.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-3 bg-stone-900/60 p-3.5 rounded-xl border border-stone-800">
        <div class="flex items-center space-x-3">
          <span class="px-3 py-1 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 font-bold font-mono text-sm">
            ${profileKey} mm
          </span>
          <span class="text-xs text-stone-400">
            Iš viso tašų: <b class="text-white font-mono">${profData.totalBoards} vnt.</b> | 
            Tūris: <b class="text-white font-mono">${profData.stockVolumeM3.toFixed(3)} m³</b> | 
            Nuostolis: <b class="${profData.wastePercent < 5 ? "text-emerald-400" : "text-amber-400"} font-mono">${profData.wastePercent.toFixed(1)}%</b> (${profData.wasteVolumeM3.toFixed(3)} m³)
          </span>
        </div>
        <div class="text-xs font-bold text-brand-300 font-mono">
          Sąmata: ${profData.costEur.toFixed(2)} €
        </div>
      </div>
      <div class="space-y-3.5 timber-boards-list"></div>
    `;

    const boardsList = section.querySelector(".timber-boards-list");

    // Render each packed board
    profData.boards.forEach((board, bIdx) => {
      const boardEl = this.createBoardVisualElement(board, bIdx + 1, profileKey);
      boardsList.appendChild(boardEl);
    });

    return section;
  }

  /**
   * Create single board interactive visual element
   */
  createBoardVisualElement(board, boardNumber, profileKey) {
    const container = document.createElement("div");
    container.className = "timber-board-container space-y-2";

    // Board info line
    const infoHeader = document.createElement("div");
    infoHeader.className = "flex flex-wrap items-center justify-between text-xs text-stone-400 mb-1 font-mono";
    infoHeader.innerHTML = `
      <div class="flex items-center space-x-2">
        <span class="font-bold text-white">Ruošinys #${boardNumber}</span>
        <span class="px-2 py-0.5 rounded bg-stone-800 text-stone-300 text-[11px]">Ilgis: ${(board.stockLength / 1000).toFixed(2)} m (${board.stockLength} mm)</span>
        <span class="text-[11px] text-stone-500">Detalių: ${board.items.length} vnt.</span>
      </div>
      <div class="flex items-center space-x-3 text-[11px]">
        <span>Panaudota: <b class="text-stone-200">${(board.totalUsedMm / 1000).toFixed(2)} m</b></span>
        <span>Atraiža: <b class="${board.wasteMm < 200 ? "text-emerald-400" : "text-amber-400"}">${board.wasteMm} mm (${board.wastePercent.toFixed(1)}%)</b></span>
      </div>
    `;
    container.appendChild(infoHeader);

    // Visual Timber Bar
    const timberBar = document.createElement("div");
    timberBar.className = "timber-bar";

    const totalStock = board.stockLength;

    // Render Trim Start (if any)
    if (board.trimStart > 0) {
      const trimStartPct = (board.trimStart / totalStock) * 100;
      const trimEl = document.createElement("div");
      trimEl.className = "h-full bg-red-950/80 border-r border-red-500 text-[9px] text-red-400 flex items-center justify-center font-mono";
      trimEl.style.width = `${Math.max(1, trimStartPct)}%`;
      trimEl.title = `Galo nulyginimas (Trim): ${board.trimStart} mm`;
      timberBar.appendChild(trimEl);
    }

    // Render Cut Pieces
    board.items.forEach((item, itemIdx) => {
      const itemWidthPct = (item.length / totalStock) * 100;
      const colorClass = this.colors[(item.itemIdx || itemIdx) % this.colors.length];

      const seg = document.createElement("div");
      seg.className = `timber-segment ${colorClass}`;
      seg.style.width = `${itemWidthPct}%`;
      seg.innerHTML = `
        <span class="truncate px-1 text-[10px] sm:text-xs leading-none font-bold">${item.length} mm</span>
        <span class="text-[9px] opacity-85 truncate max-w-full font-normal">${item.label}</span>
      `;
      seg.title = `Detalė: ${item.label}\nIlgis: ${item.length} mm\nPozicija: ${item.startPos} - ${item.endPos} mm`;
      timberBar.appendChild(seg);
    });

    // Render Waste (Atraiža / Likutis)
    if (board.wasteMm > 0) {
      const wasteWidthPct = (board.wasteMm / totalStock) * 100;
      const wasteEl = document.createElement("div");
      wasteEl.className = "timber-segment timber-segment-waste";
      wasteEl.style.width = `${wasteWidthPct}%`;
      wasteEl.innerHTML = `
        <span class="text-[10px] font-mono font-semibold truncate">Likutis: ${board.wasteMm} mm</span>
      `;
      wasteEl.title = `Atraiža / Likutis: ${board.wasteMm} mm (${board.wastePercent.toFixed(1)}%)`;
      timberBar.appendChild(wasteEl);
    }

    container.appendChild(timberBar);

    // Cutting Steps Instruction for Carpenter
    const stepsList = document.createElement("div");
    stepsList.className = "text-[11px] text-stone-400 pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono";
    const cutInstructions = board.items.map((it, idx) => `Pjūvis ${idx + 1}: <b>${it.length}mm</b> (${it.label})`).join(" &bull; ");
    stepsList.innerHTML = `<span class="text-stone-500 font-sans">Pjovimo seka:</span> ${cutInstructions}`;
    container.appendChild(stepsList);

    return container;
  }
}

if (typeof window !== "undefined") {
  window.TimberVisualizer = TimberVisualizer;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = TimberVisualizer;
}
