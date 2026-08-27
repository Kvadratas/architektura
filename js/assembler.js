/**
 * ARCHITEKTŪRA - Interactive Construction Blueprint & Fasteners Assembly Engine
 * With Geotechnical Piles, Rostverk & Foundation Nodes.
 */

class ConstructionAssembler {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.currentMode = "foundation"; // foundation, roof, wall, floor
    this.activeNode = "node-pile-armature";
  }

  /**
   * Main render method
   */
  render(projectData) {
    if (!this.container) return;

    this.data = projectData || this.getDefaultData();
    this.container.innerHTML = `
      <div class="space-y-6">
        
        <!-- TOP CONTROLS & SUB-TABS -->
        <div class="flex flex-wrap items-center justify-between gap-3 bg-stone-900/90 p-3.5 rounded-2xl border border-stone-800">
          <div class="flex items-center space-x-2">
            <i data-lucide="compass" class="w-5 h-5 text-brand-400"></i>
            <h3 class="text-sm font-bold uppercase tracking-wider text-white">Konstrukcinis Brėžinys ir Surinkimo Mazgai</h3>
          </div>

          <div class="flex items-center space-x-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
            <button type="button" class="btn-blueprint-tab px-3 py-1.5 rounded-lg font-semibold transition-all ${this.currentMode === 'foundation' ? 'bg-brand-500 text-white shadow' : 'text-stone-400 hover:text-white'}" data-mode="foundation">
              ${this.data && this.data.foundationType === 'piles_no_rostverk' ? 'Poliai & Medinis Padas' : 'Poliai & Rostverkas'}
            </button>
            <button type="button" class="btn-blueprint-tab px-3 py-1.5 rounded-lg font-semibold transition-all ${this.currentMode === 'roof' ? 'bg-brand-500 text-white shadow' : 'text-stone-400 hover:text-white'}" data-mode="roof">
              Stogo Konstrukcija
            </button>
            <button type="button" class="btn-blueprint-tab px-3 py-1.5 rounded-lg font-semibold transition-all ${this.currentMode === 'wall' ? 'bg-brand-500 text-white shadow' : 'text-stone-400 hover:text-white'}" data-mode="wall">
              Sienų Karkasas
            </button>
            <button type="button" class="btn-blueprint-tab px-3 py-1.5 rounded-lg font-semibold transition-all ${this.currentMode === 'floor' ? 'bg-brand-500 text-white shadow' : 'text-stone-400 hover:text-white'}" data-mode="floor">
              Perdanga
            </button>
          </div>
        </div>

        <!-- MAIN BLUEPRINT & NODES SPLIT VIEW -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- 1. TECHNICAL SVG BLUEPRINT CANVAS (7 cols) -->
          <div class="lg:col-span-7 bg-[#12100e] border border-stone-800 rounded-2xl p-4 flex flex-col shadow-2xl relative overflow-hidden">
            <div class="flex items-center justify-between pb-3 border-b border-stone-800/80 mb-3 text-xs">
              <div class="flex items-center space-x-2 text-stone-300">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span class="font-bold tracking-wider font-mono text-[11px] uppercase" id="blueprint-title">
                  ${this.currentMode === 'foundation' ? (this.data && this.data.foundationType === 'piles_no_rostverk' ? 'TAŠKINIŲ POLIŲ IR MEDINIO PADO SKERSPJŪVIS (M 1:25)' : 'GRĘŽTINIŲ POLIŲ IR ROSTVERKO SKERSPJŪVIS (M 1:25)') : 'DVIŠLAIČIO STOGO SKERSPJŪVIS (M 1:50)'}
                </span>
              </div>
              <span class="text-[11px] text-stone-500 font-mono">Paspauskite ant mazgo taško detaliam vaizdui</span>
            </div>

            <!-- SVG Container -->
            <div id="svg-blueprint-canvas" class="w-full flex-1 flex items-center justify-center min-h-[360px] bg-[#0d0c0a] border border-stone-900 rounded-xl p-2 relative overflow-hidden">
              ${this.generateCurrentSVG()}
            </div>

            <div class="flex items-center justify-between text-[11px] text-stone-400 pt-3 mt-2 border-t border-stone-800/80 font-mono">
              <div>Matmenys pateikti mm ir m | Eurokodas 7 (Geotechnika)</div>
              <div class="text-brand-400 font-bold">LST EN 1997-1 / LST EN 1992-1-1</div>
            </div>
          </div>

          <!-- 2. ASSEMBLY NODE CLOSE-UP & INSTRUCTIONS (5 cols) -->
          <div class="lg:col-span-5 flex flex-col space-y-4">
            <div id="node-detail-card" class="bg-[#1a1613] border border-brand-500/40 rounded-2xl p-4 sm:p-5 shadow-xl flex-1 flex flex-col justify-between">
              ${this.generateNodeDetailHTML()}
            </div>
          </div>

        </div>

        <!-- 3. HARDWARE & FASTENERS BILL OF MATERIALS -->
        <div class="bg-[#1a1613] border border-stone-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
            <div class="flex items-center space-x-2.5">
              <i data-lucide="nut" class="w-4 h-4 text-brand-400"></i>
              <h3 class="text-sm font-bold uppercase tracking-wider text-white">Tvirtinimo Detalių ir Pamatų Furnitūros Specifikacija</h3>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold">
              Automatiškai perskaičiuota pagal apkrovas ir geometriją
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-stone-900 text-stone-400 uppercase text-[10px] tracking-wider font-mono">
                <tr>
                  <th class="p-2.5">Mazgas / Paskirtis</th>
                  <th class="p-2.5">Elementas / Medžiaga</th>
                  <th class="p-2.5">Išmatavimai / Markė</th>
                  <th class="p-2.5 font-mono">Kiekis</th>
                  <th class="p-2.5">Norma / Inžinerinis reikalavimas</th>
                  <th class="p-2.5 text-right font-mono">Pakuotės / Pastaba</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-800 text-stone-200" id="fasteners-tbody">
                ${this.generateFastenersRows()}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    this.bindEvents();
    if (window.lucide) lucide.createIcons();
  }

  bindEvents() {
    const modeBtns = this.container.querySelectorAll(".btn-blueprint-tab");
    modeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        this.currentMode = btn.dataset.mode;
        if (this.currentMode === "foundation") {
          this.activeNode = (this.data && this.data.foundationType === "piles_no_rostverk") ? "node-pile-u-bracket" : "node-pile-armature";
        }
        if (this.currentMode === "roof") this.activeNode = "node-murlot";
        if (this.currentMode === "wall") this.activeNode = "node-wall-corner";
        if (this.currentMode === "floor") this.activeNode = "node-joist-hanger";
        this.render(this.data);
      });
    });

    const hotspots = this.container.querySelectorAll(".blueprint-hotspot");
    hotspots.forEach(h => {
      h.addEventListener("click", () => {
        this.activeNode = h.dataset.nodeId;
        const card = document.getElementById("node-detail-card");
        if (card) {
          card.innerHTML = this.generateNodeDetailHTML();
          if (window.lucide) lucide.createIcons();
        }
        this.container.querySelectorAll(".blueprint-hotspot").forEach(el => el.classList.remove("active-hotspot"));
        h.classList.add("active-hotspot");
      });
    });
  }

  getDefaultData() {
    return {
      roofSpanM: 8.0,
      roofPitchDeg: 30,
      roofOverhangM: 0.6,
      roofLengthM: 12.0,
      wallHeightM: 2.8,
      wallTotalLenM: 40.0,
      rafterPairs: 21,
      studsCount: 78,
      pilesCount: 22,
      pileDiameterMm: 300,
      pileDepthM: 2.0
    };
  }

  generateCurrentSVG() {
    if (this.currentMode === "foundation") {
      if (this.data.foundationType === "piles_no_rostverk") {
        return this.generatePilesNoRostverkSVG();
      }
      return this.generateFoundationSVG();
    } else if (this.currentMode === "roof") {
      return this.generateRoofSVG();
    } else if (this.currentMode === "wall") {
      return this.generateWallSVG();
    } else {
      return this.generateFloorSVG();
    }
  }

  /**
   * 1. FOUNDATION / PILES & ROSTVERK SVG
   */
  generateFoundationSVG() {
    const pileDiam = this.data.pileDiameterMm || 300;
    const pileDepth = (this.data.pileDepthM || 2.0) * 1000;

    return `
      <svg viewBox="0 0 700 420" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-fd" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1b17" stroke-width="0.8"/>
          </pattern>
          <pattern id="earth" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 16 L16 0 M0 8 L8 0 M8 16 L16 8" stroke="#292524" stroke-width="1"/>
          </pattern>
          <marker id="arrow-fd" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#c5824c" />
          </marker>
        </defs>

        <rect width="700" height="420" fill="#0d0c0a"/>
        <rect width="700" height="420" fill="url(#grid-fd)"/>

        <!-- Underground Soil Layer -->
        <rect x="50" y="160" width="600" height="230" fill="url(#earth)" opacity="0.6"/>
        <!-- Ground Surface Line (0.000) -->
        <line x1="40" y1="160" x2="660" y2="160" stroke="#78716c" stroke-width="2"/>
        <text x="60" y="152" fill="#a8a29e" font-size="10" font-family="monospace">Žemės paviršius (±0.000)</text>

        <!-- Frost Line (-1.30 m) -->
        <line x1="40" y1="260" x2="660" y2="260" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="6,4"/>
        <text x="60" y="255" fill="#38bdf8" font-size="10" font-family="monospace">Įšalo gylio riba (-1.30 m)</text>

        <!-- Left Pile (Concrete Cylinder) -->
        <rect x="180" y="150" width="60" height="220" fill="#475569" stroke="#94a3b8" stroke-width="1.5" rx="2"/>
        <!-- Left Rebar Cage inside Pile -->
        <line x1="190" y1="100" x2="190" y2="360" stroke="#ef4444" stroke-width="2"/>
        <line x1="230" y1="100" x2="230" y2="360" stroke="#ef4444" stroke-width="2"/>
        <line x1="190" y1="180" x2="230" y2="180" stroke="#ef4444" stroke-width="1.2"/>
        <line x1="190" y1="220" x2="230" y2="220" stroke="#ef4444" stroke-width="1.2"/>
        <line x1="190" y1="260" x2="230" y2="260" stroke="#ef4444" stroke-width="1.2"/>
        <line x1="190" y1="300" x2="230" y2="300" stroke="#ef4444" stroke-width="1.2"/>
        <text x="160" y="385" fill="#cbd5e1" font-size="10" font-family="monospace">Polis Ø ${pileDiam} mm</text>

        <!-- Right Pile (Concrete Cylinder) -->
        <rect x="460" y="150" width="60" height="220" fill="#475569" stroke="#94a3b8" stroke-width="1.5" rx="2"/>
        <!-- Right Rebar Cage inside Pile -->
        <line x1="470" y1="100" x2="470" y2="360" stroke="#ef4444" stroke-width="2"/>
        <line x1="510" y1="100" x2="510" y2="360" stroke="#ef4444" stroke-width="2"/>
        <line x1="470" y1="180" x2="510" y2="180" stroke="#ef4444" stroke-width="1.2"/>
        <line x1="470" y1="220" x2="510" y2="220" stroke="#ef4444" stroke-width="1.2"/>
        <line x1="470" y1="260" x2="510" y2="260" stroke="#ef4444" stroke-width="1.2"/>
        <line x1="470" y1="300" x2="510" y2="300" stroke="#ef4444" stroke-width="1.2"/>
        <text x="440" y="385" fill="#cbd5e1" font-size="10" font-family="monospace">Polis Ø ${pileDiam} mm</text>

        <!-- Gelžbetoninis Rostverkas (Ground Beam 300x400 mm) -->
        <rect x="150" y="70" width="400" height="80" fill="#64748b" stroke="#cbd5e1" stroke-width="2"/>
        <text x="290" y="115" fill="#f8fafc" font-size="11" font-family="monospace" font-weight="bold">ROSTVERKAS 300x400 mm</text>

        <!-- Rostverko Išilginė Armatūra (4x Ø12 mm) -->
        <line x1="160" y1="82" x2="540" y2="82" stroke="#dc2626" stroke-width="2.5"/>
        <line x1="160" y1="138" x2="540" y2="138" stroke="#dc2626" stroke-width="2.5"/>

        <!-- XPS Kompensacinis Paklotas po Rostverku (50-100 mm) -->
        <rect x="240" y="150" width="220" height="12" fill="#0284c7" opacity="0.8"/>
        <text x="260" y="160" fill="#bae6fd" font-size="8" font-family="monospace">XPS Kompensacinis tarpas</text>

        <!-- Bituminė Hidroizoliacija virš Rostverko -->
        <line x1="150" y1="68" x2="550" y2="68" stroke="#18181b" stroke-width="4"/>
        <text x="270" y="60" fill="#fbbf24" font-size="9" font-family="monospace" font-weight="bold">2x Bituminis Ruberoidas</text>

        <!-- Mūrlotas / Karkaso apatinis bėgis ant viršaus -->
        <rect x="160" y="44" width="30" height="24" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="510" y="44" width="30" height="24" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>

        <!-- DIMENSIONS -->
        <!-- Pile Depth Dimension -->
        <line x1="130" y1="160" x2="130" y2="370" stroke="#c5824c" stroke-width="1.5" marker-start="url(#arrow-fd)" marker-end="url(#arrow-fd)"/>
        <text x="80" y="270" fill="#f59e0b" font-size="10" font-family="monospace" font-weight="bold">L = ${pileDepth} mm</text>

        <!-- Pile Spacing Dimension -->
        <line x1="210" y1="20" x2="490" y2="20" stroke="#38bdf8" stroke-width="1.5" marker-start="url(#arrow-fd)" marker-end="url(#arrow-fd)"/>
        <text x="310" y="14" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="bold">Žingsnis: ~1800 mm</text>

        <!-- HOTSPOTS -->
        <!-- Hotspot P1: Armatūros inkaravimas -->
        <g class="blueprint-hotspot cursor-pointer group active-hotspot" data-node-id="node-pile-armature" transform="translate(190, 95)">
          <circle r="14" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P1</text>
        </g>

        <!-- Hotspot P2: Kompensacinis paklotas -->
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-pile-xps" transform="translate(350, 156)">
          <circle r="14" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P2</text>
        </g>

        <!-- Hotspot P3: Rostverko hidroizoliacija -->
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-pile-hydro" transform="translate(525, 55)">
          <circle r="14" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P3</text>
        </g>
      </svg>
    `;
  }

  /**
   * 1B. ELEVATED PILES WITHOUT ROSTVERKAS (Post-and-Beam Timber Grid) SVG
   */
  generatePilesNoRostverkSVG() {
    const pileDiam = this.data.pileDiameterMm || 300;
    const pileDepth = (this.data.pileDepthM || 2.0) * 1000;

    return `
      <svg viewBox="0 0 700 420" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pnr" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1b17" stroke-width="0.8"/>
          </pattern>
          <pattern id="earth-pnr" width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 16 L16 0 M0 8 L8 0 M8 16 L16 8" stroke="#292524" stroke-width="1"/>
          </pattern>
          <pattern id="wool-pnr" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="3" fill="#ca8a04" opacity="0.6"/>
          </pattern>
          <marker id="arrow-pnr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>
        </defs>

        <rect width="700" height="420" fill="#0d0c0a"/>
        <rect width="700" height="420" fill="url(#grid-pnr)"/>

        <!-- Underground Soil Layer -->
        <rect x="30" y="200" width="640" height="200" fill="url(#earth-pnr)" opacity="0.6"/>
        <!-- Ground Surface Line (0.000) -->
        <line x1="20" y1="200" x2="680" y2="200" stroke="#78716c" stroke-width="2"/>
        <text x="35" y="193" fill="#a8a29e" font-size="10" font-family="monospace">Žemės paviršius (±0.000)</text>

        <!-- Frost Line (-1.30 m) -->
        <line x1="20" y1="290" x2="680" y2="290" stroke="#0284c7" stroke-width="1.2" stroke-dasharray="6,4"/>
        <text x="35" y="285" fill="#38bdf8" font-size="10" font-family="monospace">Įšalo gylio riba (-1.30 m)</text>

        <!-- Vėdinamas Pogrindžio Tarpas (300-500 mm) -->
        <rect x="70" y="130" width="560" height="70" fill="#1e1b18" opacity="0.5"/>
        <text x="300" y="185" fill="#a8a29e" font-size="10" font-family="monospace">Vėdinamas Pogrindis (+400 mm)</text>

        <!-- 3 Piles (Left Perimeter, Center Room Divider, Right Perimeter) -->
        <!-- LEFT PILE -->
        <rect x="80" y="130" width="50" height="240" fill="#475569" stroke="#94a3b8" stroke-width="1.5" rx="3"/>
        <line x1="88" y1="140" x2="88" y2="360" stroke="#ef4444" stroke-width="1.8"/>
        <line x1="122" y1="140" x2="122" y2="360" stroke="#ef4444" stroke-width="1.8"/>
        <text x="65" y="385" fill="#cbd5e1" font-size="9" font-family="monospace">Perimetro Polis</text>

        <!-- CENTER PILE (Under Room Partitions & Bathroom) -->
        <rect x="325" y="130" width="50" height="240" fill="#475569" stroke="#94a3b8" stroke-width="1.5" rx="3"/>
        <line x1="333" y1="140" x2="333" y2="360" stroke="#ef4444" stroke-width="1.8"/>
        <line x1="367" y1="140" x2="367" y2="360" stroke="#ef4444" stroke-width="1.8"/>
        <text x="300" y="385" fill="#cbd5e1" font-size="9" font-family="monospace">Kambarių/WC Polis</text>

        <!-- RIGHT PILE -->
        <rect x="570" y="130" width="50" height="240" fill="#475569" stroke="#94a3b8" stroke-width="1.5" rx="3"/>
        <line x1="578" y1="140" x2="578" y2="360" stroke="#ef4444" stroke-width="1.8"/>
        <line x1="612" y1="140" x2="612" y2="360" stroke="#ef4444" stroke-width="1.8"/>
        <text x="555" y="385" fill="#cbd5e1" font-size="9" font-family="monospace">Perimetro Polis</text>

        <!-- Galvanized Steel U-Brackets on Top of Piles -->
        <!-- Left U-Bracket -->
        <rect x="75" y="125" width="60" height="6" fill="#cbd5e1" stroke="#f8fafc" stroke-width="1"/>
        <rect x="75" y="90" width="5" height="35" fill="#94a3b8"/>
        <rect x="130" y="90" width="5" height="35" fill="#94a3b8"/>
        <circle cx="105" cy="128" r="4" fill="#f59e0b"/>

        <!-- Center U-Bracket -->
        <rect x="320" y="125" width="60" height="6" fill="#cbd5e1" stroke="#f8fafc" stroke-width="1"/>
        <rect x="320" y="90" width="5" height="35" fill="#94a3b8"/>
        <rect x="375" y="90" width="5" height="35" fill="#94a3b8"/>
        <circle cx="350" cy="128" r="4" fill="#f59e0b"/>

        <!-- Right U-Bracket -->
        <rect x="565" y="125" width="60" height="6" fill="#cbd5e1" stroke="#f8fafc" stroke-width="1"/>
        <rect x="565" y="90" width="5" height="35" fill="#94a3b8"/>
        <rect x="620" y="90" width="5" height="35" fill="#94a3b8"/>
        <circle cx="595" cy="128" r="4" fill="#f59e0b"/>

        <!-- MAIN HEAVY TIMBER CARRIER BEAMS (150x200 mm C24) -->
        <rect x="80" y="85" width="50" height="40" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" rx="1"/>
        <rect x="325" y="85" width="50" height="40" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" rx="1"/>
        <rect x="570" y="85" width="50" height="40" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" rx="1"/>

        <!-- CONTINUOUS FLOOR JOISTS FRAMEWORK (50x200 mm kas 400 mm) & INSULATION -->
        <rect x="60" y="45" width="580" height="40" fill="url(#wool-pnr)" stroke="#d97706" stroke-width="2"/>
        <text x="250" y="68" fill="#fef08a" font-size="11" font-family="monospace" font-weight="bold">GRINDŲ LAGĖS 50x200 KAS 400 MM + VATA</text>

        <!-- OSB-3 22mm Subfloor Decking -->
        <rect x="55" y="38" width="590" height="7" fill="#92400e" stroke="#f59e0b" stroke-width="1"/>

        <!-- Dugno Vėjo Izoliacinė Plokštė 12 mm & Tinklelis nuo graužikų -->
        <line x1="60" y1="87" x2="640" y2="87" stroke="#38bdf8" stroke-width="3"/>
        <line x1="60" y1="89" x2="640" y2="89" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="180" y="100" fill="#38bdf8" font-size="9" font-family="monospace">Vėjo plokštė 12mm + Nerūd. tinklelis nuo graužikų</text>

        <!-- Wall Bottom Plate and Vertical Studs -->
        <rect x="60" y="14" width="24" height="24" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="616" y="14" width="24" height="24" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <line x1="72" y1="14" x2="72" y2="0" stroke="#f59e0b" stroke-width="6"/>
        <line x1="628" y1="14" x2="628" y2="0" stroke="#f59e0b" stroke-width="6"/>

        <!-- Center Room Partition Wall Stud -->
        <rect x="338" y="14" width="24" height="24" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <line x1="350" y1="14" x2="350" y2="0" stroke="#f59e0b" stroke-width="6"/>
        <text x="315" y="10" fill="#fde047" font-size="9" font-family="monospace">Kambario pertvara</text>

        <!-- DIMENSIONS -->
        <!-- Pile Depth -->
        <line x1="45" y1="200" x2="45" y2="370" stroke="#f59e0b" stroke-width="1.5" marker-start="url(#arrow-pnr)" marker-end="url(#arrow-pnr)"/>
        <text x="5" y="290" fill="#f59e0b" font-size="10" font-family="monospace" font-weight="bold">L = ${pileDepth} mm</text>

        <!-- Grid Spacing between Piles -->
        <line x1="105" y1="25" x2="350" y2="25" stroke="#38bdf8" stroke-width="1.5" marker-start="url(#arrow-pnr)" marker-end="url(#arrow-pnr)"/>
        <text x="180" y="20" fill="#38bdf8" font-size="10" font-family="monospace" font-weight="bold">Žingsnis: 1400 mm</text>

        <!-- HOTSPOTS -->
        <!-- Hotspot P4: U-Bracket Base -->
        <g class="blueprint-hotspot cursor-pointer group active-hotspot" data-node-id="node-pile-u-bracket" transform="translate(105, 125)">
          <circle r="14" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P4</text>
        </g>

        <!-- Hotspot P5: Heavy Timber Carrier Bearer Beam -->
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-pile-bearer" transform="translate(595, 105)">
          <circle r="14" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P5</text>
        </g>

        <!-- Hotspot P6: Internal Room & Bathroom Point Pile -->
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-pile-internal-room" transform="translate(350, 105)">
          <circle r="14" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P6</text>
        </g>

        <!-- Hotspot P7: Ventilated Crawlspace & Anti-Rodent Barrier Screen -->
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-pile-underfloor-vent" transform="translate(220, 145)">
          <circle r="14" fill="#f59e0b" fill-opacity="0.3" stroke="#f59e0b" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#d97706" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">P7</text>
        </g>
      </svg>
    `;
  }

  generateRoofSVG() {
    const span = (this.data.roofSpanM || 8.0) * 1000;
    const pitch = this.data.roofPitchDeg || 30;
    const overhang = (this.data.roofOverhangM || 0.6) * 1000;
    const rad = (pitch * Math.PI) / 180;
    const halfSpan = span / 2;
    const height = Math.round(halfSpan * Math.tan(rad));
    const rafterSlope = Math.round(halfSpan / Math.cos(rad));
    const totalRafter = rafterSlope + overhang;

    return `
      <svg viewBox="0 0 700 420" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-r" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1f1b17" stroke-width="0.8"/>
          </pattern>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#c5824c" />
          </marker>
        </defs>

        <rect width="700" height="420" fill="#0d0c0a"/>
        <rect width="700" height="420" fill="url(#grid-r)"/>

        <!-- Rostverkas & Walls -->
        <rect x="130" y="270" width="40" height="90" fill="#292524" stroke="#44403c" stroke-width="1.5"/>
        <rect x="530" y="270" width="40" height="90" fill="#292524" stroke="#44403c" stroke-width="1.5"/>

        <!-- Mūrlotai -->
        <rect x="140" y="252" width="26" height="18" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" rx="1"/>
        <rect x="534" y="252" width="26" height="18" fill="#b45309" stroke="#f59e0b" stroke-width="1.5" rx="1"/>

        <!-- Rafters -->
        <polygon points="70,300 80,314 350,115 350,98" fill="#d97706" stroke="#fbbf24" stroke-width="1.8"/>
        <polygon points="630,300 620,314 350,115 350,98" fill="#d97706" stroke="#fbbf24" stroke-width="1.8"/>

        <!-- Collar Tie -->
        <rect x="220" y="195" width="260" height="14" fill="#ca8a04" stroke="#fef08a" stroke-width="1.5" rx="1"/>
        <text x="310" y="206" fill="#1c1917" font-size="9" font-family="monospace" font-weight="bold">STYGA (50x150 mm)</text>

        <!-- Ridge Board -->
        <rect x="345" y="85" width="10" height="32" fill="#92400e" stroke="#f59e0b" stroke-width="1.5"/>

        <!-- Dimensions -->
        <line x1="150" y1="380" x2="550" y2="380" stroke="#c5824c" stroke-width="1.5" marker-start="url(#arrow)" marker-end="url(#arrow)"/>
        <text x="320" y="375" fill="#f59e0b" font-size="11" font-family="monospace" font-weight="bold">${span} mm</text>

        <!-- Hotspots -->
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-murlot" transform="translate(153, 260)">
          <circle r="14" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">A</text>
        </g>
        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-ridge" transform="translate(350, 95)">
          <circle r="14" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">B</text>
        </g>
      </svg>
    `;
  }

  generateWallSVG() {
    const wallHeight = (this.data.wallHeightM || 2.8) * 1000;
    return `
      <svg viewBox="0 0 700 420" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="420" fill="#0d0c0a"/>
        <rect x="50" y="330" width="600" height="40" fill="#292524" stroke="#44403c" stroke-width="1.5"/>
        <rect x="60" y="318" width="580" height="11" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="60" y="80" width="580" height="11" fill="#b45309" stroke="#f59e0b" stroke-width="1.2"/>
        <rect x="60" y="91" width="580" height="11" fill="#92400e" stroke="#f59e0b" stroke-width="1.2"/>

        <rect x="60" y="102" width="16" height="216" fill="#d97706"/>
        <rect x="180" y="102" width="14" height="216" fill="#d97706"/>
        <rect x="270" y="102" width="14" height="216" fill="#d97706"/>
        <rect x="360" y="102" width="14" height="216" fill="#d97706"/>
        <rect x="374" y="102" width="140" height="28" fill="#78350f"/>
        <rect x="528" y="102" width="14" height="216" fill="#d97706"/>
        <rect x="620" y="102" width="18" height="216" fill="#d97706"/>

        <g class="blueprint-hotspot cursor-pointer group" data-node-id="node-wall-corner" transform="translate(84, 115)">
          <circle r="14" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5" class="animate-ping"/>
          <circle r="10" fill="#dc2626" stroke="#ffffff" stroke-width="1.5"/>
          <text x="-4" y="3.5" fill="#ffffff" font-size="9" font-family="monospace" font-weight="bold">D</text>
        </g>
      </svg>
    `;
  }

  generateFloorSVG() {
    return `
      <svg viewBox="0 0 700 420" class="w-full h-full select-none" xmlns="http://www.w3.org/2000/svg">
        <rect width="700" height="420" fill="#0d0c0a"/>
        <rect x="70" y="80" width="560" height="260" fill="#14110f" stroke="#b45309" stroke-width="3"/>
        <line x1="140" y1="80" x2="140" y2="340" stroke="#d97706" stroke-width="8"/>
        <line x1="210" y1="80" x2="210" y2="340" stroke="#d97706" stroke-width="8"/>
        <line x1="280" y1="80" x2="280" y2="340" stroke="#d97706" stroke-width="8"/>
        <line x1="350" y1="80" x2="350" y2="340" stroke="#d97706" stroke-width="8"/>
        <line x1="420" y1="80" x2="420" y2="340" stroke="#d97706" stroke-width="8"/>
        <line x1="490" y1="80" x2="490" y2="340" stroke="#d97706" stroke-width="8"/>
        <line x1="560" y1="80" x2="560" y2="340" stroke="#d97706" stroke-width="8"/>
      </svg>
    `;
  }

  generateNodeDetailHTML() {
    const nodes = {
      // P1: Polio ir Rostverko inkaravimas
      "node-pile-armature": {
        badge: "MAZGAS P1",
        title: "Polio Armatūros Inkaravimas į Rostverką",
        subtitle: "Monolitinis gelžbetonio ryšys pagal LST EN 1992",
        imageDesc: "Iš gręžtinio polio išleidžiama 4x Ø12 mm armatūra mažiausiai 400 mm į rostverko karkasą.",
        specs: [
          { label: "Armatūros išleidimo ilgis:", val: "≥ 400 mm (sulenkta 90° kampu į rostverko viršų)" },
          { label: "Polio armatūros karkasas:", val: "4x Ø 12 mm A500HW išilginė + Ø 6 mm lankai kas 200 mm" },
          { label: "Rostverko armavimas:", val: "4x Ø 12 mm viršuje ir apačioje su apsauginiu betono sluoksniu 40 mm" },
          { label: "Betonavimo markė:", val: "C20/25 (atitinka XC2 aplinkos klasę)" }
        ],
        steps: [
          "1. Išgręžus polį iki projektinio gylio (≥ 1.8-2.0 m), įleidžiamas suvirintas armatūros karkasas.",
          "2. Užbetonuojamas polis, paliekant išsikišusius armatūros strypus (400 mm).",
          "3. Montuojant rostverko karkasą, polio strypai surišami su apatine ir viršutine rostverko armatūra."
        ]
      },

      // P2: Kompensacinis putplastis po rostverku
      "node-pile-xps": {
        badge: "MAZGAS P2",
        title: "Kompensacinis Tarpas po Rostverku (Apsauga nuo Įšalo)",
        subtitle: "Neleidžia kylančiam įšalusiam gruntui pakelti namo",
        imageDesc: "Po rostverku klojamas 50-100 mm ekstruzinis polistirenas (XPS) arba paliekamas oro tarpas.",
        specs: [
          { label: "Kompensacinis sluoksnis:", val: "50-100 mm Geoporas / XPS arba EPS 50 (minkštas)" },
          { label: "Funkcija:", val: "Žiemą įšalęs ir besiplečiantis gruntas suspaudžia minkštą putplastį, bet nekelia rostverko" },
          { label: "Šoninis apšiltinimas:", val: "100 mm EPS 100 iš vidaus ir išorės" }
        ],
        steps: [
          "1. Tarp polių iškasamas 100 mm gylio griovelis.",
          "2. Paklojamas 50-100 mm kompensacinis polistirenas.",
          "3. Rostverkas betonuojamas tiesiai ant šio pakloto."
        ]
      },

      // P3: Rostverko hidroizoliacija
      "node-pile-hydro": {
        badge: "MAZGAS P3",
        title: "Rostverko Paviršiaus Hidroizoliacija",
        subtitle: "Apsauga nuo kapiliarinės drėgmės patekimo į medinį karkasą",
        imageDesc: "2 sluoksniai ritininės bituminės dangos + bituminė mastika.",
        specs: [
          { label: "Medžiaga:", val: "SBS modifikuotas bituminis ruberoidas (2 sluoksniai)" },
          { label: "Plotis:", val: "Bent 50 mm platesnis už mūrlotą / bėgį" },
          { label: "Ankeravimas:", val: "M12 ankeriniai strypai užsandarinami bitumine mastika" }
        ],
        steps: [
          "1. Rostverko viršus nuvalomas ir nugruntuojamas bituminiu praimeriu.",
          "2. Užlydomas arba paklojamas 2 sluoksnių hidroizoliacinis paklotas."
        ]
      },

      // P4: Reguliuojamas U-ankeris (BE rostverko)
      "node-pile-u-bracket": {
        badge: "MAZGAS P4",
        title: "Reguliuojamo U-formos Ankerio Mazgas (BE Rostverko)",
        subtitle: "Karštai cinkuotas plieninis padas M20/M24 tiesiai ant polio galvutės",
        imageDesc: "Į viršutinę polio dalį įbetonuojamas M20/M24 srieginis strypas. Ant jo maunamas reguliuojamas U-laikiklis, leidžiantis lazeriu idealiai sureguliuoti horizontą.",
        specs: [
          { label: "Srieginis ankeris:", val: "M20 / M24 karštai cinkuotas 8.8 klasės" },
          { label: "U-laikiklis:", val: "150x180x4.0 mm konstrukcinis cinkuotas plienas" },
          { label: "Reguliavimo eiga:", val: "±35 mm pagal lazerinį nivelyrą" },
          { label: "Priveržimas prie medžio:", val: "4x M12 konstrukciniai varžtai per U-ausis į tašą" }
        ],
        steps: [
          "1. Betonuojant pakeltą polio galvutę (+400 mm), įstatomas M20/M24 ankeris.",
          "2. Lazeriniu nivelyru sureguliuojamas U-laikiklio aukštis milimetro tikslumu.",
          "3. Įstatomas 150x200 mm medinis tašas su bitumo tarpine ir suveržiamas M12 varžtais."
        ]
      },

      // P5: Nešančiojo pado tašo suleidimas
      "node-pile-bearer": {
        badge: "MAZGAS P5",
        title: "Laikančiojo Pado Sijų (150x200 mm) Mazgas ir Suleidimas",
        subtitle: "Pagrindinis namo karkaso pagrindas (Post-and-Beam)",
        imageDesc: "C24 150x200 mm mediniai tašai sujungiami pusiniais suleidimais virš polių ir suveržiami M16 varžtais su DIN 440 plačiomis poveržlėmis.",
        specs: [
          { label: "Konstrukcinė mediena:", val: "C24 150x200 mm (arba 3x 50x200 mm) impregnuota" },
          { label: "Sujungimo tipas:", val: "Pusinis suleidimas (Half-Lap) ties atraminiais poliais" },
          { label: "Tvirtinimas:", val: "M16 varžtai + konstrukciniai medsraigčiai TORX 8x160 mm" },
          { label: "Apsauga nuo drėgmės:", val: "Bituminė hidroizoliacija tarp plieno ir medienos" }
        ],
        steps: [
          "1. Nešančiosios sijos klojamos ant U-ankerių pagal perimetrą ir kambarių ašis.",
          "2. Kampuose ir sandūrose išpjaunami pusiniai suleidimai.",
          "3. Mazgai suveržiami varžtais ir papildomai sutvirtinami 8x160 mm medsraigčiais."
        ]
      },

      // P6: Kambarių pertvarų ir vonios taškinis polis
      "node-pile-internal-room": {
        badge: "MAZGAS P6",
        title: "Kambarių Pertvarų & San. Mazgo Taškinis Polis",
        subtitle: "Apsaugo nuo grindų lingavimo ir laiko pertvarų svorį",
        imageDesc: "Kadangi monolitinio rostverko nėra, po kiekviena kambarių pertvara, koridoriumi ir WC įrengiami taškiniai poliai kas 1.2–1.4 m su atraminėmis sijomis.",
        specs: [
          { label: "Polių tinklelio žingsnis:", val: "1.2–1.4 m (maksimalus leistinas tarpas sijoms)" },
          { label: "Įlinkio kontrolė:", val: "w_net,fin ≤ L/400 (standus grindų padas)" },
          { label: "San. mazgo sustiprinimas:", val: "Papildomos dvigubos lagės po vonia ir boileriu" }
        ],
        steps: [
          "1. Išgręžiami poliai po vidinėmis pertvaromis ir san. mazgo taškais.",
          "2. Sumontuojamos skersinės 150x200 mm sijos pertvarų atrėmimui.",
          "3. Sumontuojamos grindų lagės 50x200 mm kas 400 mm (WC zonoje kas 300 mm)."
        ]
      },

      // P7: Vėdinamas pogrindis & tinklelis nuo graužikų
      "node-pile-underfloor-vent": {
        badge: "MAZGAS P7",
        title: "Vėdinamas Pogrindis & Graužikų Barjeras",
        subtitle: "300-500 mm oro tarpas su nerūdijančio plieno tinkleliu",
        imageDesc: "Apsaugo grindų konstrukciją nuo žemės drėgmės ir pelių patekimo į šiltinimo sluoksnį.",
        specs: [
          { label: "Apsauginis tinklelis:", val: "Nerūdijantis plienas, akutė 6x6 mm per visą perimetrą" },
          { label: "Dugno vėjo barjeras:", val: "Difuzinė impregnuota vėjo plokštė 12 mm" },
          { label: "Vandentiekio apsauga:", val: "Savaime reguliuojantis šildymo kabelis + 30 mm kevalas" }
        ],
        steps: [
          "1. Po visu namo dugnu prisukama difuzinė vėjo plokštė.",
          "2. Perimetras apsiuvamas 6x6 mm nerūdijančio plieno tinkleliu.",
          "3. Į vatos tarpus įmontuojami izoliuoti vamzdžiai su šildymo kabeliu."
        ]
      },

      // Roof Node Murlot
      "node-murlot": {
        badge: "MAZGAS A",
        title: "Gegnės Įkirtimas ir Tvirtinimas prie Mūrloto",
        subtitle: "Pagrindinis stogo apkrovos perdavimo taškas",
        imageDesc: "Įkirtimas (Birdsmouth Cut): gylis ne daugiau 1/3 gegnės aukščio (max 65mm iš 200mm gegnės).",
        specs: [
          { label: "Įkirtimo gylis:", val: "Max 50-65 mm (1/3 H gegnės)" },
          { label: "Tvirtinimo kampainis:", val: "Sustiprintas 90x90x65x2.5 mm su standumo briauna (2 vnt. gegnei)" },
          { label: "Tvirtinimo vinys:", val: "Rievėtos ankerinės vinys 4.0x40 mm (po 6 vnt. plokštumai)" }
        ],
        steps: [
          "1. Po mūrlotu (100x150) klojamas 2 sluoksnių bituminis paklotas.",
          "2. Gegnėje atliekamas horizontalus atraminis įpjovimas (atramos plotis ≥ 80 mm).",
          "3. Gegnė iš abiejų pusių fiksuojama 90x90 kampainiais prie mūrloto."
        ]
      },

      // Roof Node Ridge
      "node-ridge": {
        badge: "MAZGAS B",
        title: "Gegnių Sujungimas Kraige",
        subtitle: "Viršutinė stogo geometrija",
        imageDesc: "Gegnės sujungiamos kaktomuša su perforuotomis plokštelėmis 200x60 mm.",
        specs: [
          { label: "Perforuota plokštelė:", val: "Plieninė cinkuota 200x60x2.0 mm (2 vnt. porai)" },
          { label: "Ankerinės vinys:", val: "4.0x40 mm (po 8-10 vnt. plokštelei)" }
        ],
        steps: [
          "1. Gegnės nupjaunamos tiksliu nuolydžio kampu.",
          "2. Sujungiamos viršūnėje ir priveržiamos perforuotomis plokštelėmis."
        ]
      },

      // Wall Corner
      "node-wall-corner": {
        badge: "MAZGAS D",
        title: "Karkaso Kampo Mazgas (California Corner)",
        subtitle: "Maksimali šiluminė varža",
        imageDesc: "3 statramsčių mazgas, leidžiantis apšiltinti kampą.",
        specs: [
          { label: "Statramsčių kiekis:", val: "3 vnt. 50x150 mm L formos konfigūracijoje" },
          { label: "Medsraigčiai:", val: "Konstrukciniai 5.0x90 mm kas 300 mm" }
        ],
        steps: [
          "1. Statramsčiai sujungiami kas 300 mm į vieningą standų kampą.",
          "2. Viršutinis dvigubas bėgis perkeičiamas užraktu."
        ]
      }
    };

    const defaultNode = (this.data && this.data.foundationType === "piles_no_rostverk") ? "node-pile-u-bracket" : "node-pile-armature";
    const n = nodes[this.activeNode] || nodes[defaultNode] || nodes["node-pile-armature"];

    return `
      <div class="space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-stone-800">
          <div>
            <div class="flex items-center space-x-2">
              <span class="px-2 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-mono font-bold">
                ${n.badge}
              </span>
              <h4 class="text-sm font-bold text-white">${n.title}</h4>
            </div>
            <p class="text-xs text-stone-400 mt-0.5">${n.subtitle}</p>
          </div>
        </div>

        <div class="bg-stone-900/90 border border-stone-800 p-3 rounded-xl text-xs text-stone-300 space-y-2">
          <div class="font-bold text-amber-400 flex items-center space-x-1.5">
            <i data-lucide="info" class="w-3.5 h-3.5"></i>
            <span>Konstrukcinis Reikalavimas:</span>
          </div>
          <p class="text-[11px] text-stone-300 leading-relaxed">${n.imageDesc}</p>
        </div>

        <div class="space-y-2">
          <h5 class="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">Inžinerinė specifikacija:</h5>
          <div class="space-y-1.5 text-xs">
            ${n.specs.map(s => `
              <div class="flex items-start justify-between p-2 rounded-lg bg-stone-900/50 border border-stone-800/80">
                <span class="text-stone-400 font-medium text-[11px]">${s.label}</span>
                <span class="text-white font-mono font-bold text-right text-[11px] max-w-[55%]">${s.val}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="space-y-2 pt-2 border-t border-stone-800">
          <h5 class="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">Montavimo Eiga:</h5>
          <div class="space-y-1 text-xs text-stone-300">
            ${n.steps.map(st => `<p class="p-1.5 bg-stone-950/60 rounded border border-stone-800/50 text-[11px] leading-normal font-sans">${st}</p>`).join("")}
          </div>
        </div>
      </div>
    `;
  }

  generateFastenersRows() {
    const pairs = this.data.rafterPairs || 21;
    const totalRafters = pairs * 2;
    const bracketsCount = totalRafters * 2;
    const anchorNailsCount = (bracketsCount * 12) + (pairs * 16);
    const pilesCount = this.data.pilesCount || 22;
    const isPilesNoRostverk = this.data && this.data.foundationType === "piles_no_rostverk";

    if (isPilesNoRostverk) {
      return `
        <tr class="hover:bg-stone-900/50 transition-colors">
          <td class="p-2.5 font-bold text-amber-400 font-mono">Taškiniai Poliai (Tinklas)</td>
          <td class="p-2.5 font-semibold text-white">Betonas C20/25 + Armatūra d12</td>
          <td class="p-2.5 text-stone-300 font-mono">Ø ${this.data.pileDiameterMm || 300} mm x ${(this.data.pileDepthM || 2.0).toFixed(1)} m</td>
          <td class="p-2.5 font-extrabold text-white text-base font-mono">${pilesCount} vnt.</td>
          <td class="p-2.5 text-stone-400">Po perimetru, kambariais ir WC</td>
          <td class="p-2.5 font-mono text-emerald-400 text-right">~${((pilesCount * Math.PI * Math.pow((this.data.pileDiameterMm || 300)/2000, 2) * (this.data.pileDepthM || 2.0))).toFixed(2)} m³ betono</td>
        </tr>

        <tr class="hover:bg-stone-900/50 transition-colors">
          <td class="p-2.5 font-bold text-amber-400 font-mono">Reguliuojami U-Ankeriai</td>
          <td class="p-2.5 font-semibold text-white">Karštai cinkuotas plienas 4mm</td>
          <td class="p-2.5 text-stone-300 font-mono">M20/M24 reguliuojamas padas 150mm</td>
          <td class="p-2.5 font-extrabold text-amber-300 text-base font-mono">${pilesCount} vnt.</td>
          <td class="p-2.5 text-stone-400">1 vnt. kiekvienam poliui</td>
          <td class="p-2.5 font-mono text-stone-300 text-right">Su veržlėmis & poveržlėmis</td>
        </tr>

        <tr class="hover:bg-stone-900/50 transition-colors">
          <td class="p-2.5 font-bold text-sky-400 font-mono">Pado Sijų Varžtai</td>
          <td class="p-2.5 font-semibold text-white">Cinkuoti varžtai DIN 603 / DIN 440</td>
          <td class="p-2.5 text-stone-300 font-mono">M12 x 180 mm su plačiomis poveržlėmis</td>
          <td class="p-2.5 font-extrabold text-white text-base font-mono">${pilesCount * 4} vnt.</td>
          <td class="p-2.5 text-stone-400">4 vnt. kiekvienam U-padui</td>
          <td class="p-2.5 font-mono text-emerald-400 text-right">~${Math.ceil((pilesCount * 4) / 50)} dėž. (po 50vnt)</td>
        </tr>

        <tr class="hover:bg-stone-900/50 transition-colors">
          <td class="p-2.5 font-bold text-emerald-400 font-mono">Apsauga nuo Graužikų</td>
          <td class="p-2.5 font-semibold text-white">Nerūdijančio plieno tinklelis</td>
          <td class="p-2.5 text-stone-300 font-mono">Akutė 6x6 mm x plotis 500 mm</td>
          <td class="p-2.5 font-extrabold text-white text-base font-mono">~45 m</td>
          <td class="p-2.5 text-stone-400">Perimetrinis pogrindžio barjeras</td>
          <td class="p-2.5 font-mono text-stone-300 text-right">Rulonais po 25m</td>
        </tr>

        <tr class="hover:bg-stone-900/50 transition-colors">
          <td class="p-2.5 font-bold text-amber-400 font-mono">Gegnės prie Mūrloto</td>
          <td class="p-2.5 font-semibold text-white">Sustiprinti kampainiai su briauna</td>
          <td class="p-2.5 text-stone-300 font-mono">90 x 90 x 65 x 2.5 mm</td>
          <td class="p-2.5 font-extrabold text-white text-base font-mono">${bracketsCount} vnt.</td>
          <td class="p-2.5 text-stone-400">Po 2 vnt. kiekvienai gegnei</td>
          <td class="p-2.5 font-mono text-emerald-400 text-right">~${Math.ceil(bracketsCount / 20)} dėž.</td>
        </tr>
      `;
    }

    return `
      <tr class="hover:bg-stone-900/50 transition-colors">
        <td class="p-2.5 font-bold text-sky-400 font-mono">Gręžtinių Polių Gręžiniai</td>
        <td class="p-2.5 font-semibold text-white">Betonas C20/25 (XC2, W6)</td>
        <td class="p-2.5 text-stone-300 font-mono">Ø ${this.data.pileDiameterMm || 300} mm x ${(this.data.pileDepthM || 2.0).toFixed(1)} m</td>
        <td class="p-2.5 font-extrabold text-white text-base font-mono">${pilesCount} vnt.</td>
        <td class="p-2.5 text-stone-400">Žemiau įšalo zonos (min 1.8 m)</td>
        <td class="p-2.5 font-mono text-emerald-400 text-right">~${((pilesCount * Math.PI * Math.pow((this.data.pileDiameterMm || 300)/2000, 2) * (this.data.pileDepthM || 2.0))).toFixed(2)} m³ betono</td>
      </tr>

      <tr class="hover:bg-stone-900/50 transition-colors">
        <td class="p-2.5 font-bold text-sky-400 font-mono">Rostverkas & Polių Armatūra</td>
        <td class="p-2.5 font-semibold text-white">Rievėta armatūra A500HW</td>
        <td class="p-2.5 text-stone-300 font-mono">Išilginė Ø 12 mm + Lankai Ø 6 mm</td>
        <td class="p-2.5 font-extrabold text-white text-base font-mono">~380 kg</td>
        <td class="p-2.5 text-stone-400">4x Ø12 išilginiai strypai</td>
        <td class="p-2.5 font-mono text-stone-300 text-right">Strypais po 6m / 12m</td>
      </tr>

      <tr class="hover:bg-stone-900/50 transition-colors">
        <td class="p-2.5 font-bold text-amber-400 font-mono">Gegnės prie Mūrloto</td>
        <td class="p-2.5 font-semibold text-white">Sustiprinti kampainiai su briauna</td>
        <td class="p-2.5 text-stone-300 font-mono">90 x 90 x 65 x 2.5 mm</td>
        <td class="p-2.5 font-extrabold text-white text-base font-mono">${bracketsCount} vnt.</td>
        <td class="p-2.5 text-stone-400">Po 2 vnt. kiekvienai gegnei</td>
        <td class="p-2.5 font-mono text-emerald-400 text-right">~${Math.ceil(bracketsCount / 20)} dėž. (po 20vnt)</td>
      </tr>

      <tr class="hover:bg-stone-900/50 transition-colors">
        <td class="p-2.5 font-bold text-amber-400 font-mono">Kampainių ir Plokštelių Vinys</td>
        <td class="p-2.5 font-semibold text-white">Rievėtos cinkuotos ankerinės vinys</td>
        <td class="p-2.5 text-stone-300 font-mono">Ø 4.0 x 40 mm</td>
        <td class="p-2.5 font-extrabold text-white text-base font-mono">${anchorNailsCount} vnt.</td>
        <td class="p-2.5 text-stone-400">12 vnt / kampainiui</td>
        <td class="p-2.5 font-mono text-emerald-400 text-right">~${Math.ceil(anchorNailsCount / 250)} dėž. (po 250vnt)</td>
      </tr>
    `;
  }
}

if (typeof window !== "undefined") {
  window.ConstructionAssembler = ConstructionAssembler;
}
