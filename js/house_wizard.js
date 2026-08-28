/**
 * ARCHITEKTŪRA - Full House Builder Wizard, Room Partitioning & Complete 15-Step Construction Master
 * Generates full house configurations: Piles, Framing, Roofing, Rooms (Living, Bedrooms, WC),
 * Windows/Doors, MEP (Plumbing, Electrical, Heating), Insulation, Drywall, Finishes,
 * and a 100% Complete 10-Category Master Bill of Materials (BOM) & 15-Step Master Guide.
 */

class FullHouseMasterEngine {
  constructor() {
    // Standard construction price catalog (€ / unit, Lithuanian 2026 market standards)
    this.priceCatalog = {
      // 1. Foundations
      concrete_m3: 110, // C20/25 betonas su siurbliu
      rebar_kg: 1.35, // Armatūra d12/d8
      pile_drilling_m: 22, // Gręžimo darbai
      eps_perimeter_m2: 14, // XPS / EPS100 pamatams
      bitumen_m2: 4.5, // Hidroizoliacija

      // 2. Timber & Framing
      timber_c24_m3: 290, // C24 kalibruota mediena
      osb3_m2: 8.5, // OSB-3 15mm
      structural_screws_box: 18, // Medsraigčiai TORX 5x90 (200 vnt)

      // 3. Roofing & Cladding
      roof_sheet_m2: 14.5, // Plieninė čerpinė / trapecija RAL 7016
      membrane_m2: 1.6, // Difuzinė membrana 150g
      ridge_flashing_m: 9.0, // Kraigas
      gutter_m: 12.0, // Lietaus latakas

      // 4. Insulation & Airtightness
      mineral_wool_m3: 45, // Knauf/Paroc mineralinė vata
      pir_board_m2: 24, // PIR 100mm
      vapor_barrier_m2: 1.2, // Garo izoliacija Sd=100m
      airtight_tape_roll: 26, // Sandarinimo juosta Gerband 60mm

      // 5. Windows & Doors
      window_a_plus_plus_m2: 180, // 3 stiklų paketai A++
      exterior_door_unit: 850, // Lauko šarvo durys
      interior_door_unit: 180, // Vidaus durys su stakta ir spyna

      // 6. Partition Walls & Drywall
      drywall_m2: 3.8, // Gipskartonis Knauf 12.5mm
      metal_profile_m: 2.2, // CW50 / UW50 profilis
      acoustic_wool_m2: 4.2, // Akustinė vata 50mm

      // 7. MEP: Plumbing & Sewage
      sewage_pipe_m: 6.5, // PVC 110/50 vamzdžiai
      water_pex_pipe_m: 2.8, // PEX-a 16mm vamzdis
      wc_frame_unit: 220, // Potinkinis rėmas Geberit su WC puodu

      // 8. MEP: Electrical & Lighting
      cable_3x15_m: 1.1, // Vamzdyje 3x1.5 mm2
      cable_3x25_m: 1.6, // Vamzdyje 3x2.5 mm2
      switch_socket_unit: 6.5, // Rozetė / jungiklis Schneider
      fuse_box_unit: 320, // Pilnas automatinis skydas su nuotėkio relėmis

      // 9. Heating & Ventilation
      underfloor_heating_m2: 28, // Vamzdynas, takeliai, kolektorius
      recuperator_ducts_m: 14, // Lankstūs ortakiai 75mm su difuzoriais

      // 10. Interior Finish
      putty_paint_m2: 6.5, // Glaistas + gruntas + dažai (medžiagos)
      laminate_flooring_m2: 16 // 33 klasės grindys su paklotu
    };
  }

  /**
   * Generate Full House Configuration & Room Layout
   */
  generateHouseConfiguration({
    houseLengthM = 12.0,
    houseWidthM = 8.0,
    storeys = 1,
    bedroomsCount = 3,
    bathroomsCount = 2,
    hasLivingKitchen = true,
    foundationType = "piles",
    roofType = "gable",
    roofPitchDeg = 30,
    roofCladding = "steel",
    insulationThicknessMm = 350,
    facadeType = "timber_cladding"
  }) {
    const totalAreaM2 = Math.round(houseLengthM * houseWidthM * storeys);
    const perimeterM = Math.round(2 * (houseLengthM + houseWidthM) * storeys);
    const wallHeightM = 2.8;
    const exteriorWallAreaM2 = Math.round(perimeterM * wallHeightM);

    // Calculate Rooms Matrix
    const rooms = this.calculateRoomLayout({
      totalAreaM2,
      houseLengthM,
      houseWidthM,
      bedroomsCount,
      bathroomsCount,
      hasLivingKitchen
    });

    // Partition walls length based on room count
    const partitionWallsLengthM = Math.round(
      (houseWidthM * (bedroomsCount + bathroomsCount + 1) * 0.75) + 
      (houseLengthM * 0.45)
    );
    const interiorWallAreaM2 = Math.round(partitionWallsLengthM * wallHeightM);

    // Doors & Windows Count
    const windowsCount = Math.round((totalAreaM2 / 9) + 2); // 1 window per ~9m2 + living room glass wall
    const windowAreaTotalM2 = Math.round(windowsCount * 2.4);
    const interiorDoorsCount = bedroomsCount + bathroomsCount + 2; // Rooms + Technical room + storage

    // Generate Full Master Bill of Materials (BOM) & Costs
    const masterBOM = this.calculateMasterBOM({
      totalAreaM2,
      houseLengthM,
      houseWidthM,
      perimeterM,
      exteriorWallAreaM2,
      partitionWallsLengthM,
      interiorWallAreaM2,
      storeys,
      foundationType,
      roofType,
      roofPitchDeg,
      roofCladding,
      insulationThicknessMm,
      bedroomsCount,
      bathroomsCount,
      windowsCount,
      windowAreaTotalM2,
      interiorDoorsCount
    });

    // Generate 15-Step Chronological Construction Guide
    const constructionGuide15Steps = this.generate15StepsGuide({
      houseLengthM,
      houseWidthM,
      totalAreaM2,
      foundationType,
      roofType,
      roofCladding,
      bedroomsCount,
      bathroomsCount,
      masterBOM
    });

    return {
      summary: {
        totalAreaM2,
        houseLengthM,
        houseWidthM,
        storeys,
        perimeterM,
        wallHeightM,
        bedroomsCount,
        bathroomsCount,
        windowsCount,
        interiorDoorsCount,
        totalCostEur: masterBOM.totalCostEur,
        costPerM2Eur: Math.round(masterBOM.totalCostEur / totalAreaM2)
      },
      rooms,
      masterBOM,
      constructionGuide15Steps,
      stepsGuide: constructionGuide15Steps
    };
  }

  /**
   * Calculate Room Layout & Dimensions
   */
  calculateRoomLayout({ totalAreaM2, houseLengthM, houseWidthM, bedroomsCount, bathroomsCount, hasLivingKitchen }) {
    const rooms = [];
    let remainingArea = totalAreaM2;

    // 1. Living room & Kitchen (Svetainė + Virtuvė ~38-45%)
    const livingArea = Math.round(totalAreaM2 * 0.40);
    rooms.push({
      id: "living_kitchen",
      name: "Svetainė ir Virtuvė (Open Space)",
      category: "living",
      areaM2: livingArea,
      widthM: (houseWidthM * 0.85).toFixed(1),
      lengthM: (livingArea / (houseWidthM * 0.85)).toFixed(1),
      windows: Math.max(3, Math.round(livingArea / 10)),
      color: "#f59e0b",
      description: "Erdvi bendroji zona su vitrininiais langais į terasą, virtuvės sala ir poilsio erdve."
    });
    remainingArea -= livingArea;

    // 2. Bathrooms / WC (Vonios kambariai)
    for (let b = 1; b <= bathroomsCount; b++) {
      const bathArea = b === 1 ? 7.5 : 4.0;
      rooms.push({
        id: `wc_bath_${b}`,
        name: b === 1 ? "Pagrindinis Vonios Kambarys (WC, Vonia, Dušas)" : "Svečių WC ir Dušinė",
        category: "sanitary",
        areaM2: bathArea,
        widthM: "2.2",
        lengthM: (bathArea / 2.2).toFixed(1),
        windows: 1,
        color: "#06b6d4",
        description: "Hidroizoliuota patalpa su potinkiniais rėmais, dušo trapu grindyse ir priverstine ventiliacija."
      });
      remainingArea -= bathArea;
    }

    // 3. Hallway / Entrance (Holas / Tambūras)
    const hallArea = Math.min(10, Math.round(totalAreaM2 * 0.08));
    rooms.push({
      id: "hallway",
      name: "Holas / Tambūras su Spinta",
      category: "hall",
      areaM2: hallArea,
      widthM: "2.5",
      lengthM: (hallArea / 2.5).toFixed(1),
      windows: 1,
      color: "#8b5cf6",
      description: "Šilumos barjeras prie lauko durų su integruota vieta batams ir drabužių spintai."
    });
    remainingArea -= hallArea;

    // 4. Technical / Boiler Room (Katilinė / Skalbykla)
    const techArea = Math.min(6.5, Math.max(4.5, Math.round(totalAreaM2 * 0.05)));
    rooms.push({
      id: "tech_room",
      name: "Katilinė, Skalbykla ir Mazgai",
      category: "technical",
      areaM2: techArea,
      widthM: "2.0",
      lengthM: (techArea / 2.0).toFixed(1),
      windows: 1,
      color: "#64748b",
      description: "Šilumos siurblio Oras-Vanduo, rekuperatoriaus, elektros skydo ir vandens filtrų centras."
    });
    remainingArea -= techArea;

    // 5. Bedrooms (Miegamieji kambariai)
    const bedroomAreaEach = Math.round(remainingArea / Math.max(1, bedroomsCount));
    for (let i = 1; i <= bedroomsCount; i++) {
      const isMaster = (i === 1);
      rooms.push({
        id: `bedroom_${i}`,
        name: isMaster ? "Tėvų Miegamasis (Master Bedroom su drabužine)" : `Miegamasis / Vaikų kambarys #${i}`,
        category: "bedroom",
        areaM2: bedroomAreaEach,
        widthM: "3.4",
        lengthM: (bedroomAreaEach / 3.4).toFixed(1),
        windows: isMaster ? 2 : 1,
        color: "#10b981",
        description: isMaster 
          ? "Privati poilsio zona su vieta 1.8m lovai, rūbine ir akustine garo/triukšmo izoliacija."
          : "Šviesus kambarys su darbo stalu, spinta ir kokybišku vėdinimo pritekėjimu."
      });
    }

    return rooms;
  }

  /**
   * Calculate Complete 10-Category Master Bill of Materials (BOM) & Pricing
   */
  calculateMasterBOM({
    totalAreaM2,
    houseLengthM,
    houseWidthM,
    perimeterM,
    exteriorWallAreaM2,
    partitionWallsLengthM,
    interiorWallAreaM2,
    storeys,
    foundationType,
    roofType,
    roofPitchDeg,
    roofCladding,
    insulationThicknessMm,
    bedroomsCount,
    bathroomsCount,
    windowsCount,
    windowAreaTotalM2,
    interiorDoorsCount
  }) {
    const rad = (roofPitchDeg * Math.PI) / 180;
    const roofSlopeAreaM2 = Math.round(((houseWidthM / 2) / Math.cos(rad) + 0.6) * (houseLengthM + 0.6) * 2);

    const categories = [];

    // 1. PAMATAI IR ŽEMĖS DARBAI
    let cat1;
    let extraBearerTimberM3 = 0;

    if (foundationType === "piles_no_rostverk") {
      const gridL = Math.ceil(houseLengthM / 1.4) + 1;
      const gridW = Math.ceil(houseWidthM / 1.4) + 1;
      const pilesCount = gridL * gridW;
      const singlePileVolM3 = Math.PI * 0.15 * 0.15 * 2.2;
      const concreteVolumeM3 = (pilesCount * singlePileVolM3).toFixed(1);
      const rebarKg = Math.round(pilesCount * (4 * 2.5 * 0.888 + 11 * 0.222));
      const bearerLengthM = Math.round(perimeterM + (houseLengthM * (gridW - 2)) + (houseWidthM * 2));
      extraBearerTimberM3 = parseFloat((bearerLengthM * 0.15 * 0.20).toFixed(2));

      cat1 = {
        name: "1. Pamatai ant Polių BE Rostverko (Post-and-Beam)",
        icon: "anchor",
        color: "#f59e0b",
        items: [
          { name: `Gręžtiniai poliai Ø 300 mm po perimetru ir kambarių taškais (${pilesCount} vnt.)`, qty: pilesCount, unit: "vnt.", priceUnit: 42, totalEur: pilesCount * 42 },
          { name: "C20/25 betonas poliams (be betoninio rostverko)", qty: parseFloat(concreteVolumeM3), unit: "m³", priceUnit: this.priceCatalog.concrete_m3, totalEur: Math.round(parseFloat(concreteVolumeM3) * this.priceCatalog.concrete_m3) },
          { name: "Rievėta plieninė armatūra Ø 12 mm / Ø 6 mm poliams", qty: rebarKg, unit: "kg", priceUnit: this.priceCatalog.rebar_kg, totalEur: Math.round(rebarKg * this.priceCatalog.rebar_kg) },
          { name: `Karštai cinkuoti reguliuojami U-ankeriai M20/M24 polių galvutėms (${pilesCount} vnt.)`, qty: pilesCount, unit: "vnt.", priceUnit: 16.5, totalEur: Math.round(pilesCount * 16.5) },
          { name: "Pogrindžio vėdinimo apsauginis tinklelis nuo graužikų", qty: perimeterM, unit: "m", priceUnit: 6.5, totalEur: Math.round(perimeterM * 6.5) }
        ]
      };
    } else {
      const pilesCount = Math.round((perimeterM / 1.8) + (houseLengthM * houseWidthM > 80 ? 6 : 4));
      const concreteVolumeM3 = Math.round(pilesCount * (Math.PI * 0.15 * 0.15 * 2.2) + (perimeterM * 0.3 * 0.45));
      const rebarKg = Math.round(concreteVolumeM3 * 65);
      cat1 = {
        name: "1. Pamatai ir Grunto Darbai (Eurokodas 7)",
        icon: "anchor",
        color: "#f59e0b",
        items: [
          { name: "Gręžtiniai poliai Ø 300 mm (gylis 2.2 m)", qty: pilesCount, unit: "vnt.", priceUnit: 45, totalEur: pilesCount * 45 },
          { name: "C20/25 betonas poliams ir rostverkui", qty: concreteVolumeM3, unit: "m³", priceUnit: this.priceCatalog.concrete_m3, totalEur: concreteVolumeM3 * this.priceCatalog.concrete_m3 },
          { name: "Rievėta plieninė armatūra Ø 12 mm / Ø 8 mm", qty: rebarKg, unit: "kg", priceUnit: this.priceCatalog.rebar_kg, totalEur: Math.round(rebarKg * this.priceCatalog.rebar_kg) },
          { name: "Pamatų XPS šiltinimas (100 mm) + Hidroizoliacija", qty: perimeterM * 0.6, unit: "m²", priceUnit: 18.5, totalEur: Math.round(perimeterM * 0.6 * 18.5) }
        ]
      };
    }
    cat1.totalEur = cat1.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat1);

    // 2. MEDIENOS KARKASAS IR PERDANGA
    const timberWallM3 = (exteriorWallAreaM2 * 0.05 * 0.15 * 2.2).toFixed(2);
    const timberRoofM3 = (roofSlopeAreaM2 * 0.05 * 0.20 * 1.8).toFixed(2);
    const totalTimberM3 = (parseFloat(timberWallM3) + parseFloat(timberRoofM3) + 2.5 + extraBearerTimberM3).toFixed(2);
    const cat2 = {
      name: "2. Konstrukcinė Mediena C24 & Karkasas",
      icon: "box",
      color: "#d97706",
      items: [
        { name: `Kalibruota mediena C24 (Gegnés, sienos, ${foundationType === 'piles_no_rostverk' ? 'medinis aprišamasis padas 150x200' : 'mūrlotai'})`, qty: totalTimberM3, unit: "m³", priceUnit: this.priceCatalog.timber_c24_m3, totalEur: Math.round(totalTimberM3 * this.priceCatalog.timber_c24_m3) },
        { name: "OSB-3 standumo plokštės (15 mm) karkasui", qty: Math.round(exteriorWallAreaM2 * 0.85), unit: "m²", priceUnit: this.priceCatalog.osb3_m2, totalEur: Math.round(exteriorWallAreaM2 * 0.85 * this.priceCatalog.osb3_m2) },
        { name: "Konstrukciniai medsraigčiai TORX ir 90x90 kampuočiai", qty: 14, unit: "kompl.", priceUnit: 48, totalEur: 14 * 48 }
      ]
    };
    cat2.totalEur = cat2.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat2);

    // 3. STOGO DANGA IR LIETAUS SISTEMA
    const cat3 = {
      name: "3. Stogo Danga, Skardinimas & Lietaus Sistema",
      icon: "layers",
      color: "#38bdf8",
      items: [
        { name: `Stogo danga (${roofCladding === 'steel' ? 'Plieninė skarda RAL 7016' : 'Betoninės čerpės'})`, qty: roofSlopeAreaM2, unit: "m²", priceUnit: this.priceCatalog.roof_sheet_m2, totalEur: Math.round(roofSlopeAreaM2 * this.priceCatalog.roof_sheet_m2) },
        { name: "Difuzinė kvėpuojanti stogo membrana (150 g/m²)", qty: Math.round(roofSlopeAreaM2 * 1.15), unit: "m²", priceUnit: this.priceCatalog.membrane_m2, totalEur: Math.round(roofSlopeAreaM2 * 1.15 * this.priceCatalog.membrane_m2) },
        { name: "Kraigai, vėjalentės, laštakiai ir varžtai su EPDM", qty: Math.round(houseLengthM * 2 + 12), unit: "m", priceUnit: 14.5, totalEur: Math.round((houseLengthM * 2 + 12) * 14.5) },
        { name: "Plieninė lietaus nuvedimo sistema (latakai ir vamzdžiai)", qty: Math.round(houseLengthM * 2 + 12), unit: "m", priceUnit: this.priceCatalog.gutter_m, totalEur: Math.round((houseLengthM * 2 + 12) * this.priceCatalog.gutter_m) }
      ]
    };
    cat3.totalEur = cat3.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat3);

    // 4. A++ ŠILTINIMAS IR SANDARUMAS
    const woolRoofM3 = Math.round(roofSlopeAreaM2 * (insulationThicknessMm / 1000));
    const woolWallM3 = Math.round(exteriorWallAreaM2 * 0.25);
    const cat4 = {
      name: "4. A++ Šiltinimas & Oro Sandarumo Barjeras",
      icon: "shield-check",
      color: "#22c55e",
      items: [
        { name: `Mineralinė vata stogui (${insulationThicknessMm} mm, λ=0.035)`, qty: woolRoofM3, unit: "m³", priceUnit: this.priceCatalog.mineral_wool_m3, totalEur: woolRoofM3 * this.priceCatalog.mineral_wool_m3 },
        { name: "Mineralinė vata sienoms (250 mm)", qty: woolWallM3, unit: "m³", priceUnit: this.priceCatalog.mineral_wool_m3, totalEur: woolWallM3 * this.priceCatalog.mineral_wool_m3 },
        { name: "Garo izoliacinė plėvelė Sd ≥ 100m + Sandarinimo mastika", qty: Math.round((roofSlopeAreaM2 + exteriorWallAreaM2) * 1.1), unit: "m²", priceUnit: this.priceCatalog.vapor_barrier_m2, totalEur: Math.round((roofSlopeAreaM2 + exteriorWallAreaM2) * 1.1 * this.priceCatalog.vapor_barrier_m2) },
        { name: "Sertifikuotos sandarinimo juostos Gerband / SIGA (Blower-door)", qty: 12, unit: "rit.", priceUnit: this.priceCatalog.airtight_tape_roll, totalEur: 12 * this.priceCatalog.airtight_tape_roll }
      ]
    };
    cat4.totalEur = cat4.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat4);

    // 5. LANGAI IR LAUKO DURYS
    const cat5 = {
      name: "5. A++ Langai & Lauko Durys",
      icon: "maximize",
      color: "#a855f7",
      items: [
        { name: `A++ 3 stiklų paketų langai su šiltais rėmeliais (${windowsCount} vnt.)`, qty: windowAreaTotalM2, unit: "m²", priceUnit: this.priceCatalog.window_a_plus_plus_m2, totalEur: windowAreaTotalM2 * this.priceCatalog.window_a_plus_plus_m2 },
        { name: "Šiltos lauko durys su termo tilteliu", qty: 1, unit: "vnt.", priceUnit: this.priceCatalog.exterior_door_unit, totalEur: this.priceCatalog.exterior_door_unit },
        { name: "Šilto montavimo juostos ir išnešimo kronšteinai", qty: windowsCount + 1, unit: "kompl.", priceUnit: 35, totalEur: (windowsCount + 1) * 35 }
      ]
    };
    cat5.totalEur = cat5.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat5);

    // 6. VIDAUS PERTVAROS IR GIPSKARTONIS (KAMBARIAI & WC)
    const drywallTotalM2 = Math.round((interiorWallAreaM2 * 2) + (totalAreaM2 * 1.05)); // 2 sides + ceiling
    const cat6 = {
      name: "6. Kambarių Pertvaros, Gipsas & Vidaus Durys",
      icon: "layout",
      color: "#ec4899",
      items: [
        { name: "Vidaus karkasas CW/UW 50/75 mm + Akustinė vata", qty: partitionWallsLengthM, unit: "m", priceUnit: 24, totalEur: partitionWallsLengthM * 24 },
        { name: "Gipskartonis Knauf White/Blue 12.5mm (sienos + lubos)", qty: drywallTotalM2, unit: "m²", priceUnit: this.priceCatalog.drywall_m2, totalEur: Math.round(drywallTotalM2 * this.priceCatalog.drywall_m2) },
        { name: "Drėgmei atsparus gipsas Knauf Green (WC ir voniai)", qty: Math.round(bathroomsCount * 32), unit: "m²", priceUnit: 5.2, totalEur: Math.round(bathroomsCount * 32 * 5.2) },
        { name: `Vidaus durys su apvadais, vyriais ir spynomis (${interiorDoorsCount} vnt.)`, qty: interiorDoorsCount, unit: "vnt.", priceUnit: this.priceCatalog.interior_door_unit, totalEur: interiorDoorsCount * this.priceCatalog.interior_door_unit }
      ]
    };
    cat6.totalEur = cat6.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat6);

    // 7. INŽINERIJA: SANTECHNIKA IR NUOTEKOS
    const cat7 = {
      name: "7. Santechnika, Vandentiekis & Nuotekos",
      icon: "droplet",
      color: "#06b6d4",
      items: [
        { name: "Nuotekų vamzdynas PVC 110/50 mm po grindimis ir sienose", qty: Math.round(perimeterM * 0.9), unit: "m", priceUnit: this.priceCatalog.sewage_pipe_m, totalEur: Math.round(perimeterM * 0.9 * this.priceCatalog.sewage_pipe_m) },
        { name: "Geriamojo vandens PEX-a vamzdynai su kolektoriumi", qty: Math.round(totalAreaM2 * 0.8), unit: "m", priceUnit: this.priceCatalog.water_pex_pipe_m, totalEur: Math.round(totalAreaM2 * 0.8 * this.priceCatalog.water_pex_pipe_m) },
        { name: `Potinkiniai WC rėmai su pakabinamais puodais (${bathroomsCount} vnt.)`, qty: bathroomsCount, unit: "vnt.", priceUnit: this.priceCatalog.wc_frame_unit, totalEur: bathroomsCount * this.priceCatalog.wc_frame_unit },
        { name: "Dušo trapai, vandens maišytuvai ir pajungimo armatūra", qty: bathroomsCount, unit: "kompl.", priceUnit: 280, totalEur: bathroomsCount * 280 }
      ]
    };
    cat7.totalEur = cat7.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat7);

    // 8. INŽINERIJA: ELEKTRA IR APŠVIETIMAS
    const socketsCount = Math.round(totalAreaM2 * 0.65);
    const cat8 = {
      name: "8. Elektros Instaliacija & Apšvietimas",
      icon: "zap",
      color: "#eab308",
      items: [
        { name: "Nedegus varinis kabelis 3x2.5 mm² rozetėms", qty: Math.round(totalAreaM2 * 2.8), unit: "m", priceUnit: this.priceCatalog.cable_3x25_m, totalEur: Math.round(totalAreaM2 * 2.8 * this.priceCatalog.cable_3x25_m) },
        { name: "Varinis kabelis 3x1.5 mm² apšvietimui", qty: Math.round(totalAreaM2 * 1.8), unit: "m", priceUnit: this.priceCatalog.cable_3x15_m, totalEur: Math.round(totalAreaM2 * 1.8 * this.priceCatalog.cable_3x15_m) },
        { name: `Rozetės, jungikliai ir instaliacinės dėžutės (${socketsCount} vnt.)`, qty: socketsCount, unit: "vnt.", priceUnit: this.priceCatalog.switch_socket_unit, totalEur: Math.round(socketsCount * this.priceCatalog.switch_socket_unit) },
        { name: "Automatinis elektros skydas su B/C automatais ir RCD", qty: 1, unit: "kompl.", priceUnit: this.priceCatalog.fuse_box_unit, totalEur: this.priceCatalog.fuse_box_unit }
      ]
    };
    cat8.totalEur = cat8.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat8);

    // 9. ŠILDYMAS IR VĖDINIMAS (A++)
    const cat9 = {
      name: "9. Šildymas (Grindinis) & Vėdinimas (Rekuperacija)",
      icon: "wind",
      color: "#14b8a6",
      items: [
        { name: "Vandeninis grindinio šildymo vamzdynas su kolektoriumi", qty: totalAreaM2, unit: "m²", priceUnit: this.priceCatalog.underfloor_heating_m2, totalEur: totalAreaM2 * this.priceCatalog.underfloor_heating_m2 },
        { name: "Rekuperacinės vėdinimo sistemos lankstūs ortakiai ir difuzoriai", qty: Math.round(totalAreaM2 * 0.9), unit: "m", priceUnit: this.priceCatalog.recuperator_ducts_m, totalEur: Math.round(totalAreaM2 * 0.9 * this.priceCatalog.recuperator_ducts_m) }
      ]
    };
    cat9.totalEur = cat9.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat9);

    // 10. VIDAUS APDAILA IR GRINDYS
    const cat10 = {
      name: "10. Apdaila: Glaistymas, Dažymas & Grindų Danga",
      icon: "paintbrush",
      color: "#84cc16",
      items: [
        { name: "Sienų ir lubų glaistymas, gruntas ir plaunami dažai", qty: drywallTotalM2, unit: "m²", priceUnit: this.priceCatalog.putty_paint_m2, totalEur: Math.round(drywallTotalM2 * this.priceCatalog.putty_paint_m2) },
        { name: "Grindų laminatas 33 kl. / vinilas su garsą sugeriančiu paklotu", qty: Math.round(totalAreaM2 * 0.88), unit: "m²", priceUnit: this.priceCatalog.laminate_flooring_m2, totalEur: Math.round(totalAreaM2 * 0.88 * this.priceCatalog.laminate_flooring_m2) },
        { name: "Vonios kambario ir WC sienų bei grindų plytelės su klijais", qty: Math.round(bathroomsCount * 28), unit: "m²", priceUnit: 22, totalEur: Math.round(bathroomsCount * 28 * 22) }
      ]
    };
    cat10.totalEur = cat10.items.reduce((s, i) => s + i.totalEur, 0);
    categories.push(cat10);

    const totalCostEur = categories.reduce((sum, cat) => sum + cat.totalEur, 0);

    return {
      categories,
      totalCostEur,
      costPerM2Eur: Math.round(totalCostEur / totalAreaM2)
    };
  }

  /**
   * Generate 15-Step Chronological Step-by-Step Construction Master Guide
   */
  generate15StepsGuide({ houseLengthM, houseWidthM, totalAreaM2, foundationType, roofType, roofCladding, bedroomsCount, bathroomsCount, masterBOM }) {
    const isPilesNoRostverk = foundationType === "piles_no_rostverk";

    return [
      {
        step: 1,
        title: "1. Sklypo Ašių Žymėjimas & Geodezija",
        phase: "NULINIS CIKLAS",
        days: "1-2 d.",
        keyMaterials: "Mediniai kuoliukai, geodezinė virvė, optinis/lazerinis nivelyras",
        instructions: "Pagal sklypo planą lazeriniu nivelyru atžymimos pastato ašys, patikrinamos įstrižainės (Pitagoro taisyklė a² + b² = c²) su 0 mm paklaida.",
        proTip: "💡 Įstrižainių lygybė yra kritinis žingsnis – jei pamatai bus su 2 cm paklaida, stogo kraigas ir gegnės vėliau 'bėgs' iš ašies!",
        isCritical: true
      },
      isPilesNoRostverk ? {
        step: 2,
        title: "2. Taškiniai Poliai & Reguliuojami Plieniniai U-Ankeriai",
        phase: "PAMATAI BE ROSTVERKO",
        days: "2-3 d.",
        keyMaterials: "Grąžtas Ø 300 mm, C20/25 betonas, armatūra d12 A500HW, karštai cinkuoti U-ankeriai M20/M24",
        instructions: "Išgręžiami poliai tankiu tinkleliu kas 1.2–1.4 m (perimetru ir po visomis kambarių bei vonios pertvaromis). Įstatomi armatūros karkasai, išbetonuojamos pakeltos galvutės ir pagal lazerinį nivelyrą įstatomi reguliuojami U-formos plieniniai padai.",
        proTip: "⚠️ Kadangi betoninio rostverko nėra, kiekvieno polio galvutės aukštis ir U-ankerio ašis turi būti sukalibruota lazeriu iki milimetro tikslumu!",
        isCritical: true
      } : {
        step: 2,
        title: "2. Gręžtiniai Poliai & Armatūros Karkasai",
        phase: "PAMATAI (EUROKODAS 7)",
        days: "2-3 d.",
        keyMaterials: "Grąžtas Ø 300mm, C20/25 betonas, armatūra d12 A500HW",
        instructions: "Išgręžiamos 2.2 m gylio duobės žemiau įšalo zonos, įstatomi 4 strypų armatūros karkasai su viršun išleistais ankeriais ir užpilamas vibruotas betonas.",
        proTip: "⚠️ Užpilant betoną privaloma naudoti giluminį vibratorių, kad neliktų oro kišenių!",
        isCritical: true
      },
      isPilesNoRostverk ? {
        step: 3,
        title: "3. Nešančiųjų Medinių Sijų Pado Montavimas (C24 150x200 mm Aprišimas)",
        phase: "PADO KARKASAS",
        days: "2-3 d.",
        keyMaterials: "C24 150x200 mm (arba 3x 50x200 mm) sijos, M12/M16 cinkuoti varžtai, bituminis paklotas",
        instructions: "Ant U-ankerių montuojamas pagrindinis laikančiųjų medinių sijų karkasas. Sijos sujungiamos suleidimais su DIN 440 plačiomis poveržlėmis. Po visu perimetru įrengiamas nerūdijančio plieno apsauginis tinklelis nuo graužikų.",
        proTip: "💡 Visi pado medienos elementai privalo būti giliai impregnuoti antiseptiku ir atskirti nuo plieninių ankerių bitumine tarpine.",
        isCritical: true
      } : {
        step: 3,
        title: "3. Rostverko Klojimas, Armavimas & Betonavimas",
        phase: "PAMATAI",
        days: "3-5 d.",
        keyMaterials: "Klojiniai, ekstruzinis polistirenas XPS 100mm, C20/25 betonas",
        instructions: "Sumontuojami klojiniai, įklojamas 100mm dugno ir šonų XPS apšiltinimas, surišamas erdvinis armatūros karkasas ir išbetonuojamas monolitinis rostverkas.",
        proTip: "💡 Nepamirškite klojiniuose iš anksto įdėti vamzdžių movų vandentiekio ir elektros įvadams!",
        isCritical: false
      },
      isPilesNoRostverk ? {
        step: 4,
        title: "4. Apšiltinto Pogrindžio Inžineriniai Įvadai & Šildymo Kabelis",
        phase: "INŽINERINIAI ĮVADAI",
        days: "1-2 d.",
        keyMaterials: "PVC 110/50 mm nuotekų vamzdžiai, PE 32 mm vandentiekis su savaime reguliuojančiu šildymo kabeliu ir 30 mm kevalais",
        instructions: "Vandentiekio ir nuotekų vamzdžiai išvedžiojami pakeltame vėdinamame pogrindyje. Vandentiekis apvelkamas termoizoliaciniu kevalu ir įveriamas apsauginis šildymo kabelis nuo užšalimo žiemą.",
        proTip: "⚠️ Kadangi namas pakeltas ant polių, atviri vandentiekio vamzdžiai po namu be šildymo kabelio žiemą prie didesnio šalčio užšaltų!",
        isCritical: true
      } : {
        step: 4,
        title: "4. Vandentiekio & Nuotekų Įvadai po Grindimis",
        phase: "INŽINERINIAI ĮVADAI",
        days: "1-2 d.",
        keyMaterials: "PVC 110mm / 50mm nuotekų vamzdžiai, PE 32mm vandentiekis",
        instructions: "Išvedžiojami nuotekų vamzdžiai su 2 cm/m nuolydžiu į būsimus WC, dušų, virtuvės taškus, užpilama smėliu ir sutankinama vibroplokšte.",
        proTip: "⚠️ Prieš betonuojant grindis BŪTINA atlikti vandens nuotėkio testą (užpildyti vamzdyną vandeniu)!",
        isCritical: true
      },
      isPilesNoRostverk ? {
        step: 5,
        title: "5. Pado Grindų Lagės (50x200 mm kas 400 mm) & Vėjo Izoliacija",
        phase: "PADO KARKASAS & GRINDYS",
        days: "2 d.",
        keyMaterials: "C24 50x200 mm lagės kas 400 mm, difuzinė vėjo plokštė 12 mm, apsauginis tinklelis nuo graužikų",
        instructions: "Iš apačios prie medinio pado karkaso pritvirtinama vėjui atspari plokštė ir tinklelis nuo graužikų. Skersai nešančiųjų tašų 400 mm žingsniu sumontuojamos grindų lagės 50x200 mm su skersiniais standumo intarpais.",
        proTip: "💡 400 mm žingsnis tarp lagių užtikrina, kad grindys nelinguos ir atlaikys bet kokius baldus bei vonios įrangą.",
        isCritical: true
      } : {
        step: 5,
        title: "5. Hidroizoliacija & Apatinis Mūrlotas (100x150)",
        phase: "MEDINIS KARKASAS",
        days: "1 d.",
        keyMaterials: "2 sluoksniai bitumo pakloto, impregnuotas C24 100x150 mm, M12 ankeriai",
        instructions: "Ant išdžiūvusio betono klojamas ruberoidas, uždedamas antiseptikuotas mūrlotas ir kas 1.2 m priveržiamas M12 ankeriais su DIN 440 plačiomis poveržlėmis.",
        proTip: "⚠️ Niekada nedėkite medienos tiesiai ant betono be dvigubos hidroizoliacijos!",
        isCritical: true
      },
      {
        step: 6,
        title: "6. Išorinių Sienų Karkasas (Statramsčiai kas 600 mm)",
        phase: "MEDINIS KARKASAS",
        days: "3-4 d.",
        keyMaterials: "C24 50x150/200 mm tašai, dvigubas viršutinis bėgis, medsraigčiai 5x90",
        instructions: "Statramsčiai montuojami tiksliu 600 mm ašiniu žingsniu pagal vatos plotį. Langų ir durų angose įrengiami laieji balkiai (Headers) ir statramsčių poros.",
        proTip: "💡 Kampuose naudokite 'California Corner' sistemą, kad liktų vietos pilnam kampo apšiltinimui.",
        isCritical: false
      },
      {
        step: 7,
        title: "7. Vidaus Kambarių & WC Pertvarų Karkasas",
        phase: "KAMBARIŲ IŠPLANAVIMAS",
        days: "2-3 d.",
        keyMaterials: "C24 50x100 / CW profiliai, akustinė juosta, durų angos",
        instructions: "Pagal suderintą planą surenkamos miegamųjų, svetainės, WC ir katilinės pertvaros su paliktomis standartinėmis 900x2100 mm durų angomis.",
        proTip: "💡 Po visais pertvarų bėgiais klijuokite akustinę tarpinę – tai neleis garso bangoms keliauti per grindis.",
        isCritical: false
      },
      {
        step: 8,
        title: "8. Perdanga & Lubų Karkasas (50x220 mm)",
        phase: "PERDANGA",
        days: "2 d.",
        keyMaterials: "C24 50x220 mm sijos kas 400 mm, OSB-3 22mm liežuvėlis-griovelis",
        instructions: "Perdangos sijos montuojamos ant viršutinio bėgio, standinamos skersiniais blokais ties atramomis ir paklojamas liežuvėlio-griovelio OSB paklotas.",
        proTip: "💡 OSB plokščių siūles suklijuokite D4 klijais – grindys niekada negurgždės.",
        isCritical: false
      },
      {
        step: 9,
        title: "9. Stogo Santvara, Kraigas & Gegnės (Eurocode 5)",
        phase: "STOGO STRUKTŪRA",
        days: "3-4 d.",
        keyMaterials: "C24 50x200 mm gegnės, 90x90 kampuočiai su briauna, stygos M12",
        instructions: "Gegnėse išpjaunami 'Birdsmouth' atraminiai įkirtimai (iki 50 mm), gegnės tvirtinamos prie mūrloto ir suveržiamos stygomis ties 0.55H aukščiu.",
        proTip: "⚠️ Tvirtinkite TIK sertifikuotomis rievėtomis ankerinėmis vinimis 4.0x40 mm arba konstrukciniais medsraigčiais.",
        isCritical: true
      },
      {
        step: 10,
        title: "10. Difuzinė Membrana, Tašeliai & Grebėstai",
        phase: "STOGO SANDARINIMAS",
        days: "2 d.",
        keyMaterials: "Membrana 150g, išilginiai tašeliai 25x50, grebėstai 25x100 kas 350mm",
        instructions: "Nuo karnizo link kraigo klojama difuzinė plėvelė su 150 mm užlaida, kalamas išilginis ventiliacinis tašelis ir horizontalūs grebėstai.",
        proTip: "💡 Ventiliacinis tarpas po danga BŪTINAS bent 50 mm, kad vasarą stogas neperkaistų, o žiemą pasišalintų drėgmė.",
        isCritical: false
      },
      {
        step: 11,
        title: "11. Stogo Dangos Montavimas & Lietaus Sistema",
        phase: "STOGO DANGA",
        days: "2-3 d.",
        keyMaterials: "Plieninė skarda RAL 7016, kraigai, latakai, lietvamzdžiai",
        instructions: "Prisukama stogo danga su EPDM sandarinimo poveržlėmis, sumontuojami vėjalenčių, kraigo lankstiniai ir pakabinama lietaus nuvedimo sistema.",
        proTip: "⚠️ Plieno skardą pjaukite TIK specialiomis skardos žirklėmis ar nibleriu – NIEKADA nenaudokite kampinio šlifuoklio (fleksiuko)!",
        isCritical: true
      },
      {
        step: 12,
        title: "12. A++ Langų & Lauko Durų Šiltas Montavimas",
        phase: "IŠORĖS SANDARUMAS",
        days: "2 d.",
        keyMaterials: "3 stiklų A++ langai, garo/vėjo izoliacinės juostos, elastinės putos",
        instructions: "Langai montuojami į šiltinimo sluoksnį su kronšteinais, sandarinami specialiomis garui nelaidžiomis juostomis iš vidaus ir difuzinėmis iš išorės.",
        proTip: "💡 Trigubas sandarinimas (juosta-puta-juosta) užtikrina, kad lango perimetras neperšaltų ir nerasotų.",
        isCritical: true
      },
      {
        step: 13,
        title: "13. A++ Šiltinimas (350 mm) & Garo Izoliacijos Sandarinimas",
        phase: "TERMOIZOLIACIJA",
        days: "3-5 d.",
        keyMaterials: "Mineralinė vata Knauf/Paroc, garo plėvelė Sd=100m, Gerband juosta",
        instructions: "Glaudžiai įspraudžiama vata be jokių tarpų (persidengiantys sluoksniai), iš vidaus montuojama ištisinė garo plėvelė, visos siūlės ir kabelių perėjimai užklijuojami.",
        proTip: "⚠️ Šiame etape atliekamas sandarumo testas (Blower-Door testas n50 ≤ 0.6 h⁻¹ pagal A++ reikalavimą).",
        isCritical: true
      },
      {
        step: 14,
        title: "14. Elektros, Nuotekų & Grindinio Šildymo Išvedžiojimas",
        phase: "VIDAUS INŽINERIJA",
        days: "4-6 d.",
        keyMaterials: "Kabeliai 3x2.5/3x1.5, PEX šildymo vamzdžiai, Geberit rėmai, kolektorius",
        instructions: "Instaliaciniame 50 mm tašelyje išvedžiojami kabeliai, pajungiami WC potinkiniai rėmai, išvedžiojamas grindinis šildymas ir užpilamas smėlbetonis.",
        proTip: "💡 Užpylus betonines grindis, leiskite joms natūraliai džiūti bent 28 dienas prieš paleidžiant šildymą!",
        isCritical: false
      },
      {
        step: 15,
        title: "15. Gipskartonis, Apdaila, Vidaus Durys & Raktų Įteikimas",
        phase: "GALUTINĖ APDAILA",
        days: "7-10 d.",
        keyMaterials: "Knauf gipsas, Uniflott glaistas, dažai, durys, vonios plytelės, laminatas",
        instructions: "Prisukamas gipskartonis, armuojamos siūlės stiklo audinio juosta, atliekamas glaistymas, dažymas, sudedamos plytelės, grindys ir sumontuojamos vidaus durys.",
        proTip: "🎉 SVEIKINAME! Jūsų kokybiškas, A++ energinės klasės namas yra 100% pastatytas pagal visus Eurokodo standartus!",
        isCritical: false
      }
    ];
  }
}

if (typeof window !== "undefined") {
  window.FullHouseMasterEngine = FullHouseMasterEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = FullHouseMasterEngine;
}
