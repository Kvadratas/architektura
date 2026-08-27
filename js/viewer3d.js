/**
 * ARCHITEKTŪRA - Interactive 3D CAD & Step-by-Step Construction Tutorial Engine (Three.js)
 * Supports full 10-Step Interactive Construction Timeline with Piles & Foundation Options:
 * - Bored Concrete Piles with Rebar Cages & Rostverk Ground Beam
 * - Monolithic Concrete Slab / Strip Foundations
 * - Complete 10-step assembly from ground/piles to metal roofing.
 */

class Timber3DViewer {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modelGroup = new THREE.Group();
    this.gridHelper = null;
    this.isWireframe = false;
    this.isFEAMode = false;
    this.feaData = null;
    this.splicingEnabled = true;
    this.currentMode = "roof"; // roof, wall, floor, full_house
    this.currentStep = 10; // 1 to 10
    this.stepLayers = {};

    this.dimensions = {
      spanM: 8.0,
      pitchDeg: 30,
      overhangM: 0.6,
      lengthM: 12.0,
      stepM: 0.6,
      wallHeightM: 2.8,
      wallTotalLenM: 40.0,
      floorSpanM: 4.5,
      floorWidthM: 10.0,
      foundationType: "piles", // 'piles' | 'slab' | 'strip'
      pilesCount: 22,
      pileDiameterMm: 300,
      pileDepthM: 2.0
    };

    this.materials = this.initMaterials();
    this.init();
  }

  /**
   * Initialize realistic materials
   */
  initMaterials() {
    return {
      rafter: new THREE.MeshStandardMaterial({
        color: 0xd5824c,
        roughness: 0.7,
        metalness: 0.05
      }),
      murlot: new THREE.MeshStandardMaterial({
        color: 0x94512e,
        roughness: 0.8,
        metalness: 0.05
      }),
      tie: new THREE.MeshStandardMaterial({
        color: 0xe2a874,
        roughness: 0.7,
        metalness: 0.05
      }),
      stud: new THREE.MeshStandardMaterial({
        color: 0xc5824c,
        roughness: 0.7,
        metalness: 0.05
      }),
      plate: new THREE.MeshStandardMaterial({
        color: 0xa86032,
        roughness: 0.75,
        metalness: 0.05
      }),
      batten: new THREE.MeshStandardMaterial({
        color: 0xdeb887,
        roughness: 0.65,
        metalness: 0.05
      }),
      counterBatten: new THREE.MeshStandardMaterial({
        color: 0xcd853f,
        roughness: 0.7,
        metalness: 0.05
      }),
      concrete: new THREE.MeshStandardMaterial({
        color: 0x64748b, // High strength C20/25 concrete
        roughness: 0.9,
        metalness: 0.05
      }),
      pileConcrete: new THREE.MeshStandardMaterial({
        color: 0x475569, // Subterranean concrete
        roughness: 0.95,
        metalness: 0.02
      }),
      rebar: new THREE.MeshStandardMaterial({
        color: 0x991b1b, // Rust-resistant ribbed rebar
        roughness: 0.4,
        metalness: 0.85
      }),
      epsInsulation: new THREE.MeshStandardMaterial({
        color: 0x38bdf8, // XPS / EPS blue insulation
        roughness: 0.9,
        metalness: 0.05
      }),
      bitumen: new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.9,
        metalness: 0.15
      }),
      membrane: new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.8,
        metalness: 0.1,
        transparent: true,
        opacity: 0.92
      }),
      metalCladding: new THREE.MeshStandardMaterial({
        color: 0x27272a, // Anthracite RAL 7016
        roughness: 0.35,
        metalness: 0.85
      }),
      metalFlashings: new THREE.MeshStandardMaterial({
        color: 0x18181b,
        roughness: 0.3,
        metalness: 0.9
      }),
      metalBracket: new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.3,
        metalness: 0.85
      }),
      splicePlate: new THREE.MeshStandardMaterial({
        color: 0x60a5fa, // Bright steel splice gusset plate
        roughness: 0.25,
        metalness: 0.9
      }),
      glass: new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.45
      }),
      windowFrame: new THREE.MeshStandardMaterial({
        color: 0x18181b, // Anthracite RAL 7016 frames
        roughness: 0.4,
        metalness: 0.6
      }),
      door: new THREE.MeshStandardMaterial({
        color: 0x78350f, // Oak wood door
        roughness: 0.6,
        metalness: 0.1
      }),
      partition: new THREE.MeshStandardMaterial({
        color: 0xd97706, // Interior stud framing
        roughness: 0.7,
        metalness: 0.05
      }),
      floorLiving: new THREE.MeshStandardMaterial({
        color: 0x92400e, // Warm wood parketas
        roughness: 0.5,
        metalness: 0.05
      }),
      floorWC: new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Ceramic waterproof tiles
        roughness: 0.3,
        metalness: 0.3
      }),
      floorBed: new THREE.MeshStandardMaterial({
        color: 0x047857, // Cosy green/oak bedroom floor
        roughness: 0.6,
        metalness: 0.05
      }),
      bolt: new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.2,
        metalness: 0.95
      })
    };
  }

  /**
   * Initialize Three.js Viewport
   */
  init() {
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0e0c0a);

    const aspect = this.container.clientWidth / this.container.clientHeight || 16 / 9;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    this.camera.position.set(18, 14, 22);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = "";
    this.container.appendChild(this.renderer.domElement);

    if (window.THREE && THREE.OrbitControls) {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.3; // Allow viewing piles underground
      this.controls.minDistance = 2;
      this.controls.maxDistance = 100;
    }

    this.setupLighting();

    this.gridHelper = new THREE.GridHelper(36, 36, 0x57463a, 0x221c17);
    this.gridHelper.position.y = 0;
    this.scene.add(this.gridHelper);

    this.scene.add(this.modelGroup);
    this.buildModel();

    window.addEventListener("resize", () => this.onWindowResize());
    this.animate();
  }

  /**
   * Set FEA Stress Heatmap Mode
   */
  setFEAMode(enabled, feaData = null) {
    this.isFEAMode = enabled;
    this.feaData = feaData;
    this.buildModel();
  }

  toggleFEAMode() {
    this.isFEAMode = !this.isFEAMode;
    this.buildModel();
    return this.isFEAMode;
  }

  /**
   * Studio Lighting
   */
  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffedd5, 1.4);
    dirLight1.position.set(24, 38, 24);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 2048;
    dirLight1.shadow.mapSize.height = 2048;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xbae6fd, 0.45);
    dirLight2.position.set(-24, 16, -24);
    this.scene.add(dirLight2);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x333333, 0.35);
    this.scene.add(hemiLight);
  }

  /**
   * Build Full 10-Step Parametric Model
   */
  buildModel(dimensions = {}) {
    this.dimensions = { ...this.dimensions, ...dimensions };
    
    while (this.modelGroup.children.length > 0) {
      const obj = this.modelGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      this.modelGroup.remove(obj);
    }

    for (let s = 1; s <= 10; s++) {
      this.stepLayers[s] = [];
    }

    this.buildFullArchitecture();
    this.updateStepVisibility();
    this.setWireframe(this.isWireframe);
  }

  /**
   * Complete Architectural Assembly from Underground Piles to Roof Steel
   */
  buildFullArchitecture() {
    const span = this.dimensions.spanM || 8.0;
    const pitch = this.dimensions.pitchDeg || 30;
    const overhang = this.dimensions.overhangM || 0.6;
    const length = this.dimensions.lengthM || 12.0;
    const step = this.dimensions.stepM || 0.6;
    const wallHeight = this.dimensions.wallHeightM || 2.8;
    const fType = this.dimensions.foundationType || "piles";

    const rad = (pitch * Math.PI) / 180;
    const halfSpan = span / 2;
    const ridgeHeight = halfSpan * Math.tan(rad);
    const rafterLength = (halfSpan / Math.cos(rad)) + overhang;

    const rafterThickness = 0.05; // 50 mm
    const rafterDepth = 0.20; // 200 mm
    const murlotWidth = 0.15; // 150 mm
    const murlotHeight = 0.10; // 100 mm

    const rostverkHeight = 0.40;
    const rostverkWidth = 0.30;
    const baseElevation = wallHeight + rostverkHeight;

    // FEA Stress Material determination
    let currentRafterMaterial = this.materials.rafter;
    if (this.isFEAMode) {
      const stressColor = (this.feaData && this.feaData.colorHex) ? this.feaData.colorHex : 0x22c55e;
      currentRafterMaterial = new THREE.MeshStandardMaterial({
        color: stressColor,
        roughness: 0.5,
        metalness: 0.2,
        emissive: stressColor,
        emissiveIntensity: 0.18
      });
    }

    // ==========================================
    // STEP 1: FOUNDATIONS (PILES VS PILES NO ROSTVERK VS SLAB VS STRIP)
    // ==========================================
    if (fType === "piles") {
      this.build3DPilesAndRostverk(length, span, rostverkWidth, rostverkHeight);
    } else if (fType === "piles_no_rostverk") {
      this.build3DElevatedPilesNoRostverk(length, span, wallHeight);
    } else if (fType === "slab") {
      this.build3DSlabFoundation(length, span);
    } else {
      this.build3DStripFoundation(length, span);
    }

    // ==========================================
    // STEP 2: MŪRLOTAI (100x150) & ANCHOR BOLTS
    // ==========================================
    const murlotLeft = this.createBox(murlotWidth, murlotHeight, length, this.materials.murlot);
    murlotLeft.position.set(-halfSpan, baseElevation + (murlotHeight / 2), length / 2);
    this.registerMesh(2, murlotLeft);

    const murlotRight = this.createBox(murlotWidth, murlotHeight, length, this.materials.murlot);
    murlotRight.position.set(halfSpan, baseElevation + (murlotHeight / 2), length / 2);
    this.registerMesh(2, murlotRight);

    // Anchor rods M12 every 1.2m
    const anchorCount = Math.ceil(length / 1.2) + 1;
    for (let a = 0; a < anchorCount; a++) {
      const az = Math.min(length, a * 1.2);
      const rod1 = this.createCylinder(0.012, 0.25, this.materials.bolt);
      rod1.position.set(-halfSpan, baseElevation + 0.05, az);
      this.registerMesh(2, rod1);

      const rod2 = this.createCylinder(0.012, 0.25, this.materials.bolt);
      rod2.position.set(halfSpan, baseElevation + 0.05, az);
      this.registerMesh(2, rod2);
    }

    // ==========================================
    // STEP 3: WALL FRAMING (STATRAMSČIAI KAS 600 MM)
    // ==========================================
    this.buildFramingWalls(length, span, wallHeight, rostverkHeight, step);

    // ==========================================
    // STEP 4: RIDGE BOARD & SUPPORT POSTS
    // ==========================================
    const ridgeBoard = this.createBox(0.05, 0.20, length, this.materials.rafter);
    ridgeBoard.position.set(0, baseElevation + ridgeHeight, length / 2);
    this.registerMesh(4, ridgeBoard);

    [0, length / 2, length].forEach(pz => {
      const post = this.createBox(0.10, ridgeHeight, 0.10, this.materials.murlot);
      post.position.set(0, baseElevation + (ridgeHeight / 2), pz);
      this.registerMesh(4, post);
    });

    // ==========================================
    // STEP 5: RAFTERS & SPLICING / 90x90 BRACKETS
    // ==========================================
    const pairsCount = Math.ceil(length / step) + 1;
    const needsSplicing = this.splicingEnabled && (rafterLength > 6.0);

    for (let i = 0; i < pairsCount; i++) {
      const zPos = Math.min(length, i * step);

      if (!needsSplicing) {
        // Standard single rafter
        const leftRafter = this.createBox(rafterThickness, rafterDepth, rafterLength, currentRafterMaterial);
        leftRafter.rotation.z = -rad;
        const leftCenterX = -halfSpan / 2 - (overhang * Math.cos(rad) / 2);
        const leftCenterY = baseElevation + (ridgeHeight / 2) - (overhang * Math.sin(rad) / 2);
        leftRafter.position.set(leftCenterX, leftCenterY, zPos);
        this.registerMesh(5, leftRafter);

        const rightRafter = this.createBox(rafterThickness, rafterDepth, rafterLength, currentRafterMaterial);
        rightRafter.rotation.z = rad;
        const rightCenterX = halfSpan / 2 + (overhang * Math.cos(rad) / 2);
        const rightCenterY = baseElevation + (ridgeHeight / 2) - (overhang * Math.sin(rad) / 2);
        rightRafter.position.set(rightCenterX, rightCenterY, zPos);
        this.registerMesh(5, rightRafter);
      } else {
        // SPLICED RAFTERS (> 6.0 m) with steel plates
        const lenA = Math.min(5.2, rafterLength * 0.65);
        const lenB = rafterLength - lenA;

        // Left Rafter - Segment A & B
        const leftRafterA = this.createBox(rafterThickness, rafterDepth, lenA, currentRafterMaterial);
        leftRafterA.rotation.z = -rad;
        const lAx = -halfSpan - (overhang * Math.cos(rad)) + (lenA / 2 * Math.cos(rad));
        const lAy = baseElevation - (overhang * Math.sin(rad)) + (lenA / 2 * Math.sin(rad));
        leftRafterA.position.set(lAx, lAy, zPos);
        this.registerMesh(5, leftRafterA);

        const leftRafterB = this.createBox(rafterThickness, rafterDepth, lenB, currentRafterMaterial);
        leftRafterB.rotation.z = -rad;
        const lBx = -halfSpan - (overhang * Math.cos(rad)) + ((lenA + lenB / 2) * Math.cos(rad));
        const lBy = baseElevation - (overhang * Math.sin(rad)) + ((lenA + lenB / 2) * Math.sin(rad));
        leftRafterB.position.set(lBx, lBy, zPos);
        this.registerMesh(5, leftRafterB);

        // Splice Joint Steel Plate on Left Rafter
        const spliceJointX = -halfSpan - (overhang * Math.cos(rad)) + (lenA * Math.cos(rad));
        const spliceJointY = baseElevation - (overhang * Math.sin(rad)) + (lenA * Math.sin(rad));
        const sPlateL = this.createBox(0.006, rafterDepth * 0.9, 0.35, this.materials.splicePlate);
        sPlateL.rotation.z = -rad;
        sPlateL.position.set(spliceJointX, spliceJointY, zPos + (rafterThickness / 2) + 0.004);
        this.registerMesh(5, sPlateL);

        // Right Rafter - Segment A & B
        const rightRafterA = this.createBox(rafterThickness, rafterDepth, lenA, currentRafterMaterial);
        rightRafterA.rotation.z = rad;
        const rAx = halfSpan + (overhang * Math.cos(rad)) - (lenA / 2 * Math.cos(rad));
        const rAy = baseElevation - (overhang * Math.sin(rad)) + (lenA / 2 * Math.sin(rad));
        rightRafterA.position.set(rAx, rAy, zPos);
        this.registerMesh(5, rightRafterA);

        const rightRafterB = this.createBox(rafterThickness, rafterDepth, lenB, currentRafterMaterial);
        rightRafterB.rotation.z = rad;
        const rBx = halfSpan + (overhang * Math.cos(rad)) - ((lenA + lenB / 2) * Math.cos(rad));
        const rBy = baseElevation - (overhang * Math.sin(rad)) + ((lenA + lenB / 2) * Math.sin(rad));
        rightRafterB.position.set(rBx, rBy, zPos);
        this.registerMesh(5, rightRafterB);

        // Splice Joint Steel Plate on Right Rafter
        const spliceJointRX = halfSpan + (overhang * Math.cos(rad)) - (lenA * Math.cos(rad));
        const spliceJointRY = baseElevation - (overhang * Math.sin(rad)) + (lenA * Math.sin(rad));
        const sPlateR = this.createBox(0.006, rafterDepth * 0.9, 0.35, this.materials.splicePlate);
        sPlateR.rotation.z = rad;
        sPlateR.position.set(spliceJointRX, spliceJointRY, zPos + (rafterThickness / 2) + 0.004);
        this.registerMesh(5, sPlateR);
      }

      const brLeft = this.createBox(0.065, 0.09, 0.09, this.materials.metalBracket);
      brLeft.position.set(-halfSpan + 0.06, baseElevation + murlotHeight + 0.03, zPos);
      this.registerMesh(5, brLeft);

      const brRight = this.createBox(0.065, 0.09, 0.09, this.materials.metalBracket);
      brRight.position.set(halfSpan - 0.06, baseElevation + murlotHeight + 0.03, zPos);
      this.registerMesh(5, brRight);

      const ridgePlate = this.createBox(0.003, 0.12, 0.06, this.materials.metalBracket);
      ridgePlate.position.set(0, baseElevation + ridgeHeight - 0.04, zPos + 0.028);
      this.registerMesh(5, ridgePlate);
    }

    // ==========================================
    // STEP 6: COLLAR TIES & M12 BOLTS
    // ==========================================
    const tieY = baseElevation + (ridgeHeight * 0.55);
    const tieSpan = (span * (1 - 0.55));

    for (let i = 0; i < pairsCount; i++) {
      const zPos = Math.min(length, i * step);
      const tie = this.createBox(tieSpan, 0.15, 0.05, this.materials.tie);
      tie.position.set(0, tieY, zPos + 0.03);
      this.registerMesh(6, tie);

      const bolt1 = this.createCylinder(0.012, 0.10, this.materials.bolt);
      bolt1.rotation.x = Math.PI / 2;
      bolt1.position.set(-tieSpan / 2 + 0.12, tieY, zPos + 0.03);
      this.registerMesh(6, bolt1);

      const bolt2 = this.createCylinder(0.012, 0.10, this.materials.bolt);
      bolt2.rotation.x = Math.PI / 2;
      bolt2.position.set(tieSpan / 2 - 0.12, tieY, zPos + 0.03);
      this.registerMesh(6, bolt2);
    }

    // ==========================================
    // STEP 7: BREATHABLE MEMBRANE
    // ==========================================
    const slopePlaneLength = length + 0.2;

    const membLeftX = -halfSpan / 2 - (overhang * Math.cos(rad) / 2);
    const membLeftY = baseElevation + (ridgeHeight / 2) - (overhang * Math.sin(rad) / 2) + (rafterDepth/2) + 0.005;
    const membRightX = halfSpan / 2 + (overhang * Math.cos(rad) / 2);
    const membRightY = baseElevation + (ridgeHeight / 2) - (overhang * Math.sin(rad) / 2) + (rafterDepth/2) + 0.005;

    const membLeft = this.createBox(rafterLength, 0.005, slopePlaneLength, this.materials.membrane);
    membLeft.rotation.z = -rad;
    membLeft.position.set(membLeftX, membLeftY, length / 2);
    this.registerMesh(7, membLeft);

    const membRight = this.createBox(rafterLength, 0.005, slopePlaneLength, this.materials.membrane);
    membRight.rotation.z = rad;
    membRight.position.set(membRightX, membRightY, length / 2);
    this.registerMesh(7, membRight);

    // ==========================================
    // STEP 8: COUNTER-BATTENS (VENTILIACINIAI TAŠELIAI 25x50)
    // ==========================================
    for (let i = 0; i < pairsCount; i++) {
      const zPos = Math.min(length, i * step);

      const cbLeft = this.createBox(rafterLength, 0.025, 0.05, this.materials.counterBatten);
      cbLeft.rotation.z = -rad;
      cbLeft.position.set(membLeftX, membLeftY + 0.015, zPos);
      this.registerMesh(8, cbLeft);

      const cbRight = this.createBox(rafterLength, 0.025, 0.05, this.materials.counterBatten);
      cbRight.rotation.z = rad;
      cbRight.position.set(membRightX, membRightY + 0.015, zPos);
      this.registerMesh(8, cbRight);
    }

    // ==========================================
    // STEP 9: HORIZONTAL BATTENS (GREBĖSTAI 25x100 KAS 350 MM)
    // ==========================================
    const battenSpacing = 0.35;
    const battensCount = Math.ceil(rafterLength / battenSpacing) + 1;

    for (let b = 0; b < battensCount; b++) {
      const distFromEave = Math.min(rafterLength, b * battenSpacing);

      const bLeft = this.createBox(0.10, 0.025, length + 0.2, this.materials.batten);
      bLeft.rotation.z = -rad;
      const bLX = (-halfSpan - overhang * Math.cos(rad)) + (distFromEave * Math.cos(rad));
      const bLY = (baseElevation - overhang * Math.sin(rad)) + (distFromEave * Math.sin(rad)) + rafterDepth + 0.035;
      bLeft.position.set(bLX, bLY, length / 2);
      this.registerMesh(9, bLeft);

      const bRight = this.createBox(0.10, 0.025, length + 0.2, this.materials.batten);
      bRight.rotation.z = rad;
      const bRX = (halfSpan + overhang * Math.cos(rad)) - (distFromEave * Math.cos(rad));
      const bRY = (baseElevation - overhang * Math.sin(rad)) + (distFromEave * Math.sin(rad)) + rafterDepth + 0.035;
      bRight.position.set(bRX, bRY, length / 2);
      this.registerMesh(9, bRight);
    }

    // ==========================================
    // STEP 10: METAL ROOFING SHEETS (SKARDA RAL 7016 & KRAIGAS)
    // ==========================================
    const sheetElevationOffset = 0.06;

    const sheetLeft = this.createBox(rafterLength + 0.05, 0.02, length + 0.2, this.materials.metalCladding);
    sheetLeft.rotation.z = -rad;
    sheetLeft.position.set(membLeftX, membLeftY + sheetElevationOffset, length / 2);
    this.registerMesh(10, sheetLeft);

    const sheetRight = this.createBox(rafterLength + 0.05, 0.02, length + 0.2, this.materials.metalCladding);
    sheetRight.rotation.z = rad;
    sheetRight.position.set(membRightX, membRightY + sheetElevationOffset, length / 2);
    this.registerMesh(10, sheetRight);

    const ridgeCap = this.createBox(0.40, 0.03, length + 0.3, this.materials.metalFlashings);
    ridgeCap.position.set(0, baseElevation + ridgeHeight + rafterDepth + 0.07, length / 2);
    this.registerMesh(10, ridgeCap);

    this.modelGroup.position.set(0, 0, -length / 2);
  }

  /**
   * 3D BORED CONCRETE PILES & ROSTVERKAS
   */
  build3DPilesAndRostverk(length, span, rostverkWidth, rostverkHeight) {
    const halfSpan = span / 2;
    const pileDepth = Math.max(1.8, this.dimensions.pileDepthM || 2.0);
    const pileRadius = (this.dimensions.pileDiameterMm || 300) / 2000;
    const spacing = 1.8;

    // 1. Reinforced Concrete Rostverkas (Ground Beams)
    // Left beam
    const rLeft = this.createBox(rostverkWidth, rostverkHeight, length + rostverkWidth, this.materials.concrete);
    rLeft.position.set(-halfSpan, rostverkHeight / 2, length / 2);
    this.registerMesh(1, rLeft);

    // Right beam
    const rRight = this.createBox(rostverkWidth, rostverkHeight, length + rostverkWidth, this.materials.concrete);
    rRight.position.set(halfSpan, rostverkHeight / 2, length / 2);
    this.registerMesh(1, rRight);

    // Front beam
    const rFront = this.createBox(span - rostverkWidth, rostverkHeight, rostverkWidth, this.materials.concrete);
    rFront.position.set(0, rostverkHeight / 2, 0);
    this.registerMesh(1, rFront);

    // Back beam
    const rBack = this.createBox(span - rostverkWidth, rostverkHeight, rostverkWidth, this.materials.concrete);
    rBack.position.set(0, rostverkHeight / 2, length);
    this.registerMesh(1, rBack);

    // 2. Subterranean Piles along perimeter & corners
    const lenCount = Math.ceil(length / spacing) + 1;
    const spanCount = Math.ceil(span / spacing) + 1;

    // Left & Right sides piles
    for (let i = 0; i < lenCount; i++) {
      const z = Math.min(length, i * spacing);
      this.create3DPile(-halfSpan, z, pileRadius, pileDepth, rostverkHeight);
      this.create3DPile(halfSpan, z, pileRadius, pileDepth, rostverkHeight);
    }

    // Front & Back intermediate piles
    for (let j = 1; j < spanCount - 1; j++) {
      const x = -halfSpan + (j * (span / (spanCount - 1)));
      this.create3DPile(x, 0, pileRadius, pileDepth, rostverkHeight);
      this.create3DPile(x, length, pileRadius, pileDepth, rostverkHeight);
    }

    // Bitumen moisture proofing on top of Rostverk
    const bitLeft = this.createBox(rostverkWidth, 0.006, length + rostverkWidth, this.materials.bitumen);
    bitLeft.position.set(-halfSpan, rostverkHeight + 0.003, length / 2);
    this.registerMesh(1, bitLeft);

    const bitRight = this.createBox(rostverkWidth, 0.006, length + rostverkWidth, this.materials.bitumen);
    bitRight.position.set(halfSpan, rostverkHeight + 0.003, length / 2);
    this.registerMesh(1, bitRight);
  }

  /**
   * 3D Elevated Bore Piles Solution WITHOUT Rostverkas (Post-and-Beam Timber Grid)
   */
  build3DElevatedPilesNoRostverk(length, span, wallHeight) {
    const halfSpan = span / 2;
    const pileDepth = Math.max(1.8, this.dimensions.pileDepthM || 2.0);
    const pileRadius = (this.dimensions.pileDiameterMm || 300) / 2000;
    const pileAboveGroundH = 0.40; // 400 mm elevated above ground
    const gridSpacing = 1.4;

    const lenCount = Math.ceil(length / gridSpacing) + 1;
    const spanCount = Math.ceil(span / gridSpacing) + 1;

    // 1. DENSE STRUCTURAL GRID OF ELEVATED PILES WITH STEEL U-BRACKETS
    for (let i = 0; i < lenCount; i++) {
      const z = Math.min(length, i * (length / (lenCount - 1)));

      for (let j = 0; j < spanCount; j++) {
        const x = -halfSpan + j * (span / (spanCount - 1));

        // Underground cylinder
        const pileUnder = this.createCylinder(pileRadius, pileDepth, this.materials.pileConcrete);
        pileUnder.position.set(x, -pileDepth / 2, z);
        this.registerMesh(1, pileUnder);

        // Above ground elevated concrete head
        const pileHead = this.createCylinder(pileRadius, pileAboveGroundH, this.materials.concrete);
        pileHead.position.set(x, pileAboveGroundH / 2, z);
        this.registerMesh(1, pileHead);

        // Galvanized Steel U-Bracket on top of pile head
        const uBracketBase = this.createBox(0.18, 0.015, 0.18, this.materials.metalBracket);
        uBracketBase.position.set(x, pileAboveGroundH + 0.008, z);
        this.registerMesh(1, uBracketBase);

        const uEar1 = this.createBox(0.01, 0.12, 0.15, this.materials.metalBracket);
        uEar1.position.set(x - 0.08, pileAboveGroundH + 0.06, z);
        this.registerMesh(1, uEar1);

        const uEar2 = this.createBox(0.01, 0.12, 0.15, this.materials.metalBracket);
        uEar2.position.set(x + 0.08, pileAboveGroundH + 0.06, z);
        this.registerMesh(1, uEar2);
      }
    }

    // 2. HEAVY STRUCTURAL TIMBER BEARER GRID (150x200 mm C24 / GL24h)
    const bearerW = 0.15;
    const bearerH = 0.20;
    const bearerY = pileAboveGroundH + (bearerH / 2) + 0.015;

    // Longitudinal Main Carrier Beams (along perimeter and internal axes)
    for (let j = 0; j < spanCount; j++) {
      const x = -halfSpan + j * (span / (spanCount - 1));
      const beamL = this.createBox(bearerW, bearerH, length + bearerW, this.materials.murlot);
      beamL.position.set(x, bearerY, length / 2);
      this.registerMesh(1, beamL);
    }

    // Transverse Carrier Beams (under room dividers)
    [0, length * 0.46, length * 0.74, length].forEach(tz => {
      const beamT = this.createBox(span, bearerH, bearerW, this.materials.plate);
      beamT.position.set(0, bearerY + bearerH, tz);
      this.registerMesh(1, beamT);
    });

    // Bitumen Moisture barrier on bearer beams
    const bitLeft = this.createBox(bearerW, 0.005, length + bearerW, this.materials.bitumen);
    bitLeft.position.set(-halfSpan, bearerY + (bearerH / 2) + 0.003, length / 2);
    this.registerMesh(1, bitLeft);

    const bitRight = this.createBox(bearerW, 0.005, length + bearerW, this.materials.bitumen);
    bitRight.position.set(halfSpan, bearerY + (bearerH / 2) + 0.003, length / 2);
    this.registerMesh(1, bitRight);

    // 3. Dense Floor Joists Framework (50x200 mm kas 400 mm) resting on Bearers for maximum rigidity
    const joistStep = 0.40;
    const joistsCount = Math.ceil(length / joistStep) + 1;
    const joistW = 0.05;
    const joistH = 0.20;
    const joistY = bearerY + (bearerH / 2) + (joistH / 2);

    for (let k = 0; k < joistsCount; k++) {
      const jz = Math.min(length, k * joistStep);
      const joistMesh = this.createBox(span, joistH, joistW, this.materials.rafter);
      joistMesh.position.set(0, joistY, jz);
      this.registerMesh(1, joistMesh);
    }
  }

  /**
   * Helper to create a single bored pile with exposed rebar cage
   */
  create3DPile(x, z, radius, depth, rostverkH) {
    // Concrete cylinder underground
    const pileMesh = this.createCylinder(radius, depth, this.materials.pileConcrete);
    pileMesh.position.set(x, -depth / 2, z);
    this.registerMesh(1, pileMesh);

    // 4 Rebar anchor pins extending into rostverkas
    const rebarH = 0.45;
    for (let r = 0; r < 4; r++) {
      const angle = (r * Math.PI) / 2;
      const rx = x + (radius * 0.6 * Math.cos(angle));
      const rz = z + (radius * 0.6 * Math.sin(angle));
      const rebar = this.createCylinder(0.008, rebarH, this.materials.rebar);
      rebar.position.set(rx, rebarH / 2, rz);
      this.registerMesh(1, rebar);
    }
  }

  /**
   * 3D Monolithic Concrete Slab Foundation
   */
  build3DSlabFoundation(length, span) {
    const slabH = 0.25;
    const slab = this.createBox(span + 0.4, slabH, length + 0.4, this.materials.concrete);
    slab.position.set(0, slabH / 2, length / 2);
    this.registerMesh(1, slab);

    const eps = this.createBox(span + 0.6, 0.20, length + 0.6, this.materials.epsInsulation);
    eps.position.set(0, -0.10, length / 2);
    this.registerMesh(1, eps);
  }

  /**
   * 3D Strip Foundation
   */
  build3DStripFoundation(length, span) {
    const stripW = 0.40;
    const stripH = 1.40;
    const halfSpan = span / 2;

    const sLeft = this.createBox(stripW, stripH, length + stripW, this.materials.concrete);
    sLeft.position.set(-halfSpan, -stripH / 2 + 0.3, length / 2);
    this.registerMesh(1, sLeft);

    const sRight = this.createBox(stripW, stripH, length + stripW, this.materials.concrete);
    sRight.position.set(halfSpan, -stripH / 2 + 0.3, length / 2);
    this.registerMesh(1, sRight);
  }

  /**
   * Wall Framing Meshes with Windows, Doors, and Interior Partitions
   */
  buildFramingWalls(length, span, wallHeight, rostverkH, step) {
    const studThick = 0.05;
    const studDepth = 0.15;
    const studsCount = Math.ceil(length / step) + 1;
    const studHeight = wallHeight;
    const halfSpan = span / 2;

    // 1. Exterior Perimeter Studs
    for (let i = 0; i < studsCount; i++) {
      const z = Math.min(length, i * step);
      
      // Leave space for windows / doors on specific bays
      const isWindowBay = (z > 2.0 && z < 4.5) || (z > length - 4.5 && z < length - 2.0);
      
      const studLeft = this.createBox(studDepth, studHeight, studThick, this.materials.stud);
      studLeft.position.set(-halfSpan, rostverkH + (studHeight / 2), z);
      this.registerMesh(3, studLeft);

      const studRight = this.createBox(studDepth, studHeight, studThick, this.materials.stud);
      studRight.position.set(halfSpan, rostverkH + (studHeight / 2), z);
      this.registerMesh(3, studRight);
    }

    // Top and Bottom Plates
    const bPlateLeft = this.createBox(studDepth, 0.045, length, this.materials.plate);
    bPlateLeft.position.set(-halfSpan, rostverkH + 0.022, length / 2);
    this.registerMesh(3, bPlateLeft);

    const bPlateRight = this.createBox(studDepth, 0.045, length, this.materials.plate);
    bPlateRight.position.set(halfSpan, rostverkH + 0.022, length / 2);
    this.registerMesh(3, bPlateRight);

    // 2. 3D Windows in Exterior Walls
    this.build3DWindows(length, halfSpan, wallHeight, rostverkH);

    // 3. 3D Exterior Front Door
    const extDoor = this.createBox(0.12, 2.10, 1.0, this.materials.door);
    extDoor.position.set(-halfSpan, rostverkH + 1.05, 1.2);
    this.registerMesh(3, extDoor);

    // 4. Interior Room Partition Walls & Color Floor Zoning (Rooms & WC)
    this.buildInteriorPartitionsAndRooms(length, span, wallHeight, rostverkH);
  }

  /**
   * 3D Windows with Glass and Frames
   */
  build3DWindows(length, halfSpan, wallHeight, rostverkH) {
    const winY = rostverkH + 0.90 + (1.30 / 2); // Sill 0.9m, Height 1.3m

    // Left wall windows
    [3.2, length - 3.2].forEach(wz => {
      // Glass
      const glassL = this.createBox(0.02, 1.30, 1.40, this.materials.glass);
      glassL.position.set(-halfSpan, winY, wz);
      this.registerMesh(3, glassL);

      // Frame
      const frameL = this.createBox(0.12, 1.34, 1.44, this.materials.windowFrame);
      frameL.position.set(-halfSpan, winY, wz);
      this.registerMesh(3, frameL);
    });

    // Right wall windows (e.g. Living room patio window)
    [2.8, length / 2, length - 2.8].forEach(wz => {
      const glassR = this.createBox(0.02, 1.30, 1.40, this.materials.glass);
      glassR.position.set(halfSpan, winY, wz);
      this.registerMesh(3, glassR);

      const frameR = this.createBox(0.12, 1.34, 1.44, this.materials.windowFrame);
      frameR.position.set(halfSpan, winY, wz);
      this.registerMesh(3, frameR);
    });
  }

  /**
   * 3D Interior Room Partitions, WC & Doors
   */
  buildInteriorPartitionsAndRooms(length, span, wallHeight, rostverkH) {
    const halfSpan = span / 2;
    const partThick = 0.08;
    const partH = wallHeight;
    const floorY = rostverkH + 0.01;

    // A. Room Color-Coded Floor Zones
    // 1. Living Room & Kitchen (Front half)
    const floorLiving = this.createBox(span * 0.96, 0.02, length * 0.45, this.materials.floorLiving);
    floorLiving.position.set(0, floorY, length * 0.23);
    this.registerMesh(3, floorLiving);

    // 2. WC & Bathroom (Left back)
    const floorWC = this.createBox(span * 0.44, 0.02, length * 0.26, this.materials.floorWC);
    floorWC.position.set(-halfSpan + (span * 0.22) + 0.1, floorY, length * 0.60);
    this.registerMesh(3, floorWC);

    // 3. Bedrooms (Right back & Far back)
    const floorBed = this.createBox(span * 0.46, 0.02, length * 0.52, this.materials.floorBed);
    floorBed.position.set(halfSpan - (span * 0.23) - 0.1, floorY, length * 0.72);
    this.registerMesh(3, floorBed);

    // B. Interior Partition Walls (Step 3 & 7)
    // 1. Main Central Dividing Wall separating Living from Private/Bedrooms
    const mainDividingZ = length * 0.46;
    const wallLivingPart1 = this.createBox(span * 0.65, partH, partThick, this.materials.partition);
    wallLivingPart1.position.set(-span * 0.15, rostverkH + (partH / 2), mainDividingZ);
    this.registerMesh(3, wallLivingPart1);

    // Doorway opening to corridor
    const doorLiving = this.createBox(0.90, 2.10, 0.05, this.materials.door);
    doorLiving.position.set(span * 0.25, rostverkH + 1.05, mainDividingZ);
    this.registerMesh(3, doorLiving);

    // 2. Longitudinal Corridor Wall
    const corrX = 0;
    const wallCorr = this.createBox(partThick, partH, length * 0.48, this.materials.partition);
    wallCorr.position.set(corrX, rostverkH + (partH / 2), length * 0.72);
    this.registerMesh(3, wallCorr);

    // 3. WC & Bathroom Enclosure
    const wallWCSide = this.createBox(halfSpan * 0.9, partH, partThick, this.materials.partition);
    wallWCSide.position.set(-halfSpan / 2, rostverkH + (partH / 2), length * 0.74);
    this.registerMesh(3, wallWCSide);

    // WC Door
    const doorWC = this.createBox(partThick * 1.1, 2.05, 0.80, this.materials.door);
    doorWC.position.set(corrX, rostverkH + 1.025, length * 0.58);
    this.registerMesh(3, doorWC);

    // 4. Bedroom Division Wall
    const wallBedDivider = this.createBox(halfSpan * 0.9, partH, partThick, this.materials.partition);
    wallBedDivider.position.set(halfSpan / 2, rostverkH + (partH / 2), length * 0.74);
    this.registerMesh(3, wallBedDivider);

    // Bedroom 1 & 2 Doors
    const doorBed1 = this.createBox(partThick * 1.1, 2.05, 0.80, this.materials.door);
    doorBed1.position.set(corrX, rostverkH + 1.025, length * 0.68);
    this.registerMesh(3, doorBed1);

    const doorBed2 = this.createBox(partThick * 1.1, 2.05, 0.80, this.materials.door);
    doorBed2.position.set(corrX, rostverkH + 1.025, length * 0.84);
    this.registerMesh(3, doorBed2);
  }

  registerMesh(stepNum, mesh) {
    mesh.userData = { step: stepNum };
    if (!this.stepLayers[stepNum]) this.stepLayers[stepNum] = [];
    this.stepLayers[stepNum].push(mesh);
    this.modelGroup.add(mesh);
  }

  setStep(stepNumber) {
    this.currentStep = Math.max(1, Math.min(10, stepNumber));
    this.updateStepVisibility();
  }

  updateStepVisibility() {
    this.modelGroup.traverse(child => {
      if (child.isMesh && child.userData && child.userData.step) {
        child.visible = child.userData.step <= this.currentStep;
      }
    });
  }

  createBox(w, h, d, material) {
    const geom = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  createCylinder(radius, height, material) {
    const geom = new THREE.CylinderGeometry(radius, radius, height, 16);
    const mesh = new THREE.Mesh(geom, material);
    mesh.castShadow = true;
    return mesh;
  }

  setView(viewName) {
    if (!this.camera || !this.controls) return;
    const dist = 24;
    const target = new THREE.Vector3(0, 1.5, 0);

    const positions = {
      iso: new THREE.Vector3(dist * 0.7, dist * 0.6, dist * 0.8),
      front: new THREE.Vector3(0, 2, dist),
      back: new THREE.Vector3(0, 2, -dist),
      top: new THREE.Vector3(0, dist * 1.2, 0.01),
      bottom: new THREE.Vector3(0, -dist * 1.2, 0.01),
      left: new THREE.Vector3(-dist, 2, 0),
      right: new THREE.Vector3(dist, 2, 0)
    };

    const targetPos = positions[viewName] || positions.iso;
    const startPos = this.camera.position.clone();
    const duration = 500;
    const startTime = performance.now();

    const animateCamera = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.copy(target);
      this.controls.update();

      if (progress < 1) {
        requestAnimationFrame(animateCamera);
      }
    };

    requestAnimationFrame(animateCamera);
  }

  resetCamera() {
    this.setView("iso");
  }

  toggleWireframe() {
    this.isWireframe = !this.isWireframe;
    this.setWireframe(this.isWireframe);
    return this.isWireframe;
  }

  setWireframe(state) {
    Object.values(this.materials).forEach(mat => {
      mat.wireframe = state;
    });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    if (this.controls) this.controls.update();
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}

if (typeof window !== "undefined") {
  window.Timber3DViewer = Timber3DViewer;
}
