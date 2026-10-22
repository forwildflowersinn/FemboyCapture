import {
  PlayerState,
  EnemyState,
  BulletState,
  EnemyBulletState,
  WeaponPickupState,
  HazardPuddle,
  WEAPON_DEFS,
  MapEnvironment,
  MovingCar,
  Civilian,
  HeartPickup,
  MedkitPickup,
  DebuffedPlayerStats,
  PlayerSkinId,
  OutfitMode,
  NpcFemboyState,
  normalizeAngleDiff,
  HOME_OFFSET_X,
  HOME_OFFSET_Y,
} from './logic.ts';
import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';

let mansionDarknessCanvas: HTMLCanvasElement | null = null;

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  cameraX: number;
  cameraY: number;
  player: PlayerState;
  enemies: EnemyState[];
  bullets: BulletState[];
  enemyBullets?: EnemyBulletState[];
  pickups: WeaponPickupState[];
  medkits?: MedkitPickup[];
  puddles: HazardPuddle[];
  hearts?: HeartPickup[];
  npcFemboys?: NpcFemboyState[];
  adorationLevel?: number;
  activeUpgrades?: string[];
  debuffStats?: DebuffedPlayerStats;
  yandereRef?: EnemyState | null;
  cautionRibbons?: { x: number; y: number; duration: number }[];
  whiteoutTimer?: number;
  impactBlurTimer?: number;
  repairTarget?: { id: string; x: number; y: number; w: number; h: number; progress: number } | null;
  sanctuaryActive?: boolean;
  captureCutscene?: {
    active: boolean;
    phase: 'celebrate' | 'drag' | 'arrive' | 'finished';
    timer: number;
    zoom?: number;
    cameraZoom?: number;
    catcher: EnemyState;
    quote: string;
    isShiny?: boolean;
    struggleResistance?: number;
    strugglePullOffset?: { x: number; y: number };
  } | null;
  shinyCapture?: {
    active: boolean;
    timer: number;
    duration: number;
    catcher: EnemyState;
    quote: string;
  } | null;
  particles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    radius: number;
    life: number;
    maxLife: number;
  }[];
  mapEnv: MapEnvironment;
  cars: MovingCar[];
  civilians: Civilian[];
  arenaWidth: number;
  arenaHeight: number;
  gameTime: number;
}

/** Draws the arena floor, environment terrain, walls, and roads */
export function drawArena(r: RenderContext) {
  const { ctx, cameraX, cameraY, canvasWidth, canvasHeight, mapEnv, arenaWidth, arenaHeight } = r;

  ctx.fillStyle = '#060810';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  if (mapEnv.id === 'forest') {
    // --- UNTAMED PRIMEVAL WILDERNESS FOREST FLOOR ---
    ctx.fillStyle = '#07170e';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Organic Mossy Loam, Fallen Pine Needles & Wild Undergrowth Patches
    const mossPatches = [
      { x: 460, y: 420, rx: 280, ry: 190, c: 'rgba(20, 83, 45, 0.42)' },
      { x: 1180, y: 520, rx: 340, ry: 220, c: 'rgba(6, 78, 59, 0.38)' },
      { x: 1880, y: 460, rx: 310, ry: 210, c: 'rgba(22, 101, 52, 0.35)' },
      { x: 520, y: 1140, rx: 290, ry: 240, c: 'rgba(20, 83, 45, 0.4)' },
      { x: 1320, y: 1080, rx: 380, ry: 260, c: 'rgba(6, 95, 70, 0.36)' },
      { x: 1960, y: 1220, rx: 320, ry: 230, c: 'rgba(21, 128, 61, 0.34)' },
      { x: 740, y: 1680, rx: 350, ry: 210, c: 'rgba(20, 83, 45, 0.42)' },
      { x: 1580, y: 1660, rx: 360, ry: 220, c: 'rgba(6, 78, 59, 0.38)' },
    ];
    for (const mp of mossPatches) {
      ctx.fillStyle = mp.c;
      ctx.beginPath();
      ctx.ellipse(mp.x, mp.y, mp.rx, mp.ry, 0.25, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scattered Forest Floor Pine Needles & Leaf Litter
    ctx.fillStyle = 'rgba(69, 26, 3, 0.32)';
    for (let i = 0; i < 48; i++) {
      const lx = (i * 197 + 130) % (arenaWidth - 200) + 100;
      const ly = (i * 151 + 110) % (arenaHeight - 200) + 100;
      ctx.beginPath();
      ctx.ellipse(lx, ly, 26 + (i % 3) * 10, 14 + (i % 2) * 7, i * 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- RUSHING MOUNTAIN WILDERNESS CREEK & WHITEWATER RAPIDS ---
    ctx.save();
    // Muddy riverbank bed
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 118;
    ctx.beginPath();
    ctx.moveTo(420, 0);
    ctx.bezierCurveTo(340, 520, 960, 860, 820, 1360);
    ctx.bezierCurveTo(690, 1740, 1080, 1920, 1020, arenaHeight);
    ctx.stroke();

    // Riverbank smooth river cobbles
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 104;
    ctx.stroke();

    // Deep rushing mountain creek water
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 84;
    ctx.stroke();

    // Mid-stream glacial cyan current
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 54;
    ctx.stroke();

    // Animated whitewater rapids & foam ripples flowing downstream
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
    ctx.lineWidth = 6;
    ctx.setLineDash([22, 34]);
    ctx.lineDashOffset = -r.gameTime * 75;
    ctx.stroke();
    ctx.lineDashOffset = 0;
    ctx.setLineDash([]);
    ctx.restore();

    // Stepping Stones & Natural Log Crossings over the Mountain Creek
    // 1. North Fallen Redwood Log Crossing (around y: 460)
    ctx.save();
    ctx.translate(455, 465);
    ctx.rotate(-0.12);
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.roundRect(-78, -22, 156, 44, 12);
    ctx.fill();
    ctx.strokeStyle = '#290f02';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // Mossy bark ridges on log crossing
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.ellipse(-28, -14, 22, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(32, 14, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. South Mossy Boulder Stepping Stones (around y: 1340)
    const creekSteppingStones = [
      { x: 765, y: 1335, rx: 18, ry: 14 },
      { x: 805, y: 1345, rx: 20, ry: 15 },
      { x: 848, y: 1338, rx: 19, ry: 14 },
      { x: 888, y: 1350, rx: 17, ry: 13 },
    ];
    for (const st of creekSteppingStones) {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(st.x, st.y, st.rx, st.ry, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // --- WILD FERN FROND CLUSTERS ACROSS THE FLOOR ---
    const fernClusters = [
      { x: 310, y: 680 }, { x: 950, y: 380 }, { x: 1480, y: 420 },
      { x: 2040, y: 680 }, { x: 640, y: 1020 }, { x: 1680, y: 980 },
      { x: 1120, y: 1460 }, { x: 1840, y: 1520 }, { x: 460, y: 1740 },
    ];
    for (const fc of fernClusters) {
      ctx.save();
      ctx.translate(fc.x, fc.y);
      for (let f = 0; f < 6; f++) {
        ctx.save();
        ctx.rotate((f * Math.PI) / 3 + Math.sin(r.gameTime * 1.5 + fc.x) * 0.08);
        ctx.fillStyle = f % 2 === 0 ? '#15803d' : '#166534';
        ctx.beginPath();
        ctx.ellipse(12, 0, 14, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    // --- WILD BIOLUMINESCENT FAIRY RINGS & FOXFIRE SPORES ---
    const fairyRings = [
      { x: 380, y: 350, r: 48, c: '#22d3ee', cap: '#0891b2' },
      { x: 1220, y: 440, r: 54, c: '#c084fc', cap: '#9333ea' },
      { x: 1850, y: 580, r: 50, c: '#38bdf8', cap: '#0284c7' },
      { x: 580, y: 1450, r: 52, c: '#f472b6', cap: '#db2777' },
      { x: 1100, y: 1700, r: 56, c: '#4ade80', cap: '#16a34a' },
      { x: 1980, y: 1500, r: 50, c: '#a855f7', cap: '#7e22ce' },
      { x: 1500, y: 880, r: 46, c: '#22d3ee', cap: '#0891b2' },
    ];
    for (const fr of fairyRings) {
      const breathe = Math.sin(r.gameTime * 2.5 + fr.x) * 6;
      const mGlow = ctx.createRadialGradient(fr.x, fr.y, 4, fr.x, fr.y, fr.r + breathe);
      mGlow.addColorStop(0, fr.c + '66');
      mGlow.addColorStop(0.5, fr.c + '22');
      mGlow.addColorStop(1, fr.c + '00');
      ctx.fillStyle = mGlow;
      ctx.beginPath();
      ctx.arc(fr.x, fr.y, fr.r + breathe, 0, Math.PI * 2);
      ctx.fill();

      for (let m = 0; m < 5; m++) {
        const mAngle = (m * Math.PI * 2) / 5 + fr.x * 0.01;
        const mx = fr.x + Math.cos(mAngle) * (fr.r * 0.55);
        const my = fr.y + Math.sin(mAngle) * (fr.r * 0.55);

        ctx.fillStyle = m % 2 === 0 ? fr.cap : fr.c;
        ctx.beginPath();
        ctx.ellipse(mx, my - 2, 6, 5, 0, Math.PI, 0);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(mx - 1.5, my - 2, 3, 5);

        const sporeY = my - 6 - ((r.gameTime * 14 + m * 5) % 18);
        const sporeX = mx + Math.sin(r.gameTime * 4 + m) * 4;
        ctx.fillStyle = fr.c;
        ctx.beginPath();
        ctx.arc(sporeX, sporeY, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // --- DANCING WILDERNESS WILL-O'-THE-WISPS & FIREFLIES ---
    for (let fIdx = 0; fIdx < 18; fIdx++) {
      const wispX = ((fIdx * 195 + Math.sin(r.gameTime * 0.6 + fIdx) * 120) % (arenaWidth - 200)) + 100;
      const wispY = ((fIdx * 165 + Math.cos(r.gameTime * 0.7 + fIdx * 2) * 90) % (arenaHeight - 200)) + 100;
      const wispPulse = 0.4 + Math.sin(r.gameTime * 4 + fIdx) * 0.4;

      const wispGrad = ctx.createRadialGradient(wispX, wispY, 1, wispX, wispY, 12);
      wispGrad.addColorStop(0, `rgba(167, 243, 208, ${wispPulse})`);
      wispGrad.addColorStop(0.6, `rgba(52, 211, 153, ${wispPulse * 0.4})`);
      wispGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
      ctx.fillStyle = wispGrad;
      ctx.beginPath();
      ctx.arc(wispX, wispY, 12, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(wispX, wispY, 1.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- FOREST CAPTURE SPOT: MOSSY SLEEPING FUR PELT & BIOLUMINESCENT HOLLOW (1250, 1040) ---
    {
      const tx = mapEnv.captureSpot.x;
      const ty = mapEnv.captureSpot.y;
      ctx.save();
      ctx.translate(tx, ty);

      // Warm bioluminescent fairy-moss ambient glow
      const tentGlow = ctx.createRadialGradient(0, 0, 12, 0, 0, 118);
      tentGlow.addColorStop(0, 'rgba(244, 114, 182, 0.36)');
      tentGlow.addColorStop(0.6, 'rgba(52, 211, 153, 0.18)');
      tentGlow.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = tentGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 118, 0, Math.PI * 2);
      ctx.fill();

      // Ring of mossy river stones & soft emerald fern bed
      ctx.fillStyle = '#064e3b';
      ctx.beginPath();
      ctx.ellipse(0, 4, 72, 52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Plush rose-velvet & white fur sleeping pelt inside the hollow
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.roundRect(-52, -30, 104, 68, 16);
      ctx.fill();
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Soft cream fur pillows
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      ctx.roundRect(-38, -22, 32, 18, 6);
      ctx.roundRect(6, -22, 32, 18, 6);
      ctx.fill();

      // Crimson heart emblem on sleeping pelt
      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', 0, 22);

      // Overhanging Hollow Redwood Root Archway (draped over top half)
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-76, -8);
      ctx.quadraticCurveTo(0, -74, 76, -8);
      ctx.lineTo(56, -2);
      ctx.quadraticCurveTo(0, -46, -56, -2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#290f02';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Glowing cyan & pink bioluminescent mushrooms growing along the root arch
      for (let fl = -3; fl <= 3; fl++) {
        ctx.fillStyle = fl % 2 === 0 ? '#22d3ee' : '#f472b6';
        ctx.beginPath();
        ctx.arc(fl * 16, -34 + Math.abs(fl) * 4, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // Natural Bushes with multi-shaded leaves & berries
    for (const b of mapEnv.bushes) {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(b.x + b.radius * 0.2, b.y - b.radius * 0.2, b.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // Sweet wild berries
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(b.x + b.radius * 0.35, b.y - b.radius * 0.2, 3.5, 0, Math.PI * 2);
      ctx.arc(b.x - b.radius * 0.3, b.y + b.radius * 0.25, 3.5, 0, Math.PI * 2);
      ctx.arc(b.x, b.y + b.radius * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapEnv.id === 'beach') {
    // --- SUNSET BEACH STAGE: GOLDEN SAND, SURGING TIDE WAVES & CABANA RESORT ---
    // 1. Warm Sunset Golden Sand Base
    const sandGrad = ctx.createLinearGradient(0, 0, 0, arenaHeight);
    sandGrad.addColorStop(0, '#fde68a');
    sandGrad.addColorStop(0.55, '#fcd34d');
    sandGrad.addColorStop(0.75, '#d97706');
    sandGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = sandGrad;
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // 2. North Tropical Boardwalk Promenade (y: 0..170)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(0, 0, arenaWidth, 175);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    for (let bx = 0; bx < arenaWidth; bx += 36) {
      ctx.beginPath();
      ctx.moveTo(bx, 0);
      ctx.lineTo(bx, 175);
      ctx.stroke();
    }
    ctx.fillStyle = '#451a03';
    ctx.fillRect(0, 170, arenaWidth, 8);

    // Warm sunset fairy string lights along boardwalk edge
    for (let lx = 60; lx < arenaWidth; lx += 90) {
      const lGlow = ctx.createRadialGradient(lx, 174, 2, lx, 174, 36);
      lGlow.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
      lGlow.addColorStop(1, 'rgba(251, 113, 133, 0)');
      ctx.fillStyle = lGlow;
      ctx.beginPath();
      ctx.arc(lx, 174, 36, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = lx % 180 === 0 ? '#fef08a' : '#f472b6';
      ctx.beginPath();
      ctx.arc(lx, 174, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Beach Volleyball Court Markings in Center Sand (1040..1560, 740..1060)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.lineWidth = 3;
    ctx.strokeRect(1040, 740, 520, 320);

    // Decorative Starfish & Seashells on the sand
    const shells = [
      { x: 340, y: 420, c: '#fb7185', star: true },
      { x: 880, y: 310, c: '#fef08a', star: false },
      { x: 1680, y: 390, c: '#f472b6', star: true },
      { x: 2240, y: 510, c: '#fed7aa', star: false },
      { x: 460, y: 1120, c: '#fda4af', star: true },
      { x: 1920, y: 1180, c: '#fde047', star: true },
    ];
    for (const sh of shells) {
      ctx.fillStyle = sh.c;
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(sh.star ? '★' : '🐚', sh.x, sh.y);
    }

    // 4. Dynamic Surging Ocean Tide Waves & Shallow Water Zone (South Shoreline)
    const tideCycle = (Math.sin((r.gameTime * Math.PI * 2) / 9.0 - Math.PI / 2) + 1) * 0.5;
    const DynamicWaterLineY = 1480 - tideCycle * 360;

    // Wet dark sand left behind by high tide (y: 1120..1550)
    ctx.fillStyle = 'rgba(146, 64, 14, 0.35)';
    ctx.fillRect(0, 1120, arenaWidth, arenaHeight - 1120);

    // Translucent Turquoise Ocean Swell
    const oceanGrad = ctx.createLinearGradient(0, DynamicWaterLineY, 0, arenaHeight);
    oceanGrad.addColorStop(0, 'rgba(56, 189, 248, 0.52)');
    oceanGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.72)');
    oceanGrad.addColorStop(0.7, 'rgba(2, 132, 199, 0.88)');
    oceanGrad.addColorStop(1, 'rgba(3, 105, 161, 0.96)');
    ctx.fillStyle = oceanGrad;

    ctx.beginPath();
    ctx.moveTo(0, arenaHeight);
    ctx.lineTo(0, DynamicWaterLineY);
    for (let wx = 0; wx <= arenaWidth; wx += 40) {
      const waveCrestY = DynamicWaterLineY + Math.sin(wx * 0.018 + r.gameTime * 3.2) * 14;
      ctx.lineTo(wx, waveCrestY);
    }
    ctx.lineTo(arenaWidth, arenaHeight);
    ctx.closePath();
    ctx.fill();

    // Sparkling White Seafoam Crest Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let wx = 0; wx <= arenaWidth; wx += 40) {
      const waveCrestY = DynamicWaterLineY + Math.sin(wx * 0.018 + r.gameTime * 3.2) * 14;
      if (wx === 0) ctx.moveTo(wx, waveCrestY);
      else ctx.lineTo(wx, waveCrestY);
    }
    ctx.stroke();

    // Secondary trailing foam ripple
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let wx = 0; wx <= arenaWidth; wx += 40) {
      const waveCrestY = DynamicWaterLineY + 38 + Math.cos(wx * 0.022 - r.gameTime * 2.6) * 10;
      if (wx === 0) ctx.moveTo(wx, waveCrestY);
      else ctx.lineTo(wx, waveCrestY);
    }
    ctx.stroke();

    // --- BEACH CAPTURE SPOT: SUNSET CABANA DAYBED (1300, 310) ---
    {
      const cx = mapEnv.captureSpot.x;
      const cy = mapEnv.captureSpot.y;
      ctx.save();
      ctx.translate(cx, cy);

      // Warm sunset hibiscus glow
      const cabanaGlow = ctx.createRadialGradient(0, 0, 14, 0, 0, 125);
      cabanaGlow.addColorStop(0, 'rgba(244, 114, 182, 0.42)');
      cabanaGlow.addColorStop(0.6, 'rgba(251, 191, 36, 0.22)');
      cabanaGlow.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = cabanaGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 125, 0, Math.PI * 2);
      ctx.fill();

      // Teakwood resort deck platform
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-74, -52, 148, 104, 12);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Plush white & coral-pink resort daybed mattress
      ctx.fillStyle = '#fff1f2';
      ctx.beginPath();
      ctx.roundRect(-56, -36, 112, 72, 10);
      ctx.fill();
      ctx.strokeStyle = '#fb7185';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Coral throw blanket & twin pillows
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(-52, 4, 104, 28, 6);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.roundRect(-44, -28, 38, 20, 5);
      ctx.roundRect(6, -28, 38, 20, 5);
      ctx.fill();

      // Sheer flowing white canopy curtains at the 4 corners
      for (const px of [-64, 64]) {
        for (const py of [-42, 42]) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.beginPath();
          ctx.arc(px, py, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🌺 ♥ 🌺', 0, 24);
      ctx.restore();
    }

    // Tropical Hibiscus & Palm Bushes
    for (const b of mapEnv.bushes) {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.2, b.y - b.radius * 0.2, b.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      // Tropical pink/yellow hibiscus flowers
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(b.x + b.radius * 0.3, b.y - b.radius * 0.2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.25, b.y + b.radius * 0.3, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (mapEnv.id === 'home') {
    // --- SUBURBAN HOME: PLAYABLE EXTERIOR YARDS & FURNISHED INTERIOR ---
    // 1. Playable Exterior Yard Lawn across whole arena footprint
    ctx.fillStyle = '#081d11';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Subtle mowed grass stripes across outer yards
    ctx.fillStyle = 'rgba(20, 83, 45, 0.22)';
    for (let gx = 0; gx < arenaWidth; gx += 56) {
      ctx.fillRect(gx, 0, 28, arenaHeight);
    }

    // Outer Wooden Property Fence Border (Enclosing the entire Suburban Home property)
    ctx.strokeStyle = '#3e2723';
    ctx.lineWidth = 5;
    ctx.strokeRect(32, 32, arenaWidth - 64, arenaHeight - 64);

    // Fence pickets & corner lanterns
    ctx.strokeStyle = '#5d4037';
    ctx.lineWidth = 2;
    for (let fx = 40; fx < arenaWidth - 40; fx += 32) {
      ctx.strokeRect(fx, 30, 4, 8);
      ctx.strokeRect(fx, arenaHeight - 38, 4, 8);
    }
    for (let fy = 40; fy < arenaHeight - 40; fy += 32) {
      ctx.strokeRect(30, fy, 8, 4);
      ctx.strokeRect(arenaWidth - 38, fy, 8, 4);
    }

    // Warm glowing garden lanterns at property corners & fence midpoints
    const fenceLanterns = [
      { x: 50, y: 50 },
      { x: arenaWidth - 50, y: 50 },
      { x: 50, y: arenaHeight - 50 },
      { x: arenaWidth - 50, y: arenaHeight - 50 },
      { x: arenaWidth / 2, y: 50 },
      { x: 50, y: arenaHeight / 2 },
      { x: arenaWidth - 50, y: arenaHeight / 2 },
    ];
    for (const fl of fenceLanterns) {
      const flGrad = ctx.createRadialGradient(fl.x, fl.y, 6, fl.x, fl.y, 75);
      flGrad.addColorStop(0, 'rgba(254, 240, 138, 0.38)');
      flGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = flGrad;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 75, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- NORTH BACK YARD (y: 36..320) ---
    // Stone Patio outside Back Patio Door
    ctx.fillStyle = '#334155';
    ctx.fillRect(660 + HOME_OFFSET_X, 180, 360, 140);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(660 + HOME_OFFSET_X, 180, 360, 140);
    // Flagstone patio seams
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
    for (let psx = 660 + HOME_OFFSET_X; psx < 1020 + HOME_OFFSET_X; psx += 36) {
      ctx.beginPath();
      ctx.moveTo(psx, 180);
      ctx.lineTo(psx, 320);
      ctx.stroke();
    }

    // Back Garden stepping stones curving through lawn
    const backStones = [
      { x: 740 + HOME_OFFSET_X, y: 140 },
      { x: 790 + HOME_OFFSET_X, y: 110 },
      { x: 860 + HOME_OFFSET_X, y: 95 },
      { x: 930 + HOME_OFFSET_X, y: 120 },
      { x: 990 + HOME_OFFSET_X, y: 145 },
    ];
    ctx.fillStyle = '#475569';
    for (const st of backStones) {
      ctx.beginPath();
      ctx.ellipse(st.x, st.y, 14, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Back Yard Flower Beds with pastel blossoms
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.roundRect(140 + HOME_OFFSET_X, 60, 360, 32, 6);
    ctx.roundRect(1240 + HOME_OFFSET_X, 60, 380, 32, 6);
    ctx.fill();
    for (let fx = 155 + HOME_OFFSET_X; fx < 485 + HOME_OFFSET_X; fx += 22) {
      ctx.fillStyle = fx % 44 === 0 ? '#f43f5e' : '#facc15';
      ctx.beginPath();
      ctx.arc(fx, 76, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let fx = 1255 + HOME_OFFSET_X; fx < 1605 + HOME_OFFSET_X; fx += 22) {
      ctx.fillStyle = fx % 44 === 0 ? '#38bdf8' : '#ec4899';
      ctx.beginPath();
      ctx.arc(fx, 76, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Back Yard Zone Label
    ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🌿 BACK YARD PERIMETER', 840 + HOME_OFFSET_X, 70);

    // --- SOUTH FRONT YARD (y: 1690..2050) ---
    // Paved Front Walkway leading from Front Door to street sidewalk
    ctx.fillStyle = '#475569';
    ctx.fillRect(780 + HOME_OFFSET_X, 1370 + HOME_OFFSET_Y, 190, arenaHeight - (1370 + HOME_OFFSET_Y) - 50);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(780 + HOME_OFFSET_X, 1370 + HOME_OFFSET_Y, 190, arenaHeight - (1370 + HOME_OFFSET_Y) - 50);

    // Front Sidewalk border along bottom perimeter
    ctx.fillStyle = '#334155';
    ctx.fillRect(40, arenaHeight - 88, arenaWidth - 80, 48);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, arenaHeight - 88, arenaWidth - 80, 48);

    // Red Suburban Mailbox beside front walkway
    const mbX = 995 + HOME_OFFSET_X;
    const mbY = arenaHeight - 110;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.roundRect(mbX - 9, mbY - 14, 18, 14, 4);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.fillRect(mbX + 7, mbY - 10, 4, 3); // Red flag
    ctx.fillStyle = '#78350f';
    ctx.fillRect(mbX - 2.5, mbY, 5, 12); // Post

    // Front Porch Lamp Glow outside Front Door
    const porchLight = ctx.createRadialGradient(875 + HOME_OFFSET_X, 1370 + HOME_OFFSET_Y + 10, 8, 875 + HOME_OFFSET_X, 1370 + HOME_OFFSET_Y + 10, 95);
    porchLight.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    porchLight.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = porchLight;
    ctx.beginPath();
    ctx.arc(875 + HOME_OFFSET_X, 1370 + HOME_OFFSET_Y + 10, 95, 0, Math.PI * 2);
    ctx.fill();

    // Front Yard Zone Label
    ctx.fillStyle = 'rgba(74, 222, 128, 0.35)';
    ctx.font = '800 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏡 FRONT YARD & SIDEWALK', 875 + HOME_OFFSET_X, arenaHeight - 96);

    // --- WEST & EAST SIDE PATHS ---
    // Gravel garden path on West side
    ctx.fillStyle = 'rgba(100, 116, 139, 0.4)';
    ctx.fillRect(110, 220, 140, arenaHeight - 440);
    // Gravel garden path on East side
    ctx.fillRect(arenaWidth - 250, 220, 140, arenaHeight - 440);

    // Decorative Yard Bushes
    for (const b of mapEnv.bushes) {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.25, b.y - b.radius * 0.25, b.radius * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(b.x + b.radius * 0.3, b.y - b.radius * 0.2, 3, 0, Math.PI * 2);
      ctx.arc(b.x - b.radius * 0.3, b.y + b.radius * 0.25, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- INTERIOR HOUSE ROOMS (Translated cleanly by HOME_OFFSET_X, HOME_OFFSET_Y) ---
    ctx.save();
    ctx.translate(HOME_OFFSET_X, HOME_OFFSET_Y);

    // Concrete house foundation slab
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(70, 70, 1760, 1310);

    // 1. KITCHEN & DINING ROOM FLOOR (North-West: 80, 80, 660, 660)
    // Checkered ceramic kitchen tiles
    const tileSize = 44;
    for (let tx = 80; tx < 740; tx += tileSize) {
      for (let ty = 80; ty < 740; ty += tileSize) {
        const isWhite = (Math.floor(tx / tileSize) + Math.floor(ty / tileSize)) % 2 === 0;
        ctx.fillStyle = isWhite ? '#f8fafc' : '#cbd5e1';
        ctx.fillRect(tx, ty, tileSize, tileSize);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(tx, ty, tileSize, tileSize);
      }
    }

    // 2. LIVING ROOM FLOOR (North-East: 740, 80, 1052, 660)
    // Polished warm oak hardwood boards
    ctx.fillStyle = '#b45309';
    ctx.fillRect(740, 80, 1052, 660);
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
    ctx.lineWidth = 1.2;
    for (let px = 740; px < 1792; px += 36) {
      ctx.beginPath();
      ctx.moveTo(px, 80);
      ctx.lineTo(px, 740);
      ctx.stroke();
    }
    // Grand plush Persian-style living room carpet with ornamental trim
    ctx.fillStyle = '#831843';
    ctx.fillRect(960, 260, 440, 340);
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 4;
    ctx.strokeRect(960, 260, 440, 340);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(968, 268, 424, 324);
    // Carpet inner pattern
    ctx.fillStyle = 'rgba(251, 113, 133, 0.2)';
    ctx.beginPath();
    ctx.ellipse(1180, 430, 140, 90, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. MASTER BEDROOM FLOOR (South-East: 1080, 740, 712, 602)
    // Cherry parquet wood flooring
    ctx.fillStyle = '#78350f';
    ctx.fillRect(1080, 740, 712, 602);
    ctx.strokeStyle = 'rgba(69, 26, 3, 0.4)';
    ctx.lineWidth = 1;
    for (let by = 740; by < 1342; by += 32) {
      ctx.beginPath();
      ctx.moveTo(1080, by);
      ctx.lineTo(1792, by);
      ctx.stroke();
    }
    // Round bedside rug
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(1300, 1030, 100, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#bae6fd';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 4. BATHROOM FLOOR (South-West: 80, 740, 560, 602)
    // Aquamarine mosaic tiles
    const bTile = 32;
    for (let bx = 80; bx < 640; bx += bTile) {
      for (let by = 740; by < 1342; by += bTile) {
        const isAqua = (Math.floor(bx / bTile) + Math.floor(by / bTile)) % 2 === 0;
        ctx.fillStyle = isAqua ? '#06b6d4' : '#e0f2fe';
        ctx.fillRect(bx, by, bTile, bTile);
        ctx.strokeStyle = 'rgba(8, 145, 178, 0.35)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bTile, bTile);
      }
    }
    // Fluffy pink bath mat outside tub
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.roundRect(340, 785, 110, 65, 8);
    ctx.fill();
    ctx.strokeStyle = '#db2777';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 5. CENTRAL HALLWAY & FOYER (Center: 640, 740, 440, 602)
    ctx.fillStyle = '#92400e';
    ctx.fillRect(640, 740, 440, 602);
    ctx.strokeStyle = 'rgba(120, 53, 15, 0.3)';
    ctx.lineWidth = 1.2;
    for (let hx = 640; hx < 1080; hx += 35) {
      ctx.beginPath();
      ctx.moveTo(hx, 740);
      ctx.lineTo(hx, 1342);
      ctx.stroke();
    }
    // Foyer welcome runner rug
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(820, 840, 110, 460);
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2;
    ctx.strokeRect(820, 840, 110, 460);

    ctx.restore(); // Restore interior offset

    // --- REAL VISUAL DOORS & WINDOWS (Flush-Aligned with Wall Gaps & Barricades) ---
    for (const bp of mapEnv.breachPoints) {
      const bw = bp.w || 90;
      const bh = bp.h || 28;
      const centerX = bp.x + bw / 2;
      const centerY = bp.y + bh / 2;
      const isHorizontal = bw > bh;

      if (bp.isDoor) {
        // REAL WOODEN DOOR VISUAL (Aligned to gap center)
        ctx.save();
        ctx.translate(centerX, centerY);

        // Exterior Welcome / Entry Mat
        if (bp.id === 'front-door') {
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(-bw * 0.45, bh * 0.55, bw * 0.9, 24, 4);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 9px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('WELCOME', 0, bh * 0.55 + 16);
        }

        // Flush Door Frame Jambs matching wall thickness
        ctx.fillStyle = '#334155';
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);

        if (isHorizontal) {
          // Horizontal Doorway (Front Door, Back Door, Kitchen-Hall, Living-Hall)
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(-bw / 2, -bh / 2, bw * 0.85, 0, Math.PI / 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.save();
          ctx.translate(-bw / 2, -bh / 2);
          ctx.rotate(0.42);
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(0, 0, bw * 0.88, 10, 2);
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(bw * 0.88 - 8, 5, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // Vertical Doorway (Living-Bedroom, Bathroom-Hall)
          ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.arc(-bw / 2, -bh / 2, bh * 0.85, 0, Math.PI / 2);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.save();
          ctx.translate(-bw / 2, -bh / 2);
          ctx.rotate(0.42);
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(0, 0, 10, bh * 0.88, 2);
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(5, bh * 0.88 - 8, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.restore();
      } else if (bp.isWindow) {
        // REAL GLASS WINDOW VISUAL (Aligned flush to wall gap center)
        ctx.save();
        ctx.translate(centerX, centerY);

        // Window casing and wooden sill flush with wall gap
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-bw / 2 - 2, -bh / 2 - 2, bw + 4, bh + 4);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-bw / 2 - 2, -bh / 2 - 2, bw + 4, bh + 4);

        // Reflective tinted cyan glass pane
        ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
        ctx.fillRect(-bw / 2, -bh / 2, bw, bh);

        // Glass reflection diagonal glare stripes
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-bw / 2 + 4, bh / 2 - 4);
        ctx.lineTo(bw / 2 - 4, -bh / 2 + 4);
        ctx.stroke();

        // 4-pane crossbars
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -bh / 2);
        ctx.lineTo(0, bh / 2);
        ctx.moveTo(-bw / 2, 0);
        ctx.lineTo(bw / 2, 0);
        ctx.stroke();

        // Fabric curtains draped cleanly along the interior side of the window frame
        ctx.fillStyle = '#f472b6';
        if (isHorizontal) {
          ctx.beginPath();
          ctx.roundRect(-bw / 2 - 2, -bh / 2, 12, bh + 4, 3);
          ctx.roundRect(bw / 2 - 10, -bh / 2, 12, bh + 4, 3);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.roundRect(-bw / 2, -bh / 2 - 2, bw + 4, 12, 3);
          ctx.roundRect(-bw / 2, bh / 2 - 10, bw + 4, 12, 3);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Sanctuary Hearth Aura when ≥4 barricades are intact
    if (r.sanctuaryActive) {
      ctx.save();
      const hearthPulse = 0.12 + Math.sin(r.gameTime * 3) * 0.04;
      ctx.strokeStyle = `rgba(52, 211, 153, ${hearthPulse * 3})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(108 + HOME_OFFSET_X, 108 + HOME_OFFSET_Y, 1656, 1206);
      ctx.restore();
    }
  } else if (mapEnv.id === 'city') {
    // --- VIBRANT EXPANDED CITY METROPOLIS ---
    // Deep textured asphalt road surface
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Concrete Sidewalk Plazas with Curb Bevels & Tile Seams
    const sidewalkBands = [
      { y: 680, h: 160 },
      { y: 1120, h: 300 },
      { y: 1720, h: 140 },
    ];
    for (const sb of sidewalkBands) {
      // Concrete base
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, sb.y, arenaWidth, sb.h);

      // Granite curb stone borders
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, sb.y, arenaWidth, 6);
      ctx.fillRect(0, sb.y + sb.h - 6, arenaWidth, 6);

      // Concrete paver grid lines
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.45)';
      ctx.lineWidth = 1;
      for (let px = 0; px < arenaWidth; px += 48) {
        ctx.beginPath();
        ctx.moveTo(px, sb.y);
        ctx.lineTo(px, sb.y + sb.h);
        ctx.stroke();
      }

      // Yellow Tactile Paving Warning Strips at Road Crossing Corners
      for (let tx = 800; tx < arenaWidth; tx += 950) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(tx, sb.y + 1, 90, 8);
        ctx.fillRect(tx, sb.y + sb.h - 9, 90, 8);
      }
    }

    // Wide Multi-Lane Boulevards (North Avenue & South Avenue)
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 840, arenaWidth, 280);
    ctx.fillRect(0, 1420, arenaWidth, 300);

    // Double Solid Yellow Lane Dividers
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 977);
    ctx.lineTo(arenaWidth, 977);
    ctx.moveTo(0, 983);
    ctx.lineTo(arenaWidth, 983);
    ctx.moveTo(0, 1567);
    ctx.lineTo(arenaWidth, 1567);
    ctx.moveTo(0, 1573);
    ctx.lineTo(arenaWidth, 1573);
    ctx.stroke();

    // White Dashed Lane Dividers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.setLineDash([28, 22]);
    ctx.beginPath();
    ctx.moveTo(0, 910);
    ctx.lineTo(arenaWidth, 910);
    ctx.moveTo(0, 1050);
    ctx.lineTo(arenaWidth, 1050);
    ctx.moveTo(0, 1490);
    ctx.lineTo(arenaWidth, 1490);
    ctx.moveTo(0, 1650);
    ctx.lineTo(arenaWidth, 1650);
    ctx.stroke();
    ctx.setLineDash([]);

    // Solid White Stop Bars & Bold Zebra Crosswalks
    const crosswalkLocations = [850, 1850, 2850];
    for (const cx of crosswalkLocations) {
      // Stop bars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fillRect(cx - 30, 840, 8, 280);
      ctx.fillRect(cx - 30, 1420, 8, 300);

      // Zebra stripes
      for (let zx = cx; zx < cx + 110; zx += 24) {
        ctx.fillRect(zx, 840, 14, 280);
        ctx.fillRect(zx, 1420, 14, 300);
      }
    }

    // Cast-iron Manhole Covers & Storm Drain Grates
    const manholes = [
      { x: 500, y: 920 },
      { x: 1400, y: 1040 },
      { x: 2300, y: 920 },
      { x: 600, y: 1520 },
      { x: 1600, y: 1620 },
      { x: 2500, y: 1520 },
    ];
    for (const mh of manholes) {
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(mh.x, mh.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(mh.x, mh.y, 9, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Street Furniture on Central Plaza (y: 1120-1420)
    // 1. Bus Stop Shelters
    const busShelters = [{ x: 1100, y: 1160 }, { x: 2100, y: 1160 }];
    for (const bs of busShelters) {
      // Glass shelter frame
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bs.x - 35, bs.y - 15, 70, 30);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bs.x - 35, bs.y - 15, 70, 30);
      // Tinted glass back
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(bs.x - 33, bs.y - 13, 66, 26);
      // Lit transit map
      ctx.fillStyle = '#fde047';
      ctx.fillRect(bs.x - 20, bs.y - 8, 14, 16);
      // Bench
      ctx.fillStyle = '#92400e';
      ctx.fillRect(bs.x - 15, bs.y + 4, 30, 6);
    }

    // 2. Japanese-style Beverage Vending Machines
    const vendingMachines = [
      { x: 650, y: 1150, c: '#ef4444', label: 'COLA' },
      { x: 700, y: 1150, c: '#06b6d4', label: 'TEA' },
      { x: 1750, y: 1150, c: '#ec4899', label: 'MILK' },
    ];
    for (const vm of vendingMachines) {
      ctx.fillStyle = vm.c;
      ctx.beginPath();
      ctx.roundRect(vm.x - 12, vm.y - 18, 24, 36, 3);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Lit display window
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fillRect(vm.x - 9, vm.y - 14, 18, 14);

      // Lit buttons
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(vm.x - 4, vm.y + 6, 2, 0, Math.PI * 2);
      ctx.arc(vm.x + 4, vm.y + 6, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Fire Hydrants
    const hydrants = [{ x: 450, y: 1140 }, { x: 1550, y: 1140 }, { x: 2650, y: 1140 }];
    for (const hy of hydrants) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(hy.x - 6, hy.y - 10, 12, 20, 4);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.fillRect(hy.x - 8, hy.y - 4, 16, 4);
    }

    // 4. Streetlamps casting warm lighting pools onto roads
    const streetlamps = [
      { x: 300, y: 840 },
      { x: 1000, y: 840 },
      { x: 1700, y: 840 },
      { x: 2400, y: 840 },
      { x: 600, y: 1420 },
      { x: 1300, y: 1420 },
      { x: 2000, y: 1420 },
      { x: 2700, y: 1420 },
    ];
    for (const sl of streetlamps) {
      // Warm circular light pool
      const slGrad = ctx.createRadialGradient(sl.x, sl.y, 10, sl.x, sl.y, 90);
      slGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      slGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = slGrad;
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, 90, 0, Math.PI * 2);
      ctx.fill();

      // Lamp pole base
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- CITY CAPTURE SPOT: PINK NEON LOVE HOTEL VIP CRUISER & CARPET (1750, 1265) ---
    {
      const cx = mapEnv.captureSpot.x;
      const cy = mapEnv.captureSpot.y;
      ctx.save();
      ctx.translate(cx, cy);

      // Neon pink street glow
      const hotelGlow = ctx.createRadialGradient(0, 0, 15, 0, 0, 130);
      hotelGlow.addColorStop(0, 'rgba(236, 72, 153, 0.42)');
      hotelGlow.addColorStop(0.6, 'rgba(168, 85, 247, 0.18)');
      hotelGlow.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = hotelGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 130, 0, Math.PI * 2);
      ctx.fill();

      // Red velvet VIP runner carpet with gold stanchion ropes
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.roundRect(-75, -48, 150, 96, 10);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Plush heart lounge bed / VIP limo sunbed in center
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.roundRect(-52, -30, 104, 60, 14);
      ctx.fill();
      ctx.strokeStyle = '#fda4af';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥ HOTEL AMOUR VIP ♥', 0, -35);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('💖', 0, 8);
      ctx.restore();
    }
  } else if (mapEnv.id === 'mansion') {
    // --- GOTHIC VICTORIAN HAUNTED MANSION ENVIRONMENT ---
    // Exterior midnight graveyard grounds
    ctx.fillStyle = '#070510';
    ctx.fillRect(0, 0, arenaWidth, arenaHeight);

    // Interior Dark Mahogany & Checkered Gothic Marble Floor (140..2260, 140..1860)
    ctx.fillStyle = '#140c24';
    ctx.fillRect(140, 140, 2120, 1720);

    // Subtle gothic diamond floor tiles
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
    ctx.lineWidth = 1;
    const tileStep = 64;
    for (let gx = 140; gx <= 2260; gx += tileStep) {
      ctx.beginPath();
      ctx.moveTo(gx, 140);
      ctx.lineTo(gx, 1860);
      ctx.stroke();
    }
    for (let gy = 140; gy <= 1860; gy += tileStep) {
      ctx.beginPath();
      ctx.moveTo(140, gy);
      ctx.lineTo(2260, gy);
      ctx.stroke();
    }

    // Grand Foyer Crimson & Gold Velvet Runner Carpet (Center Wing)
    ctx.fillStyle = '#4c0519';
    ctx.fillRect(920, 200, 560, 1580);
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 3;
    ctx.strokeRect(928, 208, 544, 1564);

    // West Library Royal Amethyst Rug
    ctx.fillStyle = '#2e1065';
    ctx.beginPath();
    ctx.roundRect(220, 220, 520, 680, 12);
    ctx.fill();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.stroke();

    // South-West Velvet Parlor Bordeaux Rug
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.roundRect(220, 1060, 520, 700, 12);
    ctx.fill();
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2;
    ctx.stroke();

    // East Banquet Hall Ornate Runner
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(1640, 220, 520, 680, 12);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Flickering Gothic Candelabras on Pedestals
    const candelabras = [
      { x: 900, y: 320 },
      { x: 1500, y: 320 },
      { x: 900, y: 980 },
      { x: 1500, y: 980 },
      { x: 900, y: 1640 },
      { x: 1500, y: 1640 },
      { x: 480, y: 520 },
      { x: 1920, y: 640 },
      { x: 480, y: 1520 },
      { x: 1920, y: 1560 },
    ];
    for (const cb of candelabras) {
      const flicker = Math.sin(r.gameTime * 9 + cb.x) * 4;
      const cGrad = ctx.createRadialGradient(cb.x, cb.y, 4, cb.x, cb.y, 70 + flicker);
      cGrad.addColorStop(0, 'rgba(253, 224, 71, 0.45)');
      cGrad.addColorStop(0.5, 'rgba(249, 115, 22, 0.18)');
      cGrad.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = cGrad;
      ctx.beginPath();
      ctx.arc(cb.x, cb.y, 70 + flicker, 0, Math.PI * 2);
      ctx.fill();

      // Golden candelabra base
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(cb.x, cb.y, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cb.x, cb.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- MANSION CAPTURE SPOT: GOTHIC VELVET FOUR-POSTER CANOPY ALTAR BED (1200, 1020) ---
    {
      const mx = mapEnv.captureSpot.x;
      const my = mapEnv.captureSpot.y;
      ctx.save();
      ctx.translate(mx, my);

      // Rose-crimson candlelit aura
      const altarGlow = ctx.createRadialGradient(0, 0, 15, 0, 0, 135);
      altarGlow.addColorStop(0, 'rgba(225, 29, 72, 0.42)');
      altarGlow.addColorStop(0.55, 'rgba(147, 51, 234, 0.22)');
      altarGlow.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = altarGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 135, 0, Math.PI * 2);
      ctx.fill();

      // Ornate gilded mahogany platform
      ctx.fillStyle = '#2e1065';
      ctx.beginPath();
      ctx.roundRect(-74, -54, 148, 108, 10);
      ctx.fill();
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Crimson silk mattress & black lace pillows
      ctx.fillStyle = '#9f1239';
      ctx.beginPath();
      ctx.roundRect(-56, -38, 112, 76, 8);
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.roundRect(-44, -30, 38, 20, 5);
      ctx.roundRect(6, -30, 38, 20, 5);
      ctx.fill();

      // Four golden canopy posts
      for (const px of [-66, 66]) {
        for (const py of [-46, 46]) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(px, py, 5.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.fillStyle = '#fecdd3';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', 0, 16);
      ctx.restore();
    }
  }

  // --- DRAW WALLS & STOREFRONTS ---
  for (const w of mapEnv.walls) {
    if (mapEnv.id === 'city') {
      // REAL ARCHITECTURAL METROPOLIS STOREFRONTS & BUILDINGS
      ctx.save();
      // Main structure block
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(w.x, w.y, w.w, w.h);

      // Neon Building Perimeter Roof Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(w.x, w.y, w.w, w.h);

      // Upper floor lit windows grid
      const winW = 34;
      const winH = 26;
      for (let wx = w.x + 35; wx < w.x + w.w - 50; wx += 60) {
        for (let wy = w.y + 45; wy < w.y + w.h - 140; wy += 55) {
          const isLit = (Math.floor(wx / 60) + Math.floor(wy / 55)) % 3 !== 0;
          ctx.fillStyle = isLit ? 'rgba(254, 240, 138, 0.55)' : 'rgba(30, 41, 59, 0.8)';
          ctx.fillRect(wx, wy, winW, winH);
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 1;
          ctx.strokeRect(wx, wy, winW, winH);
        }
      }

      // Ground Floor Vibrant Storefronts on the street-facing side
      const isNorthBlock = w.y < 1000;
      const streetY = isNorthBlock ? w.y + w.h - 110 : w.y;

      if (w.label === 'Plaza Tower A') {
        // CHERRY SWEET BOUTIQUE
        // Pink & White Striped Awning
        const awningH = 34;
        const awningY = isNorthBlock ? streetY + 70 : streetY;
        const stripeW = 20;
        for (let ax = w.x + 20; ax < w.x + w.w - 20; ax += stripeW) {
          const isPink = Math.floor(ax / stripeW) % 2 === 0;
          ctx.fillStyle = isPink ? '#f43f5e' : '#f8fafc';
          ctx.fillRect(ax, awningY, stripeW, awningH);
        }

        // Store Display Window & Mannequins
        ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
        ctx.fillRect(w.x + 40, streetY + 15, w.w - 80, 50);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 40, streetY + 15, w.w - 80, 50);

        // Neon Signboard
        ctx.fillStyle = '#f43f5e';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 10;
        ctx.fillText('★ CHERRY SWEET BOUTIQUE ★', w.x + w.w / 2, streetY - 5);
        ctx.shadowBlur = 0;
      } else if (w.label === 'Grand Hotel B') {
        // CYBER ARCADE & GAMING
        ctx.fillStyle = '#a855f7';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;
        ctx.fillText('⚡ CYBER ARCADE 80s ⚡', w.x + w.w / 2, streetY - 5);
        ctx.shadowBlur = 0;

        // Glowing arcade pixel display marquee
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(w.x + 40, streetY + 15, w.w - 80, 55);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 40, streetY + 15, w.w - 80, 55);

        // Neon CRT pixel graphics inside
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(w.x + 80, streetY + 25, 24, 24);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(w.x + 140, streetY + 25, 24, 24);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(w.x + 200, streetY + 25, 24, 24);
      } else if (w.label === 'Financial Center C') {
        // METROPOLIS TOWER C
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.fillText('METRO FINANCIAL CENTER', w.x + w.w / 2, streetY - 5);
        ctx.shadowBlur = 0;

        // Marble entrance & glass atrium
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w.x + 60, streetY + 10, w.w - 120, 60);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 60, streetY + 10, w.w - 120, 60);
      } else if (w.label === 'Metropolis Mall D') {
        // MATCHA BOBA CAFE
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#34d399';
        ctx.shadowBlur = 10;
        ctx.fillText('🍵 MATCHA BOBA TEA CAFE', w.x + w.w / 2, streetY + 30);
        ctx.shadowBlur = 0;

        // Green striped awning
        const stripeW = 20;
        for (let ax = w.x + 20; ax < w.x + w.w - 20; ax += stripeW) {
          const isGreen = Math.floor(ax / stripeW) % 2 === 0;
          ctx.fillStyle = isGreen ? '#059669' : '#f8fafc';
          ctx.fillRect(ax, streetY + 45, stripeW, 28);
        }
      } else if (w.label === 'Arcade Complex E') {
        // TOKYO MIDNIGHT RAMEN
        ctx.fillStyle = '#f97316';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#fb923c';
        ctx.shadowBlur = 10;
        ctx.fillText('🍜 TOKYO MIDNIGHT RAMEN', w.x + w.w / 2, streetY + 30);
        ctx.shadowBlur = 0;

        // Glowing red paper lanterns
        for (let lx = w.x + 80; lx < w.x + w.w - 80; lx += 80) {
          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.roundRect(lx - 10, streetY + 45, 20, 26, 6);
          ctx.fill();
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(lx - 2, streetY + 54, 4, 8);
        }
      } else {
        // 24/7 CONVENIENCE MART
        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 15px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;
        ctx.fillText('🏪 24H CONVENIENCE MART', w.x + w.w / 2, streetY + 30);
        ctx.shadowBlur = 0;

        // Bright supermarket display window
        ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.fillRect(w.x + 40, streetY + 45, w.w - 80, 50);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x + 40, streetY + 45, w.w - 80, 50);
      }

      ctx.restore();
    } else if (mapEnv.id === 'forest') {
      // NATURAL WILDERNESS OBSTACLES: FALLEN REDWOOD LOGS & JAGGED MOSSY GRANITE CRAGS
      ctx.save();
      if (w.furnitureType === 'fallen_log') {
        // Massive fallen redwood trunk with weathered bark striations, hollow ends & shelf fungi
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 12);
        ctx.fill();
        ctx.strokeStyle = '#290f02';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Bark grain lines
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.75)';
        ctx.lineWidth = 1.5;
        if (w.w > w.h) {
          for (let ly = w.y + 8; ly < w.y + w.h - 6; ly += 8) {
            ctx.beginPath();
            ctx.moveTo(w.x + 10, ly);
            ctx.lineTo(w.x + w.w - 10, ly);
            ctx.stroke();
          }
        } else {
          for (let lx = w.x + 8; lx < w.x + w.w - 6; lx += 8) {
            ctx.beginPath();
            ctx.moveTo(lx, w.y + 10);
            ctx.lineTo(lx, w.y + w.h - 10);
            ctx.stroke();
          }
        }

        // Lush forest moss & golden shelf fungi along the trunk
        ctx.fillStyle = '#15803d';
        const steps = Math.max(2, Math.floor(Math.max(w.w, w.h) / 55));
        for (let s = 1; s < steps; s++) {
          const mx = w.w > w.h ? w.x + (w.w / steps) * s : w.x + w.w * 0.5;
          const my = w.w > w.h ? w.y + w.h * 0.35 : w.y + (w.h / steps) * s;
          ctx.beginPath();
          ctx.ellipse(mx, my, 16, 7, 0.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(mx + 10, my - 4, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#15803d';
        }
      } else {
        // Jagged Mossy Granite Outcrop / Crag
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 14);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Faceted granite ridge highlights
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(w.x + 8, w.y + 8, w.w * 0.65, w.h * 0.55, 10);
        ctx.fill();

        // Thick emerald moss blanket & creeping ferns
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.ellipse(w.x + w.w * 0.35, w.y + w.h * 0.3, w.w * 0.28, w.h * 0.22, -0.2, 0, Math.PI * 2);
        ctx.ellipse(w.x + w.w * 0.7, w.y + w.h * 0.65, w.w * 0.22, w.h * 0.2, 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (mapEnv.id === 'beach') {
      // SUNSET BEACH OBSTACLES: TIKI BAR, LIFEGUARD TOWER, VOLLEYBALL NET, CABANAS & ROCKS
      ctx.save();
      const fType = w.furnitureType || 'wall';
      if (fType === 'tiki_bar') {
        // Tropical Thatched-Roof Tiki Surf Bar & Lounge
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 10);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Woven golden palm thatch roof stripes
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.roundRect(w.x + 8, w.y + 8, w.w - 16, w.h - 22, 8);
        ctx.fill();
        // Colorful surfboards & tropical drinks on counter
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(w.x + 45, w.y + w.h - 8, 22, 6, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(w.x + w.w - 45, w.y + w.h - 8, 22, 6, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 12px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🍹 SUNSET TIKI SURF BAR 🌺', w.x + w.w / 2, w.y + w.h / 2 + 4);
      } else if (fType === 'lifeguard_tower') {
        // Iconic Red & White Wooden Lifeguard Tower
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 8);
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Red rescue cross & life buoy
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(w.x + w.w / 2 - 14, w.y + w.h / 2 - 4, 28, 8);
        ctx.fillRect(w.x + w.w / 2 - 4, w.y + w.h / 2 - 14, 8, 28);
      } else if (fType === 'volleyball_net') {
        // Crisp Beach Volleyball Net & Yellow Side Poles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(w.x, w.y + 4, w.w, w.h - 8);
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y + 4, w.w, w.h - 8);
        // Net mesh crosshatch
        for (let nx = w.x + 12; nx < w.x + w.w; nx += 14) {
          ctx.beginPath();
          ctx.moveTo(nx, w.y + 4);
          ctx.lineTo(nx, w.y + w.h - 4);
          ctx.stroke();
        }
        // End poles
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(w.x, w.y + w.h / 2, 7, 0, Math.PI * 2);
        ctx.arc(w.x + w.w, w.y + w.h / 2, 7, 0, Math.PI * 2);
        ctx.fill();
      } else if (fType === 'beach_cabana') {
        // Striped Resort Sun Lounger & Umbrella
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 8);
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        for (let sx = w.x + 8; sx < w.x + w.w - 8; sx += 24) {
          ctx.fillRect(sx, w.y + 4, 12, w.h - 8);
        }
        ctx.strokeStyle = '#be123c';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      } else {
        // Tidal Coral Reef Rock Outcrop with Barnacles & Starfish
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.roundRect(w.x, w.y, w.w, w.h, 18);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(w.x + w.w * 0.3, w.y + w.h * 0.35, 8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (mapEnv.id === 'home' || mapEnv.id === 'mansion') {
      // REAL FURNITURE OBSTACLES & DETAILED WALLS
      const fType = w.furnitureType || 'wall';

      switch (fType) {
        case 'sofa': {
          // Cushioned plush sectional sofa
          ctx.fillStyle = '#be123c';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 10);
          ctx.fill();
          ctx.strokeStyle = '#9f1239';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Individual cushion seams
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          const cushionCount = Math.max(2, Math.floor(w.w / 60));
          for (let c = 1; c < cushionCount; c++) {
            ctx.beginPath();
            ctx.moveTo(w.x + (w.w / cushionCount) * c, w.y + 6);
            ctx.lineTo(w.x + (w.w / cushionCount) * c, w.y + w.h - 6);
            ctx.stroke();
          }
          // Pastel throw pillows
          ctx.fillStyle = '#fde047';
          ctx.fillRect(w.x + 8, w.y + 8, 20, 20);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(w.x + w.w - 28, w.y + 8, 20, 20);
          break;
        }

        case 'table': {
          // Polished hardwood dining / coffee table
          ctx.fillStyle = '#78350f';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 6);
          ctx.fill();
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Beveled inner edge
          ctx.strokeStyle = 'rgba(254, 215, 170, 0.3)';
          ctx.strokeRect(w.x + 4, w.y + 4, w.w - 8, w.h - 8);
          // Coffee mug / placemat
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(w.x + w.w / 2, w.y + w.h / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'counter': {
          // Speckled granite kitchen counter with sink
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Double stainless sink basin
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(w.x + 30, w.y + 10, 40, 32);
          ctx.fillRect(w.x + 75, w.y + 10, 40, 32);
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(w.x + 72, w.y + 26, 4, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'island': {
          // Granite kitchen island with barstools
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 8);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Wooden barstools along bottom edge
          for (let s = 25; s < w.w - 20; s += 50) {
            ctx.fillStyle = '#b45309';
            ctx.beginPath();
            ctx.arc(w.x + s, w.y + w.h + 10, 9, 0, Math.PI * 2);
            ctx.fill();
          }
          break;
        }

        case 'fridge': {
          // Stainless steel french-door refrigerator
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Vertical split & handles
          ctx.strokeStyle = '#334155';
          ctx.beginPath();
          ctx.moveTo(w.x + w.w / 2, w.y);
          ctx.lineTo(w.x + w.w / 2, w.y + w.h);
          ctx.stroke();
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(w.x + w.w / 2 - 5, w.y + 20, 2, 24);
          ctx.fillRect(w.x + w.w / 2 + 3, w.y + 20, 2, 24);
          break;
        }

        case 'bed': {
          // Master King Size Bed with duvet & 4 fluffy pillows
          // Wooden headboard
          ctx.fillStyle = '#451a03';
          ctx.fillRect(w.x, w.y, w.w, 18);
          // Mattress with soft pastel rose duvet
          ctx.fillStyle = '#fda4af';
          ctx.beginPath();
          ctx.roundRect(w.x + 8, w.y + 22, w.w - 16, w.h - 26, 8);
          ctx.fill();
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Folded sheet accent
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(w.x + 8, w.y + 22, w.w - 16, 28);
          // 4 Fluffy white pillows
          ctx.fillStyle = '#f8fafc';
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1;
          const pw = (w.w - 40) / 2;
          ctx.beginPath();
          ctx.roundRect(w.x + 14, w.y + 26, pw, 24, 4);
          ctx.roundRect(w.x + 22 + pw, w.y + 26, pw, 24, 4);
          ctx.fill();
          ctx.stroke();
          break;
        }

        case 'tub': {
          // Porcelain white bathtub with chrome taps
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 16);
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.stroke();
          // Water basin
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.roundRect(w.x + 8, w.y + 8, w.w - 16, w.h - 16, 12);
          ctx.fill();
          // Chrome faucet
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(w.x + 20, w.y + w.h / 2, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'vanity': {
          // Vanity counter with double sink
          ctx.fillStyle = '#e2e8f0';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Sinks
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(w.x + 45, w.y + w.h / 2, 22, 16, 0, 0, Math.PI * 2);
          ctx.ellipse(w.x + w.w - 45, w.y + w.h / 2, 22, 16, 0, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'toilet': {
          // White ceramic toilet
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(w.x, w.y, w.w, 22); // tank
          ctx.beginPath();
          ctx.ellipse(w.x + w.w / 2, w.y + 44, 18, 24, 0, 0, Math.PI * 2); // bowl
          ctx.fill();
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.stroke();
          break;
        }

        case 'tv': {
          // OLED TV on media console
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(w.x, w.y, w.w, w.h);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(w.x, w.y, w.w, w.h);
          // Glowing screen line & standby LED
          ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
          ctx.fillRect(w.x + 8, w.y + 4, w.w - 16, w.h - 8);
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(w.x + w.w - 10, w.y + w.h - 6, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        case 'wardrobe': {
          // Solid oak wardrobe
          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(w.x, w.y, w.w, w.h, 4);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.stroke();
          // Door divider and brass handles
          ctx.strokeStyle = '#290e02';
          ctx.beginPath();
          ctx.moveTo(w.x + w.w / 2, w.y);
          ctx.lineTo(w.x + w.w / 2, w.y + w.h);
          ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.arc(w.x + w.w / 2 - 6, w.y + w.h / 2, 3, 0, Math.PI * 2);
          ctx.arc(w.x + w.w / 2 + 6, w.y + w.h / 2, 3, 0, Math.PI * 2);
          ctx.fill();
          break;
        }

        default: {
          if (mapEnv.id === 'mansion') {
            // Victorian gothic mahogany & amethyst wainscoting wall with antique gold trim
            ctx.fillStyle = '#2e1065';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.strokeRect(w.x, w.y, w.w, w.h);
          } else {
            // Solid interior drywall partition with baseboards
            ctx.fillStyle = '#334155';
            ctx.fillRect(w.x, w.y, w.w, w.h);
            ctx.strokeStyle = '#64748b';
            ctx.lineWidth = 2;
            ctx.strokeRect(w.x, w.y, w.w, w.h);
          }
          break;
        }
      }
    } else {
      ctx.fillStyle = '#334155';
      ctx.fillRect(w.x, w.y, w.w, w.h);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(w.x, w.y, w.w, w.h);
    }
  }

  // Puddles & Ground Hazards
  for (const p of r.puddles) {
    if (p.type === 'caution') {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.25)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (p.type === 'skidmark') {
      // Delinquent glowing neon crimson spray-paint skidmark
      ctx.save();
      ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.radius * 1.4, p.radius * 0.7, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.75)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else if (p.type === 'spike_strip') {
      // Tactical Officer steel spike strip
      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(p.x - 22, p.y - 6, 44, 12);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.strokeRect(p.x - 22, p.y - 6, 44, 12);
      // Sharp silver spikes
      ctx.fillStyle = '#f1f5f9';
      for (let sp = -18; sp <= 18; sp += 6) {
        ctx.beginPath();
        ctx.moveTo(p.x + sp - 2, p.y + 4);
        ctx.lineTo(p.x + sp, p.y - 8);
        ctx.lineTo(p.x + sp + 2, p.y + 4);
        ctx.fill();
      }
      ctx.restore();
    } else if (p.type === 'smoke') {
      // Delinquent Brawler Smoke Bomb Cloud
      ctx.save();
      const smokeGrad = ctx.createRadialGradient(p.x, p.y, 12, p.x, p.y, p.radius);
      smokeGrad.addColorStop(0, 'rgba(30, 41, 59, 0.85)');
      smokeGrad.addColorStop(0.6, 'rgba(71, 85, 105, 0.65)');
      smokeGrad.addColorStop(1, 'rgba(71, 85, 105, 0)');
      ctx.fillStyle = smokeGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // Scalding coffee puddle with rising steam (Shiny Senpai's coffee has a golden slippery sheen!)
      ctx.save();
      ctx.fillStyle = p.isShinyCoffee ? 'rgba(146, 64, 14, 0.62)' : 'rgba(120, 53, 15, 0.45)';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = p.isShinyCoffee ? '#fde047' : 'rgba(217, 119, 6, 0.7)';
      ctx.lineWidth = p.isShinyCoffee ? 2.2 : 1.5;
      ctx.stroke();
      // Steam swirl
      ctx.strokeStyle = p.isShinyCoffee ? 'rgba(254, 240, 138, 0.65)' : 'rgba(254, 215, 170, 0.4)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const steamY = p.y - 6 + Math.sin(r.gameTime * 4 + p.id) * 3;
      ctx.moveTo(p.x - 6, steamY);
      ctx.quadraticCurveTo(p.x, steamY - 8, p.x + 6, steamY - 14);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Suburban Home Breakable Barricades & Breaches
  if (mapEnv.id === 'home' && mapEnv.breachPoints) {
    for (const bp of mapEnv.breachPoints) {
      if (bp.isBarricaded && (bp.barricadeHp || 0) > 0) {
        ctx.save();
        // Sturdy wooden plank barricade
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bp.x, bp.y, bp.w, bp.h);
        ctx.strokeStyle = '#451a03';
        ctx.lineWidth = 2;
        ctx.strokeRect(bp.x, bp.y, bp.w, bp.h);

        const isHorizontal = bp.w > bp.h;
        if (isHorizontal) {
          for (let px = bp.x + 16; px < bp.x + bp.w; px += 22) {
            ctx.beginPath();
            ctx.moveTo(px, bp.y);
            ctx.lineTo(px, bp.y + bp.h);
            ctx.stroke();
            // Iron fasteners
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(px - 1, bp.y + 3, 3, 3);
            ctx.fillRect(px - 1, bp.y + bp.h - 6, 3, 3);
          }
        } else {
          for (let py = bp.y + 16; py < bp.y + bp.h; py += 22) {
            ctx.beginPath();
            ctx.moveTo(bp.x, py);
            ctx.lineTo(bp.x + bp.w, py);
            ctx.stroke();
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(bp.x + 3, py - 1, 3, 3);
            ctx.fillRect(bp.x + bp.w - 6, py - 1, 3, 3);
          }
        }

        // Barricade Durability Bar
        const maxHp = bp.maxBarricadeHp || 100;
        const hpRatio = Math.max(0, Math.min(1, (bp.barricadeHp || 0) / maxHp));
        const barW = Math.max(38, isHorizontal ? bp.w * 0.75 : 46);
        const barH = 5;
        const barX = bp.x + bp.w / 2 - barW / 2;
        const barY = isHorizontal ? bp.y - 9 : bp.y - 12;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barW, barH);

        // Cracking splinters if damaged
        if (hpRatio < 0.6) {
          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(bp.x + bp.w * 0.3, bp.y + bp.h * 0.3);
          ctx.lineTo(bp.x + bp.w * 0.5, bp.y + bp.h * 0.7);
          ctx.lineTo(bp.x + bp.w * 0.7, bp.y + bp.h * 0.4);
          ctx.stroke();
        }

        ctx.restore();
      } else if (bp.breached) {
        // Breached open frame with shattered wood remnants
        ctx.save();
        ctx.fillStyle = 'rgba(69, 26, 3, 0.4)';
        ctx.fillRect(bp.x, bp.y, bp.w, bp.h);
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(bp.x, bp.y, bp.w, bp.h);
        ctx.setLineDash([]);

        // Small wood fragments
        ctx.fillStyle = '#78350f';
        ctx.fillRect(bp.x - 4, bp.y - 4, 6, 4);
        ctx.fillRect(bp.x + bp.w - 3, bp.y + bp.h - 3, 5, 5);
        ctx.restore();
      }
    }

    // Floating Hold-[E] Repair Target Indicator & Progress Ring
    if (r.repairTarget) {
      const rt = r.repairTarget;
      const rx = rt.x + rt.w / 2;
      const ry = rt.y + rt.h / 2;
      ctx.save();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(rt.x - 3, rt.y - 3, rt.w + 6, rt.h + 6);

      // Circular progress badge above breach
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.arc(rx, ry - 24, 15, 0, Math.PI * 2);
      ctx.fill();

      if (rt.progress > 0) {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(rx, ry - 24, 15, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * rt.progress);
        ctx.stroke();
      } else {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(rx, ry - 24, 15, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', rx, ry - 24);
      ctx.restore();
    }
  }

  ctx.restore();
}

/** Draws moving traffic cars */
export function drawCars(r: RenderContext) {
  if (r.mapEnv.id !== 'city') return;
  const { ctx, cameraX, cameraY, cars } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const car of cars) {
    ctx.save();
    ctx.translate(car.x, car.y);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(-car.w / 2, -car.h / 2 + 5, car.w, car.h);

    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.roundRect(-car.w / 2, -car.h / 2, car.w, car.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-car.w * 0.2, -car.h * 0.38, car.w * 0.45, car.h * 0.76);

    const headX = car.vx > 0 ? car.w / 2 : -car.w / 2;
    const beamDir = car.vx > 0 ? 1 : -1;
    const beamGrad = ctx.createRadialGradient(headX, 0, 5, headX + beamDir * 120, 0, 100);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(headX, -10);
    ctx.lineTo(headX + beamDir * 160, -35);
    ctx.lineTo(headX + beamDir * 160, 35);
    ctx.lineTo(headX, 10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/** Draws neutral civilians in City that visually resemble pursuers and move erratically */
export function drawCivilians(r: RenderContext) {
  if (r.mapEnv.id !== 'city') return;
  const { ctx, cameraX, cameraY, civilians, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const c of civilians) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const moving = Math.hypot(c.vx, c.vy) > 5;
    const legBob = moving ? Math.sin(gameTime * 11 + c.id) * 3 : 0;
    const hairSwish = moving ? Math.sin(gameTime * 8 + c.id) * 2 : 0;
    const seed = c.id % 4;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 13, 9, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate slightly towards facing angle
    if (c.facingAngle !== undefined) {
      // Facing angle orientation for walking
      const flip = Math.cos(c.facingAngle) < 0 ? -1 : 1;
      ctx.scale(flip, 1);
    }

    // Legs with stylish footwear (heels / boots)
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = seed === 0 ? '#1e293b' : seed === 1 ? '#475569' : '#0f172a';
    ctx.beginPath();
    ctx.moveTo(-3, 6);
    ctx.lineTo(-3, 13 + legBob);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3, 6);
    ctx.lineTo(3, 13 - legBob);
    ctx.stroke();

    // Cute shoes
    ctx.fillStyle = c.color;
    ctx.fillRect(-4.5, 12 + legBob, 3.5, 3);
    ctx.fillRect(1.5, 12 - legBob, 3.5, 3);

    // Chic stylish anime outfit (resembles pursuers!)
    if (seed === 0) {
      // Trench coat & dark turtleneck
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(-7, -4, 14, 11, 2);
      ctx.fill();
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(-3, -3, 6, 6);
    } else if (seed === 1) {
      // Fashionable blazer & pleated skirt
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.roundRect(-6.5, -4, 13, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, 4, 12, 4);
    } else if (seed === 2) {
      // Stylish cropped casual jacket & belt
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(-6.5, -4, 13, 9, 2);
      ctx.fill();
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-2, -3, 4, 4);
    } else {
      // Oversized pastel knit sweater
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.roundRect(-7, -4, 14, 11, 4);
      ctx.fill();
    }

    // Head with porcelain fair skin
    ctx.fillStyle = '#ffe4e6';
    ctx.beginPath();
    ctx.arc(0, -10, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Anime hairstyles (blonde twintails, black bob, wavy auburn, etc.)
    if (seed === 0) {
      // Blonde twintails (looks like Gyaru!)
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, -11, 8, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-8, -9 + hairSwish, 3.5, 7, -0.2, 0, Math.PI * 2);
      ctx.ellipse(8, -9 - hairSwish, 3.5, 7, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (seed === 1) {
      // Sleek black bob with pink hairband
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(0, -11, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(-8, -10, 3, 9);
      ctx.fillRect(5, -10, 3, 9);
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(-7, -13, 14, 2);
    } else if (seed === 2) {
      // Auburn wavy side ponytail (looks like Tomboy/Sheriff!)
      ctx.fillStyle = '#b45309';
      ctx.beginPath();
      ctx.arc(0, -11, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(8, -9 + hairSwish, 4, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Lavender-silver short chic haircut
      ctx.fillStyle = '#c084fc';
      ctx.beginPath();
      ctx.arc(0, -11, 8.5, Math.PI, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-6, -11);
      ctx.lineTo(-4, -5);
      ctx.lineTo(-2, -9);
      ctx.lineTo(1, -5);
      ctx.lineTo(4, -10);
      ctx.closePath();
      ctx.fill();
    }

    // Cute anime eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-2.5, -9, 1.3, 0, Math.PI * 2);
    ctx.arc(2.5, -9, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Accessory: Smartphone with glowing screen or chic shopping purse
    if (seed % 2 === 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(5, -1, 3, 4);
    } else {
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-8, 1, 4, 5);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 0.8;
      ctx.strokeRect(-8, 1, 4, 5);
    }

    // Panic visual indicator
    if (c.isPanicked) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 11px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('!', 0, -18);
      // Sweatdrop
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(7, -14, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  ctx.restore();
}

/** Draws bouncing floating heart exp pickups with crisp two-lobed Valentine heart geometry & sparkle */
export function drawHearts(r: RenderContext) {
  const { ctx, cameraX, cameraY, hearts = [], gameTime } = r;
  if (!hearts || hearts.length === 0) return;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const h of hearts) {
    const bob = Math.sin(gameTime * 5.5 + h.bobTimer) * 3.5;
    const pulse = 1.0 + Math.sin(gameTime * 8 + h.id) * 0.14;
    const currentScale = (h.scale || 1) * pulse * 1.12;

    ctx.save();
    ctx.translate(h.x, h.y + bob);
    ctx.scale(currentScale, currentScale);

    // Soft outer pink/gold glow
    const isGold = h.color === '#fde047';
    const glow = ctx.createRadialGradient(0, -1, 1, 0, -1, 15);
    glow.addColorStop(0, isGold ? 'rgba(250, 204, 21, 0.65)' : 'rgba(244, 63, 94, 0.65)');
    glow.addColorStop(0.55, isGold ? 'rgba(253, 224, 71, 0.25)' : 'rgba(244, 114, 182, 0.28)');
    glow.addColorStop(1, 'rgba(236, 72, 153, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -1, 15, 0, Math.PI * 2);
    ctx.fill();

    // True Two-Lobed Valentine Heart Shape (deep center cleft at top + pointed bottom tip!)
    ctx.fillStyle = h.color || '#f43f5e';
    ctx.beginPath();
    ctx.moveTo(0, -2.8);
    // Left rounded lobe
    ctx.bezierCurveTo(-1.8, -7.8, -8.8, -7.2, -8.8, -2.0);
    // Left lower curve to bottom point
    ctx.bezierCurveTo(-8.8, 2.2, -3.5, 5.2, 0, 8.2);
    // Right lower curve from bottom point
    ctx.bezierCurveTo(3.5, 5.2, 8.8, 2.2, 8.8, -2.0);
    // Right rounded lobe back to center cleft
    ctx.bezierCurveTo(8.8, -7.2, 1.8, -7.8, 0, -2.8);
    ctx.closePath();
    ctx.fill();

    // Crisp outer anime border so the heart silhouette pops against any floor
    ctx.strokeStyle = isGold ? '#ca8a04' : '#ffffff';
    ctx.lineWidth = 1.25;
    ctx.stroke();

    // Inner crimson/amber contour rim
    ctx.strokeStyle = isGold ? '#f59e0b' : '#be123c';
    ctx.lineWidth = 0.7;
    ctx.stroke();

    // Glossy anime heart specular shine on left lobe
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.ellipse(-3.6, -4.0, 2.1, 1.15, -0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-1.8, -2.2, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/** Draws collectible thematic Support Care Drops (Heal, Level-Up Modifier, Invulnerability, 150% Ammo, Heart Up) with subtle sabotage sparks */
export function drawMedkits(r: RenderContext) {
  const { ctx, cameraX, cameraY, medkits = [], gameTime } = r;
  if (!medkits || medkits.length === 0) return;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const m of medkits) {
    const floatY = Math.sin(gameTime * 4 + m.bobTimer) * 4;
    const itemType = m.itemType || 'heal';

    ctx.save();
    ctx.translate(m.x, m.y + floatY);

    const pulse = 1.0 + Math.sin(gameTime * 6 + m.id) * 0.15;

    if (itemType === 'heal') {
      // 1. SWEETHEART FIRST-AID BENTO (Heal +1 HP)
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 26 * pulse);
      auraGrad.addColorStop(0, 'rgba(74, 222, 128, 0.55)');
      auraGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.22)');
      auraGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-14, -10, 28, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(-6, -14);
      ctx.lineTo(6, -14);
      ctx.lineTo(6, -10);
      ctx.stroke();

      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-7, -2.5, 14, 5);
      ctx.fillRect(-2.5, -7, 5, 14);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('BENTO +1 HP', 0, -18);
    } else if (itemType === 'level_mod') {
      // 2. SCENTED LOVE LETTER DOSSIER (+1 Level-Up Choice up to 6)
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 27 * pulse);
      auraGrad.addColorStop(0, 'rgba(244, 114, 182, 0.6)');
      auraGrad.addColorStop(0.55, 'rgba(192, 132, 252, 0.25)');
      auraGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 27 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Cream & rose-gold envelope
      ctx.fillStyle = '#fdf2f8';
      ctx.beginPath();
      ctx.roundRect(-15, -10, 30, 20, 3);
      ctx.fill();
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // Envelope flap lines
      ctx.beginPath();
      ctx.moveTo(-14, -9);
      ctx.lineTo(0, 2);
      ctx.lineTo(14, -9);
      ctx.stroke();

      // Crimson heart wax seal in center
      ctx.fillStyle = '#e11d48';
      ctx.beginPath();
      ctx.arc(0, 1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 7px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, 3.5);

      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('LOVE DOSSIER (+CHOICE)', 0, -16);
    } else if (itemType === 'invuln') {
      // 3. STARLIGHT IDOL HALO (6s Invulnerability)
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 28 * pulse);
      auraGrad.addColorStop(0, 'rgba(253, 224, 71, 0.68)');
      auraGrad.addColorStop(0.55, 'rgba(250, 204, 21, 0.28)');
      auraGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 28 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Golden halo ring
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 9, Math.sin(gameTime * 3) * 0.15, 0, Math.PI * 2);
      ctx.stroke();

      // Radiant star core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', 0, 4);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('IDOL HALO (6s SHIELD)', 0, -17);
    } else if (itemType === 'ammo') {
      // 4. OVERSTUFFED MAG POUCH (150% Ammo Overfill)
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 26 * pulse);
      auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.58)');
      auraGrad.addColorStop(0.55, 'rgba(14, 165, 233, 0.24)');
      auraGrad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 26 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Tactical slate & cyan ammo crate
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-14, -10, 28, 20, 4);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Three gleaming brass/gold cartridges inside
      for (const cx of [-6, 0, 6]) {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx - 2, -4, 4, 10);
        ctx.fillStyle = '#fb923c';
        ctx.beginPath();
        ctx.arc(cx, -4, 2, Math.PI, 0);
        ctx.fill();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('150% AMMO PACK', 0, -16);
    } else if (itemType === 'heart_up') {
      // 5. CRYSTAL HEART LOCKET (+1 Empty Max Heart up to 10)
      const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 27 * pulse);
      auraGrad.addColorStop(0, 'rgba(251, 113, 133, 0.62)');
      auraGrad.addColorStop(0.55, 'rgba(244, 63, 94, 0.25)');
      auraGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 27 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Golden filigree heart locket frame
      ctx.fillStyle = '#fda4af';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -3.5);
      ctx.bezierCurveTo(-2.5, -10.5, -12, -9.5, -12, -2.5);
      ctx.bezierCurveTo(-12, 3.5, -4.5, 7.5, 0, 11.5);
      ctx.bezierCurveTo(4.5, 7.5, 12, 3.5, 12, -2.5);
      ctx.bezierCurveTo(12, -9.5, 2.5, -10.5, 0, -3.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Inner crystal heart outline
      ctx.fillStyle = '#881337';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('+♥', 0, 3.5);

      ctx.fillStyle = '#fb7185';
      ctx.font = 'bold 10px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HEART LOCKET (+MAX ♥)', 0, -16);
    }

    // Subtle, rare glitch sparks on sabotaged support items (~6% of frames, matching sabotaged weapons!)
    if (m.isSabotaged) {
      const glitchCycle = (gameTime * 0.34 + m.id * 1.53) % 1.0;
      if (glitchCycle > 0.94) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.75)';
        const gx = Math.sin(gameTime * 35 + m.id) * 11;
        const gy = Math.cos(gameTime * 27 + m.id) * 10;
        ctx.fillRect(gx - 2, gy - 1, 4, 1.5);
        ctx.fillStyle = 'rgba(244, 63, 94, 0.7)';
        ctx.fillRect(-gx, -gy, 3, 1.5);
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

/** Draws weapon pickups */
export function drawWeaponPickups(r: RenderContext) {
  const { ctx, cameraX, cameraY, pickups, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const p of pickups) {
    const def = WEAPON_DEFS[p.weaponKey] || WEAPON_DEFS.pistol;
    const hoverY = Math.sin(gameTime * 4 + p.bobTimer) * 4;

    ctx.fillStyle = 'rgba(251, 191, 36, 0.15)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 12, p.radius * 1.3, p.radius * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(p.x, p.y + hoverY);

    ctx.strokeStyle = def.color;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = def.color;
    ctx.shadowBlur = 10;
    ctx.strokeRect(-18, -18, 36, 36);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-18, -18, 36, 36);

    ctx.fillStyle = def.color;
    ctx.font = 'bold 12px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.shortName.slice(0, 4), 0, 0);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '600 11px Outfit, sans-serif';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(def.name, 0, -26);

    // Very subtle, rare glitch spark on sabotaged weapon pickups (only flickers briefly ~6% of the time so you rarely notice until you fire it!)
    if (p.isSabotaged) {
      const glitchCycle = (gameTime * 0.34 + p.id * 1.71) % 1.0;
      if (glitchCycle > 0.94) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(52, 211, 153, 0.72)';
        const gx = Math.sin(gameTime * 37 + p.id) * 12;
        const gy = Math.cos(gameTime * 29 + p.id) * 12;
        ctx.fillRect(gx - 2, gy - 1, 4, 1.5);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.65)';
        ctx.fillRect(-gx, -gy, 2.5, 1.5);
      }
    }

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Renders an expressive, attractive anime femboy sprite for any of the 5 iconic skins:
 * - 'astolfo': Paladin Pink (braided pink hair, white silk ribbon bow, black/gold cropped paladin top, pink pleated skirt & striped thigh-highs)
 * - 'venti': Sky-Bard Braid (navy-to-aqua twin braids, Cecilia flower & bard beret, emerald corset vest, white stockings)
 * - 'felix': Neko-Maid (fluffy flaxen hair with twitching cat ears & blue ribbons, sky-blue & white frilly maid dress, cat tail)
 * - 'bridget': Pastel Hoodie (golden blonde hair with winged habit headband, cropped sky-blue & white hoodie, yo-yo charm)
 * - 'nagisa': Twintail Uniform (pastel blue twin-tails, navy school vest over white dress shirt & red tie)
 */
export function drawFemboyCharacter(
  ctx: CanvasRenderingContext2D,
  skinId: PlayerSkinId,
  gameTime: number,
  moving: boolean,
  angle: number,
  activeWeaponKey: string,
  fireCooldown: number,
  charmLvl: number = 1,
  showWeapon: boolean = true,
  outfitMode: OutfitMode = 'standard'
) {
  const legCycle = moving ? Math.sin(gameTime * 15) * 4.2 : 0;
  const hairSway = moving ? Math.sin(gameTime * 10) * 2.2 : Math.sin(gameTime * 3) * 0.8;

  // Skin palette definitions
  const palettes: Record<
    PlayerSkinId,
    {
      hairMain: string;
      hairSub: string;
      eyeColor: string;
      topMain: string;
      topSub: string;
      skirtColor: string;
      sockMain: string;
      sockStripe: string;
      auraA: string;
      auraB: string;
    }
  > = {
    astolfo: {
      hairMain: '#f472b6',
      hairSub: '#fbcfe8',
      eyeColor: '#a855f7',
      topMain: '#18181b',
      topSub: '#facc15',
      skirtColor: '#fdf2f8',
      sockMain: '#f472b6',
      sockStripe: '#ffffff',
      auraA: 'rgba(244, 114, 182, 0.36)',
      auraB: 'rgba(192, 132, 252, 0.18)',
    },
    venti: {
      hairMain: '#1e1b4b',
      hairSub: '#2dd4bf',
      eyeColor: '#14b8a6',
      topMain: '#059669',
      topSub: '#fef08a',
      skirtColor: '#0d9488',
      sockMain: '#ffffff',
      sockStripe: '#99f6e4',
      auraA: 'rgba(45, 212, 191, 0.36)',
      auraB: 'rgba(167, 243, 208, 0.18)',
    },
    felix: {
      hairMain: '#fde68a',
      hairSub: '#f59e0b',
      eyeColor: '#f59e0b',
      topMain: '#38bdf8',
      topSub: '#ffffff',
      skirtColor: '#0284c7',
      sockMain: '#ffffff',
      sockStripe: '#38bdf8',
      auraA: 'rgba(56, 189, 248, 0.36)',
      auraB: 'rgba(253, 230, 138, 0.18)',
    },
    bridget: {
      hairMain: '#fde047',
      hairSub: '#fef08a',
      eyeColor: '#06b6d4',
      topMain: '#38bdf8',
      topSub: '#ffffff',
      skirtColor: '#1e293b',
      sockMain: '#ffffff',
      sockStripe: '#38bdf8',
      auraA: 'rgba(96, 165, 250, 0.36)',
      auraB: 'rgba(254, 240, 138, 0.18)',
    },
    nagisa: {
      hairMain: '#60a5fa',
      hairSub: '#bae6fd',
      eyeColor: '#2563eb',
      topMain: '#1e3a8a',
      topSub: '#ef4444',
      skirtColor: '#1e293b',
      sockMain: '#0f172a',
      sockStripe: '#38bdf8',
      auraA: 'rgba(96, 165, 250, 0.36)',
      auraB: 'rgba(129, 140, 248, 0.18)',
    },
  };

  const pal = palettes[skinId] || palettes.astolfo;

  ctx.save();
  // Match the high-definition 1.22x anime proportion scale of the redesigned pursuers!
  ctx.scale(1.22, 1.22);

  // Ethereal anime aura
  const auraGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 27);
  auraGrad.addColorStop(0, pal.auraA);
  auraGrad.addColorStop(0.55, pal.auraB);
  auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = auraGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 27, 0, Math.PI * 2);
  ctx.fill();

  // Ground shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
  ctx.beginPath();
  ctx.ellipse(0, 15.5, 10.5, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // --- BACK HAIR / CAPE / TAIL LAYER ---
  if (skinId === 'astolfo') {
    // Long flowing pink braided ponytail + twin side-ribbons behind back
    ctx.fillStyle = pal.hairMain;
    ctx.beginPath();
    ctx.ellipse(-6.5 + hairSway, 2.5, 4.8, 12.8, 0.28, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#9d174d';
    ctx.lineWidth = 0.8;
    ctx.stroke();
    // White paladin waist capelet with gold border
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-7.2, 1.8);
    ctx.lineTo(7.2, 1.8);
    ctx.lineTo(10.8 + hairSway * 0.5, 12.2);
    ctx.lineTo(-10.8 + hairSway * 0.5, 12.2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 0.9;
    ctx.stroke();
  } else if (skinId === 'felix') {
    // Swishing anime cat tail with white tip
    ctx.strokeStyle = pal.hairMain;
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 7);
    ctx.quadraticCurveTo(11.5, 5 + hairSway * 1.5, 14.5, -2.5 + hairSway * 2);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(14.5, -2.5 + hairSway * 2, 2.1, 0, Math.PI * 2);
    ctx.fill();
  } else if (skinId === 'venti') {
    // Fluttering emerald-teal bard cape with gold trim
    ctx.fillStyle = '#0d9488';
    ctx.beginPath();
    ctx.moveTo(-6.5, -4.5);
    ctx.lineTo(6.5, -4.5);
    ctx.lineTo(11.5 + hairSway, 10.5);
    ctx.lineTo(-9.5 + hairSway, 10.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 0.9;
    ctx.stroke();
  } else if (skinId === 'bridget') {
    // Long golden-blonde wavy back hair
    ctx.fillStyle = pal.hairMain;
    ctx.beginPath();
    ctx.ellipse(0 + hairSway * 0.4, -3, 9.2, 9.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- OUTFIT MODE VARIATIONS: STANDARD, TWO-PIECE SWIMSUIT CHALLENGE, OR COMFY LOUNGEWEAR ---
  if (outfitMode === 'swimsuit') {
    // 1. TWO-PIECE SWIMSUIT OUTFIT (Bare toned legs, cute ankle sandals, side-tie bikini bottom, exposed midriff & halter bikini top)
    for (const side of [-1, 1]) {
      const lx = side * 3.8;
      const lBob = side === -1 ? legCycle : -legCycle;

      // Full bare sun-kissed anime legs
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, 4.6);
      ctx.lineTo(lx, 14.5 + lBob);
      ctx.stroke();

      // Cute ankle ribbon strap & beach sandal
      ctx.strokeStyle = pal.topSub;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(lx - 1.9, 12.2 + lBob);
      ctx.lineTo(lx + 1.9, 12.2 + lBob);
      ctx.stroke();

      ctx.fillStyle = pal.hairMain;
      ctx.beginPath();
      ctx.roundRect(lx - 2.5, 13.5 + lBob, 5.0, 2.8, 1.2);
      ctx.fill();
    }

    // Frilly Side-Tie Bikini Bottom with cute hip ribbons
    ctx.fillStyle = pal.hairMain;
    ctx.beginPath();
    ctx.moveTo(-6.2, 2.4);
    ctx.lineTo(6.2, 2.4);
    ctx.lineTo(4.2, 6.6);
    ctx.lineTo(-4.2, 6.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Side-tie hip bows
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-6.4, 3.2, 1.7, 0, Math.PI * 2);
    ctx.arc(6.4, 3.2, 1.7, 0, Math.PI * 2);
    ctx.fill();

    // Slender exposed midriff & navel dot
    ctx.fillStyle = '#ffe4e6';
    ctx.fillRect(-4.8, -2.8, 9.6, 5.4);
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.arc(0, 0.8, 0.75, 0, Math.PI * 2);
    ctx.fill();

    // Bare anime arms with waterproof floral wristband
    for (const side of [-1, 1]) {
      ctx.fillStyle = '#ffe4e6';
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
      ctx.lineWidth = 0.85;
      ctx.beginPath();
      ctx.roundRect(side * 8.2 - 1.7, -5.0, 3.4, 6.4, 1.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = pal.topSub;
      ctx.fillRect(side * 8.2 - 1.8, -0.2, 3.6, 1.2);
    }

    // Cute Frilly Halter Bikini Top with center bow
    ctx.fillStyle = pal.hairMain;
    ctx.beginPath();
    ctx.roundRect(-6.0, -5.6, 12.0, 3.8, 1.8);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Halter neck straps & center charm bow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-3.6, -5.6);
    ctx.lineTo(-1.8, -7.2);
    ctx.moveTo(3.6, -5.6);
    ctx.lineTo(1.8, -7.2);
    ctx.stroke();

    ctx.fillStyle = pal.topSub;
    ctx.beginPath();
    ctx.arc(0, -3.7, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (outfitMode === 'comfy') {
    // 2. COMFY LOUNGEWEAR OUTFIT (Plush bunny slippers, striped knee socks, oversized pastel off-shoulder hoodie with paw sleeves)
    for (const side of [-1, 1]) {
      const lx = side * 3.8;
      const lBob = side === -1 ? legCycle : -legCycle;

      // Cozy knee-high knit socks
      ctx.strokeStyle = '#fdf2f8';
      ctx.lineWidth = 4.0;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, 6.0);
      ctx.lineTo(lx, 14.2 + lBob);
      ctx.stroke();

      // Fluffy white & pink bunny-ear slippers!
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(lx, 14.4 + lBob, 3.4, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // Tiny bunny ears on slippers
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.ellipse(lx - 1.2, 12.4 + lBob, 0.9, 1.8, -0.2, 0, Math.PI * 2);
      ctx.ellipse(lx + 1.2, 12.4 + lBob, 0.9, 1.8, 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Soft pastel loungewear shorts peeking under oversized sweater hem
    ctx.fillStyle = '#fdf2f8';
    ctx.beginPath();
    ctx.roundRect(-7.2, 4.2, 14.4, 3.6, 1.8);
    ctx.fill();

    // Oversized Slouchy Pastel Cardigan / Hoodie Dress covering torso & hips
    ctx.fillStyle = pal.hairSub;
    ctx.beginPath();
    ctx.roundRect(-8.2, -5.8, 16.4, 11.4, 4.2);
    ctx.fill();
    ctx.strokeStyle = pal.hairMain;
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Extra-long dangling paw-sleeves covering hands
    for (const side of [-1, 1]) {
      ctx.fillStyle = pal.hairSub;
      ctx.strokeStyle = pal.hairMain;
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.roundRect(side * 9.0 - 2.3, -4.8, 4.6, 8.4, 2.2);
      ctx.fill();
      ctx.stroke();
      // Cute pink paw-pad dot on cuff
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(side * 9.0, 2.0, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sleepy golden star buttons & cozy collar ribbon
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, -1.8, 1.4, 0, Math.PI * 2);
    ctx.arc(0, 1.6, 1.4, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // 3. STANDARD ICONIC ANIME OUTFIT
    for (const side of [-1, 1]) {
      const lx = side * 3.8;
      const lBob = side === -1 ? legCycle : -legCycle;

      // Bare fair thigh (zettai ryouiki gap) with subtle leg contour
      ctx.strokeStyle = '#ffe4e6';
      ctx.lineWidth = 3.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lx, 5.0);
      ctx.lineTo(lx, 9.0 + lBob * 0.35);
      ctx.stroke();

      // Thigh-high stocking
      ctx.strokeStyle = pal.sockMain;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(lx, 8.4 + lBob * 0.35);
      ctx.lineTo(lx, 14.5 + lBob);
      ctx.stroke();

      // Horizontal striped stockings for Astolfo, or top garter/stripe accent for others
      if (skinId === 'astolfo') {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.8;
        ctx.setLineDash([1.6, 1.6]);
        ctx.beginPath();
        ctx.moveTo(lx, 8.8 + lBob * 0.35);
        ctx.lineTo(lx, 14.0 + lBob);
        ctx.stroke();
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle = pal.sockStripe;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(lx - 1.9, 8.8 + lBob * 0.4);
        ctx.lineTo(lx + 1.9, 8.8 + lBob * 0.4);
        ctx.stroke();
      }

      // Defined anime Mary Janes / boots with sole highlight
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.roundRect(lx - 2.5, 13.4 + lBob, 5.0, 3.3, 1.4);
      ctx.fill();
      ctx.strokeStyle = pal.topSub;
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    // --- PLEATED ANIME MINISKIRT / CULOTTES WITH CRISP FRILL HEM ---
    ctx.fillStyle = pal.skirtColor;
    ctx.beginPath();
    ctx.moveTo(-6.4, 1.6);
    ctx.lineTo(6.4, 1.6);
    ctx.lineTo(9.4, 7.8);
    ctx.lineTo(-9.4, 7.8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // White lace / trim hem along bottom of skirt
    ctx.strokeStyle = pal.topSub;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-8.8, 7.0);
    ctx.lineTo(8.8, 7.0);
    ctx.stroke();

    // Crisp skirt pleat lines
    ctx.strokeStyle = 'rgba(15, 23, 42, 0.35)';
    ctx.lineWidth = 0.85;
    for (const px of [-4.2, -1.4, 1.4, 4.2]) {
      ctx.beginPath();
      ctx.moveTo(px * 0.75, 2.0);
      ctx.lineTo(px * 1.1, 7.4);
      ctx.stroke();
    }

    // --- SLENDER ANIME WAIST, SCULPTED ARMS/SLEEVES & THEMED OUTFIT BODICE ---
    // Dainty midriff peek with cute navel dot for Astolfo / Bridget
    if (skinId === 'astolfo' || skinId === 'bridget') {
      ctx.fillStyle = '#ffe4e6';
      ctx.fillRect(-4.6, -0.5, 9.2, 2.6);
    }

    // Defined Left & Right Anime Sleeves / Arms (so the player has full upper-body definition!)
    for (const side of [-1, 1]) {
      ctx.fillStyle = skinId === 'venti' || skinId === 'nagisa' ? '#ffffff' : pal.topMain;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 0.95;
      ctx.beginPath();
      ctx.roundRect(side * 8.4 - 1.9, -5.2, 3.8, 6.6, 1.6);
      ctx.fill();
      ctx.stroke();
      // Gold/ribbon cuff accent on sleeves
      ctx.fillStyle = pal.topSub;
      ctx.fillRect(side * 8.4 - 1.8, -0.2, 3.6, 1.2);
    }

    // Sculpted anime upper torso bodice
    ctx.fillStyle = pal.topMain;
    ctx.beginPath();
    ctx.moveTo(-6.8, -5.8);
    ctx.lineTo(6.8, -5.8);
    ctx.lineTo(5.4, 1.4);
    ctx.lineTo(-5.4, 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    // Outfit collar, choker & chest ribbon/tie detail
    if (skinId === 'nagisa') {
      // White dress shirt V-neck, navy vest trim & crimson necktie
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(-3.4, -5.8);
      ctx.lineTo(3.4, -5.8);
      ctx.lineTo(0, -0.8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#e11d48';
      ctx.fillRect(-1.1, -4.6, 2.2, 5.2);
    } else if (skinId === 'felix') {
      // White frilly maid bodice front, black choker & golden cat-bell
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-4.4, -4.5, 8.8, 5.6, 1.6);
      ctx.fill();
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-3.2, -6.2, 6.4, 1.3);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, -5.2, 2.0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cute choker + prominent ribbon bow at collar
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-3.0, -6.2, 6.0, 1.2);
      ctx.fillStyle = pal.topSub;
      ctx.beginPath();
      ctx.ellipse(-2.4, -4.0, 2.5, 1.35, -0.3, 0, Math.PI * 2);
      ctx.ellipse(2.4, -4.0, 2.5, 1.35, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -4.0, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- HIGH-DEFINITION ANIME HEAD & EXPRESSIVE FACE (Matches Enemy Quality!) ---
  ctx.fillStyle = '#fff1f2';
  ctx.beginPath();
  ctx.arc(0, -12.0, 8.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
  ctx.lineWidth = 0.85;
  ctx.stroke();

  // Large Jewel-Toned Anime Eyes with White Sclera, Winged Eyelashes & Dual Starlight Catchlights
  for (const side of [-1, 1]) {
    const ex = side * 3.3;
    // Crisp white sclera
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, -11.0, 2.3, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jewel-toned iris
    ctx.fillStyle = pal.eyeColor;
    ctx.beginPath();
    ctx.ellipse(ex, -10.9, 1.95, 2.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark pupil
    ctx.fillStyle = '#09090b';
    ctx.beginPath();
    ctx.arc(ex, -10.9, 0.95, 0, Math.PI * 2);
    ctx.fill();

    // Dual anime starlight catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 0.65, -11.8, 0.9, 0, Math.PI * 2);
    ctx.arc(ex + 0.65, -10.0, 0.48, 0, Math.PI * 2);
    ctx.fill();

    // Thick anime upper eyelash + cute wing
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.55;
    ctx.beginPath();
    ctx.arc(ex, -11.3, 2.4, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex + side * 2.0, -11.8);
    ctx.lineTo(ex + side * 3.1, -12.6);
    ctx.stroke();
  }

  // Soft anime rosy cheeks & cute ":3" cat-smile
  ctx.fillStyle = 'rgba(244, 63, 94, 0.58)';
  ctx.beginPath();
  ctx.ellipse(-5.1, -8.9, 2.2, 1.1, 0, 0, Math.PI * 2);
  ctx.ellipse(5.1, -8.9, 2.2, 1.1, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#e11d48';
  ctx.lineWidth = 1.0;
  ctx.beginPath();
  ctx.arc(-0.95, -8.0, 0.95, 0, Math.PI);
  ctx.arc(0.95, -8.0, 0.95, 0, Math.PI);
  ctx.stroke();

  // --- VOLUMINOUS LAYERED ANIME HAIR & ICONIC HEADGEAR ---
  ctx.fillStyle = pal.hairMain;
  ctx.beginPath();
  ctx.arc(0, -13.5, 9.4, Math.PI, 0);
  ctx.fill();

  // Face-framing sidelocks (hime-locks / braids)
  if (skinId === 'venti') {
    // Navy-to-aqua twin front braids with glowing teal tips
    for (const sx of [-8.2, 8.2]) {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(sx - 1.6, -13.0, 3.2, 6.5);
      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.ellipse(sx, -4.5, 2.0, 3.8, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (skinId === 'nagisa') {
    // High bouncy twin-tails on both sides
    for (const sx of [-9.8, 9.8]) {
      ctx.fillStyle = pal.hairMain;
      ctx.beginPath();
      ctx.ellipse(sx, -11.5 + hairSway * 0.5, 3.4, 8.0, sx < 0 ? 0.35 : -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(sx - 1.9, -15.8, 3.8, 2.2);
    }
  } else {
    // Soft feathered hime sidelocks framing cheeks
    ctx.fillStyle = pal.hairMain;
    ctx.beginPath();
    ctx.ellipse(-8.2, -9.8, 2.2, 6.2, 0.12, 0, Math.PI * 2);
    ctx.ellipse(8.2, -9.8, 2.2, 6.2, -0.12, 0, Math.PI * 2);
    ctx.fill();
  }

  // Layered anime bangs across forehead
  ctx.fillStyle = pal.hairMain;
  ctx.beginPath();
  ctx.moveTo(-8.8, -14.0);
  ctx.lineTo(-5.8, -9.8);
  ctx.lineTo(-2.8, -13.0);
  ctx.lineTo(0, -9.4);
  ctx.lineTo(2.8, -13.0);
  ctx.lineTo(5.8, -9.8);
  ctx.lineTo(8.8, -14.0);
  ctx.closePath();
  ctx.fill();

  // White hair-angel highlight band across crown
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(0, -13.5, 7.2, Math.PI * 1.2, Math.PI * 1.8);
  ctx.stroke();

  // Skin-specific signature headgear
  if (skinId === 'astolfo') {
    // Iconic wide white silk ribbon bow with gold trim + white streak in bangs
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-5.8, -19.5, 5.2, 2.4, -0.35, 0, Math.PI * 2);
    ctx.ellipse(5.8, -19.5, 5.2, 2.4, 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1.1;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-1.2, -14.0);
    ctx.lineTo(0, -9.4);
    ctx.lineTo(1.2, -14.0);
    ctx.closePath();
    ctx.fill();
  } else if (skinId === 'felix') {
    // Twitching anime cat ears + sky-blue silk ear ribbons
    for (const side of [-1, 1]) {
      ctx.fillStyle = pal.hairMain;
      ctx.beginPath();
      ctx.moveTo(side * 3.0, -18.0);
      ctx.lineTo(side * 6.8, -25.2);
      ctx.lineTo(side * 8.8, -17.0);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fda4af';
      ctx.beginPath();
      ctx.moveTo(side * 4.0, -18.5);
      ctx.lineTo(side * 6.5, -23.2);
      ctx.lineTo(side * 7.8, -17.6);
      ctx.closePath();
      ctx.fill();
      // Blue bow at ear base
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(side * 6.2, -17.4, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (skinId === 'bridget') {
    // Iconic oversized white & blue habit headband with golden cross-rod
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(-9.8, -21.5, 19.6, 4.6, 2.2);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-1.1, -21.0, 2.2, 3.8);
  } else if (skinId === 'venti') {
    // Emerald bard beret & white Cecilia flower
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.ellipse(2, -20.0, 8.8, 3.8, 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-5.8, -19.0, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(-5.8, -19.0, 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Charm Level >= 3 orbital hearts/stars
  if (charmLvl >= 3) {
    for (let st = 0; st < Math.min(5, charmLvl); st++) {
      const sAngle = gameTime * 2.8 + (st * Math.PI * 2) / Math.min(5, charmLvl);
      const sx = Math.cos(sAngle) * 20;
      const sy = Math.sin(sAngle) * 12;
      ctx.fillStyle = st % 2 === 0 ? '#fef08a' : '#f472b6';
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Petite blaster in hand pointing towards target angle
  if (showWeapon) {
    ctx.save();
    ctx.rotate(angle);
    const currentDef = WEAPON_DEFS[activeWeaponKey] || WEAPON_DEFS.pistol;

    ctx.fillStyle = currentDef.color;
    ctx.beginPath();
    ctx.roundRect(6.5, -2.6, 11.5, 5.2, 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.9;
    ctx.stroke();

    // Dangling star charm from blaster
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(10.5, 5.0, 2.0, 0, Math.PI * 2);
    ctx.fill();

    if (fireCooldown > currentDef.fireInterval - 0.05) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(19.5, 0, 5.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  ctx.restore();
}

export function drawPlayer(r: RenderContext) {
  const { ctx, cameraX, cameraY, player, gameTime } = r;

  ctx.save();
  ctx.translate(player.x - cameraX, player.y - cameraY);

  if (player.invincibleTimer > 0 && Math.floor(gameTime * 20) % 2 === 0 && !r.shinyCapture?.active) {
    ctx.globalAlpha = 0.45;
  }

  const moving = Math.hypot(player.vx, player.vy) > 10;
  const skinId: PlayerSkinId = player.skinId || 'astolfo';

  ctx.save();
  // If slipped in Shiny Senpai's coffee, tilt the player sprite on the floor!
  if (player.slipFallTimer && player.slipFallTimer > 0) {
    ctx.translate(0, 6);
    ctx.rotate(0.62);
  }
  // Render swimsuit if player selected Two-Piece Swimsuit challenge OR if playing on Sunset Beach!
  const effectiveOutfit: OutfitMode =
    player.outfitMode === 'swimsuit' || player.outfitMode === 'comfy'
      ? player.outfitMode
      : r.mapEnv.id === 'beach'
        ? 'swimsuit'
        : 'standard';

  drawFemboyCharacter(
    ctx,
    skinId,
    gameTime,
    moving,
    player.angle,
    player.activeWeaponKey,
    player.fireCooldown,
    r.adorationLevel || 1,
    true,
    effectiveOutfit
  );
  ctx.restore();

  // --- BRATTY TAUNT / TEASE [F] SOUNDWAVE RING & SPEECH BUBBLE ---
  if (player.tauntRingTimer && player.tauntRingTimer > 0) {
    ctx.save();
    const progress = 1 - player.tauntRingTimer / 0.65;
    const ringR = 24 + progress * 140;
    ctx.strokeStyle = `rgba(244, 114, 182, ${(1 - progress) * 0.85})`;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  if (player.tauntSpeechTimer && player.tauntSpeechTimer > 0 && player.tauntSpeechText && !r.shinyCapture?.active) {
    ctx.save();
    const bounceY = Math.sin(gameTime * 11) * 2.5;
    ctx.font = 'bold 11.5px "Outfit", sans-serif';
    const textW = ctx.measureText(player.tauntSpeechText).width;
    const boxW = Math.max(120, textW + 24);
    const boxH = 26;
    const bx = -boxW / 2;
    const by = -68 + bounceY;

    ctx.fillStyle = 'rgba(244, 63, 94, 0.95)';
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.tauntSpeechText, 0, by + boxH / 2);
    ctx.restore();
  }

  // Hound Rear-Pin / Shiny Hound Hold-Down Visuals
  if (player.pinnedByEnemyId !== undefined && !r.shinyCapture?.active) {
    ctx.save();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.6;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.arc(0, 2, 24, gameTime * 4, gameTime * 4 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-56, -48, 112, 16, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fde047';
    ctx.font = '800 9.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐾 PINNED BY HOUND! 🐾', 0, -40);
    ctx.restore();
  } else if (player.shinyLockedByEnemyId !== undefined && !r.shinyCapture?.active) {
    // Shiny Pursuer Signature Daze / Stun / Slip-and-Fall Visuals
    ctx.save();
    for (let i = 0; i < 4; i++) {
      const orbitA = gameTime * 6.5 + (i * Math.PI) / 2;
      const ox = Math.cos(orbitA) * 17;
      const oy = -28 + Math.sin(orbitA) * 5;
      ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i % 2 === 0 ? '★' : '⚡', ox, oy);
    }

    const labelText =
      player.slipFallTimer && player.slipFallTimer > 0
        ? '☕ SLIPPED & FELL! ♥'
        : '★ SHINY DAZED! ★';
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-52, -48, 104, 16, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 9.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, 0, -40);
    ctx.restore();
  } else if (player.dazeTimer && player.dazeTimer > 0) {
    // Extra-Life or Post-Shiny 3.0s Dazed Immunity Visuals
    ctx.save();
    const dazeGlow = ctx.createRadialGradient(0, -4, 4, 0, -4, 34);
    dazeGlow.addColorStop(0, 'rgba(244, 114, 182, 0.35)');
    dazeGlow.addColorStop(0.6, 'rgba(250, 204, 21, 0.18)');
    dazeGlow.addColorStop(1, 'rgba(244, 114, 182, 0)');
    ctx.fillStyle = dazeGlow;
    ctx.beginPath();
    ctx.arc(0, -4, 34, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 4; i++) {
      const orbitA = gameTime * 5.2 + (i * Math.PI) / 2;
      const ox = Math.cos(orbitA) * 16;
      const oy = -28 + Math.sin(orbitA) * 5;
      ctx.fillStyle = i % 2 === 0 ? '#fde047' : '#f472b6';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(i % 2 === 0 ? '★' : '♥', ox, oy);
    }

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle = '#f472b6';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-42, -46, 84, 16, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fbcfe8';
    ctx.font = '800 9.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`DAZED ${player.dazeTimer.toFixed(1)}s`, 0, -38);
    ctx.restore();
  }

  // Starlight Idol Halo (6s Impervious Invulnerability) OR Sabotaged Fragile Curse (6s 1-Touch Instant Capture)
  if (player.starlightInvulnTimer && player.starlightInvulnTimer > 0 && !r.shinyCapture?.active) {
    ctx.save();
    const shieldGrad = ctx.createRadialGradient(0, -2, 6, 0, -2, 34);
    shieldGrad.addColorStop(0, 'rgba(254, 240, 138, 0.42)');
    shieldGrad.addColorStop(0.65, 'rgba(250, 204, 21, 0.24)');
    shieldGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = shieldGrad;
    ctx.beginPath();
    ctx.arc(0, -2, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([7, 4]);
    ctx.beginPath();
    ctx.arc(0, -2, 26, -gameTime * 4, -gameTime * 4 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-56, -64, 112, 16, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.font = '800 9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`★ IMPERVIOUS ${player.starlightInvulnTimer.toFixed(1)}s ★`, 0, -56);
    ctx.restore();
  } else if (player.fragileCurseTimer && player.fragileCurseTimer > 0 && !r.shinyCapture?.active) {
    ctx.save();
    const curseGrad = ctx.createRadialGradient(0, -2, 6, 0, -2, 34);
    curseGrad.addColorStop(0, 'rgba(225, 29, 72, 0.45)');
    curseGrad.addColorStop(0.65, 'rgba(168, 85, 247, 0.25)');
    curseGrad.addColorStop(1, 'rgba(225, 29, 72, 0)');
    ctx.fillStyle = curseGrad;
    ctx.beginPath();
    ctx.arc(0, -2, 34, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(0, -2, 26, gameTime * 5, gameTime * 5 + Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-68, -64, 136, 16, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#fda4af';
    ctx.font = '800 8.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`💔 1-TOUCH CAPTURE ${player.fragileCurseTimer.toFixed(1)}s 💔`, 0, -56);
    ctx.restore();
  }

  ctx.restore();

  // Render autonomous NPC Femboy survivors in the world
  drawNpcFemboys(r);
}

/** Draws autonomous NPC Femboy survivors (max 2 active) with their skins, outfits, hearts, struggle/drag alerts, and live commentary bubbles */
export function drawNpcFemboys(r: RenderContext) {
  const { ctx, cameraX, cameraY, npcFemboys = [], enemies, gameTime } = r;
  if (!npcFemboys || npcFemboys.length === 0) return;

  for (const npc of npcFemboys) {
    ctx.save();
    ctx.translate(npc.x - cameraX, npc.y - cameraY);

    // Draw tether if captured/dragged by an enemy
    if (
      (npc.aiMode === 'captured_struggle' || npc.aiMode === 'captured_dragged') &&
      npc.capturedByEnemyId !== undefined
    ) {
      const captor = enemies.find((e) => e.id === npc.capturedByEnemyId);
      if (captor) {
        ctx.save();
        ctx.strokeStyle = npc.aiMode === 'captured_dragged' ? '#f43f5e' : '#fbbf24';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -4);
        ctx.lineTo(captor.x - npc.x, captor.y - npc.y - 4);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // Companion / Survivor ground ring
    ctx.save();
    ctx.strokeStyle =
      npc.aiMode === 'captured_dragged'
        ? 'rgba(244, 63, 94, 0.9)'
        : npc.aiMode === 'captured_struggle'
          ? 'rgba(251, 191, 36, 0.9)'
          : npc.isLoyalCompanion
            ? 'rgba(244, 114, 182, 0.75)'
            : 'rgba(45, 212, 191, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 12, 15, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    if (npc.invincibleTimer > 0 && Math.floor(gameTime * 18) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const moving = Math.hypot(npc.vx, npc.vy) > 10 || npc.aiMode === 'captured_struggle';
    const effectiveOutfit: OutfitMode =
      npc.outfitMode === 'swimsuit' || npc.outfitMode === 'comfy'
        ? npc.outfitMode
        : r.mapEnv.id === 'beach'
          ? 'swimsuit'
          : 'standard';

    ctx.save();
    if (npc.aiMode === 'captured_struggle' || npc.aiMode === 'captured_dragged') {
      ctx.rotate(Math.sin(gameTime * 22 + npc.id) * 0.24);
    }
    drawFemboyCharacter(
      ctx,
      npc.skinId,
      gameTime + npc.id * 1.3,
      moving,
      npc.angle,
      npc.activeWeaponKey,
      npc.fireCooldown,
      npc.isLoyalCompanion ? 3 : 1,
      npc.aiMode !== 'captured_struggle' && npc.aiMode !== 'captured_dragged',
      effectiveOutfit
    );
    ctx.restore();

    ctx.globalAlpha = 1;

    // Nameplate + Heart Stamina + AI Mode Status above NPC Femboy
    ctx.save();
    const heartsStr = '♥'.repeat(Math.max(0, npc.hp)) + '♡'.repeat(Math.max(0, npc.maxHp - npc.hp));
    const statusTag =
      npc.aiMode === 'captured_dragged'
        ? '🚨 DRAGGED TO BED! SAVE HIM!'
        : npc.aiMode === 'captured_struggle'
          ? `⚠️ STRUGGLING! (${Math.ceil(npc.struggleTimer)}s)`
          : npc.aiMode === 'rescuing_player'
            ? '★ RESCUING YOU!'
            : npc.isLoyalCompanion
              ? '💖 PARTNER'
              : 'ALLY';

    ctx.font = '800 9.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    const labelLine = `${npc.name.toUpperCase()} · ${statusTag}`;
    const pillW = Math.max(78, ctx.measureText(labelLine).width + 14);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.strokeStyle =
      npc.aiMode === 'captured_dragged'
        ? '#f43f5e'
        : npc.aiMode === 'captured_struggle'
          ? '#fbbf24'
          : npc.isLoyalCompanion
            ? '#f472b6'
            : '#2dd4bf';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(-pillW / 2, -46, pillW, 16, 5);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle =
      npc.aiMode === 'captured_dragged'
        ? '#fda4af'
        : npc.aiMode === 'captured_struggle'
          ? '#fde047'
          : '#f8fafc';
    ctx.fillText(labelLine, 0, -35.5);

    // Heart Stamina pips right above nameplate
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#fb7185';
    ctx.fillText(heartsStr, 0, -51);
    ctx.restore();

    // Floating Speech Bubble for NPC Femboy Commentary
    if (npc.speechTimer > 0 && npc.speechText) {
      ctx.save();
      const bounceY = Math.sin(gameTime * 9 + npc.id) * 2;
      ctx.font = '600 10.5px "Outfit", sans-serif';
      const textW = ctx.measureText(npc.speechText).width;
      const boxW = Math.max(96, textW + 16);
      const boxH = 20;
      const boxY = -80 + bounceY;

      ctx.fillStyle =
        npc.aiMode === 'captured_dragged' || npc.aiMode === 'captured_struggle'
          ? 'rgba(136, 19, 55, 0.94)'
          : 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle =
        npc.aiMode === 'captured_dragged' || npc.aiMode === 'captured_struggle'
          ? '#fb7185'
          : npc.isLoyalCompanion
            ? '#f472b6'
            : '#2dd4bf';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, boxY, boxW, boxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.speechText, 0, boxY + boxH / 2);
      ctx.restore();
    }

    ctx.restore();
  }
}

/**
 * Shared Anime Face & Expressive Eyes Helper for the 7 Bespoke Pursuer Sprites
 */
function drawAnimePursuerFace(
  ctx: CanvasRenderingContext2D,
  opts: {
    skinTone: string;
    eyeColor: string;
    lipColor: string;
    hasHeartPupils?: boolean;
    hasSmirk?: boolean;
    hasBigGrin?: boolean;
    hasGlasses?: boolean;
    hasBandAid?: boolean;
    blushAlpha?: number;
  }
) {
  const {
    skinTone,
    eyeColor,
    lipColor,
    hasHeartPupils,
    hasSmirk,
    hasBigGrin,
    hasGlasses,
    hasBandAid,
    blushAlpha = 0.52,
  } = opts;

  // Rounded anime chin & head
  ctx.fillStyle = skinTone;
  ctx.beginPath();
  ctx.arc(0, -12.5, 8.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
  ctx.lineWidth = 0.7;
  ctx.stroke();

  // Large expressive anime eyes with thick winged upper lashes
  for (const side of [-1, 1]) {
    const ex = side * 3.4;
    // White sclera highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(ex, -11.4, 2.3, 2.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rich colored iris
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.ellipse(ex, -11.3, 1.95, 2.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dark upper iris gradient shade & pupil
    if (hasHeartPupils) {
      ctx.fillStyle = '#881337';
      ctx.beginPath();
      ctx.arc(ex, -11.5, 1.0, 0, Math.PI * 2);
      ctx.fill();
      // Glowing pink Yandere Heart Pupil!
      ctx.fillStyle = '#fda4af';
      ctx.font = 'bold 6.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', ex, -9.4);
    } else {
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(ex, -11.3, 0.95, 0, Math.PI * 2);
      ctx.fill();
    }

    // Dual anime starlight catchlights
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ex - 0.65, -12.2, 0.85, 0, Math.PI * 2);
    ctx.arc(ex + 0.65, -10.4, 0.45, 0, Math.PI * 2);
    ctx.fill();

    // Thick winged anime upper eyelash
    ctx.strokeStyle = '#09090b';
    ctx.lineWidth = 1.65;
    ctx.beginPath();
    ctx.arc(ex, -11.7, 2.45, Math.PI * 1.06, Math.PI * 1.94);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(ex + side * 2.1, -12.2);
    ctx.lineTo(ex + side * 3.4, -13.1);
    ctx.stroke();
  }

  // Warm anime cheek blush
  ctx.fillStyle = `rgba(244, 63, 94, ${blushAlpha})`;
  ctx.beginPath();
  ctx.ellipse(-5.3, -9.4, 2.1, 1.05, 0, 0, Math.PI * 2);
  ctx.ellipse(5.3, -9.4, 2.1, 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Optional Sukeban band-aid on cheek
  if (hasBandAid) {
    ctx.save();
    ctx.translate(5.2, -9.3);
    ctx.rotate(-0.25);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(-2.4, -1.0, 4.8, 2.0);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 0.5;
    ctx.strokeRect(-2.4, -1.0, 4.8, 2.0);
    ctx.restore();
  }

  // Optional Red-Framed Bayonetta / Senpai Glasses
  if (hasGlasses) {
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.roundRect(-6.6, -13.2, 5.6, 3.5, 1);
    ctx.roundRect(1.0, -13.2, 5.6, 3.5, 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1.0, -11.5);
    ctx.lineTo(1.0, -11.5);
    ctx.stroke();
  }

  // Mouth / Expression
  if (hasBigGrin) {
    // Energetic Tomboy / Gyaru open smile
    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(0, -8.3, 1.9, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1.4, -8.3, 2.8, 0.8);
  } else if (hasSmirk) {
    // Rebellious Delinquent smirk with tiny fang
    ctx.strokeStyle = lipColor;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(-1.8, -8.0);
    ctx.quadraticCurveTo(0.5, -7.4, 2.4, -8.8);
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(1.1, -8.1);
    ctx.lineTo(1.6, -7.1);
    ctx.lineTo(2.1, -8.3);
    ctx.closePath();
    ctx.fill();
  } else {
    // Sultry glossy anime lips
    ctx.fillStyle = lipColor;
    ctx.beginPath();
    ctx.ellipse(0, -8.1, 1.65, 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draws all 7 Pursuer Archetypes with larger (1.28x), unmistakable bespoke anime uniforms,
 * distinct hair silhouettes, and signature held props!
 */
export function drawEnemies(r: RenderContext) {
  const { ctx, cameraX, cameraY, enemies, gameTime, activeUpgrades } = r;

  for (const e of enemies) {
    ctx.save();
    ctx.translate(e.x - cameraX, e.y - cameraY);

    if (e.hitFlashTimer > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- SHINY PURSUER PRISMATIC AURA & HALO ---
    if (e.isShiny) {
      const pulse = 1.0 + Math.sin(gameTime * 7 + e.id) * 0.12;
      const shinyGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, 52 * pulse);
      shinyGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
      shinyGrad.addColorStop(0.35, 'rgba(244, 114, 182, 0.5)');
      shinyGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.35)');
      shinyGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');

      ctx.fillStyle = shinyGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 52 * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, -35, 15, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;

      const bossBarW = 50;
      const bossBarH = 5;
      const hpRatio = Math.max(0, Math.min(1, e.hp / e.maxHp));
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(-bossBarW / 2, -48, bossBarW, bossBarH);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-bossBarW / 2, -48, bossBarW * hpRatio, bossBarH);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-bossBarW / 2, -48, bossBarW, bossBarH);

      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 8.5px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ GOLDEN ELITE ★', 0, -53);

      if ((e.shinyTelegraphTimer || 0) > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 58, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }
    }

    // --- IMMORTAL HAUNTING WINNER AURA & CROWN (Unstoppable Pursuer who claimed Extra Life!) ---
    if (e.isHauntingWinner) {
      const pulse = 1.0 + Math.sin(gameTime * 6.5 + e.id) * 0.14;
      const hauntGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 44 * pulse);
      hauntGrad.addColorStop(0, 'rgba(244, 63, 94, 0.65)');
      hauntGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.38)');
      hauntGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
      ctx.fillStyle = hauntGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 44 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Orbiting heart-shield ring showing she is impervious to attacks
      ctx.save();
      ctx.strokeStyle = 'rgba(251, 113, 133, 0.85)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(0, 2, e.radius + 9, gameTime * 2, gameTime * 2 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // Shiny Officer Viki: Impervious Aim & Shoot Barrier
    if (e.isShiny && e.archetype === 'officer' && (e.isAiming || (e.shootRecoveryTimer && e.shootRecoveryTimer > 0))) {
      ctx.save();
      const sPulse = 1.0 + Math.sin(gameTime * 14) * 0.12;
      const shGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, (e.radius + 16) * sPulse);
      shGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      shGrad.addColorStop(0.6, 'rgba(250, 204, 21, 0.28)');
      shGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = shGrad;
      ctx.beginPath();
      ctx.arc(0, 0, (e.radius + 16) * sPulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, e.radius + 14, gameTime * 4, gameTime * 4 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fef08a';
      ctx.font = '800 8px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ IMPERVIOUS ⚡', 0, -e.radius - 22);
      ctx.restore();
    }

    // Ground drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(0, 18, e.radius * 0.95, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const legBob = Math.sin(gameTime * 13 + e.id) * 3.5;
    const hairSwish = Math.sin(gameTime * 9 + e.id) * 2.6;

    // Scale up character sprite by 1.26x so every woman's anime uniform & silhouette reads clearly!
    ctx.save();
    ctx.scale(1.26, 1.26);

    switch (e.archetype) {
      case 'sheriff':
      case 'officer': {
        // ============================================================================
        // 1. OFFICER VIKI: BLONDE POLICEWOMAN IN NAVY UNIFORM, GOLD EPAULETS & TASER
        // ============================================================================
        if (!e.isAlerted) {
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 7px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('ON PATROL', 0, -27);
        } else {
          const sirenRed = Math.floor(gameTime * 16) % 2 === 0;
          ctx.fillStyle = sirenRed ? 'rgba(239, 68, 68, 0.32)' : 'rgba(59, 130, 246, 0.32)';
          ctx.beginPath();
          ctx.arc(0, 0, 26, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 7.5px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('! PURSUIT !', 0, -27);

          if (e.isShiny && (e.isAiming || (e.shootRecoveryTimer ?? 0) > 0)) {
            ctx.save();
            const shieldPulse = 1 + Math.sin(gameTime * 22) * 0.08;
            ctx.strokeStyle = '#fde047';
            ctx.lineWidth = 2.4;
            ctx.shadowColor = '#facc15';
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.arc(0, -4, 24 * shieldPulse, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
            ctx.fill();
            ctx.fillStyle = '#fef08a';
            ctx.font = '800 7px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('★ SNIPER SHIELD (IMMUNE) ★', 0, -35);
            ctx.restore();
          }

          if (e.isAiming && e.aimAngle !== undefined) {
            ctx.save();
            ctx.scale(1 / 1.26, 1 / 1.26);
            const laserLen = e.isShiny ? 880 : 580;
            ctx.strokeStyle = e.isShiny ? '#fde047' : '#ef4444';
            ctx.lineWidth = e.isShiny ? 2.4 : 1.6;
            ctx.setLineDash(e.isShiny ? [14, 4] : [8, 4]);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(e.aimAngle) * laserLen, Math.sin(e.aimAngle) * laserLen);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = e.isShiny ? '#38bdf8' : '#ef4444';
            ctx.beginPath();
            ctx.arc(Math.cos(e.aimAngle) * laserLen, Math.sin(e.aimAngle) * laserLen, e.isShiny ? 5.5 : 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }

        // Flowing golden-blonde high ponytail behind shoulder
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(9.5, -11 + hairSwish * 0.7, 5.0, 10.5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Shapely legs in sheer dark stockings & knee-high patent police boots
        for (const side of [-1, 1]) {
          const lx = side * 4.0;
          const lBob = side === -1 ? legBob : -legBob;
          ctx.strokeStyle = '#fff1f2';
          ctx.lineWidth = 3.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lx, 5);
          ctx.lineTo(lx, 9.5 + lBob * 0.35);
          ctx.stroke();
          // Knee-high black police boot with gold cuff
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 4.0;
          ctx.beginPath();
          ctx.moveTo(lx, 9.2 + lBob * 0.35);
          ctx.lineTo(lx, 15.2 + lBob);
          ctx.stroke();
          ctx.fillStyle = '#facc15';
          ctx.fillRect(lx - 2.2, 8.8 + lBob * 0.35, 4.4, 1.2);
        }

        // Tight navy-blue police pencil-miniskirt with gold piping
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-6.2, 1.5);
        ctx.lineTo(6.2, 1.5);
        ctx.lineTo(8.5, 8.2);
        ctx.lineTo(-8.5, 8.2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Black police utility belt with gold buckle & dangling silver handcuffs
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-6.8, 0.4, 13.6, 2.4);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-1.8, 0.2, 3.6, 2.8);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(-6.8, 3.5, 2.0, 0, Math.PI * 2);
        ctx.arc(-5.2, 5.2, 2.0, 0, Math.PI * 2);
        ctx.stroke();

        // Tailored royal-navy police jacket with white dress shirt, navy tie & gold shoulder epaulets
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(-8.8, -6.5);
        ctx.lineTo(8.8, -6.5);
        ctx.lineTo(6.4, 1.0);
        ctx.lineTo(-6.4, 1.0);
        ctx.closePath();
        ctx.fill();

        // White collared shirt V-neck & navy police tie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(-3.6, -6.5);
        ctx.lineTo(3.6, -6.5);
        ctx.lineTo(0, -0.5);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#1e40af';
        ctx.fillRect(-0.9, -5.8, 1.8, 5.2);

        // Gold shoulder epaulets & gold star badge on chest
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-9.4, -7.2, 4.2, 2.0);
        ctx.fillRect(5.2, -7.2, 4.2, 2.0);
        ctx.beginPath();
        ctx.arc(4.2, -3.5, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Extended arm holding Blue Electric Taser Sidearm (or Long Electro-Sniper Rifle if Shiny!)
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(7.2, -5.0, 5.5, 3.0);
        if (e.isShiny) {
          // High-voltage long-barrel sniper rifle with scope
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(10.5, -5.6, 13.5, 2.6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(12.0, -4.8, 9.5, 1.0);
          // Sniper optic scope
          ctx.fillStyle = '#facc15';
          ctx.fillRect(12.5, -7.4, 4.8, 1.6);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(24.5, -4.3, 2.2 + Math.sin(gameTime * 30) * 0.9, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(11.5, -5.8, 5.2, 3.6);
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(17.2, -4.0, 1.8 + Math.sin(gameTime * 25) * 0.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Anime Face & Blonde Bangs
        drawAnimePursuerFace(ctx, {
          skinTone: '#fff1f2',
          eyeColor: '#2563eb',
          lipColor: '#fb7185',
        });

        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, -13.8, 9.4, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-8.4, -9.5, 2.2, 6.5, 0.12, 0, Math.PI * 2);
        ctx.ellipse(8.4, -9.5, 2.2, 6.5, -0.12, 0, Math.PI * 2);
        ctx.fill();

        // Peaked Navy Police Octagonal Cap with Gold Band & Badge
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.ellipse(0, -20.2, 10.5, 4.4, 0, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-9.2, -18.8, 18.4, 2.6);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(-8.8, -19.4, 17.6, 1.0);
        ctx.beginPath();
        ctx.arc(0, -21.0, 2.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'delinquent': {
        // ============================================================================
        // 2. DELINQUENT RYUKO: SUKEBAN BOSS WITH ANKLE-LENGTH SKIRT, SARASHI & BAT
        // ============================================================================
        // Wild spiky jet-black & crimson-streaked long hair
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.moveTo(-10, -14);
        ctx.lineTo(-14 - hairSwish, 2);
        ctx.lineTo(-9 - hairSwish, 9);
        ctx.lineTo(10 + hairSwish, 9);
        ctx.lineTo(14 + hairSwish, 2);
        ctx.lineTo(10, -14);
        ctx.closePath();
        ctx.fill();
        // Bold crimson hair streaks
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-11, -8);
        ctx.lineTo(-13 - hairSwish, 5);
        ctx.lineTo(-8 - hairSwish, 6);
        ctx.closePath();
        ctx.fill();

        // Draped black Bosozoku / Gakuran long coat billowing off her shoulders like a cape
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.moveTo(-9.5, -6.5);
        ctx.lineTo(-13.5 - hairSwish * 0.5, 11);
        ctx.lineTo(13.5 + hairSwish * 0.5, 11);
        ctx.lineTo(9.5, -6.5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Iconic Sukeban Ankle-Length Pleated Crimson Skirt (reaches all the way to y = 15!)
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(-6.2, 1.2);
        ctx.lineTo(6.2, 1.2);
        ctx.lineTo(10.5, 15.2);
        ctx.lineTo(-10.5, 15.2);
        ctx.closePath();
        ctx.fill();
        // Vertical sukeban skirt pleats & gold hip chain
        ctx.strokeStyle = '#7f1d1d';
        ctx.lineWidth = 0.9;
        for (const px of [-5, -1.8, 1.8, 5]) {
          ctx.beginPath();
          ctx.moveTo(px * 0.8, 1.5);
          ctx.lineTo(px * 1.3, 15.0);
          ctx.stroke();
        }
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(4.5, 4.5, 3.8, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Toned midriff & White Sarashi (chest bandage wrap) under cropped dark sailor collar
        ctx.fillStyle = '#fff1f2';
        ctx.fillRect(-5.2, -1.8, 10.4, 3.4);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-5.8, -5.5, 11.6, 4.0);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-5.8, -3.5);
        ctx.lineTo(5.8, -3.5);
        ctx.stroke();

        // Open dark sailor/gakuran lapels with red scarf tie
        ctx.fillStyle = '#18181b';
        ctx.fillRect(-8.8, -6.8, 3.6, 6.5);
        ctx.fillRect(5.2, -6.8, 3.6, 6.5);
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-2.5, -6.5);
        ctx.lineTo(2.5, -6.5);
        ctx.lineTo(0, -2.5);
        ctx.closePath();
        ctx.fill();

        // Rebellious Anime Face with smirk & cheek band-aid
        drawAnimePursuerFace(ctx, {
          skinTone: '#fff1f2',
          eyeColor: '#dc2626',
          lipColor: '#e11d48',
          hasSmirk: true,
          hasBandAid: true,
        });

        // Spiky black bangs with fiery crimson highlight streak
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(0, -14, 9.5, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-9.2, -14);
        ctx.lineTo(-6.0, -9.2);
        ctx.lineTo(-2.5, -13.5);
        ctx.lineTo(0.5, -9.0);
        ctx.lineTo(3.5, -13.5);
        ctx.lineTo(6.8, -9.2);
        ctx.lineTo(9.2, -14);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-3.2, -14.5);
        ctx.lineTo(-0.5, -9.0);
        ctx.lineTo(1.8, -14.5);
        ctx.closePath();
        ctx.fill();

        // Large Nail-Studded Wooden Bat held at her side (or jagged snapped handle if batBroken!)
        ctx.save();
        ctx.rotate(0.42 + Math.sin(e.batAngle || 0) * 0.22);
        if (e.batBroken) {
          // Snapped jagged wooden bat handle stub!
          ctx.fillStyle = '#f8fafc'; // white grip tape
          ctx.fillRect(9.0, -3.5, 5.0, 7.0);
          ctx.fillStyle = '#b45309';
          ctx.beginPath();
          ctx.moveTo(9.0, -3.5);
          ctx.lineTo(9.0, -9.5);
          ctx.lineTo(10.8, -7.0);
          ctx.lineTo(12.2, -10.5);
          ctx.lineTo(14.0, -3.5);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = e.isShiny ? '#eab308' : '#b45309';
          ctx.beginPath();
          ctx.roundRect(9.0, -21, 5.2, 27, 2.2);
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 0.9;
          ctx.stroke();
          ctx.fillStyle = '#f8fafc'; // white grip tape
          ctx.fillRect(9.0, -4, 5.2, 7.5);
          ctx.fillStyle = '#e2e8f0'; // silver nails/studs
          ctx.fillRect(8.2, -18.5, 6.8, 1.8);
          ctx.fillRect(8.2, -14.5, 6.8, 1.8);
          ctx.fillRect(8.2, -10.5, 6.8, 1.8);

          // Show cracks on bat when damaged
          if (e.batHp !== undefined && e.maxBatHp && e.batHp < e.maxBatHp) {
            ctx.strokeStyle = '#451a03';
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(9.2, -15);
            ctx.lineTo(12.0, -12.5);
            ctx.lineTo(10.2, -9.5);
            ctx.stroke();
          }
        }
        ctx.restore();
        break;
      }

      case 'tomboy': {
        // ============================================================================
        // 3. TOMBOY ROXIE: STYLISH ANIME VARSITY ACE (CRIMSON-AUBURN PONYTAIL, TRACK JACKET & PLEATED SKORT)
        // ============================================================================
        if (e.isDashing) {
          ctx.fillStyle = e.isShiny ? 'rgba(250, 204, 21, 0.45)' : 'rgba(244, 63, 94, 0.32)';
          ctx.beginPath();
          ctx.arc(-Math.cos(e.angle) * 16, -Math.sin(e.angle) * 16, 12, 0, Math.PI * 2);
          ctx.fill();
        }

        // Visible Weave Dodge Afterimage for Shiny Tomboy Roxie!
        if (e.dodgeVisualTimer && e.dodgeVisualTimer > 0) {
          const weaveDir = e.dodgeSide || 1;
          ctx.save();
          ctx.globalAlpha = Math.min(0.85, e.dodgeVisualTimer * 2.2);
          ctx.translate(weaveDir * -14, -2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.45)';
          ctx.beginPath();
          ctx.arc(0, -4, 13, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Bouncy High Crimson-Auburn Ponytail tied with a Crisp White Sporty Ribbon
        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.ellipse(8.2, -16.5 + hairSwish * 0.85, 4.4, 9.2, 0.48, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(4.8, -19.2, 2.4, 1.3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Toned Fair-Peach Anime Legs (`#fde2d2`), Black Knee-High Compression Socks with Twin White Stripes & Red/White High-Tops
        for (const side of [-1, 1]) {
          const lx = side * 3.9;
          const lBob = side === -1 ? legBob * 1.2 : -legBob * 1.2;
          // Healthy fair-peach bare thigh gap (zettai ryouiki)
          ctx.strokeStyle = '#fde2d2';
          ctx.lineWidth = 3.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lx, 5.2);
          ctx.lineTo(lx, 9.6 + lBob * 0.4);
          ctx.stroke();

          // Black athletic knee-high sock
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          ctx.moveTo(lx, 9.2 + lBob * 0.4);
          ctx.lineTo(lx, 15.0 + lBob);
          ctx.stroke();

          // Twin white varsity stripes at top of sock
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(lx - 1.8, 9.8 + lBob * 0.4);
          ctx.lineTo(lx + 1.8, 9.8 + lBob * 0.4);
          ctx.stroke();

          // Crimson & White Anime High-Top Sneakers
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.roundRect(lx - 2.5, 14.0 + lBob, 5.0, 3.4, 1.4);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(lx - 2.5, 16.2 + lBob, 5.0, 1.2);
        }

        // Sleek Black Athletic Spats peeking under a Flared Navy-and-White Pleated Tennis/Track Skort
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-5.4, 4.8, 4.8, 2.4);
        ctx.fillRect(0.6, 4.8, 4.8, 2.4);

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.moveTo(-6.2, 1.2);
        ctx.lineTo(6.2, 1.2);
        ctx.lineTo(9.0, 6.4);
        ctx.lineTo(-9.0, 6.4);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Toned Fair-Peach Midriff & Fitted Black Sporty Crop Top with White Collar Trim
        ctx.fillStyle = '#fde2d2';
        ctx.fillRect(-4.6, -1.5, 9.2, 2.8);
        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.roundRect(-5.8, -6.4, 11.6, 5.0, 1.8);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Stylish Cropped Crimson-Red & White Open Anime Varsity Track Jacket
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.roundRect(-9.2, -6.6, 4.0, 7.2, 1.6);
        ctx.roundRect(5.2, -6.6, 4.0, 7.2, 1.6);
        ctx.fill();
        // Twin white racing stripes on sleeves
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-9.2, -4.4, 4.0, 1.1);
        ctx.fillRect(5.2, -4.4, 4.0, 1.1);

        // Classic White & Crimson Varsity Volleyball / Soccer Ball tucked at her right hip
        ctx.save();
        ctx.translate(10.8, -1.0);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, 4.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#e11d48';
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 2.6, 0.3, 2.4);
        ctx.stroke();
        ctx.restore();

        // Attractive Confident Anime Face with Golden-Amber Eyes, Rosy Blush & Cute Fang Smirk!
        drawAnimePursuerFace(ctx, {
          skinTone: '#fde2d2',
          eyeColor: '#f59e0b',
          lipColor: '#e11d48',
          hasSmirk: true,
          blushAlpha: 0.56,
        });

        // Tousled Crimson-Auburn Wolf-Cut Bob & Feathered Side-Swept Bangs
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.arc(0, -14.0, 9.4, Math.PI, 0);
        ctx.fill();
        // Cheek-framing feathered wolf-cut locks
        ctx.beginPath();
        ctx.ellipse(-8.3, -10.2, 2.2, 5.8, 0.18, 0, Math.PI * 2);
        ctx.ellipse(8.3, -10.2, 2.2, 5.8, -0.18, 0, Math.PI * 2);
        ctx.fill();
        // Dynamic layered bangs
        ctx.beginPath();
        ctx.moveTo(-8.8, -14.2);
        ctx.lineTo(-5.6, -9.6);
        ctx.lineTo(-2.4, -13.2);
        ctx.lineTo(0.4, -9.4);
        ctx.lineTo(3.4, -13.2);
        ctx.lineTo(6.2, -9.6);
        ctx.lineTo(8.8, -14.2);
        ctx.closePath();
        ctx.fill();

        // Glossy hair highlight arc + Cute White Cross Hairpin ('X') on left bang
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, -14.2, 7.0, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(-6.8, -14.8);
        ctx.lineTo(-4.4, -12.4);
        ctx.moveTo(-4.4, -14.8);
        ctx.lineTo(-6.8, -12.4);
        ctx.stroke();
        break;
      }

      case 'goth': {
        // ============================================================================
        // 4. GOTH RAVEN: VICTORIAN GOTHIC LOLITA WITH BELL DRESS, TWIN-TAILS & GRIMOIRE
        // ============================================================================
        const mistGrad = ctx.createRadialGradient(0, 4, 4, 0, 4, e.isJumpscaring ? 38 : 26);
        mistGrad.addColorStop(0, e.isJumpscaring ? 'rgba(234, 179, 8, 0.7)' : 'rgba(168, 85, 247, 0.5)');
        mistGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.35)');
        mistGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
        ctx.fillStyle = mistGrad;
        ctx.beginPath();
        ctx.arc(0, 4, e.isJumpscaring ? 38 : 26, 0, Math.PI * 2);
        ctx.fill();

        // Long floor-length jet-black Gothic Twin-Tails on both sides
        for (const side of [-1, 1]) {
          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.ellipse(side * 10.5, -3 + side * hairSwish * 0.6, 3.8, 12.5, side * -0.2, 0, Math.PI * 2);
          ctx.fill();
          // Purple satin ribbon bows at twin-tail bases
          ctx.fillStyle = '#9333ea';
          ctx.beginPath();
          ctx.arc(side * 9.2, -14.5, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }

        // Purple-and-Black Striped Stockings & Mary Jane Platform Shoes
        for (const side of [-1, 1]) {
          const lx = side * 3.8;
          const lBob = side === -1 ? legBob : -legBob;
          ctx.strokeStyle = '#1e1b4b';
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          ctx.moveTo(lx, 7);
          ctx.lineTo(lx, 15.2 + lBob);
          ctx.stroke();
          // Horizontal purple stripes on stockings
          ctx.strokeStyle = '#a855f7';
          ctx.lineWidth = 3.8;
          ctx.setLineDash([1.6, 1.6]);
          ctx.beginPath();
          ctx.moveTo(lx, 8);
          ctx.lineTo(lx, 14.5 + lBob);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.roundRect(lx - 2.5, 14.2 + lBob, 5.0, 3.4, 1.4);
          ctx.fill();
        }

        // Wide Bell-Shaped Tiered Victorian Gothic Lolita Dress with White Lace Frill Trim!
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.moveTo(-5.8, -0.5);
        ctx.lineTo(5.8, -0.5);
        ctx.quadraticCurveTo(13.5, 4.5, 12.8, 10.2);
        ctx.lineTo(-12.8, 10.2);
        ctx.quadraticCurveTo(-13.5, 4.5, -5.8, -0.5);
        ctx.closePath();
        ctx.fill();

        // White Gothic Lolita Ruffled Lace Hem & Mini-Apron Front
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([2.5, 1.5]);
        ctx.beginPath();
        ctx.moveTo(-12.5, 10.0);
        ctx.lineTo(12.5, 10.0);
        ctx.stroke();
        ctx.setLineDash([]);

        // Laced Purple Ribbon Corset Bodice & Puff Sleeves
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.roundRect(-6.8, -6.5, 13.6, 6.8, 2);
        ctx.fill();
        ctx.fillStyle = '#581c87';
        ctx.fillRect(-3.6, -6.0, 7.2, 5.8);
        // Crisscross corset ribbons
        ctx.strokeStyle = '#e9d5ff';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(-3, -5.5);
        ctx.lineTo(3, -1.5);
        ctx.moveTo(3, -5.5);
        ctx.lineTo(-3, -1.5);
        ctx.stroke();

        // Levitating Occult Grimoire & Orbiting Purple Soul Flame
        ctx.save();
        ctx.translate(12.5, -4 + Math.sin(gameTime * 6) * 2.0);
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(-4, -5, 8, 10);
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1;
        ctx.strokeRect(-4, -5, 8, 10);
        ctx.fillStyle = '#e9d5ff';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✶', 0, 2);
        ctx.restore();

        // Pale Porcelain Goth Anime Face with glowing violet eyes & dark plum lips
        drawAnimePursuerFace(ctx, {
          skinTone: '#faf5ff',
          eyeColor: '#a855f7',
          lipColor: '#6b21a8',
          blushAlpha: 0.32,
          hasBigGrin: Boolean(e.isJumpscaring),
        });

        // Straight Jet-Black Hime Cut Bangs & Sidelocks
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(0, -14.0, 9.4, Math.PI, 0);
        ctx.fill();
        ctx.fillRect(-8.2, -15.0, 16.4, 4.2);
        ctx.fillRect(-9.2, -13.5, 2.6, 9.5);
        ctx.fillRect(6.6, -13.5, 2.6, 9.5);

        // Frilled White & Purple Rose Gothic Lolita Headdress
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.roundRect(-8.8, -20.2, 17.6, 3.2, 1.5);
        ctx.fill();
        ctx.fillStyle = '#9333ea';
        ctx.beginPath();
        ctx.arc(-6.5, -18.6, 2.4, 0, Math.PI * 2);
        ctx.arc(0, -19.2, 2.2, 0, Math.PI * 2);
        ctx.arc(6.5, -18.6, 2.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'hacker': {
        // ============================================================================
        // 5. HACKER NATSUKI: NEET GAMER / HACKER IN OVERSIZED HOODIE, HEADSET & GLOWING LAPTOP
        // ============================================================================
        const isHacking = Boolean(e.hackingTimer && e.hackingTimer > 0);

        // Messy Silver-Lavender & Neon-Mint Gamer Wolf-Cut Twin-Tails / Sidelocks
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.ellipse(-9.8 - hairSwish * 0.45, -4.5, 4.4, 9.5, 0.2, 0, Math.PI * 2);
        ctx.ellipse(9.8 + hairSwish * 0.45, -4.5, 4.4, 9.5, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Neon Emerald-Cyan highlighted hair tips
        ctx.fillStyle = '#10b981';
        for (const side of [-1, 1]) {
          const wx = side * 10.6 + side * hairSwish * 0.55;
          ctx.beginPath();
          ctx.arc(wx, 3.2, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pale Indoor NEET Legs in Black-&-Mint Striped Gamer Thigh-High Socks & Cozy Slip-On Sneakers
        for (const side of [-1, 1]) {
          const lx = side * 3.8;
          const lBob = isHacking ? 0 : side === -1 ? legBob : -legBob;
          // Pale porcelain thigh gap
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 3.7;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lx, 5.5);
          ctx.lineTo(lx, 9.2 + lBob * 0.35);
          ctx.stroke();

          // Black thigh-high gamer stockings with twin neon-emerald top stripes
          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          ctx.moveTo(lx, 9.0 + lBob * 0.35);
          ctx.lineTo(lx, 15.0 + lBob);
          ctx.stroke();

          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(lx - 1.9, 9.6 + lBob * 0.35);
          ctx.lineTo(lx + 1.9, 9.6 + lBob * 0.35);
          ctx.stroke();

          // Chunky dark slate & neon-cyan gamer sneakers
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.roundRect(lx - 2.6, 14.0 + lBob, 5.2, 3.5, 1.4);
          ctx.fill();
          ctx.fillStyle = '#10b981';
          ctx.fillRect(lx - 2.6, 16.3 + lBob, 5.2, 1.2);
        }

        // Slouchy Oversized Charcoal-Slate Gamer Hoodie Dress (hem reaches mid-thigh with neon cyber trim!)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-9.4, -7.2, 18.8, 15.0, 4.2);
        ctx.fill();
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.1;
        ctx.strokeRect(-9.2, -7.0, 18.4, 14.6);

        // Front kangaroo pocket & glowing cyber power emblem on chest
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-6.4, 1.8, 12.8, 4.6, 1.8);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(0, -2.5, 2.3, 0.3 * Math.PI, 0.7 * Math.PI, true);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -5.2);
        ctx.lineTo(0, -2.5);
        ctx.stroke();

        // Long baggy slouch sleeves covering her hands
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-11.8, -6.2, 3.8, 9.4, 1.8);
        ctx.roundRect(8.0, -6.2, 3.8, 9.4, 1.8);
        ctx.fill();
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-11.8, 1.6, 3.8, 1.2);
        ctx.fillRect(8.0, 1.6, 3.8, 1.2);

        // Open Glowing RGB Hacker Laptop held in front/right (Flashes bright emerald-cyan code while hacking!)
        ctx.save();
        ctx.translate(isHacking ? 2.5 : 9.6, isHacking ? -0.5 : -2.2);
        ctx.rotate(isHacking ? 0.05 : -0.18);
        // Laptop base deck
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-5.6, 1.5, 11.2, 3.2, 1.0);
        ctx.fill();
        // Open tilted LCD screen with glowing neon border
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = isHacking ? '#fde047' : '#10b981';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-5.4, -6.2, 10.8, 7.8, 1.2);
        ctx.fill();
        ctx.stroke();
        // Scrolling matrix code lines on laptop screen
        ctx.fillStyle = isHacking ? '#fde047' : '#34d399';
        const codeOffset = Math.floor(gameTime * 12) % 3;
        ctx.fillRect(-3.8, -4.6 + codeOffset * 0.6, 5.4, 1.0);
        ctx.fillRect(-3.8, -2.6 + codeOffset * 0.4, 7.2, 1.0);
        ctx.fillRect(-3.8, -0.6, 4.2, 1.0);
        ctx.restore();

        // Smug Sleepy NEET Gamer Anime Face with Glowing Emerald Eyes & Subtle Dark Under-Eye Circles
        drawAnimePursuerFace(ctx, {
          skinTone: '#f8fafc',
          eyeColor: '#10b981',
          lipColor: '#f472b6',
          hasSmirk: true,
          blushAlpha: 0.48,
        });

        // Messy Silver-Indigo Bangs framing face
        ctx.fillStyle = '#4338ca';
        ctx.beginPath();
        ctx.arc(0, -14.0, 9.4, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-9.0, -14.2);
        ctx.lineTo(-5.8, -9.0);
        ctx.lineTo(-2.2, -13.2);
        ctx.lineTo(0.8, -8.8);
        ctx.lineTo(3.8, -13.2);
        ctx.lineTo(6.8, -9.2);
        ctx.lineTo(9.0, -14.2);
        ctx.closePath();
        ctx.fill();

        // Glowing RGB Cat-Ear Gaming Headset perched over her hair!
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(0, -14.2, 10.2, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
        // Earcups with neon cyan LED rings
        for (const side of [-1, 1]) {
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(side * 9.8, -12.0, 2.2, 3.6, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1.0;
          ctx.stroke();

          // Cute glowing RGB Cat Ears on top of headband
          ctx.fillStyle = '#1e293b';
          ctx.beginPath();
          ctx.moveTo(side * 4.2, -22.2);
          ctx.lineTo(side * 6.8, -27.2);
          ctx.lineTo(side * 8.6, -20.8);
          ctx.closePath();
          ctx.fill();
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(side * 5.0, -22.4);
          ctx.lineTo(side * 6.6, -25.8);
          ctx.lineTo(side * 7.8, -21.4);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'senpai': {
        // ============================================================================
        // 6. OFFICE SENPAI: SILVER-HAIRED EXECUTIVE SIREN WITH RED GLASSES, PENCIL SKIRT & COFFEE
        // ============================================================================
        // Long sleek silver-lavender hair cascading down her back
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(-9.5, -14);
        ctx.quadraticCurveTo(-12.5 - hairSwish, 0, -9.5 - hairSwish, 11);
        ctx.lineTo(9.5 + hairSwish, 11);
        ctx.quadraticCurveTo(12.5 + hairSwish, 0, 9.5, -14);
        ctx.closePath();
        ctx.fill();

        // Sheer Black Nylons & Red-Soled Designer Stiletto Heels
        for (const side of [-1, 1]) {
          const lx = side * 3.6;
          const lBob = side === -1 ? legBob : -legBob;
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 3.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lx, 7.5);
          ctx.lineTo(lx, 15.2 + lBob);
          ctx.stroke();

          ctx.fillStyle = '#09090b';
          ctx.beginPath();
          ctx.roundRect(lx - 2.3, 14.2 + lBob, 4.6, 3.2, 1.2);
          ctx.fill();
          ctx.fillStyle = '#e11d48';
          ctx.fillRect(lx - 2.3, 16.4 + lBob, 4.6, 1.0);
        }

        // Form-Fitting High-Waisted Charcoal Pencil Skirt (longer knee-length tapered cut!)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-6.6, 0.2);
        ctx.lineTo(6.6, 0.2);
        ctx.quadraticCurveTo(8.2, 5.0, 6.2, 10.2);
        ctx.lineTo(-6.2, 10.2);
        ctx.quadraticCurveTo(-8.2, 5.0, -6.6, 0.2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 0.9;
        ctx.stroke();

        // Crisp White Fitted Office Blouse, Dark Vest & Crimson Silk Necktie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-7.8, -6.5, 15.6, 7.2, 2);
        ctx.fill();
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(-7.8, -6.5, 4.2, 7.0);
        ctx.fillRect(3.6, -6.5, 4.2, 7.0);
        // Crimson necktie
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.moveTo(-1.2, -5.8);
        ctx.lineTo(1.2, -5.8);
        ctx.lineTo(1.6, 0.5);
        ctx.lineTo(0, 2.2);
        ctx.lineTo(-1.6, 0.5);
        ctx.closePath();
        ctx.fill();

        // Executive Clipboard in left hand & Steaming Espresso Mug in right hand
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-12.5, -5.5, 5.5, 7.5);
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-11.7, -4.3, 3.9, 5.5);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(8.8, -4.5, 4.6, 5.2, 1.2);
        ctx.fill();
        ctx.fillStyle = '#451a03';
        ctx.fillRect(9.4, -3.8, 3.4, 1.5);

        // Cool Mature Anime Face with Red-Framed Glasses
        drawAnimePursuerFace(ctx, {
          skinTone: '#fff1f2',
          eyeColor: '#0284c7',
          lipColor: '#be123c',
          hasGlasses: true,
        });

        // Sleek Silver-White Side-Swept Hair & High Executive Bun
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -21.8, 5.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, -14.0, 9.4, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-8.4, -9.0, 2.3, 7.2, 0.1, 0, Math.PI * 2);
        ctx.ellipse(8.4, -9.0, 2.3, 7.2, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-8.8, -14.2);
        ctx.quadraticCurveTo(0, -9.2, 8.8, -13.5);
        ctx.lineTo(8.8, -15.5);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'yandere': {
        // ============================================================================
        // 7. YANDERE AYAME: SAKURA-PINK SCHOOLGIRL IN NAVY SAILOR FUKU WITH KNIFE & HEART EYES
        // ============================================================================
        const isJealousRage = Boolean(e.jealousRageTimer && e.jealousRageTimer > 0);
        ctx.fillStyle = isJealousRage ? 'rgba(225, 29, 72, 0.55)' : 'rgba(244, 63, 94, 0.25)';
        ctx.beginPath();
        ctx.arc(-Math.cos(e.angle) * 10, -Math.sin(e.angle) * 10, isJealousRage ? 22 : 14, 0, Math.PI * 2);
        ctx.fill();

        if (isJealousRage) {
          ctx.save();
          ctx.strokeStyle = '#fde047';
          ctx.lineWidth = 2.2;
          ctx.setLineDash([4, 3]);
          ctx.beginPath();
          ctx.arc(0, -2, 22, gameTime * 6, gameTime * 6 + Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        // Sakura-Pink Twin Side-Tails tied with Crimson Ribbons
        for (const side of [-1, 1]) {
          ctx.fillStyle = '#f472b6';
          ctx.beginPath();
          ctx.ellipse(side * 10.5, -8 + side * hairSwish * 0.6, 4.2, 9.5, side * -0.25, 0, Math.PI * 2);
          ctx.fill();
          // Crimson hair ribbons
          ctx.fillStyle = '#e11d48';
          ctx.beginPath();
          ctx.arc(side * 9.0, -15.2, 2.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Shapely Legs in Black Knee-High School Socks & Brown Loafers
        for (const side of [-1, 1]) {
          const lx = side * 3.8;
          const lBob = side === -1 ? legBob : -legBob;
          ctx.strokeStyle = '#fff1f2';
          ctx.lineWidth = 3.6;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lx, 5);
          ctx.lineTo(lx, 9.5 + lBob * 0.35);
          ctx.stroke();

          ctx.strokeStyle = '#09090b';
          ctx.lineWidth = 3.6;
          ctx.beginPath();
          ctx.moveTo(lx, 9.2 + lBob * 0.35);
          ctx.lineTo(lx, 15.0 + lBob);
          ctx.stroke();

          ctx.fillStyle = '#451a03';
          ctx.beginPath();
          ctx.roundRect(lx - 2.4, 14.2 + lBob, 4.8, 3.2, 1.4);
          ctx.fill();
        }

        // Pleated Navy-Blue School Sailor Skirt (`#1e3a8a`) with white trim
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(-6.0, 1.4);
        ctx.lineTo(6.0, 1.4);
        ctx.lineTo(9.4, 8.2);
        ctx.lineTo(-9.4, 8.2);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Traditional White & Navy Japanese Sailor Fuku (Serafuku) Top with Crimson Scarf!
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-7.6, -6.5, 15.2, 8.2, 2);
        ctx.fill();
        // Navy sailor collar with white stripe
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(-7.8, -6.5);
        ctx.lineTo(7.8, -6.5);
        ctx.lineTo(4.2, -1.8);
        ctx.lineTo(-4.2, -1.8);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Iconic Crimson Sailor Ribbon / Scarf at center of chest
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.moveTo(-2.4, -2.5);
        ctx.lineTo(2.4, -2.5);
        ctx.lineTo(0, 2.5);
        ctx.closePath();
        ctx.fill();

        // Gleaming Silver Kitchen Knife held in right hand + Love Letter in left hand
        ctx.save();
        ctx.translate(10.2, -3.0);
        ctx.rotate(-0.35 + Math.sin(gameTime * 10 + e.id) * 0.15);
        // Black knife handle
        ctx.fillStyle = '#09090b';
        ctx.fillRect(-1.4, 0, 2.8, 4.5);
        // Silver blade with crimson tip
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.moveTo(-1.6, 0);
        ctx.lineTo(-1.6, -9.5);
        ctx.lineTo(1.8, -5.0);
        ctx.lineTo(1.8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e11d48';
        ctx.beginPath();
        ctx.arc(-0.5, -7.2, 1.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Obsessed Yandere Anime Face with Glowing Heart Pupils (`♥`) & Heavy Blush
        drawAnimePursuerFace(ctx, {
          skinTone: '#fff1f2',
          eyeColor: '#e11d48',
          lipColor: '#f43f5e',
          hasHeartPupils: true,
          blushAlpha: 0.72,
        });

        // Pastel Sakura-Pink Hair, Hime Sidelocks & Bangs
        ctx.fillStyle = '#f9a8d4';
        ctx.beginPath();
        ctx.arc(0, -14.0, 9.4, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-8.4, -9.0, 2.3, 7.0, 0.1, 0, Math.PI * 2);
        ctx.ellipse(8.4, -9.0, 2.3, 7.0, -0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-8.8, -14.2);
        ctx.lineTo(-5.8, -9.5);
        ctx.lineTo(-2.8, -13.2);
        ctx.lineTo(0, -9.2);
        ctx.lineTo(2.8, -13.2);
        ctx.lineTo(5.8, -9.5);
        ctx.lineTo(8.8, -14.2);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'trainer': {
        // ============================================================================
        // 8. TRAINER MAYA & REX: SPORTY K-9 HANDLER WITH LARGE EXTENDED HOUND ON LEASH (OR OFF-LEASH SHINY)
        // ============================================================================
        const isLunging = Boolean(e.isDashing || (e.dogLungeTimer && e.dogLungeTimer > 0) || e.isHoundPinning);
        const isHoundKO = Boolean(e.houndKnockoutTimer && e.houndKnockoutTimer > 0);
        const dogStride = isHoundKO ? 0 : Math.sin(gameTime * (isLunging ? 24 : 15) + e.id);
        const headingAngle = e.angle || 0;

        // Calculate Rex's local coordinates (in 1.26x scaled character space) from world coordinates or preview fallback
        let dogX: number;
        let dogY: number;
        if (e.houndWorldX !== undefined && e.houndWorldY !== undefined) {
          dogX = (e.houndWorldX - e.x) / 1.26;
          dogY = (e.houndWorldY - e.y) / 1.26;
        } else {
          const previewLead = isLunging ? 48 : 36;
          dogX = Math.cos(headingAngle) * previewLead + 8;
          dogY = Math.sin(headingAngle) * previewLead * 0.55 + 5 + dogStride * 1.2;
        }

        // Braided Amber Agility Leash (ONLY for standard Maya — Shiny Maya's hound is completely OFF-LEASH!)
        if (!e.isShiny) {
          ctx.save();
          if (e.isLeashTaut) {
            // Taut leash pulls straight and glows with high kinetic tension
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.6;
            ctx.shadowColor = '#f87171';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(-8.5, -2.0);
            ctx.lineTo(dogX - 2.5, dogY - 3.0);
            ctx.stroke();

            // Tension sparkle along the taut leash
            ctx.fillStyle = '#fef08a';
            ctx.beginPath();
            ctx.arc((dogX - 8.5) * 0.5, (dogY - 2.0) * 0.5, 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.strokeStyle = isLunging ? '#fde047' : '#f59e0b';
            ctx.lineWidth = 1.7;
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = isLunging ? 9 : 4;
            ctx.beginPath();
            ctx.moveTo(-8.5, -2.0);
            ctx.quadraticCurveTo(
              (dogX - 8.5) * 0.5,
              (dogY - 2.0) * 0.5 + (isLunging ? 1.0 : 6.0),
              dogX - 2.5,
              dogY - 3.0
            );
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // --- LARGE K-9 HOUND ("REX" — Sleek, Muscular Sable-and-Tan Hound Extending Forward) ---
        ctx.save();
        ctx.translate(dogX, dogY);
        const houndScale = 1.34; // Large imposing hound silhouette!
        ctx.scale(houndScale, houndScale);
        if (isHoundKO) {
          ctx.rotate(0.45);
          ctx.globalAlpha = 0.72;
        }

        // Ground shadow under large hound
        ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
        ctx.beginPath();
        ctx.ellipse(0, 6.5, 9.5, 3.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Long streaming hound tail
        const tailWag = isHoundKO ? 0 : Math.sin(gameTime * 20 + e.id) * 0.45;
        ctx.save();
        ctx.translate(-7.2, -0.8);
        ctx.rotate(-0.4 + tailWag);
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(-3.2, 0, 4.4, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Powerful extended front & rear hound legs
        for (const pSide of [-1, 1]) {
          const pawBob = pSide === -1 ? dogStride * 2.8 : -dogStride * 2.8;
          ctx.strokeStyle = '#92400e';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(pSide * 4.4, 1.2);
          ctx.lineTo(pSide * 5.2 + pawBob * 0.65, 5.8 + Math.abs(pawBob) * 0.25);
          ctx.stroke();
          // Tan hound paws
          ctx.fillStyle = '#fde68a';
          ctx.beginPath();
          ctx.arc(pSide * 5.2 + pawBob * 0.65, 6.0 + Math.abs(pawBob) * 0.25, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Muscular elongated deep-chest hound torso
        ctx.fillStyle = e.isShiny ? '#d97706' : '#92400e';
        ctx.beginPath();
        ctx.ellipse(0, 0.2, 8.2, 4.2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Jet-black hound saddle coat across back
        ctx.fillStyle = '#290f02';
        ctx.beginPath();
        ctx.ellipse(-0.8, -0.8, 5.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tactical K-9 Harness & Spiked Gold Collar
        ctx.strokeStyle = e.isShiny ? '#fde047' : '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(3.0, -3.5);
        ctx.lineTo(1.8, 3.6);
        ctx.moveTo(-2.0, -3.5);
        ctx.lineTo(3.0, -0.4);
        ctx.stroke();
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(4.4, -1.2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Noble Elongated Hound Head, Snout & Pointed Ears
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(5.6, -3.6, 4.2, 0, Math.PI * 2);
        ctx.fill();
        // Elongated hound muzzle/snout extending forward
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(8.8, -2.8, 3.2, 2.0, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fde68a';
        ctx.beginPath();
        ctx.ellipse(6.8, -2.2, 2.5, 1.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tall swept-back K-9 hound ears
        ctx.fillStyle = '#290f02';
        ctx.beginPath();
        ctx.moveTo(2.4, -6.5);
        ctx.lineTo(3.4, -11.4);
        ctx.lineTo(5.4, -7.0);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(5.4, -6.8);
        ctx.lineTo(7.2, -11.2);
        ctx.lineTo(8.4, -6.4);
        ctx.closePath();
        ctx.fill();

        // Keen amber-gold hound eyes & black nose
        ctx.fillStyle = e.isShiny ? '#fde047' : '#fef08a';
        ctx.beginPath();
        ctx.arc(6.6, -4.5, 0.95, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#09090b';
        ctx.beginPath();
        ctx.arc(11.4, -3.1, 1.15, 0, Math.PI * 2);
        ctx.fill();

        if (isHoundKO) {
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 6px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`★ KO ${e.houndKnockoutTimer!.toFixed(1)}s ★`, 2, -13);
        } else if (e.isHoundPinning) {
          ctx.fillStyle = '#fda4af';
          ctx.font = 'bold 6px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('HOLDING DOWN! ♥', 4, -13);
        } else if (isLunging) {
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 6px "Outfit", sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(e.isShiny ? 'OFF-LEASH HUNT!' : 'HOUND LUNGE!', 4, -13);
        }
        ctx.restore();

        // --- TRAINER MAYA (Sporty Honey-Blonde K-9 Handler in Amber Vest & Visor) ---
        // Bouncy Honey-Caramel Braided Side Ponytail
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.ellipse(-9.4 - hairSwish * 0.6, -12.5, 4.2, 9.0, -0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(-7.5, -16.2, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Toned Athletic Legs in Khaki Cargo Shorts, Ankle Socks & Trail Running Sneakers
        for (const side of [-1, 1]) {
          const lx = side * 3.9;
          const lBob = side === -1 ? legBob : -legBob;
          ctx.strokeStyle = '#fde2d2';
          ctx.lineWidth = 3.8;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(lx, 5.0);
          ctx.lineTo(lx, 11.2 + lBob * 0.45);
          ctx.stroke();

          // Sporty white ankle socks & amber-black trail running shoes
          ctx.strokeStyle = '#f8fafc';
          ctx.lineWidth = 3.8;
          ctx.beginPath();
          ctx.moveTo(lx, 11.0 + lBob * 0.45);
          ctx.lineTo(lx, 14.5 + lBob);
          ctx.stroke();

          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.roundRect(lx - 2.6, 14.0 + lBob, 5.2, 3.4, 1.4);
          ctx.fill();
          ctx.fillStyle = '#18181b';
          ctx.fillRect(lx - 2.6, 16.2 + lBob, 5.2, 1.2);
        }

        // High-Waisted Charcoal & Amber K-9 Handler Shorts with Paw Treat Pouch on Belt
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(-6.8, 1.0, 13.6, 5.8, 1.8);
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.0;
        ctx.strokeRect(-6.8, 1.0, 13.6, 5.8);

        // Treat pouch at right hip with cute paw emblem
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(4.4, 0.5, 4.2, 4.6, 1.2);
        ctx.fill();
        ctx.fillStyle = '#fef3c7';
        ctx.beginPath();
        ctx.arc(6.5, 2.8, 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Toned midriff & Fitted White Athletic Crop Tank
        ctx.fillStyle = '#fde2d2';
        ctx.fillRect(-4.8, -1.4, 9.6, 2.6);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(-5.8, -6.4, 11.6, 5.2, 1.6);
        ctx.fill();

        // Cropped Warm-Amber & Slate K-9 Handler Tactical Vest
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.roundRect(-9.0, -6.6, 4.2, 7.2, 1.5);
        ctx.roundRect(4.8, -6.6, 4.2, 7.2, 1.5);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-9.0, -3.8, 4.2, 1.3);
        ctx.fillRect(4.8, -3.8, 4.2, 1.3);

        // Silver Handler Whistle on Red Lanyard around neck
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.moveTo(-2.4, -6.4);
        ctx.lineTo(0, -2.2);
        ctx.lineTo(2.4, -6.4);
        ctx.stroke();
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(0, -1.8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Warm Expressive Anime Face with Emerald-Amber Eyes & Playful Grin
        drawAnimePursuerFace(ctx, {
          skinTone: '#fde2d2',
          eyeColor: '#10b981',
          lipColor: '#fb7185',
          hasBigGrin: true,
          blushAlpha: 0.58,
        });

        // Honey-Blonde Swept Bangs & Sporty K-9 Handler Sun Visor Cap with Paw Badge
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(0, -14.0, 9.4, Math.PI, 0);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-8.3, -9.8, 2.2, 6.2, 0.14, 0, Math.PI * 2);
        ctx.ellipse(8.3, -9.8, 2.2, 6.2, -0.14, 0, Math.PI * 2);
        ctx.fill();

        // Sleek Dark Slate & Amber Sun Visor Cap
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(-9.2, -18.8, 18.4, 3.2, 1.4);
        ctx.fill();
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(0, -16.0, 9.8, 2.4, 0, 0, Math.PI);
        ctx.fill();
        // Cute gold paw print on visor front
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(0, -17.3, 1.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    // --- SUNSET BEACH STAGE: ARCHETYPE-COLORED SUMMER SWIMSUIT OVERLAY ON ALL PURSUER WOMEN ---
    if (r.mapEnv.id === 'beach') {
      const swimColor = e.isShiny
        ? '#fde047'
        : GAME_TEXT.archetypes[e.archetype as ArchetypeKey]?.colorHex || '#f43f5e';
      const trimColor = e.isShiny ? '#f59e0b' : '#ffffff';
      const skinTone = e.archetype === 'tomboy' ? '#fed7aa' : '#ffe4e6';

      // Bare sun-kissed anime legs & midriff for summer beach party
      ctx.fillStyle = skinTone;
      ctx.fillRect(-5.0, -1.6, 10.0, 4.6);
      ctx.fillRect(-5.0, 5.8, 3.6, 7.2);
      ctx.fillRect(1.4, 5.8, 3.6, 7.2);

      // Cute side-tie bikini bottom + sheer beach pareo wrap
      ctx.fillStyle = swimColor;
      ctx.beginPath();
      ctx.moveTo(-6.4, 2.4);
      ctx.lineTo(6.4, 2.4);
      ctx.lineTo(4.2, 6.8);
      ctx.lineTo(-4.2, 6.8);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = trimColor;
      ctx.lineWidth = 0.9;
      ctx.stroke();

      // Side-tie hip ribbons
      ctx.fillStyle = trimColor;
      ctx.beginPath();
      ctx.arc(-6.5, 3.2, 1.5, 0, Math.PI * 2);
      ctx.arc(6.5, 3.2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Halter bikini top with center bow/ring
      ctx.fillStyle = swimColor;
      ctx.beginPath();
      ctx.roundRect(-6.2, -5.6, 12.4, 3.9, 1.8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = trimColor;
      ctx.beginPath();
      ctx.arc(0, -3.6, 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore(); // Restore 1.26x character scale

    // --- DELINQUENT-EXCLUSIVE VISIBLE DEFLECTION EFFECT ---
    if (e.archetype === 'delinquent' && e.deflectSparkTimer && e.deflectSparkTimer > 0) {
      ctx.save();
      const sparkAlpha = Math.min(1, e.deflectSparkTimer / 0.15);
      ctx.globalAlpha = sparkAlpha;

      // Glowing curved oak bat deflection barrier arc
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(14, -4, 28, -Math.PI / 2.5, Math.PI / 2.5);
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1.5;
      for (let sp = 0; sp < 6; sp++) {
        const spA = (sp * Math.PI) / 3 + gameTime * 12;
        ctx.beginPath();
        ctx.moveTo(14 + Math.cos(spA) * 12, -4 + Math.sin(spA) * 12);
        ctx.lineTo(14 + Math.cos(spA) * 30, -4 + Math.sin(spA) * 30);
        ctx.stroke();
      }

      ctx.fillStyle = '#fde047';
      ctx.font = '900 13px Outfit, sans-serif';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText('CLANG!', 18, -22);
      ctx.fillText('CLANG!', 18, -22);

      ctx.restore();
    }

    // Goth Sorrow Aura & Occult Teleport Destination Telegraph Sigil
    if (e.archetype === 'goth') {
      if (activeUpgrades?.includes('goth_sorrow_aura')) {
        ctx.save();
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, 180, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      }

      if (
        e.teleportTelegraphTimer &&
        e.teleportTelegraphTimer > 0 &&
        e.teleportTargetX !== undefined &&
        e.teleportTargetY !== undefined
      ) {
        ctx.save();
        const tx = e.teleportTargetX - e.x;
        const ty = e.teleportTargetY - e.y;

        // Shadow thread linking Raven to her upcoming blink coordinates
        ctx.strokeStyle = e.isShiny ? 'rgba(250, 204, 21, 0.68)' : 'rgba(192, 132, 252, 0.65)';
        ctx.lineWidth = 1.8;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Spinning occult pentacle sigil at the destination coordinates
        ctx.translate(tx, ty);
        const sigilPulse = 1 + Math.sin(gameTime * 18) * 0.16;
        const ringColor = e.isShiny ? '#fde047' : '#a855f7';
        const innerColor = e.isShiny ? '#f43f5e' : '#e879f9';

        const riftGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 24 * sigilPulse);
        riftGrad.addColorStop(0, 'rgba(88, 28, 135, 0.72)');
        riftGrad.addColorStop(0.65, e.isShiny ? 'rgba(250, 204, 21, 0.35)' : 'rgba(168, 85, 247, 0.35)');
        riftGrad.addColorStop(1, 'rgba(88, 28, 135, 0)');
        ctx.fillStyle = riftGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 24 * sigilPulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(gameTime * 6);
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(0, 0, 17 * sigilPulse, 0, Math.PI * 2);
        ctx.stroke();

        // Occult star chords inside the destination circle
        ctx.strokeStyle = innerColor;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a1 = (i * 2 * Math.PI) / 5 - Math.PI / 2;
          const a2 = (((i + 2) % 5) * 2 * Math.PI) / 5 - Math.PI / 2;
          ctx.moveTo(Math.cos(a1) * 15, Math.sin(a1) * 15);
          ctx.lineTo(Math.cos(a2) * 15, Math.sin(a2) * 15);
        }
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = ringColor;
        ctx.font = '800 8.5px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✶ SHADOW BLINK ✶', 0, -22);
        ctx.restore();
      }
    }

    // Tomboy Slide Tackle Dust Puffs
    if (e.archetype === 'tomboy' && e.isSliding) {
      ctx.save();
      ctx.fillStyle = 'rgba(251, 146, 60, 0.35)';
      ctx.beginPath();
      ctx.arc(-16, 6, 14, 0, Math.PI * 2);
      ctx.arc(-26, 8, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Hacker Natsuki Laptop Sabotage Progress Bar & Glitch Pulse Ring
    if (e.archetype === 'hacker') {
      if ((e.stompWaveTimer ?? 0) > 0 && (e.stompWaveRadius ?? 0) > 0) {
        ctx.save();
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.78)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, e.stompWaveRadius!, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      if (e.hackingTimer && e.hackingTimer > 0) {
        ctx.save();
        const prog = Math.min(1, Math.max(0, 1 - e.hackingTimer / 2.0));
        const barW = 54;
        const barH = 5;
        ctx.fillStyle = 'rgba(2, 6, 23, 0.9)';
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(-barW / 2, -42, barW, barH, 2.5);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#34d399';
        ctx.fillRect(-barW / 2 + 1, -41, (barW - 2) * prog, barH - 2);

        ctx.fillStyle = '#6ee7b7';
        ctx.font = '800 8.5px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💻 HACKING...', 0, -45);
        ctx.restore();
      }
    }

    // Raised Immortal Victor Title Badge (Hovers cleanly above all character hats/buns/ears without cutting into models!)
    if (e.isHauntingWinner) {
      ctx.save();
      const badgeText =
        e.postWinWaitTimer && e.postWinWaitTimer > 0
          ? `♥ RESTING (${e.postWinWaitTimer.toFixed(1)}s) ♥`
          : '★ IMMORTAL VICTOR ★';
      ctx.font = '800 9px "Outfit", sans-serif';
      const bw = ctx.measureText(badgeText).width + 12;
      const badgeY = -66; // Raised from -50 to -66 so it hovers well above all headgear without cutting into models!
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.roundRect(-bw / 2, badgeY, bw, 14, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fda4af';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(badgeText, 0, badgeY + 7);

      if (e.immunePopupTimer && e.immunePopupTimer > 0) {
        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px "Outfit", sans-serif';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.strokeText('IMMUNE! ♥', 0, -82 - (0.5 - e.immunePopupTimer) * 16);
        ctx.fillText('IMMUNE! ♥', 0, -82 - (0.5 - e.immunePopupTimer) * 16);
      }
      ctx.restore();
    } else {
      if (e.immunePopupTimer && e.immunePopupTimer > 0) {
        ctx.save();
        ctx.fillStyle = '#fde047';
        ctx.font = '900 12px "Outfit", sans-serif';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.textAlign = 'center';
        ctx.strokeText('IMMUNE! ⚡', 0, -68 - (0.5 - e.immunePopupTimer) * 16);
        ctx.fillText('IMMUNE! ⚡', 0, -68 - (0.5 - e.immunePopupTimer) * 16);
        ctx.restore();
      }
      if (e.hp < e.maxHp) {
        const barWidth = 26;
        const barHeight = 4;
        const hpPct = Math.max(0, e.hp / e.maxHp);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillRect(-barWidth / 2, -34, barWidth, barHeight);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-barWidth / 2, -34, barWidth * hpPct, barHeight);
      }
    }

    // --- LIVED-IN WORLD AWARENESS & OFF-DUTY IDLE INDICATORS ---
    // 1. Subtle forward vision cone when unaware/searching in vision-hindered maps or nearby
    if (e.awarenessState && e.awarenessState !== 'alerted') {
      ctx.save();
      ctx.rotate(e.angle || 0);
      const coneLen = r.mapEnv.id === 'mansion' || r.mapEnv.id === 'forest' ? 115 : 85;
      const coneGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, coneLen);
      if (e.awarenessState === 'searching') {
        coneGrad.addColorStop(0, 'rgba(250, 204, 21, 0.22)');
        coneGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
      } else {
        coneGrad.addColorStop(0, 'rgba(148, 163, 184, 0.14)');
        coneGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      }
      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, coneLen, -0.52, 0.52);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Subtle off-duty activity tag when standing/socializing/stretching
      if (e.idleActionLabel && e.speechTimer <= 0) {
        ctx.save();
        ctx.font = '600 8.5px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.85)';
        ctx.textAlign = 'center';
        ctx.fillText(e.idleActionLabel, 0, -34);
        ctx.restore();
      }
    }

    // 2. Pop-up '!' (Spotted) or '?' (Searching / Lost Sight) Indicator
    if (e.alertPopTimer && e.alertPopTimer > 0 && e.alertPopType) {
      ctx.save();
      const popScale = 1 + Math.sin(e.alertPopTimer * 12) * 0.2;
      ctx.translate(0, -42);
      ctx.scale(popScale, popScale);
      ctx.font = '900 15px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3.5;
      const badgeText = e.alertPopType === '!' ? '!!' : '??';
      ctx.strokeText(badgeText, 0, 0);
      ctx.fillStyle = e.alertPopType === '!' ? '#f43f5e' : '#facc15';
      ctx.fillText(badgeText, 0, 0);
      ctx.restore();
    }

    if (e.speechTimer > 0 && e.speechText) {
      ctx.save();
      const isOffDutySpeech = e.awarenessState && e.awarenessState !== 'alerted';
      const txt = e.idleActionLabel && isOffDutySpeech ? `${e.idleActionLabel} ${e.speechText}` : e.speechText;
      ctx.font = isOffDutySpeech ? '500 9.5px Outfit, sans-serif' : '600 10px Outfit, sans-serif';
      const textWidth = ctx.measureText(txt).width;
      const boxW = textWidth + 12;
      const boxH = 18;
      // Raise speech bubble higher if Immortal Victor badge is active so they never overlap
      const boxY = e.isHauntingWinner ? -88 : -52;

      ctx.fillStyle = isOffDutySpeech ? 'rgba(15, 23, 42, 0.82)' : 'rgba(15, 23, 42, 0.92)';
      ctx.strokeStyle = isOffDutySpeech
        ? 'rgba(148, 163, 184, 0.65)'
        : GAME_TEXT.archetypes[e.archetype as ArchetypeKey]?.colorHex || '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-boxW / 2, boxY, boxW, boxH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-4, boxY + boxH);
      ctx.lineTo(0, boxY + boxH + 4);
      ctx.lineTo(4, boxY + boxH);
      ctx.fill();

      ctx.fillStyle = isOffDutySpeech ? '#e2e8f0' : '#f8fafc';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, 0, boxY + boxH / 2);
      ctx.restore();
    }

    ctx.restore();
  }
}

/** Draws projectiles */
export function drawBullets(r: RenderContext) {
  const { ctx, cameraX, cameraY, bullets } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const b of bullets) {
    ctx.fillStyle = b.color;
    ctx.shadowColor = b.trailColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    const speed = Math.hypot(b.vx, b.vy) || 1;
    const trailLen = Math.min(22, b.radius * 2.5);
    ctx.strokeStyle = b.trailColor;
    ctx.lineWidth = b.radius * 0.9;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - (b.vx / speed) * trailLen, b.y - (b.vy / speed) * trailLen);
    ctx.stroke();

    if (r.debuffStats?.redTapeBullets) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - (b.vx / speed) * 36, b.y - (b.vy / speed) * 36);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  ctx.restore();
}

/** Draws enemy projectiles (Officer stun darts, Shiny boss attacks, Heart needles) */
export function drawEnemyBullets(r: RenderContext) {
  const { ctx, cameraX, cameraY, enemyBullets = [] } = r;
  if (!enemyBullets || enemyBullets.length === 0) return;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const b of enemyBullets) {
    ctx.save();
    ctx.fillStyle = b.color || '#ef4444';
    ctx.shadowColor = b.trailColor || '#f87171';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius || 5, 0, Math.PI * 2);
    ctx.fill();

    // Electric taser sparks or trail
    const speed = Math.hypot(b.vx, b.vy) || 1;
    const trailLen = Math.min(26, (b.radius || 5) * 3);
    ctx.strokeStyle = b.trailColor || '#fca5a5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(b.x - (b.vx / speed) * trailLen, b.y - (b.vy / speed) * trailLen);
    ctx.stroke();

    if (b.isVolleyball) {
      // Bouncing Tropical Beach Volleyball with pink, yellow, and white panels!
      const rBall = b.radius || 12;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(r.gameTime * 8);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, rBall, 0, Math.PI * 2);
      ctx.fill();

      // Pink & yellow curved volleyball stripes
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(0, 0, rBall, 0, Math.PI * 0.65);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(0, 0, rBall, Math.PI * 0.65, Math.PI * 1.35);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(0, 0, rBall, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      continue;
    }

    if (b.isStunDart) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (b.isHeartNeedle) {
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('♥', b.x - 5, b.y + 4);
    }
    ctx.restore();
  }

  ctx.restore();
}

/** Draws atmospheric and screen debuff effects */
export function drawDebuffOverlays(r: RenderContext) {
  const {
    ctx,
    canvasWidth,
    canvasHeight,
    cameraX,
    cameraY,
    player,
    debuffStats,
    yandereRef,
    cautionRibbons = [],
    whiteoutTimer = 0,
    gameTime,
  } = r;

  // 1. Caution Ribbon Trail
  if (cautionRibbons.length > 0) {
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    for (const cr of cautionRibbons) {
      ctx.globalAlpha = Math.min(1, cr.duration / 2);
      ctx.beginPath();
      ctx.arc(cr.x, cr.y, 14, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.setLineDash([]);
    ctx.restore();
  }

  // 2. Short-Range Red String of Destiny Tether (Only active when Yandere is within 260px!)
  const isRedStringActive = (debuffStats?.redTether || r.activeUpgrades?.includes('yandere_red_string')) && yandereRef;
  if (isRedStringActive && yandereRef) {
    const distToYandere = Math.hypot(player.x - yandereRef.x, player.y - yandereRef.y);
    if (distToYandere <= 260) {
      ctx.save();
      ctx.translate(-cameraX, -cameraY);
      const tensionAlpha = Math.max(0.25, 1 - distToYandere / 280);
      ctx.strokeStyle = `rgba(244, 63, 94, ${tensionAlpha})`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(player.x, player.y);
      const midX = (player.x + yandereRef.x) / 2 + Math.sin(gameTime * 4) * 22;
      const midY = (player.y + yandereRef.y) / 2 + Math.cos(gameTime * 4) * 22;
      ctx.quadraticCurveTo(midX, midY, yandereRef.x, yandereRef.y);
      ctx.stroke();

      // Floating little heart beads sliding along the thread
      for (let h = 0; h < 2; h++) {
        const t = ((gameTime * 0.45 + h / 2) % 1);
        const hx = (1 - t) * (1 - t) * player.x + 2 * (1 - t) * t * midX + t * t * yandereRef.x;
        const hy = (1 - t) * (1 - t) * player.y + 2 * (1 - t) * t * midY + t * t * yandereRef.y;
        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('♥', hx - 4, hy + 4);
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // 3. Searchlight Glare (Rotating sweeping high-intensity halogen searchlight)
  if (debuffStats?.searchlightGlare) {
    ctx.save();
    const beamAngle = gameTime * 1.4;
    const beamX = canvasWidth / 2 + Math.cos(beamAngle) * (canvasWidth * 0.4);
    const beamY = canvasHeight / 2 + Math.sin(beamAngle) * (canvasHeight * 0.4);
    const beamGrad = ctx.createRadialGradient(beamX, beamY, 20, beamX, beamY, 320);
    beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    beamGrad.addColorStop(0.5, 'rgba(254, 240, 138, 0.18)');
    beamGrad.addColorStop(1, 'rgba(15, 23, 42, 0.35)');
    ctx.fillStyle = beamGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 4. Candlelight Radius: Only 240px circular radius around player is illuminated
  if (debuffStats?.candlelightRadius) {
    ctx.save();
    const px = player.x - cameraX;
    const py = player.y - cameraY;
    const cr = debuffStats.candlelightRadius;
    const candleGrad = ctx.createRadialGradient(px, py, cr * 0.3, px, py, cr);
    candleGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    candleGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
    candleGrad.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
    ctx.fillStyle = candleGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 5. Love-Letter Confetti Flurry (Replaces broken Tunnel Vision debuff!)
  if (debuffStats?.loveLetterFlurry) {
    ctx.save();
    for (let l = 0; l < 10; l++) {
      const lx = ((l * 173 + gameTime * (32 + (l % 3) * 12)) % (canvasWidth + 80)) - 40;
      const ly = ((l * 137 + gameTime * (45 + (l % 4) * 10)) % (canvasHeight + 80)) - 40;
      const tilt = Math.sin(gameTime * 3 + l) * 0.35;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(tilt);
      ctx.fillStyle = 'rgba(253, 242, 248, 0.82)';
      ctx.strokeStyle = '#f472b6';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-11, -7, 22, 14, 2);
      ctx.fill();
      ctx.stroke();
      // Envelope flap
      ctx.beginPath();
      ctx.moveTo(-10, -6);
      ctx.lineTo(0, 1);
      ctx.lineTo(10, -6);
      ctx.stroke();
      // Tiny crimson heart wax seal
      ctx.fillStyle = '#e11d48';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', 0, 4);
      ctx.restore();
    }
    ctx.restore();
  }

  // 6. Curfew Contrast / Vignette Blur
  if (debuffStats?.curfewContrast || debuffStats?.vignetteBlur) {
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.25,
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.7
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, debuffStats?.curfewContrast ? 'rgba(0, 0, 0, 0.75)' : 'rgba(56, 189, 248, 0.35)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 7. Review Anxiety Pulse (Border pulses red when chaser is within 180px)
  if (debuffStats?.anxietyPulse) {
    const pulseStrength = 0.5 + Math.sin(gameTime * 9) * 0.5;
    ctx.save();
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 * pulseStrength})`;
    ctx.lineWidth = 18;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 8. Shadow Tentacles (Occult creeping shadow vines at screen corners)
  if (debuffStats?.shadowTentacles) {
    ctx.save();
    ctx.fillStyle = 'rgba(88, 28, 135, 0.45)';
    const tLen = 140 + Math.sin(gameTime * 3) * 20;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(tLen * 0.6, 20, tLen, 0);
    ctx.lineTo(0, tLen);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(canvasWidth, 0);
    ctx.quadraticCurveTo(canvasWidth - tLen * 0.6, 20, canvasWidth - tLen, 0);
    ctx.lineTo(canvasWidth, tLen);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 9. Gyaru Soft Pink Glamour Lens-Flare Bokeh Rings (Comfortable on eyes, obscures cursor area!)
  if (whiteoutTimer > 0) {
    ctx.save();
    const flareAlpha = Math.min(1, whiteoutTimer / 0.4);
    const px = player.x - cameraX;
    const py = player.y - cameraY;
    const aimDirX = Math.cos(player.angle);
    const aimDirY = Math.sin(player.angle);

    const bokehRings = [
      { dist: 95, r: 44, offset: -18, c1: 'rgba(244, 114, 182, 0.42)', c2: 'rgba(251, 207, 232, 0.55)' },
      { dist: 155, r: 68, offset: 14, c1: 'rgba(253, 224, 71, 0.34)', c2: 'rgba(244, 114, 182, 0.5)' },
      { dist: 220, r: 85, offset: -10, c1: 'rgba(236, 72, 153, 0.38)', c2: 'rgba(254, 240, 138, 0.48)' },
      { dist: 285, r: 56, offset: 22, c1: 'rgba(192, 132, 252, 0.35)', c2: 'rgba(244, 114, 182, 0.5)' },
      { dist: 340, r: 74, offset: -6, c1: 'rgba(244, 114, 182, 0.35)', c2: 'rgba(253, 224, 71, 0.45)' },
    ];

    ctx.globalAlpha = flareAlpha;
    for (let i = 0; i < bokehRings.length; i++) {
      const b = bokehRings[i];
      const perpX = -aimDirY;
      const perpY = aimDirX;
      const wobble = Math.sin(gameTime * 5 + i) * 10;
      const bx = px + aimDirX * b.dist + perpX * (b.offset + wobble);
      const by = py + aimDirY * b.dist + perpY * (b.offset + wobble);

      const bGrad = ctx.createRadialGradient(bx, by, b.r * 0.15, bx, by, b.r);
      bGrad.addColorStop(0, b.c1);
      bGrad.addColorStop(0.75, b.c2);
      bGrad.addColorStop(1, 'rgba(244, 114, 182, 0)');
      ctx.fillStyle = bGrad;
      ctx.beginPath();
      ctx.arc(bx, by, b.r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = b.c2;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(bx, by, b.r * 0.82, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 10. Burning Perimeter of Devotion (Crimson soul fire along arena walls)
  if (debuffStats?.perimeterFire) {
    ctx.save();
    ctx.translate(-cameraX, -cameraY);
    const pW = r.arenaWidth;
    const pH = r.arenaHeight;
    ctx.strokeStyle = 'rgba(225, 29, 72, 0.75)';
    ctx.lineWidth = 16;
    ctx.shadowColor = '#f43f5e';
    ctx.shadowBlur = 20;
    ctx.strokeRect(6, 6, pW - 12, pH - 12);
    ctx.shadowBlur = 0;

    // Flickering perimeter fire embers
    for (let f = 0; f < 32; f++) {
      const fT = (f * 140 + gameTime * 60) % (pW * 2 + pH * 2);
      let fx = 0, fy = 0;
      if (fT < pW) {
        fx = fT; fy = 8 + Math.sin(gameTime * 12 + f) * 5;
      } else if (fT < pW + pH) {
        fx = pW - 8 - Math.sin(gameTime * 12 + f) * 5; fy = fT - pW;
      } else if (fT < pW * 2 + pH) {
        fx = pW - (fT - (pW + pH)); fy = pH - 8 - Math.sin(gameTime * 12 + f) * 5;
      } else {
        fx = 8 + Math.sin(gameTime * 12 + f) * 5; fy = pH - (fT - (pW * 2 + pH));
      }
      ctx.fillStyle = f % 2 === 0 ? '#fda4af' : '#e11d48';
      ctx.beginPath();
      ctx.arc(fx, fy, 4 + Math.sin(gameTime * 10 + f) * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 11. Bat Rattle Concussion (Impact Blur chromatic flash)
  if (r.impactBlurTimer && r.impactBlurTimer > 0) {
    ctx.save();
    const blurAlpha = Math.min(0.45, r.impactBlurTimer * 1.3);
    ctx.fillStyle = `rgba(239, 68, 68, ${blurAlpha * 0.4})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.strokeStyle = `rgba(254, 240, 138, ${blurAlpha * 0.6})`;
    ctx.lineWidth = 12;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
  }

  // 12. Glitter Blindness (Floating shimmer particles across view)
  if (debuffStats?.glitterBurst) {
    ctx.save();
    for (let g = 0; g < 14; g++) {
      const gx = (g * 190 + gameTime * 45) % canvasWidth;
      const gy = (g * 120 + Math.sin(gameTime * 2 + g) * 60) % canvasHeight;
      ctx.fillStyle = g % 2 === 0 ? '#f472b6' : '#fde047';
      ctx.font = '12px sans-serif';
      ctx.fillText('✨', gx, gy);
    }
    ctx.restore();
  }
}

/** Draws particles */
export function drawParticles(r: RenderContext) {
  const { ctx, cameraX, cameraY, particles } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (const p of particles) {
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/**
 * Draws atmospheric drifting Fog/Mist + Woodland Fog-of-War sight shroud in the Forest environment
 */
export function drawForestFog(r: RenderContext) {
  if (r.mapEnv.id !== 'forest') return;
  const { ctx, cameraX, cameraY, canvasWidth, canvasHeight, player, arenaWidth, arenaHeight, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // 22 dense drifting volumetric ground mist banks across the forest floor
  for (let i = 0; i < 22; i++) {
    const mistSpeed = 22 + (i % 5) * 7;
    const mistX = ((i * 210 + gameTime * mistSpeed) % (arenaWidth + 500)) - 250;
    const mistY = 120 + ((i * 145) % (arenaHeight - 240)) + Math.sin(gameTime * 0.7 + i) * 45;
    const mistR = 175 + (i % 4) * 55;

    const mistGrad = ctx.createRadialGradient(mistX, mistY, 24, mistX, mistY, mistR);
    mistGrad.addColorStop(0, 'rgba(209, 250, 229, 0.24)');
    mistGrad.addColorStop(0.55, 'rgba(110, 231, 183, 0.12)');
    mistGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');

    ctx.fillStyle = mistGrad;
    ctx.beginPath();
    ctx.arc(mistX, mistY, mistR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();

  // Woodland Fog-of-War Sight Shroud centered on the player (limits far sight so you feel lost in deep woods)
  ctx.save();
  const px = player.x - cameraX;
  const py = player.y - cameraY;
  const breathe = Math.sin(gameTime * 1.6) * 14;
  const clearRadius = 215 + breathe * 0.4;
  const shroudRadius = 510 + breathe;

  const fogShroud = ctx.createRadialGradient(px, py, clearRadius, px, py, shroudRadius);
  fogShroud.addColorStop(0, 'rgba(6, 20, 14, 0)');
  fogShroud.addColorStop(0.45, 'rgba(8, 28, 19, 0.48)');
  fogShroud.addColorStop(0.8, 'rgba(6, 22, 15, 0.82)');
  fogShroud.addColorStop(1, 'rgba(4, 15, 10, 0.94)');

  ctx.fillStyle = fogShroud;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

/**
 * Draws the Haunted Mansion pitch darkness shroud cut out by the player's Mouse-Aimed Flashlight Beam,
 * plus glowing anime eyes for any pursuers lurking in the unlit shadows!
 */
export function drawMansionFlashlight(r: RenderContext) {
  if (r.mapEnv.id !== 'mansion') return;
  const { ctx, cameraX, cameraY, canvasWidth, canvasHeight, player, enemies, gameTime } = r;

  if (typeof document === 'undefined') return;
  if (!mansionDarknessCanvas) {
    mansionDarknessCanvas = document.createElement('canvas');
  }
  if (mansionDarknessCanvas.width !== canvasWidth || mansionDarknessCanvas.height !== canvasHeight) {
    mansionDarknessCanvas.width = canvasWidth;
    mansionDarknessCanvas.height = canvasHeight;
  }

  const dCtx = mansionDarknessCanvas.getContext('2d');
  if (!dCtx) return;

  const px = player.x - cameraX;
  const py = player.y - cameraY;
  const beamAngle = player.angle;
  const coneSpread = 0.56; // ~64 degrees total beam width
  const beamLength = 560;

  // 1. Fill offscreen buffer with deep Haunted Mansion darkness
  dCtx.globalCompositeOperation = 'source-over';
  dCtx.clearRect(0, 0, canvasWidth, canvasHeight);
  dCtx.fillStyle = 'rgba(4, 2, 12, 0.94)';
  dCtx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 2. Carve out soft close-range lantern halo around player + directional flashlight cone
  dCtx.globalCompositeOperation = 'destination-out';

  // Close-range personal halo (so you always see your anime character clearly)
  const haloGrad = dCtx.createRadialGradient(px, py, 28, px, py, 125);
  haloGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
  haloGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.75)');
  haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  dCtx.fillStyle = haloGrad;
  dCtx.beginPath();
  dCtx.arc(px, py, 125, 0, Math.PI * 2);
  dCtx.fill();

  // Mouse-aimed flashlight cone
  const coneGrad = dCtx.createRadialGradient(px, py, 20, px, py, beamLength);
  coneGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
  coneGrad.addColorStop(0.68, 'rgba(0, 0, 0, 0.92)');
  coneGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0.45)');
  coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  dCtx.fillStyle = coneGrad;
  dCtx.beginPath();
  dCtx.moveTo(px, py);
  dCtx.arc(px, py, beamLength, beamAngle - coneSpread, beamAngle + coneSpread);
  dCtx.closePath();
  dCtx.fill();

  dCtx.globalCompositeOperation = 'source-over';

  // 3. Composite the darkness shroud onto the main viewport
  ctx.save();
  ctx.drawImage(mansionDarknessCanvas, 0, 0);

  // Warm flashlight beam dust-mote illumination tint
  const warmBeam = ctx.createRadialGradient(px, py, 16, px, py, beamLength * 0.9);
  warmBeam.addColorStop(0, 'rgba(254, 249, 195, 0.14)');
  warmBeam.addColorStop(0.6, 'rgba(253, 224, 71, 0.06)');
  warmBeam.addColorStop(1, 'rgba(253, 224, 71, 0)');
  ctx.fillStyle = warmBeam;
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(px, py, beamLength * 0.9, beamAngle - coneSpread * 0.92, beamAngle + coneSpread * 0.92);
  ctx.closePath();
  ctx.fill();

  // 4. Draw Glowing Anime Eyes for Pursuers Lurking Outside the Flashlight Beam!
  ctx.translate(-cameraX, -cameraY);
  for (const e of enemies) {
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const dist = Math.hypot(dx, dy);
    const angleToEnemy = Math.atan2(dy, dx);
    const angleDiff = normalizeAngleDiff(angleToEnemy, beamAngle);

    const isLitByBeam = (dist <= beamLength * 0.85 && angleDiff <= coneSpread * 0.92) || dist <= 105;
    if (!isLitByBeam) {
      const eyeColor = GAME_TEXT.archetypes[e.archetype as ArchetypeKey]?.colorHex || '#f43f5e';
      const blink = Math.sin(gameTime * 4 + e.id * 1.7) > -0.88 ? 1 : 0.15;

      ctx.save();
      ctx.translate(e.x, e.y - 11);
      ctx.globalAlpha = 0.92 * blink;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 12;
      ctx.fillStyle = eyeColor;

      // Left & right glowing anime eyes in the dark
      ctx.beginPath();
      ctx.ellipse(-3.4, 0, 2.3, 1.6, -0.12, 0, Math.PI * 2);
      ctx.ellipse(3.4, 0, 2.3, 1.6, 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Bright white eye catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3.8, -0.4, 0.7, 0, Math.PI * 2);
      ctx.arc(3.0, -0.4, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  ctx.restore();
}

/** Draws dense, multi-layered woodland tree canopies that obscure line-of-sight */
export function drawTreeCanopies(r: RenderContext) {
  if (r.mapEnv.id !== 'forest') return;
  const { ctx, cameraX, cameraY, mapEnv, player, enemies, gameTime } = r;

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  for (let idx = 0; idx < mapEnv.trees.length; idx++) {
    const t = mapEnv.trees[idx];
    const distToPlayer = Math.hypot(player.x - t.x, player.y - t.y);
    const enemyUnder = enemies.some((e) => Math.hypot(e.x - t.x, e.y - t.y) < t.canopyRadius * 0.72);
    const isUnderCanopy = distToPlayer < t.canopyRadius * 0.82 || enemyUnder;

    ctx.save();
    // Gnarled ancient root buttresses & solid trunk
    ctx.fillStyle = '#290f02';
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.trunkRadius * 1.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(t.x, t.y, t.trunkRadius, 0, Math.PI * 2);
    ctx.fill();

    // Gently fade overhead foliage only when player or enemy is right beneath this tree
    ctx.globalAlpha = isUnderCanopy ? 0.42 : 0.97;

    const swayX = Math.sin(gameTime * 1.4 + idx) * 3.5;
    const swayY = Math.cos(gameTime * 1.2 + idx * 1.3) * 3.5;

    // Layer 1: Deep forest shadow skirt & scalloped outer boughs
    ctx.fillStyle = '#052e16';
    ctx.beginPath();
    ctx.arc(t.x + swayX * 0.5, t.y + swayY * 0.5 + 6, t.canopyRadius * 1.02, 0, Math.PI * 2);
    ctx.fill();

    const lobes = 7;
    for (let l = 0; l < lobes; l++) {
      const lAngle = (l * Math.PI * 2) / lobes + idx * 0.4;
      const lx = t.x + swayX + Math.cos(lAngle) * (t.canopyRadius * 0.58);
      const ly = t.y + swayY + Math.sin(lAngle) * (t.canopyRadius * 0.58);
      ctx.fillStyle = l % 2 === 0 ? '#064e3b' : '#14532d';
      ctx.beginPath();
      ctx.arc(lx, ly, t.canopyRadius * 0.48, 0, Math.PI * 2);
      ctx.fill();
    }

    // Layer 2: Rich mid-canopy emerald pine boughs
    const midGrad = ctx.createRadialGradient(
      t.x + swayX,
      t.y + swayY,
      t.canopyRadius * 0.15,
      t.x + swayX,
      t.y + swayY,
      t.canopyRadius * 0.78
    );
    midGrad.addColorStop(0, '#166534');
    midGrad.addColorStop(0.65, '#15803d');
    midGrad.addColorStop(1, '#14532d');
    ctx.fillStyle = midGrad;
    ctx.beginPath();
    ctx.arc(t.x + swayX, t.y + swayY, t.canopyRadius * 0.76, 0, Math.PI * 2);
    ctx.fill();

    // Layer 3: Sun-dappled mossy crown clusters
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(t.x - t.canopyRadius * 0.18 + swayX, t.y - t.canopyRadius * 0.18 + swayY, t.canopyRadius * 0.34, 0, Math.PI * 2);
    ctx.arc(t.x + t.canopyRadius * 0.2 + swayX, t.y - t.canopyRadius * 0.1 + swayY, t.canopyRadius * 0.28, 0, Math.PI * 2);
    ctx.arc(t.x + swayX, t.y + t.canopyRadius * 0.18 + swayY, t.canopyRadius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/** Draws the radar minimap */
export function drawMinimap(r: RenderContext) {
  const { ctx, player, enemies, pickups, arenaWidth, arenaHeight, canvasWidth, debuffStats, gameTime } = r;

  const mapSize = 110;
  const padding = 16;
  const mapX = canvasWidth - mapSize - padding;
  const mapY = padding;

  ctx.save();

  // Goth Radar Void: minimap swallowed by swirling purple occult void
  if (debuffStats?.radarVoid) {
    ctx.fillStyle = '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(mapX, mapY, mapSize, mapSize, 6);
    ctx.fill();
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(mapX + mapSize / 2, mapY + mapSize / 2);
    ctx.rotate(gameTime * 2);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 32, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#c084fc';
    ctx.font = 'bold 9px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RADAR VOID', mapX + mapSize / 2, mapY + mapSize / 2 + 3);
    ctx.restore();
    return;
  }

  ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(mapX, mapY, mapSize, mapSize, 6);
  ctx.fill();
  ctx.stroke();

  // Sheriff Radar Glitch: static lines
  if (debuffStats?.isRadarGlitched) {
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    for (let gy = mapY + 6; gy < mapY + mapSize; gy += 14) {
      ctx.beginPath();
      ctx.moveTo(mapX, gy + Math.sin(gameTime * 20 + gy) * 3);
      ctx.lineTo(mapX + mapSize, gy);
      ctx.stroke();
    }
  }

  const scaleX = mapSize / arenaWidth;
  const scaleY = mapSize / arenaHeight;

  // Pickups
  ctx.fillStyle = '#fbbf24';
  for (const p of pickups) {
    ctx.beginPath();
    ctx.arc(mapX + p.x * scaleX, mapY + p.y * scaleY, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Enemies (concealed if inside Delinquent smoke bomb cloud)
  const smokeClouds = r.puddles.filter((p) => p.type === 'smoke');
  for (const e of enemies) {
    const inSmoke = smokeClouds.some((sc) => Math.hypot(e.x - sc.x, e.y - sc.y) <= sc.radius);
    if (inSmoke) continue;
    ctx.fillStyle = GAME_TEXT.archetypes[e.archetype as ArchetypeKey]?.colorHex || '#f43f5e';
    ctx.beginPath();
    ctx.arc(mapX + e.x * scaleX, mapY + e.y * scaleY, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ghost blips for radar glitch
  if (debuffStats?.isRadarGlitched && Math.sin(gameTime * 5) > 0.3) {
    ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.beginPath();
    ctx.arc(mapX + 25 + Math.sin(gameTime) * 30, mapY + 30 + Math.cos(gameTime) * 20, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // NPC Femboys on minimap
  if (r.npcFemboys && r.npcFemboys.length > 0) {
    for (const npc of r.npcFemboys) {
      const isDistress = npc.aiMode === 'captured_struggle' || npc.aiMode === 'captured_dragged';
      ctx.fillStyle = isDistress ? '#fbbf24' : npc.isLoyalCompanion ? '#f472b6' : '#2dd4bf';
      ctx.beginPath();
      ctx.arc(mapX + npc.x * scaleX, mapY + npc.y * scaleY, isDistress ? 3.5 : 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Player
  ctx.fillStyle = '#38bdf8';
  ctx.shadowColor = '#38bdf8';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.arc(mapX + player.x * scaleX, mapY + player.y * scaleY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.restore();
}

/**
 * Draws the post-defeat Celebration & Drag-to-Spot Cutscene effects:
 * - Highlights the destination Capture Spot with a pulsing heart beacon
 * - Draws a pink silk grasp/tether between the winning pursuer and the struggling player
 * - Draws struggle kick lines, blush & floating hearts on the player
 * - Draws a large anime dialogue banner above the captor
 * - Draws a romantic closing heart vignette when arriving at the Capture Spot
 */
/**
 * Draws the post-defeat Celebration & Drag-to-Spot Cutscene world-space effects,
 * OR the 3.5-second on-the-spot Shiny Heart & "plap" Session animation!
 * (Must be called inside the zoomed world-camera transform so it stays 100% locked onto the captor & player!)
 */
export function drawCaptureCutsceneOverlay(r: RenderContext) {
  const sc = r.shinyCapture;
  if (sc && sc.active) {
    const { ctx, cameraX, cameraY, player, gameTime } = r;
    const catcher = sc.catcher;
    const archInfo = GAME_TEXT.archetypes[catcher.archetype as ArchetypeKey];
    const themeColor = archInfo?.colorHex || '#f43f5e';

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // 1. On-The-Spot Golden-Pink Heart Sanctuary Ring right where she caught you!
    const pulseR = 44 + Math.sin(gameTime * 9) * 7;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 5]);
    ctx.beginPath();
    ctx.arc(player.x, player.y, pulseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 11.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    const remSec = Math.max(0, (sc.duration || 3.5) - sc.timer).toFixed(1);
    ctx.fillText(`★ SHINY ON-THE-SPOT SESSION (${remSec}s) ★`, player.x, player.y - pulseR - 10);

    // 2. Orbiting Hearts & Rhythmic "plap" Bounces around the Shiny Pursuer & Player
    for (let h = 0; h < 6; h++) {
      const hAngle = gameTime * 3.4 + (h * Math.PI) / 3;
      const hx = player.x + Math.cos(hAngle) * 30;
      const hy = player.y - 16 + Math.sin(hAngle * 1.5) * 14;
      const isPlapToken = h % 2 === 1;
      if (isPlapToken) {
        const bounceScale = 1 + Math.abs(Math.sin(gameTime * 9.5 + h)) * 0.3;
        ctx.save();
        ctx.translate(hx, hy - Math.abs(Math.sin(gameTime * 8.5 + h)) * 10);
        ctx.rotate(Math.sin(gameTime * 5 + h) * 0.18);
        ctx.scale(bounceScale, bounceScale);
        ctx.font = '900 11.5px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        const label = h % 4 === 1 ? 'PLAP ♥' : 'plap';
        ctx.strokeText(label, 0, 0);
        ctx.fillStyle = h % 4 === 1 ? '#fde047' : '#f472b6';
        ctx.fillText(label, 0, 0);
        ctx.restore();
      } else {
        ctx.fillStyle = h % 2 === 0 ? '#fde047' : '#fda4af';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(h % 3 === 0 ? '💖' : '♥', hx, hy);
      }
    }

    // 3. Parabolic "plap" + Heart Fountain rising right from the on-the-spot capture location!
    const burstItems = ['plap', '♥', 'PLAP', '💖', 'plap~', '♡', 'PLAP!', '💕'];
    for (let bIdx = 0; bIdx < burstItems.length; bIdx++) {
      const cycle = (gameTime * 2.5 + bIdx * 0.37) % 1.0;
      const spreadX = Math.sin(bIdx * 2.1 + Math.floor(gameTime * 2.5 + bIdx * 0.37)) * 46;
      const arcY = -Math.sin(cycle * Math.PI) * 54 - cycle * 18;
      const bx = player.x + spreadX * cycle;
      const by = player.y - 8 + arcY;
      const alpha = Math.sin(cycle * Math.PI);
      const token = burstItems[bIdx];
      const isWord = token.toLowerCase().includes('plap');

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 1.15));
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(cycle * Math.PI * 2 + bIdx) * 0.22);
      const popScale = isWord ? 0.95 + Math.sin(cycle * Math.PI) * 0.35 : 0.9 + Math.sin(cycle * Math.PI) * 0.25;
      ctx.scale(popScale, popScale);
      ctx.textAlign = 'center';
      if (isWord) {
        ctx.font = '900 13px "Outfit", sans-serif';
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.lineWidth = 3.2;
        ctx.strokeText(token, 0, 0);
        ctx.fillStyle = bIdx % 4 === 0 ? '#fde047' : '#f43f5e';
        ctx.fillText(token, 0, 0);
      } else {
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fb7185';
        ctx.fillText(token, 0, 0);
      }
      ctx.restore();
    }

    // 4. Golden Expressive Speech Bubble above the Shiny Pursuer
    if (sc.quote) {
      const bounceY = Math.sin(gameTime * 9) * 3;
      ctx.font = 'bold 12px "Outfit", sans-serif';
      const textW = ctx.measureText(sc.quote).width;
      const padX = 16;
      const boxW = Math.max(185, textW + padX * 2);
      const boxH = 32;
      const bx = catcher.x - boxW / 2;
      const by = catcher.y - 74 + bounceY;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#fde047';
      ctx.lineWidth = 2.2;
      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 9);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.moveTo(catcher.x - 6, by + boxH);
      ctx.lineTo(catcher.x, by + boxH + 7);
      ctx.lineTo(catcher.x + 6, by + boxH);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fde047';
      ctx.font = '800 9.5px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        `★ SHINY ${archInfo?.name?.toUpperCase() || 'PURSUER'} — ON-THE-SPOT CATCH (-3 HP!) ★`,
        catcher.x,
        by - 6
      );

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(sc.quote, catcher.x, by + boxH / 2);
    }

    ctx.restore();
    return;
  }

  const cs = r.captureCutscene;
  if (!cs || !cs.active) return;

  const { ctx, cameraX, cameraY, player, mapEnv, gameTime } = r;
  const catcher = cs.catcher;
  const spot = mapEnv.captureSpot;
  const archInfo = GAME_TEXT.archetypes[catcher.archetype as ArchetypeKey];
  const themeColor = archInfo?.colorHex || '#f43f5e';

  ctx.save();
  ctx.translate(-cameraX, -cameraY);

  // 1. Pulsing Heart Destination Beacon on the Stage's Capture Spot during Drag phase
  if (cs.phase === 'drag' || cs.phase === 'arrive') {
    const pulseR = 46 + Math.sin(gameTime * 8) * 8;
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.arc(spot.x, spot.y, pulseR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fda4af';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`♥ ${spot.label.toUpperCase()} ♥`, spot.x, spot.y - pulseR - 10);
  }

  // 2. Pink Silk Grasp / Collar Hold between Captor and Player + Struggle Lines
  if (cs.phase === 'drag' || cs.phase === 'arrive') {
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 3.5;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(catcher.x, catcher.y - 2);
    ctx.lineTo(player.x, player.y - 4);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cute struggle motion lines & sweat drops around the dragged player
    const resLevel = cs.struggleResistance || 0;
    const struggleKick = Math.sin(gameTime * (24 + resLevel * 18)) * (6 + resLevel * 5);
    ctx.strokeStyle = resLevel > 0.15 ? '#fde047' : '#fda4af';
    ctx.lineWidth = 2 + resLevel * 1.2;
    ctx.beginPath();
    ctx.arc(player.x - 16, player.y + struggleKick, 6 + resLevel * 3, 0.5, 2.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(player.x + 16, player.y - struggleKick, 6 + resLevel * 3, -0.5, 1.5);
    ctx.stroke();

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 11px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    const struggleWords =
      resLevel > 0.2
        ? ['Pulling back~!', 'Nooo wait~!', 'Too strong~!', 'Trying to break free~!']
        : ['Eep~!', 'Let go~!', 'W-Wait~!', 'Kyaa~!'];
    const wordIdx = Math.floor(gameTime * 2.4) % struggleWords.length;
    ctx.fillText(struggleWords[wordIdx], player.x, player.y + 32);

    // Interactive Futile Struggle Gauge below the player during Drag phase
    if (cs.phase === 'drag') {
      const barW = 104;
      const barH = 6;
      const bx = player.x - barW / 2;
      const by = player.y + 40;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(bx, by, barW, barH, 3);
      ctx.fill();
      ctx.stroke();

      const fillRatio = Math.min(1, Math.max(0.08, resLevel));
      ctx.fillStyle = resLevel > 0.4 ? '#fde047' : '#f472b6';
      ctx.beginPath();
      ctx.roundRect(bx + 1, by + 1, (barW - 2) * fillRatio, barH - 2, 2);
      ctx.fill();

      ctx.fillStyle = '#fbcfe8';
      ctx.font = '800 8.5px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('FUTILE STRUGGLE [PULL WASD / TAP SPACE]', player.x, by + 15);
    }
  } else {
    // Celebration phase: dizzy stars & blush over player
    for (let st = 0; st < 3; st++) {
      const a = gameTime * 5 + (st * Math.PI * 2) / 3;
      const sx = player.x + Math.cos(a) * 15;
      const sy = player.y - 26 + Math.sin(a) * 5;
      ctx.fillStyle = '#fde047';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★', sx, sy);
    }
  }

  // 3. Celebratory Floating Hearts & Rhythmic "plap" Bounces around the Game Over Capture Spot
  for (let h = 0; h < 6; h++) {
    const hAngle = gameTime * 3.2 + (h * Math.PI) / 3;
    const hx = catcher.x + Math.cos(hAngle) * 28;
    const hy = catcher.y - 18 + Math.sin(hAngle * 1.5) * 13;
    const isPlapToken = cs.phase === 'arrive' && h % 2 === 1;
    if (isPlapToken) {
      const bounceScale = 1 + Math.abs(Math.sin(gameTime * 9 + h)) * 0.28;
      ctx.save();
      ctx.translate(hx, hy - Math.abs(Math.sin(gameTime * 8 + h)) * 10);
      ctx.rotate(Math.sin(gameTime * 5 + h) * 0.18);
      ctx.scale(bounceScale, bounceScale);
      ctx.font = '900 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      const label = h % 4 === 1 ? 'PLAP ♥' : 'plap';
      ctx.strokeText(label, 0, 0);
      ctx.fillStyle = h % 4 === 1 ? '#fda4af' : '#f472b6';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    } else {
      ctx.fillStyle = h % 2 === 0 ? themeColor : '#fda4af';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(h % 3 === 0 ? '💖' : '♥', hx, hy);
    }
  }

  // Extra Bouncing "plap" + Heart Fountain rising off the bed/capture zone during 'arrive' phase!
  if (cs.phase === 'arrive') {
    const burstItems = ['plap', '♥', 'PLAP', '💖', 'plap~', '♡', 'PLAP!', '💕'];
    for (let bIdx = 0; bIdx < burstItems.length; bIdx++) {
      const cycle = (gameTime * 2.4 + bIdx * 0.37) % 1.0;
      const spreadX = Math.sin(bIdx * 2.1 + Math.floor(gameTime * 2.4 + bIdx * 0.37)) * 48;
      // Parabolic arc bounce off the capture spot bed
      const arcY = -Math.sin(cycle * Math.PI) * 56 - cycle * 18;
      const bx = spot.x + spreadX * cycle;
      const by = spot.y - 8 + arcY;
      const alpha = Math.sin(cycle * Math.PI);
      const token = burstItems[bIdx];
      const isWord = token.toLowerCase().includes('plap');

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha * 1.15));
      ctx.translate(bx, by);
      ctx.rotate(Math.sin(cycle * Math.PI * 2 + bIdx) * 0.22);
      const popScale = isWord ? 0.95 + Math.sin(cycle * Math.PI) * 0.35 : 0.9 + Math.sin(cycle * Math.PI) * 0.25;
      ctx.scale(popScale, popScale);
      ctx.textAlign = 'center';
      if (isWord) {
        ctx.font = '900 13px "Outfit", sans-serif';
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.lineWidth = 3.2;
        ctx.strokeText(token, 0, 0);
        ctx.fillStyle = bIdx % 4 === 0 ? '#fda4af' : '#f43f5e';
        ctx.fillText(token, 0, 0);
      } else {
        ctx.font = 'bold 15px sans-serif';
        ctx.fillStyle = '#fb7185';
        ctx.fillText(token, 0, 0);
      }
      ctx.restore();
    }
  }

  // 4. Large Expressive Anime Speech Bubble above the Winning Pursuer
  if (cs.quote && cs.phase !== 'finished') {
    const bounceY = Math.sin(gameTime * 9) * 3;
    ctx.font = 'bold 12px "Outfit", sans-serif';
    const textW = ctx.measureText(cs.quote).width;
    const padX = 16;
    const boxW = Math.max(170, textW + padX * 2);
    const boxH = 32;
    const bx = catcher.x - boxW / 2;
    const by = catcher.y - 72 + bounceY;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = themeColor;
    ctx.lineWidth = 2.2;
    ctx.shadowColor = themeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(bx, by, boxW, boxH, 9);
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Speech pointer triangle
    ctx.fillStyle = themeColor;
    ctx.beginPath();
    ctx.moveTo(catcher.x - 6, by + boxH);
    ctx.lineTo(catcher.x, by + boxH + 7);
    ctx.lineTo(catcher.x + 6, by + boxH);
    ctx.closePath();
    ctx.fill();

    // Archetype name badge
    ctx.fillStyle = themeColor;
    ctx.font = '800 9.5px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${archInfo?.name?.toUpperCase() || 'PURSUER'} — ${cs.phase === 'celebrate' ? 'CAPTURED!' : `DRAGGING TO ${spot.label.toUpperCase()}`}`,
      catcher.x,
      by - 6
    );

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px "Outfit", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillText(cs.quote, catcher.x, by + boxH / 2);
  }

  ctx.restore();
}

/**
 * Draws the screen-space romantic pink vignette & closing heart iris during the defeat cutscene
 * OR the Shiny On-The-Spot Session vignette (plus Goth Raven's jumpscare flash!)
 */
export function drawCaptureCutsceneVignette(r: RenderContext) {
  const sc = r.shinyCapture;
  if (sc && sc.active) {
    const { ctx, canvasWidth, canvasHeight } = r;
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.22,
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.72
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(0.65, 'rgba(190, 24, 93, 0.36)');
    vigGrad.addColorStop(1, 'rgba(88, 28, 135, 0.68)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();
    return;
  }

  const cs = r.captureCutscene;
  if (!cs || !cs.active) return;
  const { ctx, canvasWidth, canvasHeight } = r;

  ctx.save();
  // Adjusted for extended 3.7s arrive duration so iris stays clear during the extra 2 seconds of heart/plap animation!
  const irisProgress = cs.phase === 'arrive' ? Math.max(0, (cs.timer - 2.2) / 1.5) : 0;
  const vigGrad = ctx.createRadialGradient(
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth * (cs.phase === 'arrive' ? Math.max(0.04, 0.34 - irisProgress * 0.3) : 0.32),
    canvasWidth / 2,
    canvasHeight / 2,
    canvasWidth * 0.72
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(0.7, 'rgba(136, 19, 55, 0.42)');
  vigGrad.addColorStop(1, cs.phase === 'arrive' ? 'rgba(15, 23, 42, 0.96)' : 'rgba(76, 5, 25, 0.72)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();
}

/**
 * Standalone high-DPI live Enemy Model Preview renderer for the Compendium Manual.
 * Renders any Pursuer Archetype (including Trainer Maya & her companion dog Rex, and Hacker Natsuki)
 * with customizable Standard, Shiny Golden Elite, Immortal Haunting Victor, and Action states.
 */
export function drawEnemyModelPreview(
  ctx: CanvasRenderingContext2D,
  archetype: EnemyState['archetype'],
  width: number,
  height: number,
  gameTime: number,
  options?: {
    isShiny?: boolean;
    isHauntingWinner?: boolean;
    isActionPose?: boolean;
    zoom?: number;
  }
) {
  ctx.clearRect(0, 0, width, height);

  const archInfo = GAME_TEXT.archetypes[archetype as ArchetypeKey];
  const themeColor = archInfo?.colorHex || '#f43f5e';
  const zoom = options?.zoom ?? 2.35;
  const isAction = Boolean(options?.isActionPose);

  // Subtle radial stage spotlight backdrop
  const bgGrad = ctx.createRadialGradient(width / 2, height * 0.54, 10, width / 2, height * 0.54, width * 0.52);
  bgGrad.addColorStop(0, `${themeColor}30`);
  bgGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.4)');
  bgGrad.addColorStop(1, 'rgba(9, 9, 11, 0)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Tactical holo floor platform ring
  ctx.save();
  ctx.translate(width / 2, height * 0.72);
  ctx.strokeStyle = `${themeColor}66`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(0, 0, 46, 15, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = `${themeColor}33`;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.ellipse(0, 0, 58, 20, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  const centerX = archetype === 'trainer' ? width * 0.42 : width * 0.5;
  const centerY = height * 0.58;

  const mockEnemy: EnemyState = {
    id: 7,
    archetype,
    x: centerX,
    y: centerY,
    vx: 0,
    vy: 0,
    radius: 18,
    hp: 100,
    maxHp: 100,
    baseSpeed: 140,
    speedMultiplier: 1,
    angle: Math.sin(gameTime * 1.6) * 0.35,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 1,
    isShiny: Boolean(options?.isShiny),
    isHauntingWinner: Boolean(options?.isHauntingWinner),
    isAlerted: isAction,
    isSirenActive: isAction && archetype === 'officer',
    isDashing: isAction,
    dogLungeTimer: isAction && archetype === 'trainer' ? 0.5 : 0,
    batAngle: gameTime * 3.5,
    hackingTimer: isAction && archetype === 'hacker' ? 1.1 : 0,
    stompWaveTimer: isAction && archetype === 'hacker' ? 1.5 : 0,
    stompWaveRadius: isAction && archetype === 'hacker' ? 24 + ((gameTime * 45) % 40) : 0,
    teleportTargetX: isAction && archetype === 'goth' ? centerX + 42 : undefined,
    teleportTargetY: isAction && archetype === 'goth' ? centerY + 10 : undefined,
    teleportTelegraphTimer: isAction && archetype === 'goth' ? 0.35 : undefined,
  };

  const mockContext: RenderContext = {
    ctx,
    canvasWidth: width,
    canvasHeight: height,
    arenaWidth: width,
    arenaHeight: height,
    cameraX: 0,
    cameraY: 0,
    mapEnv: {
      id: 'forest',
      width,
      height,
      walls: [],
      bushes: [],
      trees: [],
      breachPoints: [],
      carLanes: [],
      captureSpot: { x: centerX, y: centerY, label: 'Preview Stage' },
    },
    player: {
      x: centerX,
      y: centerY + 100,
      vx: 0,
      vy: 0,
      speed: 290,
      radius: 17,
      hp: 5,
      maxHp: 5,
      invincibleTimer: 0,
      angle: 0,
      activeWeaponKey: 'pistol',
      ammo: -1,
      fireCooldown: 0,
      activeDebuffs: [],
    },
    enemies: [mockEnemy],
    bullets: [],
    enemyBullets: [],
    pickups: [],
    medkits: [],
    hearts: [],
    puddles: [],
    cars: [],
    civilians: [],
    particles: [],
    gameTime,
    activeUpgrades: isAction ? ['goth_sorrow_aura', 'hacker_platform_stomp', 'trainer_agility_command'] : [],
  };

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.scale(zoom, zoom);
  ctx.translate(-centerX, -centerY);
  drawEnemies(mockContext);
  ctx.restore();
}


