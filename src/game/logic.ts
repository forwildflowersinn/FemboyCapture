/**
 * Pure game rules, math, entity updates, map obstacles, smart pathing, and debuffs.
 * Decoupled from React and DOM for 60fps performance and automated unit testing.
 */

import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';

export interface Vector2 {
  x: number;
  y: number;
}

export type MapType = 'forest' | 'home' | 'city' | 'mansion' | 'beach';
export type OutfitMode = 'standard' | 'swimsuit' | 'comfy';

export type PlayerSkinId = 'astolfo' | 'venti' | 'felix' | 'bridget' | 'nagisa';
export type PlayerSkinOption = 'random' | PlayerSkinId;

export const PLAYER_SKIN_IDS: PlayerSkinId[] = ['astolfo', 'venti', 'felix', 'bridget', 'nagisa'];

export function resolvePlayerSkin(option: PlayerSkinOption): PlayerSkinId {
  if (option === 'random') {
    return PLAYER_SKIN_IDS[Math.floor(Math.random() * PLAYER_SKIN_IDS.length)];
  }
  return option;
}

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
  | 'hacker'
  | 'senpai'
  | 'yandere'
  | 'trainer';

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
  skinId?: PlayerSkinId;
  dazeTimer?: number;
  dazedTimer?: number;
  isDazed?: boolean;
  isWeaponSabotaged?: boolean;
  sabotagedByEnemyId?: number;
  sabotagedByShiny?: boolean;
  pinnedByEnemyId?: number;
  shinyLockedByEnemyId?: number;
  shinyKnockoutHookedById?: number;
  slipFallTimer?: number;
  jumpscareTimer?: number;
  starlightInvulnTimer?: number;
  fragileCurseTimer?: number;
  nextLevelExtraChoices?: number;
  nextLevelForcedSingle?: boolean;
  outfitMode?: OutfitMode;
  speechText?: string;
  speechTimer?: number;
  tauntSpeechText?: string;
  tauntSpeechTimer?: number;
  tauntCooldown?: number;
  tauntRingTimer?: number;
  isStunned?: boolean;
  stunTimer?: number;
}

/** Unified check for whether the player is currently impervious to all damage, stuns, dazes, and hound pins */
export function isPlayerImpervious(player: PlayerState, externalDazeTimer: number = 0): boolean {
  return (
    player.invincibleTimer > 0 ||
    (player.starlightInvulnTimer ?? 0) > 0 ||
    (player.dazeTimer ?? 0) > 0 ||
    (player.dazedTimer ?? 0) > 0 ||
    Boolean(player.isDazed) ||
    externalDazeTimer > 0
  );
}

/** Unified check for whether the player is currently dazed and therefore unable to fire weapons */
export function isPlayerDazed(player: PlayerState, externalDazeTimer: number = 0): boolean {
  return (
    Boolean(player.isDazed) ||
    (player.dazedTimer ?? 0) > 0 ||
    (player.dazeTimer ?? 0) > 0 ||
    externalDazeTimer > 0
  );
}

/** Unified check for whether an enemy is a Victor (Haunting Winner) enemy */
export function isVictorEnemy(enemy: EnemyState): boolean {
  return Boolean(
    enemy.isHauntingWinner || enemy.isVictor || enemy.isImmortalVictor || enemy.isImmortalWinner
  );
}

/** True when Shiny Officer Viki is aiming or in her firing follow-through, making her completely impervious to damage */
export function isShinyOfficerImpervious(enemy: EnemyState): boolean {
  return Boolean(
    enemy.archetype === 'officer' &&
      enemy.isShiny &&
      (enemy.isAiming || (enemy.shootRecoveryTimer ?? 0) > 0)
  );
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
  shinyTelegraphTimer?: number;
  shinyTelegraphAngle?: number;
  deflectSparkTimer?: number;
  isSpottedInCone?: boolean;

  // Officer patrol, line of sight, and tactical sidearm
  isAlerted?: boolean;
  patrolAngle?: number;
  patrolTimer?: number;
  shootCooldown?: number;
  isAiming?: boolean;
  aimTelegraphTimer?: number;
  aimAngle?: number;
  shootRecoveryTimer?: number;

  // Barricade assault state
  attackingBreachId?: string;
  attackCooldown?: number;

  // Upgrade mechanics
  paperShieldHits?: number;
  isSliding?: boolean;
  slideTimer?: number;
  stompWaveTimer?: number;
  stompWaveRadius?: number;
  smokeCooldown?: number;
  tetherCooldown?: number;
  strobeCooldown?: number;
  deflectCooldown?: number;
  batHp?: number;
  maxBatHp?: number;
  batBroken?: boolean;

  // Immortal Victor / Haunting Winner state
  isVictor?: boolean;
  isImmortalVictor?: boolean;
  isImmortalWinner?: boolean;
  isHauntingWinner?: boolean;
  postWinWaitTimer?: number;
  immunePopupTimer?: number;
  knockbackStaggerTimer?: number;
  dogLungeTimer?: number;

  // Hacker Natsuki weapon & support item sabotage state
  hackingPickupId?: number;
  hackingMedkitId?: number;
  hackingTargetPickupId?: number;
  hackingTimer?: number;
  hackCooldown?: number;
  isRushingToSabotagedPlayer?: boolean;
  rushingToSabotagedPlayer?: boolean;

  // Goth Raven occult teleport destination telegraph
  teleportTargetX?: number;
  teleportTargetY?: number;
  teleportTelegraphTimer?: number;

  // Trainer Maya large hound & Shiny off-leash hound state
  dogWorldX?: number;
  dogWorldY?: number;
  houndWorldX?: number;
  houndWorldY?: number;
  houndX?: number;
  houndY?: number;
  dogCurrentLead?: number;
  isLeashTaut?: boolean;
  pinStuckTimer?: number;
  pinTotalTimer?: number;
  lastPinDist?: number;
  dogDamageAccum?: number;
  dogKnockoutTimer?: number;
  houndKnockoutTimer?: number;
  houndKOTimer?: number;
  isHoundPinning?: boolean;
  isHoundLunging?: boolean;
  houndFrontStunCooldown?: number;

  // Smart pathing heading inertia commitment
  pathCommitAngle?: number;
  pathCommitTimer?: number;
  dogPathCommitAngle?: number;
  dogPathCommitTimer?: number;

  // Shiny archetype specific states
  dodgeAnimTimer?: number;
  dodgeVisualTimer?: number;
  weaveDodgeTimer?: number;
  dodgeDir?: number;
  dodgeSide?: number;
  hasJumpscaredPlayer?: boolean;
  isJumpscaring?: boolean;
  jealousRageTimer?: number;
  yandereRageTimer?: number;

  // Lived-In World Awareness, Patrol, Idle Actions & Social Banter
  awarenessState?: 'unaware' | 'searching' | 'alerted';
  loseSightTimer?: number;
  searchTimer?: number;
  lastKnownTargetX?: number;
  lastKnownTargetY?: number;
  targetEntity?: 'player' | 'npc_femboy';
  targetNpcId?: number;
  idleBehavior?:
    | 'strolling'
    | 'standing'
    | 'standing_idle'
    | 'stretching'
    | 'checking_phone'
    | 'looking_around'
    | 'fixing_hair'
    | 'socializing';
  idleActionLabel?: string;
  idleTimer?: number;
  idleChatCooldown?: number;
  patrolWaypointX?: number;
  patrolWaypointY?: number;
  socialPartnerId?: number;
  alertPopTimer?: number;
  alertPopType?: '!' | '?';
  strugglingNpcId?: number;
  draggingNpcId?: number;
}

export interface NpcFemboyState {
  id: number;
  skinId: PlayerSkinId;
  name: string;
  outfitMode: OutfitMode;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  radius: number;
  angle: number;
  hp: number;
  maxHp: number;
  invincibleTimer: number;
  dazeTimer: number;
  activeWeaponKey: string;
  ammo: number;
  fireCooldown: number;
  aiMode:
    | 'roaming'
    | 'following_player'
    | 'rescuing_player'
    | 'combat'
    | 'captured_struggle'
    | 'captured_dragged';
  affinityScore: number;
  isLoyalCompanion: boolean;
  capturedByEnemyId?: number;
  struggleProgress: number;
  struggleTimer: number;
  roamTargetX?: number;
  roamTargetY?: number;
  roamTimer: number;
  speechText: string;
  speechTimer: number;
  commentCooldown: number;
  pathCommitAngle?: number;
  pathCommitTimer?: number;
}

export interface EnemyBulletState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  color: string;
  trailColor: string;
  lifetime: number;
  maxLifetime: number;
  isStunDart?: boolean;
  isHeartNeedle?: boolean;
  isReflected?: boolean;
  isReflectedBullet?: boolean;
  isDazeSpark?: boolean;
  isSplinter?: boolean;
  sourceEnemyId?: number;
  ownerId?: number;
  isShinySniper?: boolean;
  isShinyRicochet?: boolean;
  isVolleyball?: boolean;
}

export interface HeartPickup {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bobTimer: number;
  value: number; // Heart Shop Currency value
  color: string;
  scale: number;
}

export type SupportItemType = 'heal' | 'level_mod' | 'invuln' | 'ammo' | 'heart_up';

export interface MedkitPickup {
  id: number;
  x: number;
  y: number;
  bobTimer: number;
  itemType?: SupportItemType;
  isSabotaged?: boolean;
  sabotagedByEnemyId?: number;
  sabotagedByShiny?: boolean;
}

export const SUPPORT_ITEM_META: Record<
  SupportItemType,
  {
    name: string;
    subtitle: string;
    color: string;
    normalEffect: string;
    sabotagedEffect: string;
  }
> = {
  heal: {
    name: 'Sweetheart First-Aid Bento',
    subtitle: 'Restorative Care Pack',
    color: '#4ade80',
    normalEffect: 'Restores +1 Heart HP immediately (+2 HP at Tier 2+, Full Heal at Tier 3).',
    sabotagedEffect: 'Rigged with shock malware! Deals -1 HP damage and stuns for 1.6s.',
  },
  level_mod: {
    name: 'Scented Love Letter Dossier',
    subtitle: 'Fascination Choice Modifier',
    color: '#f472b6',
    normalEffect: 'Next Wanted Level-Up offers +1 extra upgrade choice (stacks up to 6 choices).',
    sabotagedEffect: 'Hacked Dossier! Next Wanted Level-Up is locked down to only 1 forced choice.',
  },
  invuln: {
    name: 'Starlight Idol Halo',
    subtitle: '6s Impervious Aura',
    color: '#fde047',
    normalEffect: 'Grants 6 seconds of shimmering golden invulnerability (+1.5s per shop tier).',
    sabotagedEffect: 'Cursed Vulnerability! For 6 seconds, any pursuer touch immediately triggers a Game Over capture scene!',
  },
  ammo: {
    name: 'Overstuffed Mag Pouch',
    subtitle: '150% Overcharge Supply',
    color: '#38bdf8',
    normalEffect: 'Overfills your equipped weapon to 150% Max Ammo (+25% overcharge per shop tier).',
    sabotagedEffect: 'Spiked Munitions! Shatters your special weapon back to the Pistol (or jams your Pistol for 2.5s).',
  },
  heart_up: {
    name: 'Crystal Heart Locket',
    subtitle: 'Max Heart Vessel',
    color: '#fb7185',
    normalEffect: 'Grants +1 empty Max Heart container (up to 10 Max Hearts; also heals +1 HP at Tier 2+).',
    sabotagedEffect: 'Cracked Vessel! Reduces your Max Hearts by -1 (down to a minimum of 1 Max Heart).',
  },
};

export interface HeartShopState {
  weaponTiers: Record<string, number>;
  supportTiers: Record<SupportItemType, number>;
  healPurchases: number;
  purgePurchases: number;
}

export function createInitialHeartShopState(): HeartShopState {
  return {
    weaponTiers: {
      dual: 0,
      smg: 0,
      shotgun: 0,
      laser: 0,
      launcher: 0,
    },
    supportTiers: {
      heal: 1,
      ammo: 0,
      level_mod: 0,
      heart_up: 0,
      invuln: 0,
    },
    healPurchases: 0,
    purgePurchases: 0,
  };
}

export const WEAPON_BASE_UNLOCK_COSTS: Record<string, number> = {
  dual: 15,
  smg: 20,
  shotgun: 25,
  laser: 35,
  launcher: 45,
};

export const SUPPORT_BASE_UNLOCK_COSTS: Record<SupportItemType, number> = {
  heal: 14,
  ammo: 15,
  level_mod: 22,
  invuln: 30,
  heart_up: 40,
};

export function getWeaponUpgradeCost(weaponKeyOrTier: string | number, currentTierArg?: number): number {
  const weaponKey = typeof weaponKeyOrTier === 'string' ? weaponKeyOrTier : 'shotgun';
  const currentTier = typeof weaponKeyOrTier === 'number' ? weaponKeyOrTier : (currentTierArg ?? 0);
  const baseUnlock = WEAPON_BASE_UNLOCK_COSTS[weaponKey] ?? 25;
  if (currentTier <= 0) return baseUnlock; // Tier 1: Unlock weapon in drop pool + 1 immediate drop
  if (currentTier === 1) return Math.round(baseUnlock * 1.45); // Tier 2: +25% Max Ammo, +15% Damage + 1 immediate drop
  return Math.round(baseUnlock * 1.9); // Tier 3: +50% Max Ammo, +30% Damage + 1 immediate drop
}

export function getSupportUpgradeCost(itemTypeOrTier: SupportItemType | number, currentTierArg?: number): number {
  const itemType: SupportItemType = typeof itemTypeOrTier === 'string' ? itemTypeOrTier : 'heal';
  const currentTier = typeof itemTypeOrTier === 'number' ? itemTypeOrTier : (currentTierArg ?? 0);
  const baseUnlock = SUPPORT_BASE_UNLOCK_COSTS[itemType] ?? 18;
  if (currentTier <= 0) return baseUnlock; // Tier 1: Unlock care drop in pool + 1 immediate drop
  if (currentTier === 1) return Math.round(baseUnlock * 1.45); // Tier 2: Enhanced effect & spawn rate + 1 immediate drop
  return Math.round(baseUnlock * 1.9); // Tier 3: Maximum effect & spawn rate + 1 immediate drop
}

export function getFullHealServiceCost(purchases: number): number {
  return 18 + purchases * 12;
}

export function getPurgeDebuffServiceCost(purchases: number): number {
  return 20 + purchases * 10;
}

export function getEffectiveWeaponStats(
  weaponKey: string,
  weaponTiers?: Record<string, number>
): WeaponDef & { damageMultiplier: number } {
  const def = WEAPON_DEFS[weaponKey] || WEAPON_DEFS.pistol;
  if (def.maxAmmo === -1) {
    return { ...def, maxAmmo: -1, damageMultiplier: 1.0 };
  }
  const tier = Math.max(1, weaponTiers?.[weaponKey] ?? 1);
  const bonusLevels = Math.max(0, tier - 1);
  const damageMultiplier = 1 + bonusLevels * 0.15;
  return {
    ...def,
    damage: Math.round(def.damage * damageMultiplier * 10) / 10,
    maxAmmo: Math.round(def.maxAmmo * (1 + bonusLevels * 0.25)),
    fireInterval: Math.max(0.05, def.fireInterval * (1 - bonusLevels * 0.08)),
    damageMultiplier,
  };
}

export function getUnlockedWeaponsCount(weaponTiers?: Record<string, number>): number {
  if (!weaponTiers) return 0;
  return ['dual', 'smg', 'shotgun', 'laser', 'launcher'].filter((k) => (weaponTiers[k] ?? 0) >= 1).length;
}

export function rollUnlockedWeaponKey(weaponTiers?: Record<string, number>): string | null {
  const allKeys = ['dual', 'smg', 'shotgun', 'laser', 'launcher'];
  if (!weaponTiers) {
    return allKeys[Math.floor(Math.random() * allKeys.length)];
  }
  const unlocked = allKeys.filter((k) => (weaponTiers[k] ?? 0) >= 1);
  if (unlocked.length === 0) return null;
  const weights = unlocked.map((k) => 1.0 + Math.max(0, (weaponTiers[k] ?? 1) - 1) * 0.35);
  const totalW = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * totalW;
  for (let i = 0; i < unlocked.length; i++) {
    r -= weights[i];
    if (r <= 0) return unlocked[i];
  }
  return unlocked[unlocked.length - 1];
}

export function rollSupportItemType(supportTiers?: Record<SupportItemType, number>): SupportItemType {
  if (supportTiers) {
    const allTypes: SupportItemType[] = ['heal', 'ammo', 'level_mod', 'invuln', 'heart_up'];
    const unlocked = allTypes.filter((t) => (supportTiers[t] ?? 0) >= 1);
    if (unlocked.length > 0) {
      const weights = unlocked.map((t) => {
        const baseW = t === 'heal' ? 1.35 : t === 'ammo' ? 1.15 : 1.0;
        const tierMult = 1.0 + Math.max(0, (supportTiers[t] ?? 1) - 1) * 0.4;
        return baseW * tierMult;
      });
      const totalW = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * totalW;
      for (let i = 0; i < unlocked.length; i++) {
        r -= weights[i];
        if (r <= 0) return unlocked[i];
      }
      return unlocked[unlocked.length - 1];
    }
  }
  const r = Math.random();
  if (r < 0.34) return 'heal';
  if (r < 0.56) return 'ammo';
  if (r < 0.72) return 'level_mod';
  if (r < 0.86) return 'invuln';
  return 'heart_up';
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
  baseAngle?: number;
  baseSpeed?: number;
  prevX?: number;
  prevY?: number;
  fromNpcId?: number;
  isNpcBullet?: boolean;
}

export interface WeaponPickupState {
  id: number;
  weaponKey: string;
  x: number;
  y: number;
  radius: number;
  bobTimer: number;
  wasKicked?: boolean;
  isSabotaged?: boolean;
  sabotagedByEnemyId?: number;
  sabotagedByShiny?: boolean;
}

export interface HazardPuddle {
  id: number;
  x: number;
  y: number;
  radius: number;
  duration: number;
  type?: 'coffee' | 'caution' | 'skidmark' | 'spike_strip' | 'smoke' | 'shadow_hand';
  isShinyCoffee?: boolean;
  sourceEnemyId?: number;
  ownerId?: number;
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
    | 'wall'
    | 'rock'
    | 'log'
    | 'fallen_log'
    | 'cabana'
    | 'beach_cabana'
    | 'tiki_bar'
    | 'lifeguard_tower'
    | 'volleyball_net'
    | 'umbrella'
    | 'lifeguard';
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
  outsideX?: number;
  outsideY?: number;
  insideX?: number;
  insideY?: number;
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
  shallowZones?: { x: number; y: number; radius: number }[];
  captureSpot: { x: number; y: number; label: string };
}

/** Computes the current northernmost Y coordinate of the surging ocean tide wave on Sunset Beach */
export function getBeachTideSurgeY(gameTime: number, arenaHeight: number = 2100): number {
  // Base shoreline at arenaHeight - 310 (1790); tide surges up to arenaHeight - 540 (1560) and recedes to 1880
  const waveCycle = Math.sin(gameTime * 0.95) * 0.65 + Math.sin(gameTime * 0.42 + 1.1) * 0.35;
  return arenaHeight - 360 - waveCycle * 185;
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

export const HOME_OFFSET_X = 320;
export const HOME_OFFSET_Y = 320;

/** Rolls a random spawn coordinate strictly in the outside perimeter yards of the Suburban Home */
export function rollHomePerimeterSpawn(radius: number = 18): { x: number; y: number; zone: string } {
  const r = Math.random();
  const pad = Math.max(24, radius + 12);
  if (r < 0.30) {
    // Back Yard (North of House: y 85..335)
    return {
      x: 360 + Math.random() * 1820,
      y: Math.max(pad, 85 + Math.random() * 245),
      zone: 'Back Yard',
    };
  } else if (r < 0.62) {
    // Front Yard (South of House: y 1755..2005)
    return {
      x: 360 + Math.random() * 1820,
      y: 1755 + Math.random() * 245,
      zone: 'Front Yard',
    };
  } else if (r < 0.81) {
    // West Side Path (West of Kitchen/Bathroom: x 85..335)
    return {
      x: Math.max(pad, 85 + Math.random() * 245),
      y: 360 + Math.random() * 1370,
      zone: 'West Side Path',
    };
  } else {
    // East Side Path (East of Living Room/Bedroom: x 2205..2455)
    return {
      x: 2205 + Math.random() * 245,
      y: 360 + Math.random() * 1370,
      zone: 'East Side Path',
    };
  }
}

/** Map Builder for the 4 distinct environments */
export function createMapEnvironment(type: MapType): MapEnvironment {
  switch (type) {
    case 'home': {
      // Expanded 2540 x 2090 Suburban Home with full playable Back Yard, Front Yard, and West/East Side Paths!
      // House footprint is shifted by (+320, +320) so it sits at x: 400..2140, y: 400..1690.
      const width = 2540;
      const height = 2090;
      const ox = HOME_OFFSET_X;
      const oy = HOME_OFFSET_Y;

      // Realistic architectural layout with 4 distinct rooms & central hallway
      // Segmented Exterior Walls with true physical openings for Doors & Windows!
      const rawWalls: WallRect[] = [
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

      const walls: WallRect[] = rawWalls.map((w) => ({
        ...w,
        x: w.x + ox,
        y: w.y + oy,
      }));

      // Visual and Functional Breach Points for Windows and Doors with Barricade mechanics
      // Generous 50px approach/exit clearance on both inside and outside ensures enemies never snag on wall edges!
      const rawBreachPoints: BreachPoint[] = [
        // Exterior Doors (Sturdy reinforced wooden doors, 260 Max HP so they hold up much longer!)
        {
          id: 'front-door',
          label: 'Front Entrance Door',
          x: 860,
          y: 1342,
          w: 90,
          h: 28,
          isDoor: true,
          isBarricaded: true,
          barricadeHp: 260,
          maxBarricadeHp: 260,
          outsideX: 905,
          outsideY: 1418,
          insideX: 905,
          insideY: 1290,
        },
        {
          id: 'patio-door',
          label: 'Back Patio Glass Door',
          x: 1420,
          y: 80,
          w: 110,
          h: 28,
          isDoor: true,
          isBarricaded: true,
          barricadeHp: 260,
          maxBarricadeHp: 260,
          outsideX: 1475,
          outsideY: 28,
          insideX: 1475,
          insideY: 158,
        },

        // Exterior Windows (Reinforced cross-planked windows, 200 Max HP so keeping 4+ barricades up is achievable!)
        {
          id: 'window-kitchen',
          label: 'Kitchen Window',
          x: 80,
          y: 330,
          w: 28,
          h: 90,
          isWindow: true,
          isBarricaded: true,
          barricadeHp: 200,
          maxBarricadeHp: 200,
          outsideX: 28,
          outsideY: 375,
          insideX: 158,
          insideY: 375,
        },
        {
          id: 'window-living',
          label: 'Living Room Window',
          x: 1792,
          y: 390,
          w: 28,
          h: 100,
          isWindow: true,
          isBarricaded: true,
          barricadeHp: 200,
          maxBarricadeHp: 200,
          outsideX: 1872,
          outsideY: 440,
          insideX: 1740,
          insideY: 440,
        },
        {
          id: 'window-bedroom',
          label: 'Master Bedroom Window',
          x: 1792,
          y: 1050,
          w: 28,
          h: 100,
          isWindow: true,
          isBarricaded: true,
          barricadeHp: 200,
          maxBarricadeHp: 200,
          outsideX: 1872,
          outsideY: 1100,
          insideX: 1740,
          insideY: 1100,
        },
        {
          id: 'window-bathroom',
          label: 'Bathroom Privacy Window',
          x: 80,
          y: 970,
          w: 28,
          h: 70,
          isWindow: true,
          isBarricaded: true,
          barricadeHp: 200,
          maxBarricadeHp: 200,
          outsideX: 28,
          outsideY: 1005,
          insideX: 158,
          insideY: 1005,
        },
      ];

      const breachPoints: BreachPoint[] = rawBreachPoints.map((bp) => ({
        ...bp,
        x: bp.x + ox,
        y: bp.y + oy,
        outsideX: (bp.outsideX ?? bp.x + bp.w / 2) + ox,
        outsideY: (bp.outsideY ?? bp.y + bp.h / 2) + oy,
        insideX: (bp.insideX ?? bp.x + bp.w / 2) + ox,
        insideY: (bp.insideY ?? bp.y + bp.h / 2) + oy,
      }));

      // Waypoint doorways & room hub nodes for multi-hop Smart Pathing (strictly aligned with open wall gaps + exterior yards!)
      const rawInteriorNodes = [
        { x: 905, y: 1295 }, // Front door interior foyer entry
        { x: 1475, y: 145 }, // Patio door interior living room entry
        { x: 145, y: 375 }, // Kitchen window interior entry
        { x: 145, y: 1005 }, // Bathroom window interior entry
        { x: 1730, y: 440 }, // Living window interior entry
        { x: 1730, y: 1100 }, // Bedroom window interior entry
        // Kitchen <-> Living Room doorway (wall gap at x: 740..764, y: 388..510)
        { x: 685, y: 449 },
        { x: 752, y: 449 },
        { x: 820, y: 449 },
        // Kitchen <-> Hallway doorway (wall gap at x: 528..640, y: 740..764)
        { x: 584, y: 685 },
        { x: 584, y: 752 },
        { x: 740, y: 820 },
        // Living Room <-> Foyer/Hallway doorway (wall gap at x: 920..1080, y: 740..764)
        { x: 1000, y: 680 },
        { x: 1000, y: 752 },
        { x: 960, y: 830 },
        // Hallway <-> Bedroom doorway (wall gap at x: 1080..1104, y: 884..990)
        { x: 1015, y: 937 },
        { x: 1092, y: 937 },
        { x: 1175, y: 937 },
        // Hallway <-> Bathroom doorway (wall gap at x: 640..664, y: 904..1010)
        { x: 720, y: 957 },
        { x: 652, y: 957 },
        { x: 575, y: 957 },
        // Room navigation hubs around furniture
        { x: 540, y: 270 }, // Kitchen North-East clear space
        { x: 920, y: 540 }, // Living Room West clear space
        { x: 1420, y: 560 }, // Living Room East clear space
        { x: 860, y: 1120 }, // Central Hallway South hub
        { x: 1260, y: 940 }, // Master Bedroom doorway-to-bed hub
        { x: 1260, y: 1080 }, // Master Bedroom West of Bed
        { x: 1510, y: 850 }, // Master Bedroom North of Bed
      ];

      const doorways = [
        ...rawInteriorNodes.map((pt) => ({ x: pt.x + ox, y: pt.y + oy })),
        // Exterior Back Yard (North: y = 180..355), Front Yard (South: y = 1730..1920), & Side Paths (West: x = 180..355, East: x = 2180..2360)
        { x: 1225, y: 1720 }, // Front yard outside Front Door
        { x: 1225, y: 1880 }, // Front yard south walkway
        { x: 750, y: 1740 }, // Front yard SW
        { x: 750, y: 1900 },
        { x: 1700, y: 1740 }, // Front yard SE
        { x: 1700, y: 1900 },
        { x: 1795, y: 350 }, // Back yard outside Patio Door
        { x: 1795, y: 200 }, // Back yard north patio
        { x: 750, y: 350 }, // Back yard NW
        { x: 750, y: 200 },
        { x: 1270, y: 350 }, // Back yard mid
        { x: 1270, y: 200 },
        { x: 350, y: 695 }, // West side path outside Kitchen Window
        { x: 220, y: 695 },
        { x: 350, y: 1010 }, // West side path mid
        { x: 220, y: 1010 },
        { x: 350, y: 1325 }, // West side path outside Bathroom Window
        { x: 220, y: 1325 },
        { x: 2170, y: 760 }, // East side path outside Living Window
        { x: 2320, y: 760 },
        { x: 2170, y: 1080 }, // East side path mid
        { x: 2320, y: 1080 },
        { x: 2170, y: 1420 }, // East side path outside Bedroom Window
        { x: 2320, y: 1420 },
        // Outer Yard Corners so enemies smoothly round the house corners without touching walls
        { x: 330, y: 330 }, // NW inner yard corner
        { x: 220, y: 200 }, // NW outer yard corner
        { x: 2210, y: 330 }, // NE inner yard corner
        { x: 2320, y: 200 }, // NE outer yard corner
        { x: 330, y: 1750 }, // SW inner yard corner
        { x: 220, y: 1900 }, // SW outer yard corner
        { x: 2210, y: 1750 }, // SE inner yard corner
        { x: 2320, y: 1900 }, // SE outer yard corner
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
        captureSpot: { x: 1510 + ox, y: 1035 + oy, label: 'Master Bedroom Heart Bed' },
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
        doorways: [
          { x: 550, y: 740 },
          { x: 1120, y: 740 },
          { x: 1750, y: 740 },
          { x: 2320, y: 740 },
          { x: 2900, y: 740 },
          { x: 1120, y: 1260 },
          { x: 1750, y: 1260 },
          { x: 2320, y: 1260 },
          { x: 550, y: 1780 },
          { x: 1120, y: 1780 },
          { x: 1750, y: 1780 },
          { x: 2320, y: 1780 },
          { x: 2900, y: 1780 },
        ],
        captureSpot: { x: 1750, y: 1265, label: 'Love Hotel VIP Cruiser' },
      };
    }

    case 'mansion': {
      const width = 2400;
      const height = 2000;
      const t = 26;

      const walls: WallRect[] = [
        // Outer Manor Perimeter Walls
        { x: 140, y: 140, w: 2120, h: t, label: 'Manor North Facade', furnitureType: 'wall' },
        { x: 140, y: 1834, w: 920, h: t, label: 'Manor South West Wing', furnitureType: 'wall' },
        { x: 1340, y: 1834, w: 920, h: t, label: 'Manor South East Wing', furnitureType: 'wall' },
        { x: 140, y: 140, w: t, h: 1720, label: 'Manor West Wall', furnitureType: 'wall' },
        { x: 2234, y: 140, w: t, h: 1720, label: 'Manor East Wall', furnitureType: 'wall' },

        // West Wing (Gothic Library & Parlor) Divider (x = 820) with 2 wide archways
        { x: 820, y: 140, w: t, h: 360, label: 'Library Arch North', furnitureType: 'wall' },
        { x: 820, y: 700, w: t, h: 440, label: 'Grand Foyer Pillar West', furnitureType: 'wall' },
        { x: 820, y: 1340, w: t, h: 520, label: 'Parlor Arch South', furnitureType: 'wall' },

        // East Wing (Banquet Hall & Conservatory) Divider (x = 1560) with 2 wide archways
        { x: 1560, y: 140, w: t, h: 360, label: 'Banquet Arch North', furnitureType: 'wall' },
        { x: 1560, y: 700, w: t, h: 440, label: 'Grand Foyer Pillar East', furnitureType: 'wall' },
        { x: 1560, y: 1340, w: t, h: 520, label: 'Conservatory Arch South', furnitureType: 'wall' },

        // Horizontal Wing Dividers (y = 980) with open corridors
        { x: 140, y: 980, w: 280, h: t, label: 'West Wing Partition A', furnitureType: 'wall' },
        { x: 600, y: 980, w: 246, h: t, label: 'West Wing Partition B', furnitureType: 'wall' },
        { x: 1560, y: 980, w: 240, h: t, label: 'East Wing Partition A', furnitureType: 'wall' },
        { x: 1980, y: 980, w: 280, h: t, label: 'East Wing Partition B', furnitureType: 'wall' },

        // Antique Gothic Furniture Obstacles
        { x: 340, y: 360, w: 240, h: 75, label: 'Mahogany Bookcase Row', furnitureType: 'wardrobe' },
        { x: 360, y: 660, w: 190, h: 90, label: 'Reading Desk', furnitureType: 'table' },
        { x: 1100, y: 380, w: 200, h: 110, label: 'Grand Pipe Organ Altar', furnitureType: 'vanity' },
        { x: 1800, y: 400, w: 260, h: 120, label: 'Royal Banquet Table', furnitureType: 'table' },
        { x: 340, y: 1340, w: 220, h: 95, label: 'Velvet Divan Couch', furnitureType: 'sofa' },
        { x: 1820, y: 1340, w: 210, h: 110, label: 'Four-Poster Canopy Bed', furnitureType: 'bed' },
      ];

      const doorways = [
        { x: 760, y: 600 },
        { x: 833, y: 600 },
        { x: 910, y: 600 },
        { x: 760, y: 1240 },
        { x: 833, y: 1240 },
        { x: 910, y: 1240 },
        { x: 1495, y: 600 },
        { x: 1573, y: 600 },
        { x: 1645, y: 600 },
        { x: 1495, y: 1240 },
        { x: 1573, y: 1240 },
        { x: 1645, y: 1240 },
        { x: 510, y: 920 },
        { x: 510, y: 993 },
        { x: 510, y: 1065 },
        { x: 1890, y: 920 },
        { x: 1890, y: 993 },
        { x: 1890, y: 1065 },
        { x: 1200, y: 720 },
        { x: 1200, y: 980 },
        { x: 1200, y: 1280 },
        { x: 1200, y: 1750 },
        { x: 1200, y: 1845 },
        { x: 300, y: 540 },
        { x: 640, y: 540 },
        { x: 300, y: 1200 },
        { x: 640, y: 1200 },
        { x: 1720, y: 580 },
        { x: 2100, y: 580 },
        { x: 1720, y: 1220 },
        { x: 2100, y: 1220 },
        // Exterior perimeter nodes so any enemy outside the manor walls routes cleanly to the Grand South Entrance (x: 1060..1340, y: 1834)
        { x: 80, y: 80 },
        { x: 700, y: 80 },
        { x: 1200, y: 80 },
        { x: 1700, y: 80 },
        { x: 2320, y: 80 },
        { x: 80, y: 650 },
        { x: 80, y: 1300 },
        { x: 2320, y: 650 },
        { x: 2320, y: 1300 },
        { x: 80, y: 1930 },
        { x: 580, y: 1930 },
        { x: 1080, y: 1920 },
        { x: 1200, y: 1925 },
        { x: 1320, y: 1920 },
        { x: 1820, y: 1930 },
        { x: 2320, y: 1930 },
      ];

      return {
        id: 'mansion',
        width,
        height,
        walls,
        bushes: [],
        trees: [],
        breachPoints: [],
        carLanes: [],
        doorways,
        captureSpot: { x: 1200, y: 1020, label: 'Velvet Canopy Altar' },
      };
    }

    case 'beach': {
      // SUNSET BEACH RESORT & TIDAL COASTLINE (3000 x 2100)
      // All women wear custom beach swimsuits! Features surging ocean tide waves, shallow tidal lagoons, and beach volleyballs!
      const width = 3000;
      const height = 2100;

      const walls: WallRect[] = [
        // Luxury Teak Beach Cabanas along the upper resort promenade
        { x: 380, y: 260, w: 220, h: 110, label: 'West Sunset Cabana', furnitureType: 'cabana' },
        { x: 1390, y: 220, w: 220, h: 110, label: 'Royal VIP Cabana', furnitureType: 'cabana' },
        { x: 2380, y: 260, w: 220, h: 110, label: 'East Sunset Cabana', furnitureType: 'cabana' },

        // Lifeguard Towers overlooking the surf
        { x: 780, y: 1180, w: 110, h: 110, label: 'West Lifeguard Tower', furnitureType: 'lifeguard' },
        { x: 2120, y: 1180, w: 110, h: 110, label: 'East Lifeguard Tower', furnitureType: 'lifeguard' },

        // Striped Beach Umbrellas & Sun Lounger Clusters
        { x: 960, y: 540, w: 95, h: 95, label: 'Coral Sun Umbrella', furnitureType: 'umbrella' },
        { x: 1940, y: 540, w: 95, h: 95, label: 'Aqua Sun Umbrella', furnitureType: 'umbrella' },
        { x: 1180, y: 1320, w: 95, h: 95, label: 'Hibiscus Sun Umbrella', furnitureType: 'umbrella' },
        { x: 1720, y: 1320, w: 95, h: 95, label: 'Gold Sun Umbrella', furnitureType: 'umbrella' },

        // Volcanic Coastal Tide-Pool Rocks & Bleached Driftwood Logs
        { x: 460, y: 840, w: 165, h: 90, label: 'Basalt Sea Crag West', furnitureType: 'rock' },
        { x: 2360, y: 860, w: 170, h: 95, label: 'Basalt Sea Crag East', furnitureType: 'rock' },
        { x: 520, y: 1480, w: 210, h: 52, label: 'Sun-Bleached Driftwood', furnitureType: 'log' },
        { x: 2260, y: 1480, w: 210, h: 52, label: 'Tidal Driftwood Log', furnitureType: 'log' },
      ];

      // Shallow turquoise tidal lagoons on the beach that gently slow movement and splash water
      const shallowZones = [
        { x: 680, y: 980, radius: 135 },
        { x: 2240, y: 1020, radius: 145 },
        { x: 1500, y: 1460, radius: 160 },
        { x: 940, y: 1620, radius: 140 },
        { x: 2060, y: 1620, radius: 140 },
      ];

      // Bouncing Beach Volleyball lanes across the sand courts
      const carLanes: { y: number; dir: 1 | -1; speed: number }[] = [
        { y: 720, dir: 1, speed: 340 },
        { y: 1080, dir: -1, speed: 360 },
      ];

      const doorways = [
        { x: 700, y: 420 },
        { x: 1500, y: 440 },
        { x: 2250, y: 420 },
        { x: 840, y: 920 },
        { x: 1500, y: 920 },
        { x: 2140, y: 920 },
        { x: 960, y: 1420 },
        { x: 1500, y: 1220 },
        { x: 2040, y: 1420 },
      ];

      return {
        id: 'beach',
        width,
        height,
        walls,
        bushes: [],
        trees: [],
        breachPoints: [],
        carLanes,
        doorways,
        shallowZones,
        captureSpot: { x: 1500, y: 920, label: 'Sunset Beach VIP Cabana Daybed' },
      };
    }

    case 'forest':
    default: {
      // UNTAMED DEEP WILDERNESS (2600 x 2200)
      // Complete wilderness overhaul: NO paved roads or symmetrical masonry walls!
      // Instead features jagged mossy granite crags, fallen giant redwood logs, a winding mountain creek with shallow fords,
      // wild bramble thickets, bioluminescent mushroom rings, and dense primeval canopy boughs!
      const width = 2600;
      const height = 2200;

      const walls: WallRect[] = [
        // Jagged Mossy Granite Boulders & Crags
        { x: 640, y: 560, w: 175, h: 115, label: 'Mossy Granite Crag NW', furnitureType: 'rock' },
        { x: 1680, y: 520, w: 190, h: 120, label: 'Elderstone Outcrop NE', furnitureType: 'rock' },
        { x: 580, y: 1340, w: 185, h: 125, label: 'Lichen Boulder Ridge SW', furnitureType: 'rock' },
        { x: 1820, y: 1380, w: 180, h: 115, label: 'Shadow Crag Monolith SE', furnitureType: 'rock' },

        // Fallen Giant Hollowed Redwood Logs
        { x: 940, y: 740, w: 250, h: 52, label: 'Fallen Ancient Redwood North', furnitureType: 'log' },
        { x: 1390, y: 1240, w: 260, h: 54, label: 'Hollowed Cedar Trunk South', furnitureType: 'log' },
        { x: 860, y: 1120, w: 54, h: 210, label: 'Uprooted Pine Timber West', furnitureType: 'log' },
        { x: 1690, y: 860, w: 54, h: 220, label: 'Moss-Covered Deadfall East', furnitureType: 'log' },
      ];

      // Wild Bramble & Fern Thickets (slow movement)
      const bushes: BushCircle[] = [
        { x: 440, y: 420, radius: 74 },
        { x: 860, y: 460, radius: 82 },
        { x: 1280, y: 360, radius: 86 },
        { x: 1960, y: 480, radius: 78 },
        { x: 460, y: 1520, radius: 88 },
        { x: 1140, y: 1680, radius: 92 },
        { x: 2040, y: 1540, radius: 84 },
        { x: 1460, y: 840, radius: 68 },
        { x: 320, y: 980, radius: 78 },
        { x: 1040, y: 1360, radius: 76 },
        { x: 2220, y: 960, radius: 84 },
        { x: 1640, y: 1820, radius: 86 },
        { x: 780, y: 1900, radius: 78 },
        { x: 2120, y: 360, radius: 74 },
      ];

      // Winding Mountain Creek Shallow Fords (gently splash & slow movement outside the fallen-log bridges)
      const shallowZones = [
        { x: 380, y: 1740, radius: 115 },
        { x: 740, y: 1480, radius: 110 },
        { x: 1540, y: 780, radius: 110 },
        { x: 1980, y: 420, radius: 120 },
      ];

      // 32 Dense Multi-Layered Old-Growth Redwood & Pine Canopies
      const trees: TreeCanopy[] = [
        // Northwest Primeval Timberline
        { x: 220, y: 210, trunkRadius: 30, canopyRadius: 165 },
        { x: 440, y: 280, trunkRadius: 28, canopyRadius: 155 },
        { x: 280, y: 540, trunkRadius: 32, canopyRadius: 170 },
        { x: 640, y: 240, trunkRadius: 28, canopyRadius: 155 },
        { x: 920, y: 310, trunkRadius: 30, canopyRadius: 165 },
        // Northern Deep Woods
        { x: 1140, y: 210, trunkRadius: 30, canopyRadius: 160 },
        { x: 1460, y: 250, trunkRadius: 34, canopyRadius: 175 },
        { x: 1740, y: 310, trunkRadius: 30, canopyRadius: 165 },
        { x: 1980, y: 220, trunkRadius: 28, canopyRadius: 155 },
        { x: 2280, y: 290, trunkRadius: 34, canopyRadius: 180 },
        { x: 2380, y: 560, trunkRadius: 30, canopyRadius: 165 },
        // Mid-West Ravine & Creek Bank
        { x: 220, y: 840, trunkRadius: 32, canopyRadius: 168 },
        { x: 490, y: 780, trunkRadius: 28, canopyRadius: 155 },
        { x: 440, y: 1140, trunkRadius: 32, canopyRadius: 168 },
        { x: 210, y: 1280, trunkRadius: 28, canopyRadius: 155 },
        { x: 1140, y: 920, trunkRadius: 26, canopyRadius: 148 },
        // Mid-East Ridge & Hollow
        { x: 1580, y: 660, trunkRadius: 28, canopyRadius: 155 },
        { x: 2020, y: 760, trunkRadius: 32, canopyRadius: 172 },
        { x: 2340, y: 920, trunkRadius: 30, canopyRadius: 165 },
        { x: 1960, y: 1140, trunkRadius: 28, canopyRadius: 158 },
        { x: 2360, y: 1280, trunkRadius: 32, canopyRadius: 172 },
        // Southwest Old-Growth Grove
        { x: 310, y: 1600, trunkRadius: 30, canopyRadius: 168 },
        { x: 390, y: 1920, trunkRadius: 34, canopyRadius: 175 },
        { x: 760, y: 1680, trunkRadius: 28, canopyRadius: 158 },
        { x: 1020, y: 1940, trunkRadius: 30, canopyRadius: 165 },
        // Southeast Wilderness Thicket
        { x: 1380, y: 1580, trunkRadius: 28, canopyRadius: 158 },
        { x: 1760, y: 1600, trunkRadius: 30, canopyRadius: 168 },
        { x: 2160, y: 1780, trunkRadius: 34, canopyRadius: 178 },
        { x: 2380, y: 1960, trunkRadius: 32, canopyRadius: 170 },
        { x: 1320, y: 1980, trunkRadius: 30, canopyRadius: 165 },
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
        shallowZones,
        doorways: [
          { x: 860, y: 660 },
          { x: 1260, y: 660 },
          { x: 1280, y: 1020 },
          { x: 780, y: 1040 },
          { x: 1020, y: 1040 },
          { x: 1320, y: 1360 },
          { x: 1720, y: 1340 },
          { x: 1820, y: 1020 },
          { x: 1580, y: 1020 },
        ],
        captureSpot: { x: 1280, y: 1020, label: 'Deep Wilderness Mossy Hollow' },
      };
    }
  }
}

/**
 * Ensures weapon pickups never spawn inside or get kicked into solid walls, furniture, or tree trunks.
 */
export function findSafePickupPosition(
  env: MapEnvironment,
  rawX: number,
  rawY: number,
  radius: number = 24
): { x: number; y: number } {
  if (!env || !env.walls) {
    return { x: rawX, y: rawY };
  }
  const minX = env.id === 'home' ? 140 : 140;
  const maxX = env.id === 'home' ? env.width - 140 : env.width - 140;
  const minY = env.id === 'home' ? 140 : 140;
  const maxY = env.id === 'home' ? env.height - 140 : env.height - 140;

  let x = Math.max(minX, Math.min(maxX, rawX));
  let y = Math.max(minY, Math.min(maxY, rawY));
  const padRadius = radius + 14;

  for (let attempt = 0; attempt < 12; attempt++) {
    let anyOverlap = false;

    for (const w of env.walls || []) {
      const res = resolveCircleBoxCollision(x, y, padRadius, w.x, w.y, w.w, w.h);
      if (res.collided) {
        anyOverlap = true;
        x = res.x;
        y = res.y;
        // If still inside a thick building block, push outside its nearest edge
        if (checkCircleBoxOverlap(x, y, padRadius, w.x, w.y, w.w, w.h)) {
          const dLeft = Math.abs(x - w.x);
          const dRight = Math.abs(w.x + w.w - x);
          const dTop = Math.abs(y - w.y);
          const dBottom = Math.abs(w.y + w.h - y);
          const minD = Math.min(dLeft, dRight, dTop, dBottom);
          if (minD === dLeft) x = w.x - padRadius - 6;
          else if (minD === dRight) x = w.x + w.w + padRadius + 6;
          else if (minD === dTop) y = w.y - padRadius - 6;
          else y = w.y + w.h + padRadius + 6;
        }
      }
    }

    for (const t of env.trees || []) {
      const dx = x - t.x;
      const dy = y - t.y;
      const dist = Math.hypot(dx, dy) || 1;
      const minDist = t.trunkRadius + padRadius + 8;
      if (dist < minDist) {
        anyOverlap = true;
        x = t.x + (dx / dist) * minDist;
        y = t.y + (dy / dist) * minDist;
      }
    }

    x = Math.max(minX, Math.min(maxX, x));
    y = Math.max(minY, Math.min(maxY, y));

    if (!anyOverlap) break;
  }

  return { x, y };
}

/** Maximum active mobs to prevent overwhelming swarms while enhancing enemy quality */
export function getMaxMobCap(mapId: MapType): number {
  switch (mapId) {
    case 'home':
      return 10;
    case 'mansion':
      return 13;
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

/** Enemy eliminations required per Wanted Level - smooth, accessible progression */
export function getKillsForNextWantedLevel(level: number): number {
  return 5 + Math.max(0, level - 1) * 3;
}

/** Alias kept for compatibility with existing callers */
export function getExpForLevel(level: number): number {
  return getKillsForNextWantedLevel(level);
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

/** Thematic Enemy Upgrades inspired by pursuers' obsession & formidable tactics */
export const ENEMY_UPGRADE_POOL: EnemyUpgrade[] = [
  // Officer Viki
  {
    id: 'officer_lockdown',
    archetype: 'officer',
    title: 'Precinct Warrant',
    desireNote: 'She signed a county-wide warrant to bring you in safely.',
    effectDescription: 'Officers gain +35% Max HP and +20% movement speed.',
    statModifierKey: 'officer_lockdown',
    icon: 'Shield',
  },
  {
    id: 'officer_stundart',
    archetype: 'officer',
    title: 'High-Voltage Stun Darts',
    desireNote: 'Modified sidearm capacitors charge faster and shoot electrified darts.',
    effectDescription: 'Officers aim and fire stun darts 30% faster with 40% higher projectile velocity.',
    statModifierKey: 'officer_stundart',
    icon: 'Zap',
  },
  {
    id: 'officer_squad_radios',
    archetype: 'officer',
    title: 'Precinct Tactical Radio',
    desireNote: 'Instant relay across all squad frequencies coordinates rapid surrounds.',
    effectDescription: 'When one Officer engages or aims, all other Officers within 500px are instantly alerted.',
    statModifierKey: 'officer_squad_radios',
    icon: 'Radio',
  },
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
    title: 'High-Beam Patrol Scanner',
    desireNote: 'She sweeps every alleyway determined not to lose your trail.',
    effectDescription: 'Officer line-of-sight and sound detection range is 50% larger.',
    statModifierKey: 'officer_highbeam',
    icon: 'Eye',
  },
  {
    id: 'officer_spike_strip',
    archetype: 'officer',
    title: 'Tactical Spike Strips',
    desireNote: 'Viki drops precinct road spikes to keep you from sprinting away.',
    effectDescription: 'Officers deploy roadside spike strips that puncture your sprint, slowing you by 35%.',
    statModifierKey: 'officer_spike_strip',
    icon: 'AlertTriangle',
  },

  // Delinquent Ryuko
  {
    id: 'delinquent_reinforced_shinai',
    archetype: 'delinquent',
    title: 'Hardened Oak Bat',
    desireNote: 'Ryuko swings her bat with fierce passion to sweep you into her gang.',
    effectDescription: 'Bat deflection arc widens to 130° and deflects shots outward more frequently as dazing stun sparks.',
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
  {
    id: 'delinquent_smoke_bomb',
    archetype: 'delinquent',
    title: 'Brawler Smoke Bomb',
    desireNote: 'Ryuko smashes a street smoke canister to obscure her gang’s flanking moves.',
    effectDescription: 'Ryuko drops an obscuring smoke cloud that conceals pursuers from your radar.',
    statModifierKey: 'delinquent_smoke_bomb',
    icon: 'Cloud',
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
    title: 'Team Spirit Drill',
    desireNote: 'Roxie rallies the entire pursuit squad like a varsity team captain!',
    effectDescription: 'Roxie’s energetic rally grants ALL active pursuers a +20% sprint burst whenever you fire.',
    statModifierKey: 'tomboy_competitive_spirit',
    icon: 'Flame',
  },
  {
    id: 'tomboy_slide_tackle',
    archetype: 'tomboy',
    title: 'Varsity Slide Tackle',
    desireNote: 'She ducks low under your shots with an aggressive turf slide!',
    effectDescription: 'Roxie periodically slides low under bullet fire, rapidly closing the gap on you.',
    statModifierKey: 'tomboy_slide_tackle',
    icon: 'FastForward',
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
  {
    id: 'goth_spectral_chains',
    archetype: 'goth',
    title: 'Occult Shadow Tether',
    desireNote: 'Spectral hands reach out from the dark floor yearning to embrace you.',
    effectDescription: 'Raven periodically summons dark floor hands that gently pull you toward her.',
    statModifierKey: 'goth_spectral_chains',
    icon: 'Link',
  },

  // Hacker Natsuki
  {
    id: 'hacker_ring_light',
    archetype: 'hacker',
    title: 'Zero-Day Exploit Script',
    desireNote: 'She wants to stream an all-night co-op marathon with you and won’t take no for an answer!',
    effectDescription: 'Natsuki hacks supply crates 35% faster and moves +18% faster while closing in on you.',
    statModifierKey: 'hacker_ring_light',
    icon: 'Zap',
  },
  {
    id: 'hacker_hype_squad',
    archetype: 'hacker',
    title: 'Discord Server Raid Ping',
    desireNote: 'Natsuki @everyone pings every pursuer on the server with your live coordinates.',
    effectDescription: 'Her overclocked Wi-Fi aura grants all surrounding pursuers within 180px +25% sprint speed and +20% HP.',
    statModifierKey: 'hacker_hype_squad',
    icon: 'Bell',
  },
  {
    id: 'hacker_platform_stomp',
    archetype: 'hacker',
    title: 'Overclocked Rig Pulse',
    desireNote: 'Her portable gaming laptop fans spin up to max RPM with an RGB speed surge.',
    effectDescription: 'Natsuki’s rig emits emerald overclock rings every 3s that surge her movement & hacking speed by +25%.',
    statModifierKey: 'hacker_platform_stomp',
    icon: 'Sparkles',
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
    id: 'senpai_term_paper_barrier',
    archetype: 'senpai',
    title: 'Executive Poise Binder',
    desireNote: 'Senpai clutches her thick executive dossier and refuses to be pushed back.',
    effectDescription: 'Senpai gains +35% Max HP and resists 40% of bullet knockback.',
    statModifierKey: 'senpai_term_paper_barrier',
    icon: 'BookOpen',
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
    id: 'yandere_heart_barrage',
    archetype: 'yandere',
    title: 'Heart Dart Volley',
    desireNote: 'Aimi flings a fan of custom heart-shaped throwing daggers!',
    effectDescription: 'Ayame periodically flings a 3-dagger fan of crimson needles that deal light damage.',
    statModifierKey: 'yandere_heart_barrage',
    icon: 'HeartHandshake',
  },

  // Trainer Maya & Rex
  {
    id: 'trainer_agility_command',
    archetype: 'trainer',
    title: 'Championship Agility Lead',
    desireNote: 'Maya unclips Rex’s slack lead so he can bound across the course straight into your arms.',
    effectDescription: 'Rex’s pounce lunge cooldown is reduced by 30% and lunge speed increases by +25%.',
    statModifierKey: 'trainer_agility_command',
    icon: 'Sparkles',
  },
  {
    id: 'trainer_scent_hound',
    archetype: 'trainer',
    title: 'Bloodhound Scent Lock',
    desireNote: 'Once Rex catches your sweet scent, there is no hiding behind trees or corners.',
    effectDescription: 'Trainer Maya gains +30% Max HP and +15% tracking speed when within 380px of you.',
    statModifierKey: 'trainer_scent_hound',
    icon: 'Eye',
  },
  {
    id: 'trainer_double_lead',
    archetype: 'trainer',
    title: 'Handler Whistle Rally',
    desireNote: 'Maya’s upbeat training whistle gets every pursuer on the course fired up!',
    effectDescription: 'Whenever Rex lunges, nearby pursuers within 200px gain a +18% sprint boost.',
    statModifierKey: 'trainer_double_lead',
    icon: 'Bell',
  },
];

/** Stage-specific thematic archetypes for upgrade choice lean and spawn weighting */
export const MAP_THEMATIC_ARCHETYPES: Record<
  MapType,
  { primary: ArchetypeId[]; secondary: ArchetypeId[] }
> = {
  forest: {
    primary: ['trainer', 'tomboy', 'officer', 'goth'],
    secondary: ['yandere', 'hacker', 'delinquent', 'senpai'],
  },
  home: {
    primary: ['yandere', 'hacker', 'delinquent', 'senpai'],
    secondary: ['trainer', 'tomboy', 'goth'],
  },
  city: {
    primary: ['officer', 'delinquent', 'senpai', 'hacker'],
    secondary: ['trainer', 'tomboy', 'goth', 'yandere'],
  },
  mansion: {
    primary: ['goth', 'yandere', 'senpai', 'hacker'],
    secondary: ['trainer', 'delinquent', 'tomboy'],
  },
  beach: {
    primary: ['tomboy', 'trainer', 'delinquent', 'hacker'],
    secondary: ['officer', 'yandere', 'senpai', 'goth'],
  },
};

export function rollEnemyUpgrades(
  activeUpgradeIds: string[],
  count: number = 3,
  mapId?: MapType
): EnemyUpgrade[] {
  const safeCount = Math.max(1, Math.min(6, count));
  const activeSet = new Set(activeUpgradeIds);
  const available = ENEMY_UPGRADE_POOL.filter((u) => !activeSet.has(u.id));
  const poolToSample = available.length >= safeCount ? [...available] : [...ENEMY_UPGRADE_POOL];

  const theme = mapId ? MAP_THEMATIC_ARCHETYPES[mapId] : undefined;
  const chosen: EnemyUpgrade[] = [];

  while (chosen.length < safeCount && poolToSample.length > 0) {
    const weights = poolToSample.map((upg) => {
      if (!theme) return 1.0;
      if (theme.primary.includes(upg.archetype)) return 2.15; // Slight thematic lean for the level being played!
      if (theme.secondary.includes(upg.archetype)) return 1.0;
      return 0.65;
    });
    const totalW = weights.reduce((acc, w) => acc + w, 0);
    let r = Math.random() * totalW;
    let pickedIdx = poolToSample.length - 1;
    for (let i = 0; i < poolToSample.length; i++) {
      r -= weights[i];
      if (r <= 0) {
        pickedIdx = i;
        break;
      }
    }
    chosen.push(poolToSample[pickedIdx]);
    poolToSample.splice(pickedIdx, 1);
  }

  return chosen;
}

/** Active archetypes progression with authentic map themes & tuned stage pacing */
export function getActiveArchetypes(
  survivalTime: number,
  mapId?: MapType,
  _activeUpgrades: string[] = []
): ArchetypeId[] {
  // In Downtown City: urban beat cops, street punks, cyber-cafe hackers, and corporate senpais lead the chase!
  if (mapId === 'city') {
    if (survivalTime < 28) return ['officer', 'delinquent', 'hacker', 'senpai'];
    if (survivalTime < 65) return ['officer', 'delinquent', 'hacker', 'senpai', 'trainer', 'tomboy'];
    if (survivalTime < 110) return ['officer', 'delinquent', 'hacker', 'senpai', 'trainer', 'tomboy', 'goth'];
    return ['officer', 'delinquent', 'hacker', 'senpai', 'trainer', 'tomboy', 'goth', 'yandere'];
  }

  // In Suburban Home: obsessive stalkers, room-camping NEET hackers, window-smashing delinquents, and strict house-visitors! (Officers only arrive if summoned)
  if (mapId === 'home') {
    if (survivalTime < 28) return ['yandere', 'delinquent', 'hacker'];
    if (survivalTime < 65) return ['yandere', 'delinquent', 'hacker', 'senpai', 'trainer'];
    return ['yandere', 'delinquent', 'hacker', 'senpai', 'trainer', 'tomboy', 'goth'];
  }

  // In Crimson Manor: Gothic shadow-phasers, obsessive admirers, manor governesses, and late-night hackers!
  if (mapId === 'mansion') {
    if (survivalTime < 28) return ['goth', 'yandere', 'senpai'];
    if (survivalTime < 65) return ['goth', 'yandere', 'senpai', 'hacker', 'trainer'];
    return ['goth', 'yandere', 'senpai', 'hacker', 'trainer', 'delinquent', 'tomboy'];
  }

  // In Sunset Beach: Beach volleyball tomboys, coastal K-9 trainers, summer-skipping delinquents, and beach-stream hackers!
  if (mapId === 'beach') {
    if (survivalTime < 28) return ['tomboy', 'trainer', 'delinquent', 'officer'];
    if (survivalTime < 65) return ['tomboy', 'trainer', 'delinquent', 'officer', 'hacker', 'senpai'];
    return ['tomboy', 'trainer', 'delinquent', 'officer', 'hacker', 'senpai', 'yandere', 'goth'];
  }

  // In Whispering Woods (forest): K-9 Dog Trainer & Hound Rex, athletic trail runners, park rangers, and woodland occultists!
  if (survivalTime < 28) {
    return ['trainer', 'tomboy', 'officer'];
  }
  if (survivalTime < 65) {
    return ['trainer', 'tomboy', 'officer', 'goth', 'hacker'];
  }
  if (survivalTime < 110) {
    return ['trainer', 'tomboy', 'officer', 'goth', 'hacker', 'yandere', 'delinquent'];
  }
  return ['trainer', 'tomboy', 'officer', 'goth', 'hacker', 'yandere', 'delinquent', 'senpai'];
}

/**
 * Selects an enemy archetype from the active pool, weighting likelihood higher for
 * stage-signature archetypes AND any archetype whose Level-Up Upgrades have been chosen!
 */
export function rollWeightedArchetype(
  activePool: ArchetypeId[],
  activeUpgrades: string[] = [],
  mapId?: MapType
): ArchetypeId {
  // Also include any archetype that the player has explicitly chosen an upgrade for!
  const poolSet = new Set<ArchetypeId>(activePool);
  for (const upg of ENEMY_UPGRADE_POOL) {
    if (activeUpgrades.includes(upg.id)) {
      poolSet.add(upg.archetype);
    }
  }
  const pool = Array.from(poolSet);
  if (pool.length === 0) return 'officer';

  const theme = mapId ? MAP_THEMATIC_ARCHETYPES[mapId] : undefined;

  const weights = pool.map((arch) => {
    const upgradeCount = ENEMY_UPGRADE_POOL.filter(
      (u) => u.archetype === arch && activeUpgrades.includes(u.id)
    ).length;
    const stageLean = theme && theme.primary.includes(arch) ? 1.42 : 1.0;
    // Each chosen upgrade increases that enemy's spawn weight by +95%, combined with stage thematic lean
    return stageLean * (1.0 + upgradeCount * 0.95);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let roll = Math.random() * totalWeight;
  for (let i = 0; i < pool.length; i++) {
    roll -= weights[i];
    if (roll <= 0) {
      return pool[i];
    }
  }
  return pool[pool.length - 1];
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
  // Smoother, slightly slower speed scaling so late-game enemies stay intense but manageable
  const speedScale = 1.0 + Math.min(survivalTime * 0.0011, 0.20);
  let hp = 30;
  let radius = 18;
  let baseSpeed = 132;

  switch (archetype) {
    case 'sheriff':
      hp = 50;
      radius = 19;
      baseSpeed = 96 * speedScale;
      break;
    case 'officer':
      hp = 38;
      radius = 18;
      baseSpeed = 158 * speedScale;
      if (activeUpgrades.includes('officer_lockdown')) {
        hp = Math.round(hp * 1.35);
        baseSpeed = Math.round(baseSpeed * 1.14);
      }
      if (activeUpgrades.includes('officer_riot_poise')) hp += 12;
      break;
    case 'delinquent':
      hp = 50;
      radius = 19;
      baseSpeed = 132 * speedScale;
      if (activeUpgrades.includes('delinquent_unflinching_pride')) hp += 18;
      break;
    case 'tomboy':
      hp = 34;
      radius = 18;
      baseSpeed = 138 * speedScale;
      break;
    case 'goth':
      hp = 30;
      radius = 17;
      baseSpeed = 116 * speedScale;
      break;
    case 'hacker':
      hp = 30;
      radius = 17;
      baseSpeed = 144 * speedScale;
      break;
    case 'senpai':
      hp = 58;
      radius = 20;
      baseSpeed = 102 * speedScale;
      if (activeUpgrades.includes('senpai_corporate_tenacity') || activeUpgrades.includes('senpai_term_paper_barrier')) {
        hp = Math.round(hp * 1.35);
      }
      break;
    case 'yandere':
      hp = 42;
      radius = 18;
      baseSpeed = 150 * speedScale;
      break;
    case 'trainer':
      hp = 40;
      radius = 18;
      baseSpeed = 142 * speedScale;
      if (activeUpgrades.includes('trainer_scent_hound')) {
        hp = Math.round(hp * 1.3);
      }
      break;
  }

  // Golden Mini-Boss Shinies: 3.5x HP, +16% base speed, slightly larger radius
  if (isShiny) {
    hp = Math.round(hp * 3.5);
    baseSpeed = Math.round(baseSpeed * 1.16);
    radius += 3;
  }

  return { hp, radius, baseSpeed };
}

/** Check if direct line to target is blocked by any wall (with endpoint trimming so standing near an obstacle never falsely blocks the endpoint!) */
export function isLineBlockedByWalls(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  walls: WallRect[],
  padding: number = 14
): boolean {
  const segLen = Math.hypot(x2 - x1, y2 - y1);
  // Trim 16px off both ends when testing against padded walls so standing near an obstacle or alley wall never falsely blocks the endpoint
  const trim = segLen > 42 ? 16 / segLen : 0;
  const sx1 = x1 + (x2 - x1) * trim;
  const sy1 = y1 + (y2 - y1) * trim;
  const sx2 = x2 - (x2 - x1) * trim;
  const sy2 = y2 - (y2 - y1) * trim;

  for (const w of walls) {
    // Always test unpadded wall against full segment
    if (lineIntersectsBox(x1, y1, x2, y2, w.x, w.y, w.w, w.h)) {
      return true;
    }
    // Test padded wall against trimmed interior segment so start/end proximity to an obstacle never causes false wall blocks
    if (
      padding > 0 &&
      segLen > 36 &&
      lineIntersectsBox(sx1, sy1, sx2, sy2, w.x - padding, w.y - padding, w.w + padding * 2, w.h + padding * 2)
    ) {
      return true;
    }
  }
  return false;
}

/** Normalizes the absolute angular difference between two angles into [0, Math.PI] */
export function normalizeAngleDiff(a: number, b: number): number {
  return Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
}

/**
 * Evaluates whether an incoming player bullet is deflected by Delinquent Ryuko's wooden bat.
 * ONLY Delinquent can deflect bullets! Her wooden bat has finite durability (35 HP base, 65 HP with Hardened Oak Bat)
 * and shatters permanently once it absorbs that much damage!
 * Shiny Delinquent Ryuko's deflected shots ricochet with concussive force toward the player to daze & stun until she reaches them!
 */
export function checkBulletDeflection(
  bullet: BulletState,
  enemy: EnemyState,
  playerX: number,
  playerY: number,
  activeUpgrades: string[] = []
): {
  deflected: boolean;
  reflectedVx: number;
  reflectedVy: number;
  isDazeSpark: boolean;
  isShinyRicochet?: boolean;
  sourceEnemyId?: number;
  damageMultiplier: number;
  color: string;
  trailColor: string;
  batJustBroke?: boolean;
} {
  // ONLY Delinquent Ryuko can deflect bullets, and ONLY while her wooden bat isn't broken!
  if (enemy.archetype !== 'delinquent' || enemy.batBroken) {
    return {
      deflected: false,
      reflectedVx: 0,
      reflectedVy: 0,
      isDazeSpark: false,
      damageMultiplier: 1,
      color: bullet.color,
      trailColor: bullet.trailColor,
    };
  }

  // Swing recovery cooldown prevents Delinquent from blocking every single shot!
  if ((enemy.deflectCooldown ?? 0) > 0) {
    return {
      deflected: false,
      reflectedVx: 0,
      reflectedVy: 0,
      isDazeSpark: false,
      damageMultiplier: 1,
      color: bullet.color,
      trailColor: bullet.trailColor,
    };
  }

  const hasOakBat = activeUpgrades.includes('delinquent_reinforced_shinai');
  const defaultMaxBatHp = enemy.isShiny ? 220 : hasOakBat ? 65 : 35;
  if (enemy.maxBatHp === undefined) {
    enemy.maxBatHp = defaultMaxBatHp;
  }
  if (enemy.batHp === undefined) {
    enemy.batHp = defaultMaxBatHp;
  }

  // Incoming direction from the enemy's perspective:
  const reverseShotAngle = Math.atan2(-bullet.vy, -bullet.vx);
  const toBulletAngle = Math.atan2(bullet.y - enemy.y, bullet.x - enemy.x);
  const angleDelta = Math.min(
    normalizeAngleDiff(reverseShotAngle, enemy.angle),
    normalizeAngleDiff(toBulletAngle, enemy.angle)
  );

  // 50 deg half-arc (100 deg total) base, or 65 deg half-arc (130 deg total) with Hardened Oak Bat / Shiny
  const maxArc = enemy.isShiny || hasOakBat ? (65 * Math.PI) / 180 : (50 * Math.PI) / 180;

  if (angleDelta <= maxArc) {
    // Bat absorbs the incoming shot's damage and loses durability!
    enemy.batHp = Math.max(0, enemy.batHp - bullet.damage);
    const batJustBroke = enemy.batHp <= 0;
    if (batJustBroke) {
      enemy.batBroken = true;
      enemy.speechText = 'Tch! My bat snapped?!';
      enemy.speechTimer = 2.2;
    }

    // Set swing cooldown so follow-up shots pass right through while she recovers her bat swing!
    enemy.deflectCooldown = enemy.isShiny ? 0.18 : hasOakBat ? 0.28 : 0.44;

    const toPlayerAngle = Math.atan2(playerY - enemy.y, playerX - enemy.x);

    if (enemy.isShiny) {
      // Shiny Delinquent Ryuko: Deflects straight back at the player at high speed to daze & stun until she reaches you!
      const reflectAngle = toPlayerAngle + (Math.random() - 0.5) * 0.06;
      const refSpeed = 860;
      return {
        deflected: true,
        reflectedVx: Math.cos(reflectAngle) * refSpeed,
        reflectedVy: Math.sin(reflectAngle) * refSpeed,
        isDazeSpark: true,
        isShinyRicochet: true,
        sourceEnemyId: enemy.id,
        damageMultiplier: 0,
        color: '#facc15',
        trailColor: 'rgba(250, 204, 21, 0.85)',
        batJustBroke,
      };
    }

    // Standard Delinquent: Ricochet OUTWARD at a wide angle (±32° to ±58° off center)
    const sideSign = (bullet.id % 2 === 0 ? 1 : -1) * (Math.random() < 0.2 ? -1 : 1);
    const outwardOffset = sideSign * (0.56 + Math.random() * 0.45);
    const reflectAngle = toPlayerAngle + outwardOffset;
    const refSpeed = hasOakBat ? 390 : 330;

    return {
      deflected: true,
      reflectedVx: Math.cos(reflectAngle) * refSpeed,
      reflectedVy: Math.sin(reflectAngle) * refSpeed,
      isDazeSpark: true, // Always stuns only (0 HP damage)!
      damageMultiplier: 0,
      color: '#fef08a',
      trailColor: 'rgba(250, 204, 21, 0.55)',
      batJustBroke,
    };
  }

  return {
    deflected: false,
    reflectedVx: 0,
    reflectedVy: 0,
    isDazeSpark: false,
    damageMultiplier: 1,
    color: bullet.color,
    trailColor: bullet.trailColor,
  };
}

export interface EnemyAIUpdateResult {
  dropsPuddle?: {
    x: number;
    y: number;
    type?: 'coffee' | 'caution' | 'skidmark' | 'spike_strip' | 'smoke' | 'shadow_hand';
    isShinyCoffee?: boolean;
    sourceEnemyId?: number;
    ownerId?: number;
  };
  requestsOfficerBackup?: boolean;
  shinySpecial?: string;
  attackingBreach?: BreachPoint;
  triggersStrobeFlash?: boolean;
  triggersJumpscare?: boolean;
  completedHackPickupId?: number;
  houndFrontStun?: boolean;
  houndRearPin?: boolean;
  firesBullet?: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    damage: number;
    isStunDart?: boolean;
    isHeartNeedle?: boolean;
    isShinySniper?: boolean;
    sourceEnemyId?: number;
    ownerId?: number;
  };
  firesBullets?: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    damage: number;
    isStunDart?: boolean;
    isHeartNeedle?: boolean;
  }>;
  shinyAttack?: {
    type: string;
    x: number;
    y: number;
    angle: number;
  };
}

/** True if a coordinate is within the Suburban Home interior walls footprint (measured to wall centerlines) */
export function isInsideHouse(x: number, y: number): boolean {
  return (
    x >= 94 + HOME_OFFSET_X &&
    x <= 1806 + HOME_OFFSET_X &&
    y >= 94 + HOME_OFFSET_Y &&
    y <= 1356 + HOME_OFFSET_Y
  );
}

/**
 * Smart Pathing & Multi-Hop Waypoint Navigation for Enemies:
 * Uses a shortest-path graph across doorways/room-hubs and feeler ray avoidance so enemies never get stuck on doors or walls.
 * Supports bidirectional breach traversal & barricade breaking from both inside and outside the Suburban Home!
 */
export function computeSmartSteering(
  enemy: EnemyState,
  targetX: number,
  targetY: number,
  walls: WallRect[],
  doorways?: { x: number; y: number }[],
  breachPoints?: BreachPoint[],
  mapId?: MapType
): { moveX: number; moveY: number; dirX: number; dirY: number; attackingBreach?: BreachPoint } {
  const mk = (mx: number, my: number, ab?: BreachPoint) => ({
    moveX: mx,
    moveY: my,
    dirX: mx,
    dirY: my,
    attackingBreach: ab,
  });

  // In Suburban Home: route through breach points whenever enemy and target are on opposite sides of the house perimeter!
  if (mapId === 'home' && breachPoints && breachPoints.length > 0) {
    const isEnemyInside = isInsideHouse(enemy.x, enemy.y);
    const isTargetInside = isInsideHouse(targetX, targetY);

    if (isEnemyInside !== isTargetInside) {
      // Check if ANY breach point is already broken open so enemies strongly prioritize routing through open entrances before attacking intact ones!
      const anyBreachOpen = breachPoints.some((bp) => !bp.isBarricaded || (bp.barricadeHp || 0) <= 0);
      let bestBp: BreachPoint = breachPoints[0];
      let bestScore = Infinity;

      for (const bp of breachPoints) {
        const bpCenterX = bp.x + bp.w / 2;
        const bpCenterY = bp.y + bp.h / 2;
        const outsideX = bp.outsideX ?? bpCenterX;
        const outsideY = bp.outsideY ?? bpCenterY;
        const insideX = bp.insideX ?? bpCenterX;
        const insideY = bp.insideY ?? bpCenterY;

        const approachX = isEnemyInside ? insideX : outsideX;
        const approachY = isEnemyInside ? insideY : outsideY;
        const exitX = isEnemyInside ? outsideX : insideX;
        const exitY = isEnemyInside ? outsideY : insideY;

        const distToApproach = Math.hypot(approachX - enemy.x, approachY - enemy.y);
        const distFromExitToTarget = Math.hypot(targetX - exitX, targetY - exitY);
        const isIntact = Boolean(bp.isBarricaded && (bp.barricadeHp || 0) > 0);
        // When at least one entrance is already broken open, give intact barricades a large routing penalty (1150px)
        // so enemies route through already-broken entrances unless they are right next to an intact one and the open one is on the far side of the map!
        const barricadePenalty = isIntact ? (anyBreachOpen ? 1150 : 95) : 0;
        const totalScore = distToApproach + distFromExitToTarget * 0.55 + barricadePenalty;

        if (totalScore < bestScore) {
          bestScore = totalScore;
          bestBp = bp;
        }
      }

      const bpCenterX = bestBp.x + bestBp.w / 2;
      const bpCenterY = bestBp.y + bestBp.h / 2;
      const distToCenter = Math.hypot(bpCenterX - enemy.x, bpCenterY - enemy.y);

      const outsideX = bestBp.outsideX ?? bpCenterX;
      const outsideY = bestBp.outsideY ?? bpCenterY;
      const insideX = bestBp.insideX ?? bpCenterX;
      const insideY = bestBp.insideY ?? bpCenterY;

      const approachX = isEnemyInside ? insideX : outsideX;
      const approachY = isEnemyInside ? insideY : outsideY;
      const exitX = isEnemyInside ? outsideX : insideX;
      const exitY = isEnemyInside ? outsideY : insideY;
      const distToApproach = Math.hypot(approachX - enemy.x, approachY - enemy.y);
      const isHorizontalWallGap = bestBp.w > bestBp.h;

      // If within strike range of a barricaded breach point (from inside OR outside), center on the breach and break the barricade!
      if ((distToCenter < 82 || distToApproach < 42) && bestBp.isBarricaded && bpBarricadeHp(bestBp) > 0) {
        const alignError = isHorizontalWallGap ? bpCenterX - enemy.x : bpCenterY - enemy.y;
        if (Math.abs(alignError) > 10) {
          const nudgeX = isHorizontalWallGap ? Math.sign(alignError) * 0.35 : 0;
          const nudgeY = isHorizontalWallGap ? 0 : Math.sign(alignError) * 0.35;
          return mk(nudgeX, nudgeY, bestBp);
        }
        return mk(0, 0, bestBp);
      }

      // If breach is open and enemy is near the approach or inside the gap, guide straight through the center axis to exit!
      if ((!bestBp.isBarricaded || bpBarricadeHp(bestBp) <= 0) && (distToCenter < 105 || distToApproach < 58)) {
        const axisError = isHorizontalWallGap ? bpCenterX - enemy.x : bpCenterY - enemy.y;
        let goalX = exitX;
        let goalY = exitY;
        if (Math.abs(axisError) > 8) {
          if (isHorizontalWallGap) {
            goalX = bpCenterX;
            goalY = (enemy.y + exitY) * 0.5;
          } else {
            goalX = (enemy.x + exitX) * 0.5;
            goalY = bpCenterY;
          }
        }
        const exDx = goalX - enemy.x;
        const exDy = goalY - enemy.y;
        const exDist = Math.hypot(exDx, exDy) || 1;
        return mk(exDx / exDist, exDy / exDist);
      }

      // Otherwise navigate toward the approach waypoint on the enemy's current side of the wall
      if (!isLineBlockedByWalls(enemy.x, enemy.y, approachX, approachY, walls, 10)) {
        const bdx = approachX - enemy.x;
        const bdy = approachY - enemy.y;
        const bDist = Math.hypot(bdx, bdy) || 1;
        return mk(bdx / bDist, bdy / bDist);
      }
      targetX = approachX;
      targetY = approachY;
    }
  }

  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const directDist = Math.hypot(dx, dy) || 1;
  const directX = dx / directDist;
  const directY = dy / directDist;

  // Check if direct line to target is clear
  const blocked = isLineBlockedByWalls(enemy.x, enemy.y, targetX, targetY, walls, 12);
  if (!blocked) {
    enemy.pathCommitTimer = 0;
    return mk(directX, directY);
  }

  // Build navigation waypoint graph combining stage doorways + dynamic padded corners of any blocking walls!
  const navNodes: { x: number; y: number }[] = doorways ? [...doorways] : [];
  const cornerPad = (enemy.radius || 18) + 14;
  for (const w of walls) {
    if (lineIntersectsBox(enemy.x, enemy.y, targetX, targetY, w.x - 12, w.y - 12, w.w + 24, w.h + 24)) {
      const candidates = [
        { x: w.x - cornerPad, y: w.y - cornerPad },
        { x: w.x + w.w + cornerPad, y: w.y - cornerPad },
        { x: w.x - cornerPad, y: w.y + w.h + cornerPad },
        { x: w.x + w.w + cornerPad, y: w.y + w.h + cornerPad },
      ];
      for (const c of candidates) {
        const insideAnyWall = walls.some(
          (ow) => c.x >= ow.x - 8 && c.x <= ow.x + ow.w + 8 && c.y >= ow.y - 8 && c.y <= ow.y + ow.h + 8
        );
        if (!insideAnyWall) {
          navNodes.push(c);
        }
      }
    }
  }

  // Multi-hop Dijkstra shortest path over navNodes (ONLY used when a valid connected path to target exists!)
  if (navNodes.length > 0) {
    const n = navNodes.length;
    const distFromStart = new Array<number>(n + 1).fill(Infinity);
    const parent = new Array<number>(n + 1).fill(-1);
    const visited = new Array<boolean>(n + 1).fill(false);

    for (let i = 0; i < n; i++) {
      const d = navNodes[i];
      if (!isLineBlockedByWalls(enemy.x, enemy.y, d.x, d.y, walls, 9)) {
        distFromStart[i] = Math.hypot(d.x - enemy.x, d.y - enemy.y);
      }
    }

    for (let step = 0; step <= n; step++) {
      let u = -1;
      let bestD = Infinity;
      for (let i = 0; i <= n; i++) {
        if (!visited[i] && distFromStart[i] < bestD) {
          bestD = distFromStart[i];
          u = i;
        }
      }
      if (u === -1 || u === n) break;
      visited[u] = true;

      const uPt = navNodes[u];
      if (!isLineBlockedByWalls(uPt.x, uPt.y, targetX, targetY, walls, 9)) {
        const alt = distFromStart[u] + Math.hypot(targetX - uPt.x, targetY - uPt.y);
        if (alt < distFromStart[n]) {
          distFromStart[n] = alt;
          parent[n] = u;
        }
      }

      for (let v = 0; v < n; v++) {
        if (visited[v]) continue;
        const vPt = navNodes[v];
        const edgeLen = Math.hypot(vPt.x - uPt.x, vPt.y - uPt.y);
        if (edgeLen < 1200 && !isLineBlockedByWalls(uPt.x, uPt.y, vPt.x, vPt.y, walls, 9)) {
          const alt = distFromStart[u] + edgeLen;
          if (alt < distFromStart[v]) {
            distFromStart[v] = alt;
            parent[v] = u;
          }
        }
      }
    }

    // Only follow the graph path if it genuinely reaches the target (distFromStart[n] < Infinity)
    // Never pick an unreachable fallback node in the opposite direction!
    if (distFromStart[n] < Infinity) {
      const path: number[] = [];
      let curr = parent[n];
      while (curr !== -1) {
        path.unshift(curr);
        curr = parent[curr];
      }
      let chosenWp = path.length > 0 ? navNodes[path[0]] : null;
      for (const idx of path) {
        const wp = navNodes[idx];
        const dToWp = Math.hypot(wp.x - enemy.x, wp.y - enemy.y);
        if (dToWp >= 22 && !isLineBlockedByWalls(enemy.x, enemy.y, wp.x, wp.y, walls, 8)) {
          chosenWp = wp;
        }
      }
      if (chosenWp) {
        const wDx = chosenWp.x - enemy.x;
        const wDy = chosenWp.y - enemy.y;
        const wDist = Math.hypot(wDx, wDy) || 1;
        if (wDist > 6) {
          const wpAngle = Math.atan2(wDy, wDx);
          enemy.pathCommitAngle = wpAngle;
          enemy.pathCommitTimer = 0.35;
          return mk(wDx / wDist, wDy / wDist);
        }
      }
    }
  }

  // 16-Angle Multi-Depth Feeler Ray Fan with Heading Inertia Commitment (prevents alley/obstacle direction flips!)
  const baseAngle = Math.atan2(targetY - enemy.y, targetX - enemy.x);
  const currentHeading = enemy.pathCommitTimer && enemy.pathCommitTimer > 0 && enemy.pathCommitAngle !== undefined
    ? enemy.pathCommitAngle
    : enemy.angle ?? baseAngle;

  const candidateOffsets = [
    0,
    Math.PI / 12,
    -Math.PI / 12,
    Math.PI / 6,
    -Math.PI / 6,
    Math.PI / 4,
    -Math.PI / 4,
    Math.PI / 3,
    -Math.PI / 3,
    (5 * Math.PI) / 12,
    -(5 * Math.PI) / 12,
    Math.PI / 2,
    -Math.PI / 2,
    (2 * Math.PI) / 3,
    -(2 * Math.PI) / 3,
    (5 * Math.PI) / 6,
    -(5 * Math.PI) / 6,
  ];

  let bestFeelerAngle = baseAngle;
  let bestFeelerScore = -Infinity;

  for (const offset of candidateOffsets) {
    const testAngle = baseAngle + offset;
    const cosA = Math.cos(testAngle);
    const sinA = Math.sin(testAngle);

    const clearNear = !isLineBlockedByWalls(enemy.x, enemy.y, enemy.x + cosA * 48, enemy.y + sinA * 48, walls, 10);
    if (!clearNear) continue;

    const clearMid = !isLineBlockedByWalls(enemy.x, enemy.y, enemy.x + cosA * 96, enemy.y + sinA * 96, walls, 10);
    const clearFar = clearMid && !isLineBlockedByWalls(enemy.x, enemy.y, enemy.x + cosA * 145, enemy.y + sinA * 145, walls, 10);

    const depthBonus = (clearMid ? 1.2 : 0) + (clearFar ? 1.0 : 0);
    const targetAlign = Math.cos(offset); // 1.0 towards target, -1.0 away
    const headingAlign = Math.cos(testAngle - currentHeading); // Smooth inertia continuity!
    const score = targetAlign * 2.2 + depthBonus + headingAlign * 0.95;

    if (score > bestFeelerScore) {
      bestFeelerScore = score;
      bestFeelerAngle = testAngle;
    }
  }

  if (bestFeelerScore > -Infinity) {
    enemy.pathCommitAngle = bestFeelerAngle;
    enemy.pathCommitTimer = 0.35;
    return mk(Math.cos(bestFeelerAngle), Math.sin(bestFeelerAngle));
  }

  return mk(directX, directY);
}

function bpBarricadeHp(bp: BreachPoint): number {
  return bp.barricadeHp ?? 0;
}

/** Update individual enemy behavior with Smart Pathing, Hacker Sabotage, Hound Mechanics, and all 8 Shiny Pursuer Tactics */
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
  mapId?: MapType,
  weaponPickups?: WeaponPickupState[],
  viewportBounds?:
    | { minX: number; maxX: number; minY: number; maxY: number }
    | { x: number; y: number; w: number; h: number },
  isPlayerLockedByThisEnemy: boolean = false,
  playerAngle: number = 0,
  medkitPickups?: MedkitPickup[],
  isPlayerImperviousNow: boolean = false,
  cars?: MovingCar[],
  npcFemboys?: NpcFemboyState[],
  playerFiredRecently: boolean = false
): EnemyAIUpdateResult {
  if (enemy.alertPopTimer && enemy.alertPopTimer > 0) {
    enemy.alertPopTimer = Math.max(0, enemy.alertPopTimer - dt);
  }
  if (enemy.idleChatCooldown && enemy.idleChatCooldown > 0) {
    enemy.idleChatCooldown = Math.max(0, enemy.idleChatCooldown - dt);
  }

  // Determine if this enemy is currently locked into a struggle or bed-drag with an NPC Femboy
  const activeNpcVictim =
    npcFemboys?.find(
      (n) =>
        n.capturedByEnemyId === enemy.id &&
        (n.aiMode === 'captured_struggle' || n.aiMode === 'captured_dragged')
    ) ?? undefined;

  if (!activeNpcVictim) {
    enemy.strugglingNpcId = undefined;
    enemy.draggingNpcId = undefined;
  }

  // Choose primary target coordinates (either Player or a targeted NPC Femboy)
  let targetX = playerX;
  let targetY = playerY;
  const trackedNpc =
    enemy.targetEntity === 'npc_femboy' && enemy.targetNpcId !== undefined
      ? npcFemboys?.find((n) => n.id === enemy.targetNpcId)
      : undefined;

  // Switch back to player if player is much closer or tracked NPC no longer exists
  const distToPlayer = Math.hypot(playerX - enemy.x, playerY - enemy.y) || 1;
  if (trackedNpc) {
    const distToNpc = Math.hypot(trackedNpc.x - enemy.x, trackedNpc.y - enemy.y) || 1;
    if (distToPlayer < distToNpc * 0.68 && !activeNpcVictim) {
      enemy.targetEntity = 'player';
      enemy.targetNpcId = undefined;
    } else {
      targetX = trackedNpc.x;
      targetY = trackedNpc.y;
    }
  } else {
    enemy.targetEntity = 'player';
    enemy.targetNpcId = undefined;
  }

  const dx = targetX - enemy.x;
  const dy = targetY - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;
  const dirX = dx / dist;
  const dirY = dy / dist;

  enemy.specialTimer -= dt;
  if (enemy.speechTimer > 0) enemy.speechTimer -= dt;
  if (enemy.deflectSparkTimer && enemy.deflectSparkTimer > 0) enemy.deflectSparkTimer -= dt;
  if (enemy.deflectCooldown && enemy.deflectCooldown > 0) enemy.deflectCooldown -= dt;
  if (enemy.immunePopupTimer && enemy.immunePopupTimer > 0) enemy.immunePopupTimer -= dt;
  if (enemy.shootRecoveryTimer && enemy.shootRecoveryTimer > 0) {
    enemy.shootRecoveryTimer = Math.max(0, enemy.shootRecoveryTimer - dt);
  }
  if (enemy.knockbackStaggerTimer && enemy.knockbackStaggerTimer > 0) enemy.knockbackStaggerTimer = Math.max(0, enemy.knockbackStaggerTimer - dt);
  if (enemy.hackCooldown && enemy.hackCooldown > 0) enemy.hackCooldown = Math.max(0, enemy.hackCooldown - dt);
  if (enemy.dodgeAnimTimer && enemy.dodgeAnimTimer > 0) enemy.dodgeAnimTimer = Math.max(0, enemy.dodgeAnimTimer - dt);
  if (enemy.weaveDodgeTimer && enemy.weaveDodgeTimer > 0) {
    enemy.weaveDodgeTimer = Math.max(0, enemy.weaveDodgeTimer - dt);
    enemy.dodgeVisualTimer = enemy.weaveDodgeTimer;
  }
  if (enemy.houndKOTimer && enemy.houndKOTimer > 0) {
    enemy.houndKOTimer = Math.max(0, enemy.houndKOTimer - dt);
    enemy.dogKnockoutTimer = enemy.houndKOTimer;
    enemy.houndKnockoutTimer = enemy.houndKOTimer;
  } else if (enemy.dogKnockoutTimer && enemy.dogKnockoutTimer > 0) {
    enemy.dogKnockoutTimer = Math.max(0, enemy.dogKnockoutTimer - dt);
    enemy.houndKnockoutTimer = enemy.dogKnockoutTimer;
    enemy.houndKOTimer = enemy.dogKnockoutTimer;
  } else {
    enemy.houndKnockoutTimer = 0;
  }
  if (enemy.yandereRageTimer && enemy.yandereRageTimer > 0) {
    enemy.yandereRageTimer = Math.max(0, enemy.yandereRageTimer - dt);
    enemy.jealousRageTimer = enemy.yandereRageTimer;
  } else if (enemy.jealousRageTimer && enemy.jealousRageTimer > 0) {
    enemy.jealousRageTimer = Math.max(0, enemy.jealousRageTimer - dt);
    enemy.yandereRageTimer = enemy.jealousRageTimer;
  }
  if (enemy.houndFrontStunCooldown && enemy.houndFrontStunCooldown > 0) {
    enemy.houndFrontStunCooldown = Math.max(0, enemy.houndFrontStunCooldown - dt);
  }

  // If this enemy claimed the player's or NPC's extra life and is resting at the capture spot
  if (enemy.postWinWaitTimer && enemy.postWinWaitTimer > 0) {
    const prevWait = enemy.postWinWaitTimer;
    enemy.postWinWaitTimer = Math.max(0, enemy.postWinWaitTimer - dt);
    enemy.vx = 0;
    enemy.vy = 0;
    enemy.knockbackVx = 0;
    enemy.knockbackVy = 0;
    if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;

    if (prevWait > 0 && enemy.postWinWaitTimer <= 0) {
      const archInfo = GAME_TEXT.archetypes[enemy.archetype as ArchetypeKey];
      const hauntLines = archInfo?.hauntCallouts;
      enemy.speechText =
        hauntLines && hauntLines.length > 0
          ? hauntLines[Math.floor(Math.random() * hauntLines.length)]
          : "Break's over, cutie~! Time for round two! ♥";
      enemy.speechTimer = 3.8;
    }

    return {};
  }

  const cappedMultiplier = Math.min(1.26, enemy.speedMultiplier);
  let currentSpeed = enemy.baseSpeed * cappedMultiplier;

  // Upon capture, any Victor enemy is normalized into a non-shiny Victor enemy and moves slower (-25%)
  // because she is confident she'll eventually catch you again!
  if (isVictorEnemy(enemy)) {
    enemy.isShiny = false;
    enemy.isHauntingWinner = true;
    enemy.isVictor = true;
    enemy.isImmortalVictor = true;
    enemy.isImmortalWinner = true;
    currentSpeed *= 0.75;
  }

  // If currently struggling with or dragging an NPC Femboy to the bed:
  if (activeNpcVictim) {
    enemy.awarenessState = 'alerted';
    enemy.isAlerted = true;
    if (activeNpcVictim.aiMode === 'captured_struggle') {
      enemy.strugglingNpcId = activeNpcVictim.id;
      enemy.draggingNpcId = undefined;
      enemy.vx = 0;
      enemy.vy = 0;
      enemy.angle = Math.atan2(activeNpcVictim.y - enemy.y, activeNpcVictim.x - enemy.x);
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      return {};
    } else if (activeNpcVictim.aiMode === 'captured_dragged') {
      enemy.draggingNpcId = activeNpcVictim.id;
      enemy.strugglingNpcId = undefined;
      const bedPos = getMapBedPosition(mapId || 'forest', arenaWidth, arenaHeight);
      const dragSteer = computeSmartSteering(
        enemy,
        bedPos.x,
        bedPos.y,
        walls,
        doorways,
        breachPoints,
        mapId
      );
      const dragSpeed = currentSpeed * 0.64;
      enemy.angle = Math.atan2(dragSteer.moveY, dragSteer.moveX);
      enemy.vx = dragSteer.moveX * dragSpeed + enemy.knockbackVx;
      enemy.vy = dragSteer.moveY * dragSpeed + enemy.knockbackVy;
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.knockbackVx *= Math.max(0, 1 - dt * 8.0);
      enemy.knockbackVy *= Math.max(0, 1 - dt * 8.0);
      for (const w of walls) {
        const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, w.x, w.y, w.w, w.h);
        if (res.collided) {
          enemy.x = res.x;
          enemy.y = res.y;
        }
      }
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      return {};
    }
  }

  // =========================================================================
  // LIVED-IN WORLD AWARENESS & OFF-DUTY PATROL / IDLE / SOCIAL BANTER ENGINE
  // =========================================================================
  if (enemy.awarenessState === undefined) {
    enemy.awarenessState = enemy.isAlerted ? 'alerted' : 'unaware';
  }

  // Check if enemy catches wind of the player or an NPC Femboy
  const isVisionHinderedMap = mapId === 'mansion' || mapId === 'forest';
  const sightConeRange = isVisionHinderedMap ? 335 : 465;
  const closeProximityRange = isVisionHinderedMap ? 155 : 185;
  const gunfireHearRange = 540;
  const halfConeRad = (62 * Math.PI) / 180;

  const canDetectPoint = (tx: number, ty: number, noisy: boolean): boolean => {
    const tDist = Math.hypot(tx - enemy.x, ty - enemy.y);
    if (tDist <= closeProximityRange && !isLineBlockedByWalls(enemy.x, enemy.y, tx, ty, walls, 6)) {
      return true;
    }
    if (noisy && tDist <= gunfireHearRange) {
      return true;
    }
    if (tDist <= sightConeRange) {
      const losClear = !isLineBlockedByWalls(enemy.x, enemy.y, tx, ty, walls, 8);
      if (losClear) {
        const angleToTarget = Math.atan2(ty - enemy.y, tx - enemy.x);
        const angleDiff = normalizeAngleDiff(angleToTarget, enemy.angle ?? angleToTarget);
        if (angleDiff <= halfConeRad) {
          return true;
        }
      }
    }
    return false;
  };

  if (enemy.awarenessState !== 'alerted') {
    let detectedTarget: { type: 'player' | 'npc_femboy'; npcId?: number; x: number; y: number } | null = null;

    // 1. Check Player detection (proximity, gunfire, or sight cone)
    if (
      enemy.hitFlashTimer > 0 ||
      isPlayerLockedByThisEnemy ||
      canDetectPoint(playerX, playerY, playerFiredRecently)
    ) {
      detectedTarget = { type: 'player', x: playerX, y: playerY };
    }

    // 2. Check NPC Femboys interest (proximity, NPC gunfire, struggle commotion, or sight cone)
    if (!detectedTarget && npcFemboys && npcFemboys.length > 0) {
      let bestNpcDist = Infinity;
      for (const npc of npcFemboys) {
        const nDist = Math.hypot(npc.x - enemy.x, npc.y - enemy.y);
        const npcNoisy =
          npc.fireCooldown > 0.08 ||
          npc.aiMode === 'captured_struggle' ||
          npc.aiMode === 'captured_dragged';
        if (nDist < bestNpcDist && canDetectPoint(npc.x, npc.y, npcNoisy)) {
          bestNpcDist = nDist;
          detectedTarget = { type: 'npc_femboy', npcId: npc.id, x: npc.x, y: npc.y };
        }
      }
    }

    // 3. Check nearby alerted ally commotion within 220px
    if (!detectedTarget) {
      for (const other of allEnemies) {
        if (
          other.id !== enemy.id &&
          other.awarenessState === 'alerted' &&
          distanceSq(enemy.x, enemy.y, other.x, other.y) <= 220 * 220 &&
          !isLineBlockedByWalls(enemy.x, enemy.y, other.x, other.y, walls, 6)
        ) {
          detectedTarget = {
            type: other.targetEntity ?? 'player',
            npcId: other.targetNpcId,
            x: other.targetEntity === 'npc_femboy' ? targetX : playerX,
            y: other.targetEntity === 'npc_femboy' ? targetY : playerY,
          };
          break;
        }
      }
    }

    if (detectedTarget) {
      enemy.awarenessState = 'alerted';
      enemy.isAlerted = true;
      enemy.loseSightTimer = 0;
      enemy.searchTimer = 0;
      enemy.socialPartnerId = undefined;
      enemy.idleActionLabel = undefined;
      enemy.targetEntity = detectedTarget.type;
      enemy.targetNpcId = detectedTarget.npcId;
      enemy.alertPopTimer = 1.25;
      enemy.alertPopType = '!';
      enemy.angle = Math.atan2(detectedTarget.y - enemy.y, detectedTarget.x - enemy.x);

      const spotPool =
        GAME_TEXT.worldIdleDialogue.awarenessCallouts[
          enemy.archetype as keyof typeof GAME_TEXT.worldIdleDialogue.awarenessCallouts
        ]?.spotted;
      if (spotPool && spotPool.length > 0) {
        enemy.speechText = spotPool[Math.floor(Math.random() * spotPool.length)];
        enemy.speechTimer = 2.8;
      }
    } else if (enemy.awarenessState === 'searching') {
      // Searching state: walk toward lastKnownTargetX/Y and scan around; if timer expires, return to unaware!
      enemy.searchTimer = (enemy.searchTimer ?? 3.8) - dt;
      const lastX = enemy.lastKnownTargetX ?? enemy.x;
      const lastY = enemy.lastKnownTargetY ?? enemy.y;
      const distToLast = Math.hypot(lastX - enemy.x, lastY - enemy.y);

      if (distToLast > 36) {
        const searchSteer = computeSmartSteering(
          enemy,
          lastX,
          lastY,
          walls,
          doorways,
          breachPoints,
          mapId
        );
        const searchSpeed = currentSpeed * 0.68;
        enemy.angle = Math.atan2(searchSteer.moveY, searchSteer.moveX);
        enemy.vx = searchSteer.moveX * searchSpeed + enemy.knockbackVx;
        enemy.vy = searchSteer.moveY * searchSpeed + enemy.knockbackVy;
      } else {
        enemy.vx = enemy.knockbackVx;
        enemy.vy = enemy.knockbackVy;
        enemy.angle = (enemy.angle ?? 0) + Math.sin(survivalTime * 3.5 + enemy.id) * dt * 1.8;
      }

      if ((enemy.searchTimer ?? 0) <= 0) {
        enemy.awarenessState = 'unaware';
        enemy.isAlerted = false;
        enemy.isSirenActive = false;
        enemy.idleBehavior = 'standing';
        enemy.idleTimer = 2.2;
        const lostPool =
          GAME_TEXT.worldIdleDialogue.awarenessCallouts[
            enemy.archetype as keyof typeof GAME_TEXT.worldIdleDialogue.awarenessCallouts
          ]?.lost;
        if (lostPool && lostPool.length > 0 && enemy.speechTimer <= 0) {
          enemy.speechText = lostPool[Math.floor(Math.random() * lostPool.length)];
          enemy.speechTimer = 3.0;
        }
      }

      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.knockbackVx *= Math.max(0, 1 - dt * 8.0);
      enemy.knockbackVy *= Math.max(0, 1 - dt * 8.0);
      for (const w of walls) {
        const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, w.x, w.y, w.w, w.h);
        if (res.collided) {
          enemy.x = res.x;
          enemy.y = res.y;
        }
      }
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      return {};
    } else {
      // UNAWARE OFF-DUTY LIFE: Logical map patrolling, contextual solo idling & paired social banter!
      enemy.isAlerted = false;
      enemy.isSirenActive = false;
      enemy.isDashing = false;
      enemy.isSliding = false;
      enemy.idleTimer = (enemy.idleTimer ?? 0) - dt;

      // Check if another unaware enemy is close by to initiate Paired Social Banter
      if (
        enemy.idleBehavior !== 'socializing' &&
        (enemy.idleChatCooldown ?? 0) <= 0 &&
        Math.random() < dt * 0.55
      ) {
        for (const other of allEnemies) {
          if (
            other.id !== enemy.id &&
            other.awarenessState === 'unaware' &&
            (other.idleChatCooldown ?? 0) <= 0 &&
            distanceSq(enemy.x, enemy.y, other.x, other.y) <= 125 * 125 &&
            !isLineBlockedByWalls(enemy.x, enemy.y, other.x, other.y, walls, 6)
          ) {
            enemy.idleBehavior = 'socializing';
            other.idleBehavior = 'socializing';
            enemy.socialPartnerId = other.id;
            other.socialPartnerId = enemy.id;
            enemy.idleTimer = 4.6;
            other.idleTimer = 4.6;
            enemy.idleChatCooldown = 14.0;
            other.idleChatCooldown = 14.0;
            enemy.idleActionLabel = '[Chatting]';
            other.idleActionLabel = '[Chatting]';

            const pairKey1 = `${enemy.archetype}+${other.archetype}` as keyof typeof GAME_TEXT.worldIdleDialogue.pairedBanter;
            const pairKey2 = `${other.archetype}+${enemy.archetype}` as keyof typeof GAME_TEXT.worldIdleDialogue.pairedBanter;
            const banterTable = GAME_TEXT.worldIdleDialogue.pairedBanter;

            if (pairKey1 in banterTable && Array.isArray(banterTable[pairKey1])) {
              const arr = banterTable[pairKey1] as ReadonlyArray<{ opener: string; reply: string }>;
              const pick = arr[Math.floor(Math.random() * arr.length)];
              enemy.speechText = pick.opener;
              enemy.speechTimer = 4.2;
              other.speechText = pick.reply;
              other.speechTimer = 4.5;
            } else if (pairKey2 in banterTable && Array.isArray(banterTable[pairKey2])) {
              const arr = banterTable[pairKey2] as ReadonlyArray<{ opener: string; reply: string }>;
              const pick = arr[Math.floor(Math.random() * arr.length)];
              other.speechText = pick.opener;
              other.speechTimer = 4.2;
              enemy.speechText = pick.reply;
              enemy.speechTimer = 4.5;
            } else {
              const openers = banterTable.defaultOpeners;
              const replies = banterTable.defaultReplies;
              enemy.speechText = openers[Math.floor(Math.random() * openers.length)];
              enemy.speechTimer = 4.0;
              other.speechText = replies[Math.floor(Math.random() * replies.length)];
              other.speechTimer = 4.3;
            }
            break;
          }
        }
      }

      // Transition between Strolling and Idle Actions when idleTimer expires
      if ((enemy.idleTimer ?? 0) <= 0) {
        enemy.socialPartnerId = undefined;
        if (enemy.idleBehavior === 'strolling' || !enemy.idleBehavior) {
          // Pause to stand around and do an archetype/map-appropriate idle action
          const idleChoices: Array<NonNullable<EnemyState['idleBehavior']>> = [
            'standing',
            'stretching',
            'checking_phone',
            'looking_around',
            'fixing_hair',
          ];
          enemy.idleBehavior = idleChoices[Math.floor(Math.random() * idleChoices.length)];
          enemy.idleTimer = 3.2 + Math.random() * 2.8;

          // Pick a contextual solo monologue for this archetype & map!
          const mKey = (mapId || 'forest') as keyof typeof GAME_TEXT.worldIdleDialogue.soloByMap.officer;
          const archSolo =
            GAME_TEXT.worldIdleDialogue.soloByMap[
              enemy.archetype as keyof typeof GAME_TEXT.worldIdleDialogue.soloByMap
            ]?.[mKey];
          if (archSolo && archSolo.length > 0 && (enemy.idleChatCooldown ?? 0) <= 0 && Math.random() < 0.72) {
            const rawLine = archSolo[Math.floor(Math.random() * archSolo.length)];
            const bracketMatch = rawLine.match(/^\[(.*?)\]\s*(.*)$/);
            if (bracketMatch) {
              enemy.idleActionLabel = `[${bracketMatch[1]}]`;
              enemy.speechText = bracketMatch[2];
            } else {
              enemy.speechText = rawLine;
            }
            enemy.speechTimer = 3.6;
            enemy.idleChatCooldown = 8.5 + Math.random() * 5.0;
          }
        } else {
          // Pick a logical patrol waypoint to walk to
          enemy.idleBehavior = 'strolling';
          enemy.idleActionLabel = undefined;
          enemy.idleTimer = 4.5 + Math.random() * 4.0;
          const margin = mapId === 'mansion' ? 240 : 180;
          if (doorways && doorways.length > 0 && Math.random() < 0.65) {
            const wp = doorways[Math.floor(Math.random() * doorways.length)];
            enemy.patrolWaypointX = wp.x + (Math.random() - 0.5) * 140;
            enemy.patrolWaypointY = wp.y + (Math.random() - 0.5) * 140;
          } else {
            const wanderAng = (enemy.angle ?? 0) + (Math.random() - 0.5) * 2.4;
            const wanderDist = 220 + Math.random() * 280;
            enemy.patrolWaypointX = Math.max(
              margin,
              Math.min(arenaWidth - margin, enemy.x + Math.cos(wanderAng) * wanderDist)
            );
            enemy.patrolWaypointY = Math.max(
              margin,
              Math.min(arenaHeight - margin, enemy.y + Math.sin(wanderAng) * wanderDist)
            );
          }
        }
      }

      let idleMoveX = 0;
      let idleMoveY = 0;
      let idleSpeed = 0;

      if (enemy.idleBehavior === 'socializing' && enemy.socialPartnerId !== undefined) {
        const partner = allEnemies.find((o) => o.id === enemy.socialPartnerId);
        if (partner) {
          enemy.angle = Math.atan2(partner.y - enemy.y, partner.x - enemy.x);
        }
      } else if (enemy.idleBehavior === 'strolling') {
        const wpX = enemy.patrolWaypointX ?? arenaWidth * 0.5;
        const wpY = enemy.patrolWaypointY ?? arenaHeight * 0.5;
        const distToWp = Math.hypot(wpX - enemy.x, wpY - enemy.y);
        if (distToWp <= 32) {
          enemy.idleTimer = 0; // Arrived at waypoint; pause and idle next frame
        } else {
          const strollSteer = computeSmartSteering(
            enemy,
            wpX,
            wpY,
            walls,
            doorways,
            breachPoints,
            mapId
          );
          idleMoveX = strollSteer.moveX;
          idleMoveY = strollSteer.moveY;
          idleSpeed = currentSpeed * 0.56;
          enemy.angle = Math.atan2(idleMoveY, idleMoveX);
        }
      } else if (enemy.idleBehavior === 'looking_around') {
        enemy.angle = (enemy.angle ?? 0) + Math.sin(survivalTime * 2.2 + enemy.id) * dt * 1.1;
      }

      // City crosswalk safety while strolling
      if (mapId === 'city' && cars && cars.length > 0 && idleSpeed > 0) {
        const nextY = enemy.y + idleMoveY * idleSpeed * dt * 6;
        for (const car of cars) {
          if (Math.abs(nextY - car.y) < car.h * 0.88 + enemy.radius) {
            const relX = enemy.x - car.x;
            const approaching =
              (car.vx > 0 && relX > -car.w * 0.6 && relX < 240) ||
              (car.vx < 0 && relX < car.w * 0.6 && relX > -240);
            if (approaching) {
              idleMoveY = 0;
              idleSpeed = 0;
              break;
            }
          }
        }
      }

      enemy.vx = idleMoveX * idleSpeed + enemy.knockbackVx;
      enemy.vy = idleMoveY * idleSpeed + enemy.knockbackVy;
      enemy.x += enemy.vx * dt;
      enemy.y += enemy.vy * dt;
      enemy.knockbackVx *= Math.max(0, 1 - dt * 8.0);
      enemy.knockbackVy *= Math.max(0, 1 - dt * 8.0);

      // Sync Maya's hound while strolling/idling
      if (enemy.archetype === 'trainer') {
        const leadDist = 52;
        const targetDogX = enemy.x + Math.cos(enemy.angle || 0) * leadDist;
        const targetDogY = enemy.y + Math.sin(enemy.angle || 0) * leadDist;
        if (enemy.dogWorldX === undefined || enemy.dogWorldY === undefined) {
          enemy.dogWorldX = targetDogX;
          enemy.dogWorldY = targetDogY;
        } else {
          enemy.dogWorldX += (targetDogX - enemy.dogWorldX) * Math.min(1, dt * 6);
          enemy.dogWorldY += (targetDogY - enemy.dogWorldY) * Math.min(1, dt * 6);
        }
        enemy.houndWorldX = enemy.dogWorldX;
        enemy.houndWorldY = enemy.dogWorldY;
        enemy.houndX = enemy.dogWorldX;
        enemy.houndY = enemy.dogWorldY;
      }

      for (const w of walls) {
        const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, w.x, w.y, w.w, w.h);
        if (res.collided) {
          enemy.x = res.x;
          enemy.y = res.y;
          enemy.idleTimer = 0;
        }
      }
      if (mapId === 'home' && breachPoints) {
        for (const bp of breachPoints) {
          if (bp.isBarricaded && (bp.barricadeHp || 0) > 0) {
            const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, bp.x, bp.y, bp.w, bp.h);
            if (res.collided) {
              enemy.x = res.x;
              enemy.y = res.y;
            }
          }
        }
      }
      if (mapId === 'mansion') {
        enemy.x = Math.max(188, Math.min(2212, enemy.x));
        enemy.y = Math.max(188, Math.min(1812, enemy.y));
      } else {
        enemy.x = Math.max(enemy.radius, Math.min(arenaWidth - enemy.radius, enemy.x));
        enemy.y = Math.max(enemy.radius, Math.min(arenaHeight - enemy.radius, enemy.y));
      }
      if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;
      return {};
    }
  }

  // Enemy is ALERTED: Track line-of-sight loss so if you stay out of sight for too long, they enter 'searching'
  enemy.isAlerted = true;
  const losBlockedNow = isLineBlockedByWalls(enemy.x, enemy.y, targetX, targetY, walls, 10);
  const maxKeepSightDist = isVisionHinderedMap ? 440 : 620;
  if ((losBlockedNow && dist > 210) || dist > maxKeepSightDist) {
    enemy.loseSightTimer = (enemy.loseSightTimer ?? 0) + dt;
    if (enemy.loseSightTimer >= 6.8 && !isPlayerLockedByThisEnemy && !isVictorEnemy(enemy)) {
      enemy.awarenessState = 'searching';
      enemy.searchTimer = 3.8;
      enemy.loseSightTimer = 0;
      enemy.lastKnownTargetX = targetX;
      enemy.lastKnownTargetY = targetY;
      enemy.alertPopTimer = 1.25;
      enemy.alertPopType = '?';
      const searchPool =
        GAME_TEXT.worldIdleDialogue.awarenessCallouts[
          enemy.archetype as keyof typeof GAME_TEXT.worldIdleDialogue.awarenessCallouts
        ]?.searching;
      if (searchPool && searchPool.length > 0) {
        enemy.speechText = searchPool[Math.floor(Math.random() * searchPool.length)];
        enemy.speechTimer = 2.8;
      }
    }
  } else {
    enemy.loseSightTimer = Math.max(0, (enemy.loseSightTimer ?? 0) - dt * 1.6);
    enemy.lastKnownTargetX = targetX;
    enemy.lastKnownTargetY = targetY;
  }

  enemy.angle = Math.atan2(dy, dx);

  let dropsPuddle: EnemyAIUpdateResult['dropsPuddle'] = undefined;
  let requestsOfficerBackup: boolean | undefined = undefined;
  let shinySpecial: string | undefined = undefined;
  let attackingBreach: BreachPoint | undefined = undefined;
  let triggersStrobeFlash: boolean | undefined = undefined;
  let triggersJumpscare: boolean | undefined = undefined;
  let completedHackPickupId: number | undefined = undefined;
  let houndFrontStun: boolean | undefined = undefined;
  let houndRearPin: boolean | undefined = undefined;
  let firesBullet: EnemyAIUpdateResult['firesBullet'] = undefined;
  let firesBullets: EnemyAIUpdateResult['firesBullets'] = undefined;
  let shinyAttack: EnemyAIUpdateResult['shinyAttack'] = undefined;

  const steer = computeSmartSteering(enemy, targetX, targetY, walls, doorways, breachPoints, mapId);
  let { moveX, moveY } = steer;
  if (enemy.pathCommitTimer && enemy.pathCommitTimer > 0) {
    enemy.pathCommitTimer = Math.max(0, enemy.pathCommitTimer - dt);
  }

  // If attacking a barricaded breach point, damage the barricade at a balanced pace so barricades last longer!
  if (steer.attackingBreach) {
    attackingBreach = steer.attackingBreach;
    enemy.attackCooldown = (enemy.attackCooldown || 0) - dt;
    if (enemy.attackCooldown <= 0) {
      enemy.attackCooldown = 1.05;
      if (steer.attackingBreach.barricadeHp !== undefined) {
        steer.attackingBreach.barricadeHp -= 12;
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
      enemy.isSpottedInCone = false;
      currentSpeed *= 1.25;
      break;
    }

    case 'officer': {
      // Shiny Officer Viki: Equipped with a sniper that fires from far away with a very fast projectile that electrocutes on contact until she reaches you!
      // She is also completely IMPERVIOUS while aiming AND firing (shootRecoveryTimer)!
      if (enemy.isShiny) {
        enemy.isAlerted = true;
        enemy.isSirenActive = true;
        if (isPlayerLockedByThisEnemy && !isPlayerImperviousNow) {
          enemy.isAiming = false;
          currentSpeed *= 1.75; // Rush to the electrocuted player!
        } else {
          enemy.shootCooldown = (enemy.shootCooldown ?? 1.4) - dt;
          if (enemy.isAiming) {
            enemy.aimTelegraphTimer = (enemy.aimTelegraphTimer || 0) - dt;
            enemy.aimAngle = Math.atan2(dy, dx);
            currentSpeed *= 0.12;
            if ((enemy.aimTelegraphTimer || 0) <= 0) {
              enemy.isAiming = false;
              enemy.shootRecoveryTimer = 0.38; // Remains impervious through her shot follow-through!
              const shotSpeed = 1680; // Very fast sniper round!
              enemy.shootCooldown = 1.9;
              firesBullet = {
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(enemy.aimAngle || 0) * shotSpeed,
                vy: Math.sin(enemy.aimAngle || 0) * shotSpeed,
                speed: shotSpeed,
                damage: 0,
                isStunDart: true,
                isShinySniper: true,
                sourceEnemyId: enemy.id,
              };
            }
          } else if ((enemy.shootCooldown || 0) <= 0 && dist >= 110 && dist <= 920) {
            const lineClear = !isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls);
            if (lineClear) {
              enemy.isAiming = true;
              enemy.aimTelegraphTimer = 0.42;
              enemy.aimAngle = Math.atan2(dy, dx);
              enemy.speechText = 'Sniper lock acquired! Hold still, cutie~ ⚡';
              enemy.speechTimer = 1.6;
            }
          }
        }
        break;
      }

      // Standard OFFICER: Smart sector patrol that steers toward the player's vicinity without ever getting stuck in map corners!
      const sightDist = activeUpgrades.includes('officer_highbeam') ? 640 : 480;

      if (!enemy.isAlerted) {
        enemy.isSirenActive = false;
        currentSpeed *= 0.82;

        enemy.patrolTimer = (enemy.patrolTimer ?? 2.6) - dt;
        const margin = 240;
        const sectorAngle = (enemy.patrolAngle ?? 0) + survivalTime * 0.35;
        const patrolTargetX = Math.max(
          margin,
          Math.min(arenaWidth - margin, playerX + Math.cos(sectorAngle) * 260)
        );
        const patrolTargetY = Math.max(
          margin,
          Math.min(arenaHeight - margin, playerY + Math.sin(sectorAngle) * 260)
        );

        const patrolSteer = computeSmartSteering(
          enemy,
          patrolTargetX,
          patrolTargetY,
          walls,
          doorways,
          breachPoints,
          mapId
        );
        moveX = patrolSteer.moveX;
        moveY = patrolSteer.moveY;
        enemy.angle = Math.atan2(moveY, moveX);

        const unobstructed = !isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls, 8);
        if ((dist <= sightDist && unobstructed) || dist <= 340 || (enemy.patrolTimer !== undefined && enemy.patrolTimer <= 0)) {
          enemy.isAlerted = true;
          enemy.isSirenActive = true;
          if (activeUpgrades.includes('officer_squad_radios')) {
            for (const other of allEnemies) {
              if (other.archetype === 'officer' && !other.isAlerted && distanceSq(enemy.x, enemy.y, other.x, other.y) < 550 * 550) {
                other.isAlerted = true;
                other.isSirenActive = true;
              }
            }
          }
        }
      } else {
        enemy.isSirenActive = true;
        if (activeUpgrades.includes('officer_cruiser_pace')) {
          currentSpeed *= 1.3;
          for (const other of allEnemies) {
            if (other.archetype === 'officer' && !other.isAlerted && distanceSq(enemy.x, enemy.y, other.x, other.y) < 400 * 400) {
              other.isAlerted = true;
              other.isSirenActive = true;
            }
          }
        }

        if (activeUpgrades.includes('officer_spike_strip') && enemy.specialTimer <= 0) {
          dropsPuddle = { x: enemy.x, y: enemy.y, type: 'spike_strip' };
          enemy.specialTimer = 6.5 + Math.random() * 2.5;
        }

        enemy.shootCooldown = (enemy.shootCooldown ?? (2.2 + Math.random() * 2.0)) - dt;

        if (enemy.isAiming) {
          enemy.aimTelegraphTimer = (enemy.aimTelegraphTimer || 0) - dt;
          enemy.aimAngle = Math.atan2(dy, dx);
          currentSpeed *= 0.15;

          if ((enemy.aimTelegraphTimer || 0) <= 0) {
            enemy.isAiming = false;
            const shotSpeed = activeUpgrades.includes('officer_stundart') ? 920 : 660;
            enemy.shootCooldown = activeUpgrades.includes('officer_stundart') ? 2.5 : 3.6;
            firesBullet = {
              x: enemy.x,
              y: enemy.y,
              vx: Math.cos(enemy.aimAngle || 0) * shotSpeed,
              vy: Math.sin(enemy.aimAngle || 0) * shotSpeed,
              speed: shotSpeed,
              damage: 1,
              isStunDart: true,
            };
          }
        } else if ((enemy.shootCooldown || 0) <= 0 && dist >= 90 && dist <= 620) {
          const lineClear = !isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls);
          if (lineClear) {
            enemy.isAiming = true;
            enemy.aimTelegraphTimer = activeUpgrades.includes('officer_stundart') ? 0.38 : 0.55;
            enemy.aimAngle = Math.atan2(dy, dx);
            if (activeUpgrades.includes('officer_squad_radios')) {
              for (const other of allEnemies) {
                if (other.archetype === 'officer' && !other.isAlerted && distanceSq(enemy.x, enemy.y, other.x, other.y) < 500 * 500) {
                  other.isAlerted = true;
                  other.isSirenActive = true;
                }
              }
            }
          }
        }
      }
      break;
    }

    case 'delinquent': {
      enemy.batAngle = (enemy.batAngle || 0) + dt * 4;
      if (enemy.isShiny && isPlayerLockedByThisEnemy && !isPlayerImperviousNow) {
        enemy.isDashing = true;
        currentSpeed *= 1.85;
        break;
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
        currentSpeed *= 1.65;
        if (activeUpgrades.includes('delinquent_territory_burn') && Math.random() < dt * 4.5) {
          dropsPuddle = { x: enemy.x, y: enemy.y, type: 'skidmark' };
        }
      }
      if (activeUpgrades.includes('delinquent_smoke_bomb')) {
        enemy.smokeCooldown = (enemy.smokeCooldown ?? 4.5) - dt;
        if (enemy.smokeCooldown <= 0 && dist < 420) {
          enemy.smokeCooldown = 7.5 + Math.random() * 2.0;
          dropsPuddle = { x: enemy.x, y: enemy.y, type: 'smoke' };
        }
      }
      break;
    }

    case 'tomboy': {
      if (activeUpgrades.includes('tomboy_bear_hug')) {
        enemy.radius = 23;
      }
      if (enemy.isShiny) {
        // Shiny Tomboy Roxie: Always tackles before contact! If player is already knocked out by her tackle, she runs up to them.
        if (isPlayerLockedByThisEnemy && !isPlayerImperviousNow) {
          enemy.isDashing = false;
          enemy.isSliding = false;
          currentSpeed *= 1.65;
        } else if (dist <= 195) {
          enemy.isDashing = true;
          enemy.isSliding = true;
          currentSpeed *= 2.25;
        } else {
          enemy.isDashing = false;
          enemy.isSliding = false;
          currentSpeed *= 1.25;
        }
        // Apply visible weave displacement when dodging bullets
        if ((enemy.dodgeAnimTimer ?? 0) > 0) {
          const perpX = -dirY * (enemy.dodgeDir ?? 1);
          const perpY = dirX * (enemy.dodgeDir ?? 1);
          moveX = moveX * 0.45 + perpX * 0.85;
          moveY = moveY * 0.45 + perpY * 0.85;
          const mLen = Math.hypot(moveX, moveY) || 1;
          moveX /= mLen;
          moveY /= mLen;
          currentSpeed *= 1.35;
        }
        break;
      }

      const dashMultiplier = activeUpgrades.includes('tomboy_track_spikes') ? 2.15 : 1.85;
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
      if (activeUpgrades.includes('tomboy_slide_tackle')) {
        if (enemy.slideTimer && enemy.slideTimer > 0) {
          enemy.slideTimer -= dt;
          enemy.isSliding = true;
          currentSpeed *= 1.55;
          if (enemy.slideTimer <= 0) enemy.isSliding = false;
        } else if (!enemy.isDashing && dist < 280 && dist > 60 && Math.random() < dt * 0.45) {
          enemy.slideTimer = 0.65;
          enemy.isSliding = true;
        }
      }
      break;
    }

    case 'goth': {
      if (enemy.isShiny) {
        // Shiny Goth Raven: Doesn't walk! Teleports erratically with an occult destination sigil telegraph before each blink.
        // Once close enough, she jumpscares the player, giggles, then slowly approaches on foot for the animation!
        if (!enemy.hasJumpscaredPlayer && !isPlayerLockedByThisEnemy) {
          currentSpeed = 0; // Doesn't move between teleports!
          moveX = 0;
          moveY = 0;

          if (enemy.teleportTelegraphTimer !== undefined && enemy.teleportTelegraphTimer > 0) {
            enemy.teleportTelegraphTimer -= dt;
            if (enemy.teleportTelegraphTimer <= 0) {
              if (enemy.teleportTargetX !== undefined && enemy.teleportTargetY !== undefined) {
                enemy.x = enemy.teleportTargetX;
                enemy.y = enemy.teleportTargetY;
              }
              enemy.teleportTelegraphTimer = undefined;
              enemy.teleportTargetX = undefined;
              enemy.teleportTargetY = undefined;
              enemy.specialTimer = 0.34 + Math.random() * 0.22;

              const newDist = Math.hypot(playerX - enemy.x, playerY - enemy.y);
              if (newDist <= 135 && !isPlayerImperviousNow) {
                enemy.hasJumpscaredPlayer = true;
                triggersJumpscare = true;
                enemy.speechText = 'Hehehe~ Scared of the dark, darling? ♥';
                enemy.speechTimer = 3.2;
              }
            }
          } else if (enemy.specialTimer <= 0) {
            const erraticOffset = (Math.random() - 0.5) * 1.75;
            const tpAngle = Math.atan2(dy, dx) + erraticOffset;
            const tpStep = Math.min(dist * 0.52 + 65, 155);
            let candX = Math.max(180, Math.min(arenaWidth - 180, enemy.x + Math.cos(tpAngle) * tpStep));
            let candY = Math.max(180, Math.min(arenaHeight - 180, enemy.y + Math.sin(tpAngle) * tpStep));
            for (const w of walls) {
              const res = resolveCircleBoxCollision(candX, candY, enemy.radius + 4, w.x, w.y, w.w, w.h);
              if (res.collided) {
                candX = res.x;
                candY = res.y;
              }
            }
            enemy.teleportTargetX = candX;
            enemy.teleportTargetY = candY;
            enemy.teleportTelegraphTimer = 0.38;
          }
        } else {
          // After jumpscaring, clear any pending telegraph and slowly approach the dazed player!
          enemy.teleportTelegraphTimer = undefined;
          enemy.teleportTargetX = undefined;
          enemy.teleportTargetY = undefined;
          currentSpeed = enemy.baseSpeed * 0.82;
        }
        break;
      }

      const teleportCooldown = activeUpgrades.includes('goth_shadow_slip') ? 1.8 : 3.5;
      const teleportDist = activeUpgrades.includes('goth_shadow_slip') ? 140 : 95;
      if (enemy.teleportTelegraphTimer !== undefined && enemy.teleportTelegraphTimer > 0) {
        enemy.teleportTelegraphTimer -= dt;
        currentSpeed *= 0.6;
        if (enemy.teleportTelegraphTimer <= 0) {
          if (enemy.teleportTargetX !== undefined && enemy.teleportTargetY !== undefined) {
            enemy.x = enemy.teleportTargetX;
            enemy.y = enemy.teleportTargetY;
          }
          enemy.teleportTelegraphTimer = undefined;
          enemy.teleportTargetX = undefined;
          enemy.teleportTargetY = undefined;
          enemy.specialTimer = teleportCooldown;
        }
      } else if (enemy.specialTimer <= 0 && dist > 120) {
        let candX = Math.max(160, Math.min(arenaWidth - 160, enemy.x + dirX * teleportDist));
        let candY = Math.max(160, Math.min(arenaHeight - 160, enemy.y + dirY * teleportDist));
        for (const w of walls) {
          const res = resolveCircleBoxCollision(candX, candY, enemy.radius + 4, w.x, w.y, w.w, w.h);
          if (res.collided) {
            candX = res.x;
            candY = res.y;
          }
        }
        enemy.teleportTargetX = candX;
        enemy.teleportTargetY = candY;
        enemy.teleportTelegraphTimer = 0.48;
      }

      if (activeUpgrades.includes('goth_spectral_chains')) {
        enemy.tetherCooldown = (enemy.tetherCooldown ?? 4.0) - dt;
        if (enemy.tetherCooldown <= 0 && dist < 380) {
          enemy.tetherCooldown = 6.2;
          dropsPuddle = {
            x: playerX + (enemy.x - playerX) * 0.35,
            y: playerY + (enemy.y - playerY) * 0.35,
            type: 'shadow_hand',
          };
        }
      }
      break;
    }

    case 'hacker': {
      // HACKER NATSUKI: Periodically stops at on-screen weapon pickups OR support care drops and works on her laptop for 2 seconds to sabotage them!
      let cheerCount = 0;
      const hasRaidPing = activeUpgrades.includes('hacker_hype_squad') || activeUpgrades.includes('gyaru_hype_squad');
      const cheerRange = hasRaidPing ? 190 : 140;
      for (const other of allEnemies) {
        if (other.id !== enemy.id) {
          const d2 = distanceSq(enemy.x, enemy.y, other.x, other.y);
          if (d2 < cheerRange * cheerRange && (other.archetype === 'hacker' || hasRaidPing)) {
            cheerCount++;
            other.speedMultiplier = hasRaidPing ? 1.22 : 1.14;
          }
        }
      }
      if (cheerCount > 0) currentSpeed *= 1.14;

      if (activeUpgrades.includes('hacker_ring_light')) {
        currentSpeed *= 1.18;
      }

      if (activeUpgrades.includes('hacker_platform_stomp') || activeUpgrades.includes('gyaru_platform_stomp')) {
        enemy.stompWaveTimer = (enemy.stompWaveTimer ?? 2.5) - dt;
        if (enemy.stompWaveTimer <= 0) {
          enemy.stompWaveTimer = 3.0;
          enemy.stompWaveRadius = 20;
        }
        if (enemy.stompWaveRadius && enemy.stompWaveRadius > 0) {
          enemy.stompWaveRadius += dt * 150;
          currentSpeed *= 1.18;
          if (enemy.stompWaveRadius > 85) {
            enemy.stompWaveRadius = 0;
          }
        }
      }

      // If Shiny Natsuki's sabotaged gun/item just stunned the player, she cancels any hack and rushes straight over!
      if (
        enemy.isShiny &&
        !isPlayerImperviousNow &&
        (enemy.isRushingToSabotagedPlayer || enemy.rushingToSabotagedPlayer || isPlayerLockedByThisEnemy)
      ) {
        enemy.hackingPickupId = undefined;
        enemy.hackingMedkitId = undefined;
        enemy.hackingTargetPickupId = undefined;
        enemy.hackingTimer = undefined;
        currentSpeed *= 1.95;
        break;
      }

      const isPointOnScreen = (px: number, py: number) => {
        if (!viewportBounds) return true;
        if ('minX' in viewportBounds) {
          return (
            px >= viewportBounds.minX + 24 &&
            px <= viewportBounds.maxX - 24 &&
            py >= viewportBounds.minY + 24 &&
            py <= viewportBounds.maxY - 24
          );
        }
        return (
          px >= viewportBounds.x + 24 &&
          px <= viewportBounds.x + viewportBounds.w - 24 &&
          py >= viewportBounds.y + 24 &&
          py <= viewportBounds.y + viewportBounds.h - 24
        );
      };

      const hasPickupsAvailable =
        (weaponPickups && weaponPickups.length > 0) || (medkitPickups && medkitPickups.length > 0);

      // Check active hacking state or look for an on-screen un-sabotaged weapon OR support item pickup
      if (hasPickupsAvailable && isPointOnScreen(enemy.x, enemy.y)) {
        if (enemy.hackingPickupId !== undefined) {
          const targetPickup = (weaponPickups || []).find(
            (p) => p.id === enemy.hackingPickupId && !p.isSabotaged && isPointOnScreen(p.x, p.y)
          );
          if (!targetPickup) {
            enemy.hackingPickupId = undefined;
            enemy.hackingTimer = undefined;
          } else {
            const distToPickup = Math.hypot(targetPickup.x - enemy.x, targetPickup.y - enemy.y);
            if (distToPickup <= 34) {
              moveX = 0;
              moveY = 0;
              currentSpeed = 0;
              enemy.angle = Math.atan2(targetPickup.y - enemy.y, targetPickup.x - enemy.x);
              enemy.hackingTimer = (enemy.hackingTimer ?? 2.0) - dt;
              if (enemy.speechTimer <= 0) {
                enemy.speechText = 'Uploading weapon malware... 💻';
                enemy.speechTimer = 1.2;
              }
              if (enemy.hackingTimer <= 0) {
                targetPickup.isSabotaged = true;
                targetPickup.sabotagedByEnemyId = enemy.id;
                targetPickup.sabotagedByShiny = Boolean(enemy.isShiny);
                completedHackPickupId = targetPickup.id;
                enemy.hackingPickupId = undefined;
                enemy.hackingTimer = undefined;
                enemy.hackCooldown = enemy.isShiny ? 3.2 : 5.5;
                enemy.speechText = 'Hehe, weapon rigged~ Go ahead, pick it up! ♥';
                enemy.speechTimer = 2.4;
              }
            } else {
              const pickupSteer = computeSmartSteering(
                enemy,
                targetPickup.x,
                targetPickup.y,
                walls,
                doorways,
                breachPoints,
                mapId
              );
              moveX = pickupSteer.moveX;
              moveY = pickupSteer.moveY;
              enemy.angle = Math.atan2(moveY, moveX);
              currentSpeed *= 1.25;
            }
          }
        } else if (enemy.hackingMedkitId !== undefined) {
          const targetMedkit = (medkitPickups || []).find(
            (m) => m.id === enemy.hackingMedkitId && !m.isSabotaged && isPointOnScreen(m.x, m.y)
          );
          if (!targetMedkit) {
            enemy.hackingMedkitId = undefined;
            enemy.hackingTimer = undefined;
          } else {
            const distToMed = Math.hypot(targetMedkit.x - enemy.x, targetMedkit.y - enemy.y);
            if (distToMed <= 34) {
              moveX = 0;
              moveY = 0;
              currentSpeed = 0;
              enemy.angle = Math.atan2(targetMedkit.y - enemy.y, targetMedkit.x - enemy.x);
              enemy.hackingTimer = (enemy.hackingTimer ?? 2.0) - dt;
              if (enemy.speechTimer <= 0) {
                enemy.speechText = 'Rigging care package... 💻';
                enemy.speechTimer = 1.2;
              }
              if (enemy.hackingTimer <= 0) {
                targetMedkit.isSabotaged = true;
                targetMedkit.sabotagedByEnemyId = enemy.id;
                targetMedkit.sabotagedByShiny = Boolean(enemy.isShiny);
                enemy.hackingMedkitId = undefined;
                enemy.hackingTimer = undefined;
                enemy.hackCooldown = enemy.isShiny ? 3.2 : 5.5;
                enemy.speechText = 'Care drop hacked~ Enjoy your surprise! ♥';
                enemy.speechTimer = 2.4;
              }
            } else {
              const medSteer = computeSmartSteering(
                enemy,
                targetMedkit.x,
                targetMedkit.y,
                walls,
                doorways,
                breachPoints,
                mapId
              );
              moveX = medSteer.moveX;
              moveY = medSteer.moveY;
              enemy.angle = Math.atan2(moveY, moveX);
              currentSpeed *= 1.25;
            }
          }
        } else if ((enemy.hackCooldown ?? 0) <= 0) {
          // Find nearest un-sabotaged weapon OR support item pickup currently on screen
          let nearestWeapon: WeaponPickupState | undefined = undefined;
          let nearestMedkit: MedkitPickup | undefined = undefined;
          let bestDist = 480;

          for (const p of weaponPickups || []) {
            if (!p.isSabotaged && isPointOnScreen(p.x, p.y)) {
              const d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
              if (d < bestDist) {
                bestDist = d;
                nearestWeapon = p;
                nearestMedkit = undefined;
              }
            }
          }
          for (const m of medkitPickups || []) {
            if (!m.isSabotaged && isPointOnScreen(m.x, m.y)) {
              const d = Math.hypot(m.x - enemy.x, m.y - enemy.y);
              if (d < bestDist) {
                bestDist = d;
                nearestMedkit = m;
                nearestWeapon = undefined;
              }
            }
          }

          if (nearestWeapon) {
            enemy.hackingPickupId = nearestWeapon.id;
            enemy.hackingTimer = 2.0;
          } else if (nearestMedkit) {
            enemy.hackingMedkitId = nearestMedkit.id;
            enemy.hackingTimer = 2.0;
          }
        }
      } else {
        // Off-screen guard: never sabotage off screen
        enemy.hackingPickupId = undefined;
        enemy.hackingMedkitId = undefined;
        enemy.hackingTimer = undefined;
      }
      break;
    }

    case 'senpai': {
      if (activeUpgrades.includes('senpai_term_paper_barrier') && enemy.paperShieldHits === undefined) {
        enemy.paperShieldHits = 3;
      }
      if (enemy.isShiny && isPlayerLockedByThisEnemy && !isPlayerImperviousNow) {
        currentSpeed *= 1.75; // Hurry over to catch the slipped player!
        break;
      }
      const puddleInterval = enemy.isShiny
        ? 1.85
        : activeUpgrades.includes('senpai_espresso_rush')
        ? 2.2
        : 4.2;
      if (enemy.specialTimer <= 0) {
        // Shiny Senpai pitches her coffee slightly ahead toward the player if close!
        const dropOffset = enemy.isShiny && dist < 240 ? Math.min(68, dist * 0.55) : 0;
        dropsPuddle = {
          x: enemy.x + dirX * dropOffset,
          y: enemy.y + dirY * dropOffset,
          type: 'coffee',
          isShinyCoffee: Boolean(enemy.isShiny),
          sourceEnemyId: enemy.id,
        };
        enemy.specialTimer = puddleInterval;
      }
      if (activeUpgrades.includes('senpai_espresso_rush')) {
        currentSpeed *= 1.14;
      }
      break;
    }

    case 'yandere': {
      if (enemy.isShiny) {
        // Shiny Yandere Ayame: Stalks from afar; if player is harmed by another enemy, she enters jealousRageTimer (impervious + explosive charge)!
        if ((enemy.jealousRageTimer ?? 0) > 0 || (isPlayerLockedByThisEnemy && !isPlayerImperviousNow)) {
          currentSpeed = 355;
        } else {
          // Stalk from afar (maintain ~340-410px distance and circle)
          const perpX = -dirY;
          const perpY = dirX;
          if (dist < 310) {
            moveX = -dirX * 0.7 + perpX * 0.7;
            moveY = -dirY * 0.7 + perpY * 0.7;
            currentSpeed *= 1.05;
          } else if (dist > 420) {
            moveX = dirX * 0.85 + perpX * 0.45;
            moveY = dirY * 0.85 + perpY * 0.45;
            currentSpeed *= 1.12;
          } else {
            moveX = perpX;
            moveY = perpY;
            currentSpeed *= 0.88;
          }
          const mLen = Math.hypot(moveX, moveY) || 1;
          moveX /= mLen;
          moveY /= mLen;
        }
        break;
      }

      enemy.sightTimer = (enemy.sightTimer || 0) + dt;
      let yandereBonus = Math.min(1.42, 1.0 + enemy.sightTimer * 0.05);
      if (activeUpgrades.includes('yandere_red_string')) {
        yandereBonus *= 1.18;
      }
      if (activeUpgrades.includes('yandere_crimson_frenzy') && enemy.hp < enemy.maxHp * 0.5) {
        yandereBonus *= 1.18;
      }
      currentSpeed *= yandereBonus;

      if (activeUpgrades.includes('yandere_obsessive_phase') && dist > 550) {
        enemy.x = playerX - dirX * 220;
        enemy.y = playerY - dirY * 220;
      }

      if (activeUpgrades.includes('yandere_heart_barrage')) {
        enemy.shootCooldown = (enemy.shootCooldown ?? 3.4) - dt;
        if (enemy.shootCooldown <= 0 && dist < 480) {
          enemy.shootCooldown = 3.8 + Math.random() * 1.2;
          const baseAngle = Math.atan2(dy, dx);
          const fanAngles = [-0.28, 0, 0.28];
          const needleSpeed = 520;
          firesBullets = fanAngles.map((fan) => ({
            x: enemy.x,
            y: enemy.y,
            vx: Math.cos(baseAngle + fan) * needleSpeed,
            vy: Math.sin(baseAngle + fan) * needleSpeed,
            speed: needleSpeed,
            damage: 1,
            isHeartNeedle: true,
          }));
        }
      }
      break;
    }

    case 'trainer': {
      // TRAINER MAYA & LARGE HOUND REX
      const pounceCooldown = activeUpgrades.includes('trainer_agility_command') ? 2.2 : 3.2;
      if (enemy.specialTimer <= 0) {
        if (!enemy.isDashing) {
          enemy.isDashing = true;
          enemy.dogLungeTimer = 0.9;
          enemy.specialTimer = 0.9;
          if (activeUpgrades.includes('trainer_double_lead')) {
            for (const other of allEnemies) {
              if (other.id !== enemy.id && distanceSq(enemy.x, enemy.y, other.x, other.y) < 200 * 200) {
                other.speedMultiplier = Math.max(other.speedMultiplier, 1.18);
              }
            }
          }
        } else {
          enemy.isDashing = false;
          enemy.dogLungeTimer = 0;
          enemy.specialTimer = pounceCooldown;
        }
      }

      // Smoothly interpolate dog lead extension instead of teleporting forward!
      // Normal limit = 82px; Lunge pulls the leash taut after extending 50% from the normal limit (123px)!
      const normalLeadLimit = 82;
      const tautLeadLimit = normalLeadLimit * 1.5; // 123px (+50% from normal limit)
      if (enemy.dogCurrentLead === undefined) {
        enemy.dogCurrentLead = normalLeadLimit;
      }

      if (enemy.isDashing) {
        const lungeRate = activeUpgrades.includes('trainer_agility_command') ? 160 : 120;
        enemy.dogCurrentLead = Math.min(tautLeadLimit, enemy.dogCurrentLead + lungeRate * dt);
        enemy.isLeashTaut = enemy.dogCurrentLead >= tautLeadLimit - 2;
        // Once the hound pulls the leash taut at +50% extension, it tugs Maya forward with extra momentum!
        const lungeMult = enemy.isLeashTaut
          ? activeUpgrades.includes('trainer_agility_command')
            ? 1.72
            : 1.52
          : 1.22;
        currentSpeed *= lungeMult;
        enemy.dogLungeTimer = Math.max(0, (enemy.dogLungeTimer ?? 0.9) - dt);
      } else {
        enemy.dogCurrentLead = Math.max(normalLeadLimit, enemy.dogCurrentLead - 95 * dt);
        enemy.isLeashTaut = false;
        if (activeUpgrades.includes('trainer_scent_hound') && dist < 380) {
          currentSpeed *= 1.15;
        }
      }

      const activePin = isPlayerLockedByThisEnemy && !isPlayerImperviousNow;
      if (isPlayerImperviousNow) {
        enemy.isHoundPinning = false;
      }

      // Maya Pathing Failsafe:
      // 1) When Rex has the player pinned, if Maya cannot path there or stalls for 1.3s (or 3.2s total), she vaults straight to the player.
      // 2) Even when not pinned, if Maya is obstructed by walls/furniture and fails to close distance toward the player for 2.4s,
      //    she executes an unobstructed failsafe vault toward the player so she can always reach you!
      const prevDist = enemy.lastPinDist ?? dist;
      const distProgress = prevDist - dist;
      enemy.lastPinDist = dist;

      if (activePin) {
        currentSpeed *= 1.55;
        enemy.pinTotalTimer = (enemy.pinTotalTimer ?? 0) + dt;
        if (distProgress < 20 * dt) {
          enemy.pinStuckTimer = (enemy.pinStuckTimer ?? 0) + dt;
        } else {
          enemy.pinStuckTimer = Math.max(0, (enemy.pinStuckTimer ?? 0) - dt * 0.5);
        }

        if ((enemy.pinStuckTimer ?? 0) >= 1.3 || (enemy.pinTotalTimer ?? 0) >= 3.2) {
          enemy.x = playerX - dirX * 22;
          enemy.y = playerY - dirY * 22;
          enemy.pinStuckTimer = 0;
          enemy.pinTotalTimer = 0;
          enemy.speechText = 'Coming right through! Good boy, Rex~ ♥';
          enemy.speechTimer = 2.2;
        }
      } else {
        enemy.pinTotalTimer = 0;
        const lineBlocked = isLineBlockedByWalls(enemy.x, enemy.y, playerX, playerY, walls, 12);
        if (lineBlocked && dist > 90 && distProgress < 14 * dt) {
          enemy.pinStuckTimer = (enemy.pinStuckTimer ?? 0) + dt;
          if (enemy.pinStuckTimer >= 2.4) {
            // Unobstructed failsafe vault toward the player!
            const stepDist = Math.min(dist - 36, 220);
            let candX = enemy.x + dirX * stepDist;
            let candY = enemy.y + dirY * stepDist;
            for (const w of walls) {
              const res = resolveCircleBoxCollision(candX, candY, enemy.radius + 6, w.x, w.y, w.w, w.h);
              if (res.collided) {
                candX = res.x;
                candY = res.y;
              }
            }
            enemy.x = candX;
            enemy.y = candY;
            if (!enemy.isShiny) {
              enemy.dogWorldX = enemy.x + dirX * (enemy.dogCurrentLead ?? normalLeadLimit);
              enemy.dogWorldY = enemy.y + dirY * (enemy.dogCurrentLead ?? normalLeadLimit);
            }
            enemy.pinStuckTimer = 0;
            enemy.speechText = 'Up and over! Nothing keeps Rex and me from you~ ♥';
            enemy.speechTimer = 2.2;
          }
        } else {
          enemy.pinStuckTimer = Math.max(0, (enemy.pinStuckTimer ?? 0) - dt * 0.8);
        }
      }

      // Update world-space Hound coordinates (`dogWorldX`, `dogWorldY`) smoothly without teleporting!
      if (enemy.dogWorldX === undefined && enemy.houndX !== undefined) {
        enemy.dogWorldX = enemy.houndX;
      }
      if (enemy.dogWorldY === undefined && enemy.houndY !== undefined) {
        enemy.dogWorldY = enemy.houndY;
      }
      if (enemy.isShiny) {
        // Shiny Trainer Maya is slower than her hound! She paces steadily behind while her off-leash Shiny Hound Rex
        // uses smart multi-waypoint & corner-feeler pathfinding to hunt and pin the player!
        const activePinNow = isPlayerLockedByThisEnemy && !isPlayerImperviousNow;
        currentSpeed = enemy.baseSpeed * (activePinNow ? 1.28 : 0.78);

        if (enemy.dogWorldX === undefined || enemy.dogWorldY === undefined) {
          enemy.dogWorldX = enemy.x + dirX * 42;
          enemy.dogWorldY = enemy.y + dirY * 42;
        }
        if ((enemy.dogKnockoutTimer ?? 0) <= 0) {
          if (activePinNow) {
            enemy.dogWorldX = playerX;
            enemy.dogWorldY = playerY;
          } else {
            // Smart pathfinding for Shiny Hound Rex around obstacles, doorways, and breaches!
            const virtualHound: EnemyState = {
              ...enemy,
              x: enemy.dogWorldX,
              y: enemy.dogWorldY,
              radius: 15,
              angle: Math.atan2(playerY - enemy.dogWorldY, playerX - enemy.dogWorldX),
              pathCommitAngle: enemy.dogPathCommitAngle,
              pathCommitTimer: enemy.dogPathCommitTimer,
            };
            const houndSteer = computeSmartSteering(
              virtualHound,
              playerX,
              playerY,
              walls,
              doorways,
              breachPoints,
              mapId
            );
            enemy.dogPathCommitAngle = virtualHound.pathCommitAngle;
            enemy.dogPathCommitTimer = Math.max(0, (virtualHound.pathCommitTimer ?? 0) - dt);

            const dogSpeed = enemy.isDashing ? 285 : 242;
            enemy.dogWorldX += houndSteer.moveX * dogSpeed * dt;
            enemy.dogWorldY += houndSteer.moveY * dogSpeed * dt;

            for (const w of walls) {
              const res = resolveCircleBoxCollision(enemy.dogWorldX, enemy.dogWorldY, 15, w.x, w.y, w.w, w.h);
              if (res.collided) {
                const pushDx = res.x - enemy.dogWorldX;
                const pushDy = res.y - enemy.dogWorldY;
                enemy.dogWorldX = res.x;
                enemy.dogWorldY = res.y;
                // Smooth wall-sliding for Shiny Hound Rex so he never snags on corners!
                if (Math.abs(pushDx) > Math.abs(pushDy)) {
                  const slideSign = playerY - enemy.dogWorldY >= 0 ? 1 : -1;
                  enemy.dogWorldY += slideSign * dogSpeed * dt * 0.55;
                } else {
                  const slideSign = playerX - enemy.dogWorldX >= 0 ? 1 : -1;
                  enemy.dogWorldX += slideSign * dogSpeed * dt * 0.55;
                }
              }
            }
          }
        }
      } else {
        // Standard Trainer Maya: Large hound moves smoothly toward its lead target up to +50% taut limit (never teleports!)
        if (activePin) {
          enemy.dogWorldX = playerX;
          enemy.dogWorldY = playerY;
        } else {
          const leadExtension = enemy.dogCurrentLead ?? normalLeadLimit;
          const targetDogX = enemy.x + dirX * leadExtension;
          const targetDogY = enemy.y + dirY * leadExtension;
          if (enemy.dogWorldX === undefined || enemy.dogWorldY === undefined) {
            enemy.dogWorldX = targetDogX;
            enemy.dogWorldY = targetDogY;
          } else {
            const toTargetX = targetDogX - enemy.dogWorldX;
            const toTargetY = targetDogY - enemy.dogWorldY;
            const toTargetDist = Math.hypot(toTargetX, toTargetY);
            const maxDogStep = (currentSpeed + 180) * dt;
            if (toTargetDist <= maxDogStep || toTargetDist < 0.001) {
              enemy.dogWorldX = targetDogX;
              enemy.dogWorldY = targetDogY;
            } else {
              enemy.dogWorldX += (toTargetX / toTargetDist) * maxDogStep;
              enemy.dogWorldY += (toTargetY / toTargetDist) * maxDogStep;
            }
            // Clamp hound within tautLeadLimit from Maya so the leash never stretches beyond +50%
            const fromMayaX = enemy.dogWorldX - enemy.x;
            const fromMayaY = enemy.dogWorldY - enemy.y;
            const fromMayaDist = Math.hypot(fromMayaX, fromMayaY) || 1;
            if (fromMayaDist > tautLeadLimit) {
              enemy.dogWorldX = enemy.x + (fromMayaX / fromMayaDist) * tautLeadLimit;
              enemy.dogWorldY = enemy.y + (fromMayaY / fromMayaDist) * tautLeadLimit;
              enemy.isLeashTaut = true;
            }
          }
        }
      }
      break;
    }
  }

  // Cap overall enemy speed so even with stacked buffs/dashes they never become impossibly fast
  const maxAllowedSpeed =
    enemy.isShiny && enemy.archetype === 'yandere' && (enemy.jealousRageTimer ?? 0) > 0
      ? 365
      : enemy.isDashing || enemy.isSliding || isPlayerLockedByThisEnemy
      ? 320
      : 255;
  currentSpeed = Math.min(currentSpeed, maxAllowedSpeed);

  // Knockback decay (gentler decay during knockbackStaggerTimer so the Immortal Winner can be meaningfully pushed back!)
  const kbDecayRate = enemy.knockbackStaggerTimer && enemy.knockbackStaggerTimer > 0 ? 4.2 : 8.0;
  enemy.knockbackVx *= Math.max(0, 1 - dt * kbDecayRate);
  enemy.knockbackVy *= Math.max(0, 1 - dt * kbDecayRate);

  // Dampen forward AI velocity while staggered by knockback so shots visibly push the winning woman away!
  const steerBlend =
    enemy.knockbackStaggerTimer && enemy.knockbackStaggerTimer > 0
      ? Math.max(0.12, 1 - (enemy.knockbackStaggerTimer / 0.28) * 0.85)
      : 1.0;

  // City Traffic Crosswalk Awareness: enemies smartly yield at curbs/crosswalks when a fast car is approaching their lane!
  if (mapId === 'city' && cars && cars.length > 0) {
    const nextY = enemy.y + moveY * currentSpeed * dt * 6;
    for (const car of cars) {
      const inCarLaneBand = Math.abs(nextY - car.y) < car.h * 0.88 + enemy.radius;
      if (inCarLaneBand) {
        // Check if car is approaching enemy's X coordinate within the next ~0.65 seconds
        const relX = enemy.x - car.x;
        const approaching = (car.vx > 0 && relX > -car.w * 0.6 && relX < 250) || (car.vx < 0 && relX < car.w * 0.6 && relX > -250);
        if (approaching) {
          const alreadyInLane = Math.abs(enemy.y - car.y) < car.h * 0.65 + enemy.radius;
          if (!alreadyInLane) {
            // Pause smartly at the curb/crosswalk until the vehicle passes!
            moveY = 0;
            currentSpeed *= 0.25;
          } else {
            // Quickly step out of the lane toward the closer curb!
            moveY = enemy.y < car.y ? -1 : 1;
            currentSpeed = Math.max(currentSpeed, 220);
          }
          break;
        }
      }
    }
  }

  // Sunset Beach Tide Drag: shallow surging tide water gently slows wading movement
  if (mapId === 'beach') {
    const tideY = getBeachTideSurgeY(survivalTime, arenaHeight);
    if (enemy.y > tideY) {
      currentSpeed *= 0.85;
    }
  }

  enemy.vx = moveX * currentSpeed * steerBlend + enemy.knockbackVx;
  enemy.vy = moveY * currentSpeed * steerBlend + enemy.knockbackVy;

  enemy.x += enemy.vx * dt;
  enemy.y += enemy.vy * dt;

  // Keep standard Maya's leashed hound synced after Maya's position updates, and check Hound front-stun / rear-pin!
  if (enemy.archetype === 'trainer') {
    const activePin = isPlayerLockedByThisEnemy && !isPlayerImperviousNow;
    const maxLeashAfterMove = 82 * 1.5; // 123px (+50% taut limit)
    if (!enemy.isShiny && !activePin && enemy.dogWorldX !== undefined && enemy.dogWorldY !== undefined) {
      enemy.dogWorldX += enemy.vx * dt;
      enemy.dogWorldY += enemy.vy * dt;
      for (const w of walls) {
        const res = resolveCircleBoxCollision(enemy.dogWorldX, enemy.dogWorldY, 15, w.x, w.y, w.w, w.h);
        if (res.collided) {
          enemy.dogWorldX = res.x;
          enemy.dogWorldY = res.y;
        }
      }
      const fromMayaX = enemy.dogWorldX - enemy.x;
      const fromMayaY = enemy.dogWorldY - enemy.y;
      const fromMayaDist = Math.hypot(fromMayaX, fromMayaY) || 1;
      if (fromMayaDist > maxLeashAfterMove) {
        enemy.dogWorldX = enemy.x + (fromMayaX / fromMayaDist) * maxLeashAfterMove;
        enemy.dogWorldY = enemy.y + (fromMayaY / fromMayaDist) * maxLeashAfterMove;
        enemy.isLeashTaut = true;
      }
    }
    enemy.houndWorldX = enemy.dogWorldX;
    enemy.houndWorldY = enemy.dogWorldY;
    enemy.houndX = enemy.dogWorldX;
    enemy.houndY = enemy.dogWorldY;
    enemy.isHoundPinning = activePin;

    // Never stun or pin the player while the player is impervious!
    if (
      !isPlayerImperviousNow &&
      (enemy.dogKnockoutTimer ?? 0) <= 0 &&
      enemy.dogWorldX !== undefined &&
      enemy.dogWorldY !== undefined &&
      !activePin
    ) {
      const hDx = enemy.dogWorldX - playerX;
      const hDy = enemy.dogWorldY - playerY;
      const hDist = Math.hypot(hDx, hDy);
      if (hDist <= 30) {
        if (enemy.isShiny) {
          // Shiny Trainer Maya's off-leash hound pins on contact from any direction!
          houndRearPin = true;
          enemy.isHoundPinning = true;
        } else {
          // Standard Hound Rex: Front hit stuns; catching from behind pins until Maya approaches!
          const forwardX = Math.cos(playerAngle);
          const forwardY = Math.sin(playerAngle);
          const normHDx = hDx / (hDist || 1);
          const normHDy = hDy / (hDist || 1);
          const dotFront = normHDx * forwardX + normHDy * forwardY;
          if (dotFront < 0.05) {
            // Caught from behind or rear flank!
            houndRearPin = true;
            enemy.isHoundPinning = true;
          } else if ((enemy.houndFrontStunCooldown ?? 0) <= 0) {
            houndFrontStun = true;
            enemy.houndFrontStunCooldown = 2.0;
          }
        }
      }
    }
  }

  // Resolve Wall Collisions with smooth tangent wall-sliding so enemies never get stuck on corners or breach jambs
  for (const w of walls) {
    const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, w.x, w.y, w.w, w.h);
    if (res.collided) {
      const pushDx = res.x - enemy.x;
      const pushDy = res.y - enemy.y;
      enemy.x = res.x;
      enemy.y = res.y;

      // If near an open breach point in Suburban Home, nudge toward the breach opening's center line so enemies never snag on the wall gap!
      let guidedToBreachGap = false;
      if (mapId === 'home' && breachPoints) {
        for (const bp of breachPoints) {
          if (!bp.isBarricaded || (bp.barricadeHp || 0) <= 0) {
            const bpCenterX = bp.x + bp.w / 2;
            const bpCenterY = bp.y + bp.h / 2;
            if (Math.hypot(bpCenterX - enemy.x, bpCenterY - enemy.y) < 88) {
              guidedToBreachGap = true;
              if (bp.w > bp.h) {
                const signX = bpCenterX >= enemy.x ? 1 : -1;
                enemy.x += signX * currentSpeed * dt * 0.7;
              } else {
                const signY = bpCenterY >= enemy.y ? 1 : -1;
                enemy.y += signY * currentSpeed * dt * 0.7;
              }
              break;
            }
          }
        }
      }

      if (!guidedToBreachGap) {
        // Slide smoothly along the wall tangent toward the target
        if (Math.abs(pushDx) > Math.abs(pushDy)) {
          const slideSign = dy >= 0 ? 1 : -1;
          enemy.y += slideSign * currentSpeed * dt * 0.55;
        } else {
          const slideSign = dx >= 0 ? 1 : -1;
          enemy.x += slideSign * currentSpeed * dt * 0.55;
        }
      }
    }
  }

  // Resolve Intact Barricade Collisions in Suburban Home so enemies cannot walk through unbreached planks
  if (mapId === 'home' && breachPoints) {
    for (const bp of breachPoints) {
      if (bp.isBarricaded && (bp.barricadeHp || 0) > 0) {
        const res = resolveCircleBoxCollision(enemy.x, enemy.y, enemy.radius, bp.x, bp.y, bp.w, bp.h);
        if (res.collided) {
          enemy.x = res.x;
          enemy.y = res.y;
        }
      }
    }
  }

  // Haunted Mansion interior bounds enforcement so no enemy (including Goth/Yandere phasing or knockback) ever gets trapped outside the manor walls
  if (mapId === 'mansion') {
    const minMansionX = 166 + enemy.radius + 4;
    const maxMansionX = 2234 - enemy.radius - 4;
    const minMansionY = 166 + enemy.radius + 4;
    const maxMansionY = 1834 - enemy.radius - 4;
    enemy.x = Math.max(minMansionX, Math.min(maxMansionX, enemy.x));
    enemy.y = Math.max(minMansionY, Math.min(maxMansionY, enemy.y));
  } else {
    enemy.x = Math.max(enemy.radius, Math.min(arenaWidth - enemy.radius, enemy.x));
    enemy.y = Math.max(enemy.radius, Math.min(arenaHeight - enemy.radius, enemy.y));
  }

  if (enemy.hitFlashTimer > 0) enemy.hitFlashTimer -= dt;

  return {
    dropsPuddle,
    requestsOfficerBackup,
    shinySpecial,
    attackingBreach,
    triggersStrobeFlash,
    triggersJumpscare,
    completedHackPickupId,
    houndFrontStun,
    houndRearPin,
    firesBullet,
    firesBullets,
    shinyAttack,
  };
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
  memoSnare: boolean;
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
  loveLetterFlurry: boolean;
  scentTrail: boolean;
  leashTug: boolean;
  fetchDrift: boolean;
  agilityHurdles: boolean;
  whistleSpread: boolean;
  pawNudge: boolean;
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
  let memoSnare = false;
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
  let loveLetterFlurry = false;
  let scentTrail = false;
  let leashTug = false;
  let fetchDrift = false;
  let agilityHurdles = false;
  let whistleSpread = false;
  let pawNudge = false;

  for (const d of debuffs) {
    if (d.effectType === 'slow') speed *= d.effectValue;
    if (d.effectType === 'damage_penalty') damageMultiplier *= d.effectValue;
    if (d.effectType === 'spread_increase') spreadMultiplier *= d.effectValue;
    if (d.effectType === 'fire_rate') fireIntervalMultiplier /= d.effectValue;
    if (d.effectType === 'knockback_taken') knockbackTakenMultiplier *= d.effectValue;
    if (d.effectType === 'knockback_dealt') knockbackDealtMultiplier *= d.effectValue;
    if (d.effectType === 'radar_glitch') isRadarGlitched = true;
    if (d.effectType === 'burst_lock') {
      burstLock = true;
      recoilPull = Math.max(recoilPull, 0.7);
    }
    if (d.effectType === 'drift_momentum') driftMomentum = 0.93; // Slipperiness
    if (d.effectType === 'crosshair_sway') crosshairSway = d.effectValue || 1.4;
    if (d.effectType === 'disarm_on_hit') disarmOnHit = true;
    if (d.effectType === 'recoil_pull') recoilPull = d.effectValue || 1.2;
    if (d.effectType === 'periodic_twitch') periodicTwitchInterval = d.effectValue || 8.0;
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
    if (d.effectType === 'bullet_decay') bulletLifetimeMultiplier = d.effectValue || 0.7;
    if (d.effectType === 'splinter_shrapnel') splinterShrapnel = true;
    if (d.effectType === 'vignette_blur') vignetteBlur = true;
    if (d.effectType === 'tight_flank') {
      tightFlank = true;
      knockbackDealtMultiplier *= 0.5;
    }
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
    if (d.effectType === 'memo_snare') memoSnare = true;
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
    if (d.effectType === 'love_letter_flurry') loveLetterFlurry = true;
    if (d.effectType === 'scent_trail') scentTrail = true;
    if (d.effectType === 'leash_tug') leashTug = true;
    if (d.effectType === 'fetch_drift') fetchDrift = true;
    if (d.effectType === 'agility_hurdles') agilityHurdles = true;
    if (d.effectType === 'whistle_spread') whistleSpread = true;
    if (d.effectType === 'paw_nudge') pawNudge = true;
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
    pickupDelay: auditDelay ? 1.4 : pickupDelay,
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
    memoSnare,
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
    loveLetterFlurry,
    scentTrail,
    leashTug,
    fetchDrift,
    agilityHurdles,
    whistleSpread,
    pawNudge,
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

/** Returns the world-space Bed / Capture Mattress coordinates for each stage */
export function getMapBedPosition(mapId: MapType, arenaWidth: number, arenaHeight: number): Vector2 {
  switch (mapId) {
    case 'home':
      return { x: 1605 + HOME_OFFSET_X, y: 1205 + HOME_OFFSET_Y };
    case 'mansion':
      return { x: 1200, y: 310 };
    case 'city':
      return { x: 2050, y: 330 };
    case 'beach':
      return { x: 1840, y: 270 };
    case 'forest':
    default:
      return { x: arenaWidth * 0.5, y: 250 };
  }
}

export const NPC_FEMBOY_NAMES: Record<PlayerSkinId, string> = {
  astolfo: 'Astolfo',
  venti: 'Venti',
  felix: 'Felix',
  bridget: 'Bridget',
  nagisa: 'Nagisa',
};

/** Spawns a rare autonomous NPC Femboy survivor with a distinct skin from the player and any active companion */
export function createNpcFemboy(
  id: number,
  playerSkin: PlayerSkinId,
  existingNpcs: NpcFemboyState[],
  outfitMode: OutfitMode,
  mapId: MapType,
  arenaWidth: number,
  arenaHeight: number,
  walls: WallRect[]
): NpcFemboyState {
  const safeNpcs = Array.isArray(existingNpcs) ? existingNpcs : [];
  const usedSkins = new Set<PlayerSkinId>([playerSkin, ...safeNpcs.map((n) => n.skinId)]);
  const availableSkins = PLAYER_SKIN_IDS.filter((s) => !usedSkins.has(s));
  const skinId =
    availableSkins.length > 0
      ? availableSkins[Math.floor(Math.random() * availableSkins.length)]
      : PLAYER_SKIN_IDS[Math.floor(Math.random() * PLAYER_SKIN_IDS.length)];

  const margin = mapId === 'mansion' ? 280 : 220;
  let spawnX = arenaWidth * 0.5 + (Math.random() - 0.5) * 700;
  let spawnY = arenaHeight * 0.5 + (Math.random() - 0.5) * 550;

  for (let attempt = 0; attempt < 20; attempt++) {
    const candX = margin + Math.random() * (arenaWidth - margin * 2);
    const candY = margin + Math.random() * (arenaHeight - margin * 2);
    const hitWall = walls.some(
      (w) => candX >= w.x - 28 && candX <= w.x + w.w + 28 && candY >= w.y - 28 && candY <= w.y + w.h + 28
    );
    if (!hitWall) {
      spawnX = candX;
      spawnY = candY;
      break;
    }
  }

  const greetings = GAME_TEXT.npcFemboyDialogue.spawnGreetings;
  const starterWeapons = ['pistol', 'dual', 'smg'];
  const activeWeaponKey = starterWeapons[Math.floor(Math.random() * starterWeapons.length)];

  return {
    id,
    skinId,
    name: NPC_FEMBOY_NAMES[skinId],
    outfitMode,
    x: spawnX,
    y: spawnY,
    vx: 0,
    vy: 0,
    speed: 232,
    radius: 16,
    angle: Math.random() * Math.PI * 2,
    hp: 3,
    maxHp: 3,
    invincibleTimer: 2.0,
    dazeTimer: 0,
    activeWeaponKey,
    ammo: activeWeaponKey === 'pistol' ? -1 : 90,
    fireCooldown: 0,
    aiMode: 'roaming',
    affinityScore: 0,
    isLoyalCompanion: false,
    struggleProgress: 0,
    struggleTimer: 0,
    roamTimer: 2.0,
    speechText: greetings[Math.floor(Math.random() * greetings.length)],
    speechTimer: 4.2,
    commentCooldown: 6.5,
  };
}

export interface NpcFemboyUpdateResult {
  spawnedBullets: BulletState[];
  eliminatedNpcIds: number[];
  rescuedPlayerFromCapture: boolean;
  notifications: Array<{ text: string; color: string }>;
}

/**
 * Updates all autonomous NPC Femboy survivors (max 2 active):
 * - Roams the stage, picks up weapons, comments on the environment
 * - Fights back against alerted pursuers & kites threats
 * - Rushes to shoot any enemy grabbing/dragging the player to rescue them!
 * - Follows the player loyally once the player has helped/rescued them enough (affinityScore >= 2)
 * - Experiences exact player-parity capture mechanics: on-the-spot struggle -> stamina loss -> dragged to bed -> permanent elimination on bed Game Over!
 */
export function updateNpcFemboys(
  npcs: NpcFemboyState[],
  player: PlayerState,
  enemies: EnemyState[],
  walls: WallRect[],
  doorways: { x: number; y: number }[] | undefined,
  breachPoints: BreachPoint[] | undefined,
  mapId: MapType,
  dt: number,
  arenaWidth: number,
  arenaHeight: number,
  survivalTime: number,
  isPlayerCapturedNow: boolean,
  playerCaptorEnemyId: number | null,
  weaponPickups?: WeaponPickupState[],
  cars?: MovingCar[]
): NpcFemboyUpdateResult {
  const spawnedBullets: BulletState[] = [];
  const eliminatedNpcIds: number[] = [];
  let rescuedPlayerFromCapture = false;
  const notifications: Array<{ text: string; color: string }> = [];
  const bedPos = getMapBedPosition(mapId, arenaWidth, arenaHeight);

  for (const npc of npcs) {
    if (npc.invincibleTimer > 0) npc.invincibleTimer = Math.max(0, npc.invincibleTimer - dt);
    if (npc.dazeTimer > 0) npc.dazeTimer = Math.max(0, npc.dazeTimer - dt);
    if (npc.fireCooldown > 0) npc.fireCooldown = Math.max(0, npc.fireCooldown - dt);
    if (npc.speechTimer > 0) npc.speechTimer = Math.max(0, npc.speechTimer - dt);
    if (npc.commentCooldown > 0) npc.commentCooldown = Math.max(0, npc.commentCooldown - dt);
    if (npc.pathCommitTimer && npc.pathCommitTimer > 0) {
      npc.pathCommitTimer = Math.max(0, npc.pathCommitTimer - dt);
    }

    // 1. Check if currently in a Struggle or Being Dragged to the Bed
    if (npc.aiMode === 'captured_struggle' || npc.aiMode === 'captured_dragged') {
      const captor = enemies.find((e) => e.id === npc.capturedByEnemyId);

      // If captor was killed or knocked far away by the player, the NPC is RESCUED!
      if (!captor || Math.hypot(captor.x - npc.x, captor.y - npc.y) > 95) {
        npc.capturedByEnemyId = undefined;
        npc.invincibleTimer = 2.8;
        npc.struggleProgress = 0;
        npc.struggleTimer = 0;
        npc.affinityScore += 1;

        if (npc.affinityScore >= 2 && !npc.isLoyalCompanion) {
          npc.isLoyalCompanion = true;
          npc.aiMode = 'following_player';
          const joinLines = GAME_TEXT.npcFemboyDialogue.loyaltyFollowJoin;
          npc.speechText = joinLines[Math.floor(Math.random() * joinLines.length)];
          npc.speechTimer = 4.5;
          notifications.push({
            text: `💖 ${npc.name} now trusts you completely and will follow & guard you!`,
            color: '#f472b6',
          });
        } else {
          npc.aiMode = npc.isLoyalCompanion ? 'following_player' : 'roaming';
          const thankLines = GAME_TEXT.npcFemboyDialogue.thankPlayerForHelp;
          npc.speechText = thankLines[Math.floor(Math.random() * thankLines.length)];
          npc.speechTimer = 3.8;
          notifications.push({
            text: `✨ Rescued ${npc.name} from capture! (+Bond)`,
            color: '#38bdf8',
          });
        }
        continue;
      }

      if (npc.aiMode === 'captured_struggle') {
        // Keep NPC pinned next to captor during on-the-spot struggle
        npc.x = captor.x + Math.cos(captor.angle || 0) * 14;
        npc.y = captor.y + Math.sin(captor.angle || 0) * 14;
        npc.vx = 0;
        npc.vy = 0;
        npc.struggleTimer -= dt;
        // NPC struggles autonomously, building progress, but needs time or player gunfire to break free cleanly
        npc.struggleProgress = Math.min(100, npc.struggleProgress + dt * 18);

        if (npc.speechTimer <= 0) {
          const cries = GAME_TEXT.npcFemboyDialogue.struggleCries;
          npc.speechText = cries[Math.floor(Math.random() * cries.length)];
          npc.speechTimer = 2.6;
        }

        if (npc.struggleTimer <= 0) {
          // Struggle timer expired: NPC loses 1 Heart Stamina!
          npc.hp = Math.max(0, npc.hp - 1);
          if (npc.hp <= 0) {
            // Out of stamina! Captor transitions to dragging the NPC to the bed!
            npc.aiMode = 'captured_dragged';
            captor.strugglingNpcId = undefined;
            captor.draggingNpcId = npc.id;
            const pleas = GAME_TEXT.npcFemboyDialogue.draggedPleas;
            npc.speechText = pleas[Math.floor(Math.random() * pleas.length)];
            npc.speechTimer = 3.8;
            notifications.push({
              text: `⚠️ ${npc.name} is out of stamina and being dragged to the bed!! Shoot ${
                GAME_TEXT.archetypes[captor.archetype as ArchetypeKey]?.name || 'her'
              } to save him!`,
              color: '#fb7185',
            });
          } else {
            // Breaks loose after losing 1 heart with brief invulnerability + daze (just like the player!)
            npc.capturedByEnemyId = undefined;
            captor.strugglingNpcId = undefined;
            captor.postWinWaitTimer = 2.6;
            npc.aiMode = npc.isLoyalCompanion ? 'following_player' : 'roaming';
            npc.invincibleTimer = 2.5;
            npc.dazeTimer = 1.4;
            const pushAng = Math.atan2(npc.y - captor.y, npc.x - captor.x);
            npc.x += Math.cos(pushAng) * 42;
            npc.y += Math.sin(pushAng) * 42;
            npc.speechText = 'Phew... slipped out of her grip, but that drained a heart!';
            npc.speechTimer = 3.2;
          }
        }
        continue;
      }

      if (npc.aiMode === 'captured_dragged') {
        // Towed behind the captor toward the stage bed
        npc.x = captor.x - Math.cos(captor.angle || 0) * 20;
        npc.y = captor.y - Math.sin(captor.angle || 0) * 20;
        npc.vx = captor.vx;
        npc.vy = captor.vy;

        if (npc.speechTimer <= 0) {
          const pleas = GAME_TEXT.npcFemboyDialogue.draggedPleas;
          npc.speechText = pleas[Math.floor(Math.random() * pleas.length)];
          npc.speechTimer = 2.8;
        }

        // Check if captor reached the Bed with the NPC Femboy -> FINAL GAME OVER for this NPC!
        const distToBed = Math.hypot(bedPos.x - captor.x, bedPos.y - captor.y);
        if (distToBed <= 64) {
          const elimLines = GAME_TEXT.npcFemboyDialogue.gameOverEliminated;
          const finalQuote = elimLines[Math.floor(Math.random() * elimLines.length)];
          npc.speechText = finalQuote;
          captor.draggingNpcId = undefined;
          captor.strugglingNpcId = undefined;
          captor.isShiny = false;
          captor.isVictor = true;
          captor.isHauntingWinner = true;
          captor.isImmortalVictor = true;
          captor.isImmortalWinner = true;
          captor.postWinWaitTimer = 5.5;
          captor.speechText = `Hehe~ Claimed ${npc.name} at the bed! You're next, cutie~ ♥`;
          captor.speechTimer = 4.5;

          eliminatedNpcIds.push(npc.id);
          notifications.push({
            text: `💔 ${npc.name} was taken to the bed by ${
              GAME_TEXT.archetypes[captor.archetype as ArchetypeKey]?.name || 'a pursuer'
            } and eliminated from the run!`,
            color: '#f43f5e',
          });
        }
        continue;
      }
    }

    // 2. Check if an alerted Enemy grabs this NPC Femboy (when not invincible)
    if (npc.invincibleTimer <= 0) {
      let grabbingEnemy: EnemyState | undefined = undefined;
      for (const e of enemies) {
        if (
          (e.postWinWaitTimer ?? 0) <= 0 &&
          !e.strugglingNpcId &&
          !e.draggingNpcId &&
          Math.hypot(e.x - npc.x, e.y - npc.y) <= e.radius + npc.radius - 2
        ) {
          grabbingEnemy = e;
          break;
        }
      }

      if (grabbingEnemy) {
        grabbingEnemy.awarenessState = 'alerted';
        grabbingEnemy.isAlerted = true;
        npc.capturedByEnemyId = grabbingEnemy.id;

        // Exact player capture parity: Shiny/Victor or 1-HP triggers immediate Bed Drag; otherwise on-the-spot Struggle!
        if (npc.hp <= 1 || grabbingEnemy.isShiny || isVictorEnemy(grabbingEnemy)) {
          npc.hp = 0;
          npc.aiMode = 'captured_dragged';
          grabbingEnemy.draggingNpcId = npc.id;
          const pleas = GAME_TEXT.npcFemboyDialogue.draggedPleas;
          npc.speechText = pleas[Math.floor(Math.random() * pleas.length)];
          npc.speechTimer = 3.8;
          notifications.push({
            text: `🚨 ${npc.name} was caught and is being dragged to the bed! Save him!`,
            color: '#f43f5e',
          });
        } else {
          npc.aiMode = 'captured_struggle';
          npc.struggleProgress = 0;
          npc.struggleTimer = 4.2;
          grabbingEnemy.strugglingNpcId = npc.id;
          const cries = GAME_TEXT.npcFemboyDialogue.struggleCries;
          npc.speechText = cries[Math.floor(Math.random() * cries.length)];
          npc.speechTimer = 3.2;
          notifications.push({
            text: `⚠️ ${npc.name} is pinned in a struggle! Shoot his captor to help him!`,
            color: '#fbbf24',
          });
        }
        continue;
      }
    }

    // 3. Pick up nearby un-sabotaged weapon crates if holding a pistol
    if (npc.activeWeaponKey === 'pistol' && weaponPickups && weaponPickups.length > 0) {
      for (let i = weaponPickups.length - 1; i >= 0; i--) {
        const wp = weaponPickups[i];
        if (!wp.isSabotaged && Math.hypot(wp.x - npc.x, wp.y - npc.y) <= npc.radius + wp.radius + 8) {
          const def = WEAPON_DEFS[wp.weaponKey];
          if (def) {
            npc.activeWeaponKey = wp.weaponKey;
            npc.ammo = def.maxAmmo;
            npc.speechText = `Ooh, nice! Grabbed a ${def.shortName}! ★`;
            npc.speechTimer = 2.6;
            weaponPickups.splice(i, 1);
            break;
          }
        }
      }
    }

    // 4. Determine AI Goal:
    // Priority A: If Player is captured/pinned/dragged, rush to rescue the Player!
    // Priority B: If threatened by a nearby alerted enemy, kite & shoot back!
    // Priority C: If loyal companion (affinityScore >= 2), follow near the player & comment!
    // Priority D: Otherwise roam autonomously across the stage & comment on surroundings!
    const playerCaptor =
      isPlayerCapturedNow && playerCaptorEnemyId !== null
        ? enemies.find((e) => e.id === playerCaptorEnemyId)
        : enemies.find(
            (e) =>
              e.id === player.pinnedByEnemyId ||
              e.id === player.shinyLockedByEnemyId ||
              e.id === player.shinyKnockoutHookedById
          );

    let nearestThreat: EnemyState | undefined = undefined;
    let nearestThreatDist = Infinity;
    for (const e of enemies) {
      if ((e.postWinWaitTimer ?? 0) > 0) continue;
      const d = Math.hypot(e.x - npc.x, e.y - npc.y);
      const isThreat = e.awarenessState === 'alerted' || d < 210 || e.strugglingNpcId !== undefined || e.draggingNpcId !== undefined;
      if (isThreat && d < nearestThreatDist) {
        nearestThreatDist = d;
        nearestThreat = e;
      }
    }

    let goalX = npc.x;
    let goalY = npc.y;
    let desiredSpeed = npc.speed;

    if (playerCaptor) {
      npc.aiMode = 'rescuing_player';
      const distToCaptor = Math.hypot(playerCaptor.x - npc.x, playerCaptor.y - npc.y);
      if (distToCaptor > 180) {
        goalX = playerCaptor.x;
        goalY = playerCaptor.y;
      } else {
        // Circle at optimal firing range
        const ang = Math.atan2(npc.y - playerCaptor.y, npc.x - playerCaptor.x) + 0.5;
        goalX = playerCaptor.x + Math.cos(ang) * 165;
        goalY = playerCaptor.y + Math.sin(ang) * 165;
      }
      if (npc.speechTimer <= 0 && npc.commentCooldown <= 0) {
        const rescueLines = GAME_TEXT.npcFemboyDialogue.rescuingPlayer;
        npc.speechText = rescueLines[Math.floor(Math.random() * rescueLines.length)];
        npc.speechTimer = 3.0;
        npc.commentCooldown = 4.5;
      }
    } else if (nearestThreat && nearestThreatDist < 360) {
      npc.aiMode = 'combat';
      // Kite away if enemy is within 190px; otherwise strafe or close in if rescuing another NPC
      if (nearestThreat.strugglingNpcId || nearestThreat.draggingNpcId) {
        goalX = nearestThreat.x;
        goalY = nearestThreat.y;
      } else if (nearestThreatDist < 215) {
        const awayX = npc.x - nearestThreat.x;
        const awayY = npc.y - nearestThreat.y;
        const awayLen = Math.hypot(awayX, awayY) || 1;
        const perpX = -awayY / awayLen;
        const perpY = awayX / awayLen;
        goalX = npc.x + (awayX / awayLen) * 170 + perpX * 85;
        goalY = npc.y + (awayY / awayLen) * 170 + perpY * 85;
      } else {
        const distToP = Math.hypot(player.x - npc.x, player.y - npc.y);
        if (npc.isLoyalCompanion && distToP > 150) {
          goalX = player.x;
          goalY = player.y;
        } else {
          goalX = npc.x + Math.cos(npc.angle + 0.8) * 120;
          goalY = npc.y + Math.sin(npc.angle + 0.8) * 120;
          desiredSpeed *= 0.82;
        }
      }

      if (npc.speechTimer <= 0 && npc.commentCooldown <= 0) {
        const pool =
          nearestThreatDist < 185
            ? GAME_TEXT.npcFemboyDialogue.spottedEnemy
            : GAME_TEXT.npcFemboyDialogue.combatCallouts;
        npc.speechText = pool[Math.floor(Math.random() * pool.length)];
        npc.speechTimer = 2.8;
        npc.commentCooldown = 6.5;
      }
    } else if (npc.isLoyalCompanion) {
      npc.aiMode = 'following_player';
      const distToPlayer = Math.hypot(player.x - npc.x, player.y - npc.y);
      const offsetAngle = (npc.id % 2 === 0 ? 1 : -1) * 0.85 + player.angle + Math.PI;
      const followSpotX = player.x + Math.cos(offsetAngle) * 78;
      const followSpotY = player.y + Math.sin(offsetAngle) * 78;

      if (distToPlayer > 95) {
        goalX = followSpotX;
        goalY = followSpotY;
        desiredSpeed = distToPlayer > 240 ? npc.speed * 1.12 : npc.speed * 0.92;
      } else {
        desiredSpeed = 0;
      }

      if (npc.speechTimer <= 0 && npc.commentCooldown <= 0 && Math.random() < dt * 0.35) {
        const followLines = GAME_TEXT.npcFemboyDialogue.followingChatter;
        npc.speechText = followLines[Math.floor(Math.random() * followLines.length)];
        npc.speechTimer = 3.4;
        npc.commentCooldown = 10.0;
      }
    } else {
      npc.aiMode = 'roaming';
      npc.roamTimer -= dt;
      const margin = mapId === 'mansion' ? 250 : 190;
      if (
        npc.roamTimer <= 0 ||
        npc.roamTargetX === undefined ||
        npc.roamTargetY === undefined ||
        Math.hypot(npc.roamTargetX - npc.x, npc.roamTargetY - npc.y) < 42
      ) {
        npc.roamTimer = 3.5 + Math.random() * 3.5;
        if (doorways && doorways.length > 0 && Math.random() < 0.6) {
          const wp = doorways[Math.floor(Math.random() * doorways.length)];
          npc.roamTargetX = wp.x + (Math.random() - 0.5) * 120;
          npc.roamTargetY = wp.y + (Math.random() - 0.5) * 120;
        } else {
          npc.roamTargetX = margin + Math.random() * (arenaWidth - margin * 2);
          npc.roamTargetY = margin + Math.random() * (arenaHeight - margin * 2);
        }
      }
      goalX = npc.roamTargetX;
      goalY = npc.roamTargetY;
      desiredSpeed = npc.speed * 0.72;

      if (npc.speechTimer <= 0 && npc.commentCooldown <= 0 && Math.random() < dt * 0.28) {
        const mapLines =
          GAME_TEXT.npcFemboyDialogue.idleByMap[
            mapId as keyof typeof GAME_TEXT.npcFemboyDialogue.idleByMap
          ] || GAME_TEXT.npcFemboyDialogue.idleByMap.forest;
        npc.speechText = mapLines[Math.floor(Math.random() * mapLines.length)];
        npc.speechTimer = 3.6;
        npc.commentCooldown = 11.0;
      }
    }

    // 5. Steer & Move NPC Femboy
    if (npc.dazeTimer > 0) {
      desiredSpeed *= 0.45;
    }

    if (desiredSpeed > 1) {
      const virtualMover: EnemyState = {
        id: npc.id,
        archetype: 'tomboy',
        x: npc.x,
        y: npc.y,
        vx: npc.vx,
        vy: npc.vy,
        radius: npc.radius,
        hp: npc.hp,
        maxHp: npc.maxHp,
        baseSpeed: desiredSpeed,
        speedMultiplier: 1,
        angle: npc.angle,
        knockbackVx: 0,
        knockbackVy: 0,
        hitFlashTimer: 0,
        speechText: '',
        speechTimer: 0,
        specialTimer: 0,
        pathCommitAngle: npc.pathCommitAngle,
        pathCommitTimer: npc.pathCommitTimer,
      };
      const steer = computeSmartSteering(
        virtualMover,
        goalX,
        goalY,
        walls,
        doorways,
        breachPoints,
        mapId
      );
      npc.pathCommitAngle = virtualMover.pathCommitAngle;
      npc.pathCommitTimer = virtualMover.pathCommitTimer;

      let moveX = steer.moveX;
      let moveY = steer.moveY;

      // Yield to oncoming City traffic!
      if (mapId === 'city' && cars && cars.length > 0) {
        const nextY = npc.y + moveY * desiredSpeed * dt * 6;
        for (const car of cars) {
          if (Math.abs(nextY - car.y) < car.h * 0.88 + npc.radius) {
            const relX = npc.x - car.x;
            const approaching =
              (car.vx > 0 && relX > -car.w * 0.6 && relX < 250) ||
              (car.vx < 0 && relX < car.w * 0.6 && relX > -250);
            if (approaching) {
              moveY = 0;
              desiredSpeed *= 0.2;
              break;
            }
          }
        }
      }

      npc.vx = moveX * desiredSpeed;
      npc.vy = moveY * desiredSpeed;
      npc.x += npc.vx * dt;
      npc.y += npc.vy * dt;
      npc.angle = Math.atan2(moveY, moveX);
    } else {
      npc.vx = 0;
      npc.vy = 0;
    }

    // Wall & bounds resolution
    for (const w of walls) {
      const res = resolveCircleBoxCollision(npc.x, npc.y, npc.radius, w.x, w.y, w.w, w.h);
      if (res.collided) {
        npc.x = res.x;
        npc.y = res.y;
      }
    }
    if (mapId === 'mansion') {
      npc.x = Math.max(186, Math.min(2214, npc.x));
      npc.y = Math.max(186, Math.min(1814, npc.y));
    } else {
      npc.x = Math.max(28, Math.min(arenaWidth - 28, npc.x));
      npc.y = Math.max(28, Math.min(arenaHeight - 28, npc.y));
    }

    // 6. Fire Weapon at priority enemy target (when not dazed)
    const fireTarget = playerCaptor || (nearestThreat && nearestThreatDist <= 430 ? nearestThreat : undefined);
    if (fireTarget && npc.dazeTimer <= 0 && npc.fireCooldown <= 0) {
      const lineClear = !isLineBlockedByWalls(npc.x, npc.y, fireTarget.x, fireTarget.y, walls, 6);
      if (lineClear) {
        const wep = WEAPON_DEFS[npc.activeWeaponKey] || WEAPON_DEFS.pistol;
        const aimAng = Math.atan2(fireTarget.y - npc.y, fireTarget.x - npc.x);
        npc.angle = aimAng;
        npc.fireCooldown = Math.max(0.24, wep.fireInterval * 1.35);

        for (let i = 0; i < wep.pelletCount; i++) {
          const offset =
            wep.pelletCount === 1
              ? (Math.random() - 0.5) * wep.spreadAngle
              : -wep.spreadAngle / 2 + (wep.spreadAngle / (wep.pelletCount - 1)) * i;
          const finalAngle = aimAng + offset;
          spawnedBullets.push({
            id: Math.random(),
            x: npc.x + Math.cos(finalAngle) * (npc.radius + 6),
            y: npc.y + Math.sin(finalAngle) * (npc.radius + 6),
            vx: Math.cos(finalAngle) * wep.bulletSpeed,
            vy: Math.sin(finalAngle) * wep.bulletSpeed,
            radius: wep.bulletRadius,
            damage: Math.round(wep.damage * 0.75),
            knockback: wep.knockback * 0.85,
            color: wep.color,
            trailColor: wep.trailColor,
            lifetime: 0,
            maxLifetime: 1.05,
            isExplosive: wep.isExplosive,
            explosionRadius: wep.explosionRadius,
            baseAngle: finalAngle,
            baseSpeed: wep.bulletSpeed,
            fromNpcId: npc.id,
            isNpcBullet: true,
          });
        }

        if (npc.ammo > 0) {
          npc.ammo--;
          if (npc.ammo <= 0) {
            npc.activeWeaponKey = 'pistol';
            npc.ammo = -1;
          }
        }

        // If shooting the enemy currently capturing the player, help free the player!
        if (playerCaptor && fireTarget.id === playerCaptor.id && Math.random() < 0.38) {
          rescuedPlayerFromCapture = true;
        }
      }
    }
  }

  return {
    spawnedBullets,
    eliminatedNpcIds,
    rescuedPlayerFromCapture,
    notifications,
  };
}

