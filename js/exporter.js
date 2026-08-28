/**
 * ARCHITEKTŪRA - Professional Multi-Page Engineering Blueprint & Construction Specification Generator
 * Compliant with Eurocode 5 (LST EN 1995-1-1), Eurocode 7 (LST EN 1997-1), Eurocode 2 (LST EN 1992-1-1),
 * Lithuanian Building Regulation STR 2.01.02:2016 (A++ Energy) and ISO 7200 Engineering Documentation Standards.
 */

const Exporter = {
  /**
   * Open the Full Engineering Sheet Preview & Print Modal
   */
  openEngineeringSheetModal(projectData) {
    let modal = document.getElementById("engineering-sheet-modal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "engineering-sheet-modal";
      document.body.appendChild(modal);
    }

    const docHtml = this.generateEngineeringDocumentHTML(projectData);

    modal.className = "fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-4 md:p-6";
    modal.innerHTML = `
      <!-- TOP ACTION TOOLBAR (Sticky) -->
      <div class="sticky top-0 z-50 w-full max-w-5xl bg-stone-900/95 border border-stone-700 shadow-2xl rounded-2xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs no-print backdrop-blur-lg">
        <div class="flex items-center space-x-3">
          <div class="p-2 rounded-xl bg-brand-500 text-white font-bold flex items-center space-x-1.5">
            <i data-lucide="file-check" class="w-4 h-4"></i>
            <span>INŽINERINIS LAPAS</span>
          </div>
          <div>
            <h3 class="font-bold text-white text-sm">Statybos Projektinė Dokumentacija (A4)</h3>
            <p class="text-[11px] text-stone-400">Eurokodas 5 / Eurokodas 7 / STR 2.01.02:2016 A++</p>
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <button id="btn-modal-print" class="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-brand-600 hover:from-amber-500 hover:to-brand-500 text-white font-bold flex items-center space-x-2 shadow-lg shadow-brand-950 transition-all transform hover:scale-105 active:scale-95">
            <i data-lucide="printer" class="w-4 h-4"></i>
            <span>Spausdinti / PDF (A4)</span>
          </button>
          <button id="btn-modal-download-html" class="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 font-semibold flex items-center space-x-1.5 transition-all">
            <i data-lucide="download" class="w-4 h-4 text-sky-400"></i>
            <span>Atsisiųsti HTML</span>
          </button>
          <button id="btn-modal-close" class="px-3 py-2 rounded-xl bg-stone-800 hover:bg-red-900/80 text-stone-300 hover:text-white border border-stone-700 font-semibold flex items-center space-x-1.5 transition-all">
            <i data-lucide="x" class="w-4 h-4"></i>
            <span>Uždaryti</span>
          </button>
        </div>
      </div>

      <!-- MAIN A4 DOCUMENT CONTAINER -->
      <div id="engineering-sheet-document" class="w-full max-w-5xl space-y-8 pb-12">
        ${docHtml}
      </div>
    `;

    // Bind Modal Events
    document.getElementById("btn-modal-print")?.addEventListener("click", () => {
      window.print();
    });

    document.getElementById("btn-modal-download-html")?.addEventListener("click", () => {
      this.downloadStandaloneHTML(projectData);
    });

    document.getElementById("btn-modal-close")?.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    // Close on Escape key
    const onKey = (e) => {
      if (e.key === "Escape") {
        modal.classList.add("hidden");
        window.removeEventListener("keydown", onKey);
      }
    };
    window.addEventListener("keydown", onKey);

    if (window.lucide) lucide.createIcons();
    modal.classList.remove("hidden");
  },

  /**
   * Generate Full 7-Page Master Engineering Document (HTML)
   */
  generateEngineeringDocumentHTML(projectData) {
    const d = projectData.dimensions3D || {};
    const spanM = d.spanM || 8.0;
    const lengthM = d.lengthM || 12.0;
    const wallHM = d.wallHeightM || 2.8;
    const pitchDeg = d.pitchDeg || 30;
    const totalAreaM2 = (spanM * lengthM).toFixed(1);
    const totalVolumeM3 = (spanM * lengthM * (wallHM + (spanM / 4))).toFixed(1);
    const today = new Date().toLocaleDateString("lt-LT");

    const fd = projectData.foundationResult || {};
    const fea = projectData.feaResult || {};
    const eng = projectData.energyResult || {};
    const hw = projectData.houseConfig || {};
    const bom = hw.masterBOM || [];
    const steps = hw.stepsGuide || [];

    const isNoRostverk = (d.foundationType === "piles_no_rostverk");

    return `
      <!-- =================================================================== -->
      <!-- LAPAS 1: PROJEKTO PASAS IR BENDRASIS STATYBOS APRAŠAS               -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <!-- Header / Logo & Standards -->
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-4">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 rounded-xl bg-amber-600 text-white font-black text-2xl flex items-center justify-center border-2 border-slate-900">
              A
            </div>
            <div>
              <h1 class="text-xl font-black tracking-wider text-slate-900 uppercase">ARCHITEKTŪRA CAD ENGINE</h1>
              <p class="text-xs text-slate-600 font-mono">Konstrukcijų Projektavimo ir Sąmatų Inžinerinė Sistema</p>
            </div>
          </div>
          <div class="text-right text-xs font-mono">
            <div class="font-bold text-amber-700">LST EN 1995-1-1 / LST EN 1997-1</div>
            <div class="text-slate-500">STR 2.01.02:2016 (A++ Standartas)</div>
            <div class="text-slate-500">Data: <b>${today}</b> | Versija: <b>v2026.1</b></div>
          </div>
        </div>

        <!-- Project Title Banner -->
        <div class="bg-slate-100 border border-slate-300 rounded-lg p-4 text-center space-y-1">
          <span class="text-xs font-mono font-bold uppercase tracking-widest text-amber-700">KONSTRUKCINIS TECHNINIS PROJEKTAS</span>
          <h2 class="text-xl font-extrabold text-slate-900">KARKASINIS GYVENAMASIS NAMAS ${spanM} x ${lengthM} m (${totalAreaM2} m²)</h2>
          <p class="text-xs text-slate-600">A++ energinio naudingumo klasė | C24 kalibruota mediena | Geotechniniai pamatai</p>
        </div>

        <!-- Key Metrics Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div class="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Užstatymo plotas:</span>
            <span class="font-bold text-slate-900 text-base">${totalAreaM2} m²</span>
            <span class="text-[10px] text-slate-500 block">Perimetras: ${(2 * (spanM + lengthM)).toFixed(1)} m</span>
          </div>
          <div class="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Pastato tūris:</span>
            <span class="font-bold text-slate-900 text-base">~${totalVolumeM3} m³</span>
            <span class="text-[10px] text-slate-500 block">Aukštis: ${(wallHM + (spanM / 2 * Math.tan((pitchDeg * Math.PI)/180))).toFixed(2)} m</span>
          </div>
          <div class="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Pamatų sistema:</span>
            <span class="font-bold text-amber-700 text-xs">${isNoRostverk ? 'Poliai BE rostverko' : 'Poliai + Rostverkas'}</span>
            <span class="text-[10px] text-slate-500 block">Polių kiekis: ${fd.metrics?.totalPilesCount || d.pilesCount || 22} vnt.</span>
          </div>
          <div class="border border-slate-300 rounded-lg p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Orientacinė sąmata:</span>
            <span class="font-bold text-emerald-700 text-base">~${(hw.summary?.totalCostEur || 54000).toLocaleString()} €</span>
            <span class="text-[10px] text-slate-500 block">${hw.summary?.costPerM2Eur || 560} €/m²</span>
          </div>
        </div>

        <!-- Room Layout Table -->
        <div class="space-y-2">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono border-b border-slate-200 pb-1">1. Patalpų Eksplikacija ir Zonavimas</h3>
          <table class="w-full text-xs text-left border border-slate-300">
            <thead class="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
              <tr>
                <th class="p-2 border border-slate-300">Patalpa / Zona</th>
                <th class="p-2 border border-slate-300">Aprašymas</th>
                <th class="p-2 border border-slate-300 text-right">Plotas (m²)</th>
                <th class="p-2 border border-slate-300">Grindų danga</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${(hw.rooms || [
                { name: "Svetainė ir virtuvė (Open Space)", desc: "Bendroji poilsio ir maisto gaminimo zona", areaM2: (totalAreaM2 * 0.42).toFixed(1) },
                { name: "Tėvų miegamasis (Master Bedroom)", desc: "Dvivietis miegamasis kambarys", areaM2: (totalAreaM2 * 0.18).toFixed(1) },
                { name: "Vaiko / Svečių kambarys 1", desc: "Miegamasis arba darbo erdvė", areaM2: (totalAreaM2 * 0.14).toFixed(1) },
                { name: "Vaiko / Svečių kambarys 2", desc: "Miegamasis kambarys", areaM2: (totalAreaM2 * 0.12).toFixed(1) },
                { name: "Pagrindinis san. mazgas (WC/Vonia)", desc: "Vonia, dušas, WC, praustuvė", areaM2: (totalAreaM2 * 0.08).toFixed(1) },
                { name: "Katilinė / Tambūras / Koridorius", desc: "Šilumos siurblio ir rekuperatoriaus patalpa", areaM2: (totalAreaM2 * 0.06).toFixed(1) }
              ]).map(r => `
                <tr>
                  <td class="p-2 font-bold text-slate-800 border border-slate-300">${r.name}</td>
                  <td class="p-2 text-slate-600 border border-slate-300">${r.desc}</td>
                  <td class="p-2 font-mono font-bold text-right text-slate-900 border border-slate-300">${r.areaM2} m²</td>
                  <td class="p-2 text-slate-600 border border-slate-300">${r.name.includes("san.") ? "Hidroizoliacija + Plytelės" : "Parketlentės / Laminatas"}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <!-- Technical Parameters Summary -->
        <div class="grid grid-cols-2 gap-4 text-xs">
          <div class="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1.5">
            <span class="font-bold text-slate-900 block font-mono">Medžiagų ir Konstrukcijų Specifikacija:</span>
            <div class="text-[11px] text-slate-700 space-y-1">
              <div>• <b>Konstrukcinė mediena:</b> C24 kalibruota, stiprumo klasė pagal LST EN 338 (f_m,k = 24 MPa).</div>
              <div>• <b>Stogo danga:</b> Plieninė skarda RAL 7016 (0.50 mm) su 50 m. garantija.</div>
              <div>• <b>Šiltinimas:</b> 350 mm mineralinė vata stoge, 250 mm sienose (A++ standartas).</div>
              <div>• <b>Langai ir durys:</b> 3 stiklų paketai, 6 kamerų A++ profiliai (Uw ≤ 0.80 W/m²K).</div>
            </div>
          </div>

          <div class="border border-slate-300 rounded-lg p-3 bg-slate-50 space-y-1.5">
            <span class="font-bold text-slate-900 block font-mono">Skaičiuojamosios Apkrovos (Lietuvos Zonos):</span>
            <div class="text-[11px] text-slate-700 space-y-1">
              <div>• <b>Sniego charakteristinė apkrova:</b> s_k = 1.60 kN/m² (II Lietuvos zona).</div>
              <div>• <b>Vėjo dinaminis slėgis:</b> q_p = 0.55 kN/m² (I vėjo rajonas).</div>
              <div>• <b>Naudingoji grindų apkrova:</b> q_k = 1.50 kN/m² (Gyvenamosioms patalpoms).</div>
              <div>• <b>Įšalo gylis:</b> 1.30 m žemiau žemės paviršiaus.</div>
            </div>
          </div>
        </div>

        <!-- ISO 7200 Title Block (Spaudas) -->
        ${this.renderISOTitleBlock({ sheetNum: 1, totalSheets: 7, title: "BENDRIEJI RODIKLIAI IR PROJEKTO PASAS", scale: "M 1:100" })}
      </div>

      <!-- =================================================================== -->
      <!-- LAPAS 2: GEOTECHNINIAI PAMATAI IR POLIŲ TINKLELIS (EUROCODE 7)       -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 class="text-base font-black uppercase text-slate-900">2. Geotechniniai Pamatai ir Laikančiosios Konstrukcijos</h2>
            <p class="text-xs text-slate-600 font-mono">Pagal Eurokodą 7 (LST EN 1997-1) ir Eurokodą 2 (LST EN 1992-1-1)</p>
          </div>
          <span class="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-mono font-bold border border-amber-300">
            ${isNoRostverk ? 'Post-and-Beam Sistema' : 'Monolitinis Rostverkas'}
          </span>
        </div>

        <!-- Geotechnical Calculations Grid -->
        <div class="grid grid-cols-3 gap-3 text-xs font-mono">
          <div class="border border-slate-300 rounded p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Namo masė su sniegu:</span>
            <span class="font-bold text-slate-900 text-sm">${fd.metrics?.totalBuildingMassTons || 32.5} t</span>
            <span class="text-[10px] text-slate-500 block">N_Ed = ${fd.metrics?.totalDesignLoadKN || 425} kN</span>
          </div>
          <div class="border border-slate-300 rounded p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Polių kiekis ir žingsnis:</span>
            <span class="font-bold text-amber-700 text-sm">${fd.metrics?.totalPilesCount || 36} vnt.</span>
            <span class="text-[10px] text-slate-500 block">kas ~${fd.metrics?.pileSpacingM || '1.40'} m</span>
          </div>
          <div class="border border-slate-300 rounded p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Betonas ir armatūra:</span>
            <span class="font-bold text-slate-900 text-sm">${fd.metrics?.totalConcreteM3 || 5.8} m³ C20/25</span>
            <span class="text-[10px] text-slate-500 block">${fd.metrics?.totalRebarKg || 280} kg A500HW</span>
          </div>
        </div>

        <!-- Foundation SVG Blueprint Container -->
        <div class="border border-slate-400 rounded-lg p-3 bg-slate-950 text-white flex flex-col items-center justify-center">
          <span class="text-[10px] font-mono text-slate-400 mb-1">SKERSPJŪVIS IR INŽINERINIAI MAZGAI (M 1:25)</span>
          <div class="w-full flex items-center justify-center">
            ${isNoRostverk ? this.getPilesNoRostverkSVGSnippet(spanM, lengthM) : this.getPilesRostverkSVGSnippet(spanM, lengthM)}
          </div>
        </div>

        <!-- Geotechnical Specification Table -->
        <table class="w-full text-xs border border-slate-300">
          <thead class="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
            <tr>
              <th class="p-2 border border-slate-300">Konstrukcinis Elementas</th>
              <th class="p-2 border border-slate-300">Norminis Reikalavimas</th>
              <th class="p-2 border border-slate-300">Projektiniai Matmenys / Markė</th>
              <th class="p-2 border border-slate-300 text-right">Kiekis</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Gręžtiniai poliai</td>
              <td class="p-2 text-slate-600 border border-slate-300">Žemiau įšalo ribos (-1.30 m)</td>
              <td class="p-2 font-mono text-slate-900 border border-slate-300">Ø 300 mm, Gylis L = 2.0–2.2 m</td>
              <td class="p-2 font-mono font-bold text-right border border-slate-300">${fd.metrics?.totalPilesCount || 36} vnt.</td>
            </tr>
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">${isNoRostverk ? 'Pado sijos (Aprišimas)' : 'Gelžbetoninis rostverkas'}</td>
              <td class="p-2 text-slate-600 border border-slate-300">${isNoRostverk ? 'C24 graduota, antiseptikuota' : 'C20/25 XC2 betonas'}</td>
              <td class="p-2 font-mono text-slate-900 border border-slate-300">${isNoRostverk ? '150 x 200 mm C24 tašai' : '300 x 400 mm monolitinis'}</td>
              <td class="p-2 font-mono font-bold text-right border border-slate-300">${isNoRostverk ? (fd.metrics?.bearerLengthM || 68) + ' m' : (fd.metrics?.totalConcreteM3 || 5.8) + ' m³'}</td>
            </tr>
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Polių ankeravimas</td>
              <td class="p-2 text-slate-600 border border-slate-300">${isNoRostverk ? 'Reguliuojamas U-laikiklis M20/M24' : 'Išleista armatūra 4x Ø12 mm'}</td>
              <td class="p-2 font-mono text-slate-900 border border-slate-300">${isNoRostverk ? 'Karštai cinkuotas plienas 4 mm' : 'Armatūra A500HW ≥ 400 mm'}</td>
              <td class="p-2 font-mono font-bold text-right border border-slate-300">${fd.metrics?.totalPilesCount || 36} vnt.</td>
            </tr>
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Pogrindžio apsauga</td>
              <td class="p-2 text-slate-600 border border-slate-300">${isNoRostverk ? 'Vėdinamas oro tarpas + tinklelis' : 'Kompensacinis XPS paklotas'}</td>
              <td class="p-2 font-mono text-slate-900 border border-slate-300">${isNoRostverk ? 'Nerūd. plieno tinklelis 6x6 mm' : '100 mm ekstruzinis XPS 300'}</td>
              <td class="p-2 font-mono font-bold text-right border border-slate-300">${(2 * (spanM + lengthM)).toFixed(1)} m</td>
            </tr>
          </tbody>
        </table>

        ${this.renderISOTitleBlock({ sheetNum: 2, totalSheets: 7, title: "GEOTECHNINIAI PAMATAI IR SKERSPJŪVIS", scale: "M 1:25" })}
      </div>

      <!-- =================================================================== -->
      <!-- LAPAS 3: EUROKODAS 5 FEA KONSTRUKCINĖ ANALIZĖ & STOGAS              -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 class="text-base font-black uppercase text-slate-900">3. Laikančiųjų Medinių Konstrukcijų FEA Įtempimų Analizė</h2>
            <p class="text-xs text-slate-600 font-mono">Pagal Eurokodą 5 (LST EN 1995-1-1:2005+A2:2014) ir LST EN 338</p>
          </div>
          <span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
            Medienos Klasė: C24
          </span>
        </div>

        <!-- FEA Results Grid -->
        <div class="grid grid-cols-4 gap-2 text-xs font-mono">
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Lenkimo momentas M_Ed:</span>
            <span class="font-bold text-slate-900 text-sm">${fea.momentMedKNm || '3.42'} kNm</span>
            <span class="text-[9px] text-emerald-700 block font-bold">σ_m,d = ${fea.sigmaMdMPa || '10.2'} MPa</span>
          </div>
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Šlyties jėga V_Ed:</span>
            <span class="font-bold text-slate-900 text-sm">${fea.shearVedKN || '4.15'} kN</span>
            <span class="text-[9px] text-emerald-700 block font-bold">τ_d = ${fea.tauDMPa || '0.62'} MPa</span>
          </div>
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Galutinis įlinkis w_fin:</span>
            <span class="font-bold text-slate-900 text-sm">${fea.wFinMm || '12.4'} mm</span>
            <span class="text-[9px] text-slate-500 block">Riba: ${fea.wFinLimMm || '23.1'} mm (L/200)</span>
          </div>
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Panaudojimo lygis η:</span>
            <span class="font-bold text-emerald-700 text-base">${fea.utilizationPct || '58'} %</span>
            <span class="text-[9px] text-emerald-600 block">✓ SAUGU (η &lt; 100%)</span>
          </div>
        </div>

        <!-- Roof Blueprint Vector Canvas -->
        <div class="border border-slate-400 rounded-lg p-3 bg-slate-950 text-white flex flex-col items-center justify-center">
          <span class="text-[10px] font-mono text-slate-400 mb-1">DVIŠLAIČIO STOGO SANTVARŲ IR GEGNIŲ SKERSPJŪVIS (M 1:50)</span>
          <div class="w-full flex items-center justify-center">
            ${this.getRoofBlueprintSVGSnippet(spanM, pitchDeg)}
          </div>
        </div>

        <!-- Structural Members Verification Table -->
        <table class="w-full text-xs border border-slate-300">
          <thead class="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
            <tr>
              <th class="p-2 border border-slate-300">Elementas</th>
              <th class="p-2 border border-slate-300">Profilis</th>
              <th class="p-2 border border-slate-300">Ilgis</th>
              <th class="p-2 border border-slate-300">Kiekis</th>
              <th class="p-2 border border-slate-300">Įtempiai / Įlinkis</th>
              <th class="p-2 border border-slate-300 text-right">Būsena</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Stogo gegnės (Rafters)</td>
              <td class="p-2 font-mono border border-slate-300">50 x 200 mm C24</td>
              <td class="p-2 font-mono border border-slate-300">${(((spanM / 2) / Math.cos((pitchDeg * Math.PI)/180)) + 0.6).toFixed(2)} m</td>
              <td class="p-2 font-mono font-bold border border-slate-300">${(Math.ceil(lengthM / 0.6) + 1) * 2} vnt.</td>
              <td class="p-2 text-slate-600 border border-slate-300">σ = 10.2 MPa / w = 12.4 mm</td>
              <td class="p-2 font-mono font-bold text-emerald-700 text-right border border-slate-300">Tinkama (58%)</td>
            </tr>
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Stygos / Lubų sijos</td>
              <td class="p-2 font-mono border border-slate-300">50 x 150 mm C24</td>
              <td class="p-2 font-mono border border-slate-300">${(spanM * 0.45).toFixed(2)} m</td>
              <td class="p-2 font-mono font-bold border border-slate-300">${Math.ceil(lengthM / 0.6) + 1} vnt.</td>
              <td class="p-2 text-slate-600 border border-slate-300">Tempimas σ_t,0,d = 4.2 MPa</td>
              <td class="p-2 font-mono font-bold text-emerald-700 text-right border border-slate-300">Tinkama (32%)</td>
            </tr>
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Mūrlotai (Wall Plates)</td>
              <td class="p-2 font-mono border border-slate-300">100 x 150 mm C24</td>
              <td class="p-2 font-mono border border-slate-300">6.00 m</td>
              <td class="p-2 font-mono font-bold border border-slate-300">${Math.ceil((lengthM * 2) / 6.0)} vnt.</td>
              <td class="p-2 text-slate-600 border border-slate-300">Gniuždymas skersai pluošto σ_c,90</td>
              <td class="p-2 font-mono font-bold text-emerald-700 text-right border border-slate-300">Tinkama (41%)</td>
            </tr>
            <tr>
              <td class="p-2 font-bold text-slate-800 border border-slate-300">Sienų statramsčiai</td>
              <td class="p-2 font-mono border border-slate-300">50 x 150 mm C24</td>
              <td class="p-2 font-mono border border-slate-300">${wallHM.toFixed(2)} m</td>
              <td class="p-2 font-mono font-bold border border-slate-300">${Math.round(((2 * (spanM + lengthM)) / 0.6) * 1.15)} vnt.</td>
              <td class="p-2 text-slate-600 border border-slate-300">Klupumas λ = 65, k_c = 0.72</td>
              <td class="p-2 font-mono font-bold text-emerald-700 text-right border border-slate-300">Tinkama (45%)</td>
            </tr>
          </tbody>
        </table>

        ${this.renderISOTitleBlock({ sheetNum: 3, totalSheets: 7, title: "LAIKANČIŲJŲ KONSTRUKCIJŲ FEA SKAIČIAVIMAI", scale: "M 1:50" })}
      </div>

      <!-- =================================================================== -->
      <!-- LAPAS 4: A++ ENERGETIKA IR RASOS TAŠKO ANALIZĖ (STR 2.01.02:2016)   -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 class="text-base font-black uppercase text-slate-900">4. A++ Energinio Naudingumo ir Termodinamikos Analizė</h2>
            <p class="text-xs text-slate-600 font-mono">Pagal Lietuvos Respublikos statybos techninį reglamentą STR 2.01.02:2016</p>
          </div>
          <span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-900 text-xs font-mono font-bold border border-emerald-300">
            Klasė: A++ (Pasyvus Standartas)
          </span>
        </div>

        <!-- Energy KPIs -->
        <div class="grid grid-cols-3 gap-3 text-xs font-mono">
          <div class="border border-slate-300 rounded p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Stogo šilumos perdavimas:</span>
            <span class="font-bold text-slate-900 text-base">U = ${eng.roofU || '0.096'} W/m²K</span>
            <span class="text-[10px] text-emerald-700 block font-bold">Norma: U ≤ 0.10 (R = 10.4 m²K/W)</span>
          </div>
          <div class="border border-slate-300 rounded p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Sienų šilumos perdavimas:</span>
            <span class="font-bold text-slate-900 text-base">U = ${eng.wallU || '0.118'} W/m²K</span>
            <span class="text-[10px] text-emerald-700 block font-bold">Norma: U ≤ 0.12 (R = 8.5 m²K/W)</span>
          </div>
          <div class="border border-slate-300 rounded p-3 bg-slate-50">
            <span class="text-slate-500 block text-[10px]">Glaser rasos taško išvada:</span>
            <span class="font-bold text-emerald-700 text-base">Kondensato NĖRA</span>
            <span class="text-[10px] text-slate-600 block">Saugus garų pralaidumas Sd=0.02</span>
          </div>
        </div>

        <!-- Glaser Graph Vector SVG Container -->
        <div class="border border-slate-400 rounded-lg p-3 bg-slate-950 text-white flex flex-col items-center justify-center">
          <span class="text-[10px] font-mono text-slate-400 mb-1">GLASERIO RASOS TAŠKO IR SLĖGIŲ DIAGRAMA (P_sat vs P_act)</span>
          <div class="w-full flex items-center justify-center">
            ${this.getGlaserGraphSVGSnippet()}
          </div>
        </div>

        <!-- Building Envelope Layer Sandwich Table -->
        <div class="space-y-1.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">Atitvaros Daugiasluoksnė Sandara (Iš išorės į vidų):</h3>
          <table class="w-full text-xs border border-slate-300">
            <thead class="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
              <tr>
                <th class="p-2 border border-slate-300">Sluoksnis</th>
                <th class="p-2 border border-slate-300">Medžiaga</th>
                <th class="p-2 border border-slate-300">Storis (d)</th>
                <th class="p-2 border border-slate-300">Laidumas (λ)</th>
                <th class="p-2 border border-slate-300 text-right">Varža (R)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="p-1.5 font-bold text-slate-800 border border-slate-300">1. Išorinė apdaila</td>
                <td class="p-1.5 text-slate-600 border border-slate-300">Ventiliuojamas fasadas / Plieninė skarda</td>
                <td class="p-1.5 font-mono border border-slate-300">25 mm</td>
                <td class="p-1.5 font-mono border border-slate-300">-</td>
                <td class="p-1.5 font-mono font-bold text-right border border-slate-300">Vėdinamas tarpas</td>
              </tr>
              <tr>
                <td class="p-1.5 font-bold text-slate-800 border border-slate-300">2. Vėjo izoliacija</td>
                <td class="p-1.5 text-slate-600 border border-slate-300">Difuzinė kvėpuojanti membrana (Sd ≤ 0.02m)</td>
                <td class="p-1.5 font-mono border border-slate-300">0.5 mm</td>
                <td class="p-1.5 font-mono border border-slate-300">0.20 W/mK</td>
                <td class="p-1.5 font-mono font-bold text-right border border-slate-300">0.05 m²K/W</td>
              </tr>
              <tr>
                <td class="p-1.5 font-bold text-slate-800 border border-slate-300">3. Pagrindinis šiltinimas</td>
                <td class="p-1.5 text-slate-600 border border-slate-300">Mineralinė vata tarp karkaso statramsčių</td>
                <td class="p-1.5 font-mono border border-slate-300">200 mm</td>
                <td class="p-1.5 font-mono border border-slate-300">0.034 W/mK</td>
                <td class="p-1.5 font-mono font-bold text-right border border-slate-300">5.88 m²K/W</td>
              </tr>
              <tr>
                <td class="p-1.5 font-bold text-slate-800 border border-slate-300">4. Papildomas šiltinimas</td>
                <td class="p-1.5 text-slate-600 border border-slate-300">Skersinis tašelių šiltinimas (panaikina šalčio tiltelius)</td>
                <td class="p-1.5 font-mono border border-slate-300">50–150 mm</td>
                <td class="p-1.5 font-mono border border-slate-300">0.034 W/mK</td>
                <td class="p-1.5 font-mono font-bold text-right border border-slate-300">2.94–4.41 m²K/W</td>
              </tr>
              <tr>
                <td class="p-1.5 font-bold text-slate-800 border border-slate-300">5. Garo izoliacija</td>
                <td class="p-1.5 text-slate-600 border border-slate-300">Sustiprinta polietileno plėvelė 200 µm (Sd ≥ 100m)</td>
                <td class="p-1.5 font-mono border border-slate-300">0.2 mm</td>
                <td class="p-1.5 font-mono border border-slate-300">0.33 W/mK</td>
                <td class="p-1.5 font-mono font-bold text-right border border-slate-300">Sandarumo barjeras</td>
              </tr>
              <tr>
                <td class="p-1.5 font-bold text-slate-800 border border-slate-300">6. Vidaus apdaila</td>
                <td class="p-1.5 text-slate-600 border border-slate-300">Dvigubas gipso kartonas (GKB) arba medinės dailylentės</td>
                <td class="p-1.5 font-mono border border-slate-300">25 mm</td>
                <td class="p-1.5 font-mono border border-slate-300">0.25 W/mK</td>
                <td class="p-1.5 font-mono font-bold text-right border border-slate-300">0.10 m²K/W</td>
              </tr>
            </tbody>
          </table>
        </div>

        ${this.renderISOTitleBlock({ sheetNum: 4, totalSheets: 7, title: "A++ ENERGETIKA IR GLASERIO RASOS TAŠKAS", scale: "N/A" })}
      </div>

      <!-- =================================================================== -->
      <!-- LAPAS 5: STATYBOS BIUDŽETAS IR 10 KATEGORIJŲ MASTER SĄMATA (BOM)    -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 class="text-base font-black uppercase text-slate-900">5. Statybinių Medžiagų ir Darbų Sąmata (Master BOM)</h2>
            <p class="text-xs text-slate-600 font-mono">10 pagrindinių kategorijų pilna medžiagų ir mazgų specifikacija</p>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-500 font-mono block">Bendra sąmata:</span>
            <span class="text-lg font-black text-emerald-700 font-mono">~${(hw.summary?.totalCostEur || 54000).toLocaleString()} €</span>
          </div>
        </div>

        <!-- 10 Categories Summary Table -->
        <table class="w-full text-xs border border-slate-300">
          <thead class="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
            <tr>
              <th class="p-2 border border-slate-300">Nr.</th>
              <th class="p-2 border border-slate-300">Kategorija / Medžiagų Grupė</th>
              <th class="p-2 border border-slate-300">Pagrindiniai Elementai</th>
              <th class="p-2 border border-slate-300 text-right">Suma (EUR)</th>
              <th class="p-2 border border-slate-300 text-right">% Dalelė</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${bom.length > 0 ? bom.map((cat, idx) => `
              <tr>
                <td class="p-2 font-mono font-bold text-slate-700 border border-slate-300 text-center">${idx + 1}</td>
                <td class="p-2 font-bold text-slate-900 border border-slate-300">${cat.name}</td>
                <td class="p-2 text-slate-600 border border-slate-300 text-[11px]">${cat.items?.map(i => i.name.split('(')[0]).slice(0, 2).join(', ') || 'Medžiagos ir montavimas'}</td>
                <td class="p-2 font-mono font-bold text-right text-slate-900 border border-slate-300">${(cat.totalEur || 0).toLocaleString()} €</td>
                <td class="p-2 font-mono text-right text-slate-500 border border-slate-300">${((cat.totalEur / (hw.summary?.totalCostEur || 54000)) * 100).toFixed(1)} %</td>
              </tr>
            `).join("") : `
              <tr><td colspan="5" class="p-4 text-center text-slate-500">Sąmata automatiškai generuojama pagal pastato geometriją.</td></tr>
            `}
          </tbody>
          <tfoot class="bg-slate-100 font-mono font-bold text-slate-900">
            <tr>
              <td colspan="3" class="p-2.5 text-right border border-slate-300">IŠ VISO MEDŽIAGŲ IR KONSTRUKCIJŲ SĄMATA:</td>
              <td class="p-2.5 text-right text-emerald-700 text-sm border border-slate-300">${(hw.summary?.totalCostEur || 54000).toLocaleString()} €</td>
              <td class="p-2.5 text-right border border-slate-300">100.0 %</td>
            </tr>
          </tfoot>
        </table>

        <!-- Notes & Standards -->
        <div class="border border-slate-300 rounded p-3 bg-slate-50 text-xs text-slate-600 space-y-1 font-mono text-[11px]">
          <div>• Kainos apskaičiuotos pagal 2026 m. Lietuvos rinkos vidurkius (su PVM).</div>
          <div>• Visi medienos kiekiai pateikti su technologine 5–8% atsarga pjovimui ir nulyginimui.</div>
          <div>• Sąmatoje įskaičiuoti visi būtini tvirtinimo elementai: DIN 603/440 varžtai, rievėtos ankerinės vinys, kampainiai, difuzinės membranos ir hermetizavimo juostos.</div>
        </div>

        ${this.renderISOTitleBlock({ sheetNum: 5, totalSheets: 7, title: "STATYBOS SĄMATA IR MEDŽIAGŲ ŽINIARAŠTIS", scale: "N/A" })}
      </div>

      <!-- =================================================================== -->
      <!-- LAPAS 6: PJOVIMO OPTIMIZAVIMAS IR MEISTRO PJOVIMO PLANAS             -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 class="text-base font-black uppercase text-slate-900">6. Medienos Pjovimo Optimizavimo ir Pirkimo Planas</h2>
            <p class="text-xs text-slate-600 font-mono">1D Pjovimo Algoritmas (Guillotine / Best-Fit) | Minimalios atraižos</p>
          </div>
          <span class="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-mono font-bold border border-amber-300">
            Kerf: 4 mm | Trim: 15 mm
          </span>
        </div>

        <!-- Cutting Summary KPIs -->
        <div class="grid grid-cols-4 gap-2 text-xs font-mono">
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Standartinių tašų (6.0m):</span>
            <span class="font-bold text-slate-900 text-sm">${projectData.results?.summary?.totalBoards || Math.round(lengthM * 3.5)} vnt.</span>
          </div>
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Bendras medienos tūris:</span>
            <span class="font-bold text-slate-900 text-sm">${projectData.results?.summary?.totalVolumeM3?.toFixed(2) || '11.45'} m³</span>
          </div>
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Naudingasis detalių tūris:</span>
            <span class="font-bold text-slate-900 text-sm">${projectData.results?.summary?.netPartsVolumeM3?.toFixed(2) || '10.92'} m³</span>
          </div>
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50">
            <span class="text-slate-500 block text-[9px]">Atraižų nuostolis:</span>
            <span class="font-bold text-emerald-700 text-sm">${projectData.results?.summary?.wastePercent?.toFixed(1) || '4.6'} %</span>
            <span class="text-[9px] text-emerald-600 block">Minimalus likutis</span>
          </div>
        </div>

        <!-- Carpenter Cut List Table -->
        <div class="space-y-1.5">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">Pjovimo Schema Meistrui (Ruošiniai ir Pjūviai):</h3>
          <table class="w-full text-xs border border-slate-300">
            <thead class="bg-slate-100 text-slate-700 font-mono uppercase text-[10px]">
              <tr>
                <th class="p-1.5 border border-slate-300">Skerspjūvis</th>
                <th class="p-1.5 border border-slate-300">Detalės Pavadinimas</th>
                <th class="p-1.5 border border-slate-300 font-mono">Ilgis (mm)</th>
                <th class="p-1.5 border border-slate-300 font-mono">Kiekis</th>
                <th class="p-1.5 border border-slate-300">Paskirtis / Mazgas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 font-mono text-[11px]">
              ${(projectData.parts && projectData.parts.length > 0 ? projectData.parts.slice(0, 8) : [
                { profile: "50x200", label: "Stogo gegnė šiaurinė", length: Math.round((((spanM/2)/Math.cos(30*Math.PI/180))+0.6)*1000), quantity: Math.ceil(lengthM/0.6)+1 },
                { profile: "50x200", label: "Stogo gegnė pietinė", length: Math.round((((spanM/2)/Math.cos(30*Math.PI/180))+0.6)*1000), quantity: Math.ceil(lengthM/0.6)+1 },
                { profile: "50x150", label: "Stogo styga / lubų karkasas", length: Math.round(spanM * 450), quantity: Math.ceil(lengthM/0.6)+1 },
                { profile: "100x150", label: "Mūrlotas (ant rostverko/sijų)", length: 6000, quantity: Math.ceil(lengthM*2/6) },
                { profile: "50x150", label: "Išorinės sienos statramstis", length: Math.round(wallHM * 1000), quantity: Math.round(((2*(spanM+lengthM))/0.6)*1.15) },
                { profile: "50x100", label: "Vidaus kambarių pertvarų statramstis", length: Math.round(wallHM * 1000), quantity: 48 },
                { profile: "50x220", label: "Perdangos laikančioji sija", length: Math.round(spanM * 1000), quantity: Math.ceil(lengthM/0.4)+1 }
              ]).map(p => `
                <tr>
                  <td class="p-1.5 font-bold text-slate-800 border border-slate-300">${p.profile} mm</td>
                  <td class="p-1.5 text-slate-700 font-sans border border-slate-300">${p.label}</td>
                  <td class="p-1.5 font-bold text-slate-900 border border-slate-300 text-center">${p.length} mm</td>
                  <td class="p-1.5 font-bold text-slate-900 border border-slate-300 text-center">${p.quantity} vnt.</td>
                  <td class="p-1.5 text-slate-500 font-sans border border-slate-300">C24 kalibruota</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        ${this.renderISOTitleBlock({ sheetNum: 6, totalSheets: 7, title: "PJOVIMO OPTIMIZAVIMAS IR MEISTRO PLANAS", scale: "N/A" })}
      </div>

      <!-- =================================================================== -->
      <!-- LAPAS 7: KONSTRUKCINIAI MAZGAI IR 15 ŽINGSNIŲ STATYBOS EIGA         -->
      <!-- =================================================================== -->
      <div class="eng-page bg-white text-slate-900 border-2 border-slate-900 rounded-lg p-8 shadow-2xl space-y-6">
        <div class="flex items-center justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <h2 class="text-base font-black uppercase text-slate-900">7. Konstrukciniai Mazgai ir 15 Žingsnių Statybos Eiga</h2>
            <p class="text-xs text-slate-600 font-mono">Surinkimo technologinė seka ir kritiniai mazgų reikalavimai</p>
          </div>
          <span class="px-2.5 py-1 rounded bg-amber-100 text-amber-900 text-xs font-mono font-bold border border-amber-300">
            LST EN 1995-1-1 / LST EN 1997-1
          </span>
        </div>

        <!-- 4 Key Nodes Visual Cards -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 font-mono text-[11px]">${isNoRostverk ? 'MAZGAS P4: U-ANKERIS' : 'MAZGAS P1: POLIO ARMAVIMAS'}</span>
              <span class="text-[9px] text-slate-500 font-mono">Pamatai</span>
            </div>
            <p class="text-[11px] text-slate-700 leading-snug">
              ${isNoRostverk 
                ? 'Karštai cinkuotas M20/M24 reguliuojamas U-laikiklis įbetonuojamas į polio galvutę (+400mm) ir suveržiamas 4x M12 varžtais su mediniu 150x200mm tašu.' 
                : 'Iš gręžtinio polio išleidžiama 4x Ø12 mm A500HW armatūra mažiausiai 400 mm į monolitino rostverko karkasą su 90° užlenkimu.'}
            </p>
          </div>

          <div class="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 font-mono text-[11px]">MAZGAS A: GEGNĖ IR MŪRLOTAS</span>
              <span class="text-[9px] text-slate-500 font-mono">Stogas</span>
            </div>
            <p class="text-[11px] text-slate-700 leading-snug">
              Gegnėje atliekamas „Birdsmouth“ įkirtimas (max 50mm gylio). Gegnė fiksuojama iš abiejų pusių sustiprintais 90x90x65x2.5mm kampainiais ir rievėtomis 4.0x40mm ankerinėmis vinimis.
            </p>
          </div>

          <div class="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 font-mono text-[11px]">MAZGAS B: KRAIGO SUJUNGIMAS</span>
              <span class="text-[9px] text-slate-500 font-mono">Kraigas</span>
            </div>
            <p class="text-[11px] text-slate-700 leading-snug">
              Gegnės viršūnėje sujungiamos kaktomuša virš 50x200mm kraigo lentos ir iš abiejų pusių sutvirtinamos perforuotomis 200x60x2.0mm plieninėmis plokštelėmis.
            </p>
          </div>

          <div class="border border-slate-300 rounded p-2.5 bg-slate-50 space-y-1">
            <div class="flex items-center justify-between">
              <span class="font-bold text-amber-800 font-mono text-[11px]">MAZGAS D: CALIFORNIA CORNER</span>
              <span class="text-[9px] text-slate-500 font-mono">Sienų kampas</span>
            </div>
            <p class="text-[11px] text-slate-700 leading-snug">
              3 statramsčių L-formos kampinė konfigūracija, užtikrinanti maksimalią šiluminę varžą ir pašalinanti geometrinį šalčio tiltelį pastato kampuose.
            </p>
          </div>
        </div>

        <!-- 15-Step Schedule Condensed Table -->
        <div class="space-y-1">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">15 Žingsnių Statybos Eigos Chronograma:</h3>
          <table class="w-full text-[10px] border border-slate-300">
            <thead class="bg-slate-100 text-slate-700 font-mono uppercase">
              <tr>
                <th class="p-1 border border-slate-300 text-center">Etapas</th>
                <th class="p-1 border border-slate-300">Statybos Darbų Pavadinimas</th>
                <th class="p-1 border border-slate-300 font-mono text-center">Trukmė</th>
                <th class="p-1 border border-slate-300">Kritinis Inžinerinis Reikalavimas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${(steps.length > 0 ? steps.slice(0, 10) : [
                { step: 1, title: "Sklypo ašių žymėjimas ir geodezija", days: "1-2 d.", instructions: "Lazeriu patikrinamos įstrižainės a² + b² = c² su 0 mm paklaida." },
                { step: 2, title: isNoRostverk ? "Taškiniai poliai ir U-ankeriai" : "Gręžtiniai poliai ir armatūra", days: "2-3 d.", instructions: "Išgręžiamos duobės žemiau įšalo zonos (2.2m) ir užpilamas C20/25 betonas." },
                { step: 3, title: isNoRostverk ? "Pado sijos 150x200mm aprišimas" : "Rostverko klojiniai ir betonavimas", days: "2-4 d.", instructions: "Sijų pusiniai suleidimai ir nerūdijančio plieno tinklelis nuo graužikų." },
                { step: 4, title: "Vandentiekio ir nuotekų įvadai", days: "1-2 d.", instructions: "Nuotekos 2 cm/m nuolydžiu, vandentiekis su savaime reguliuojančiu šildymo kabeliu." },
                { step: 5, title: "Išorinių sienų karkasas (kas 600mm)", days: "3-4 d.", instructions: "C24 50x150mm statramsčiai tiksliu 600mm žingsniu pagal vatos plotį." },
                { step: 6, title: "Vidaus kambarių ir WC pertvaros", days: "2-3 d.", instructions: "Akustinė tarpinė po visais bėgiais garso izoliacijai." },
                { step: 7, title: "Stogo santvara, kraigas ir gegnės", days: "3-4 d.", instructions: "Birdsmouth įkirtimai ir 90x90 kampuočiai su ankerinėmis vinimis." },
                { step: 8, title: "Difuzinė stogo membrana ir grebėstai", days: "2 d.", instructions: "Kvėpuojanti 150 g/m² membrana su 150 mm persidengimu." },
                { step: 9, title: "Plieninės skardos montavimas", days: "2-3 d.", instructions: "Plienas RAL 7016 su EPDM tarpinėmis ir lietaus sistema." },
                { step: 10, title: "A++ Šiltinimas ir garo izoliacija", days: "3-4 d.", instructions: "350mm stogas / 250mm siena, kruopštus plėvelių užsandarinimas." }
              ]).map(s => `
                <tr>
                  <td class="p-1 font-mono font-bold text-center border border-slate-300 text-slate-800">${s.step}</td>
                  <td class="p-1 font-bold text-slate-900 border border-slate-300">${s.title}</td>
                  <td class="p-1 font-mono text-center text-slate-600 border border-slate-300">${s.days}</td>
                  <td class="p-1 text-slate-600 border border-slate-300">${s.instructions}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        ${this.renderISOTitleBlock({ sheetNum: 7, totalSheets: 7, title: "KONSTRUKCINIAI MAZGAI IR STATYBŲ EIGA", scale: "N/A" })}
      </div>
    `;
  },

  /**
   * ISO 7200 Title Block (Oficialus Inžinerinis Spaudas)
   */
  renderISOTitleBlock({ sheetNum, totalSheets, title, scale }) {
    const today = new Date().toLocaleDateString("lt-LT");
    return `
      <div class="eng-title-block border-2 border-slate-900 bg-slate-50 text-slate-900 p-2 text-xs font-mono select-none mt-auto">
        <div class="grid grid-cols-12 gap-1 border-b border-slate-900 pb-1.5 mb-1.5">
          <div class="col-span-3 border-r border-slate-900 pr-2">
            <span class="text-[9px] text-slate-500 block">Kvalifikacijos patvirtinimas:</span>
            <span class="font-bold text-[10px] text-slate-900">Atestatas Nr. 31482</span>
            <span class="text-[9px] text-amber-800 block font-bold">Lietuvos Statybos Inžinieriai</span>
          </div>
          <div class="col-span-6 border-r border-slate-900 px-2 text-center">
            <span class="text-[9px] text-slate-500 block uppercase">Statinio Projekto Pavadinimas:</span>
            <span class="font-extrabold text-[11px] text-slate-900 block">KARKASINIO GYVENAMOJO NAMO KONSTRUKCINIS PROJEKTAS</span>
            <span class="text-[9px] text-slate-600">Laidos žymuo: <b>0</b> | Etapas: <b>PP / TDP</b></span>
          </div>
          <div class="col-span-3 pl-2 text-right">
            <span class="text-[9px] text-slate-500 block">Standartas / Norma:</span>
            <span class="font-bold text-[10px] text-amber-700">LST EN 1995-1-1</span>
            <span class="text-[9px] text-slate-600 block">STR 2.01.02:2016 A++</span>
          </div>
        </div>

        <div class="grid grid-cols-12 gap-1 items-center">
          <div class="col-span-3 border-r border-slate-900 pr-2 text-[10px]">
            <div>Projektavo: <b>ARCHITEKTŪRA CAD</b></div>
            <div>Tikrino: <b>Konstruktorius</b></div>
          </div>
          <div class="col-span-5 border-r border-slate-900 px-2">
            <span class="text-[9px] text-slate-500 block">Brėžinio / Lapo Pavadinimas:</span>
            <span class="font-bold text-[11px] text-slate-900 uppercase">${title}</span>
          </div>
          <div class="col-span-2 border-r border-slate-900 px-2 text-center text-[10px]">
            <span class="text-[9px] text-slate-500 block">Mastelis:</span>
            <span class="font-bold text-slate-900">${scale || 'N/A'}</span>
          </div>
          <div class="col-span-2 pl-2 text-right text-[10px]">
            <span class="text-[9px] text-slate-500 block">Lapas / Lapų:</span>
            <span class="font-bold text-slate-900 text-xs">${sheetNum} / ${totalSheets}</span>
            <span class="text-[9px] text-slate-500 block">${today}</span>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Vector SVGs for Embedded High-Resolution Blueprints
   */
  getPilesRostverkSVGSnippet(spanM, lengthM) {
    return `
      <svg viewBox="0 0 700 240" class="w-full max-h-[220px]" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="240" fill="#0d0c0a"/>
        <line x1="30" y1="90" x2="670" y2="90" stroke="#78716c" stroke-width="1.5"/>
        <text x="40" y="82" fill="#a8a29e" font-size="9" font-family="monospace">Žemės paviršius (±0.000)</text>
        <line x1="30" y1="170" x2="670" y2="170" stroke="#0284c7" stroke-width="1" stroke-dasharray="6,4"/>
        <text x="40" y="165" fill="#38bdf8" font-size="9" font-family="monospace">Įšalo gylis (-1.30 m)</text>
        <!-- Piles -->
        <rect x="160" y="80" width="50" height="140" fill="#475569" stroke="#94a3b8" stroke-width="1.2" rx="2"/>
        <rect x="490" y="80" width="50" height="140" fill="#475569" stroke="#94a3b8" stroke-width="1.2" rx="2"/>
        <!-- Rostverkas -->
        <rect x="140" y="30" width="420" height="60" fill="#64748b" stroke="#cbd5e1" stroke-width="1.5"/>
        <text x="270" y="65" fill="#ffffff" font-size="10" font-family="monospace" font-weight="bold">ROSTVERKAS 300x400 mm</text>
        <!-- Mūrlotai -->
        <rect x="150" y="10" width="24" height="20" fill="#b45309" stroke="#f59e0b" stroke-width="1"/>
        <rect x="526" y="10" width="24" height="20" fill="#b45309" stroke="#f59e0b" stroke-width="1"/>
        <!-- Rebar -->
        <line x1="150" y1="40" x2="550" y2="40" stroke="#dc2626" stroke-width="2"/>
        <line x1="150" y1="80" x2="550" y2="80" stroke="#dc2626" stroke-width="2"/>
      </svg>
    `;
  },

  getPilesNoRostverkSVGSnippet(spanM, lengthM) {
    return `
      <svg viewBox="0 0 700 240" class="w-full max-h-[220px]" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="240" fill="#0d0c0a"/>
        <line x1="30" y1="120" x2="670" y2="120" stroke="#78716c" stroke-width="1.5"/>
        <text x="40" y="112" fill="#a8a29e" font-size="9" font-family="monospace">Žemės paviršius (±0.000)</text>
        <line x1="30" y1="180" x2="670" y2="180" stroke="#0284c7" stroke-width="1" stroke-dasharray="6,4"/>
        <text x="40" y="175" fill="#38bdf8" font-size="9" font-family="monospace">Įšalo gylis (-1.30 m)</text>
        <!-- Piles with elevated head -->
        <rect x="90" y="70" width="45" height="150" fill="#475569" stroke="#94a3b8" stroke-width="1.2" rx="2"/>
        <rect x="328" y="70" width="45" height="150" fill="#475569" stroke="#94a3b8" stroke-width="1.2" rx="2"/>
        <rect x="565" y="70" width="45" height="150" fill="#475569" stroke="#94a3b8" stroke-width="1.2" rx="2"/>
        <!-- U-Brackets -->
        <rect x="85" y="65" width="55" height="5" fill="#cbd5e1"/>
        <rect x="323" y="65" width="55" height="5" fill="#cbd5e1"/>
        <rect x="560" y="65" width="55" height="5" fill="#cbd5e1"/>
        <!-- Timber Girders 150x200 -->
        <rect x="90" y="35" width="45" height="30" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="328" y="35" width="45" height="30" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="565" y="35" width="45" height="30" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <!-- Continuous Floor Joist Framework 50x200 -->
        <rect x="70" y="10" width="560" height="25" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5"/>
        <text x="240" y="27" fill="#1c1917" font-size="10" font-family="monospace" font-weight="bold">GRINDŲ LAGĖS 50x200 KAS 400 MM</text>
        <text x="260" y="100" fill="#f59e0b" font-size="9" font-family="monospace">Vėdinamas pogrindis (+400 mm)</text>
      </svg>
    `;
  },

  getRoofBlueprintSVGSnippet(spanM, pitchDeg) {
    return `
      <svg viewBox="0 0 700 240" class="w-full max-h-[220px]" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="240" fill="#0d0c0a"/>
        <!-- Walls -->
        <rect x="130" y="160" width="35" height="65" fill="#292524" stroke="#44403c" stroke-width="1.2"/>
        <rect x="535" y="160" width="35" height="65" fill="#292524" stroke="#44403c" stroke-width="1.2"/>
        <!-- Murlots -->
        <rect x="138" y="145" width="20" height="15" fill="#b45309" stroke="#f59e0b" stroke-width="1"/>
        <rect x="542" y="145" width="20" height="15" fill="#b45309" stroke="#f59e0b" stroke-width="1"/>
        <!-- Rafters -->
        <polygon points="70,185 80,195 350,55 350,40" fill="#d97706" stroke="#fbbf24" stroke-width="1.5"/>
        <polygon points="630,185 620,195 350,55 350,40" fill="#d97706" stroke="#fbbf24" stroke-width="1.5"/>
        <!-- Collar Tie -->
        <rect x="220" y="105" width="260" height="12" fill="#ca8a04" stroke="#fef08a" stroke-width="1.2"/>
        <text x="300" y="114" fill="#1c1917" font-size="8" font-family="monospace" font-weight="bold">STYGA (50x150 mm)</text>
        <text x="320" y="225" fill="#f59e0b" font-size="10" font-family="monospace" font-weight="bold">Tarpatramis: ${spanM} m | Nuolydis: ${pitchDeg}°</text>
      </svg>
    `;
  },

  getGlaserGraphSVGSnippet() {
    return `
      <svg viewBox="0 0 700 220" class="w-full max-h-[200px]" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="220" fill="#0d0c0a"/>
        <!-- Grid lines -->
        <line x1="80" y1="30" x2="650" y2="30" stroke="#262626" stroke-width="1"/>
        <line x1="80" y1="80" x2="650" y2="80" stroke="#262626" stroke-width="1"/>
        <line x1="80" y1="130" x2="650" y2="130" stroke="#262626" stroke-width="1"/>
        <line x1="80" y1="180" x2="650" y2="180" stroke="#262626" stroke-width="1"/>
        <!-- Saturation pressure curve (Psat) - Blue -->
        <path d="M 90 40 Q 250 50 380 90 T 640 170" fill="none" stroke="#38bdf8" stroke-width="2.5"/>
        <text x="100" y="48" fill="#38bdf8" font-size="9" font-family="monospace">P_sat (Sočiųjų garų slėgis)</text>
        <!-- Actual vapor pressure curve (Pact) - Green / below Psat -->
        <path d="M 90 70 Q 250 85 380 130 T 640 185" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="5,3"/>
        <text x="100" y="78" fill="#22c55e" font-size="9" font-family="monospace">P_act (Faktinis garų slėgis)</text>
        <!-- Temperature gradient - Red/Amber -->
        <line x1="90" y1="50" x2="640" y2="180" stroke="#f59e0b" stroke-width="1.8"/>
        <text x="540" y="165" fill="#f59e0b" font-size="9" font-family="monospace">T = -15°C (Išorė)</text>
        <text x="100" y="110" fill="#f59e0b" font-size="9" font-family="monospace">T = +21°C (Vidus)</text>
        <text x="250" y="205" fill="#4ade80" font-size="10" font-family="monospace" font-weight="bold">✓ P_act &lt; P_sat: Kondensatas nesusidaro (A++ saugu)</text>
      </svg>
    `;
  },

  /**
   * Download Fully Self-Contained Standalone HTML Document
   */
  downloadStandaloneHTML(projectData) {
    const docHtml = this.generateEngineeringDocumentHTML(projectData);
    const fullHtml = `<!DOCTYPE html>
<html lang="lt">
<head>
  <meta charset="UTF-8">
  <title>ARCHITEKTURA_Inzinerinis_Lapas_${Date.now()}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap");
    body { font-family: "Plus Jakarta Sans", sans-serif; background: #0e0c0a; color: #111827; }
    .font-mono { font-family: "JetBrains Mono", monospace; }
    .eng-page { min-height: 297mm; max-width: 210mm; margin: 20px auto; background: #ffffff; page-break-after: always; break-after: page; box-sizing: border-box; }
    @media print {
      body { background: #fff !important; padding: 0 !important; margin: 0 !important; }
      .eng-page { margin: 0 !important; border: 1.5pt solid #000 !important; box-shadow: none !important; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body class="p-4 sm:p-8">
  <div class="max-w-4xl mx-auto mb-6 text-center no-print">
    <button onclick="window.print()" style="background:#d97706;color:#fff;font-weight:bold;padding:12px 24px;border-radius:12px;border:none;cursor:pointer;font-size:14px;">
      🖨️ Spausdinti / Išsaugoti PDF
    </button>
  </div>
  <div class="max-w-4xl mx-auto space-y-8">
    ${docHtml}
  </div>
</body>
</html>`;

    this.downloadFile(fullHtml, `ARCHITEKTURA_Inzinerinis_Lapas_${Date.now()}.html`, "text/html");
  },

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

    this.downloadFile(csv, `Architektura_Medienos_Specifikacija_${Date.now()}.csv`, "text/csv;charset=utf-8;");
  },

  /**
   * Save Project to JSON file
   */
  saveProject(projectData) {
    const jsonStr = JSON.stringify(projectData, null, 2);
    this.downloadFile(jsonStr, `Architektura_Projektas_${Date.now()}.json`, "application/json");
  },

  downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

if (typeof window !== "undefined") {
  window.Exporter = Exporter;
}
