/**
 * Pure game rules, math, entity updates, map obstacles, smart pathing, and debuffs.
 * Decoupled from React and DOM for 60fps performance and automated unit testing.
 */

import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';

export interface Vector2 {
  x: number;
  y: number;
}

export type MapType = 'forest' | 'home' | 'city';

export interface WeaponDef {
  id: string;
  name: string;
  shortName: string;
  fireInterval: number;
  bulletSpeed: number;
  damage: number;
  maxAmmo: number; // -1 for infinite
  pelletCount: number;
  spreadAngle: number;
  knockback: number;
  bulletRadius: number;
  color: string;
  trailColor: string;
  isExplosive?: boolean;
  explosionRadius?: number;
}

export const WEAPON_DEFS: Record<string, WeaponDef> = {
  pistol: {
    id: 'pistol',
    name: 'Pea Blaster',
    shortName: 'PISTOL',
    fireInterval: 0.22,
    bulletSpeed: 750,
    damage: 16,
    maxAmmo: -1,
    pelletCount: 1,
    spreadAngle: 0.05,
    knockback: 180,
    bulletRadius: 6,
    color: '#38bdf8',
    trailColor: '#7dd3fc',
  },
  shotgun: {
    id: 'shotgun',
    name: 'Heartbreaker Scattergun',
    shortName: 'SHOTGUN',
    fireInterval: 0.65,
    bulletSpeed: 680,
    damage: 14,
    maxAmmo: 25,
    pelletCount: 5,
    spreadAngle: 0.42,
    knockback: 340,
    bulletRadius: 7,
    color: '#fb7185',
    trailColor: '#fda4af',
  },
  smg: {
    id: 'smg',
    name: 'Bubble Sprayer',
    shortName: 'BUBBLE SMG',
    fireInterval: 0.09,
    bulletSpeed: 820,
    damage: 9,
    maxAmmo: 120,
    pelletCount: 1,
    spreadAngle: 0.16,
    knockback: 110,
    bulletRadius: 5,
    color: '#a7f3d0',
    trailColor: '#6ee7b7',
  },
  laser: {
    id: 'laser',
    name: 'Neon Prism Beam',
    shortName: 'LASER',
    fireInterval: 0.32,
    bulletSpeed: 1100,
    damage: 28,
    maxAmmo: 30,
    pelletCount: 1,
    spreadAngle: 0.02,
    knockback: 220,
    bulletRadius: 8,
    color: '#c084fc',
    trailColor: '#e879f9',
  },
  launcher: {
    id: 'launcher',
    name: 'Confetti Cannon',
    shortName: 'CANNON',
    fireInterval: 0.85,
    bulletSpeed: 520,
    damage: 45,
    maxAmmo: 15,
    pelletCount: 1,
    spreadAngle: 0.04,
    knockback: 450,
    bulletRadius: 10,
    color: '#facc15',
    trailColor: '#fde047',
    isExplosive: true,
    explosionRadius: 110,
  },
  dual: {
    id: 'dual',
    name: 'Twin Pop-Guns',
    shortName: 'DUAL',
    fireInterval: 0.14,
    bulletSpeed: 780,
    damage: 12,
    maxAmmo: 80,
    pelletCount: 2,
    spreadAngle: 0.18,
    knockback: 160,
    bulletRadius: 6,
    color: '#f472b6',
    trailColor: '#fbcfe8',
  },
};

export type ArchetypeId =
  | 'sheriff'
  | 'officer'
  | 'delinquent'
  | 'tomboy'
  | 'goth'
  | 'gyaru'
  | 'senpai'
  | 'yandere';

export interface ActiveDebuff {
  id: string;
  name: string;
  archetype: ArchetypeId;
  description: string;
  effectType: string;
  effectValue: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  hp: number;
  maxHp: number;
  invincibleTimer: number;
  angle: number;
  activeWeaponKey: string;
  ammo: number;
  fireCooldown: number;
  activeDebuffs: ActiveDebuff[];
}

export interface EnemyState {
  id: number;
  archetype: ArchetypeId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  baseSpeed: number;
  speedMultiplier: number;
  angle: number;
  knockbackVx: number;
  knockbackVy: number;
  hitFlashTimer: number;
  speechText: string;
  speechTimer: number;
  specialTimer: number;
  isDashing?: boolean;
  isSirenActive?: boolean;
  isKiting?: boolean;
  isCheered?: boolean;
  sightTimer?: number;
  batAngle?: number;
  isShiny?: boolean;
  shinyAttackTimer?: number;
  shinySpecial?: string;
  deflectSparkTimer?: number;
  isSpottedInCone?: boolean;

  // Sheriff stage cop quota
  copsSummoned?: number;
  stageQuota?: number;

  // Officer patrol & line of sight
  isAlerted?: boolean;
  patrolAngle?: number;
  patrolTimer?: number;

  // Barricade assault state
  attackingBreachId?: string;
  attackCooldown?: number;
}

export interface HeartPickup {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bobTimer: number;
  value: number; // EXP value
  color: string;
  scale: number;
}

export interface EnemyUpgrade {
  id: string;
  archetype: ArchetypeId;
  title: string;
  desireNote: string;
  effectDescription: string;
  statModifierKey: string;
  icon?: string;
}

export interface BulletState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  knockback: number;
  color: string;
  trailColor: string;
  lifetime: number;
  maxLifetime: number;
  isExplosive?: boolean;
  explosionRadius?: number;
}

export interface WeaponPickupState {
  id: number;
  weaponKey: string;
  x: number;
  y: number;
  radius: number;
  bobTimer: number;
}

export interface HazardPuddle {
  id: number;
  x: number;
  y: number;
  radius: number;
  duration: number;
  type?: 'coffee' | 'caution';
}

export interface WallRect {
  x: number;
  y: number;
  w: number;
  h: number;
  label?: string;
  furnitureType?:
    | 'sofa'
    | 'counter'
    | 'island'
    | 'table'
    | 'bed'
    | 'tub'
    | 'vanity'
    | 'tv'
    | 'fridge'
    | 'toilet'
    | 'wardrobe'
    | 'wall';
}

export interface BushCircle {
  x: number;
  y: number;
  radius: number;
}

export interface TreeCanopy {
  x: number;
  y: number;
  trunkRadius: number;
  canopyRadius: number;
}

export interface MovingCar {
  id: number;
  x: number;
  y: number;
  vx: number;
  w: number;
  h: number;
  color: string;
}

export interface Civilian {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  color: string;
  isPanicked: boolean;
  panicTimer: number;
  archetypeLook?: ArchetypeId;
  wanderTimer: number;
  pauseTimer: number;
  facingAngle?: number;
}

export interface BreachPoint {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  isWindow?: boolean;
  isDoor?: boolean;
  isBarricaded?: boolean;
  barricadeHp?: number;
  maxBarricadeHp?: number;
  breached?: boolean;
}

export interface ForestMistCloud {
  id: number;
  x: number;
  y: number;
  vx: number;
  radius: number;
  opacity: number;
}

export interface MapEnvironment {
  id: MapType;
  width: number;
  height: number;
  walls: WallRect[];
  bushes: BushCircle[];
  trees: TreeCanopy[];
  breachPoints: BreachPoint[];
  carLanes: { y: number; dir: 1 | -1; speed: number }[];
  doorways?: { x: number; y: number }[];
}

export interface FlyingSunsetParticle {
  id: number;
  type: 'word' | 'heart';
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  scale: number;
  opacity: number;
  color: string;
  fontSize: number;
}

/** Formats survival seconds into mm:ss.ms */
export function formatTime(seconds: number): string {
  const safeSec = Math.max(0, seconds);
  const mins = Math.floor(safeSec / 60);
  const secs = Math.floor(safeSec % 60);
  const hundredths = Math.floor(Math.round((safeSec - Math.floor(safeSec)) * 100)) % 100;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${hundredths.toString().padStart(2, '0')}`;
}

export function distanceSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

export function checkCircleOverlap(
  x1: number,
  y1: number,
  r1: number,
  x2: number,
  y2: number,
  r2: number
): boolean {
  const totalR = r1 + r2;
  return distanceSq(x1, y1, x2, y2) <= totalR * totalR;
}

export function checkCircleBoxOverlap(
  cx: number,
  cy: number,
  cr: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  const closestX = Math.max(bx, Math.min(cx, bx + bw));
  const closestY = Math.max(by, Math.min(cy, by + bh));
  return distanceSq(cx, cy, closestX, closestY) <= cr * cr;
}

export function resolveCircleBoxCollision(
  cx: number,
  cy: number,
  cr: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): { x: number; y: number; collided: boolean } {
  const closestX = Math.max(bx, Math.min(cx, bx + bw));
  const closestY = Math.max(by, Math.min(cy, by + bh));
  const dSq = distanceSq(cx, cy, closestX, closestY);

  if (dSq <= cr * cr && dSq > 0.0001) {
    const dist = Math.sqrt(dSq);
    const overlap = cr - dist;
    const nx = (cx - closestX) / dist;
    const ny = (cy - closestY) / dist;
    return {
      x: cx + nx * overlap,
      y: cy + ny * overlap,
      collided: true,
    };
  } else if (dSq <= 0.0001) {
    const dLeft = cx - bx;
    const dRight = bx + bw - cx;
    const dTop = cy - by;
    const dBottom = by + bh - cy;
    const minD = Math.min(dLeft, dRight, dTop, dBottom);
    if (minD === dLeft) return { x: bx - cr, y: cy, collided: true };
    if (minD === dRight) return { x: bx + bw + cr, y: cy, collided: true };
    if (minD === dTop) return { x: cx, y: by - cr, collided: true };
    return { x: cx, y: by + bh + cr, collided: true };
  }
  return { x: cx, y: cy, collided: false };
}

/** Check if a line segment between (x1,y1) and (x2,y2) intersects an AABB box */
export function lineIntersectsBox(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bx: number,
  by: number,
  bw: number,
  bh: number
): boolean {
  // Liang-Barsky / parametric line clipping test
  let t0 = 0.0;
  let t1 = 1.0;
  const dx = x2 - x1;
  const dy = y2 - y1;

  const p = [-dx, dx, -dy, dy];
  const q = [x1 - bx, bx + bw - x1, y1 - by, by + bh - y1];

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) return false;
    } else {
      const r = q[i] / p[i];
      if (p[i] < 0) {
        if (r > t1) return false;
        if (r > t0) t0 = r;
      } else {
        if (r < t0) return false;
        if (r < t1) t1 = r;
      }
    }
  }
  return t0 <= t1;
}

/** Map Builder for the 3 distinct environments */
export function createMapEnvironment(type: MapType): MapEnvironment {
  switch (type) {
    case 'home': {
      const width = 1900;
      const height = 1450;

      // Realistic architectural layout with 4 distinct rooms & central hallway
      // Segmented Exterior Walls with true physical openings for Doors & Windows!
      const walls: WallRect[] = [
        // North Wall: Door opening at x: 1420-1530
        { x: 80, y: 80, w: 1340, h: 28, label: 'North Exterior Wall Left', furnitureType: 'wall' },
        { x: 1530, y: 80, w: 290, h: 28, label: 'North Exterior Wall Right', furnitureType: 'wall' },

        // South Wall: Door opening at x: 860-950
        { x: 80, y: 1342, w: 780, h: 28, label: 'South Exterior Wall Left', furnitureType: 'wall' },
        { x: 950, y: 1342, w: 870, h: 28, label: 'South Exterior Wall Right', furnitureType: 'wall' },

        // West Wall: Window openings at y: 330-420 and y: 970-1040
        { x: 80, y: 80, w: 28, h: 250, label: 'West Exterior Wall Top', furnitureType: 'wall' },
        { x: 80, y: 420, w: 28, h: 550, label: 'West Exterior Wall Mid', furnitureType: 'wall' },
        { x: 80, y: 1040, w: 28, h: 330, label: 'West Exterior Wall Bottom', furnitureType: 'wall' },

        // East Wall: Window openings at y: 390-490 and y: 1050-1150
        { x: 1792, y: 80, w: 28, h: 310, label: 'East Exterior Wall Top', furnitureType: 'wall' },
        { x: 1792, y: 490, w: 28, h: 560, label: 'East Exterior Wall Mid', furnitureType: 'wall' },
        { x: 1792, y: 1150, w: 28, h: 220, label: 'East Exterior Wall Bottom', furnitureType: 'wall' },

        // --- Interior Partition Walls with Open Doorways ---
        // North-South partition separating Kitchen (West) from Living Room (East) (doorway at y: 380-500)
        { x: 740, y: 108, w: 24, h: 280, label: 'Kitchen Partition North', furnitureType: 'wall' },
        { x: 740, y: 510, w: 24, h: 230, label: 'Kitchen Partition South', furnitureType: 'wall' },

        // East-West central hallway partition (doorway at x: 740-920)
        { x: 108, y: 740, w: 420, h: 24, label: 'Bathroom Divider Wall', furnitureType: 'wall' },
        { x: 640, y: 740, w: 280, h: 24, label: 'Foyer Divider Wall', furnitureType: 'wall' },
        { x: 1080, y: 740, w: 712, h: 24, label: 'Bedroom Divider Wall', furnitureType: 'wall' },

        // Bedroom-Hallway partition (doorway at y: 860-980)
        { x: 1080, y: 764, w: 24, h: 120, label: 'Bedroom Partition North', furnitureType: 'wall' },
        { x: 1080, y: 990, w: 24, h: 352, label: 'Bedroom Partition South', furnitureType: 'wall' },

        // Bathroom-Hallway partition (doorway at y: 880-1000)
        { x: 640, y: 764, w: 24, h: 140, label: 'Bathroom Partition North', furnitureType: 'wall' },
        { x: 640, y: 1010, w: 24, h: 332, label: 'Bathroom Partition South', furnitureType: 'wall' },

        // --- FURNITURE OBSTACLES (Physical barriers for player & enemies) ---
        // 1. LIVING ROOM FURNITURE (North-East Room)
        { x: 1020, y: 290, w: 240, h: 80, label: 'Plush Sectional Sofa', furnitureType: 'sofa' },
        { x: 1180, y: 370, w: 80, h: 110, label: 'Sofa Chaise Extension', furnitureType: 'sofa' },
        { x: 1040, y: 410, w: 120, h: 55, label: 'Hardwood Coffee Table', furnitureType: 'table' },
        { x: 1050, y: 118, w: 220, h: 42, label: 'OLED TV Media Console', furnitureType: 'tv' },

        // 2. KITCHEN & DINING FURNITURE (North-West Room)
        { x: 118, y: 118, w: 260, h: 55, label: 'Kitchen Counter & Sink', furnitureType: 'counter' },
        { x: 388, y: 118, w: 65, h: 65, label: 'French-Door Refrigerator', furnitureType: 'fridge' },
        { x: 230, y: 310, w: 200, h: 85, label: 'Granite Kitchen Island', furnitureType: 'island' },
        { x: 490, y: 440, w: 160, h: 95, label: 'Dining Table & Chairs', furnitureType: 'table' },

        // 3. MASTER BEDROOM FURNITURE (South-East Room)
        { x: 1390, y: 920, w: 240, h: 230, label: 'King Size Bed & Pillows', furnitureType: 'bed' },
        { x: 1320, y: 940, w: 55, h: 55, label: 'Left Nightstand & Lamp', furnitureType: 'table' },
        { x: 1640, y: 940, w: 55, h: 55, label: 'Right Nightstand & Lamp', furnitureType: 'table' },
        { x: 1130, y: 1260, w: 190, h: 65, label: 'Hardwood Wardrobe Closet', furnitureType: 'wardrobe' },

        // 4. BATHROOM FIXTURES (South-West Room)
        { x: 118, y: 774, w: 210, h: 95, label: 'Porcelain Bathtub', furnitureType: 'tub' },
        { x: 118, y: 1030, w: 170, h: 60, label: 'Vanity Counter & Twin Sinks', furnitureType: 'vanity' },
        { x: 118, y: 1240, w: 60, h: 75, label: 'Ceramic Toilet', furnitureType: 'toilet' },
      ];

      // Visual and Functional Breach Points for Windows and Doors with Barricade mechanics
      const breachPoints: BreachPoint[] = [
        // Exterior Doors (Sturdy wooden doors, 130 Max HP)
        { id: 'front-door', label: 'Front Entrance Door', x: 860, y: 1342, w: 90, h: 28, isDoor: true, isBarricaded: false, barricadeHp: 0, maxBarricadeHp: 130 },
        { id: 'patio-door', label: 'Back Patio Glass Door', x: 1420, y: 80, w: 110, h: 28, isDoor: true, isBarricaded: false, barricadeHp: 0, maxBarricadeHp: 130 },

        // Exterior Windows (Wooden cross-planked windows, 80 Max HP)
        { id: 'window-kitchen', label: 'Kitchen Window', x: 80, y: 330, w: 28, h: 90, isWindow: true, isBarricaded: false, barricadeHp: 0, maxBarricadeHp: 80 },
        { id: 'window-living', label: 'Living Room Window', x: 1792, y: 390, w: 28, h: 100, isWindow: true, isBarricaded: false, barricadeHp: 0, maxBarricadeHp: 80 },
        { id: 'window-bedroom', label: 'Master Bedroom Window', x: 1792, y: 1050, w: 28, h: 100, isWindow: true, isBarricaded: false, barricadeHp: 0, maxBarricadeHp: 80 },
        { id: 'window-bathroom', label: 'Bathroom Privacy Window', x: 80, y: 970, w: 28, h: 70, isWindow: true, isBarricaded: false, barricadeHp: 0, maxBarricadeHp: 80 },
      ];

      // Waypoint doorways & breach entry points for Smart Pathing
      const doorways = [
        { x: 905, y: 1342 + 14 }, // Front door entry
        { x: 1475, y: 80 + 14 }, // Patio door entry
        { x: 80 + 14, y: 375 }, // Kitchen window entry
        { x: 80 + 14, y: 1005 }, // Bathroom window entry
        { x: 1792 + 14, y: 440 }, // Living window entry
        { x: 1792 + 14, y: 1100 }, // Bedroom window entry
        { x: 740, y: 440 }, // Kitchen to Living Room
        { x: 860, y: 740 }, // Living Room / Foyer transition
        { x: 1080, y: 920 }, // Hallway to Bedroom
        { x: 640, y: 940 }, // Hallway to Bathroom
        { x: 530, y: 740 }, // Kitchen to Hallway
      ];

      return {
        id: 'home',
        width,
        height,
        walls,
        bushes: [],
        trees: [],
        breachPoints,
        carLanes: [],
        doorways,
      };
    }

    case 'city': {
      // Expanded 3400 x 2600 Spacious Metropolis with open plazas and wide avenues
      const width = 3400;
      const height = 2600;
      const walls: WallRect[] = [
        // Building blocks separated by wide streets and open plazas
        { x: 200, y: 150, w: 700, h: 480, label: 'Plaza Tower A' },
        { x: 1350, y: 150, w: 800, h: 480, label: 'Grand Hotel B' },
        { x: 2550, y: 150, w: 700, h: 480, label: 'Financial Center C' },

        { x: 200, y: 1850, w: 700, h: 550, label: 'Metropolis Mall D' },
        { x: 1350, y: 1850, w: 800, h: 550, label: 'Arcade Complex E' },
        { x: 2550, y: 1850, w: 700, h: 550, label: 'Skyline Lofts F' },
      ];

      return {
        id: 'city',
        width,
        height,
        walls,
        bushes: [],
        trees: [],
        breachPoints: [],
        carLanes: [
          { y: 880, dir: 1, speed: 440 },
          { y: 1040, dir: 1, speed: 390 },
          { y: 1480, dir: -1, speed: 450 },
          { y: 1640, dir: -1, speed: 400 },
        ],
      };
    }

    case 'forest':
    default: {
      const width = 2600;
      const height = 2200;

      const walls: WallRect[] = [
        { x: 850, y: 700, w: 260, h: 40, label: 'Ancient Wall North' },
        { x: 850, y: 700, w: 40, h: 260, label: 'Ancient Wall West' },
        { x: 1450, y: 1200, w: 280, h: 40, label: 'Ancient Wall South' },
        { x: 1690, y: 1000, w: 40, h: 240, label: 'Ancient Wall East' },
      ];

      const bushes: BushCircle[] = [
        { x: 500, y: 450, radius: 65 },
        { x: 720, y: 540, radius: 80 },
        { x: 1200, y: 400, radius: 90 },
        { x: 1800, y: 550, radius: 75 },
        { x: 600, y: 1400, radius: 85 },
        { x: 1150, y: 1650, radius: 95 },
        { x: 1950, y: 1450, radius: 80 },
        { x: 1400, y: 900, radius: 70 },
      ];

      const trees: TreeCanopy[] = [
        { x: 350, y: 300, trunkRadius: 28, canopyRadius: 130 },
        { x: 1600, y: 350, trunkRadius: 30, canopyRadius: 145 },
        { x: 2200, y: 500, trunkRadius: 32, canopyRadius: 150 },
        { x: 400, y: 1800, trunkRadius: 30, canopyRadius: 140 },
        { x: 2150, y: 1750, trunkRadius: 32, canopyRadius: 155 },
        { x: 1300, y: 1100, trunkRadius: 26, canopyRadius: 125 },
      ];

      return {
        id: 'forest',
        width,
        height,
        walls,
        bushes,
        trees,
        breachPoints: [],
        carLanes: [],
      };
    }
  }
}

/** Maximum active mobs to prevent overwhelming swarms while enhancing enemy quality */
export function getMaxMobCap(mapId: MapType): number {
  switch (mapId) {
    case 'home':
      return 10;
    case 'city':
      return 16;
    case 'forest':
    default:
      return 14;
  }
}

/** Stage-based cop summon limits for Sheriff (stops calling backup after quota and chases instead) */
export function getStageCopLimit(survivalTime: number): number {
  if (survivalTime < 45) return 1;
  if (survivalTime < 95) return 2;
  if (survivalTime < 160) return 3;
  return 4;
}

/** Heart EXP requirement per charm fascination level */
export function getExpForLevel(level: number): number {
  if (level <= 1) return 15;
  if (level === 2) return 25;
  if (level === 3) return 40;
  if (level === 4) return 60;
  if (level === 5) return 85;
  return 85 + (level - 5) * 35;
}

export const CHARM_LEVEL_TITLES: { level: number; title: string; accessory: string }[] = [
  { level: 1, title: 'Cute Runner', accessory: 'Standard Hoodie' },
  { level: 2, title: 'Flustered Allure', accessory: 'Blushing Cheeks & Silk Hair Ribbons' },
  { level: 3, title: 'Sweet Temptation', accessory: 'Pastel Choker & Satin Bow' },
  { level: 4, title: 'Darling Enchanter', accessory: 'Frilly Apron & Feline Silhouette' },
  { level: 5, title: 'Radiant Dream Boy', accessory: 'Stardust Halo & Sparkling Aura' },
  { level: 6, title: 'Celestial Heartthrob', accessory: 'Irresistible Divine Glow' },
];

export function getCharmPerkForLevel(level: number): { title: string; accessory: string } {
  const found = CHARM_LEVEL_TITLES.find((c) => c.level === level);
  if (found) return found;
  return {
    title: `Ultimate Idol Lv. ${level}`,
    accessory: 'Transcendent Adoration Sparkles',
  };
}

/** 24 Thematic Enemy Upgrades inspired by the pursuers' desire and obsession */
export const ENEMY_UPGRADE_POOL: EnemyUpgrade[] = [
  // Sheriff Abigail
  {
    id: 'sheriff_lockdown',
    archetype: 'sheriff',
    title: 'Precinct Warrant',
    desireNote: 'She signed a county-wide warrant to bring you in unharmed.',
    effectDescription: 'Deputy Officers gain +35% Max HP and +20% movement speed.',
    statModifierKey: 'sheriff_lockdown',
    icon: 'Shield',
  },
  {
    id: 'sheriff_spotlight',
    archetype: 'sheriff',
    title: 'Searchlight Spotlight',
    desireNote: 'She aims high-intensity cruiser halogen spotlights directly at you.',
    effectDescription: 'Searchlight cone is 35% wider & 120px longer; slows you by 15% when caught in the beam.',
    statModifierKey: 'sheriff_spotlight',
    icon: 'Sun',
  },
  {
    id: 'sheriff_determination',
    archetype: 'sheriff',
    title: 'Sheriff’s Personal Pursuit',
    desireNote: 'Refusing to delegate any longer, Abigail vows to take you in herself.',
    effectDescription: 'When cop summons finish, Sheriff sprints +45% faster in direct, aggressive pursuit.',
    statModifierKey: 'sheriff_determination',
    icon: 'Flame',
  },

  // Officer Viki
  {
    id: 'officer_cruiser_pace',
    archetype: 'officer',
    title: 'Cruiser Interceptor Siren',
    desireNote: 'Her heart races as her squad siren screams down the avenue.',
    effectDescription: 'Officers sprint +30% faster when alerted and honk to alert nearby officers within 400px.',
    statModifierKey: 'officer_cruiser_pace',
    icon: 'Bell',
  },
  {
    id: 'officer_highbeam',
    archetype: 'officer',
    title: 'High-Beam Patrol Beam',
    desireNote: 'She sweeps every alleyway determined not to lose your trail.',
    effectDescription: 'Officer line-of-sight is 50% longer and spots you through thin bushes.',
    statModifierKey: 'officer_highbeam',
    icon: 'Eye',
  },
  {
    id: 'officer_riot_poise',
    archetype: 'officer',
    title: 'Tactical Deputy Shield',
    desireNote: 'Equipped with precinct crowd-control gear to absorb your gunfire.',
    effectDescription: 'Officers resist 40% of bullet knockback and deflect 25% frontal projectile damage.',
    statModifierKey: 'officer_riot_poise',
    icon: 'ShieldAlert',
  },

  // Delinquent Ryuko
  {
    id: 'delinquent_reinforced_shinai',
    archetype: 'delinquent',
    title: 'Hardened Oak Bat',
    desireNote: 'Ryuko swings her bat with fierce passion to sweep you into her gang.',
    effectDescription: 'Bat deflection arc expands to 140° and reflects flying sparks that can daze you.',
    statModifierKey: 'delinquent_reinforced_shinai',
    icon: 'Zap',
  },
  {
    id: 'delinquent_unflinching_pride',
    archetype: 'delinquent',
    title: 'Sukeban Swagger',
    desireNote: 'She refuses to let a cute boy slip away, no matter how many shots you fire.',
    effectDescription: 'Ryuko gains +30% HP and her brawler dash cooldown is reduced by 35%.',
    statModifierKey: 'delinquent_unflinching_pride',
    icon: 'Heart',
  },
  {
    id: 'delinquent_territory_burn',
    archetype: 'delinquent',
    title: 'Turf Skidmark Skids',
    desireNote: 'Her boots leave rebellious spray and friction trails across the ground.',
    effectDescription: 'Leaves glowing red spray paint skidmarks that slow your sprint by 25%.',
    statModifierKey: 'delinquent_territory_burn',
    icon: 'Flame',
  },

  // Tomboy Roxie
  {
    id: 'tomboy_track_spikes',
    archetype: 'tomboy',
    title: 'Varsity Sprint Cleats',
    desireNote: 'She laces up her favorite spiked track shoes just to chase you down.',
    effectDescription: 'Roxie’s sprint dashes are 35% faster and kick up dust clouds that obscure vision.',
    statModifierKey: 'tomboy_track_spikes',
    icon: 'Sparkles',
  },
  {
    id: 'tomboy_bear_hug',
    archetype: 'tomboy',
    title: 'Athletic Bear Hug',
    desireNote: 'She’s dying to tackle you into the soft grass and keep you close.',
    effectDescription: 'Tomboy grab radius increases by 25% and she immediately recovers from obstacle collisions.',
    statModifierKey: 'tomboy_bear_hug',
    icon: 'Smile',
  },
  {
    id: 'tomboy_competitive_spirit',
    archetype: 'tomboy',
    title: 'Competitive Fever',
    desireNote: 'Every time you shoot, she takes it as a direct athletic challenge!',
    effectDescription: 'Whenever you fire a weapon, Roxie gains a 1-second sprint boost (+25% speed).',
    statModifierKey: 'tomboy_competitive_spirit',
    icon: 'Flame',
  },

  // Goth Raven
  {
    id: 'goth_shadow_slip',
    archetype: 'goth',
    title: 'Velvet Phase Stride',
    desireNote: 'She slips through the twilight shadows seeking your warmth.',
    effectDescription: 'Shadow teleport distance increased to 140px and cooldown reduced by 40%.',
    statModifierKey: 'goth_shadow_slip',
    icon: 'Moon',
  },
  {
    id: 'goth_sorrow_aura',
    archetype: 'goth',
    title: 'Nocturnal Melancholy',
    desireNote: 'A cold, romantic gloom emanates from her presence.',
    effectDescription: 'Raven radiates a 180px dark violet aura that reduces your weapon firing cadence by 25%.',
    statModifierKey: 'goth_sorrow_aura',
    icon: 'CloudRain',
  },
  {
    id: 'goth_raven_feather',
    archetype: 'goth',
    title: 'Feather Storm Dispersion',
    desireNote: 'When struck by your bullets, she leaves swirling raven mementos.',
    effectDescription: 'Taking damage releases a burst of dark feathers that briefly drift toward your crosshairs.',
    statModifierKey: 'goth_raven_feather',
    icon: 'Feather',
  },

  // Gyaru Chloe
  {
    id: 'gyaru_ring_light',
    archetype: 'gyaru',
    title: 'Glamour Strobe Flash',
    desireNote: 'She wants the perfect couples selfie with you and won’t take no for an answer!',
    effectDescription: 'Emits a camera strobe flash every 7s that briefly creates sparkling afterimage glare.',
    statModifierKey: 'gyaru_ring_light',
    icon: 'Camera',
  },
  {
    id: 'gyaru_hype_squad',
    archetype: 'gyaru',
    title: 'Cheerleader Frenzy',
    desireNote: 'Chloe cheers on every pursuer with loud, high-energy enthusiasm.',
    effectDescription: 'Her cheer aura grants all surrounding pursuers within 180px +25% sprint speed and +20% HP.',
    statModifierKey: 'gyaru_hype_squad',
    icon: 'Music',
  },
  {
    id: 'gyaru_platform_stomp',
    archetype: 'gyaru',
    title: 'Platform Heel Shockwave',
    desireNote: 'Her cute platform boots create energetic rhythmic vibrations.',
    effectDescription: 'Chloe’s footsteps emit cute pink shockwaves that gently deflect incoming pellets.',
    statModifierKey: 'gyaru_platform_stomp',
    icon: 'Volume2',
  },

  // Office Senpai
  {
    id: 'senpai_espresso_rush',
    archetype: 'senpai',
    title: 'Double Espresso Rush',
    desireNote: 'She downed a double shot to ensure she doesn’t miss your mandatory review.',
    effectDescription: 'Senpai drops hot coffee hazard puddles twice as often and moves 20% faster.',
    statModifierKey: 'senpai_espresso_rush',
    icon: 'Coffee',
  },
  {
    id: 'senpai_dominant_gaze',
    archetype: 'senpai',
    title: 'Authoritative Glare',
    desireNote: 'Her intense, confident gaze makes you flustered and clumsy.',
    effectDescription: 'Standing within 220px of Senpai induces nervous tremors (+40% bullet spread).',
    statModifierKey: 'senpai_dominant_gaze',
    icon: 'EyeOff',
  },
  {
    id: 'senpai_corporate_tenacity',
    archetype: 'senpai',
    title: 'Corporate Poise',
    desireNote: 'A polished career woman cannot be deterred by simple play-blasters.',
    effectDescription: 'Senpai gains +60% HP and completely ignores minor bullet stagger.',
    statModifierKey: 'senpai_corporate_tenacity',
    icon: 'Briefcase',
  },

  // Yandere Ayame
  {
    id: 'yandere_red_string',
    archetype: 'yandere',
    title: 'Red String of Destiny',
    desireNote: 'An ethereal crimson thread binds her directly to your beating heart.',
    effectDescription: 'Ayame moves 35% faster when heading directly along your recent footsteps.',
    statModifierKey: 'yandere_red_string',
    icon: 'HeartCrack',
  },
  {
    id: 'yandere_obsessive_phase',
    archetype: 'yandere',
    title: 'Rose Petal Vortex',
    desireNote: 'She cannot bear being more than a stone’s throw away from her true love.',
    effectDescription: 'If you create over 550px distance, Ayame teleports 200px behind you amidst swirling petals.',
    statModifierKey: 'yandere_obsessive_phase',
    icon: 'Flower2',
  },
  {
    id: 'yandere_crimson_frenzy',
    archetype: 'yandere',
    title: 'Everlasting Devotion',
    desireNote: 'Every shot you fire into her only deepens her fiery, unyielding passion.',
    effectDescription: 'As Ayame’s HP drops, her sprint speed and attack reach increase by up to +60%!',
    statModifierKey: 'yandere_crimson_frenzy',
    icon: 'Flame',
  },
];

export function rollEnemyUpgrades(activeUpgradeIds: string[], count: number = 3): EnemyUpgrade[] {
  const activeSet = new Set(activeUpgradeIds);
  const available = ENEMY_UPGRADE_POOL.filter((u) => !activeSet.has(u.id));
  if (available.length === 0) {
    return [...ENEMY_UPGRADE_POOL].sort(() => Math.random() - 0.5).slice(0, count);
  }
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Active archetypes progression with authentic map themes */
export function getActiveArchetypes(survivalTime: number, mapId?: MapType): ArchetypeId[] {
  // In city: officers spawn naturally on urban beats! Gyaru, delinquent, and senpai are prevalent
  if (mapId === 'city') {
    if (survivalTime < 30) return ['officer', 'delinquent', 'gyaru'];
    if (survivalTime < 70) return ['officer', 'delinquent', 'gyaru', 'senpai'];
    if (survivalTime < 120) return ['officer', 'delinquent', 'gyaru', 'senpai', 'goth'];
    return ['officer', 'delinquent', 'gyaru', 'senpai', 'goth', 'tomboy', 'yandere'];
  }

  // In home: break-in intruders, stalkers, overbearing visitors! (Officers do NOT spawn naturally)
  if (mapId === 'home') {
    if (survivalTime < 30) return ['delinquent', 'yandere'];
    if (survivalTime < 70) return ['delinquent', 'yandere', 'senpai', 'tomboy'];
    return ['delinquent', 'yandere', 'senpai', 'tomboy', 'goth'];
  }

  // In forest: Park/County Sheriff, athletic trail runners, stalkers (Officers do NOT spawn naturally!)
  if (survivalTime < 30) {
    return ['sheriff', 'tomboy'];
  }
  if (survivalTime < 70) {
    return ['sheriff', 'tomboy', 'delinquent'];
  }
  if (survivalTime < 120) {
    return ['sheriff', 'tomboy', 'delinquent', 'yandere', 'goth'];
  }
  return ['sheriff', 'tomboy', 'delinquent', 'yandere', 'goth', 'gyaru'];
}

export function getSpawnInterval(survivalTime: number): number {
  return Math.max(0.9, 2.6 - survivalTime * 0.012);
}

export function createArchetypeSpecs(
  archetype: ArchetypeId,
  survivalTime: number,
  activeUpgrades: string[] = [],
  isShiny: boolean = false
): {
  hp: number;
  radius: number;
  baseSpeed: number;
} {
  const speedScale = 1.0 + Math.min(survivalTime * 0.002, 0.35);
  let hp = 30;
  let radius = 18;
  let baseSpeed = 140;

  switch (archetype) {
    case 'sheriff':
      hp = 50;
      radius = 19;
      baseSpeed = 100 * speedScale;
      break;
    case 'officer':
      hp = 36;
      radius = 18;
      baseSpeed = 175 * speedScale;
      if (activeUpgrades.includes('sheriff_lockdown')) hp += 15;
      if (activeUpgrades.includes('officer_riot_poise')) hp += 12;
      break;
    case 'delinquent':
      hp = 50;
      radius = 19;
      baseSpeed = 140 * speedScale;
      if (activeUpgrades.includes('delinquent_unflinching_pride')) hp += 18;
      break;
    case 'tomboy':
      hp = 34;
      radius = 18;
      baseSpeed = 148 * speedScale;
      break;
    case 'goth':
      hp = 30;
      radius = 17;
      baseSpeed = 122 * speedScale;
      break;
    case 'gyaru':
      hp = 26;
      radius = 16;
      baseSpeed = 158 * speedScale;
      break;
    case 'senpai':
      hp = 58;
      radius = 20;
      baseSpeed = 108 * speedScale;
      if (activeUpgrades.includes('senpai_corporate_tenacity')) hp += 35;
      break;
    case 'yandere':
      hp = 42;
      radius = 18;
      baseSpeed = 162 * speedScale;
      break;
  }

  // Golden Mini-Boss Shinies: 3.5x HP, +22% base speed, slightly larger radius
  if (isShiny) {
    hp = Math.round(hp * 3.5);
    baseSpeed = Math.round(baseSpeed * 1.22);
    radius += 3;
  }

  return { hp, radius, baseSpeed };
}

/** Check if direct line to target is blocked by any wall */
export function isLineBlockedByWalls(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  walls: WallRect[]
): boolean {
  for (const w of walls) {
    if (lineIntersectsBox(x1, y1, x2, y2, w.x - 5, w.y - 5, w.w + 10, w.h + 10)) {
      return true;
    }
  }
  return false;
}

/**
 * Smart Pathing & Obstacle Avoidance for Enemies:
 * Steers around obstacles, and for Home map guides exterior enemies to the nearest breach point.
 */
export function computeSmartSteering(
  enemy: EnemyState,
  targetX: number,
  targetY: number,
  walls: WallRect[],
  doorways?: { x: number; y: number }[],
  breachPoints?: BreachPoint[],
  mapId?: MapType
): { moveX: number; moveY: number; attackingBreach?: BreachPoint } {
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const directDist = Math.hypot(dx, dy) || 1;
  const directX = dx / directDist;
  const directY = dy / directDist;

  // In Suburban Home: If enemy is outside the house footprint, navigate toward closest breach point!
  if (mapId === 'home' && breachPoints && breachPoints.length > 0) {
    const isOutside = enemy.x < 105 || enemy.x > 1765 || enemy.y < 105 || enemy.y > 1315;
    if (isOutside) {
      let bestBp: BreachPoint = breachPoints[0];
      let bestScore = Infinity;
      for (const bp of breachPoints) {
        const bpCenterX = bp.x + bp.w / 2;
        const bpCenterY = bp.y + bp.h / 2;
        const distToBp = Math.hypot(bpCenterX - enemy.x, bpCenterY - enemy.y);
        const distFromBpToTarget = Math.hypot(targetX - bpCenterX, targetY - bpCenterY);
        // Prioritize closest breach point
        const barricadePenalty = bp.isBarricaded ? 50 : 0;
        const totalScore = distToBp + distFromBpToTarget * 0.4 + barricadePenalty;
        if (totalScore < bestScore) {
          bestScore = totalScore;
          bestBp = bp;
        }
      }

      const bpTargetX = bestBp.x + bestBp.w / 2;
      const bpTargetY = bestBp.y + bestBp.h / 2;
      const bdx = bpTargetX - enemy.x;
      const bdy = bpTargetY - enemy.y;
      const bDist = Math.hypot(bdx, bdy) || 1;

      // If within attack range of a barricaded breach point, stop and attack!
      if (bDist < 46 && bestBp.isBarricaded && (bestBp.barricadeHp || 0) > 0) {
        return { moveX: 0, moveY: 0, attackingBreach: bestBp };
      }

      return { moveX: bdx / bDist, moveY: bdy / bDist };
    }
  }

  // If path is completely clear, head directly
  const blocked = isLineBlockedByWalls(enemy.x, enemy.y, targetX, targetY, walls);
  if (!blocked) {
    return { moveX: directX, moveY: directY };
  }

  // If inside home and doorways exist, route to nearest useful doorway
  if (doorways && doorways.length > 0) {
    let bestDoor: { x: number; y: number } | null = null;
    let bestScore = Infinity;
    for (const d of doorways) {
      if (!isLineBlockedByWalls(enemy.x, enemy.y, d.x, d.y, walls)) {
        const distToDoor = Math.hypot(d.x - enemy.x, d.y - enemy.y);
        const distFromDoorToTarget = Math.hypot(targetX - d.x, targetY - d.y);
        const totalScore = distToDoor + distFromDoorToTarget;
        if (totalScore < bestScore) {
          bestScore = totalScore;
          bestDoor = d;
        }
      }
    }
    if (bestDoor) {
      const doorDx = bestDoor.x - enemy.x;
      const doorDy = bestDoor.y - enemy.y;
      const doorDist = Math.hypot(doorDx, doorDy) || 1;
      return { moveX: doorDx / doorDist, moveY: doorDy / doorDist };
    }
  }

  // Feeler Ray casting: test angles to steer around obstacle
  const anglesToTest = [
    Math.PI / 4,
    -Math.PI / 4,
    Math.PI / 2,
    -Math.PI / 2,
    (3 * Math.PI) / 4,
    -(3 * Math.PI) / 4,
  ];

  const baseAngle = Math.atan2(dy, dx);
  const feelerDistance = 140;

  for (const offset of anglesToTest) {
    const testAngle = baseAngle + offset;
    const testTargetX = enemy.x + Math.cos(testAngle) * feelerDistance;
    const testTargetY = enemy.y + Math.sin(testAngle) * feelerDistance;

    if (!isLineBlockedByWalls(enemy.x, enemy.y, testTargetX, testTargetY, walls)) {
      return { moveX: Math.cos(testAngle), moveY: Math.sin(testAngle) };
    }
  }

  return { moveX: directX, moveY: directY };
}

/** Update individual enemy behavior with Smart Pathing, Sheriff Stage Quota, Officer Patrol, and Upgrades */
export function updateEnemyAI(
  enemy: EnemyState,
  playerX: number,
  playerY: number,
  allEnemies: EnemyState[],
  walls: WallRect[],
  doorways: { x: number; y: number }[] | undefined,
  dt: number,
  arenaWidth: number,
  arenaHeight: number,
  survivalTime: number = 0,
  activeUpgrades: string[] = [],
  breachPoints?: BreachPoint[],
  mapId?: MapType
): {
  dropsPuddle?: { x: number; y: number; type?: 'coffee' | 'caution' };
  requestsOfficerBackup?: boolean;
  shinySpecial?: string;
  attackingBreach?: BreachPoint;
} {
  const dx = playerX - enemy.x;
  const dy = playerY - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  enemy.angle = Math.atan2(dy, dx);
  enemy.specialTimer -= dt;
  if (enemy.speechTimer > 0) enemy.speechTimer -= dt;

  let currentSpeed = enemy.baseSpeed * enemy.speedMultiplier;
  let dropsPuddle: { x: number; y: number; type?: 'coffee' | 'caution' } | undefined = undefined;
  let requestsOfficerBackup: boolean | undefined = undefined;
  let shinySpecial: string | undefined = undefined;
  let attackingBreach: BreachPoint | undefined = undefined;

  // Shiny Mini-Boss Special Attack Cadence
  if (enemy.isShiny) {
    enemy.shinyAttackTimer = (enemy.shinyAttackTimer || 3.5) - dt;
    if (enemy.shinyAttackTimer <= 0) {
      enemy.shinyAttackTimer = 4.8 + Math.random() * 2.0;
      shinySpecial = `${enemy.archetype}_shiny_special`;
    }
  }

  const steer = computeSmartSteering(enemy, playerX, playerY, walls, doorways, breachPoints, mapId);
  let { moveX, moveY } = steer;

  // If attacking a barricaded breach point, damage the barricade!
  if (steer.attackingBreach) {
    attackingBreach = steer.attackingBreach;
    enemy.attackCooldown = (enemy.attackCooldown || 0) - dt;
    if (enemy.attackCooldown <= 0) {
      enemy.attackCooldown = 0.5;
      if (steer.attackingBreach.barricadeHp !== undefined) {
        steer.attackingBreach.barricadeHp -= 20;
        if (steer.attackingBreach.barricadeHp <= 0) {
          steer.attackingBreach.barricadeHp = 0;
          steer.attackingBreach.isBarricaded = false;
          steer.attackingBreach.breached = true;
        }
      }
    }
  }

  switch (enemy.archetype) {
    case 'sheriff': {
      // SHERIFF: Spawns a set amount of cops according to game stage, then stops summoning and chases directly!
      const stageQuota = enemy.stageQuota || getStageCopLimit(survivalTime);
      const summoned = enemy.copsSummoned || 0;

      // Realistic, fair searchlight cone: 165px reach (220px with spotlight upgrade), 26° cone
      const searchlightReach = activeUpgrades.includes('sheriff_spotlight') ? 220 : 165;
      const coneWidth = activeUpgrades.includes('sheriff_spotlight') ? Math.PI / 8 : Math.PI / 11;

      // Angle to player compared to sheriff's facing angle
      const toPlayerAngle = Math.atan2(dy, dx);
      const angleDiff = Math.abs(
        Math.atan2(Math.sin(toPlayerAngle - enemy.angle), Math.cos(toPlayerAngle - enemy.angle))
      );
      const unobstructed = !isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls);
      const inCone = dist <= searchlightReach && angleDiff <= coneWidth && unobstructed;
      enemy.isSpottedInCone = inCone;

      if (summoned < stageQuota) {
        // Still has officers to deploy: Kites only if within proximity or directly in searchlight
        const minDistance = 210;
        if (dist < minDistance || inCone) {
          moveX = -dirX;
          moveY = -dirY;
          enemy.isKiting = true;
        } else {
          enemy.isKiting = false;
        }

        // Whistle summons backup when special timer expires (tactical cadence, no flood!)
        if (enemy.specialTimer <= 0) {
          enemy.specialTimer = inCone ? 4.5 : 7.0;
          enemy.copsSummoned = summoned + 1;
          requestsOfficerBackup = true;
          dropsPuddle = { x: enemy.x, y: enemy.y, type: 'caution' };
        }
      } else {
        // All officers deployed for this stage!
        // No longer summons again; opts for aggressive direct chase!
        enemy.isKiting = false;
        const pursuitSteer = computeSmartSteering(enemy, playerX, playerY, walls, doorways, breachPoints, mapId);
        moveX = pursuitSteer.moveX;
        moveY = pursuitSteer.moveY;
        const pursuitBoost = activeUpgrades.includes('sheriff_determination') ? 1.45 : 1.25;
        currentSpeed *= pursuitBoost;
      }
      break;
    }

    case 'officer': {
      // OFFICER: Patrols areas at steady pace. No cone! Detects via sound / proximity hearing!
      if (!enemy.isAlerted) {
        enemy.isSirenActive = false;
        currentSpeed *= 0.65; // Moderate patrol pace

        // Patrol wandering heading
        if (enemy.patrolTimer === undefined || enemy.patrolTimer <= 0) {
          enemy.patrolTimer = 2.4 + Math.random() * 2.2;
          enemy.patrolAngle = (enemy.patrolAngle ?? Math.random() * Math.PI * 2) + (Math.random() - 0.5) * 1.5;
        }
        enemy.patrolTimer -= dt;

        moveX = Math.cos(enemy.patrolAngle || 0);
        moveY = Math.sin(enemy.patrolAngle || 0);
        enemy.angle = enemy.patrolAngle || 0;

        // Proximity detection radius (no cone): 85px (or 130px with officer_highbeam upgrade)
        const hearingDist = activeUpgrades.includes('officer_highbeam') ? 130 : 85;
        const unobstructed = !isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls);
        if (dist <= hearingDist && unobstructed) {
          enemy.isAlerted = true;
          enemy.isSirenActive = true;
        }
      } else {
        // Alerted Mode: Fast pursuit with flashing siren!
        enemy.isSirenActive = true;
        if (activeUpgrades.includes('officer_cruiser_pace')) {
          currentSpeed *= 1.3;
        }
      }
      break;
    }

    case 'delinquent': {
      // DELINQUENT: Brawler charging with wooden bat
      enemy.batAngle = (enemy.batAngle || 0) + dt * 4;
      if (enemy.deflectSparkTimer && enemy.deflectSparkTimer > 0) {
        enemy.deflectSparkTimer -= dt;
      }
      const dashCooldown = activeUpgrades.includes('delinquent_unflinching_pride') ? 1.7 : 2.8;
      if (enemy.specialTimer <= 0) {
        if (!enemy.isDashing) {
          enemy.isDashing = true;
          enemy.specialTimer = 0.9;
        } else {
          enemy.isDashing = false;
          enemy.specialTimer = dashCooldown;
        }
      }
      if (enemy.isDashing) {
        currentSpeed *= 1.85;
      }
      break;
    }

    case 'tomboy': {
      const dashMultiplier = activeUpgrades.includes('tomboy_track_spikes') ? 2.6 : 2.2;
      if (enemy.specialTimer <= 0) {
        if (!enemy.isDashing) {
          enemy.isDashing = true;
          enemy.specialTimer = 0.7;
        } else {
          enemy.isDashing = false;
          enemy.specialTimer = 2.3;
        }
      }
      if (enemy.isDashing) {
        currentSpeed *= dashMultiplier;
      }
      break;
    }

    case 'goth': {
      const teleportCooldown = activeUpgrades.includes('goth_shadow_slip') ? 1.8 : 3.5;
      const teleportDist = activeUpgrades.includes('goth_shadow_slip') ? 140 : 90;
      if (enemy.specialTimer <= 0 && dist > 120) {
        enemy.x += dirX * teleportDist;
        enemy.y += dirY * teleportDist;
        enemy.specialTimer = teleportCooldown;
      }
      break;
    }

    case 'gyaru': {
      let cheerCount = 0;
      const cheerRange = activeUpgrades.includes('gyaru_hype_squad') ? 200 : 140;
      for (const other of allEnemies) {
        if (other.id !== enemy.id && other.archetype === 'gyaru') {
          const d2 = distanceSq(enemy.x, enemy.y, other.x, other.y);
          if (d2 < cheerRange * cheerRange) {
            cheerCount++;
            other.speedMultiplier = activeUpgrades.includes('gyaru_hype_squad') ? 1.35 : 1.25;
          }
        }
      }
      if (cheerCount > 0) currentSpeed *= 1.25;

      const perpX = -dirY;
      const perpY = dirX;
      moveX = moveX * 0.75 + perpX * 0.5;
      moveY = moveY * 0.75 + perpY * 0.5;
      const mLen = Math.hypot(moveX, moveY) || 1;
      moveX /= mLen;
      moveY /= mLen;
      break;
    }

    case 'senpai': {
      const puddleInterval = activeUpgrades.includes('senpai_espresso_rush') ? 2.2 : 4.2;
      if (enemy.specialTimer <= 0) {
        dropsPuddle = { x: enemy.x, y: enemy.y, type: 'coffee' };
        enemy.specialTimer = puddleInterval;
      }
      if (activeUpgrades.includes('senpai_espresso_rush')) {
        currentSpeed *= 1.2;
      }
      break;
    }

    case 'yandere': {
      enemy.sightTimer = (enemy.sightTimer || 0) + dt;
      let yandereBonus = Math.min(1.7, 1.0 + enemy.sightTimer * 0.08);
      if (activeUpgrades.includes('yandere_red_string')) {
        yandereBonus *= 1.25;
      }
      if (activeUpgrades.includes('yandere_crimson_frenzy') && enemy.hp < enemy.maxHp * 0.5) {
        yandereBonus *= 1.35;
      }
      currentSpeed *= yandereBonus;

      // Obsessive vortex: If player is very far, teleport closer!
      if (activeUpgrades.includes('yandere_obsessive_phase') && dist > 550) {
        enemy.x = playerX - dirX * 220;
        enemy.y = playerY - dirY * 220;
      }
      break;
    }
  }

  // Knockback decay
  enemy.knockbackVx *= Math.max(0, 1 - dt * 8);
  enemy.knockbackVy *= Math.max(0, 1 - dt * 8);

  enemy.vx = moveX * currentSpeed + enemy.knockbackVx;
  enemy.vy = moveY * currentSpeed + enemy.knockbackVy;

  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;

  // Resolve Wall Collisions
  for (const w of walls) {
    const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, w.x, w.y, w.w, w.h);
    if (res.collided) {
      enemy.x = res.x;
      enemy.y = res.y;
    }
  }

  // Arena bounds clamping
  enemy.x = Math.max(enemy.radius, Math.min(arenaWidth - enemy.radius, enemy.x));
  enemy.y = Math.max(enemy.radius, Math.min(arenaHeight - enemy.radius, enemy.y));

  if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;

  return { dropsPuddle, requestsOfficerBackup, shinySpecial, attackingBreach };
}

/** Updates neutral civilians in Metropolis with erratic, suspicious behaviors */
export function updateCivilianAI(
  civ: Civilian,
  playerX: number,
  playerY: number,
  walls: WallRect[],
  dt: number,
  arenaWidth: number,
  arenaHeight: number
) {
  civ.wanderTimer -= dt;
  if (civ.pauseTimer > 0) {
    civ.pauseTimer -= dt;
    civ.vx = 0;
    civ.vy = 0;
    return;
  }

  // Periodic decision to pause or pick a new wandering direction
  if (civ.wanderTimer <= 0) {
    civ.wanderTimer = 1.6 + Math.random() * 3.2;

    // 25% chance to pause (e.g. check phone, look at storefront)
    if (Math.random() < 0.25) {
      civ.pauseTimer = 1.0 + Math.random() * 1.6;
      civ.vx = 0;
      civ.vy = 0;
      return;
    }

    // 40% chance to wander toward player's general direction (feigning pursuit!),
    // making the player second-guess if they are an incoming pursuer!
    const distToPlayer = Math.hypot(playerX - civ.x, playerY - civ.y);
    if (distToPlayer < 500 && Math.random() < 0.5) {
      const toPlayerAngle = Math.atan2(playerY - civ.y, playerX - civ.x);
      // Veer slightly off angle by 25-45 degrees
      const wanderAngle = toPlayerAngle + (Math.random() - 0.5) * 1.1;
      civ.vx = Math.cos(wanderAngle) * civ.speed;
      civ.vy = Math.sin(wanderAngle) * civ.speed;
    } else {
      // Random wandering direction across sidewalks & plazas
      const randomAngle = Math.random() * Math.PI * 2;
      civ.vx = Math.cos(randomAngle) * civ.speed;
      civ.vy = Math.sin(randomAngle) * civ.speed;
    }
  }

  civ.x += civ.vx * dt;
  civ.y += civ.vy * dt;
  if (Math.hypot(civ.vx, civ.vy) > 5) {
    civ.facingAngle = Math.atan2(civ.vy, civ.vx);
  }

  // Clamp within arena
  civ.x = Math.max(30, Math.min(arenaWidth - 30, civ.x));
  civ.y = Math.max(30, Math.min(arenaHeight - 30, civ.y));

  for (const w of walls) {
    const res = resolveCircleBoxCollision(civ.x, civ.y, civ.radius, w.x, w.y, w.w, w.h);
    if (res.collided) {
      civ.x = res.x;
      civ.y = res.y;
      civ.vx *= -1;
      civ.vy *= -1;
    }
  }
}

/** Roll and apply a permanent archetype debuff on player contact */
export function rollArchetypeDebuff(
  archetype: ArchetypeId,
  currentDebuffs: ActiveDebuff[]
): ActiveDebuff | null {
  const pool = GAME_TEXT.archetypeDebuffs[archetype as ArchetypeKey] || [];
  const existingIds = new Set(currentDebuffs.map((d) => d.id));
  const available = pool.filter((d) => !existingIds.has(d.id));

  if (available.length === 0) return null;
  const picked = available[Math.floor(Math.random() * available.length)];
  return {
    id: picked.id,
    name: picked.name,
    archetype,
    description: picked.description,
    effectType: picked.effectType,
    effectValue: picked.effectValue,
  };
}

export interface DebuffedPlayerStats {
  speed: number;
  damageMultiplier: number;
  spreadMultiplier: number;
  fireIntervalMultiplier: number;
  knockbackTakenMultiplier: number;
  knockbackDealtMultiplier: number;
  isRadarGlitched: boolean;
  burstLock: boolean;
  driftMomentum: number;
  crosshairSway: number;
  disarmOnHit: boolean;
  recoilPull: number;
  periodicTwitchInterval: number;
  moveShotSpeedPenalty: number;
  impactBlur: boolean;
  searchlightGlare: boolean;
  curfewContrast: boolean;
  bountyMagnet: boolean;
  cautionTether: boolean;
  carSpeedMultiplier: number;
  matchSpeed: boolean;
  pickupDelay: number;
  inverseKnockback: boolean;
  invulnDurationMultiplier: number;
  turnStumble: boolean;
  bulletLifetimeMultiplier: number;
  splinterShrapnel: boolean;
  vignetteBlur: boolean;
  tightFlank: boolean;
  shadowTentacles: boolean;
  missPenalty: boolean;
  wispBullets: boolean;
  radarVoid: boolean;
  candlelightRadius: number;
  bulletGravity: boolean;
  glitterBurst: boolean;
  flashWhiteout: boolean;
  pickupKick: boolean;
  cheerSurge: boolean;
  floorSlip: boolean;
  spinKnockback: boolean;
  clockAccel: number;
  coffeeBurn: boolean;
  redTapeBullets: boolean;
  cardinalOnly: boolean;
  anxietyPulse: boolean;
  auditDelay: boolean;
  redTether: boolean;
  doubleDamage: boolean;
  tunnelVision: boolean;
  jealousyFrenzy: boolean;
  emptyStun: boolean;
  perimeterFire: boolean;
}

/** Computes player stats modified by all active permanent debuffs */
export function computeDebuffedPlayerStats(
  baseSpeed: number,
  baseDamage: number,
  baseSpread: number,
  baseFireInterval: number,
  debuffs: ActiveDebuff[]
): DebuffedPlayerStats {
  let speed = baseSpeed;
  let damageMultiplier = 1.0;
  let spreadMultiplier = 1.0;
  let fireIntervalMultiplier = 1.0;
  let knockbackTakenMultiplier = 1.0;
  let knockbackDealtMultiplier = 1.0;
  let isRadarGlitched = false;
  let burstLock = false;
  let driftMomentum = 0.75; // Default ground friction damping
  let crosshairSway = 0;
  let disarmOnHit = false;
  let recoilPull = 0;
  let periodicTwitchInterval = 0;
  let moveShotSpeedPenalty = 1.0;
  let impactBlur = false;
  let searchlightGlare = false;
  let curfewContrast = false;
  let bountyMagnet = false;
  let cautionTether = false;
  let carSpeedMultiplier = 1.0;
  let matchSpeed = false;
  let pickupDelay = 0;
  let inverseKnockback = false;
  let invulnDurationMultiplier = 1.0;
  let turnStumble = false;
  let bulletLifetimeMultiplier = 1.0;
  let splinterShrapnel = false;
  let vignetteBlur = false;
  let tightFlank = false;
  let shadowTentacles = false;
  let missPenalty = false;
  let wispBullets = false;
  let radarVoid = false;
  let candlelightRadius = 0;
  let bulletGravity = false;
  let glitterBurst = false;
  let flashWhiteout = false;
  let pickupKick = false;
  let cheerSurge = false;
  let floorSlip = false;
  let spinKnockback = false;
  let clockAccel = 1.0;
  let coffeeBurn = false;
  let redTapeBullets = false;
  let cardinalOnly = false;
  let anxietyPulse = false;
  let auditDelay = false;
  let redTether = false;
  let doubleDamage = false;
  let tunnelVision = false;
  let jealousyFrenzy = false;
  let emptyStun = false;
  let perimeterFire = false;

  for (const d of debuffs) {
    if (d.effectType === 'slow') speed *= d.effectValue;
    if (d.effectType === 'damage_penalty') damageMultiplier *= d.effectValue;
    if (d.effectType === 'spread_increase') spreadMultiplier *= d.effectValue;
    if (d.effectType === 'fire_rate') fireIntervalMultiplier /= d.effectValue;
    if (d.effectType === 'knockback_taken') knockbackTakenMultiplier *= d.effectValue;
    if (d.effectType === 'knockback_dealt') knockbackDealtMultiplier *= d.effectValue;
    if (d.effectType === 'radar_glitch') isRadarGlitched = true;
    if (d.effectType === 'burst_lock') burstLock = true;
    if (d.effectType === 'drift_momentum') driftMomentum = 0.93; // Slipperiness
    if (d.effectType === 'crosshair_sway') crosshairSway = d.effectValue || 1.4;
    if (d.effectType === 'disarm_on_hit') disarmOnHit = true;
    if (d.effectType === 'recoil_pull') recoilPull = d.effectValue || 1.2;
    if (d.effectType === 'periodic_twitch') periodicTwitchInterval = d.effectValue || 9.0;
    if (d.effectType === 'move_shot_penalty') moveShotSpeedPenalty = d.effectValue || 0.6;
    if (d.effectType === 'impact_blur') impactBlur = true;
    if (d.effectType === 'searchlight_glare') searchlightGlare = true;
    if (d.effectType === 'curfew_contrast') curfewContrast = true;
    if (d.effectType === 'bounty_magnet') bountyMagnet = true;
    if (d.effectType === 'caution_tether') cautionTether = true;
    if (d.effectType === 'car_speed') carSpeedMultiplier = d.effectValue || 1.3;
    if (d.effectType === 'match_speed') matchSpeed = true;
    if (d.effectType === 'pickup_delay') pickupDelay = d.effectValue || 0.8;
    if (d.effectType === 'inverse_knockback') inverseKnockback = true;
    if (d.effectType === 'invuln_halved') invulnDurationMultiplier = d.effectValue || 0.5;
    if (d.effectType === 'turn_stumble') turnStumble = true;
    if (d.effectType === 'bullet_decay') bulletLifetimeMultiplier = d.effectValue || 0.75;
    if (d.effectType === 'splinter_shrapnel') splinterShrapnel = true;
    if (d.effectType === 'vignette_blur') vignetteBlur = true;
    if (d.effectType === 'tight_flank') tightFlank = true;
    if (d.effectType === 'shadow_tentacles') shadowTentacles = true;
    if (d.effectType === 'miss_penalty') missPenalty = true;
    if (d.effectType === 'wisp_bullets') wispBullets = true;
    if (d.effectType === 'radar_void') radarVoid = true;
    if (d.effectType === 'candlelight_radius') candlelightRadius = d.effectValue || 240;
    if (d.effectType === 'bullet_gravity') bulletGravity = true;
    if (d.effectType === 'glitter_burst') glitterBurst = true;
    if (d.effectType === 'flash_whiteout') flashWhiteout = true;
    if (d.effectType === 'pickup_kick') pickupKick = true;
    if (d.effectType === 'cheer_surge') cheerSurge = true;
    if (d.effectType === 'floor_slip') floorSlip = true;
    if (d.effectType === 'spin_knockback') spinKnockback = true;
    if (d.effectType === 'clock_accel') clockAccel = d.effectValue || 1.3;
    if (d.effectType === 'coffee_burn') coffeeBurn = true;
    if (d.effectType === 'red_tape_bullets') redTapeBullets = true;
    if (d.effectType === 'cardinal_only') cardinalOnly = true;
    if (d.effectType === 'anxiety_pulse') anxietyPulse = true;
    if (d.effectType === 'audit_delay') auditDelay = true;
    if (d.effectType === 'red_tether') redTether = true;
    if (d.effectType === 'double_damage') doubleDamage = true;
    if (d.effectType === 'tunnel_vision') tunnelVision = true;
    if (d.effectType === 'jealousy_frenzy') jealousyFrenzy = true;
    if (d.effectType === 'empty_stun') emptyStun = true;
    if (d.effectType === 'perimeter_fire') perimeterFire = true;
  }

  return {
    speed,
    damageMultiplier,
    spreadMultiplier,
    fireIntervalMultiplier,
    knockbackTakenMultiplier,
    knockbackDealtMultiplier,
    isRadarGlitched,
    burstLock,
    driftMomentum: floorSlip ? 0.96 : driftMomentum,
    crosshairSway,
    disarmOnHit,
    recoilPull,
    periodicTwitchInterval,
    moveShotSpeedPenalty,
    impactBlur,
    searchlightGlare,
    curfewContrast,
    bountyMagnet,
    cautionTether,
    carSpeedMultiplier,
    matchSpeed,
    pickupDelay: auditDelay ? 1.5 : pickupDelay,
    inverseKnockback,
    invulnDurationMultiplier,
    turnStumble,
    bulletLifetimeMultiplier,
    splinterShrapnel,
    vignetteBlur,
    tightFlank,
    shadowTentacles,
    missPenalty,
    wispBullets,
    radarVoid,
    candlelightRadius,
    bulletGravity,
    glitterBurst,
    flashWhiteout,
    pickupKick,
    cheerSurge,
    floorSlip,
    spinKnockback,
    clockAccel,
    coffeeBurn,
    redTapeBullets,
    cardinalOnly,
    anxietyPulse,
    auditDelay,
    redTether,
    doubleDamage,
    tunnelVision,
    jealousyFrenzy,
    emptyStun,
    perimeterFire,
  };
}

/** Creates a new flying word or heart particle for the sunset screen */
export function createSunsetParticle(
  width: number,
  height: number,
  wordList: readonly string[],
  heartList: readonly string[]
): FlyingSunsetParticle {
  const isWord = Math.random() > 0.45;
  const text = isWord
    ? wordList[Math.floor(Math.random() * wordList.length)]
    : heartList[Math.floor(Math.random() * heartList.length)];

  const scale = 0.65 + Math.random() * 1.35;
  const startX = width * 0.15 + Math.random() * (width * 0.7);
  const startY = height + 20 + Math.random() * 60;

  const vx = (Math.random() - 0.5) * 110;
  const vy = -(320 + Math.random() * 320);

  const wordColors = ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#f472b6', '#fff1f2'];
  const heartColors = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fbbf24', '#f59e0b'];

  const color = isWord
    ? wordColors[Math.floor(Math.random() * wordColors.length)]
    : heartColors[Math.floor(Math.random() * heartColors.length)];

  return {
    id: Math.random(),
    type: isWord ? 'word' : 'heart',
    text,
    x: startX,
    y: startY,
    vx,
    vy,
    rotation: (Math.random() - 0.5) * 0.4,
    vRot: (Math.random() - 0.5) * 1.5,
    scale,
    opacity: 1,
    color,
    fontSize: isWord ? 28 : 34,
  };
}

/** Updates physics of sunset flying particles */
export function updateSunsetParticles(
  particles: FlyingSunsetParticle[],
  dt: number,
  height: number
): FlyingSunsetParticle[] {
  const gravity = 280;
  return particles
    .map((p) => {
      const nextVy = p.vy + gravity * dt;
      const nextX = p.x + p.vx * dt;
      const nextY = p.y + nextVy * dt;
      const nextRot = p.rotation + p.vRot * dt;

      let nextOpacity = p.opacity;
      if (nextVy > 0 && nextY > height - 100) {
        nextOpacity = Math.max(0, nextOpacity - dt * 0.8);
      }

      return {
        ...p,
        x: nextX,
        y: nextY,
        vy: nextVy,
        rotation: nextRot,
        opacity: nextOpacity,
      };
    })
    .filter((p) => p.opacity > 0 && p.y < height + 180);
}
