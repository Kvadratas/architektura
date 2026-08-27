/**
 * ARCHITEKTŪRA - Structural Engineering & Geotechnical Foundation Calculator
 * Compliant with Eurocode 7 (LST EN 1997) & Eurocode 1 (LST EN 1991)
 * Calculates Total Building Weight (Dead + Live + Snow + Wind Loads), 
 * Geotechnical Pile Bearing Capacity, Pile Count, Diameter, Depth, Rebar & Concrete Volumes.
 */

class FoundationEngine {
  constructor() {
    // Soil types with characteristic base resistance qb (kPa) and shaft friction fs (kPa)
    this.soilTypes = {
      gravel: {
        name: "Žvyras / Stambus smėlis (Tvirtas)",
        qb: 350, // kPa
        fs: 35,  // kPa
        bearingCapacity: 280 // kPa
      },
      sand_loam: {
        name: "Priesmėlis / Vidutinio stambumo smėlis (Standartas)",
        qb: 240,
        fs: 25,
        bearingCapacity: 200
      },
      clay: {
        name: "Priemolis / Plastinis molis (Vidutinis)",
        qb: 160,
        fs: 18,
        bearingCapacity: 140
      },
      soft_peat: {
        name: "Minkštas gruntas / Durpės / Supiltinis (Silpnas)",
        qb: 90,
        fs: 10,
        bearingCapacity: 80
      }
    };

    // Lithuanian snow zone characteristics (STR 2.05.04:2003 / Eurocode 1)
    this.snowZoneSk = 1.6; // kN/m2 (~160 kg/m2)
    this.windZoneQp = 0.55; // kN/m2
    this.floorLiveLoad = 1.5; // kN/m2 (gyvenamosioms patalpoms)
    this.frostDepthLT = 1.30; // m (Standartinis įšalo gylis Lietuvoje: 1.2-1.4m)
  }

  /**
   * Complete Building Load & Foundation Calculation
   * @param {Object} params - House geometry & timber parts
   */
  calculate({
    foundationType = "piles", // 'piles' or 'strip' or 'slab'
    houseLengthM = 12.0,
    houseWidthM = 8.0,
    wallHeightM = 2.8,
    roofPitchDeg = 30,
    roofOverhangM = 0.6,
    soilKey = "sand_loam",
    timberVolumeM3 = 0,
    roofCladdingType = "steel", // 'steel' (5 kg/m2) or 'tile' (45 kg/m2)
    customPileDepthM = 0,
    customPileDiamMm = 0
  }) {
    const soil = this.soilTypes[soilKey] || this.soilTypes.sand_loam;

    // 1. Geometric Dimensions
    const footprintAreaM2 = houseLengthM * houseWidthM;
    const perimeterM = (houseLengthM + houseWidthM) * 2;
    const rad = (roofPitchDeg * Math.PI) / 180;
    const roofSlopeLengthM = (houseWidthM / 2 / Math.cos(rad)) + roofOverhangM;
    const totalRoofAreaM2 = roofSlopeLengthM * 2 * (houseLengthM + 2 * roofOverhangM);

    // 2. DEAD LOADS (Nuolatinės apkrovos - G)
    // Timber frame & roof structure weight (kN)
    const timberMassKg = (timberVolumeM3 || 12.5) * 460; // 460 kg/m3 C24
    const timberWeightKN = (timberMassKg * 9.81) / 1000;

    // Roof cladding + battens + underlay weight
    const claddingKgM2 = roofCladdingType === "tile" ? 50 : 8.5; // kg/m2
    const roofCladdingWeightKN = (totalRoofAreaM2 * claddingKgM2 * 9.81) / 1000;

    // Wall insulation (mineral wool 150-200mm) + plasterboard / timber siding
    const wallAreaM2 = perimeterM * wallHeightM;
    const wallMaterialsWeightKN = (wallAreaM2 * 35 * 9.81) / 1000; // ~35 kg/m2

    // Floor joists & subfloor decking (OSB + flooring)
    const floorDeckWeightKN = (footprintAreaM2 * 30 * 9.81) / 1000;

    const totalDeadLoadKN = timberWeightKN + roofCladdingWeightKN + wallMaterialsWeightKN + floorDeckWeightKN;

    // 3. LIVE & ENVIRONMENTAL LOADS (Kintamosios apkrovos - Q & S & W)
    // Snow Load on roof (S = mu * sk * A_proj)
    const snowShapeFactor = roofPitchDeg <= 30 ? 0.8 : Math.max(0, 0.8 * ((60 - roofPitchDeg) / 30));
    const snowLoadKN = this.snowZoneSk * snowShapeFactor * (houseWidthM * houseLengthM);

    // Live Load on floor (Q_floor)
    const floorLiveLoadKN = this.floorLiveLoad * footprintAreaM2;

    // Wind Load on walls and roof
    const windLoadKN = this.windZoneQp * (wallAreaM2 * 0.5 + totalRoofAreaM2 * 0.4);

    // 4. DESIGN LOAD COMBINATION (Ribinis saugos derinys pagal Eurokodą: 1.35*G + 1.5*Q)
    const totalCharacteristicWeightKN = totalDeadLoadKN + snowLoadKN + floorLiveLoadKN + windLoadKN;
    const totalCharacteristicMassTons = (totalCharacteristicWeightKN * 1000) / 9.81 / 1000;

    const designLoadEd_KN = (1.35 * totalDeadLoadKN) + (1.5 * (snowLoadKN + floorLiveLoadKN + windLoadKN));

    // 5. PILE / FOUNDATION SPECIFICATIONS CALCULATION
    if (foundationType === "piles") {
      return this.calculatePilesSolution({
        houseLengthM,
        houseWidthM,
        perimeterM,
        footprintAreaM2,
        soil,
        designLoadEd_KN,
        totalCharacteristicMassTons,
        totalDeadLoadKN,
        snowLoadKN,
        customPileDepthM,
        customPileDiamMm
      });
    } else if (foundationType === "piles_no_rostverk") {
      return this.calculatePilesNoRostverkSolution({
        houseLengthM,
        houseWidthM,
        perimeterM,
        footprintAreaM2,
        soil,
        designLoadEd_KN,
        totalCharacteristicMassTons,
        totalDeadLoadKN,
        snowLoadKN,
        customPileDepthM,
        customPileDiamMm
      });
    } else {
      return this.calculateStripOrSlabSolution({
        foundationType,
        houseLengthM,
        houseWidthM,
        perimeterM,
        footprintAreaM2,
        soil,
        designLoadEd_KN,
        totalCharacteristicMassTons
      });
    }
  }

  /**
   * Geotechnical Bore Pile Solution WITHOUT Concrete Rostverkas
   * (Elevated House on Structural Pile Grid with Heavy Timber Girders)
   */
  calculatePilesNoRostverkSolution({
    houseLengthM,
    houseWidthM,
    perimeterM,
    footprintAreaM2,
    soil,
    designLoadEd_KN,
    totalCharacteristicMassTons,
    totalDeadLoadKN,
    snowLoadKN,
    customPileDepthM,
    customPileDiamMm
  }) {
    let pileDepthM = customPileDepthM > 0 ? customPileDepthM : (soil.qb < 150 ? 2.5 : 2.0);
    pileDepthM = Math.max(1.8, pileDepthM);

    let pileDiamMm = customPileDiamMm > 0 ? customPileDiamMm : 300;
    const pileDiamM = pileDiamMm / 1000;
    const pileBaseAreaM2 = (Math.PI * Math.pow(pileDiamM, 2)) / 4;
    const pileCircumferenceM = Math.PI * pileDiamM;

    const baseResistanceKN = pileBaseAreaM2 * soil.qb;
    const effectiveShaftLengthM = Math.max(0.5, pileDepthM - this.frostDepthLT);
    const shaftResistanceKN = pileCircumferenceM * effectiveShaftLengthM * soil.fs;
    const totalSinglePileResistanceKN = (baseResistanceKN + shaftResistanceKN) / 1.4;
    const singlePileCapacityTons = (totalSinglePileResistanceKN * 1000) / 9.81 / 1000;

    // Without a rigid concrete rostverkas, timber girders can span max 1.3 - 1.5 m between piles
    const maxGridSpacingM = 1.4;
    const gridLinesLength = Math.ceil(houseLengthM / maxGridSpacingM) + 1;
    const gridLinesWidth = Math.ceil(houseWidthM / maxGridSpacingM) + 1;

    // Perimeter piles + Internal Room & Partition Point Piles
    const perimeterPilesCount = (gridLinesLength * 2) + ((gridLinesWidth - 2) * 2);
    const internalRoomPilesCount = (gridLinesLength - 2) * (gridLinesWidth - 2);
    const totalPilesCount = perimeterPilesCount + internalRoomPilesCount;

    const singlePileVolM3 = pileBaseAreaM2 * pileDepthM;
    const totalPilesConcreteM3 = singlePileVolM3 * totalPilesCount;

    // Pile reinforcement: 4x Ø12mm + stirrups
    const pileRebarWeightKg = Math.round(totalPilesCount * ((4 * (pileDepthM + 0.3) * 0.888) + ((pileDepthM / 0.2) * (Math.PI * (pileDiamM - 0.08)) * 0.222)));

    // Heavy Timber Bearer Girder Grid (150x200 mm or Triple 50x200 C24)
    const bearerLengthM = Math.round(perimeterM + (houseLengthM * (gridLinesWidth - 2)) + (houseWidthM * 2));
    const bearerTimberM3 = (bearerLengthM * 0.15 * 0.20).toFixed(2);

    return {
      foundationType: "piles_no_rostverk",
      foundationTitle: "Pakeltas Namas ant Polių BE Rostverko (Post-and-Beam)",
      soilName: soil.name,
      metrics: {
        totalBuildingMassTons: totalCharacteristicMassTons.toFixed(1),
        totalDesignLoadKN: designLoadEd_KN.toFixed(1),
        singlePileCapacityTons: singlePileCapacityTons.toFixed(1),
        singlePileResistanceKN: totalSinglePileResistanceKN.toFixed(1),
        totalPilesCount,
        perimeterPilesCount,
        internalRoomPilesCount,
        pileDiameterMm: pileDiamMm,
        pileDepthM: pileDepthM.toFixed(2),
        pileSpacingM: maxGridSpacingM.toFixed(2),
        frostDepthSafeM: this.frostDepthLT,
        pilesConcreteM3: totalPilesConcreteM3.toFixed(2),
        rostverkConcreteM3: "0.00",
        totalConcreteM3: totalPilesConcreteM3.toFixed(2),
        totalRebarKg: pileRebarWeightKg,
        bearerLengthM,
        bearerTimberM3,
        steelBracketsCount: totalPilesCount
      },
      specifications: [
        { label: "Pamatų sistema:", val: "Taškiniai gręžtiniai poliai su cinkuotais U-ankeriais BE betoninio rostverko" },
        { label: "Polių skaičius ir tankumas:", val: `Iš viso: ${totalPilesCount} vnt. (Išorinis perimetras: ${perimeterPilesCount} vnt., Po kambariais ir WC: ${internalRoomPilesCount} vnt.)` },
        { label: "Polių žingsnis:", val: `Tinklas kas ${maxGridSpacingM.toFixed(2)} m (maksimalus leistinas medinių sijų tarpatramis)` },
        { label: "Medinis aprišamasis padas:", val: `Dvigubas/Trigubas C24 150x200 mm s设立 aprišimas (${bearerLengthM} m, ${bearerTimberM3} m³)` },
        { label: "Polių galvutės tvirtinimas:", val: `${totalPilesCount} vnt. karštai cinkuotų reguliuojamų U-formos ankerių M20/M24` },
        { label: "Pogrindžio vėdinimas ir apsauga:", val: "Pakeltas vėdinamas oro tarpas (300-500 mm virš žemės), nerūdijančio plieno tinklelis nuo graužikų" }
      ]
    };
  }

  /**
   * Geotechnical Bore Pile & Rostverkas Engineering
   */
  calculatePilesSolution({
    houseLengthM,
    houseWidthM,
    perimeterM,
    footprintAreaM2,
    soil,
    designLoadEd_KN,
    totalCharacteristicMassTons,
    totalDeadLoadKN,
    snowLoadKN,
    customPileDepthM,
    customPileDiamMm
  }) {
    // Optimal Pile Depth: must be below frost depth (1.3m) + embed into load-bearing strata (min 1.8 - 2.5m)
    let pileDepthM = customPileDepthM > 0 ? customPileDepthM : (soil.qb < 150 ? 2.5 : 2.0);
    pileDepthM = Math.max(1.8, pileDepthM); // Minimum 1.8m safety limit

    // Optimal Pile Diameter: 250 mm or 300 mm or 350 mm
    let pileDiamMm = customPileDiamMm > 0 ? customPileDiamMm : 300;
    const pileDiamM = pileDiamMm / 1000;
    const pileBaseAreaM2 = (Math.PI * Math.pow(pileDiamM, 2)) / 4;
    const pileCircumferenceM = Math.PI * pileDiamM;

    // Single Pile Geotechnical Resistance (Eurocode 7)
    // Base resistance (Rb) + Shaft friction (Rs)
    const baseResistanceKN = pileBaseAreaM2 * soil.qb;
    const effectiveShaftLengthM = Math.max(0.5, pileDepthM - this.frostDepthLT); // Only friction below frost depth is reliable
    const shaftResistanceKN = pileCircumferenceM * effectiveShaftLengthM * soil.fs;

    const totalSinglePileResistanceKN = (baseResistanceKN + shaftResistanceKN) / 1.4; // Safety factor 1.4
    const singlePileCapacityTons = (totalSinglePileResistanceKN * 1000) / 9.81 / 1000;

    // Pile Count by Load Requirements
    const minPilesByLoad = Math.ceil(designLoadEd_KN / totalSinglePileResistanceKN);

    // Pile Count by Geometry (Max spacing 1.8 - 2.0m along perimeter + 4 corners + internal central axis)
    const maxSpacingM = 1.8;
    const lengthSidePiles = Math.ceil(houseLengthM / maxSpacingM) + 1;
    const widthSidePiles = Math.ceil(houseWidthM / maxSpacingM) + 1;
    const perimeterPilesCount = (lengthSidePiles * 2) + ((widthSidePiles - 2) * 2);

    // Internal spine piles for floor joists span support
    const internalSpinePiles = Math.ceil(houseLengthM / maxSpacingM) - 1;
    const minPilesByGeometry = perimeterPilesCount + Math.max(0, internalSpinePiles);

    const totalPilesCount = Math.max(minPilesByLoad, minPilesByGeometry);
    const averageSpacingM = perimeterM / perimeterPilesCount;

    // Concrete & Reinforcement Quantities
    // 1. Piles concrete volume
    const singlePileVolM3 = pileBaseAreaM2 * pileDepthM;
    const totalPilesConcreteM3 = singlePileVolM3 * totalPilesCount;

    // 2. Rostverkas (Ground Beam) Dimensions: 300 mm width x 400 mm height
    const rostverkWidthM = 0.30;
    const rostverkHeightM = 0.40;
    const rostverkLengthM = perimeterM + (houseLengthM - rostverkWidthM); // perimeter + central beam
    const rostverkConcreteM3 = rostverkLengthM * rostverkWidthM * rostverkHeightM;

    const totalConcreteVolumeM3 = totalPilesConcreteM3 + rostverkConcreteM3;

    // 3. Reinforcement (Armatūra A500HW)
    // Pile cages: 4 longitudinal bars Ø 12 mm + stirrups Ø 6 mm every 200 mm
    const pileRebarWeightKg = totalPilesCount * ((4 * (pileDepthM + 0.5) * 0.888) + ((pileDepthM / 0.2) * (Math.PI * (pileDiamM - 0.08)) * 0.222));
    // Rostverkas rebar: 4x Ø 12 mm (top and bottom) + stirrups Ø 6 mm every 200 mm
    const rostverkRebarWeightKg = (4 * rostverkLengthM * 0.888) + ((rostverkLengthM / 0.2) * (2 * (rostverkWidthM + rostverkHeightM - 0.1)) * 0.222);
    const totalRebarWeightKg = Math.round(pileRebarWeightKg + rostverkRebarWeightKg);

    // EPS 100/200 insulation for Rostverk
    const epsInsulationM2 = rostverkLengthM * rostverkHeightM * 2; // both sides

    return {
      foundationType: "piles",
      foundationTitle: "Gręžtiniai Poliai su Gelžbetoniniu Rostverku",
      soilName: soil.name,
      metrics: {
        totalBuildingMassTons: totalCharacteristicMassTons.toFixed(1),
        totalDesignLoadKN: designLoadEd_KN.toFixed(1),
        singlePileCapacityTons: singlePileCapacityTons.toFixed(1),
        singlePileResistanceKN: totalSinglePileResistanceKN.toFixed(1),
        totalPilesCount,
        pileDiameterMm: pileDiamMm,
        pileDepthM: pileDepthM.toFixed(2),
        pileSpacingM: averageSpacingM.toFixed(2),
        frostDepthSafeM: this.frostDepthLT,
        pilesConcreteM3: totalPilesConcreteM3.toFixed(2),
        rostverkConcreteM3: rostverkConcreteM3.toFixed(2),
        totalConcreteM3: totalConcreteVolumeM3.toFixed(2),
        totalRebarKg: totalRebarWeightKg,
        epsInsulationM2: epsInsulationM2.toFixed(1),
        rostverkDimensions: `${(rostverkWidthM * 1000)} x ${(rostverkHeightM * 1000)} mm`
      },
      specifications: [
        { label: "Pamatų tipas:", val: "Gręžtiniai CFA / gręžtiniai poliai su monolitiniu rostverku" },
        { label: "Polių skaičius:", val: `${totalPilesCount} vnt. (Optimalus išdėstymas kas ${averageSpacingM.toFixed(2)} m)` },
        { label: "Polio skersmuo ir gylis:", val: `Ø ${pileDiamMm} mm, Gylis = ${pileDepthM.toFixed(2)} m (žemiau įšalo zonos)` },
        { label: "Rostverko matmenys:", val: `${(rostverkWidthM * 1000)} x ${(rostverkHeightM * 1000)} mm (Plotis x Aukštis)` },
        { label: "Betono klasė:", val: "C20/25 (XC2, W6, F100) atsparus drėgmei ir šalčiui" },
        { label: "Armatūra:", val: `Išilginė 4x Ø12 mm A500HW + Lankai Ø6 mm kas 200 mm (Iš viso: ${totalRebarWeightKg} kg)` },
        { label: "Polių sujungimas su rostverku:", val: "Armatūros išleidimai iš polio į rostverką ≥ 400 mm" },
        { label: "Kompensacinis paklotas po rostverku:", val: "50-100 mm ekstruzinis polistirenas (XPS) arba 100 mm oro tarpas" }
      ]
    };
  }

  /**
   * Strip / Slab Alternative Calculation
   */
  calculateStripOrSlabSolution({
    foundationType,
    houseLengthM,
    houseWidthM,
    perimeterM,
    footprintAreaM2,
    soil,
    designLoadEd_KN,
    totalCharacteristicMassTons
  }) {
    if (foundationType === "slab") {
      const slabThickM = 0.25;
      const slabConcreteM3 = footprintAreaM2 * slabThickM;
      const rebarKg = Math.round(footprintAreaM2 * 2 * (1000 / 150) * 0.617 * 2); // 2 meshes of Ø10 mm
      const xpsUnderSlabM2 = footprintAreaM2 * 1.05;

      return {
        foundationType: "slab",
        foundationTitle: "Plokštuminis Šiltintas Pamatas (Švediška Plokštė)",
        soilName: soil.name,
        metrics: {
          totalBuildingMassTons: totalCharacteristicMassTons.toFixed(1),
          totalDesignLoadKN: designLoadEd_KN.toFixed(1),
          slabThicknessMm: Math.round(slabThickM * 1000),
          totalConcreteM3: slabConcreteM3.toFixed(2),
          totalRebarKg: rebarKg,
          epsInsulationM2: xpsUnderSlabM2.toFixed(1),
          soilBearingPressureKPa: (designLoadEd_KN / footprintAreaM2).toFixed(1)
        },
        specifications: [
          { label: "Pamatų tipas:", val: "Monolitinė gelžbetoninė plokštė ant ekstruzinio polistireno (XPS 300)" },
          { label: "Plokštės storis:", val: `${Math.round(slabThickM * 1000)} mm (C25/30 betonas)` },
          { label: "Armavimas:", val: `Dvigubas armatūros tinklas Ø 10 mm kas 150x150 mm (${rebarKg} kg)` },
          { label: "Šilumos izoliacija:", val: `200-300 mm XPS 300 po visa plokšte (${xpsUnderSlabM2.toFixed(1)} m²)` }
        ]
      };
    } else {
      // Strip Foundation
      const stripWidthM = 0.40;
      const stripDepthM = 1.40; // below frost line
      const stripConcreteM3 = perimeterM * stripWidthM * stripDepthM;
      const rebarKg = Math.round(perimeterM * 6 * 0.888 + (perimeterM / 0.25) * 1.8 * 0.222);

      return {
        foundationType: "strip",
        foundationTitle: "Monolitinis Juostinis Pamatas",
        soilName: soil.name,
        metrics: {
          totalBuildingMassTons: totalCharacteristicMassTons.toFixed(1),
          totalDesignLoadKN: designLoadEd_KN.toFixed(1),
          stripWidthMm: Math.round(stripWidthM * 1000),
          stripDepthM: stripDepthM.toFixed(2),
          totalConcreteM3: stripConcreteM3.toFixed(2),
          totalRebarKg: rebarKg
        },
        specifications: [
          { label: "Pamatų tipas:", val: "Monolitinis gelžbetoninis juostinis pamatas žemiau įšalo zonos" },
          { label: "Juostos gylis:", val: `${stripDepthM.toFixed(2)} m (Plotis ${Math.round(stripWidthM * 1000)} mm)` },
          { label: "Betono tūris:", val: `${stripConcreteM3.toFixed(2)} m³ (C20/25 betonas)` },
          { label: "Armavimas:", val: `Išilginė armatūra 6x Ø 12 mm + lankai Ø 6 mm kas 250 mm (${rebarKg} kg)` }
        ]
      };
    }
  }
}

if (typeof window !== "undefined") {
  window.FoundationEngine = FoundationEngine;
}
