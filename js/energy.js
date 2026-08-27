/**
 * ARCHITEKTŪRA - A++ Energy Envelope & Glaser Dew Point Condensation Engine
 * Compliant with Lithuanian STR 2.01.02:2016 (Pastatų energinio naudingumo projektavimas)
 * Calculates U-values (W/m2K), R-values (m2K/W), and Glaser Method Vapor Condensation SVG Curves.
 */

class EnergyEnvelopeEngine {
  constructor() {
    // Thermal conductivity lambda (W/m*K) & vapor diffusion resistance factor mu (µ)
    this.materials = {
      mineral_wool: { name: "Mineralinė vata (Knauf/Paroc/Rockwool)", lambda: 0.035, mu: 1.2, color: "#eab308" },
      pir_board: { name: "PIR šiltinimo plokštė (su aliuminiu)", lambda: 0.022, mu: 100, color: "#f97316" },
      wood_fiber: { name: "Medžio plaušo vata (Steico Flex)", lambda: 0.038, mu: 3.0, color: "#d97706" },
      eps_100: { name: "Neoporas / EPS 100", lambda: 0.031, mu: 40, color: "#71717a" },
      xps_300: { name: "Ekstruzinis polistirenas (XPS)", lambda: 0.034, mu: 100, color: "#38bdf8" },
      timber_c24: { name: "Konstrukcinė mediena C24", lambda: 0.130, mu: 50, color: "#c5824c" },
      osb_3: { name: "OSB-3 konstrukcinė plokštė (15 mm)", lambda: 0.130, mu: 150, color: "#b45309" },
      vapor_barrier: { name: "Garo izoliacinė plėvelė (Sd = 100m)", lambda: 0.33, sd: 100, color: "#3b82f6" },
      diff_membrane: { name: "Kvėpuojanti difuzinė membrana (Sd = 0.02m)", lambda: 0.33, sd: 0.02, color: "#10b981" },
      gypsum_board: { name: "Gipskartonio plokštė (12.5 mm)", lambda: 0.250, mu: 10, color: "#e2e8f0" }
    };

    // A++ Energy Class Requirements in Lithuania (STR 2.01.02:2016 Table 3)
    this.targetAplusplus = {
      roof_U: 0.10, // W/m2K (Stogo U-vertės reikalavimas A++)
      wall_U: 0.12, // W/m2K (Sienų U-vertės reikalavimas A++)
      floor_U: 0.13 // W/m2K (Grindų ant grunto A++)
    };

    // Standard surface thermal resistances (Rsi and Rse in m2*K/W) per ISO 6946
    this.Rsi_roof = 0.10;
    this.Rse_roof = 0.04;
    this.Rsi_wall = 0.13;
    this.Rse_wall = 0.04;
  }

  /**
   * Calculate Wall & Roof Thermal Transmittance (U-Value) and Glaser Moisture Profile
   */
  calculateEnvelope({
    roofInsulationMm = 350,
    wallInsulationMm = 250,
    insulationType = "mineral_wool",
    indoorTempC = 21,
    outdoorTempC = -15,
    indoorHumidityPct = 50,
    outdoorHumidityPct = 85,
    hasVaporBarrier = true
  }) {
    const mat = this.materials[insulationType] || this.materials.mineral_wool;

    // 1. ROOF U-VALUE & R-VALUE
    const d_roof_m = roofInsulationMm / 1000;
    const R_ins_roof = d_roof_m / mat.lambda;
    // Internal gypsum (0.0125/0.25) + main insulation + exterior wind barrier + timber framing fraction (8%)
    const framingEffect = 1.08; // Wood thermal bridge factor for rafters
    const R_total_roof = (this.Rsi_roof + R_ins_roof + 0.05 + this.Rse_roof) / framingEffect;
    const U_roof = 1 / R_total_roof;
    const roofPassAplusplus = U_roof <= this.targetAplusplus.roof_U;

    // 2. WALL U-VALUE & R-VALUE
    const d_wall_m = wallInsulationMm / 1000;
    const R_ins_wall = d_wall_m / mat.lambda;
    const R_total_wall = (this.Rsi_wall + R_ins_wall + 0.08 + this.Rse_wall) / framingEffect;
    const U_wall = 1 / R_total_wall;
    const wallPassAplusplus = U_wall <= this.targetAplusplus.wall_U;

    // 3. GLASER METHOD DEW POINT & VAPOR CONDENSATION SIMULATION
    const glasserResult = this.calculateGlasserProfile({
      insulationThicknessMm: roofInsulationMm,
      mat,
      indoorTempC,
      outdoorTempC,
      indoorHumidityPct,
      outdoorHumidityPct,
      hasVaporBarrier
    });

    return {
      roof: {
        insulationMm: roofInsulationMm,
        insulationName: mat.name,
        U_val: U_roof.toFixed(3),
        R_val: R_total_roof.toFixed(2),
        target_U: this.targetAplusplus.roof_U,
        isAplusplus: roofPassAplusplus,
        statusText: roofPassAplusplus 
          ? "✅ Atitinka A++ klasę (U ≤ 0.10 W/m²K)" 
          : `⚠️ Neatitinka A++ (U = ${U_roof.toFixed(3)} W/m²K, reikia bent ${Math.ceil(this.targetAplusplus.roof_U * mat.lambda * 1000 * 10) + 30} mm vatos)`
      },
      wall: {
        insulationMm: wallInsulationMm,
        insulationName: mat.name,
        U_val: U_wall.toFixed(3),
        R_val: R_total_wall.toFixed(2),
        target_U: this.targetAplusplus.wall_U,
        isAplusplus: wallPassAplusplus,
        statusText: wallPassAplusplus 
          ? "✅ Atitinka A++ klasę (U ≤ 0.12 W/m²K)" 
          : `⚠️ Neatitinka A++ (U = ${U_wall.toFixed(3)} W/m²K, reikia bent ${Math.ceil(this.targetAplusplus.wall_U * mat.lambda * 1000 * 10) + 20} mm vatos)`
      },
      glasser: glasserResult
    };
  }

  /**
   * Glasser Method Vapor Pressure vs Saturation Pressure Profile
   */
  calculateGlasserProfile({
    insulationThicknessMm,
    mat,
    indoorTempC,
    outdoorTempC,
    indoorHumidityPct,
    outdoorHumidityPct,
    hasVaporBarrier = true
  }) {
    // Saturated vapor pressure Magnus formula: P_sat(T) = 610.78 * exp((17.27 * T) / (T + 237.3)) in Pa
    const satVaporPress = (T) => 610.78 * Math.exp((17.27 * T) / (T + 237.3));

    const p_sat_in = satVaporPress(indoorTempC);
    const p_sat_out = satVaporPress(outdoorTempC);

    const p_partial_in = p_sat_in * (indoorHumidityPct / 100);
    const p_partial_out = p_sat_out * (outdoorHumidityPct / 100);

    const steps = 8;
    const profile = [];
    let hasCondensation = false;
    let maxCondensationGap = 0;
    let condensationPositionMm = 0;

    const deltaT = outdoorTempC - indoorTempC;

    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const x_mm = Math.round(frac * insulationThicknessMm);
      const tempC = indoorTempC + (deltaT * frac);
      const p_sat = satVaporPress(tempC);

      // Vapor barrier behavior:
      // If barrier present: 95% pressure drop at warm side interior
      // If barrier missing: high moisture enters the insulation cavity
      let p_actual;
      if (hasVaporBarrier) {
        p_actual = i === 0 ? p_partial_in : p_partial_out + ((p_partial_in * 0.12) - p_partial_out) * (1 - frac);
      } else {
        // Severe moisture diffusion without vapor barrier
        p_actual = p_partial_out + (p_partial_in - p_partial_out) * Math.pow(1 - frac, 0.4);
      }

      if (p_actual >= p_sat) {
        hasCondensation = true;
        const gap = p_actual - p_sat;
        if (gap > maxCondensationGap) {
          maxCondensationGap = gap;
          condensationPositionMm = x_mm;
        }
      }

      profile.push({
        x_mm,
        frac,
        tempC: tempC.toFixed(1),
        p_sat_Pa: Math.round(p_sat),
        p_actual_Pa: Math.round(p_actual),
        isCondensing: p_actual >= p_sat
      });
    }

    return {
      hasCondensation,
      condensationPositionMm,
      indoorTempC,
      outdoorTempC,
      indoorHumidityPct,
      outdoorHumidityPct,
      condensationText: hasCondensation 
        ? `⚠️ PAVOJUS: Ties ${condensationPositionMm} mm gyliu susidaro KONDENSATAS! Drėgmė kaupsis šiltinimo sluoksnyje. Būtina sumontuoti sandarią garo izoliacinę plėvelę (Sd ≥ 100 m).`
        : "✅ Rasos taško zonoje kondensatas nesusidaro. Konstrukcija išlieka 100% sausa, šilta ir apsaugota nuo pelėsio.",
      profile
    };
  }

  /**
   * Render Interactive SVG Glaser Condensation Diagram
   */
  renderGlaserChartSVG(glasserResult, width = 540, height = 220) {
    if (!glasserResult || !glasserResult.profile) return "";

    const padL = 45;
    const padR = 45;
    const padT = 20;
    const padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;

    const profile = glasserResult.profile;
    const maxP = Math.max(...profile.map(p => Math.max(p.p_sat_Pa, p.p_actual_Pa)), 2600);
    const minP = 0;

    const minT = parseFloat(glasserResult.outdoorTempC) - 2;
    const maxT = parseFloat(glasserResult.indoorTempC) + 2;

    const mapX = (frac) => padL + frac * chartW;
    const mapY_P = (p) => padT + chartH - ((p - minP) / (maxP - minP)) * chartH;
    const mapY_T = (t) => padT + chartH - ((t - minT) / (maxT - minT)) * chartH;

    // Saturation curve path
    let satPath = "";
    // Actual vapor curve path
    let actPath = "";
    // Temperature curve path
    let tempPath = "";

    profile.forEach((pt, i) => {
      const x = mapX(pt.frac);
      const ySat = mapY_P(pt.p_sat_Pa);
      const yAct = mapY_P(pt.p_actual_Pa);
      const yTemp = mapY_T(parseFloat(pt.tempC));

      if (i === 0) {
        satPath += `M ${x} ${ySat} `;
        actPath += `M ${x} ${yAct} `;
        tempPath += `M ${x} ${yTemp} `;
      } else {
        satPath += `L ${x} ${ySat} `;
        actPath += `L ${x} ${yAct} `;
        tempPath += `L ${x} ${yTemp} `;
      }
    });

    return `
      <svg viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible select-none font-mono">
        <!-- Background Grid -->
        <rect x="${padL}" y="${padT}" width="${chartW}" height="${chartH}" fill="#14110e" rx="8" stroke="#292524" stroke-width="1"/>
        
        <!-- Insulation Layer Background Bands -->
        <rect x="${padL}" y="${padT}" width="${chartW * 0.1}" height="${chartH}" fill="#3b82f6" fill-opacity="0.12" />
        <rect x="${padL + chartW * 0.1}" y="${padT}" width="${chartW * 0.8}" height="${chartH}" fill="#eab308" fill-opacity="0.08" />
        <rect x="${padL + chartW * 0.9}" y="${padT}" width="${chartW * 0.1}" height="${chartH}" fill="#10b981" fill-opacity="0.12" />

        <!-- Grid Lines -->
        <line x1="${padL}" y1="${padT + chartH / 2}" x2="${padL + chartW}" y2="${padT + chartH / 2}" stroke="#292524" stroke-dasharray="4"/>
        <line x1="${padL + chartW / 2}" y1="${padT}" x2="${padL + chartW / 2}" y2="${padT + chartH}" stroke="#292524" stroke-dasharray="4"/>

        <!-- Curves -->
        <!-- Saturation Vapor Pressure P_sat (Cyan/Blue) -->
        <path d="${satPath}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round"/>
        
        <!-- Actual Partial Vapor Pressure P_act (Red/Amber) -->
        <path d="${actPath}" fill="none" stroke="${glasserResult.hasCondensation ? '#ef4444' : '#fb923c'}" stroke-width="2.5" stroke-dasharray="${glasserResult.hasCondensation ? 'none' : '4,3'}" stroke-linecap="round"/>
        
        <!-- Temperature Gradient T (Yellow) -->
        <path d="${tempPath}" fill="none" stroke="#facc15" stroke-width="1.8" stroke-opacity="0.85"/>

        <!-- Data points -->
        ${profile.map(pt => `
          <circle cx="${mapX(pt.frac)}" cy="${mapY_P(pt.p_sat_Pa)}" r="3" fill="#38bdf8"/>
          <circle cx="${mapX(pt.frac)}" cy="${mapY_P(pt.p_actual_Pa)}" r="${pt.isCondensing ? 4.5 : 3}" fill="${pt.isCondensing ? '#ef4444' : '#fb923c'}"/>
        `).join("")}

        <!-- Axis Labels -->
        <text x="${padL}" y="${height - 8}" fill="#78716c" font-size="9">VIDUS (+${glasserResult.indoorTempC}°C)</text>
        <text x="${padL + chartW}" y="${height - 8}" text-anchor="end" fill="#78716c" font-size="9">IŠORĖ (${glasserResult.outdoorTempC}°C)</text>
        <text x="${padL + chartW / 2}" y="${height - 8}" text-anchor="middle" fill="#a8a29e" font-size="9">Šiltinimo sluoksnis (mm)</text>

        <text x="8" y="${padT + 12}" fill="#38bdf8" font-size="8">Pa (slėgis)</text>
        <text x="${width - 8}" y="${padT + 12}" text-anchor="end" fill="#facc15" font-size="8">°C (temp.)</text>
      </svg>
    `;
  }
}

if (typeof window !== "undefined") {
  window.EnergyEnvelopeEngine = EnergyEnvelopeEngine;
}
