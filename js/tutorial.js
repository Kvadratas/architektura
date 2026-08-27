/**
 * ARCHITEKTŪRA - Interactive Step-by-Step Construction Tutorial Controller
 */

const ConstructionTutorial = {
  currentStep: 10, // 1 to 10
  isPlaying: false,
  playInterval: null,

  stepsData: [
    {
      step: 1,
      name: "Pamatai, G/B Žiedas ir Hidroizoliacija",
      shortTitle: "G/B Žiedas",
      phase: "PAMATŲ IR PARUOŠIMO ETAPAS",
      tools: ["Gulsčiukas (lazerinis / optinis)", "Statybinis peilis hidroizoliacijai", "Šepetys / gruntas"],
      fasteners: ["2 sluoksniai bituminio ruberoido pakloto", "Mūrloto hidroizoliacinė mastika"],
      rules: [
        "1. Patikrinkite pamatų / G/B žiedo horizontalumą (nuokrypis neturi viršyti 5 mm visame pastato perimetre).",
        "2. Prieš dedant medieną, BŪTINAI paklokite mažiausiai du sluoksnius ritininės bituminės hidroizoliacijos, kad drėgmė iš betono nepatektų į medį."
      ],
      proTip: "⚠️ Niekada nedėkite medinio mūrloto tiesiai ant pliko betono – be hidroizoliacijos mediena pradės pūti jau po 2–3 metų!"
    },
    {
      step: 2,
      name: "Mūrlotų Klojimas ir Ankeravimas į Žiedą",
      shortTitle: "Mūrlotai",
      phase: "LAIKANČIOSIOS BAZĖS ETAPAS",
      tools: ["Perforatorius / gręžtuvas su Ø 13-14 mm grąžtu", "Dinamometrinis raktas", "Metras"],
      fasteners: ["M12 / M16 srieginiai strypai (kl. 8.8)", "DIN 440 plačios lėkštinės poveržlės", "Savaime fiksuojančios veržlės"],
      rules: [
        "1. Mūrlotas (100x150 mm) išlyginamas pagal pastato ašis ir užveržiamas ankeriais kas 1.0 - 1.2 m.",
        "2. Ankeris turi būti įgilintas į gelžbetonį bent 120-150 mm.",
        "3. Privaloma naudoti DIN 440 padidinto ploto poveržles (Ø 40-45 mm), kad veržlė neįsispaustų į minkštą medieną."
      ],
      proTip: "💡 Kampuose ankerius statykite ne toliau kaip 150-200 mm nuo mūrloto galo, kad kampinis sujungimas neatkiltų."
    },
    {
      step: 3,
      name: "Sienų Karkasas ir Statramsčiai",
      shortTitle: "Karkasas",
      phase: "SIENŲ MONTAVIMO ETAPAS",
      tools: ["Akumuliatorinis smūginis suktuvas TORX T25", "Statybinis kampainis", "Gulsčiukas 2.0m"],
      fasteners: ["Konstrukciniai medsraigčiai 5.0x90 mm", "Betonsraigčiai 10x140 mm apatiniam bėgiui"],
      rules: [
        "1. Statramsčiai (50x150 mm) montuojami 600 mm ašiniu žingsniu (atitinka standartinės mineralinės vatos plotį).",
        "2. Viršuje montuojamas dvigubas bėgis (Top Plate), kurio viršutinis sluoksnis persidengia kampuose mažiausiai 600 mm užraktu."
      ],
      proTip: "💡 Kampuose naudokite 3 statramsčių 'California Corner' sistemą – tai leis pilnai apšiltinti kampą ir suteiks pagrindą vidaus gipskartonio karkasui."
    },
    {
      step: 4,
      name: "Kraigo Sija ir Laikinosios Atramos",
      shortTitle: "Kraigas",
      phase: "GEOMETRIJOS FORMAVIMAS",
      tools: ["Lazerinis nivelyras", "Tvirtos laikinosios atramos / ramsčiai", "Kopėčios / pastoliai"],
      fasteners: ["Medsraigčiai 6.0x120 mm", "Plieniniai kampainiai 70x70 mm"],
      rules: [
        "1. Kraigo lenta (50x200 mm) pakeliama į projektinį aukštį ir įtvirtinama laikinomis įstrižainėmis.",
        "2. Lazeriu patikrinama, kad kraigo linija būtų visiškai tiesi lygiagrečiai namo ašiai."
      ],
      proTip: "💡 Laikinas įstrižas atramas nuimkite TIK tada, kai sumontuotos ir suveržtos visos stogo gegnės bei stygos!"
    },
    {
      step: 5,
      name: "Gegnių Įkirtimas ir Tvirtinimas prie Mūrloto",
      shortTitle: "Gegnės",
      phase: "PAGRINDINĖ SANTVARA",
      tools: ["Diskinis pjūklas su kreipiančiąja", "Rankinis kaltas", "Pneumatinis vinių pistoletas"],
      fasteners: ["Sustiprinti kampainiai 90x90x65x2.5 mm su briauna", "Rievėtos ankerinės vinys 4.0x40 mm", "Perforuotos kraigo plokštelės 200x60 mm"],
      rules: [
        "1. Gegnėje atliekamas horizontalus atraminis įkirtimas (Birdsmouth Cut). Įkirtimo gylis negali viršyti 1/3 gegnės aukščio (max 65 mm).",
        "2. Gegnė iš abiejų pusių fiksuojama sustiprintais 90x90 kampainiais prie mūrloto (po 6 ankerines vinis į kiekvieną plokštumą).",
        "3. Viršūnėje gegnės sujungiamos perforuotomis plokštelėmis iš abiejų pusių."
      ],
      proTip: "⚠️ Niekada netvirtinkite gegnės prie mūrloto vien tik paprastais juodais gipso medsraigčiais – jie nuo sniego ir vėjo šlyties apkrovų tiesiog nulūžta!"
    },
    {
      step: 6,
      name: "Stygos (Suveržimai) ir Užveržimas M12 Varžtais",
      shortTitle: "Stygos",
      phase: "STANDUMO IR IŠSISKĖTIMO BLOKAVIMAS",
      tools: ["Gręžtuvas su medžio grąžtu Ø 13 mm", "Veržliarakčiai 19 mm (2 vnt.)"],
      fasteners: ["Cinkuoti varžtai M12x140 mm (kl. 8.8)", "Plačios poveržlės DIN 440 (Ø 45 mm)", "Savaime fiksuojančios veržlės DIN 985"],
      rules: [
        "1. Stygos (50x150 mm) montuojamos 50-60% stogo aukštyje.",
        "2. Kiekviename sujungime gręžiamos dvi kiaurymės ir perveržiami du M12 varžtai.",
        "3. Varžtai užveržiami standžiai, kol poveržlė nežymiai įsispaudžia į medienos paviršių."
      ],
      proTip: "💡 Stygos atlieka dvigubą funkciją – jos neleidžia stogui išsiskėsti ir kartu tarnauja kaip lubų karkasas mansardos patalpai."
    },
    {
      step: 7,
      name: "Difuzinė Membrana (Kvėpuojanti Stogo Plėvelė)",
      shortTitle: "Difuzinė Plėvelė",
      phase: "HIDROIZOLIACIJA IR VĖJO APSAUGA",
      tools: ["Statybinis segiklis (Stepleris) ir cinkuotos kabės 10-12 mm", "Speciali lipni juosta garo/vėjo plėvelei (pvz. Gerband / Tyvek)"],
      fasteners: ["3-sluoksnė difuzinė membrana (≥ 150 g/m²)", "Vėjo izoliacinė dvipusė lipni juosta"],
      rules: [
        "1. Membrana klojama horizontaliai nuo karnizo link kraigo su mažiausiai 150 mm persidengimu (užlaida).",
        "2. Visi sujungimai ir persidengimai suklijuojami specialia lipnia juosta, kad vėjas nepūstų šalto oro į šiltinimo sluoksnį.",
        "3. Membranos užrašai turi būti nukreipti į viršų (į lauko pusę)."
      ],
      proTip: "⚠️ Nenaudokite paprastos polietileno plėvelės vietoj difuzinės membranos – paprasta plėvelė nepraleidžia garų ir vata po ja sudrėks!"
    },
    {
      step: 8,
      name: "Išilginiai Ventiliaciniai Tašeliai (Counter-Battens)",
      shortTitle: "Išilginiai Tašeliai",
      phase: "VENTILIACIJOS ORO TARPAS",
      tools: ["Vinių pistoletas / plaktukas", "Metras"],
      fasteners: ["Cinkuotos rievėtos vinys 3.1x80 mm arba medvaržčiai 5.0x80 mm", "Vinių sandarinimo juosta po tašeliu (Nail Sealing Tape)"],
      rules: [
        "1. Išilginiai tašeliai (25x50 arba 50x50 mm) kalami tiesiai išilgai kiekvienos gegnės ant difuzinės plėvelės.",
        "2. Po tašeliu rekomenduojama klijuoti sandarinimo juostą, kuri užsandarina vinių pradūrimo vietas plėvelėje.",
        "3. Šis tašelis suformuoja mažiausiai 25–50 mm ventiliacijos kanalą, kuriuo pasišalina kondensatas ir drėgmė."
      ],
      proTip: "💡 Ventiliacinis tarpas yra kritiškai svarbus – be jo po skarda kaupsis kondensatas ir pūdys stogo konstrukciją."
    },
    {
      step: 9,
      name: "Skersiniai Grebėstai Stogo Dangai (Battens)",
      shortTitle: "Grebėstai",
      phase: "PAGRINDAS SKARDOS MONTAVIMUI",
      tools: ["Šablonas grebėstų žingsniui matuoti (350 mm)", "Kreidinis mušamas siūlas tiesumui"],
      fasteners: ["Kalibruotos lentos 25x100 mm (arba 32x100 mm)", "Cinkuotos vinys 3.5x90 mm (po 2 vnt. į kiekvieną susikirtimą)"],
      rules: [
        "1. Pirmasis karnizo grebėstas montuojamas statesnis arba storesnis (pvz. +15 mm), kad kompensuotų skardos profilį.",
        "2. Visi kiti grebėstai kalami griežtai pagal pasirinktos skardos žingsnį (klasikinei skardai kas 200–300 mm, čerpinei skardai tiksliai kas 350 mm).",
        "3. Ties kraigu ir šlaito lūžiais kalami 2–3 grebėstai greta vienas kito papildomam standumui."
      ],
      proTip: "💡 Pasidarykite medinį šabloną-tarpinį grebėstų atstumui – tai pagreitins montavimo darbą 3 kartus ir apsaugos nuo matavimo klaidų!"
    },
    {
      step: 10,
      name: "Stogo Skarda, Kraigo Lankstiniai ir Vėjalentės",
      shortTitle: "Skarda & Kraigas",
      phase: "GALUTINĖ APDAILA IR SANDARUMAS",
      tools: ["Skardos žirklės (kairinės / dešininės / tiesios)", "Nibleris (skardos kirtiklis)", "Suktuvas su magnetine galvute 8 mm"],
      fasteners: ["Stoginiai savisriegiai su EPDM gumine tarpine 4.8x35 mm", "Kraigo savisriegiai 4.8x70 mm", "Vėjalenčių ir karnizų lankstiniai"],
      rules: [
        "1. Skardos lakštai (Classic / Trapecija / Čerpinis profilis) montuojami nuo karnizo į viršų.",
        "2. Savisriegiai sukami į apatinę bangos dalį statmenai grebėstui, užveržiant tiek, kad EPDM guma nežymiai išlystų, bet nesusitraiškytų.",
        "3. Sumontuojami kraigo lankstiniai su vėdinama kraigo juosta ir šoninės vėjalenčių skardos."
      ],
      proTip: "🚫 NIEKADA nepjaukite stogo skardos abrazyviniu disku (kampiniu šlifuokliu / 'bulgarke')! Karštos kibirkštys sudegina cinko ir polimero apsauginį sluoksnį, ir skarda garantuotai pradės rūdyti po pirmo lietaus!"
    }
  ],

  /**
   * Initialize Tutorial Component
   */
  init(viewer3dInstance) {
    this.viewer = viewer3dInstance;
    this.renderControlsUI();
    this.updateStepDisplay(this.currentStep);
  },

  /**
   * Render Controller Player & Step Scrubber HTML
   */
  renderControlsUI() {
    const container = document.getElementById("tutorial-controls-container");
    if (!container) return;

    container.innerHTML = `
      <div class="bg-[#16120f] border border-stone-800 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
        
        <!-- TOP PLAYER BAR -->
        <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-950/50">
              <i data-lucide="play-circle" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center space-x-2">
                <h4 class="text-sm font-bold text-white uppercase tracking-wider">3D Surinkimo Gidas: Žingsnis po Žingsnio</h4>
                <span id="badge-step-number" class="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-[10px] font-mono font-bold">10 / 10 ŽINGSNIS</span>
              </div>
              <p class="text-xs text-stone-400">Nuo pamatų ir mūrloto iki stogo dangos, grebėstų ir skardos</p>
            </div>
          </div>

          <!-- Playback Buttons -->
          <div class="flex items-center space-x-2">
            <button id="btn-tut-prev" class="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center space-x-1.5 transition-all">
              <i data-lucide="chevron-left" class="w-4 h-4"></i>
              <span>Atgal</span>
            </button>
            <button id="btn-tut-play" class="px-4 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-brand-950/60 transition-all">
              <i data-lucide="play" class="w-4 h-4 fill-white" id="tut-play-icon"></i>
              <span id="tut-play-text">Paleisti eigos animaciją</span>
            </button>
            <button id="btn-tut-next" class="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center space-x-1.5 transition-all">
              <span>Pirmyn</span>
              <i data-lucide="chevron-right" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        <!-- 10-STEP SCRUBBER BUTTONS -->
        <div class="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-1.5">
          ${this.stepsData.map(s => `
            <button type="button" class="btn-step-item p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${s.step === 10 ? 'bg-brand-500 text-white border-brand-400 shadow' : 'bg-stone-900/90 text-stone-400 border-stone-800 hover:text-white hover:bg-stone-800'}" data-step="${s.step}">
              <span class="text-[10px] font-mono font-bold opacity-75">#${s.step}</span>
              <span class="text-[11px] font-semibold truncate max-w-full leading-tight mt-0.5">${s.shortTitle}</span>
            </button>
          `).join("")}
        </div>

        <!-- STEP INSPECTOR DETAIL CARD -->
        <div id="step-detail-inspector" class="bg-[#110e0c] border border-stone-800/90 rounded-xl p-4 sm:p-5 space-y-4">
          <!-- Populated by updateStepDisplay() -->
        </div>

      </div>
    `;

    this.bindEvents();
    if (window.lucide) lucide.createIcons();
  },

  /**
   * Bind Events for step navigation
   */
  bindEvents() {
    // Step buttons click
    const stepBtns = document.querySelectorAll(".btn-step-item");
    stepBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        const stepNum = parseInt(btn.dataset.step);
        this.goToStep(stepNum);
      });
    });

    // Prev / Next buttons
    const prevBtn = document.getElementById("btn-tut-prev");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        if (this.currentStep > 1) {
          this.goToStep(this.currentStep - 1);
        }
      });
    }

    const nextBtn = document.getElementById("btn-tut-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        if (this.currentStep < 10) {
          this.goToStep(this.currentStep + 1);
        }
      });
    }

    // Play / Pause auto animation
    const playBtn = document.getElementById("btn-tut-play");
    if (playBtn) {
      playBtn.addEventListener("click", () => {
        this.togglePlay();
      });
    }
  },

  /**
   * Jump to specific step
   */
  goToStep(stepNumber) {
    this.currentStep = stepNumber;
    
    // Update 3D Viewer visibility
    if (this.viewer) {
      this.viewer.setStep(this.currentStep);
    }

    // Update buttons highlight
    const stepBtns = document.querySelectorAll(".btn-step-item");
    stepBtns.forEach(btn => {
      const s = parseInt(btn.dataset.step);
      if (s === this.currentStep) {
        btn.className = "btn-step-item p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center bg-brand-500 text-white border-brand-400 shadow";
      } else if (s < this.currentStep) {
        btn.className = "btn-step-item p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center bg-stone-900/90 text-stone-200 border-amber-800/40 hover:bg-stone-800";
      } else {
        btn.className = "btn-step-item p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center bg-stone-950 text-stone-600 border-stone-900";
      }
    });

    const badge = document.getElementById("badge-step-number");
    if (badge) badge.textContent = `${this.currentStep} / 10 ŽINGSNIS`;

    this.updateStepDisplay(this.currentStep);
    if (window.lucide) lucide.createIcons();
  },

  /**
   * Play / Pause construction timelapse
   */
  togglePlay() {
    this.isPlaying = !this.isPlaying;
    const playIcon = document.getElementById("tut-play-icon");
    const playText = document.getElementById("tut-play-text");

    if (this.isPlaying) {
      if (playText) playText.textContent = "Pauzė";
      if (this.currentStep >= 10) this.currentStep = 0;
      
      this.playInterval = setInterval(() => {
        let next = this.currentStep + 1;
        if (next > 10) {
          next = 1;
        }
        this.goToStep(next);
      }, 2400);
    } else {
      if (playText) playText.textContent = "Paleisti eigos animaciją";
      clearInterval(this.playInterval);
      this.playInterval = null;
    }
  },

  /**
   * Update Step Detail Inspector Card
   */
  updateStepDisplay(stepNumber) {
    const data = this.stepsData.find(s => s.step === stepNumber) || this.stepsData[0];
    const inspector = document.getElementById("step-detail-inspector");
    if (!inspector) return;

    inspector.innerHTML = `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        <!-- LEFT: STEP TITLE & RULES (7 cols) -->
        <div class="lg:col-span-7 space-y-3">
          <div class="flex items-center space-x-2">
            <span class="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
              ${data.phase}
            </span>
            <span class="text-xs text-stone-500 font-mono">Žingsnis #${data.step} iš 10</span>
          </div>

          <h3 class="text-lg font-bold text-white tracking-wide">${data.name}</h3>

          <div class="space-y-2 pt-1">
            <h5 class="text-xs font-bold uppercase tracking-wider text-stone-300 font-mono">Surinkimo ir montavimo taisyklės:</h5>
            <div class="space-y-1.5 text-xs text-stone-300">
              ${data.rules.map(r => `<p class="p-2 bg-stone-900/80 rounded-lg border border-stone-800/80 leading-relaxed font-sans">${r}</p>`).join("")}
            </div>
          </div>

          <!-- PRO TIP / WARNING BOX -->
          <div class="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-200 flex items-start space-x-2.5">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400 shrink-0 mt-0.5"></i>
            <span class="leading-relaxed font-medium">${data.proTip}</span>
          </div>
        </div>

        <!-- RIGHT: TOOLS & FASTENERS NEEDED FOR THIS STEP (5 cols) -->
        <div class="lg:col-span-5 space-y-3 bg-stone-950/60 p-4 rounded-xl border border-stone-800">
          
          <!-- Fasteners -->
          <div>
            <h5 class="text-xs font-bold uppercase tracking-wider text-brand-400 font-mono flex items-center space-x-1.5 mb-2">
              <i data-lucide="nut" class="w-3.5 h-3.5"></i>
              <span>Reikalingos tvirtinimo detalės šiam žingsniui:</span>
            </h5>
            <div class="space-y-1 text-xs">
              ${data.fasteners.map(f => `
                <div class="flex items-center space-x-2 p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-200">
                  <span class="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                  <span class="font-mono text-[11px]">${f}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Tools -->
          <div class="pt-2 border-t border-stone-800">
            <h5 class="text-xs font-bold uppercase tracking-wider text-blue-400 font-mono flex items-center space-x-1.5 mb-2">
              <i data-lucide="wrench" class="w-3.5 h-3.5"></i>
              <span>Reikalingi įrankiai:</span>
            </h5>
            <div class="space-y-1 text-xs">
              ${data.tools.map(t => `
                <div class="flex items-center space-x-2 p-1.5 rounded bg-stone-900 border border-stone-800 text-stone-300">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span class="text-[11px]">${t}</span>
                </div>
              `).join("")}
            </div>
          </div>

        </div>

      </div>
    `;
  }
};

if (typeof window !== "undefined") {
  window.ConstructionTutorial = ConstructionTutorial;
}
