/**
 * ARCHITEKTŪRA - Real-Time Structural FEA (Finite Element Analysis) & Stress Heatmap Engine
 * Compliant with Eurocode 5 (LST EN 1995-1-1: Medinių konstrukcijų projektavimas) & Eurocode 1 (LST EN 1991-1-3: Sniego apkrovos)
 * Calculates Bending Moments (M), Bending Stress (σ), Shear Stress (τ), Deflection (w_inst, w_fin), and Eurocode 5 Verification.
 */

class StructuralFEAEngine {
  constructor() {
    // Standard Timber Mechanical Properties (LST EN 338 / LST EN 14080)
    this.timberClasses = {
      C18: {
        name: "C18 Statybinė mediena",
        fmk: 18.0, // Characteristic bending (MPa)
        fmd: 11.08, // Design bending (kmod=0.8, gamma_M=1.3)
        fvk: 3.4,  // Characteristic shear (MPa)
        fvd: 2.09,
        E0mean: 9000, // Mean Elastic Modulus (MPa)
        Gmean: 560,
        density: 380 // kg/m3
      },
      C24: {
        name: "C24 Kalibruota konstrukcinė mediena (Standartas)",
        fmk: 24.0,
        fmd: 14.77,
        fvk: 4.0,
        fvd: 2.46,
        E0mean: 11000,
        Gmean: 690,
        density: 420
      },
      C30: {
        name: "C30 Aukščiausios klasės mediena",
        fmk: 30.0,
        fmd: 18.46,
        fvk: 4.0,
        fvd: 2.46,
        E0mean: 12000,
        Gmean: 750,
        density: 460
      },
      GL24h: {
        name: "GL24h Klijuota dvitėjinė / Glulam mediena",
        fmk: 24.0,
        fmd: 15.38, // gamma_M=1.25 for glulam
        fvk: 3.5,
        fvd: 2.24,
        E0mean: 11500,
        Gmean: 720,
        density: 420
      },
      GL28h: {
        name: "GL28h Pramoninė klijuota mediena",
        fmk: 28.0,
        fmd: 17.92,
        fvk: 3.5,
        fvd: 2.24,
        E0mean: 12600,
        Gmean: 780,
        density: 450
      }
    };

    // Deflection limits (Eurocode 5 Table 7.2)
    this.deflectionLimits = {
      w_inst: 300, // L / 300 (momentinis įlinkis)
      w_fin: 200,  // L / 200 (galutinis įlinkis su valkšnumu k_def)
      k_def: 0.60  // Service Class 1 / 2 timber creep coefficient
    };
  }

  /**
   * Analyze Rafter Structural Capacity & Stress
   */
  analyzeRafter({
    spanM = 4.0,
    spacingM = 0.6,
    pitchDeg = 30,
    widthMm = 50,
    heightMm = 200,
    timberClass = "C24",
    snowLoadKNm2 = 1.6, // Lithuania standard zone (1.2 - 2.0 kN/m2)
    deadLoadKNm2 = 0.65, // Cladding + battens + rafters + insulation
    windLoadKNm2 = 0.35
  }) {
    const wood = this.timberClasses[timberClass] || this.timberClasses.C24;
    const rad = (pitchDeg * Math.PI) / 180;
    
    // Cross-section geometric properties
    const b = widthMm; // mm
    const h = heightMm; // mm
    const areaA = b * h; // mm2
    const sectionModulusW = (b * Math.pow(h, 2)) / 6; // mm3
    const momentOfInertiaI = (b * Math.pow(h, 3)) / 12; // mm4

    // Actual slope length of the rafter span
    const slopeSpanL = (spanM / Math.cos(rad)) * 1000; // mm

    // Design ultimate combination load perpendicular to rafter axis (Eurocode 0/1: 1.35*G + 1.5*S + 1.5*0.6*W)
    const q_surface_d = (1.35 * deadLoadKNm2) + (1.5 * snowLoadKNm2 * Math.pow(Math.cos(rad), 2)) + (1.5 * 0.6 * windLoadKNm2);
    const q_d = q_surface_d * spacingM; // N/mm (kN/m = N/mm)

    // Characteristic serviceability load for deflection
    const q_surface_k = deadLoadKNm2 + (snowLoadKNm2 * Math.pow(Math.cos(rad), 2));
    const q_k = q_surface_k * spacingM; // N/mm

    // 1. Max Bending Moment (M_Ed in N*mm)
    const M_Ed = (q_d * Math.pow(slopeSpanL, 2)) / 8; // N*mm

    // 2. Max Bending Stress (sigma_m_d in MPa / N/mm2)
    const sigma_m_d = M_Ed / sectionModulusW;

    // 3. Max Shear Force (V_Ed) and Shear Stress (tau_d in MPa)
    const V_Ed = (q_d * slopeSpanL) / 2; // N
    const k_cr = 0.67; // Eurocode 5 crack modification factor
    const tau_d = (1.5 * V_Ed) / (k_cr * areaA); // MPa

    // 4. Elastic Instantaneous Deflection (w_inst in mm)
    const w_inst = (5 * q_k * Math.pow(slopeSpanL, 4)) / (384 * wood.E0mean * momentOfInertiaI);
    const w_limit_inst = slopeSpanL / this.deflectionLimits.w_inst; // L / 300

    // 5. Final Net Deflection with Creep (w_fin in mm)
    const w_fin = w_inst * (1 + this.deflectionLimits.k_def);
    const w_limit_fin = slopeSpanL / this.deflectionLimits.w_fin; // L / 200

    // 6. Utilization Ratios (%)
    const bendingUtil = (sigma_m_d / wood.fmd) * 100;
    const shearUtil = (tau_d / wood.fvd) * 100;
    const deflInstUtil = (w_inst / w_limit_inst) * 100;
    const deflFinUtil = (w_fin / w_limit_fin) * 100;
    const maxUtilization = Math.max(bendingUtil, shearUtil, deflInstUtil, deflFinUtil);

    return {
      elementName: "Gegnė (Rafter)",
      timberClass: wood.name,
      dimensions: `${b}x${h} mm`,
      spanM: (slopeSpanL / 1000).toFixed(2),
      M_Ed_kNm: (M_Ed / 1e6).toFixed(2),
      V_Ed_kN: (V_Ed / 1e3).toFixed(2),
      sigma_m_MPa: sigma_m_d.toFixed(2),
      sigma_limit_MPa: wood.fmd.toFixed(2),
      tau_d_MPa: tau_d.toFixed(2),
      tau_limit_MPa: wood.fvd.toFixed(2),
      w_inst_mm: w_inst.toFixed(1),
      w_limit_inst_mm: w_limit_inst.toFixed(1),
      w_fin_mm: w_fin.toFixed(1),
      w_limit_fin_mm: w_limit_fin.toFixed(1),
      bendingUtilPct: bendingUtil.toFixed(1),
      shearUtilPct: shearUtil.toFixed(1),
      deflectionUtilPct: deflInstUtil.toFixed(1),
      utilizationPct: maxUtilization.toFixed(1),
      isSafe: maxUtilization <= 100,
      colorHex: this.getStressColor(maxUtilization),
      colorCss: this.getStressColorCss(maxUtilization),
      recommendation: this.getRecommendation(maxUtilization, b, h, slopeSpanL / 1000)
    };
  }

  /**
   * Analyze Floor Joist Structural Capacity
   */
  analyzeFloorJoist({
    spanM = 4.5,
    spacingM = 0.6,
    widthMm = 50,
    heightMm = 200,
    timberClass = "C24",
    imposedLoadKNm2 = 2.0, // Residential live load (Eurocode 1)
    deadLoadKNm2 = 0.75
  }) {
    const wood = this.timberClasses[timberClass] || this.timberClasses.C24;
    const b = widthMm;
    const h = heightMm;
    const areaA = b * h;
    const W = (b * Math.pow(h, 2)) / 6;
    const I = (b * Math.pow(h, 3)) / 12;
    const L = spanM * 1000;

    const q_d = ((1.35 * deadLoadKNm2) + (1.5 * imposedLoadKNm2)) * spacingM;
    const q_k = (deadLoadKNm2 + imposedLoadKNm2) * spacingM;

    const M_Ed = (q_d * Math.pow(L, 2)) / 8;
    const sigma_m_d = M_Ed / W;
    const V_Ed = (q_d * L) / 2;
    const tau_d = (1.5 * V_Ed) / (0.67 * areaA);

    const w_inst = (5 * q_k * Math.pow(L, 4)) / (384 * wood.E0mean * I);
    const w_limit_inst = L / 350; // Higher comfort limit for floors (L/350)

    const bendingUtil = (sigma_m_d / wood.fmd) * 100;
    const deflUtil = (w_inst / w_limit_inst) * 100;
    const maxUtilization = Math.max(bendingUtil, deflUtil);

    return {
      elementName: "Perdangos sija (Floor Joist)",
      dimensions: `${b}x${h} mm`,
      spanM: spanM.toFixed(2),
      sigma_m_MPa: sigma_m_d.toFixed(2),
      w_inst_mm: w_inst.toFixed(1),
      w_limit_inst_mm: w_limit_inst.toFixed(1),
      utilizationPct: maxUtilization.toFixed(1),
      isSafe: maxUtilization <= 100,
      colorHex: this.getStressColor(maxUtilization),
      colorCss: this.getStressColorCss(maxUtilization)
    };
  }

  /**
   * Get Color Hex for 3D Heatmap Shader
   */
  getStressColor(utilizationPct) {
    if (utilizationPct < 45) {
      return 0x22c55e; // Green (Safe, <45%)
    } else if (utilizationPct < 75) {
      return 0xeab308; // Yellow (Optimal, 45-75%)
    } else if (utilizationPct <= 100) {
      return 0xf97316; // Orange (Near limit, 75-100%)
    } else {
      return 0xef4444; // Red (Overloaded, >100%)
    }
  }

  getStressColorCss(utilizationPct) {
    if (utilizationPct < 45) return "#22c55e";
    if (utilizationPct < 75) return "#eab308";
    if (utilizationPct <= 100) return "#f97316";
    return "#ef4444";
  }

  /**
   * Universal FEA Calculation method (Eurocode 5)
   */
  calculate({
    spanM = 4.0,
    spacingM = 0.6,
    pitchDeg = 30,
    widthMm = 50,
    heightMm = 200,
    timberClass = "C24",
    snowLoadKNm2 = 1.6,
    deadLoadKNm2 = 0.65,
    windLoadKNm2 = 0.35
  } = {}) {
    const res = this.analyzeRafter({
      spanM,
      spacingM,
      pitchDeg,
      widthMm,
      heightMm,
      timberClass,
      snowLoadKNm2,
      deadLoadKNm2,
      windLoadKNm2
    });

    return {
      ...res,
      momentMedKNm: parseFloat(res.M_Ed_kNm),
      sigmaMdMPa: parseFloat(res.sigma_m_MPa),
      wFinMm: parseFloat(res.w_fin_mm),
      statusText: res.recommendation
    };
  }

  getRecommendation(utilizationPct, b, h, spanM) {
    if (utilizationPct > 125) {
      return `🛑 KRITINĖ PERKROVA (${utilizationPct.toFixed(0)}%)! Konstrukcija neišlaikys sniego/svorio apkrovų pagal Eurokodą 5. Būtina didinti aukštį į bent ${b}x${h + 50} mm arba montuoti tarpinę atraminę sieną / kraigo siją.`;
    } else if (utilizationPct > 100) {
      return `⚠️ PERKROVA (${utilizationPct.toFixed(0)}%)! Įlinkis f viršija leistiną L/300 normą (${(spanM * 1000 / 300).toFixed(0)} mm). Rekomenduojama padidinti gegnių aukštį į ${b}x${h + 50} mm arba sumažinti žingsnį iki 0.50 m.`;
    } else if (utilizationPct > 80) {
      return `🟡 Ribinis įtempimas (${utilizationPct.toFixed(0)}%). Konstrukcija atitinka Eurokodą 5, tačiau yra ties maksimalia saugumo riba.`;
    } else {
      return `✅ Saugu ir optimalu (${utilizationPct.toFixed(0)}%). Medienos laikomoji galia, šlytis ir įlinkis atitinka Eurokodo 5 (LST EN 1995-1-1) reikalavimus su atsarga.`;
    }
  }
}

if (typeof window !== "undefined") {
  window.StructuralFEAEngine = StructuralFEAEngine;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = StructuralFEAEngine;
}
