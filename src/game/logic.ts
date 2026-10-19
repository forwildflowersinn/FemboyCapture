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
  deflectSparkTimer?: number;
  isSpottedInCone?: boolean;
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
  w?: number;
  h?: number;
  isWindow?: boolean;
  isDoor?: boolean;
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
      const walls: WallRect[] = [
        // Exterior Boundary Walls (with openings for breach doors & windows)
        { x: 80, y: 80, w: 1740, h: 28, label: 'North Exterior Wall', furnitureType: 'wall' },
        { x: 80, y: 1342, w: 1740, h: 28, label: 'South Exterior Wall', furnitureType: 'wall' },
        { x: 80, y: 80, w: 28, h: 1290, label: 'West Exterior Wall', furnitureType: 'wall' },
        { x: 1792, y: 80, w: 28, h: 1290, label: 'East Exterior Wall', furnitureType: 'wall' },

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

      // Visual and Functional Breach Points for Windows and Doors
      const breachPoints: BreachPoint[] = [
        // Exterior Doors
        { id: 'front-door', label: 'Front Entrance Door', x: 860, y: 1342, w: 90, h: 28, isDoor: true },
        { id: 'patio-door', label: 'Back Patio Glass Door', x: 1420, y: 80, w: 110, h: 28, isDoor: true },

        // Exterior Windows (Actual visual glass panes & breaching locations)
        { id: 'window-kitchen', label: 'Kitchen Window', x: 80, y: 330, w: 28, h: 90, isWindow: true },
        { id: 'window-living', label: 'Living Room Window', x: 1792, y: 390, w: 28, h: 100, isWindow: true },
        { id: 'window-bedroom', label: 'Master Bedroom Window', x: 1792, y: 1050, w: 28, h: 100, isWindow: true },
        { id: 'window-bathroom', label: 'Bathroom Privacy Window', x: 80, y: 970, w: 28, h: 70, isWindow: true },
      ];

      // Waypoint doorways for Smart Pathing
      const doorways = [
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

/** Active archetypes progression */
export function getActiveArchetypes(survivalTime: number, mapId?: MapType): ArchetypeId[] {
  // In city: spawn officers, delinquent, tomboy, gyaru, senpai, etc. (no sheriffs)
  if (mapId === 'city') {
    if (survivalTime < 25) return ['officer', 'delinquent'];
    if (survivalTime < 50) return ['officer', 'delinquent', 'tomboy'];
    if (survivalTime < 80) return ['officer', 'delinquent', 'tomboy', 'gyaru'];
    return ['officer', 'delinquent', 'tomboy', 'gyaru', 'goth', 'senpai', 'yandere'];
  }

  // Standard progression
  if (survivalTime < 20) {
    return ['sheriff', 'tomboy'];
  }
  if (survivalTime < 45) {
    return ['sheriff', 'tomboy', 'delinquent'];
  }
  if (survivalTime < 75) {
    return ['sheriff', 'tomboy', 'delinquent', 'gyaru', 'goth'];
  }
  if (survivalTime < 110) {
    return ['sheriff', 'tomboy', 'delinquent', 'gyaru', 'goth', 'senpai'];
  }
  return ['sheriff', 'officer', 'delinquent', 'tomboy', 'goth', 'gyaru', 'senpai', 'yandere'];
}

export function getSpawnInterval(survivalTime: number): number {
  return Math.max(0.55, 2.4 - survivalTime * 0.016);
}

export function createArchetypeSpecs(archetype: ArchetypeId, survivalTime: number): {
  hp: number;
  radius: number;
  baseSpeed: number;
} {
  const speedScale = 1.0 + Math.min(survivalTime * 0.002, 0.35);
  switch (archetype) {
    case 'sheriff':
      return { hp: 45, radius: 19, baseSpeed: 95 * speedScale }; // Slow summoner
    case 'officer':
      return { hp: 34, radius: 18, baseSpeed: 175 * speedScale }; // Fast deputy responder
    case 'delinquent':
      return { hp: 48, radius: 19, baseSpeed: 140 * speedScale }; // Tough brawler
    case 'tomboy':
      return { hp: 32, radius: 18, baseSpeed: 146 * speedScale };
    case 'goth':
      return { hp: 28, radius: 17, baseSpeed: 120 * speedScale };
    case 'gyaru':
      return { hp: 24, radius: 16, baseSpeed: 155 * speedScale };
    case 'senpai':
      return { hp: 55, radius: 20, baseSpeed: 105 * speedScale };
    case 'yandere':
      return { hp: 40, radius: 18, baseSpeed: 160 * speedScale };
  }
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
 * Steers around obstacles when direct path is obstructed.
 */
export function computeSmartSteering(
  enemy: EnemyState,
  targetX: number,
  targetY: number,
  walls: WallRect[],
  doorways?: { x: number; y: number }[]
): { moveX: number; moveY: number } {
  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const directDist = Math.hypot(dx, dy) || 1;
  const directX = dx / directDist;
  const directY = dy / directDist;

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

/** Update individual enemy behavior with Smart Pathing and Sheriff Kiting */
export function updateEnemyAI(
  enemy: EnemyState,
  playerX: number,
  playerY: number,
  allEnemies: EnemyState[],
  walls: WallRect[],
  doorways: { x: number; y: number }[] | undefined,
  dt: number,
  arenaWidth: number,
  arenaHeight: number
): {
  dropsPuddle?: { x: number; y: number; type?: 'coffee' | 'caution' };
  requestsOfficerBackup?: boolean;
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

  let { moveX, moveY } = computeSmartSteering(enemy, playerX, playerY, walls, doorways);

  switch (enemy.archetype) {
    case 'sheriff': {
      // SHERIFF: Slow summoner with visible line-of-sight searchlight cone!
      const angleToPlayer = Math.atan2(dy, dx);
      // Sheriff faces towards player when observing or moving
      enemy.angle = angleToPlayer;
      const angleDiff = Math.abs(
        Math.atan2(Math.sin(angleToPlayer - enemy.angle), Math.cos(angleToPlayer - enemy.angle))
      );
      const unobstructed = !isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls);
      const inCone = dist < 380 && angleDiff <= Math.PI / 6 && unobstructed;
      enemy.isSpottedInCone = inCone;

      const minDistance = 380;
      if (dist < minDistance || inCone) {
        // Kite away from player towards open space
        moveX = -dirX;
        moveY = -dirY;
        enemy.isKiting = true;
      } else {
        enemy.isKiting = false;
      }

      // Continuous whistle summons backup every 4.0s (accelerated if spotted in cone)
      if (enemy.specialTimer <= 0 || (inCone && enemy.specialTimer > 2.0)) {
        enemy.specialTimer = 4.0;
        requestsOfficerBackup = true;
        dropsPuddle = { x: enemy.x, y: enemy.y, type: 'caution' };
      }
      break;
    }

    case 'officer': {
      // OFFICER: Fast deputy responder summoned by sheriff/city
      enemy.isSirenActive = true;
      break;
    }

    case 'delinquent': {
      // DELINQUENT: Brawler charging with wooden bat
      enemy.batAngle = (enemy.batAngle || 0) + dt * 4;
      if (enemy.deflectSparkTimer && enemy.deflectSparkTimer > 0) {
        enemy.deflectSparkTimer -= dt;
      }
      if (enemy.specialTimer <= 0) {
        if (!enemy.isDashing) {
          enemy.isDashing = true;
          enemy.specialTimer = 0.9;
        } else {
          enemy.isDashing = false;
          enemy.specialTimer = 2.8;
        }
      }
      if (enemy.isDashing) {
        currentSpeed *= 1.8;
      }
      break;
    }

    case 'tomboy': {
      if (enemy.specialTimer <= 0) {
        if (!enemy.isDashing) {
          enemy.isDashing = true;
          enemy.specialTimer = 0.7;
        } else {
          enemy.isDashing = false;
          enemy.specialTimer = 2.4;
        }
      }
      if (enemy.isDashing) {
        currentSpeed *= 2.2;
      }
      break;
    }

    case 'goth': {
      if (enemy.specialTimer <= 0 && dist > 120) {
        enemy.x += dirX * 90;
        enemy.y += dirY * 90;
        enemy.specialTimer = 3.5;
      }
      break;
    }

    case 'gyaru': {
      let cheerCount = 0;
      for (const other of allEnemies) {
        if (other.id !== enemy.id && other.archetype === 'gyaru') {
          const d2 = distanceSq(enemy.x, enemy.y, other.x, other.y);
          if (d2 < 140 * 140) {
            cheerCount++;
            other.speedMultiplier = 1.25;
          }
        }
      }
      if (cheerCount > 0) currentSpeed *= 1.2;

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
      if (enemy.specialTimer <= 0) {
        dropsPuddle = { x: enemy.x, y: enemy.y, type: 'coffee' };
        enemy.specialTimer = 4.2;
      }
      break;
    }

    case 'yandere': {
      enemy.sightTimer = (enemy.sightTimer || 0) + dt;
      currentSpeed *= Math.min(1.7, 1.0 + enemy.sightTimer * 0.08);
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

  return { dropsPuddle, requestsOfficerBackup };
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

/** Computes player stats modified by all active permanent debuffs */
export function computeDebuffedPlayerStats(
  baseSpeed: number,
  baseDamage: number,
  baseSpread: number,
  baseFireInterval: number,
  debuffs: ActiveDebuff[]
): {
  speed: number;
  damageMultiplier: number;
  spreadMultiplier: number;
  fireIntervalMultiplier: number;
  knockbackTakenMultiplier: number;
  isRadarGlitched: boolean;
} {
  let speed = baseSpeed;
  let damageMultiplier = 1.0;
  let spreadMultiplier = 1.0;
  let fireIntervalMultiplier = 1.0;
  let knockbackTakenMultiplier = 1.0;
  let isRadarGlitched = false;

  for (const d of debuffs) {
    if (d.effectType === 'slow') speed *= d.effectValue;
    if (d.effectType === 'damage_penalty') damageMultiplier *= d.effectValue;
    if (d.effectType === 'spread_increase') spreadMultiplier *= d.effectValue;
    if (d.effectType === 'fire_rate') fireIntervalMultiplier /= d.effectValue;
    if (d.effectType === 'knockback_taken') knockbackTakenMultiplier *= d.effectValue;
    if (d.effectType === 'radar_glitch') isRadarGlitched = true;
  }

  return {
    speed,
    damageMultiplier,
    spreadMultiplier,
    fireIntervalMultiplier,
    knockbackTakenMultiplier,
    isRadarGlitched,
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
