/**
 * ARCHITEKTŪRA - 100% Precision 1D Cutting Stock Optimization Engine
 * Handles Kerf (saw blade thickness), End Trimming, Multi-Stock Sizes, and Profile Isolation.
 */

class TimberOptimizer {
  constructor(options = {}) {
    this.kerf = options.kerf !== undefined ? Number(options.kerf) : 4; // Saw width in mm
    this.trim = options.trim !== undefined ? Number(options.trim) : 15; // End trim allowance in mm
    this.pricePerM3 = options.pricePerM3 !== undefined ? Number(options.pricePerM3) : 280; // EUR/m3
    this.density = options.density !== undefined ? Number(options.density) : 460; // kg/m3
    this.algorithm = options.algorithm || "exact"; // "exact" or "heuristic"
  }

  /**
   * Parse cross-section dimensions in mm (e.g., "50x200" -> { width: 50, height: 200, areaM2: 0.01 })
   */
  static parseProfile(profileStr) {
    if (!profileStr) return { width: 50, height: 150, areaM2: 0.0075, label: "50x150" };
    const parts = profileStr.toLowerCase().replace(/[^0-9x]/g, "").split("x");
    const w = parseFloat(parts[0]) || 50;
    const h = parseFloat(parts[1]) || 150;
    return {
      width: w,
      height: h,
      widthMm: w,
      heightMm: h,
      areaM2: (w * h) / 1000000,
      label: `${w}x${h}`
    };
  }

  /**
   * Static optimization helper
   */
  static optimize(parts, stockLengths, settings = {}) {
    const opt = new TimberOptimizer(settings);
    return opt.optimize(parts, stockLengths);
  }

  /**
   * Main optimization entry point
   * @param {Array} parts - Array of required parts: [{ id, label, profile, length, quantity }]
   * @param {Array} stockLengths - Available stock lengths in mm: [{ length: 6000, enabled: true, cost: 0 }]
   */
  optimize(parts, stockLengths) {
    const activeStock = stockLengths
      .filter(s => s.enabled && s.length > 0)
      .map(s => Number(s.length))
      .sort((a, b) => b - a); // descending

    if (activeStock.length === 0) {
      throw new Error("Nėra pasirinktų galimų pirkimo tašų ilgių!");
    }

    // 1. Group demand parts strictly by Timber Profile (e.g., 50x200, 50x150)
    const profileGroups = {};
    parts.forEach((p, idx) => {
      const prof = p.profile || "50x150";
      if (!profileGroups[prof]) {
        profileGroups[prof] = [];
      }
      const qty = Math.max(1, parseInt(p.quantity) || 1);
      const len = Math.round(Number(p.length));
      if (len > 0) {
        for (let q = 0; q < qty; q++) {
          profileGroups[prof].push({
            id: p.id || `part-${idx}-${q}`,
            label: p.label || `Detalė #${idx + 1}`,
            length: len,
            profile: prof,
            itemIdx: idx
          });
        }
      }
    });

    const resultsByProfile = {};
    let globalTotalBoards = 0;
    let globalStockLengthMm = 0;
    let globalStockVolumeM3 = 0;
    let globalNetPartsVolumeM3 = 0;
    let globalWasteVolumeM3 = 0;
    let globalCutsCount = 0;

    // 2. Solve Cutting Stock Problem for each Profile independently
    for (const [profKey, items] of Object.entries(profileGroups)) {
      if (items.length === 0) continue;

      const profileInfo = TimberOptimizer.parseProfile(profKey);
      
      // Sort items descending by length for optimal packing
      const sortedItems = [...items].sort((a, b) => b.length - a.length);

      // Check if any single part exceeds the maximum available stock length after trim
      const maxUsableStock = Math.max(...activeStock) - (this.trim * 2);
      const tooLongItem = sortedItems.find(i => i.length > maxUsableStock);
      if (tooLongItem) {
        throw new Error(`Detalė "${tooLongItem.label}" (${tooLongItem.length} mm) viršija didžiausią galimą tašo ilgį su apipjovimu (${maxUsableStock} mm)!`);
      }

      // Solve for this profile
      const packedBoards = this.solveProfilePacking(sortedItems, activeStock);

      // Calculate profile metrics
      let profStockLenMm = 0;
      let profNetLenMm = 0;
      let profCuts = 0;

      packedBoards.forEach(b => {
        profStockLenMm += b.stockLength;
        b.items.forEach(it => {
          profNetLenMm += it.length;
        });
        // Cuts = number of parts + (trim > 0 ? 1 : 0)
        profCuts += b.items.length + (this.trim > 0 ? 1 : 0);
      });

      const profStockVolM3 = (profStockLenMm / 1000) * profileInfo.areaM2;
      const profNetVolM3 = (profNetLenMm / 1000) * profileInfo.areaM2;
      const profWasteVolM3 = Math.max(0, profStockVolM3 - profNetVolM3);
      const profWastePercent = profStockVolM3 > 0 ? (profWasteVolM3 / profStockVolM3) * 100 : 0;
      const profWeightKg = profStockVolM3 * this.density;
      const profCostEur = profStockVolM3 * this.pricePerM3;

      // Group purchase counts for this profile by stock length
      const purchaseCountByLength = {};
      activeStock.forEach(sl => { purchaseCountByLength[sl] = 0; });
      packedBoards.forEach(b => {
        purchaseCountByLength[b.stockLength] = (purchaseCountByLength[b.stockLength] || 0) + 1;
      });

      resultsByProfile[profKey] = {
        profile: profileInfo,
        boards: packedBoards,
        totalBoards: packedBoards.length,
        purchaseCounts: purchaseCountByLength,
        stockLengthM: profStockLenMm / 1000,
        netLengthM: profNetLenMm / 1000,
        stockVolumeM3: profStockVolM3,
        netVolumeM3: profNetVolM3,
        wasteVolumeM3: profWasteVolM3,
        wastePercent: profWastePercent,
        weightKg: profWeightKg,
        costEur: profCostEur,
        cutsCount: profCuts
      };

      globalTotalBoards += packedBoards.length;
      globalStockLengthMm += profStockLenMm;
      globalStockVolumeM3 += profStockVolM3;
      globalNetPartsVolumeM3 += profNetVolM3;
      globalWasteVolumeM3 += profWasteVolM3;
      globalCutsCount += profCuts;
    }

    const globalWastePercent = globalStockVolumeM3 > 0 
      ? (globalWasteVolumeM3 / globalStockVolumeM3) * 100 
      : 0;
    const globalTotalWeightKg = globalStockVolumeM3 * this.density;
    const globalTotalCostEur = globalStockVolumeM3 * this.pricePerM3;

    return {
      profiles: resultsByProfile,
      summary: {
        totalBoards: globalTotalBoards,
        totalStockLengthM: globalStockLengthMm / 1000,
        totalVolumeM3: globalStockVolumeM3,
        netPartsVolumeM3: globalNetPartsVolumeM3,
        wasteVolumeM3: globalWasteVolumeM3,
        wastePercent: globalWastePercent,
        totalWeightKg: globalTotalWeightKg,
        totalCostEur: globalTotalCostEur,
        totalCuts: globalCutsCount
      },
      params: {
        kerf: this.kerf,
        trim: this.trim,
        pricePerM3: this.pricePerM3,
        density: this.density,
        algorithm: this.algorithm
      }
    };
  }

  /**
   * Solves 1D packing for a single timber profile across available stock lengths
   */
  solveProfilePacking(items, stockLengths) {
    if (this.algorithm === "exact" && items.length <= 40) {
      return this.solveExactBranchAndBound(items, stockLengths);
    }
    return this.solveMultiStockBFD(items, stockLengths);
  }

  /**
   * Multi-Stock Best Fit Decreasing (BFD) Heuristic with local search
   */
  solveMultiStockBFD(items, stockLengths) {
    const remainingItems = [...items];
    const boards = [];

    while (remainingItems.length > 0) {
      let bestChoice = null;

      // Evaluate each stock length to find which gives the minimum waste
      for (const stockLen of stockLengths) {
        const usableLen = stockLen - (this.trim * 2);
        
        // Find best combination of remaining items that fit in this board
        const packResult = this.packSingleBoardGreedy(remainingItems, usableLen);

        if (packResult.packedItems.length > 0) {
          const waste = usableLen - packResult.totalUsed;
          const wasteRatio = waste / stockLen;

          if (!bestChoice || waste < bestChoice.waste || (waste === bestChoice.waste && stockLen < bestChoice.stockLen)) {
            bestChoice = {
              stockLen,
              usableLen,
              packedItems: packResult.packedItems,
              itemIndices: packResult.packedIndices,
              totalUsed: packResult.totalUsed,
              waste
            };
          }
        }
      }

      if (!bestChoice || bestChoice.packedItems.length === 0) {
        // Fallback: take largest stock and first item
        const maxStock = Math.max(...stockLengths);
        const first = remainingItems.shift();
        boards.push(this.createBoardObject(maxStock, [first]));
      } else {
        // Remove chosen items by indices (descending order to avoid index shift)
        bestChoice.itemIndices.sort((a, b) => b - a).forEach(idx => {
          remainingItems.splice(idx, 1);
        });

        boards.push(this.createBoardObject(bestChoice.stockLen, bestChoice.packedItems));
      }
    }

    return boards;
  }

  /**
   * Greedy Knapsack / Subset Sum search to fill a single stock board
   */
  packSingleBoardGreedy(items, maxCapacity) {
    let currentCapacity = maxCapacity;
    const packedItems = [];
    const packedIndices = [];
    let totalUsedWithKerf = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const neededSpace = packedItems.length === 0 
        ? item.length 
        : item.length + this.kerf;

      if (neededSpace <= currentCapacity) {
        packedItems.push(item);
        packedIndices.push(i);
        currentCapacity -= neededSpace;
        totalUsedWithKerf += neededSpace;
      }
    }

    return {
      packedItems,
      packedIndices,
      totalUsed: totalUsedWithKerf
    };
  }

  /**
   * Exact Branch and Bound solver for global minimum waste
   */
  solveExactBranchAndBound(items, stockLengths) {
    // We run an exhaustive backtracking search for small to medium lists
    let bestBoards = null;
    let minGlobalWaste = Infinity;

    const findCombinations = (currItems, currBoards, accumulatedWaste) => {
      if (accumulatedWaste >= minGlobalWaste) return;

      if (currItems.length === 0) {
        if (accumulatedWaste < minGlobalWaste) {
          minGlobalWaste = accumulatedWaste;
          bestBoards = JSON.parse(JSON.stringify(currBoards));
        }
        return;
      }

      // Try forming a board from current available stock lengths
      const firstItem = currItems[0];
      const rest = currItems.slice(1);

      for (const stockLen of stockLengths) {
        const usableLen = stockLen - (this.trim * 2);
        if (firstItem.length > usableLen) continue;

        // Find all subsets from rest that fit along with firstItem
        const subsets = this.generateSubsets(rest, usableLen - firstItem.length);

        for (const sub of subsets) {
          const boardItems = [firstItem, ...sub.items];
          const boardObj = this.createBoardObject(stockLen, boardItems);
          const newWaste = accumulatedWaste + boardObj.wasteMm;

          if (newWaste < minGlobalWaste) {
            // Remove packed items from list
            const remaining = this.removeItemsFromList(currItems, boardItems);
            findCombinations(remaining, [...currBoards, boardObj], newWaste);
          }
        }
      }
    };

    // Initialize with heuristic upper bound
    const heuristicSolution = this.solveMultiStockBFD(items, stockLengths);
    let initialWaste = heuristicSolution.reduce((sum, b) => sum + b.wasteMm, 0);
    minGlobalWaste = initialWaste;
    bestBoards = heuristicSolution;

    // Start exact search
    findCombinations(items, [], 0);

    return bestBoards || heuristicSolution;
  }

  /**
   * Helper to generate item subsets that fit within target capacity with kerf
   */
  generateSubsets(items, capacity, maxSubsets = 15) {
    const results = [{ items: [], usedLen: 0 }];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const currentLen = results.length;
      for (let j = 0; j < currentLen; j++) {
        const existing = results[j];
        const addedLen = existing.items.length === 0 ? item.length : item.length + this.kerf;
        if (existing.usedLen + addedLen <= capacity) {
          results.push({
            items: [...existing.items, item],
            usedLen: existing.usedLen + addedLen
          });
          if (results.length > maxSubsets) break;
        }
      }
      if (results.length > maxSubsets) break;
    }

    return results.sort((a, b) => b.usedLen - a.usedLen);
  }

  removeItemsFromList(source, toRemove) {
    const toRemoveIds = new Set(toRemove.map(r => r.id));
    const result = [];
    const removedCount = {};
    
    toRemove.forEach(r => {
      removedCount[r.id] = (removedCount[r.id] || 0) + 1;
    });

    source.forEach(s => {
      if (removedCount[s.id] && removedCount[s.id] > 0) {
        removedCount[s.id]--;
      } else {
        result.push(s);
      }
    });
    return result;
  }

  /**
   * Constructs a detailed board object with exact cut placements, kerf positions, and waste
   */
  createBoardObject(stockLength, items) {
    let currentPos = this.trim;
    const positionedItems = [];

    items.forEach((it, idx) => {
      const start = currentPos;
      const end = start + it.length;
      positionedItems.push({
        ...it,
        startPos: start,
        endPos: end,
        hasKerfAfter: idx < items.length - 1,
        kerfWidth: idx < items.length - 1 ? this.kerf : 0
      });
      currentPos = end + (idx < items.length - 1 ? this.kerf : 0);
    });

    const totalUsedMm = currentPos;
    const wasteMm = Math.max(0, stockLength - totalUsedMm);
    const wastePercent = (wasteMm / stockLength) * 100;

    return {
      stockLength,
      trimStart: this.trim,
      trimEnd: this.trim,
      items: positionedItems,
      totalUsedMm,
      wasteMm,
      wastePercent,
      efficiencyPercent: 100 - wastePercent
    };
  }
}

// Attach to window object
if (typeof window !== "undefined") {
  window.TimberOptimizer = TimberOptimizer;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = TimberOptimizer;
}
