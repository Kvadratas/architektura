/**
 * ARCHITEKTŪRA - House Structural Timber Presets Engine
 * Calculates exact timber lengths and quantities based on architectural dimensions.
 */

const HousePresets = {
  /**
   * Roof Generator (Dvišlaitis stogas)
   */
  generateRoof({ spanM, pitchDeg, overhangM, lengthM, stepM, profile, includeTies, includeMurlot }) {
    const parts = [];
    const rad = (pitchDeg * Math.PI) / 180;
    
    // Half span
    const halfSpanM = spanM / 2;
    // Slope rafter length without overhang
    const slopeLengthM = halfSpanM / Math.cos(rad);
    // Total rafter length including eave overhang
    const totalRafterLenMm = Math.round((slopeLengthM + overhangM) * 1000);

    // Number of rafter pairs
    const pairsCount = Math.ceil(lengthM / stepM) + 1;
    const totalRafters = pairsCount * 2;

    parts.push({
      label: `Gegnė (L=${(totalRafterLenMm/1000).toFixed(2)}m, ∠${pitchDeg}°)`,
      profile: profile,
      length: totalRafterLenMm,
      quantity: totalRafters
    });

    // Collar ties (Stygos) - usually at 2/3 height or 1/2 height
    if (includeTies) {
      const tieSpanMm = Math.round((spanM * 0.6) * 1000);
      parts.push({
        label: `Styga / Suveržimas (L=${(tieSpanMm/1000).toFixed(2)}m)`,
        profile: "50x150",
        length: tieSpanMm,
        quantity: pairsCount
      });
    }

    // Murlots (Mūrlotai) - 2 sides along house length
    if (includeMurlot) {
      // Split into 4.0m or 6.0m segments or standard parts
      const murlotTotalLenMm = Math.round(lengthM * 1000);
      // We add 2 lines of murlots (left & right wall)
      parts.push({
        label: `Mūrlotas (Ilgis=${(murlotTotalLenMm/1000).toFixed(2)}m)`,
        profile: "100x150",
        length: murlotTotalLenMm,
        quantity: 2
      });
    }

    return parts;
  },

  /**
   * Wall Generator (Karkasinė siena)
   */
  generateWall({ totalLenM, heightM, stepM, profile, doubleTopPlate }) {
    const parts = [];
    
    // Studs height = Wall height minus plates thickness (typically 3 * 45mm or 50mm = 150mm)
    const plateThicknessMm = 50;
    const platesDeductionMm = doubleTopPlate ? (plateThicknessMm * 3) : (plateThicknessMm * 2);
    const studHeightMm = Math.round((heightM * 1000) - platesDeductionMm);

    // Studs count: main studs + corner doubles + partition intersections (approx +15% for doors/windows)
    const baseStuds = Math.ceil(totalLenM / stepM);
    const totalStuds = Math.round(baseStuds * 1.15) + 4;

    parts.push({
      label: `Sienos Statramstis (Aukštis=${(studHeightMm/1000).toFixed(2)}m)`,
      profile: profile,
      length: studHeightMm,
      quantity: totalStuds
    });

    // Bottom plate (Apatinis bėgis)
    const wallLenMm = Math.round(totalLenM * 1000);
    // Break total perimeter into manageable standard segment lengths (e.g., 4000mm or 6000mm)
    const plateSegLenMm = 4000;
    const bottomPlateCount = Math.ceil(wallLenMm / plateSegLenMm);

    parts.push({
      label: `Apatinis bėgis (Sole Plate)`,
      profile: profile,
      length: plateSegLenMm,
      quantity: bottomPlateCount
    });

    // Top plates (Viršutinis bėgis) - 1 or 2 layers
    const topPlateMultiplier = doubleTopPlate ? 2 : 1;
    parts.push({
      label: `Viršutinis bėgis (Top Plate)`,
      profile: profile,
      length: plateSegLenMm,
      quantity: bottomPlateCount * topPlateMultiplier
    });

    return parts;
  },

  /**
   * Floor Joists Generator (Perdangos sijos)
   */
  generateFloor({ spanM, widthM, stepM, profile }) {
    const parts = [];
    // Joist span + 2x bearing on walls (e.g., 2 x 150mm = 300mm)
    const joistLenMm = Math.round((spanM + 0.30) * 1000);
    const joistsCount = Math.ceil(widthM / stepM) + 1;

    parts.push({
      label: `Perdangos sija (L=${(joistLenMm/1000).toFixed(2)}m)`,
      profile: profile,
      length: joistLenMm,
      quantity: joistsCount
    });

    // Rim joists (Apvadinės kraštinės sijos)
    const rimLenMm = Math.round(widthM * 1000);
    parts.push({
      label: `Apvadinė perdangos sija (Rim Joist)`,
      profile: profile,
      length: rimLenMm,
      quantity: 2
    });

    return parts;
  },

  /**
   * Deck Framing Generator (Terasos karkasas)
   */
  generateDeck({ lenM, widthM, stepM, profile }) {
    const parts = [];
    const joistLenMm = Math.round(lenM * 1000);
    const joistsCount = Math.ceil(widthM / stepM) + 1;

    parts.push({
      label: `Terasos lagė (L=${(joistLenMm/1000).toFixed(2)}m)`,
      profile: profile,
      length: joistLenMm,
      quantity: joistsCount
    });

    // Perimeter boundary beams
    const rimLenMm = Math.round(widthM * 1000);
    parts.push({
      label: `Terasos apvadas (Kraštinė)`,
      profile: profile,
      length: rimLenMm,
      quantity: 2
    });

    return parts;
  }
};

if (typeof window !== "undefined") {
  window.HousePresets = HousePresets;
  window.TimberPresets = HousePresets;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { HousePresets, TimberPresets: HousePresets };
}
