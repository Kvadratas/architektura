# 🏡 ARCHITEKTŪRA — Profesionali Karkasinių Namų Projektavimo, FEA Įtempimų, A++ Energetikos ir BIM/CNC Sistema

Moderni, 100% tiksli internetinė inžinerinė platforma, skirta projektuoti, apskaičiuoti, analizuoti ir optimizuoti karkasinių namų konstrukcijas pagal **Eurokodą 5 (LST EN 1995-1-1)**, **Eurokodą 7 (LST EN 1997-1)**, **Eurokodą 2 (LST EN 1992-1-1)** ir **Lietuvos STR 2.01.02:2016** reikalavimus.

---

## 🌟 Pagrindiniai Moduliai ir Inžinerinės Galimybės

### 1. 🏠 Viso Namo Projektavimo Vedlys & Sąmata (*House Wizard & Master BOM*)
- **Parametrinis pastato generavimas:** Namo ilgis (6–20 m), plotis (4–14 m), sienų aukštis (2.4–3.5 m), stogo nuolydis (5–55°).
- **Kambarių zonavimas:** Automatinis miegamųjų (1–5 vnt.), vonios kambarių (1–3 vnt.), koridoriaus ir svetainės su virtuve planavimas.
- **10 Kategorijų Master Sąmata (BOM):** Pamatai, medienos karkasas C24, stogo danga ir skardinimas, A++ šiltinimas, fasado apdaila, langai/durys, elektra, santechnika, vidaus apdaila ir konstrukcinė furnitūra.
- **15 Žingsnių Statybos Gidas:** Detali chronologinė eiga su trukmėmis, kritiniais taškais ir profesionalų patarimais (*ProTips*).

### 2. 🧱 Geotechninis Polių ir Pamatų Skaičiuotuvas (*Eurocode 7*)
- **Sklypo gruntai:** Žvyras, priesmėlis, priemolis/molis, silpnos durpės su charakteringais $q_b$ ir $f_s$ rodikliais.
- **Gręžtiniai poliai su monolitiniu rostverku:** Pamatų gylis žemiau įšalo ribos (1.8–2.5 m), polio skersmuo (250–350 mm), betono tūris ($m^3$), armatūros masė (kg) ir XPS kompensacinis sluoksnis.
- **Pakeltas namas ant polių BE rostverko (*Post-and-Beam*):**
  - Taškinis tankus polių tinklelis kas **1.2–1.4 m** po visu perimetru ir atskiromis kambarių bei vonios zonomis.
  - Laikančiojo pado sijos (**C24 150x200 mm**) su pusiniais suleidimais virš polių.
  - Karštai cinkuoti reguliuojami U-ankeriai M20/M24 tiesiai ant pakeltų polių galvučių (+400 mm).
  - Tankus grindų lagių karkasas (**50x200 mm kas 400 mm**), vėdinamas pogrindis su nerūdijančio plieno tinkleliu nuo graužikų (6x6 mm).
- **Plokštuminiai (Švediška plokštė) ir juostiniai pamatai.**

### 3. 🔥 Realaus Laiko FEA Įtempimų ir Įlinkio Analizė (*Eurocode 5 & Three.js Heatmap*)
- **3D Įtempimų Termovizija:** Interaktyviai nuspalvina gegnes ir tašus pagal apkrovos lygį (Žalia = saugu <45%, Geltona = 45–75%, Oranžinė = 75–100%, Raudona = perkrova >100%).
- **Eurokodo 5 tikrinimai:**
  - Lenkimo momentas $M_{Ed}$ (kNm) ir lenkimo įtempiai $\sigma_{m,d} \le f_{m,d}$.
  - Šlyties įtempiai $\tau_d \le f_{v,d}$ su efektyviuoju $k_{cr} = 0.67$.
  - Momentinis elastingasis įlinkis $w_{inst} \le L/300$ ir galutinis įlinkis $w_{fin} \le L/200$ su medienos valkšnumu ($k_{def} = 0.60$).
- **Medienos stiprumo klasės:** C18, C24, C30, GL24h ir GL28h (Glulam).
- **Lietuvos sniego zonos:** 1.2, 1.6 ir 2.0 kN/m² (I, II, III zonos pagal STR).

### 4. ❄️ A++ Energinio Naudingumo & Rasos Taško Simuliatorius (*STR 2.01.02:2016*)
- **Termodinaminis $U$ ir $R$ skaičiuotuvas:** Stogo normatyvas ($U \le 0.10$ W/m²K), sienų ($U \le 0.12$ W/m²K).
- **Interaktyvus SVG Glaserio rasos taško grafikas:** Realiu laiku braižo sočiųjų garų slėgio $P_{sat}$, faktinio dalinio slėgio $P_{act}$ ir temperatūros $T$ kreives per visą atitvaros pjūvį.
- **Kondensato pavojaus detektorius:** Apsaugo nuo drėgmės kaupimosi ir pelėsio rizikos atitvaroje.

### 5. 📐 Interaktyvūs 2D Konstrukciniai Brėžiniai & Mazgai (*Construction Assembler*)
- **SVG Inžineriniai skerspjūviai:** Pamatų, stogo santvarų, išorinių sienų ir perdangos pjūviai.
- **Mazgų analizė su inžinerinėmis specifikacijomis:**
  - **P1–P3:** Polių armavimas, XPS kompensacinis sluoksnis, rostverko hidroizoliacija.
  - **P4–P7:** Reguliuojami U-ankeriai, 150x200 mm pado sijų suleidimai, vidinių pertvarų atraminiai poliai, vėdinamas pogrindis.
  - **A & B:** Gegnės „Birdsmouth“ įkirtimas, mūrloto ankeravimas, kraigo plokštelės.
  - **D:** Kampo „California Corner“ 3 statramsčių mazgas.
- **Tvirtinimo detalių specifikacija:** Poveržlės, ankeriai, konstrukciniai medsraigčiai, vinys ir perforuotos plokštelės.

### 6. ⚡ Medienos Sudūrimo (*Splicing*) Inžinerija Ilgiams virš 6 Metrų
- **Minimalių lenkimo momentų zonos optimizavimas:** Elementai virš 6.0 m automatiškai padalijami ties $M \approx 0$ ($0.65L$).
- **Jungčių tipai:** Perforuotos plieninės plokštelės su M12 varžtais (DIN 603/DIN 440), inžinerinis suleidimas kampu (*Scarf 1:4*), C24 medinės antdėklės.
- **3D Jungčių atvaizdavimas:** Three.js modelyje tiksliai atvaizduojamos plieninės plokštės ir tvirtinimo mazgai.

### 7. 🏭 Tiesioginis OpenBIM (IFC 4.0) ir CNC Staklių (BTLx) Eksportas
- **OpenBIM IFC 4.0 (ISO 16739-1):** 100% suderinamas su Autodesk Revit, Graphisoft ArchiCAD, Tekla Structures ir Solibri.
- **Hundegger & Weinmann BTLx 2.1:** Tiesioginis gamyklinis kodas automatizuotoms stalių staklėms (įkirtimai *birdsmouth*, kraigo nuožulnos, išgrąžos).
- **Medžiagų eksportas:** CSV / Excel specifikacijos medienos tiekėjui.

### 8. 📦 1D Medienos Pjovimo Optimizavimas (*Linear Cutting Stock*)
- Algoritmas apskaičiuoja optimalų ruošinių išdėstymą ant standartinių 6.0 m tašų su minimaliomis atraižomis (<5%).

---

## 📁 Projekto Failų Struktūra

```text
ARCHITEKTURA/
├── index.html          # Pagrindinė vieno puslapio aplikacija (Tailwind CSS, Three.js, Lucide Icons)
├── server.py           # Python HTTP serveris su CORS ir teisingais MIME tipais
├── start.sh            # Greito paleidimo skriptas
├── css/
│   └── style.css       # Pasirinktiniai stiliai, tamsioji tema, SVG animacijos
├── js/
│   ├── app.js          # Būsenos valdiklis ir modulių integracija
│   ├── house_wizard.js # Namo konfigūratorius, 10 kategorijų BOM ir 15 žingsnių gidas
│   ├── foundation.js   # Geotechninis Eurocode 7 pamatų skaičiuotuvas (su poliais be rostverko)
│   ├── viewer3d.js     # Three.js 3D modelis, FEA termovizija, 10 statybos etapų sluoksniai
│   ├── assembler.js    # 2D SVG brėžiniai, interaktyvūs mazgai (P1-P7, A, B, D) ir tvirtinimo BOM
│   ├── fea.js          # Eurocode 5 baigtinių elementų įtempimų ir įlinkio skaičiuotuvas
│   ├── energy.js       # A++ energinio naudingumo ir Glaserio rasos taško analizatorius
│   ├── bim_cnc.js      # OpenBIM IFC 4.0 ir Hundegger/Weinmann BTLx eksportuotojas
│   ├── splicing.js     # Medienos sudūrimo inžinerinis modulis (>6m)
│   ├── optimizer.js    # 1D medienos pjovimo optimizavimo variklis
│   ├── presets.js      # Populiariausi namų šablonai (Kompaktiškas, Šeimos, Erdvus)
│   ├── visualizer.js   # 2D pjovimo schemų braižytuvas
│   ├── tutorial.js     # Interaktyvus vartotojo gidas
│   └── exporter.js     # PDF ir spausdinimo ataskaitų generatorius
└── README.md           # Projekto dokumentacija
```

---

## 🚀 Kaip Paleisti Projektą

### 1 variantas: Su paleidimo skriptu (Rekomenduojama)
```bash
cd /home/kali/AGY-DARBAI/ARCHITEKTURA
./start.sh
```
Programa bus pasiekiama adresu: **`http://localhost:8000`**

### 2 variantas: Tiesiogiai naršyklėje
Galite tiesiog atidaryti `index.html` bet kurioje šiuolaikinėje interneto naršyklėje (Chrome, Firefox, Edge, Safari).

---

## 📜 Taikomi Standartai ir Normatyvai

* **LST EN 1995-1-1 (Eurokodas 5):** Medienos konstrukcijų projektavimas.
* **LST EN 1997-1 (Eurokodas 7):** Geotechninis projektavimas ir pamatų skaičiavimas.
* **LST EN 1992-1-1 (Eurokodas 2):** Gelžbetoninių konstrukcijų projektavimas.
* **LST EN 1991-1-3 (Eurokodas 1):** Sniego ir vėjo poveikiai konstrukcijoms.
* **Lietuvos STR 2.01.02:2016:** Pastatų energinio naudingumo projektavimas ir sertifikavimas (A++ klasė).
* **ISO 16739-1:** Industry Foundation Classes (IFC 4.0) OpenBIM standartas.
* **Design2Machine (BTLx 2.1):** Automatizuotų stalių CNC staklių sąsajos standartas.
