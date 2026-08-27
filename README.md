# ARCHITEKTŪRA — Profesionali Medienos Pjovimo, FEA Įtempimų, A++ Energetikos ir BIM/CNC Sistema

Moderni, 100% tiksli internetinė inžinerinė sistema, skirta apskaičiuoti, analizuoti ir optimizuoti karkasinių namų konstrukcijas pagal **Eurokodą 5 (LST EN 1995-1-1)**, **Eurokodą 7 (LST EN 1997-1)** ir **Lietuvos STR 2.01.02:2016** reikalavimus.

---

## 🌟 Pagrindinės Galimybės ir Nauji Inžineriniai Moduliai

1. **🔥 Realaus Laiko FEA Įtempimų ir Įlinkio Analizė (Eurocode 5 & Three.js Heatmap):**
   - **3D Įtempimų Termovizija:** interaktyviai nuspalvina gegnes ir tašus pagal apkrovų lygį (Žalia = saugu <45%, Geltona = 45-75%, Oranžinė = 75-100%, Raudona = perkrova >100%).
   - **Eurokodo 5 tikrinimai:** lenkimo momentas $M_{Ed}$ (kNm), normaliniai įtempiai $\sigma_{m,d}$, šlytis $\tau_d$ su $k_{cr}=0.67$ ir elastingasis įlinkis $w_{inst}$ bei $w_{fin}$ su valkšnumu.
   - **Medienos stiprumo klasės:** C18, C24, C30, GL24h ir GL28h (Glulam).
   - **Sniego zonų parinktis:** 1.2, 1.6 ir 2.0 kN/m² (I, II, III Lietuvos zonos).

2. **❄️ A++ Energinio Naudingumo ir Rasos Taško (Glaser) Simuliatorius (STR 2.01.02:2016):**
   - **Termodinaminis $U$ ir $R$ skaičiuotuvas:** stogo normatyvas ($U \le 0.10$ W/m²K), sienų ($U \le 0.12$ W/m²K).
   - **Interaktyvus SVG Glaserio rasos taško grafikas:** realiu laiku braižo sočiųjų garų slėgio $P_{sat}$, faktinio dalinio slėgio $P_{act}$ ir temperatūros $T$ kreives per visą atitvaros pjūvį.
   - **Kondensato pavojaus detektorius:** apsaugo nuo drėgmės kaupimosi ir pelėsio rizikos.

3. **⚡ Medienos Sudūrimo (Splicing) Inžinerija Ilgiams virš 6 Metrų:**
   - **Standartinių ilgių optimizavimas:** elementai virš 6.0 m automatiškai padalijami ties minimalių lenkimo momentų zona ($M \approx 0$, $0.65L$).
   - **Jungčių tipai:** perforuotos plieninės plokštelės su M12 varžtais (DIN 603/DIN 440), inžinerinis suleidimas kampu (Scarf 1:4), C24 medinės antdėklės.
   - **3D Jungčių atvaizdavimas:** Three.js modelyje tiksliai atvaizduojamos plieninės plokštės ir tvirtinimo mazgai.
   - **Automatinis medžiagų žiniaraštis (BOM):** varžtų, plokščių ir ankerinių vinių kiekiai.

4. **🏭 Tiesioginis CNC Staklių (BTLx) ir OpenBIM (IFC 4.0) Eksportas:**
   - **OpenBIM IFC 4.0 (ISO 16739-1):** 100% suderinamas su Autodesk Revit, Graphisoft ArchiCAD, Tekla Structures ir Solibri.
   - **Hundegger & Weinmann BTLx 2.1:** tiesioginis gamyklinis kodas automatizuotoms stalių staklėms (įkirtimai *birdsmouth*, kraigo nuožulnos, išgrąžos).
   - **CSV / Excel:** pilna specifikacija medienos tiekėjui.

5. **🧱 Geotechninis Polių ir Pamatų Skaičiuotuvas (Eurocode 7):**
   - **Gręžtiniai poliai su monolitiniu rostverku:** tradicinis gelžbetoninis rostverkas, XPS kompensacinis sluoksnis, armatūros karkasai.
   - **Pakeltas namas ant polių BE rostverko (Post-and-Beam):**
     - Taškinis tankus polių tinklelis (1.2–1.4 m žingsnis) po visu perimetru ir atskiromis kambarių bei vonios zonomis.
     - C24 150x200 mm laikančiųjų medinių sijų padas (Timber Girder Grid) su pusiniais suleidimais.
     - Karštai cinkuoti reguliuojami U-ankeriai M20/M24 tiesiai ant iškeltų polių galvučių (+400 mm).
     - Tankus grindų lagių karkasas (50x200 mm kas 400 mm), vėdinamas pogrindis su nerūdijančio plieno tinkleliu nuo graužikų.
   - **Plokštuminiai (Švediška plokštė) ir juostiniai pamatai.**

---

## 🚀 Kaip Paleisti

Paleisti terminale:
```bash
cd /home/kali/AGY-DARBAI/ARCHITEKTURA
./start.sh
```

Arba tiesiog atverti `index.html` bet kurioje šiuolaikinėje interneto naršyklėje!

