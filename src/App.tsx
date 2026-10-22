/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GAME_TEXT, type ArchetypeKey, type MapKey } from './gameText.ts';
import {
  PlayerState,
  EnemyState,
  BulletState,
  EnemyBulletState,
  WeaponPickupState,
  HazardPuddle,
  MovingCar,
  Civilian,
  HeartPickup,
  MedkitPickup,
  EnemyUpgrade,
  MapType,
  MapEnvironment,
  createMapEnvironment,
  findSafePickupPosition,
  WEAPON_DEFS,
  getActiveArchetypes,
  rollWeightedArchetype,
  getSpawnInterval,
  getStageCopLimit,
  getMaxMobCap,
  getExpForLevel,
  rollEnemyUpgrades,
  createArchetypeSpecs,
  computeSmartSteering,
  updateEnemyAI,
  isInsideHouse,
  isLineBlockedByWalls,
  checkCircleOverlap,
  checkCircleBoxOverlap,
  resolveCircleBoxCollision,
  rollArchetypeDebuff,
  computeDebuffedPlayerStats,
  checkBulletDeflection,
  distanceSq,
  PLAYER_SKIN_IDS,
  SUPPORT_ITEM_META,
  rollSupportItemType,
  createInitialHeartShopState,
  getWeaponUpgradeCost,
  getSupportUpgradeCost,
  getFullHealServiceCost,
  getPurgeDebuffServiceCost,
  getEffectiveWeaponStats,
  rollUnlockedWeaponKey,
  getKillsForNextWantedLevel,
  isPlayerImpervious,
  isPlayerDazed,
  isVictorEnemy,
  isShinyOfficerImpervious,
  HOME_OFFSET_X,
  HOME_OFFSET_Y,
  createNpcFemboy,
  updateNpcFemboys,
  type NpcFemboyState,
  type HeartShopState,
  type ArchetypeId,
  type ActiveDebuff,
  type PlayerSkinOption,
  type OutfitMode,
  type SupportItemType,
} from './game/logic.ts';
import {
  drawArena,
  drawCars,
  drawCivilians,
  drawWeaponPickups,
  drawMedkits,
  drawHearts,
  drawPlayer,
  drawEnemies,
  drawBullets,
  drawEnemyBullets,
  drawDebuffOverlays,
  drawParticles,
  drawTreeCanopies,
  drawForestFog,
  drawMansionFlashlight,
  drawMinimap,
  drawCaptureCutsceneOverlay,
  drawCaptureCutsceneVignette,
} from './game/renderer.ts';
import { sounds } from './game/sound.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHud } from './components/GameHud.tsx';
import { GameOverSunset } from './components/GameOverSunset.tsx';
import { PauseModal } from './components/PauseModal.tsx';
import { LevelUpModal } from './components/LevelUpModal.tsx';
import { DebuffManualModal } from './components/DebuffManualModal.tsx';
import { HeartShopModal } from './components/HeartShopModal.tsx';

type GameState = 'title' | 'playing' | 'paused' | 'levelup' | 'capturing' | 'gameover';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [selectedMap, setSelectedMap] = useState<MapType>('forest');
  const [selectedSkin, setSelectedSkin] = useState<PlayerSkinOption>('random');
  const [selectedOutfitMode, setSelectedOutfitMode] = useState<OutfitMode>('standard');
  const selectedOutfitModeRef = useRef<OutfitMode>('standard');
  const [tauntCooldownState, setTauntCooldownState] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // HUD and Player Progression state
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(0);
  const [hp, setHp] = useState<number>(5);
  const [maxHp, setMaxHp] = useState<number>(5);
  const [activeWeaponKey, setActiveWeaponKey] = useState<string>('pistol');
  const [ammo, setAmmo] = useState<number>(-1);
  const [defeatedCount, setDefeatedCount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeDebuffs, setActiveDebuffs] = useState<ActiveDebuff[]>([]);
  const [caughtByArchetype, setCaughtByArchetype] = useState<ArchetypeId>('officer');
  const [isShinyCaught, setIsShinyCaught] = useState<boolean>(false);

  // Heart Shop & Currency State (Hearts collected from pursuers spendable on upgrades, heals & purges)
  const [heartCurrency, setHeartCurrency] = useState<number>(0);
  const [isHeartShopOpen, setIsHeartShopOpen] = useState<boolean>(false);
  const isHeartShopOpenRef = useRef<boolean>(false);
  const [heartShopState, setHeartShopState] = useState<HeartShopState>(createInitialHeartShopState());
  const heartShopRef = useRef<HeartShopState>(createInitialHeartShopState());
  const heartCurrencyRef = useRef<number>(0);
  const wantedKillsProgressRef = useRef<number>(0);

  // Suburban Home Sanctuary & Barricade Repair HUD state
  const [intactBarricadesCount, setIntactBarricadesCount] = useState<number>(6);
  const [totalBarricadesCount, setTotalBarricadesCount] = useState<number>(6);
  const [sanctuaryBuffActive, setSanctuaryBuffActive] = useState<boolean>(true);
  const [nearbyRepairPrompt, setNearbyRepairPrompt] = useState<{ label: string; progress: number } | null>(null);

  // Wanted Level Progression (Level-up is now purely based on enemy eliminations!)
  const [adorationLevel, setAdorationLevel] = useState<number>(1);
  const [adorationExp, setAdorationExp] = useState<number>(0);
  const [expToNextLevel, setExpToNextLevel] = useState<number>(getKillsForNextWantedLevel(1));
  const [activeEnemyUpgrades, setActiveEnemyUpgrades] = useState<string[]>([]);
  const [pendingLevelUpUpgrades, setPendingLevelUpUpgrades] = useState<EnemyUpgrade[] | null>(null);
  const [isDebuffManualOpen, setIsDebuffManualOpen] = useState<boolean>(false);
  const [extraLives, setExtraLives] = useState<number>(1);

  // Synchronous refs for 60fps simulation
  const adorationLevelRef = useRef<number>(1);
  const adorationExpRef = useRef<number>(0);
  const activeUpgradesRef = useRef<string[]>([]);
  const extraLivesRef = useRef<number>(1);
  const dazeTimerRef = useRef<number>(0);
  const struggleTapImpulseRef = useRef<number>(0);

  // Canvas and game loop refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Current map environment ref
  const mapEnvRef = useRef<MapEnvironment>(createMapEnvironment('forest'));

  // Game world mutable state
  const playerRef = useRef<PlayerState>({
    x: 1300,
    y: 1100,
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
  });

  const enemiesRef = useRef<EnemyState[]>([]);
  const bulletsRef = useRef<BulletState[]>([]);
  const enemyBulletsRef = useRef<EnemyBulletState[]>([]);
  const pickupsRef = useRef<WeaponPickupState[]>([]);
  const medkitsRef = useRef<MedkitPickup[]>([]);
  const heartsRef = useRef<HeartPickup[]>([]);
  const puddlesRef = useRef<HazardPuddle[]>([]);
  const carsRef = useRef<MovingCar[]>([]);
  const civiliansRef = useRef<Civilian[]>([]);
  const particlesRef = useRef<
    {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      radius: number;
      life: number;
      maxLife: number;
    }[]
  >([]);

  // Simulation timers & counters
  const simTimeRef = useRef<number>(0);
  const lastShinyMinuteRef = useRef<number>(0);
  const lastShopMinuteRef = useRef<number>(0);
  const volleyballTimerRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const pickupSpawnTimerRef = useRef<number>(0);
  const medkitSpawnTimerRef = useRef<number>(0);
  const defeatedCountRef = useRef<number>(0);
  const enemyIdCounter = useRef<number>(1);
  const bulletIdCounter = useRef<number>(1);
  const enemyBulletIdCounter = useRef<number>(1);
  const pickupIdCounter = useRef<number>(1);
  const medkitIdCounter = useRef<number>(1);
  const heartIdCounter = useRef<number>(1);
  const puddleIdCounter = useRef<number>(1);
  const carIdCounter = useRef<number>(1);
  const civilianIdCounter = useRef<number>(1);
  const npcIdCounter = useRef<number>(1);
  const npcFemboysRef = useRef<NpcFemboyState[]>([]);
  const [npcFemboysHud, setNpcFemboysHud] = useState<NpcFemboyState[]>([]);
  const npcSpawnTimerRef = useRef<number>(0);
  const npcEliminatedCountRef = useRef<number>(0);
  const playerFiredTimerRef = useRef<number>(0);
  const notificationTimeoutRef = useRef<number | null>(null);

  // Debuff & stun runtime timers & state
  const stunSlowTimerRef = useRef<number>(0);
  const heartbreakStunTimerRef = useRef<number>(0);
  const pistolShotsCounterRef = useRef<number>(0);
  const twitchTimerRef = useRef<number>(0);
  const stumbleTimerRef = useRef<number>(0);
  const whiteoutTimerRef = useRef<number>(0);
  const impactBlurTimerRef = useRef<number>(0);
  const consecutiveMissesRef = useRef<number>(0);
  const pickupHoverTimersRef = useRef<Map<number, number>>(new Map());
  const cautionRibbonsRef = useRef<{ x: number; y: number; duration: number }[]>([]);

  // Suburban Home Barricade Repair & Sanctuary refs
  const repairProgressRef = useRef<number>(0);
  const repairTargetRef = useRef<{ id: string; x: number; y: number; w: number; h: number; progress: number } | null>(null);
  const sanctuaryHealTimerRef = useRef<number>(0);
  const sanctuaryAmmoTimerRef = useRef<number>(0);

  // Post-Defeat Celebration & Drag-to-Spot Cutscene ref
  const captureCutsceneRef = useRef<{
    active: boolean;
    phase: 'celebrate' | 'drag' | 'arrive' | 'finished';
    timer: number;
    catcher: EnemyState;
    quote: string;
    isShiny: boolean;
    cameraZoom: number;
    struggleResistance?: number;
    strugglePullOffset?: { x: number; y: number };
  } | null>(null);

  // 3.5s Shiny On-The-Spot Heart & Plap Animation ref (Pauses all other enemies, then deals 3 DMG + 3s dazed immunity)
  const shinyCaptureRef = useRef<{
    active: boolean;
    timer: number;
    duration: number;
    catcher: EnemyState;
    quote: string;
    cameraZoom: number;
    isJumpscare?: boolean;
  } | null>(null);
  const jumpscareTimerRef = useRef<number>(0);

  // Inputs
  const keysDown = useRef<Set<string>>(new Set());
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isMouseDown = useRef<boolean>(false);
  const touchMoveVector = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load high score
  useEffect(() => {
    try {
      const saved = localStorage.getItem('femboy_survival_best_time');
      if (saved) {
        const val = parseFloat(saved);
        if (!isNaN(val)) setBestTime(val);
      }
    } catch {
      // ignore
    }
  }, []);

  // Sync dataset.state for CSS and body
  useEffect(() => {
    document.body.dataset.state = gameState;
  }, [gameState]);

  const showNotification = useCallback((text: string) => {
    setNotification(text);
    if (notificationTimeoutRef.current) {
      window.clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 2500);
  }, []);

  const spawnPickup = useCallback((weaponKey?: string) => {
    const chosen = weaponKey || rollUnlockedWeaponKey(heartShopRef.current.weaponTiers);
    if (!chosen) return;
    const env = mapEnvRef.current;
    const pad = 160;

    let rawX = pad + Math.random() * (env.width - pad * 2);
    let rawY = pad + Math.random() * (env.height - pad * 2);

    if (env.id === 'home') {
      rawX = 350 + Math.random() * 1000;
      rawY = 350 + Math.random() * 700;
    }

    const safePos = findSafePickupPosition(env, rawX, rawY, 24);

    pickupsRef.current.push({
      id: pickupIdCounter.current++,
      weaponKey: chosen,
      x: safePos.x,
      y: safePos.y,
      radius: 24,
      bobTimer: Math.random() * 10,
    });
  }, []);

  // Spawns a single enemy with Mob Cap, Archetype Map Theme adherence, Upgrade Spawn Weighting & Optional Guaranteed Shiny
  const spawnEnemy = useCallback((overrideArchetype?: ArchetypeId, forceShiny: boolean = false) => {
    const env = mapEnvRef.current;

    // Mob cap enforcement (allow guaranteed 60s Shiny Boss to spawn even if right at the regular mob cap!)
    const maxCap = getMaxMobCap(env.id);
    if (!forceShiny && enemiesRef.current.length >= maxCap) {
      return;
    }

    const activePool = getActiveArchetypes(simTimeRef.current, env.id, activeUpgradesRef.current);
    const archetype = overrideArchetype || rollWeightedArchetype(activePool, activeUpgradesRef.current, env.id);
    const isShiny = forceShiny || Math.random() < 0.015;
    const specs = createArchetypeSpecs(archetype, simTimeRef.current, activeUpgradesRef.current, isShiny);

    let x = env.width / 2;
    let y = env.height / 2;

    if (env.id === 'home') {
      // All enemies spawn OUTSIDE the house perimeter in the Back Yard, Front Yard, or Side Paths!
      const side = Math.floor(Math.random() * 4);
      if (side === 0) {
        // Back Yard (Top)
        x = 120 + Math.random() * (env.width - 240);
        y = 90 + Math.random() * Math.max(120, HOME_OFFSET_Y - 110);
      } else if (side === 1) {
        // Front Yard (Bottom)
        x = 120 + Math.random() * (env.width - 240);
        y = (HOME_OFFSET_Y + 1450) + Math.random() * Math.max(120, env.height - (HOME_OFFSET_Y + 1450) - 90);
      } else if (side === 2) {
        // West Path (Left)
        x = 90 + Math.random() * Math.max(120, HOME_OFFSET_X - 110);
        y = 120 + Math.random() * (env.height - 240);
      } else {
        // East Path (Right)
        x = (HOME_OFFSET_X + 1900) + Math.random() * Math.max(120, env.width - (HOME_OFFSET_X + 1900) - 90);
        y = 120 + Math.random() * (env.height - 240);
      }
    } else if (env.id === 'mansion') {
      const p = playerRef.current;
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = 480 + Math.random() * 260;
      const rawX = p.x + Math.cos(angle) * spawnDist;
      const rawY = p.y + Math.sin(angle) * spawnDist;
      const clampedX = Math.max(185, Math.min(2210, rawX));
      const clampedY = Math.max(185, Math.min(1810, rawY));
      const safePos = findSafePickupPosition(env, clampedX, clampedY, specs.radius);
      x = Math.max(185, Math.min(2210, safePos.x));
      y = Math.max(185, Math.min(1810, safePos.y));
    } else {
      const p = playerRef.current;
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = 650 + Math.random() * 320;
      x = p.x + Math.cos(angle) * spawnDist;
      y = p.y + Math.sin(angle) * spawnDist;
      x = Math.max(specs.radius + 20, Math.min(env.width - specs.radius - 20, x));
      y = Math.max(specs.radius + 20, Math.min(env.height - specs.radius - 20, y));
    }

    const archInfo = GAME_TEXT.archetypes[archetype as ArchetypeKey];
    const mapIdleLines =
      GAME_TEXT.worldIdleDialogue.soloByMap[
        archetype as keyof typeof GAME_TEXT.worldIdleDialogue.soloByMap
      ]?.[env.id];
    const initialCallout =
      !isShiny && mapIdleLines && mapIdleLines.length > 0
        ? mapIdleLines[Math.floor(Math.random() * mapIdleLines.length)]
        : archInfo?.callouts[Math.floor(Math.random() * archInfo.callouts.length)] || '';

    if (isShiny) {
      sounds.playShinyAlert();
      showNotification(
        forceShiny
          ? `★ ${Math.floor(simTimeRef.current / 60)}:00 MINUTE MILESTONE! SHINY ${archInfo?.name?.toUpperCase() || 'PURSUER'} HAS ARRIVED! ★`
          : '★ A RARE SHINY PURSUER HAS APPEARED! DO NOT GET TOUCHED! ★'
      );
    }

    enemiesRef.current.push({
      id: enemyIdCounter.current++,
      archetype,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: specs.radius,
      hp: specs.hp,
      maxHp: specs.hp,
      baseSpeed: specs.baseSpeed,
      speedMultiplier: 1.0,
      angle: Math.random() * Math.PI * 2,
      knockbackVx: 0,
      knockbackVy: 0,
      hitFlashTimer: 0,
      speechText: initialCallout,
      speechTimer: 3.2,
      specialTimer: 2.0,
      isShiny,
      isAlerted: false,
      awarenessState: isShiny ? 'alerted' : 'unaware',
      idleBehavior: Math.random() < 0.45 ? 'standing' : 'strolling',
      patrolAngle: Math.random() * Math.PI * 2,
      patrolTimer: 2.5 + Math.random() * 2.5,
      shootCooldown: 3.0 + Math.random() * 2,
    });
  }, [showNotification]);

  // Reset and start new run
  const startGame = useCallback((mapToStart?: MapType) => {
    const mapType = mapToStart || selectedMap;
    const env = createMapEnvironment(mapType);
    mapEnvRef.current = env;

    const resolvedSkin =
      selectedSkin === 'random'
        ? PLAYER_SKIN_IDS[Math.floor(Math.random() * PLAYER_SKIN_IDS.length)]
        : selectedSkin;

    const mode = selectedOutfitModeRef.current;
    const initialMaxHp = mode === 'swimsuit' ? 1 : 5;
    const initialExtraLives = mode === 'swimsuit' ? 0 : mode === 'comfy' ? 999 : 1;

    playerRef.current = {
      x: env.width / 2,
      y: env.height / 2,
      vx: 0,
      vy: 0,
      speed: 290,
      radius: 17,
      hp: initialMaxHp,
      maxHp: initialMaxHp,
      invincibleTimer: 0,
      angle: 0,
      activeWeaponKey: 'pistol',
      ammo: -1,
      fireCooldown: 0,
      activeDebuffs: [],
      skinId: resolvedSkin,
      outfitMode: mode,
      tauntCooldown: 0,
      tauntRingTimer: 0,
      tauntSpeechTimer: 0,
      tauntSpeechText: '',
    };

    enemiesRef.current = [];
    bulletsRef.current = [];
    enemyBulletsRef.current = [];
    pickupsRef.current = [];
    medkitsRef.current = [];
    heartsRef.current = [];
    puddlesRef.current = [];
    particlesRef.current = [];
    carsRef.current = [];
    civiliansRef.current = [];
    npcFemboysRef.current = [];
    setNpcFemboysHud([]);
    npcSpawnTimerRef.current = 0;
    npcEliminatedCountRef.current = 0;
    playerFiredTimerRef.current = 0;
    cautionRibbonsRef.current = [];
    pickupHoverTimersRef.current.clear();

    simTimeRef.current = 0;
    lastShinyMinuteRef.current = 0;
    lastShopMinuteRef.current = 0;
    volleyballTimerRef.current = 0;
    spawnTimerRef.current = 0;
    pickupSpawnTimerRef.current = 0;
    medkitSpawnTimerRef.current = 0;
    defeatedCountRef.current = 0;
    twitchTimerRef.current = 0;
    stumbleTimerRef.current = 0;
    stunSlowTimerRef.current = 0;
    heartbreakStunTimerRef.current = 0;
    pistolShotsCounterRef.current = 0;
    repairProgressRef.current = 0;
    repairTargetRef.current = null;
    sanctuaryHealTimerRef.current = 0;
    sanctuaryAmmoTimerRef.current = 0;
    setNearbyRepairPrompt(null);
    setIntactBarricadesCount(6);
    setTotalBarricadesCount(6);
    setSanctuaryBuffActive(true);

    adorationLevelRef.current = 1;
    adorationExpRef.current = 0;
    wantedKillsProgressRef.current = 0;
    heartCurrencyRef.current = 0;
    setHeartCurrency(0);
    heartShopRef.current = createInitialHeartShopState();
    setHeartShopState(heartShopRef.current);
    isHeartShopOpenRef.current = false;
    setIsHeartShopOpen(false);
    activeUpgradesRef.current = [];
    extraLivesRef.current = initialExtraLives;
    dazeTimerRef.current = 0;
    struggleTapImpulseRef.current = 0;
    playerRef.current.dazeTimer = 0;
    playerRef.current.starlightInvulnTimer = 0;
    playerRef.current.fragileCurseTimer = 0;
    playerRef.current.nextLevelExtraChoices = 0;
    playerRef.current.nextLevelForcedSingle = false;
    setExtraLives(initialExtraLives);
    setTauntCooldownState(0);
    setAdorationLevel(1);
    setAdorationExp(0);
    setExpToNextLevel(getKillsForNextWantedLevel(1));
    setActiveEnemyUpgrades([]);
    setPendingLevelUpUpgrades(null);
    setIsDebuffManualOpen(false);
    setIsShinyCaught(false);
    captureCutsceneRef.current = null;
    shinyCaptureRef.current = null;
    jumpscareTimerRef.current = 0;

    if (env.id === 'city') {
      const carColors = ['#ef4444', '#facc15', '#3b82f6', '#ec4899', '#ffffff', '#10b981'];
      for (const lane of env.carLanes) {
        for (let i = 0; i < 3; i++) {
          carsRef.current.push({
            id: carIdCounter.current++,
            x: (env.width / 3) * i + Math.random() * 250,
            y: lane.y,
            vx: lane.dir * lane.speed,
            w: 100,
            h: 48,
            color: carColors[Math.floor(Math.random() * carColors.length)],
          });
        }
      }

      const civColors = ['#94a3b8', '#cbd5e1', '#f472b6', '#38bdf8', '#a78bfa'];
      for (let c = 0; c < 22; c++) {
        civiliansRef.current.push({
          id: civilianIdCounter.current++,
          x: 250 + Math.random() * (env.width - 500),
          y: Math.random() > 0.5 ? 750 + Math.random() * 50 : 1240 + Math.random() * 80,
          vx: (Math.random() - 0.5) * 55,
          vy: 0,
          speed: 40 + Math.random() * 30,
          radius: 14,
          color: civColors[Math.floor(Math.random() * civColors.length)],
          isPanicked: false,
          panicTimer: 0,
          wanderTimer: 2 + Math.random() * 3,
          pauseTimer: 0,
        });
      }
    }

    // Start with Pistol and First-Aid Heal only; special weapons and other support items are unlocked in the Heart Shop!
    const initMedPos = findSafePickupPosition(
      env,
      260 + Math.random() * (env.width - 520),
      260 + Math.random() * (env.height - 520),
      20
    );
    medkitsRef.current.push({
      id: medkitIdCounter.current++,
      x: initMedPos.x,
      y: initMedPos.y,
      bobTimer: 0,
      itemType: rollSupportItemType(heartShopRef.current.supportTiers),
    });

    setHp(initialMaxHp);
    setMaxHp(initialMaxHp);
    setActiveWeaponKey('pistol');
    setAmmo(-1);
    setActiveDebuffs([]);
    setDefeatedCount(0);
    setSurvivalTime(0);
    setNotification(null);

    setGameState('playing');
  }, [selectedMap, selectedSkin, spawnPickup]);

  // Autostart param support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const mapParam = params.get('map') as MapType;
      if (mapParam && ['forest', 'home', 'city', 'mansion', 'beach'].includes(mapParam)) {
        setSelectedMap(mapParam);
        startGame(mapParam);
      } else {
        startGame();
      }
    }
  }, [startGame]);

  const handleToggleMute = useCallback(() => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  }, []);

  // Fire active weapon taking debuffs (burst-lock, recoil pull, move penalty, etc.) into account
  const fireCurrentWeapon = useCallback((isBonusBurst: boolean = false) => {
    const p = playerRef.current;

    // Firing Lockout: You cannot shoot while dazed, stunned, pinned, or captured!
    if (
      isPlayerDazed(p, dazeTimerRef.current) ||
      heartbreakStunTimerRef.current > 0 ||
      p.pinnedByEnemyId !== undefined ||
      p.shinyLockedByEnemyId !== undefined ||
      captureCutsceneRef.current?.active ||
      shinyCaptureRef.current?.active
    ) {
      return;
    }

    // HACKER NATSUKI SABOTAGED WEAPON DETONATION!
    // Upon picking up a sabotaged weapon and using it, it explodes and stuns the user!
    if (p.isWeaponSabotaged && p.activeWeaponKey !== 'pistol') {
      p.isWeaponSabotaged = false;
      p.activeWeaponKey = 'pistol';
      p.ammo = -1;
      setActiveWeaponKey('pistol');
      setAmmo(-1);
      sounds.playBarricadeBreak();
      sounds.playStun();
      impactBlurTimerRef.current = 0.65;

      // Burst of cyber-emerald, cyan, and amber explosion sparks
      for (let sp = 0; sp < 24; sp++) {
        const spAngle = (Math.PI * 2 * sp) / 24 + (Math.random() - 0.5) * 0.2;
        const spSpeed = 90 + Math.random() * 210;
        particlesRef.current.push({
          x: p.x + (Math.random() - 0.5) * 16,
          y: p.y + (Math.random() - 0.5) * 16,
          vx: Math.cos(spAngle) * spSpeed,
          vy: Math.sin(spAngle) * spSpeed,
          color: sp % 3 === 0 ? '#10b981' : sp % 3 === 1 ? '#fde047' : '#38bdf8',
          radius: 4.5,
          life: 0.65,
          maxLife: 0.65,
        });
      }

      const shinyHacker =
        enemiesRef.current.find((e) => e.id === p.sabotagedByEnemyId && e.isShiny) ||
        (p.sabotagedByShiny ? enemiesRef.current.find((e) => e.archetype === 'hacker' && e.isShiny) : undefined);

      if (shinyHacker) {
        // Shiny Hacker Natsuki's sabotage dazes/stuns the player and prompts her to rush over and proceed with the animation!
        p.shinyLockedByEnemyId = shinyHacker.id;
        p.vx = 0;
        p.vy = 0;
        p.fireCooldown = 2.0;
        heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 5.0);
        stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 5.0);
        shinyHacker.rushingToSabotagedPlayer = true;
        shinyHacker.hackingTargetPickupId = undefined;
        shinyHacker.hackingTimer = 0;
        shinyHacker.speechText = 'BOOM~! Malware payload triggered—rushing over for my prize! 💻♥';
        shinyHacker.speechTimer = 3.5;
        showNotification('💥 SHINY MALWARE DETONATION! Stunned & dazed—Shiny Hacker Natsuki is rushing over!');
      } else {
        heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 1.45);
        stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.75);
        p.fireCooldown = 1.25;
        p.vx = -Math.cos(p.angle) * 240;
        p.vy = -Math.sin(p.angle) * 240;
        showNotification('💥 SABOTAGED WEAPON EXPLODED! Hacker Natsuki rigged that pickup—Stunned!');
      }
      p.sabotagedByEnemyId = undefined;
      p.sabotagedByShiny = false;
      return;
    }

    const def = getEffectiveWeaponStats(p.activeWeaponKey, heartShopRef.current.weaponTiers);

    const debuffStats = computeDebuffedPlayerStats(
      p.speed,
      def.damage,
      def.spreadAngle,
      def.fireInterval,
      p.activeDebuffs
    );

    const hasGothNearby = enemiesRef.current.some(
      (e) => e.archetype === 'goth' && distanceSq(e.x, e.y, p.x, p.y) < 180 * 180
    );
    const sorrowCadenceMult = hasGothNearby && activeUpgradesRef.current.includes('goth_sorrow_aura') ? 1.25 : 1.0;

    sounds.playShoot(def.id);
    playerFiredTimerRef.current = 0.65;
    if (!isBonusBurst) {
      p.fireCooldown = def.fireInterval * debuffStats.fireIntervalMultiplier * sorrowCadenceMult;
    }

    if (def.maxAmmo !== -1 && !isBonusBurst) {
      p.ammo -= 1;
      if (p.ammo <= 0) {
        p.activeWeaponKey = 'pistol';
        p.ammo = -1;
        showNotification('Ammo depleted! Switched to Pea Blaster.');

        // Heartbreak Ammo Shock debuff: True 0.85s stun & firing lockout when weapon runs out of ammo
        if (debuffStats.emptyStun) {
          heartbreakStunTimerRef.current = 0.85;
          stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 0.85);
          p.fireCooldown = Math.max(p.fireCooldown, 0.85);
          showNotification('💔 Heartbreak Ammo Shock! Stunned for 0.85s!');
          sounds.playStun();
          for (let sp = 0; sp < 14; sp++) {
            particlesRef.current.push({
              x: p.x + (Math.random() - 0.5) * 24,
              y: p.y + (Math.random() - 0.5) * 24,
              vx: (Math.random() - 0.5) * 180,
              vy: (Math.random() - 0.5) * 180,
              color: '#e11d48',
              radius: 4,
              life: 0.55,
              maxLife: 0.55,
            });
          }
        }
      }
      setAmmo(p.ammo);
      setActiveWeaponKey(p.activeWeaponKey);
    } else if (def.maxAmmo === -1 && !isBonusBurst && debuffStats.emptyStun) {
      // Even with Pea Blaster fallback, every 10th shot triggers a chamber reload heartbreak shock!
      pistolShotsCounterRef.current += 1;
      if (pistolShotsCounterRef.current >= 10) {
        pistolShotsCounterRef.current = 0;
        heartbreakStunTimerRef.current = 0.65;
        stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 0.65);
        p.fireCooldown = Math.max(p.fireCooldown, 0.65);
        showNotification('💔 Heartbreak Chamber Lock! Stunned for 0.65s!');
        sounds.playStun();
      }
    }

    // Recoil Pull debuff: Gunfire knocks player back slightly opposite aim angle
    if (debuffStats.recoilPull > 0) {
      p.vx -= Math.cos(p.angle) * 75 * debuffStats.recoilPull;
      p.vy -= Math.sin(p.angle) * 75 * debuffStats.recoilPull;
    }

    let baseAngle = p.angle;
    // Strict Corporate Dress Code debuff: Snap aim to nearest 45 degrees
    if (debuffStats.cardinalOnly) {
      const step = Math.PI / 4;
      baseAngle = Math.round(baseAngle / step) * step;
    }

    const hasSenpaiNearby = enemiesRef.current.some(
      (e) => e.archetype === 'senpai' && distanceSq(e.x, e.y, p.x, p.y) < 220 * 220
    );
    const dominantSpreadMult = hasSenpaiNearby && activeUpgradesRef.current.includes('senpai_dominant_gaze') ? 1.4 : 1.0;
    const whistleSpreadMult =
      debuffStats.whistleSpread && Math.floor(simTimeRef.current) % 8 < 1.5 ? 1.3 : 1.0;
    const currentSpread = def.spreadAngle * debuffStats.spreadMultiplier * dominantSpreadMult * whistleSpreadMult;
    const halfSpread = currentSpread / 2;

    const isMoving = Math.hypot(p.vx, p.vy) > 20;
    const effectiveBulletSpeed = isMoving
      ? def.bulletSpeed * debuffStats.moveShotSpeedPenalty
      : def.bulletSpeed;

    for (let i = 0; i < def.pelletCount; i++) {
      let shotAngle = baseAngle;
      if (def.pelletCount > 1) {
        const t = i / (def.pelletCount - 1);
        shotAngle = baseAngle - halfSpread + t * currentSpread;
      } else {
        shotAngle += (Math.random() - 0.5) * currentSpread;
      }

      // Spawn near player center (with prevX/prevY at player center) so point-blank enemies sitting on player are ALWAYS hit!
      bulletsRef.current.push({
        id: bulletIdCounter.current++,
        x: p.x + Math.cos(baseAngle) * 4,
        y: p.y + Math.sin(baseAngle) * 4,
        prevX: p.x,
        prevY: p.y,
        vx: Math.cos(shotAngle) * effectiveBulletSpeed,
        vy: Math.sin(shotAngle) * effectiveBulletSpeed,
        radius: def.bulletRadius,
        damage: def.damage * debuffStats.damageMultiplier,
        knockback: def.knockback * debuffStats.knockbackDealtMultiplier,
        color: def.color,
        trailColor: def.trailColor,
        lifetime: 0,
        maxLifetime: 1.4 * debuffStats.bulletLifetimeMultiplier,
        isExplosive: def.isExplosive,
        explosionRadius: def.explosionRadius,
      });
    }

    // Burst Lock debuff: Handcuff forces a rapid second pair shot
    if (debuffStats.burstLock && !isBonusBurst) {
      window.setTimeout(() => {
        if (playerRef.current.hp > 0 && !isPlayerDazed(playerRef.current, dazeTimerRef.current)) {
          fireCurrentWeapon(true);
        }
      }, 75);
    }

    // Tomboy Team Spirit Drill: When upgrade is active, Roxie rallies ALL pursuers on gunfire!
    if (activeUpgradesRef.current.includes('tomboy_competitive_spirit')) {
      for (const en of enemiesRef.current) {
        en.speedMultiplier = 1.22;
        window.setTimeout(() => {
          en.speedMultiplier = 1.0;
        }, 1100);
      }
    } else {
      // By default without upgrade, only Tomboy Roxie herself reacts to gunfire
      for (const en of enemiesRef.current) {
        if (en.archetype === 'tomboy') {
          en.speedMultiplier = 1.2;
          window.setTimeout(() => {
            en.speedMultiplier = 1.0;
          }, 800);
        }
      }
    }

    // City chaos mechanics: shooting near civilians alerts Patrol Officers
    const env = mapEnvRef.current;
    if (env.id === 'city') {
      for (const civ of civiliansRef.current) {
        if (!civ.isPanicked && distanceSq(p.x, p.y, civ.x, civ.y) < 240 * 240) {
          civ.isPanicked = true;
          civ.panicTimer = 5.0;
          showNotification(GAME_TEXT.hud.chaosAlert);
          spawnEnemy('officer');
          break;
        }
      }
    }
  }, [showNotification, spawnEnemy]);

  // Handle Level Up Selection (Also immediately spawns & boosts spawn weight of the chosen archetype!)
  const handleSelectUpgrade = useCallback(
    (upgrade: EnemyUpgrade) => {
      sounds.playUpgradeSelect();
      const updated = [...activeUpgradesRef.current, upgrade.id];
      activeUpgradesRef.current = updated;
      setActiveEnemyUpgrades(updated);
      setPendingLevelUpUpgrades(null);

      // Immediately spawn 1 pursuer of the upgraded archetype so you face her right away!
      spawnEnemy(upgrade.archetype);

      showNotification(`Pursuer Upgrade: ${upgrade.title}! (${GAME_TEXT.archetypes[upgrade.archetype as ArchetypeKey]?.name} spawn rate boosted!)`);
      setGameState('playing');
    },
    [showNotification, spawnEnemy]
  );

  const handleBuyWeaponUpgrade = useCallback((weaponKey: string) => {
    const shop = heartShopRef.current;
    const currentTier = shop.weaponTiers[weaponKey] ?? 0;
    if (currentTier >= 3) return;
    const isFree = selectedOutfitModeRef.current === 'comfy';
    const cost = isFree ? 0 : getWeaponUpgradeCost(weaponKey, currentTier);
    if (!isFree && heartCurrencyRef.current < cost) return;

    heartCurrencyRef.current -= cost;
    setHeartCurrency(heartCurrencyRef.current);
    shop.weaponTiers[weaponKey] = currentTier + 1;
    setHeartShopState({ ...shop, weaponTiers: { ...shop.weaponTiers } });

    sounds.playLevelUp();
    const wDef = getEffectiveWeaponStats(weaponKey, shop.weaponTiers);

    // Deliver 1 immediate weapon crate right next to player!
    const env = mapEnvRef.current;
    const p = playerRef.current;
    const dropPos = findSafePickupPosition(
      env,
      p.x + (Math.random() < 0.5 ? -48 : 48),
      p.y + (Math.random() < 0.5 ? -48 : 48),
      20
    );
    pickupsRef.current.push({
      id: pickupIdCounter.current++,
      x: dropPos.x,
      y: dropPos.y,
      weaponKey,
      radius: 16,
      bobTimer: 0,
    });
    showNotification(`📦 ${wDef.name} ${currentTier === 0 ? 'Unlocked' : `Tier ${currentTier + 1}`}! Free weapon crate dropped!`);
  }, [showNotification]);

  const handleBuySupportUpgrade = useCallback((itemType: SupportItemType) => {
    const shop = heartShopRef.current;
    const currentTier = shop.supportTiers[itemType] ?? 0;
    if (currentTier >= 3) return;
    const isFree = selectedOutfitModeRef.current === 'comfy';
    const cost = isFree ? 0 : getSupportUpgradeCost(itemType, currentTier);
    if (!isFree && heartCurrencyRef.current < cost) return;

    heartCurrencyRef.current -= cost;
    setHeartCurrency(heartCurrencyRef.current);
    shop.supportTiers[itemType] = currentTier + 1;
    setHeartShopState({ ...shop, supportTiers: { ...shop.supportTiers } });

    sounds.playLevelUp();
    const meta = SUPPORT_ITEM_META[itemType];

    // Deliver 1 immediate support care drop right next to player!
    const env = mapEnvRef.current;
    const p = playerRef.current;
    const dropPos = findSafePickupPosition(
      env,
      p.x + (Math.random() < 0.5 ? -48 : 48),
      p.y + (Math.random() < 0.5 ? -48 : 48),
      20
    );
    medkitsRef.current.push({
      id: medkitIdCounter.current++,
      x: dropPos.x,
      y: dropPos.y,
      bobTimer: 0,
      itemType,
    });
    showNotification(`🎁 ${meta.name} ${currentTier === 0 ? 'Unlocked' : `Tier ${currentTier + 1}`}! Free care drop delivered!`);
  }, [showNotification]);

  const handleBuyFullHeal = useCallback(() => {
    const shop = heartShopRef.current;
    const isFree = selectedOutfitModeRef.current === 'comfy';
    const cost = isFree ? 0 : getFullHealServiceCost(shop.healPurchases);
    const p = playerRef.current;
    if ((!isFree && heartCurrencyRef.current < cost) || p.hp >= p.maxHp) return;

    heartCurrencyRef.current -= cost;
    setHeartCurrency(heartCurrencyRef.current);
    shop.healPurchases += 1;
    setHeartShopState({ ...shop });

    p.hp = p.maxHp;
    setHp(p.hp);
    sounds.playHeal();
    showNotification(`💖 Full Health Restored! Health capacity filled to ${p.maxHp} Hearts.`);
  }, [showNotification]);

  const handleBuyPurgeDebuff = useCallback(() => {
    const shop = heartShopRef.current;
    const isFree = selectedOutfitModeRef.current === 'comfy';
    const cost = isFree ? 0 : getPurgeDebuffServiceCost(shop.purgePurchases);
    const p = playerRef.current;
    if ((!isFree && heartCurrencyRef.current < cost) || p.activeDebuffs.length === 0) return;

    heartCurrencyRef.current -= cost;
    setHeartCurrency(heartCurrencyRef.current);
    shop.purgePurchases += 1;
    setHeartShopState({ ...shop });

    const removedIdx = Math.floor(Math.random() * p.activeDebuffs.length);
    const removedDebuff = p.activeDebuffs.splice(removedIdx, 1)[0];
    setActiveDebuffs([...p.activeDebuffs]);
    sounds.playUpgradeSelect();
    showNotification(`✨ Purified! Cured: ${removedDebuff.name}!`);
  }, [showNotification]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Global Inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysDown.current.add(k);

      if (
        gameState === 'capturing' &&
        !e.repeat &&
        ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'e'].includes(k)
      ) {
        struggleTapImpulseRef.current = Math.min(1.0, struggleTapImpulseRef.current + 0.25);
      }

      if (e.key === ' ' && gameState === 'playing' && !isHeartShopOpenRef.current) {
        isMouseDown.current = true;
      }

      // BRATTY TAUNT / TEASE [F]: Earns an archetype-specific flustered/provoked dialogue reaction from pursuers in range!
      if ((e.key === 'f' || e.key === 'F') && gameState === 'playing' && !isHeartShopOpenRef.current && !e.repeat) {
        const p = playerRef.current;
        if ((p.tauntCooldown || 0) <= 0 && !shinyCaptureRef.current?.active && !captureCutsceneRef.current?.active) {
          p.tauntCooldown = 3.5;
          p.tauntRingTimer = 0.65;
          setTauntCooldownState(3.5);
          const tauntPool = GAME_TEXT.playerTaunts;
          p.tauntSpeechText = tauntPool[Math.floor(Math.random() * tauntPool.length)];
          p.tauntSpeechTimer = 2.6;
          sounds.playHeartCollect();

          // Spawn playful pink heart & sparkle particles around the player
          for (let h = 0; h < 10; h++) {
            const a = (Math.PI * 2 * h) / 10;
            particlesRef.current.push({
              x: p.x + Math.cos(a) * 14,
              y: p.y + Math.sin(a) * 14,
              vx: Math.cos(a) * 115,
              vy: Math.sin(a) * 115 - 25,
              color: h % 2 === 0 ? '#f472b6' : '#fef08a',
              radius: 3.5,
              life: 0.55,
              maxLife: 0.55,
            });
          }

          // Trigger archetype-specific dialogue reaction on all pursuers within 460px!
          let reactedCount = 0;
          let closestEnemy: EnemyState | null = null;
          let closestDistSq = Infinity;
          for (const en of enemiesRef.current) {
            const dSq = distanceSq(p.x, p.y, en.x, en.y);
            if (dSq < closestDistSq) {
              closestDistSq = dSq;
              closestEnemy = en;
            }
            if (dSq <= 460 * 460) {
              const archInfo = GAME_TEXT.archetypes[en.archetype as ArchetypeKey];
              const reactions = archInfo?.tauntReactions;
              if (reactions && reactions.length > 0) {
                en.speechText = reactions[Math.floor(Math.random() * reactions.length)];
                en.speechTimer = 3.8;
                en.isAlerted = true;
                reactedCount++;
              }
            }
          }

          // If no enemy was within 460px, let the closest enemy on the map hear your bratty tease!
          if (reactedCount === 0 && closestEnemy) {
            const archInfo = GAME_TEXT.archetypes[closestEnemy.archetype as ArchetypeKey];
            const reactions = archInfo?.tauntReactions;
            if (reactions && reactions.length > 0) {
              closestEnemy.speechText = reactions[Math.floor(Math.random() * reactions.length)];
              closestEnemy.speechTimer = 3.8;
              closestEnemy.isAlerted = true;
              reactedCount = 1;
            }
          }

          if (reactedCount > 0) {
            showNotification(`💋 Bratty Tease! ${reactedCount} pursuer${reactedCount > 1 ? 's' : ''} reacted!`);
          }
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (isHeartShopOpenRef.current) {
          isHeartShopOpenRef.current = false;
          setIsHeartShopOpen(false);
          return;
        }
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }

      if ((e.key === 'r' || e.key === 'R') && (gameState === 'playing' || gameState === 'paused') && !isHeartShopOpenRef.current) {
        startGame();
      }

      if ((e.key === 'm' || e.key === 'M') && (gameState === 'playing' || gameState === 'title')) {
        handleToggleMute();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key.toLowerCase());
      if (e.key === ' ') isMouseDown.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && gameState === 'playing') isMouseDown.current = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) isMouseDown.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0 && gameState === 'playing') {
        const touch = e.touches[0];
        mousePos.current = { x: touch.clientX, y: touch.clientY };
        isMouseDown.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        mousePos.current = { x: touch.clientX, y: touch.clientY };
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = touch.clientX - cx;
        const dy = touch.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > 25) {
          touchMoveVector.current = { x: dx / dist, y: dy / dist };
        } else {
          touchMoveVector.current = { x: 0, y: 0 };
        }
      }
    };

    const handleTouchEnd = () => {
      isMouseDown.current = false;
      touchMoveVector.current = { x: 0, y: 0 };
    };

    const handleBlur = () => {
      keysDown.current.clear();
      isMouseDown.current = false;
      touchMoveVector.current = { x: 0, y: 0 };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, startGame, handleToggleMute]);

  // Main 60 FPS Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let hudTimerAccumulator = 0;

    const finalizeGameOver = (catcher: ArchetypeId, isShiny: boolean = false) => {
      if (captureCutsceneRef.current) {
        captureCutsceneRef.current.phase = 'finished';
      }
      setCaughtByArchetype(catcher);
      setIsShinyCaught(isShiny);
      setGameState('gameover');
      const finalTime = simTimeRef.current;
      setSurvivalTime(finalTime);
      setBestTime((prev) => {
        const next = Math.max(prev, finalTime);
        try {
          localStorage.setItem('femboy_survival_best_time', next.toString());
        } catch {
          // ignore
        }
        return next;
      });
    };

    const triggerGameOver = (catcherArchetype: ArchetypeId, isShiny: boolean = false, winningEnemy?: EnemyState) => {
      if (captureCutsceneRef.current?.active) return;
      sounds.playGameOver();
      isMouseDown.current = false;

      const p = playerRef.current;
      let captor =
        winningEnemy ||
        enemiesRef.current.find((e) => e.archetype === catcherArchetype) ||
        enemiesRef.current[0];

      if (!captor) {
        const specs = createArchetypeSpecs(catcherArchetype, simTimeRef.current, activeUpgradesRef.current);
        captor = {
          id: enemyIdCounter.current++,
          archetype: catcherArchetype,
          x: p.x + 28,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: specs.radius,
          hp: specs.hp,
          maxHp: specs.hp,
          baseSpeed: specs.baseSpeed,
          speedMultiplier: 1.0,
          angle: Math.PI,
          knockbackVx: 0,
          knockbackVy: 0,
          hitFlashTimer: 0,
          speechText: '',
          speechTimer: 0,
          specialTimer: 0,
          isShiny,
        };
      }

      // Remove all other enemies from the screen except the one who caught you!
      captor.knockbackVx = 0;
      captor.knockbackVy = 0;
      captor.speechTimer = 0;
      captor.angle = Math.atan2(p.y - captor.y, p.x - captor.x);
      enemiesRef.current = [captor];
      bulletsRef.current = [];
      enemyBulletsRef.current = [];

      // On Suburban Home, unbarricade doors/windows so the captor can always path cleanly inside to the Bedroom Bed!
      const env = mapEnvRef.current;
      if (env.id === 'home' && env.breachPoints) {
        for (const bp of env.breachPoints) {
          bp.isBarricaded = false;
          bp.breached = true;
          bp.barricadeHp = 0;
        }
      }

      const archData = GAME_TEXT.archetypes[captor.archetype as ArchetypeKey];
      const victoryQuote = archData?.victoryQuote || 'Gotcha~! You are all mine now! ♥';

      captureCutsceneRef.current = {
        active: true,
        phase: 'celebrate',
        timer: 0,
        catcher: captor,
        quote: victoryQuote,
        isShiny: Boolean(isShiny || captor.isShiny),
        cameraZoom: 1.0,
      };

      setCaughtByArchetype(captor.archetype);
      setIsShinyCaught(Boolean(isShiny || captor.isShiny));
      setGameState('capturing');
    };

    // Triggers the 3.5-second on-the-spot Shiny Heart & "plap" animation (without walking to the game over location),
    // pausing all other enemies, then dealing 3 damage and granting 3s of dazed immunity!
    const triggerShinyOnTheSpotSession = (catcher: EnemyState) => {
      if (shinyCaptureRef.current?.active || captureCutsceneRef.current?.active) return;
      const p = playerRef.current;
      isMouseDown.current = false;
      p.vx = 0;
      p.vy = 0;
      p.pinnedByEnemyId = undefined;
      p.shinyLockedByEnemyId = undefined;
      p.shinyKnockoutHookedById = undefined;
      p.slipFallTimer = 0;
      stunSlowTimerRef.current = 0;
      heartbreakStunTimerRef.current = 0;

      catcher.knockbackVx = 0;
      catcher.knockbackVy = 0;
      catcher.isJumpscaring = false;
      catcher.rushingToSabotagedPlayer = false;
      catcher.isHoundPinning = false;
      catcher.angle = Math.atan2(p.y - catcher.y, p.x - catcher.x);

      const archData = GAME_TEXT.archetypes[catcher.archetype as ArchetypeKey];
      const quote = archData?.victoryQuote || 'Gotcha~! Right here, right now! ♥';

      sounds.playPlapThump();
      shinyCaptureRef.current = {
        active: true,
        timer: 0,
        duration: 3.5,
        catcher,
        quote,
        cameraZoom: 1.26,
      };
      showNotification(`★ SHINY ${archData?.name?.toUpperCase() || 'PURSUER'} CAUGHT YOU! 3.5s Session (-3 HP)! ★`);
    };

    // Alerts any Shiny Yandere Ayame on the map if another woman harms the player!
    const triggerShinyYandereJealousRage = (attackerArchetype?: ArchetypeId) => {
      if (attackerArchetype === 'yandere') return;
      for (const en of enemiesRef.current) {
        if (en.archetype === 'yandere' && en.isShiny) {
          en.jealousRageTimer = 4.5;
          en.speechText = 'HOW DARE ANOTHER WOMAN TOUCH YOU?! YOU ARE MINE!! ♥';
          en.speechTimer = 3.5;
          sounds.playShinyBossAttack();
          showNotification('💢 SHINY AYAME JEALOUS RAGE! Impervious & charging at explosive speed!');
        }
      }
    };

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const env = mapEnvRef.current;

      if (gameState === 'playing' && !isHeartShopOpenRef.current) {
        simTimeRef.current += dt;
        hudTimerAccumulator += dt;

        if (hudTimerAccumulator >= 0.15) {
          hudTimerAccumulator = 0;
          setSurvivalTime(simTimeRef.current);
        }

        const player = playerRef.current;
        if (jumpscareTimerRef.current > 0) {
          jumpscareTimerRef.current = Math.max(0, jumpscareTimerRef.current - dt);
        }

        // --- SHINY 3.5s ON-THE-SPOT HEART & PLAP ANIMATION (PAUSES ALL OTHER ENEMIES!) ---
        if (shinyCaptureRef.current?.active) {
          const sc = shinyCaptureRef.current;
          const catcher = sc.catcher;
          sc.timer += dt;
          sc.cameraZoom = Math.min(1.36, sc.cameraZoom + dt * 0.25);

          // Settle Shiny catcher right beside the player on the spot
          const targetCatcherX = player.x - 16;
          const targetCatcherY = player.y - 2;
          catcher.x += (targetCatcherX - catcher.x) * Math.min(1, dt * 10);
          catcher.y += (targetCatcherY - catcher.y) * Math.min(1, dt * 10);
          catcher.angle = 0;
          player.vx = 0;
          player.vy = 0;

          // Rhythmic soft plush "plap" bass thump every 0.28s
          const prevBeat = Math.floor((sc.timer - dt) / 0.28);
          const currBeat = Math.floor(sc.timer / 0.28);
          if (currBeat > prevBeat) {
            sounds.playPlapThump();
          }

          if (Math.random() < 0.65) {
            particlesRef.current.push({
              x: player.x + (Math.random() - 0.5) * 48,
              y: player.y + (Math.random() - 0.5) * 38,
              vx: (Math.random() - 0.5) * 85,
              vy: -45 - Math.random() * 55,
              color: Math.random() < 0.5 ? '#fde047' : '#f43f5e',
              radius: 4,
              life: 0.65,
              maxLife: 0.65,
            });
          }

          particlesRef.current = particlesRef.current
            .map((p) => ({
              ...p,
              x: p.x + p.vx * dt,
              y: p.y + p.vy * dt,
              life: p.life - dt,
            }))
            .filter((p) => p.life > 0);

          if (sc.timer >= sc.duration) {
            shinyCaptureRef.current = null;
            // Promptly deal 3 damage!
            player.hp -= 3;
            setHp(player.hp);
            sounds.playPlayerHurt();
            triggerShinyYandereJealousRage(catcher.archetype);

            // Reset temporary Shiny action flags, but SHE REMAINS A SHINY!
            // (Shiny enemies only convert into a normal Immortal Victor if the catch results in a Game Over animation near the bed!)
            catcher.isAiming = false;
            catcher.shootRecoveryTimer = 0;
            catcher.jealousRageTimer = 0;
            catcher.yandereRageTimer = 0;
            catcher.isHoundPinning = false;
            catcher.isHoundLunging = false;
            catcher.rushingToSabotagedPlayer = false;
            catcher.isJumpscaring = false;
            catcher.postWinWaitTimer = 3.4;
            catcher.knockbackVx = -240;
            catcher.knockbackVy = -80;

            if (player.hp <= 0) {
              triggerGameOver(catcher.archetype, true, catcher);
            } else {
              // Grant 3 seconds of dazed immunity!
              dazeTimerRef.current = 3.0;
              player.dazeTimer = 3.0;
              player.invincibleTimer = 3.0;
              showNotification('💫 Survived Shiny Session (-3 HP)! She remains Shiny—3s Dazed Immunity!');
            }
          }
        } else {
          // Compute debuff-modified player stats
          const debuffStats = computeDebuffedPlayerStats(
            290,
            10,
            0.05,
            0.2,
            player.activeDebuffs
          );

          // Decrement visual effect timers & support item buffs/curses
          if (whiteoutTimerRef.current > 0) whiteoutTimerRef.current -= dt;
          if (impactBlurTimerRef.current > 0) impactBlurTimerRef.current -= dt;
          if (player.slipFallTimer && player.slipFallTimer > 0) {
            player.slipFallTimer = Math.max(0, player.slipFallTimer - dt);
          }
          if (player.starlightInvulnTimer && player.starlightInvulnTimer > 0) {
            player.starlightInvulnTimer = Math.max(0, player.starlightInvulnTimer - dt);
            player.invincibleTimer = Math.max(player.invincibleTimer, player.starlightInvulnTimer);
          }
          if (player.fragileCurseTimer && player.fragileCurseTimer > 0) {
            player.fragileCurseTimer = Math.max(0, player.fragileCurseTimer - dt);
          }
          if (player.tauntCooldown && player.tauntCooldown > 0) {
            player.tauntCooldown = Math.max(0, player.tauntCooldown - dt);
            if (hudTimerAccumulator === 0) {
              setTauntCooldownState(player.tauntCooldown);
            }
          } else if (hudTimerAccumulator === 0 && tauntCooldownState > 0) {
            setTauntCooldownState(0);
          }
          if (player.tauntRingTimer && player.tauntRingTimer > 0) {
            player.tauntRingTimer = Math.max(0, player.tauntRingTimer - dt);
          }
          if (player.tauntSpeechTimer && player.tauntSpeechTimer > 0) {
            player.tauntSpeechTimer = Math.max(0, player.tauntSpeechTimer - dt);
          }

          // Validate Hound Pin & Shiny Lock references (clear if the enemy was defeated, knocked out, or if player is impervious!)
          const playerImperviousNow = isPlayerImpervious(player, dazeTimerRef.current);
          if (playerImperviousNow) {
            if (player.pinnedByEnemyId !== undefined) {
              const pinner = enemiesRef.current.find((e) => e.id === player.pinnedByEnemyId);
              if (pinner) {
                pinner.isHoundPinning = false;
                pinner.isHoundLunging = false;
              }
              player.pinnedByEnemyId = undefined;
            }
            if (player.shinyLockedByEnemyId !== undefined) {
              player.shinyLockedByEnemyId = undefined;
              player.shinyKnockoutHookedById = undefined;
            }
            player.slipFallTimer = 0;
            player.isStunned = false;
            player.stunTimer = 0;
            stunSlowTimerRef.current = 0;
            heartbreakStunTimerRef.current = 0;
            stumbleTimerRef.current = 0;
          }

          if (player.pinnedByEnemyId !== undefined) {
            const pinner = enemiesRef.current.find((e) => e.id === player.pinnedByEnemyId);
            if (!pinner || pinner.hp <= 0 || (pinner.houndKnockoutTimer && pinner.houndKnockoutTimer > 0) || (pinner.houndKOTimer && pinner.houndKOTimer > 0)) {
              player.pinnedByEnemyId = undefined;
            }
          }
          if (player.shinyLockedByEnemyId !== undefined) {
            const locker = enemiesRef.current.find((e) => e.id === player.shinyLockedByEnemyId);
            if (!locker || locker.hp <= 0) {
              player.shinyLockedByEnemyId = undefined;
              player.shinyKnockoutHookedById = undefined;
              player.slipFallTimer = 0;
            }
          }

          // Paparazzi / RGB Overglow Lens-Flare debuff: periodic soft bokeh rings + turn-speed slow every 9s
          if (debuffStats.flashWhiteout) {
            if (Math.floor(simTimeRef.current) % 9 === 0 && Math.floor(simTimeRef.current - dt) % 9 !== 0) {
              whiteoutTimerRef.current = 1.65;
              sounds.playWallHit();
            }
          }

          // Performance Memo Pin-Down debuff: Senpai issues a periodic citation snare every 9s
          if (debuffStats.memoSnare && !playerImperviousNow) {
            const hasSenpai = enemiesRef.current.some((e) => e.archetype === 'senpai');
            if (hasSenpai && Math.floor(simTimeRef.current) % 9 === 0 && Math.floor(simTimeRef.current - dt) % 9 !== 0) {
              stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.3);
              showNotification('📋 Urgent Performance Memo! Movement snared!');
              for (let m = 0; m < 8; m++) {
                particlesRef.current.push({
                  x: player.x + (Math.random() - 0.5) * 20,
                  y: player.y + (Math.random() - 0.5) * 20,
                  vx: (Math.random() - 0.5) * 120,
                  vy: (Math.random() - 0.5) * 120,
                  color: '#f8fafc',
                  radius: 3,
                  life: 0.45,
                  maxLife: 0.45,
                });
              }
            }
          }

          // 1. Process Movement Inputs
          let moveX = 0;
          let moveY = 0;
          if (keysDown.current.has('w') || keysDown.current.has('arrowup')) moveY -= 1;
          if (keysDown.current.has('s') || keysDown.current.has('arrowdown')) moveY += 1;
          if (keysDown.current.has('a') || keysDown.current.has('arrowleft')) moveX -= 1;
          if (keysDown.current.has('d') || keysDown.current.has('arrowright')) moveX += 1;

          if (touchMoveVector.current.x !== 0 || touchMoveVector.current.y !== 0) {
            moveX += touchMoveVector.current.x;
            moveY += touchMoveVector.current.y;
          }

          // Extra-Life 5-Second Daze or Shiny 3-Second Post-Session Daze Recovery: swaying wander, reduced speed & immunity
          if (dazeTimerRef.current > 0) {
            const prevDaze = dazeTimerRef.current;
            dazeTimerRef.current = Math.max(0, dazeTimerRef.current - dt);
            player.dazeTimer = dazeTimerRef.current;
            player.invincibleTimer = Math.max(player.invincibleTimer, 0.25);
            moveX += Math.sin(simTimeRef.current * 5.8) * 0.45;
            moveY += Math.cos(simTimeRef.current * 4.7) * 0.45;

            if (prevDaze > 0 && dazeTimerRef.current <= 0) {
              player.dazeTimer = 0;
              showNotification('✨ Daze cleared! Full control restored!');
            }
          } else {
            player.dazeTimer = 0;
          }

          const moveLen = Math.hypot(moveX, moveY);
          let currentSpeed = debuffStats.speed;
          if (dazeTimerRef.current > 0) {
            currentSpeed *= 0.65;
          }
          // Hound Pin or Shiny Daze Lock holds the player in place until the pursuer reaches them!
          if (player.pinnedByEnemyId !== undefined || (player.slipFallTimer && player.slipFallTimer > 0)) {
            currentSpeed = 0;
            moveX = 0;
            moveY = 0;
          } else if (player.shinyLockedByEnemyId !== undefined) {
            currentSpeed *= 0.06;
          }

          // Trainer Agility Course Hurdles debuff: diagonal movement trimmed by 14%
          if (debuffStats.agilityHurdles && Math.abs(moveX) > 0.1 && Math.abs(moveY) > 0.1) {
            currentSpeed *= 0.86;
          }
          // Trainer Nylon Leash Snag debuff: when Trainer Maya is within 230px, speed reduced by 16%
          if (debuffStats.leashTug) {
            const hasTrainerNear = enemiesRef.current.some(
              (e) => e.archetype === 'trainer' && distanceSq(e.x, e.y, player.x, player.y) < 230 * 230
            );
            if (hasTrainerNear) {
              currentSpeed *= 0.84;
            }
          }

          // Short-Range Red String of Fate & Destiny Tether (Only active when Yandere is within 260px!)
          const isRedTetherActive = debuffStats.redTether || activeUpgradesRef.current.includes('yandere_red_string');
          const yandereEnemy = enemiesRef.current.find((e) => e.archetype === 'yandere');
          if (isRedTetherActive && yandereEnemy) {
            const toPlayerX = player.x - yandereEnemy.x;
            const toPlayerY = player.y - yandereEnemy.y;
            const distToYandere = Math.hypot(toPlayerX, toPlayerY) || 1;
            if (distToYandere <= 260 && moveLen > 0) {
              const dot = (moveX / moveLen) * (toPlayerX / distToYandere) + (moveY / moveLen) * (toPlayerY / distToYandere);
              if (dot > 0.15) {
                // Moving away from Ayame within 260px has a balanced 20% resistance
                currentSpeed *= 0.8;
              }
            }
          }

          // Occult Shadow Tether: Goth summons floor hands pulling toward her
          if (activeUpgradesRef.current.includes('goth_spectral_chains')) {
            const gothEnemy = enemiesRef.current.find((e) => e.archetype === 'goth');
            if (gothEnemy && Math.floor(simTimeRef.current) % 8 < 1.6) {
              const toGothX = gothEnemy.x - player.x;
              const toGothY = gothEnemy.y - player.y;
              const dG = Math.hypot(toGothX, toGothY) || 1;
              player.vx += (toGothX / dG) * 35 * dt;
              player.vy += (toGothY / dG) * 35 * dt;
            }
          }

          // Twisted Ankle debuff: Stumble delay when cutting direction sharply (cannot stun while impervious!)
          if (debuffStats.turnStumble && moveLen > 0 && !isPlayerImpervious(player, dazeTimerRef.current)) {
            const currentVelLen = Math.hypot(player.vx, player.vy);
            if (currentVelLen > 40) {
              const dot = (player.vx / currentVelLen) * (moveX / moveLen) + (player.vy / currentVelLen) * (moveY / moveLen);
              if (dot < -0.4 && stumbleTimerRef.current <= 0) {
                stumbleTimerRef.current = 0.22;
                sounds.playPlayerHurt();
              }
            }
          }
          if (stumbleTimerRef.current > 0) {
            stumbleTimerRef.current -= dt;
            currentSpeed *= 0.35;
          }

          // Heartbreak Ammo Shock Stun (severe 80% slow + weapon jam)
          if (heartbreakStunTimerRef.current > 0) {
            heartbreakStunTimerRef.current -= dt;
            currentSpeed *= 0.2;
            if (Math.random() < 0.35) {
              particlesRef.current.push({
                x: player.x + (Math.random() - 0.5) * 18,
                y: player.y + (Math.random() - 0.5) * 18,
                vx: (Math.random() - 0.5) * 90,
                vy: (Math.random() - 0.5) * 90,
                color: '#f43f5e',
                radius: 2.5,
                life: 0.25,
                maxLife: 0.25,
              });
            }
          }

          // Taser Dart Electric Stun Shock
          if (stunSlowTimerRef.current > 0) {
            stunSlowTimerRef.current -= dt;
            currentSpeed *= 0.52;
            if (Math.random() < 0.25) {
              particlesRef.current.push({
                x: player.x + (Math.random() - 0.5) * 16,
                y: player.y + (Math.random() - 0.5) * 16,
                vx: (Math.random() - 0.5) * 80,
                vy: (Math.random() - 0.5) * 80,
                color: '#38bdf8',
                radius: 1.5,
                life: 0.2,
                maxLife: 0.2,
              });
            }
          }

          // Forest & Beach: Bushes slow movement; Sunset Beach surging tide waves slow movement & gently push ashore!
          if (env.id === 'forest' || env.id === 'beach') {
            for (const bush of env.bushes) {
              if (distanceSq(player.x, player.y, bush.x, bush.y) < bush.radius * bush.radius) {
                currentSpeed *= 0.55;
                break;
              }
            }
          }
          if (env.id === 'beach') {
            const tideCycle = (Math.sin((simTimeRef.current * Math.PI * 2) / 9.0 - Math.PI / 2) + 1) * 0.5;
            const dynamicWaterLineY = 1480 - tideCycle * 360;
            if (player.y > dynamicWaterLineY) {
              currentSpeed *= 0.68;
              // Rising wave swell pushes you slightly shoreward (north)
              player.vy -= 48 * dt;
            }
          }

          // Suburban Home: Barricade Repair (Hold [E]) & Indoor Sanctuary Buff
          let isSanctuaryActiveThisFrame = false;
          if (env.id === 'home') {
            const exteriorBreaches = env.breachPoints.filter(
              (bp) => bp.id === 'front-door' || bp.id === 'patio-door' || bp.id === 'back-door' || bp.isWindow
            );
            const intactCount = exteriorBreaches.filter((bp) => bp.isBarricaded && (bp.barricadeHp || 0) > 0).length;
            if (hudTimerAccumulator === 0) {
              setIntactBarricadesCount(intactCount);
              setTotalBarricadesCount(exteriorBreaches.length);
            }

            const playerIndoors = isInsideHouse(player.x, player.y);
            isSanctuaryActiveThisFrame = playerIndoors && intactCount >= 4;
            if (hudTimerAccumulator === 0) {
              setSanctuaryBuffActive(isSanctuaryActiveThisFrame);
            }

            if (isSanctuaryActiveThisFrame) {
              // Sanctuary Buff: +15% indoor movement speed & +20% fire rate
              currentSpeed *= 1.15;
              if (player.fireCooldown > 0) {
                player.fireCooldown = Math.max(0, player.fireCooldown - dt * 0.2);
              }

              // Sanctuary Hearth Regeneration: +1 HP every 20s indoors while fortified
              sanctuaryHealTimerRef.current += dt;
              if (sanctuaryHealTimerRef.current >= 20) {
                sanctuaryHealTimerRef.current = 0;
                if (player.hp < player.maxHp) {
                  player.hp += 1;
                  setHp(player.hp);
                  sounds.playHeal();
                  showNotification('🏠 Sanctuary Hearth Bonus: +1 HP Restored for defending the house!');
                }
              }

              // Home Defense Supply Cache: Spawns indoor weapon pickup every 25s
              sanctuaryAmmoTimerRef.current += dt;
              if (sanctuaryAmmoTimerRef.current >= 25 && pickupsRef.current.length < 6) {
                sanctuaryAmmoTimerRef.current = 0;
                spawnPickup();
                showNotification('🏠 Sanctuary Supply Cache delivered inside the house!');
              }
            }

            // Check if player is within 90px of any damaged or breached exterior barricade
            let closestDamageBp: typeof exteriorBreaches[0] | null = null;
            let closestDist = 90;
            for (const bp of exteriorBreaches) {
              const cx = bp.x + bp.w / 2;
              const cy = bp.y + bp.h / 2;
              const d = Math.hypot(player.x - cx, player.y - cy);
              const maxHp = bp.maxBarricadeHp || 100;
              const needsRepair = !bp.isBarricaded || bp.breached || (bp.barricadeHp || 0) < maxHp;
              if (needsRepair && d < closestDist) {
                closestDist = d;
                closestDamageBp = bp;
              }
            }

            if (closestDamageBp) {
              if (keysDown.current.has('e')) {
                repairProgressRef.current += dt / 1.1; // 1.1s hold to rebuild barricade
                if (Math.random() < 0.35) {
                  particlesRef.current.push({
                    x: closestDamageBp.x + closestDamageBp.w / 2 + (Math.random() - 0.5) * 24,
                    y: closestDamageBp.y + closestDamageBp.h / 2 + (Math.random() - 0.5) * 24,
                    vx: (Math.random() - 0.5) * 110,
                    vy: (Math.random() - 0.5) * 110,
                    color: '#fbbf24',
                    radius: 2.5,
                    life: 0.25,
                    maxLife: 0.25,
                  });
                }

                if (repairProgressRef.current >= 1.0) {
                  repairProgressRef.current = 0;
                  closestDamageBp.isBarricaded = true;
                  closestDamageBp.breached = false;
                  closestDamageBp.barricadeHp = closestDamageBp.maxBarricadeHp || 100;
                  sounds.playPickup();

                  // Push any enemy overlapping the newly nailed barricade outside
                  for (const en of enemiesRef.current) {
                    const res = resolveCircleBoxCollision(
                      en.x,
                      en.y,
                      en.radius + 4,
                      closestDamageBp.x,
                      closestDamageBp.y,
                      closestDamageBp.w,
                      closestDamageBp.h
                    );
                    if (res.collided) {
                      en.x = res.x;
                      en.y = res.y;
                    }
                  }

                  // Reward +5 Heart EXP & Ammo refill!
                  for (let h = 0; h < 3; h++) {
                    heartsRef.current.push({
                      id: heartIdCounter.current++,
                      x: player.x + (Math.random() - 0.5) * 16,
                      y: player.y + (Math.random() - 0.5) * 16,
                      vx: (Math.random() - 0.5) * 40,
                      vy: (Math.random() - 0.5) * 40,
                      bobTimer: Math.random() * 10,
                      value: h === 0 ? 1 : 2, // 1 + 2 + 2 = 5 EXP!
                      color: '#34d399',
                      scale: 1.15,
                    });
                  }

                  if (player.activeWeaponKey !== 'pistol') {
                    const wDef = WEAPON_DEFS[player.activeWeaponKey];
                    if (wDef && wDef.maxAmmo > 0) {
                      player.ammo = Math.min(wDef.maxAmmo, player.ammo + Math.ceil(wDef.maxAmmo * 0.25));
                      setAmmo(player.ammo);
                    }
                  }

                  showNotification(`🔨 Fortified ${closestDamageBp.label}! +5 Heart EXP & +25% Ammo!`);
                }
              } else {
                repairProgressRef.current = Math.max(0, repairProgressRef.current - dt * 2.0);
              }

              repairTargetRef.current = {
                id: closestDamageBp.id,
                x: closestDamageBp.x,
                y: closestDamageBp.y,
                w: closestDamageBp.w,
                h: closestDamageBp.h,
                progress: repairProgressRef.current,
              };
              setNearbyRepairPrompt({
                label: closestDamageBp.label,
                progress: repairProgressRef.current,
              });
            } else {
              repairProgressRef.current = 0;
              repairTargetRef.current = null;
              if (hudTimerAccumulator === 0) {
                setNearbyRepairPrompt(null);
              }
            }
          }

          // Puddles (coffee, skidmarks, spike strips) slow movement — Shiny Senpai's coffee causes a slip & fall!
          for (let pIdx = puddlesRef.current.length - 1; pIdx >= 0; pIdx--) {
            const puddle = puddlesRef.current[pIdx];
            if (puddle.type === 'smoke') continue;
            if (distanceSq(player.x, player.y, puddle.x, puddle.y) < puddle.radius * puddle.radius) {
              if (
                puddle.type === 'coffee' &&
                puddle.isShinyCoffee &&
                !isPlayerImpervious(player, dazeTimerRef.current) &&
                !player.shinyLockedByEnemyId
              ) {
                // Shiny Office Senpai's coffee causes a slip and fall, to which she'll come over and catch them!
                const shinySenpai =
                  enemiesRef.current.find((e) => e.id === puddle.ownerId) ||
                  enemiesRef.current.find((e) => e.archetype === 'senpai' && e.isShiny);
                if (shinySenpai) {
                  player.slipFallTimer = 5.0;
                  player.shinyLockedByEnemyId = shinySenpai.id;
                  player.vx = 0;
                  player.vy = 0;
                  stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 5.0);
                  shinySenpai.speechText = 'My, my~ slipped on my coffee? Stay right there, I’ll catch you! ♥';
                  shinySenpai.speechTimer = 3.5;
                  sounds.playStun();
                  showNotification('☕ SLIP & FALL! Shiny Senpai’s roast knocked you off your feet—she’s coming over!');
                  puddlesRef.current.splice(pIdx, 1);
                  break;
                }
              }
              if (puddle.type === 'spike_strip') {
                currentSpeed *= 0.65;
              } else if (puddle.type === 'skidmark') {
                currentSpeed *= 0.75;
              } else if (puddle.type === 'coffee') {
                currentSpeed *= debuffStats.coffeeBurn ? 0.55 : 0.7;
              } else {
                currentSpeed *= 0.6;
              }
              break;
            }
          }

          // Burning Perimeter of Devotion (Scalding arena boundaries)
          if (debuffStats.perimeterFire) {
            const margin = 36;
            if (player.x < margin || player.x > env.width - margin || player.y < margin || player.y > env.height - margin) {
              if (player.invincibleTimer <= 0 && !player.pinnedByEnemyId) {
                player.hp -= 1;
                player.invincibleTimer = 0.6;
                setHp(player.hp);
                sounds.playPlayerHurt();
                showNotification('🔥 Scalded by the Burning Perimeter of Devotion!');
                for (let f = 0; f < 8; f++) {
                  particlesRef.current.push({
                    x: player.x,
                    y: player.y,
                    vx: (Math.random() - 0.5) * 140,
                    vy: (Math.random() - 0.5) * 140,
                    color: '#e11d48',
                    radius: 3,
                    life: 0.35,
                    maxLife: 0.35,
                  });
                }
              }
              if (player.x < margin) player.vx += 160;
              if (player.x > env.width - margin) player.vx -= 160;
              if (player.y < margin) player.vy += 160;
              if (player.y > env.height - margin) player.vy -= 160;
            }
          }

          // Drift momentum debuff: ice-like slipperiness vs responsive traction
          const damping = debuffStats.driftMomentum;
          if (player.pinnedByEnemyId !== undefined || (player.slipFallTimer && player.slipFallTimer > 0)) {
            player.vx = 0;
            player.vy = 0;
          } else if (moveLen > 0) {
            const targetVx = (moveX / moveLen) * currentSpeed;
            const targetVy = (moveY / moveLen) * currentSpeed;
            player.vx = player.vx * (1 - (1 - damping) * 4) + targetVx * (1 - damping) * 4;
            player.vy = player.vy * (1 - (1 - damping) * 4) + targetVy * (1 - damping) * 4;
          } else {
            player.vx *= damping;
            player.vy *= damping;
          }

          // Apply Short-Range Red String of Fate physical reel pull ONLY when Yandere is within 90px–260px!
          if (isRedTetherActive && yandereEnemy && !player.pinnedByEnemyId) {
            const toYandereX = yandereEnemy.x - player.x;
            const toYandereY = yandereEnemy.y - player.y;
            const distToYandere = Math.hypot(toYandereX, toYandereY) || 1;
            if (distToYandere > 90 && distToYandere <= 260) {
              const pullStrength = 48;
              player.vx += (toYandereX / distToYandere) * pullStrength;
              player.vy += (toYandereY / distToYandere) * pullStrength;
            }
          }

          player.x += player.vx * dt;
          player.y += player.vy * dt;

          // Caution ribbon or Hound Scent trail debuff: Leaves trail behind player that speeds pursuers up!
          if (debuffStats.cautionTether || debuffStats.scentTrail) {
            if (Math.random() < 0.2) {
              cautionRibbonsRef.current.push({
                x: player.x,
                y: player.y,
                duration: 4.5,
              });
            }
          }
          cautionRibbonsRef.current = cautionRibbonsRef.current
            .map((r) => ({ ...r, duration: r.duration - dt }))
            .filter((r) => r.duration > 0);

          // Wall collisions
          for (const w of env.walls) {
            const res = resolveCircleBoxCollision(player.x, player.y, player.radius, w.x, w.y, w.w, w.h);
            if (res.collided) {
              player.x = res.x;
              player.y = res.y;
            }
          }

          // Suburban Home Barricade collisions: An intact barricade blocks the doorway or window.
          // When broken or breached, the player can freely cross outside into the yards or back inside!
          if (env.id === 'home' && env.breachPoints) {
            for (const bp of env.breachPoints) {
              if (bp.isBarricaded && (bp.barricadeHp ?? 0) > 0) {
                const res = resolveCircleBoxCollision(
                  player.x,
                  player.y,
                  player.radius,
                  bp.x,
                  bp.y,
                  bp.w,
                  bp.h
                );
                if (res.collided) {
                  player.x = res.x;
                  player.y = res.y;
                }
              }
            }
          }

          // Forest tree trunk collisions so dense trees have solid trunks
          if (env.id === 'forest') {
            for (const t of env.trees) {
              const dx = player.x - t.x;
              const dy = player.y - t.y;
              const dist = Math.hypot(dx, dy) || 1;
              const minDist = player.radius + t.trunkRadius * 0.85;
              if (dist < minDist) {
                player.x = t.x + (dx / dist) * minDist;
                player.y = t.y + (dy / dist) * minDist;
              }
            }
          }

          if (env.id === 'mansion') {
            player.x = Math.max(166 + player.radius, Math.min(2234 - player.radius, player.x));
            player.y = Math.max(166 + player.radius, Math.min(1834 - player.radius, player.y));
          } else {
            player.x = Math.max(player.radius, Math.min(env.width - player.radius, player.x));
            player.y = Math.max(player.radius, Math.min(env.height - player.radius, player.y));
          }

          const cameraX = Math.max(0, Math.min(env.width - canvas.width, player.x - canvas.width / 2));
          const cameraY = Math.max(0, Math.min(env.height - canvas.height, player.y - canvas.height / 2));
          const targetWorldX = mousePos.current.x + cameraX;
          const targetWorldY = mousePos.current.y + cameraY;

          // Crosshair Sway debuff + RGB Overglow Lens-Flare turn-speed slow
          const swayOffset = debuffStats.crosshairSway > 0
            ? Math.sin(simTimeRef.current * 4) * 0.12 * debuffStats.crosshairSway
            : 0;
          const desiredAngle = Math.atan2(targetWorldY - player.y, targetWorldX - player.x) + swayOffset;
          if (whiteoutTimerRef.current > 0) {
            let diff = desiredAngle - player.angle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const maxTurnStep = 2.7 * dt;
            if (Math.abs(diff) <= maxTurnStep) {
              player.angle = desiredAngle;
            } else {
              player.angle += Math.sign(diff) * maxTurnStep;
            }
          } else {
            player.angle = desiredAngle;
          }

          // Review Anxiety Pulse debuff: Fire cooldown recovers slower when a chaser is within 180px
          const hasPursuerClose = enemiesRef.current.some(
            (e) => distanceSq(e.x, e.y, player.x, player.y) < 180 * 180
          );
          const cooldownTick = debuffStats.anxietyPulse && hasPursuerClose ? dt * 0.72 : dt;
          if (
            isMouseDown.current &&
            player.fireCooldown <= 0 &&
            heartbreakStunTimerRef.current <= 0 &&
            !isPlayerDazed(player, dazeTimerRef.current)
          ) {
            fireCurrentWeapon();
          }

          // Periodic motor twitch debuff: Fires involuntary stray shot (cannot shoot while dazed!)
          if (debuffStats.periodicTwitchInterval > 0 && !isPlayerDazed(player, dazeTimerRef.current)) {
            twitchTimerRef.current += dt;
            if (twitchTimerRef.current >= debuffStats.periodicTwitchInterval) {
              twitchTimerRef.current = 0;
              const originalAngle = player.angle;
              player.angle += (Math.random() - 0.5) * 1.8;
              fireCurrentWeapon(true);
              player.angle = originalAngle;
              showNotification('Motor spasm! Involuntary stray shot fired!');
            }
          }
          if (player.fireCooldown > 0) {
            player.fireCooldown = Math.max(0, player.fireCooldown - cooldownTick);
          }

          if (player.invincibleTimer > 0) player.invincibleTimer -= dt;

          // 2. City traffic & Civilian AI updates
          if (env.id === 'city') {
            const carSpeedMult = debuffStats.carSpeedMultiplier;
            for (const car of carsRef.current) {
              car.x += car.vx * carSpeedMult * dt;
              if (car.vx > 0 && car.x > env.width + 120) car.x = -120;
              if (car.vx < 0 && car.x < -120) car.x = env.width + 120;

              if (
                player.invincibleTimer <= 0 &&
                !player.pinnedByEnemyId &&
                checkCircleBoxOverlap(player.x, player.y, player.radius, car.x - car.w / 2, car.y - car.h / 2, car.w, car.h)
              ) {
                player.hp -= 1;
                player.invincibleTimer = 1.2 * debuffStats.invulnDurationMultiplier;
                setHp(player.hp);
                sounds.playPlayerHurt();
                triggerShinyYandereJealousRage('officer');
                showNotification(GAME_TEXT.hud.carHitWarning);

                player.vx = Math.sign(car.vx) * 550;
                player.vy = -200;

                if (player.hp <= 0) {
                  triggerGameOver('officer');
                  break;
                }
              }

              // Pursuers take ZERO HP damage from City traffic and are harmlessly nudged onto the nearest sidewalk!
              for (const enemy of enemiesRef.current) {
                if (checkCircleBoxOverlap(enemy.x, enemy.y, enemy.radius, car.x - car.w / 2, car.y - car.h / 2, car.w, car.h)) {
                  const pushDirY = enemy.y < car.y ? -1 : 1;
                  enemy.y += pushDirY * 22;
                  enemy.knockbackVy = pushDirY * 180;
                  enemy.knockbackVx += Math.sign(car.vx) * 95;
                }
              }
            }

            for (const civ of civiliansRef.current) {
              civ.x += civ.vx * dt;
              if (civ.x < 100 || civ.x > env.width - 100) civ.vx *= -1;
              if (civ.panicTimer > 0) {
                civ.panicTimer -= dt;
                if (civ.panicTimer <= 0) civ.isPanicked = false;
              }
            }
          }

          // 2b. Sunset Beach: Periodic Bouncing Beach Volleyball Hazards across the Court & Shoreline!
          if (env.id === 'beach') {
            volleyballTimerRef.current += dt;
            if (volleyballTimerRef.current >= 4.2) {
              volleyballTimerRef.current = 0;
              const fromLeft = Math.random() < 0.5;
              const vy = (Math.random() - 0.5) * 140;
              enemyBulletsRef.current.push({
                id: enemyBulletIdCounter.current++,
                x: fromLeft ? 980 : 1620,
                y: 780 + Math.random() * 260,
                vx: (fromLeft ? 1 : -1) * (270 + Math.random() * 70),
                vy,
                radius: 13,
                damage: 0,
                color: '#f43f5e',
                trailColor: 'rgba(251, 113, 133, 0.45)',
                lifetime: 3.4,
                maxLifetime: 3.4,
                isStunDart: true,
                isVolleyball: true,
              });
            }
          }

          // 3. Spawning (Including Guaranteed Shiny Pursuer & Automatic Heart Shop Popup Every 60 Seconds Survived!)
          const currentMinute = Math.floor(simTimeRef.current / 60);
          if (currentMinute >= 1 && currentMinute > lastShinyMinuteRef.current) {
            lastShinyMinuteRef.current = currentMinute;
            spawnEnemy(undefined, true);
          }
          if (currentMinute >= 1 && currentMinute > lastShopMinuteRef.current) {
            lastShopMinuteRef.current = currentMinute;
            isHeartShopOpenRef.current = true;
            setIsHeartShopOpen(true);
            isMouseDown.current = false;
            sounds.playLevelUp();
          }

          spawnTimerRef.current += dt;
          const currentSpawnInterval = getSpawnInterval(simTimeRef.current);
          if (spawnTimerRef.current >= currentSpawnInterval) {
            spawnTimerRef.current = 0;
            spawnEnemy();
          }

          pickupSpawnTimerRef.current += dt;
          if (pickupSpawnTimerRef.current >= 12 && pickupsRef.current.length < 5) {
            pickupSpawnTimerRef.current = 0;
            spawnPickup();
          }

          puddlesRef.current = puddlesRef.current
            .map((p) => ({ ...p, duration: p.duration - dt }))
            .filter((p) => p.duration > 0);

          if (playerFiredTimerRef.current > 0) {
            playerFiredTimerRef.current = Math.max(0, playerFiredTimerRef.current - dt);
          }

          // 3b. Rare Autonomous NPC Femboys (Max 2 active; permanently removed if they get a Final Game Over at the bed!)
          const maxAllowedNpcs = Math.max(0, 2 - npcEliminatedCountRef.current);
          if (npcFemboysRef.current.length < maxAllowedNpcs) {
            npcSpawnTimerRef.current += dt;
            const nextNpcDelay =
              npcFemboysRef.current.length === 0 && npcEliminatedCountRef.current === 0 ? 16 : 42;
            if (npcSpawnTimerRef.current >= nextNpcDelay) {
              npcSpawnTimerRef.current = 0;
              const spawnedNpc = createNpcFemboy(
                npcIdCounter.current++,
                player.skinId || 'astolfo',
                npcFemboysRef.current,
                selectedOutfitModeRef.current,
                env.id,
                env.width,
                env.height,
                env.walls
              );
              npcFemboysRef.current.push(spawnedNpc);
              setNpcFemboysHud([...npcFemboysRef.current]);
              showNotification(
                `✨ Fellow Femboy ${spawnedNpc.name} arrived! Help him survive & he may team up with you!`
              );
            }
          }

          if (npcFemboysRef.current.length > 0) {
            const isPlayerGrabbedOrLocked = Boolean(
              player.pinnedByEnemyId !== undefined ||
                player.shinyLockedByEnemyId !== undefined ||
                shinyCaptureRef.current?.active
            );
            const playerCaptorId =
              player.pinnedByEnemyId ??
              player.shinyLockedByEnemyId ??
              player.shinyKnockoutHookedById ??
              (shinyCaptureRef.current?.active ? shinyCaptureRef.current.catcher.id : null);
            const npcStep = updateNpcFemboys(
              npcFemboysRef.current,
              player,
              enemiesRef.current,
              env.walls,
              env.doorways,
              env.breachPoints,
              env.id,
              dt,
              env.width,
              env.height,
              simTimeRef.current,
              isPlayerGrabbedOrLocked,
              playerCaptorId,
              pickupsRef.current,
              carsRef.current
            );
            if (npcStep.spawnedBullets.length > 0) {
              for (const sb of npcStep.spawnedBullets) {
                bulletsRef.current.push({
                  ...sb,
                  id: bulletIdCounter.current++,
                });
              }
            }
            if (npcStep.rescuedPlayerFromCapture) {
              player.pinnedByEnemyId = undefined;
              player.shinyLockedByEnemyId = undefined;
              player.shinyKnockoutHookedById = undefined;
              player.slipFallTimer = 0;
              stunSlowTimerRef.current = 0;
              heartbreakStunTimerRef.current = 0;
              showNotification('✨ Fellow Femboy broke the enemy’s grip on you!');
            }
            if (npcStep.eliminatedNpcIds.length > 0) {
              npcFemboysRef.current = npcFemboysRef.current.filter(
                (n) => !npcStep.eliminatedNpcIds.includes(n.id)
              );
              npcEliminatedCountRef.current += npcStep.eliminatedNpcIds.length;
            }
            for (const note of npcStep.notifications) {
              showNotification(note.text);
            }
            setNpcFemboysHud([...npcFemboysRef.current]);
          }

          // 4. Update Enemies with Smart Pathing, Officer Patrol, Hacker Sabotage, Hound Pin & Shiny Abilities
          const viewport = { x: cameraX, y: cameraY, w: canvas.width, h: canvas.height };
          for (const enemy of enemiesRef.current) {
            // Caution ribbon trail boost
            if (cautionRibbonsRef.current.length > 0) {
              for (const rib of cautionRibbonsRef.current) {
                if (distanceSq(enemy.x, enemy.y, rib.x, rib.y) < 32 * 32) {
                  enemy.speedMultiplier = 1.35;
                  break;
                }
              }
            }

            // Delinquent Gang Turf Intimidation debuff: Delinquent surges +25% faster when player is slower
            if (debuffStats.matchSpeed && enemy.archetype === 'delinquent') {
              enemy.speedMultiplier = Math.max(enemy.speedMultiplier, 1.25);
            }

            // Co-Op Raid Party Ping debuff: Pursuers within 220px of each other move +20% faster
            if (debuffStats.cheerSurge) {
              const hasAllyNearby = enemiesRef.current.some(
                (other) => other.id !== enemy.id && distanceSq(enemy.x, enemy.y, other.x, other.y) < 220 * 220
              );
              if (hasAllyNearby) {
                enemy.speedMultiplier = Math.max(enemy.speedMultiplier, 1.2);
              }
            }

            // Loot Box Desync Kick debuff: Pursuers kick weapon pickups away when passing over them (except Hacker Natsuki who hacks them!)
            if (debuffStats.pickupKick && enemy.archetype !== 'hacker') {
              for (const pk of pickupsRef.current) {
                if (distanceSq(enemy.x, enemy.y, pk.x, pk.y) < (enemy.radius + pk.radius + 10) ** 2) {
                  const kickedX = Math.max(80, Math.min(env.width - 80, pk.x + Math.cos(enemy.angle) * 110));
                  const kickedY = Math.max(80, Math.min(env.height - 80, pk.y + Math.sin(enemy.angle) * 110));
                  const safeKicked = findSafePickupPosition(env, kickedX, kickedY, pk.radius + 4);
                  pk.x = safeKicked.x;
                  pk.y = safeKicked.y;
                }
              }
            }

            const isImperviousToEnemy = isPlayerImpervious(player, dazeTimerRef.current);
            const aiResult = updateEnemyAI(
              enemy,
              player.x,
              player.y,
              enemiesRef.current,
              env.walls,
              env.doorways,
              dt,
              env.width,
              env.height,
              simTimeRef.current,
              activeUpgradesRef.current,
              env.breachPoints,
              env.id,
              pickupsRef.current,
              viewport,
              !isImperviousToEnemy && (player.pinnedByEnemyId === enemy.id || player.shinyLockedByEnemyId === enemy.id),
              player.angle,
              medkitsRef.current,
              isImperviousToEnemy,
              carsRef.current,
              npcFemboysRef.current,
              playerFiredTimerRef.current > 0
            );

            // Officer Stun Dart / Shiny Sniper Firing
            if (aiResult.firesBullet) {
              const isSniper = Boolean(aiResult.firesBullet.isShinySniper);
              enemyBulletsRef.current.push({
                id: enemyBulletIdCounter.current++,
                x: aiResult.firesBullet.x,
                y: aiResult.firesBullet.y,
                vx: aiResult.firesBullet.vx,
                vy: aiResult.firesBullet.vy,
                radius: isSniper ? 7.5 : 6,
                damage: aiResult.firesBullet.damage || 1,
                color: isSniper ? '#fde047' : '#38bdf8',
                trailColor: isSniper ? 'rgba(250, 204, 21, 0.85)' : 'rgba(56, 189, 248, 0.45)',
                lifetime: isSniper ? 2.6 : 2.2,
                maxLifetime: isSniper ? 2.6 : 2.2,
                isStunDart: aiResult.firesBullet.isStunDart,
                isHeartNeedle: aiResult.firesBullet.isHeartNeedle,
                isShinySniper: isSniper,
                ownerId: aiResult.firesBullet.ownerId ?? enemy.id,
              });
              sounds.playOfficerShoot();
            }

            // Yandere Heart Dart Volley Firing
            if (aiResult.firesBullets) {
              for (const fb of aiResult.firesBullets) {
                enemyBulletsRef.current.push({
                  id: enemyBulletIdCounter.current++,
                  x: fb.x,
                  y: fb.y,
                  vx: fb.vx,
                  vy: fb.vy,
                  radius: 5,
                  damage: fb.damage || 1,
                  color: fb.isHeartNeedle ? '#f43f5e' : '#fb7185',
                  trailColor: fb.isHeartNeedle ? 'rgba(244, 63, 94, 0.45)' : 'rgba(251, 113, 133, 0.4)',
                  lifetime: 2.5,
                  maxLifetime: 2.5,
                  isHeartNeedle: fb.isHeartNeedle,
                });
              }
              sounds.playShinyBossAttack();
            }

            // Hacker Dual-Monitor RGB Overglow Strobe
            if (aiResult.triggersStrobeFlash) {
              whiteoutTimerRef.current = 1.65;
              sounds.playWallHit();
            }

            // Shiny Goth Raven Jumpscare! Scares the lights out of the player, giggles, and slowly approaches!
            if (aiResult.triggersJumpscare && !isImperviousToEnemy && !shinyCaptureRef.current?.active) {
              jumpscareTimerRef.current = 1.1;
              player.shinyLockedByEnemyId = enemy.id;
              player.vx = 0;
              player.vy = 0;
              stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 6.0);
              heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 4.0);
              sounds.playShinyBossAttack();
              showNotification('👻 SHINY GOTH RAVEN JUMPSCared the lights out of you! She giggles and approaches...');
            }

            // Trainer Maya's Large Hound: Front Stun vs Rear Hold-Down Pin! (Cannot stun or pin while impervious!)
            if (aiResult.houndFrontStun && !isImperviousToEnemy && !player.pinnedByEnemyId) {
              stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.35);
              heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 0.75);
              sounds.playStun();
              showNotification('🐕 Hound Rex lunged into your front! Stunned!');
            }
            if (aiResult.houndRearPin && !isImperviousToEnemy && !player.pinnedByEnemyId && !shinyCaptureRef.current?.active) {
              player.pinnedByEnemyId = enemy.id;
              player.vx = 0;
              player.vy = 0;
              sounds.playStun();
              showNotification(
                enemy.isShiny
                  ? '🐕 SHINY OFF-LEASH HOUND PINNED YOU DOWN! Shoot the hound to KO it or shoot Maya!'
                  : '🐕 Hound Rex caught you from behind and is holding you down until Maya arrives!'
              );
            }

            // Barricade Assault & Break Feedback
            if (aiResult.attackingBreach) {
              sounds.playBarricadeHit();
              for (let i = 0; i < 4; i++) {
                particlesRef.current.push({
                  x: aiResult.attackingBreach.x + aiResult.attackingBreach.w / 2 + (Math.random() - 0.5) * 16,
                  y: aiResult.attackingBreach.y + aiResult.attackingBreach.h / 2 + (Math.random() - 0.5) * 16,
                  vx: (Math.random() - 0.5) * 120,
                  vy: (Math.random() - 0.5) * 120,
                  color: '#78350f',
                  radius: 2.5,
                  life: 0.45,
                  maxLife: 0.45,
                });
              }
              if (aiResult.attackingBreach.breached && !aiResult.attackingBreach.isBarricaded) {
                sounds.playBarricadeBreak();
                showNotification(`${aiResult.attackingBreach.label} smashed open! Hold [E] near breach to rebuild!`);
              }
            }

            if (aiResult.dropsPuddle) {
              puddlesRef.current.push({
                id: puddleIdCounter.current++,
                x: aiResult.dropsPuddle.x,
                y: aiResult.dropsPuddle.y,
                radius: aiResult.dropsPuddle.type === 'smoke' ? 110 : 42,
                duration: aiResult.dropsPuddle.type === 'smoke' ? 6.5 : 8.5,
                type: aiResult.dropsPuddle.type,
                isShinyCoffee: aiResult.dropsPuddle.isShinyCoffee,
                ownerId: aiResult.dropsPuddle.ownerId,
              });
            }

            if (
              enemy.awarenessState === 'alerted' &&
              enemy.speechTimer <= 0 &&
              Math.random() < (enemy.isHauntingWinner ? 0.014 : 0.003)
            ) {
              const arch = GAME_TEXT.archetypes[enemy.archetype as ArchetypeKey];
              const pool = enemy.isHauntingWinner && arch?.hauntCallouts?.length ? arch.hauntCallouts : arch?.callouts;
              if (pool?.length) {
                enemy.speechText = pool[Math.floor(Math.random() * pool.length)];
                enemy.speechTimer = enemy.isHauntingWinner ? 3.4 : 2.5;
              }
            }

            // While the winning woman is resting after a session or busy capturing/dragging an NPC Femboy, skip player capture checks!
            if (
              (enemy.postWinWaitTimer && enemy.postWinWaitTimer > 0) ||
              enemy.strugglingNpcId !== undefined ||
              enemy.draggingNpcId !== undefined
            ) {
              continue;
            }

            // Enforce Physical Separation between Enemy and Player so Ayame (or any pursuer) can NEVER sit on top of you!
            const overlapDx = player.x - enemy.x;
            const overlapDy = player.y - enemy.y;
            const overlapDist = Math.hypot(overlapDx, overlapDy);
            const minSepDist = player.radius + enemy.radius;

            if (overlapDist < minSepDist) {
              const pushAngle = overlapDist > 0.001 ? Math.atan2(overlapDy, overlapDx) : enemy.angle;
              const penetration = minSepDist - overlapDist + 2;
              enemy.x -= Math.cos(pushAngle) * (penetration * 0.65);
              enemy.y -= Math.sin(pushAngle) * (penetration * 0.65);
              player.x += Math.cos(pushAngle) * (penetration * 0.35);
              player.y += Math.sin(pushAngle) * (penetration * 0.35);

              // RULE: While Hound Rex is holding you down (`player.pinnedByEnemyId`), NO OTHER ENEMY can hit you!
              if (player.pinnedByEnemyId !== undefined && enemy.id !== player.pinnedByEnemyId) {
                enemy.knockbackVx -= Math.cos(pushAngle) * 240;
                enemy.knockbackVy -= Math.sin(pushAngle) * 240;
                continue;
              }

              // Also if another Shiny pursuer has dazed/locked you and is approaching, other enemies cannot steal the hit!
              if (player.shinyLockedByEnemyId !== undefined && enemy.id !== player.shinyLockedByEnemyId) {
                enemy.knockbackVx -= Math.cos(pushAngle) * 240;
                enemy.knockbackVy -= Math.sin(pushAngle) * 240;
                continue;
              }

              // --- SABOTAGED INVULNERABILITY CURSE: ANY TOUCH TRIGGERS IMMEDIATE GAME OVER SCENE! ---
              if (player.fragileCurseTimer && player.fragileCurseTimer > 0 && dazeTimerRef.current <= 0) {
                player.fragileCurseTimer = 0;
                player.hp = 0;
                setHp(0);
                showNotification('💔 CURSED VULNERABILITY TRIGGERED! Instant Capture Scene!');
                triggerGameOver(enemy.archetype, Boolean(enemy.isShiny), enemy);
                break;
              }

              // --- SHINY PURSUER CONTACT ---
              if (enemy.isShiny && !isPlayerImpervious(player, dazeTimerRef.current)) {
                // Special case: Shiny Tomboy Roxie's initial tackle sends you flying and knocks you out until she approaches!
                if (
                  enemy.archetype === 'tomboy' &&
                  (enemy.isDashing || enemy.isSliding) &&
                  player.shinyKnockoutHookedById !== enemy.id
                ) {
                  player.shinyLockedByEnemyId = enemy.id;
                  player.shinyKnockoutHookedById = enemy.id;
                  stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 6.0);
                  heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 4.0);
                  // Send player flying across the arena!
                  player.vx = Math.cos(enemy.angle) * 860;
                  player.vy = Math.sin(enemy.angle) * 860;
                  enemy.isDashing = false;
                  enemy.isSliding = false;
                  enemy.specialTimer = 2.8;
                  enemy.speechText = 'BOOM~! Sent you flying! Don’t move, I’m coming over! ★';
                  enemy.speechTimer = 3.0;
                  sounds.playPlayerHurt();
                  showNotification('💥 SHINY ROXIE TACKLE! Sent flying & knocked out—she is approaching!');
                  continue;
                }

                // All Shiny Pursuers reaching the player trigger the 3.5s on-the-spot Heart & "plap" animation!
                triggerShinyOnTheSpotSession(enemy);
                break;
              }

              // --- STANDARD PURSUER CONTACT ---
              // If Trainer Maya reaches the player while her hound was pinning them, release the pin and land the hit!
              if (player.pinnedByEnemyId === enemy.id) {
                player.pinnedByEnemyId = undefined;
                enemy.isHoundPinning = false;
              }

              if (!isPlayerImpervious(player, dazeTimerRef.current)) {
                const rawDmg = 1;
                const finalDmg = rawDmg * (debuffStats.doubleDamage ? 2 : 1);
                player.hp -= finalDmg;
                player.invincibleTimer = 1.0 * debuffStats.invulnDurationMultiplier;
                setHp(player.hp);
                sounds.playPlayerHurt();
                if (debuffStats.impactBlur) impactBlurTimerRef.current = 0.35;

                // Alert Shiny Yandere Ayame if another woman touched you!
                triggerShinyYandereJealousRage(enemy.archetype);

                // Also give enemy a rebound impulse so she doesn't stay glued on top of player
                enemy.knockbackVx -= Math.cos(pushAngle) * 240;
                enemy.knockbackVy -= Math.sin(pushAngle) * 240;

                // Disarm on hit debuff: Knocks gun away
                if (debuffStats.disarmOnHit && player.activeWeaponKey !== 'pistol') {
                  player.activeWeaponKey = 'pistol';
                  player.ammo = -1;
                  setActiveWeaponKey('pistol');
                  setAmmo(-1);
                  showNotification('Disarmed! Weapon knocked from your grasp!');
                  if (debuffStats.emptyStun) {
                    heartbreakStunTimerRef.current = 0.85;
                    stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 0.85);
                    showNotification('💔 Heartbreak Ammo Shock! Stunned for 0.85s!');
                    sounds.playStun();
                  }
                }

                // Permanent archetype contact debuff roll
                const newDebuff = rollArchetypeDebuff(enemy.archetype, player.activeDebuffs);
                if (newDebuff) {
                  player.activeDebuffs.push(newDebuff);
                  setActiveDebuffs([...player.activeDebuffs]);
                  showNotification(`Inflicted with ${newDebuff.name}: ${newDebuff.description}`);
                }

                if (debuffStats.pawNudge) {
                  player.angle += (Math.random() < 0.5 ? 1 : -1) * 0.6;
                }

                if (debuffStats.inverseKnockback) {
                  player.vx = -Math.cos(pushAngle) * 220;
                  player.vy = -Math.sin(pushAngle) * 220;
                } else if (debuffStats.spinKnockback) {
                  player.angle += Math.PI * 0.85;
                  player.vx = Math.cos(pushAngle + 0.9) * 380;
                  player.vy = Math.sin(pushAngle + 0.9) * 380;
                } else {
                  const knockbackMultiplier = debuffStats.knockbackTakenMultiplier;
                  player.vx = Math.cos(pushAngle) * 380 * knockbackMultiplier;
                  player.vy = Math.sin(pushAngle) * 380 * knockbackMultiplier;
                }

                if (player.hp <= 0) {
                  triggerGameOver(enemy.archetype, enemy.isShiny, enemy);
                  break;
                }
              }
            }
          }

        // 5. Update Bullets, Swept Point-Blank Collisions & Deflection Reflections
        const nextBullets: BulletState[] = [];
        for (const b of bulletsRef.current) {
          const prevX = b.x;
          const prevY = b.y;

          // Goth Heavy Sigh (bullet_gravity): Bullets arc downward and lose horizontal momentum
          if (debuffStats.bulletGravity) {
            b.vy += 240 * dt;
            b.vx *= Math.max(0, 1 - 0.35 * dt);
          }

          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Goth Wisp Trail (wisp_bullets): Bullets curve in a sinusoidal wave
          if (debuffStats.wispBullets) {
            const perpAngle = Math.atan2(b.vy, b.vx) + Math.PI / 2;
            const waveOffset = Math.cos(b.lifetime * 22) * 165 * dt;
            b.x += Math.cos(perpAngle) * waveOffset;
            b.y += Math.sin(perpAngle) * waveOffset;
          }

          b.lifetime += dt;

          let bulletConsumed = false;

          for (const w of env.walls) {
            if (checkCircleBoxOverlap(b.x, b.y, b.radius, w.x, w.y, w.w, w.h)) {
              bulletConsumed = true;
              // Tomboy Splintered Bat Shrapnel debuff: Bullets hitting walls burst into hazardous wood splinters
              if (debuffStats.splinterShrapnel) {
                const bounceAngle = Math.atan2(-b.vy, -b.vx) + (Math.random() - 0.5) * 0.7;
                enemyBulletsRef.current.push({
                  id: enemyBulletIdCounter.current++,
                  x: prevX,
                  y: prevY,
                  vx: Math.cos(bounceAngle) * 340,
                  vy: Math.sin(bounceAngle) * 340,
                  radius: 4.5,
                  damage: 1,
                  color: '#fb923c',
                  trailColor: 'rgba(251, 146, 60, 0.5)',
                  lifetime: 0.9,
                  maxLifetime: 0.9,
                  isReflectedBullet: true,
                });
              }
              break;
            }
          }

          if (!bulletConsumed) {
            for (const enemy of enemiesRef.current) {
              // Check if bullet passes over Trainer Maya's Hound Rex
              if (
                enemy.archetype === 'trainer' &&
                enemy.houndX !== undefined &&
                enemy.houndY !== undefined
              ) {
                const hSegDx = b.x - prevX;
                const hSegDy = b.y - prevY;
                const hSegLenSq = hSegDx * hSegDx + hSegDy * hSegDy;
                let hClosestX = b.x;
                let hClosestY = b.y;
                if (hSegLenSq > 0.0001) {
                  const ht = Math.max(
                    0,
                    Math.min(1, ((enemy.houndX - prevX) * hSegDx + (enemy.houndY - prevY) * hSegDy) / hSegLenSq)
                  );
                  hClosestX = prevX + ht * hSegDx;
                  hClosestY = prevY + ht * hSegDy;
                }
                const houndHitRadius = 18 + b.radius;
                if (distanceSq(hClosestX, hClosestY, enemy.houndX, enemy.houndY) <= houndHitRadius * houndHitRadius) {
                  if (enemy.isShiny && (enemy.houndKOTimer || 0) <= 0) {
                    // Shiny Hound Rex cannot be harmed, but can be knocked out temporarily!
                    enemy.houndKOTimer = 4.5;
                    enemy.isHoundLunging = false;
                    enemy.isHoundPinning = false;
                    if (player.pinnedByEnemyId === enemy.id) {
                      player.pinnedByEnemyId = undefined;
                    }
                    if (player.shinyLockedByEnemyId === enemy.id) {
                      player.shinyLockedByEnemyId = undefined;
                    }
                    sounds.playDeflect();
                    showNotification('💫 Shiny Hound Rex knocked out for 4.5s! Aim for Trainer Maya!');
                    for (let sp = 0; sp < 10; sp++) {
                      particlesRef.current.push({
                        x: enemy.houndX,
                        y: enemy.houndY,
                        vx: (Math.random() - 0.5) * 180,
                        vy: (Math.random() - 0.5) * 180,
                        color: sp % 2 === 0 ? '#fde047' : '#f97316',
                        radius: 3,
                        life: 0.35,
                        maxLife: 0.35,
                      });
                    }
                    bulletConsumed = true;
                    break;
                  }
                  // Normal Hound Rex (or already KO'd Shiny Rex): Shots fly cleanly over the hound! Maya must be shot instead.
                }
              }

              // Swept segment-circle + point-blank overlap check so close-quarters enemies like Ayame never dodge bullets!
              const segDx = b.x - prevX;
              const segDy = b.y - prevY;
              const segLenSq = segDx * segDx + segDy * segDy;
              let closestX = b.x;
              let closestY = b.y;
              if (segLenSq > 0.0001) {
                const t = Math.max(0, Math.min(1, ((enemy.x - prevX) * segDx + (enemy.y - prevY) * segDy) / segLenSq));
                closestX = prevX + t * segDx;
                closestY = prevY + t * segDy;
              }
              const hitRadius = enemy.radius + b.radius + 3;
              const isSweptHit = distanceSq(closestX, closestY, enemy.x, enemy.y) <= hitRadius * hitRadius;
              const isPointBlankHit =
                b.lifetime <= dt * 1.5 &&
                distanceSq(player.x, player.y, enemy.x, enemy.y) <= (player.radius + enemy.radius + 14) ** 2;

              if (isSweptHit || isPointBlankHit) {
                consecutiveMissesRef.current = 0;

                // Shiny Tomboy Roxie: Visibly weaves and dodges bullets at a 50% rate!
                if (enemy.archetype === 'tomboy' && enemy.isShiny && Math.random() < 0.5) {
                  enemy.weaveDodgeTimer = 0.38;
                  const sideSign = Math.random() < 0.5 ? 1 : -1;
                  const perpAngle = Math.atan2(b.vy, b.vx) + sideSign * (Math.PI / 2);
                  enemy.x += Math.cos(perpAngle) * 30;
                  enemy.y += Math.sin(perpAngle) * 30;
                  enemy.speechText = 'WEAVE~! Too slow! ★';
                  enemy.speechTimer = 1.1;
                  for (let sp = 0; sp < 6; sp++) {
                    particlesRef.current.push({
                      x: closestX,
                      y: closestY,
                      vx: (Math.random() - 0.5) * 140,
                      vy: (Math.random() - 0.5) * 140,
                      color: sp % 2 === 0 ? '#fde047' : '#fb923c',
                      radius: 2.8,
                      life: 0.25,
                      maxLife: 0.25,
                    });
                  }
                  // Bullet flies past without hitting her!
                  continue;
                }

                // Shiny Yandere Ayame Jealous Rage: Impervious to attacks during her explosive charge!
                if (enemy.archetype === 'yandere' && enemy.isShiny && ((enemy.jealousRageTimer || 0) > 0 || (enemy.yandereRageTimer || 0) > 0)) {
                  enemy.immunePopupTimer = 0.5;
                  enemy.hitFlashTimer = 0.06;
                  sounds.playDeflect();
                  for (let sp = 0; sp < 6; sp++) {
                    particlesRef.current.push({
                      x: b.x,
                      y: b.y,
                      vx: (Math.random() - 0.5) * 180,
                      vy: (Math.random() - 0.5) * 180,
                      color: sp % 2 === 0 ? '#f43f5e' : '#fde047',
                      radius: 3,
                      life: 0.25,
                      maxLife: 0.25,
                    });
                  }
                  bulletConsumed = true;
                  break;
                }

                // Shiny Officer Viki: Impervious to all attacks while aiming and shooting!
                if (isShinyOfficerImpervious(enemy)) {
                  enemy.immunePopupTimer = 0.5;
                  enemy.hitFlashTimer = 0.06;
                  sounds.playDeflect();
                  for (let sp = 0; sp < 6; sp++) {
                    particlesRef.current.push({
                      x: b.x,
                      y: b.y,
                      vx: (Math.random() - 0.5) * 180,
                      vy: (Math.random() - 0.5) * 180,
                      color: sp % 2 === 0 ? '#fde047' : '#38bdf8',
                      radius: 3,
                      life: 0.25,
                      maxLife: 0.25,
                    });
                  }
                  bulletConsumed = true;
                  break;
                }

                // Immortal Victor / Haunting Winner: Impervious to HP damage, but takes full knockback & stagger so it's not an instant loss!
                if (isVictorEnemy(enemy)) {
                  enemy.immunePopupTimer = 0.5;
                  enemy.hitFlashTimer = 0.07;
                  enemy.knockbackStaggerTimer = 0.28;
                  const bSpeed = Math.hypot(b.vx, b.vy) || 1;
                  const hitDirX = b.vx / bSpeed;
                  const hitDirY = b.vy / bSpeed;
                  enemy.knockbackVx += hitDirX * b.knockback * 1.35;
                  enemy.knockbackVy += hitDirY * b.knockback * 1.35;
                  sounds.playDeflect();
                  for (let sp = 0; sp < 6; sp++) {
                    particlesRef.current.push({
                      x: b.x,
                      y: b.y,
                      vx: (Math.random() - 0.5) * 180,
                      vy: (Math.random() - 0.5) * 180,
                      color: sp % 2 === 0 ? '#fde047' : '#f43f5e',
                      radius: 3,
                      life: 0.25,
                      maxLife: 0.25,
                    });
                  }
                  if (b.isExplosive && b.explosionRadius) {
                    for (const otherEnemy of enemiesRef.current) {
                      if (otherEnemy.id !== enemy.id) {
                        const distToExp = Math.hypot(otherEnemy.x - b.x, otherEnemy.y - b.y);
                        if (distToExp <= b.explosionRadius) {
                          const expDirX = (otherEnemy.x - b.x) / (distToExp || 1);
                          const expDirY = (otherEnemy.y - b.y) / (distToExp || 1);
                          otherEnemy.knockbackVx += expDirX * b.knockback * 0.95;
                          otherEnemy.knockbackVy += expDirY * b.knockback * 0.95;
                          otherEnemy.knockbackStaggerTimer = 0.25;
                          if (!isVictorEnemy(otherEnemy) && !isShinyOfficerImpervious(otherEnemy)) {
                            otherEnemy.hp -= b.damage * 0.6;
                            otherEnemy.hitFlashTimer = 0.08;
                          } else {
                            otherEnemy.immunePopupTimer = 0.5;
                          }
                        }
                      }
                    }
                  }
                  bulletConsumed = true;
                  break;
                }

                // Check Universal Deflection & Reflection Mechanics (Delinquent Bat, Officer Shield, Senpai Study Shield, Hacker Firewall)
                const deflectRes = checkBulletDeflection(
                  b,
                  enemy,
                  player.x,
                  player.y,
                  activeUpgradesRef.current
                );

                if (deflectRes.deflected) {
                  enemy.deflectSparkTimer = 0.35;
                  sounds.playDeflect();

                  if (deflectRes.batJustBroke) {
                    sounds.playBarricadeBreak();
                    showNotification('💥 Delinquent’s Wooden Bat shattered! She can no longer block shots!');
                    for (let sp = 0; sp < 14; sp++) {
                      particlesRef.current.push({
                        x: enemy.x,
                        y: enemy.y,
                        vx: (Math.random() - 0.5) * 260,
                        vy: (Math.random() - 0.5) * 260,
                        color: sp % 2 === 0 ? '#b45309' : '#fde68a',
                        radius: 4,
                        life: 0.45,
                        maxLife: 0.45,
                      });
                    }
                  }

                  // Spawn bright deflection spark particles
                  for (let sp = 0; sp < 8; sp++) {
                    particlesRef.current.push({
                      x: b.x,
                      y: b.y,
                      vx: (Math.random() - 0.5) * 220,
                      vy: (Math.random() - 0.5) * 220,
                      color: deflectRes.color,
                      radius: 3.5,
                      life: 0.28,
                      maxLife: 0.28,
                    });
                  }

                  // Shiny Delinquent Ryuko's deflected shots travel faster and stun/daze until she reaches you!
                  const isShinyDelinqReflect = Boolean(enemy.isShiny && enemy.archetype === 'delinquent');
                  enemyBulletsRef.current.push({
                    id: enemyBulletIdCounter.current++,
                    x: enemy.x + Math.cos(enemy.angle) * (enemy.radius + 6),
                    y: enemy.y + Math.sin(enemy.angle) * (enemy.radius + 6),
                    vx: deflectRes.reflectedVx * (isShinyDelinqReflect ? 1.45 : 1.0),
                    vy: deflectRes.reflectedVy * (isShinyDelinqReflect ? 1.45 : 1.0),
                    radius: isShinyDelinqReflect ? 7.0 : 5.5,
                    damage: 0,
                    color: isShinyDelinqReflect ? '#fde047' : deflectRes.color,
                    trailColor: isShinyDelinqReflect ? 'rgba(250, 204, 21, 0.85)' : deflectRes.trailColor,
                    lifetime: 2.0,
                    maxLifetime: 2.0,
                    isReflectedBullet: true,
                    isDazeSpark: true,
                    isShinySniper: isShinyDelinqReflect,
                  });

                  if (deflectRes.damageMultiplier <= 0) {
                    bulletConsumed = true;
                    break;
                  }
                }

                let damageToApply = b.damage * deflectRes.damageMultiplier;

                // Tomboy Slide Tackle low profile
                if (enemy.archetype === 'tomboy' && enemy.isSliding) {
                  damageToApply *= 0.3;
                }

                // Goth Raven Feather dispersion
                if (enemy.archetype === 'goth' && activeUpgradesRef.current.includes('goth_raven_feather')) {
                  damageToApply *= 0.65;
                  for (let f = 0; f < 6; f++) {
                    particlesRef.current.push({
                      x: enemy.x + (Math.random() - 0.5) * 20,
                      y: enemy.y + (Math.random() - 0.5) * 20,
                      vx: (Math.random() - 0.5) * 110,
                      vy: (Math.random() - 0.5) * 110,
                      color: '#581c87',
                      radius: 3.5,
                      life: 0.7,
                      maxLife: 0.7,
                    });
                  }
                }

                // Devotion Frenzy debuff: Yandere enraged when other enemies are hit
                if (debuffStats.jealousyFrenzy && enemy.archetype !== 'yandere') {
                  const yandereEn = enemiesRef.current.find((e) => e.archetype === 'yandere');
                  if (yandereEn) {
                    yandereEn.speedMultiplier = 1.6;
                    yandereEn.speechText = 'HOW DARE YOU LOOK AT HER?!';
                    yandereEn.speechTimer = 1.8;
                  }
                }

                enemy.hp -= damageToApply;
                enemy.hitFlashTimer = 0.08;
                enemy.awarenessState = 'alerted';
                enemy.isAlerted = true;
                enemy.loseSightTimer = 0;
                sounds.playHit();

                // If the player (not an NPC bullet) shoots an enemy grabbing/dragging an NPC Femboy, rescue the NPC Femboy and build affinity!
                if (!b.isNpcBullet && !b.fromNpcId && (enemy.strugglingNpcId || enemy.draggingNpcId)) {
                  const capId = enemy.strugglingNpcId || enemy.draggingNpcId;
                  const rescuedNpc = npcFemboysRef.current.find((n) => n.id === capId);
                  enemy.strugglingNpcId = undefined;
                  enemy.draggingNpcId = undefined;
                  if (rescuedNpc) {
                    rescuedNpc.capturedByEnemyId = undefined;
                    rescuedNpc.invincibleTimer = 2.6;
                    rescuedNpc.hp = Math.max(2, rescuedNpc.hp);
                    rescuedNpc.affinityScore += 1;
                    if (rescuedNpc.affinityScore >= 2 && !rescuedNpc.isLoyalCompanion) {
                      rescuedNpc.isLoyalCompanion = true;
                      rescuedNpc.aiMode = 'following_player';
                      const joinLines = GAME_TEXT.npcFemboyDialogue.loyaltyFollowJoin;
                      rescuedNpc.speechText = joinLines[Math.floor(Math.random() * joinLines.length)];
                      rescuedNpc.speechTimer = 4.0;
                      showNotification(`💖 ${rescuedNpc.name} is now your Loyal Partner and will follow & guard you!`);
                    } else {
                      rescuedNpc.aiMode = 'roaming';
                      const rescueLines = GAME_TEXT.npcFemboyDialogue.thankPlayerForHelp;
                      rescuedNpc.speechText = rescueLines[Math.floor(Math.random() * rescueLines.length)];
                      rescuedNpc.speechTimer = 3.5;
                      showNotification(`✨ You rescued ${rescuedNpc.name}! (Affinity: ${Math.floor(rescuedNpc.affinityScore)}/2)`);
                    }
                  }
                } else if (!b.isNpcBullet && !b.fromNpcId && npcFemboysRef.current.length > 0) {
                  // Shooting an enemy that is actively menacing a nearby NPC Femboy also builds affinity!
                  for (const allyNpc of npcFemboysRef.current) {
                    if (distanceSq(enemy.x, enemy.y, allyNpc.x, allyNpc.y) < 155 * 155) {
                      allyNpc.affinityScore += 0.35;
                      if (allyNpc.affinityScore >= 2 && !allyNpc.isLoyalCompanion) {
                        allyNpc.isLoyalCompanion = true;
                        allyNpc.aiMode = 'following_player';
                        const joinLines = GAME_TEXT.npcFemboyDialogue.loyaltyFollowJoin;
                        allyNpc.speechText = joinLines[Math.floor(Math.random() * joinLines.length)];
                        allyNpc.speechTimer = 4.0;
                        showNotification(`💖 ${allyNpc.name} is now your Loyal Partner and will follow & guard you!`);
                      }
                    }
                  }
                }

                const bSpeed = Math.hypot(b.vx, b.vy) || 1;
                const hitDirX = b.vx / bSpeed;
                const hitDirY = b.vy / bSpeed;
                enemy.knockbackVx += hitDirX * b.knockback;
                enemy.knockbackVy += hitDirY * b.knockback;

                for (let pIdx = 0; pIdx < 4; pIdx++) {
                  particlesRef.current.push({
                    x: b.x,
                    y: b.y,
                    vx: (Math.random() - 0.5) * 160,
                    vy: (Math.random() - 0.5) * 160,
                    color: b.color,
                    radius: 2 + Math.random() * 2,
                    life: 0.25,
                    maxLife: 0.25,
                  });
                }

                if (b.isExplosive && b.explosionRadius) {
                  for (const otherEnemy of enemiesRef.current) {
                    if (otherEnemy.id !== enemy.id) {
                      const distToExp = Math.hypot(otherEnemy.x - b.x, otherEnemy.y - b.y);
                      if (distToExp <= b.explosionRadius) {
                        const expDirX = (otherEnemy.x - b.x) / (distToExp || 1);
                        const expDirY = (otherEnemy.y - b.y) / (distToExp || 1);
                        if (isVictorEnemy(otherEnemy) || isShinyOfficerImpervious(otherEnemy)) {
                          otherEnemy.immunePopupTimer = 0.5;
                          otherEnemy.hitFlashTimer = 0.07;
                          otherEnemy.knockbackStaggerTimer = 0.28;
                          otherEnemy.knockbackVx += expDirX * b.knockback * 1.15;
                          otherEnemy.knockbackVy += expDirY * b.knockback * 1.15;
                          continue;
                        }
                        otherEnemy.hp -= b.damage * 0.6;
                        otherEnemy.hitFlashTimer = 0.08;
                        otherEnemy.knockbackVx += expDirX * b.knockback * 0.8;
                        otherEnemy.knockbackVy += expDirY * b.knockback * 0.8;
                      }
                    }
                  }
                }

                bulletConsumed = true;
                break;
              }
            }
          }

          if (
            !bulletConsumed &&
            b.lifetime < b.maxLifetime &&
            b.x >= 0 &&
            b.x <= env.width &&
            b.y >= 0 &&
            b.y <= env.height
          ) {
            nextBullets.push(b);
          } else if (!bulletConsumed && debuffStats.missPenalty) {
            // Goth Cursed Mirror Hex: Consecutive missed shots hex your movement speed!
            consecutiveMissesRef.current += 1;
            if (consecutiveMissesRef.current >= 4) {
              consecutiveMissesRef.current = 0;
              stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.1);
              showNotification('🪞 Cursed Mirror Hex! Missed shots slowed your stride!');
            }
          }
        }
        bulletsRef.current = nextBullets;

        // 6. Defeat Handling & Tiny Heart EXP Drops
        const survivingEnemies: EnemyState[] = [];
        for (const enemy of enemiesRef.current) {
          if (isVictorEnemy(enemy)) {
            enemy.hp = enemy.maxHp;
            survivingEnemies.push(enemy);
            continue;
          }
          if (enemy.hp <= 0) {
            sounds.playDefeatEnemy();
            defeatedCountRef.current += 1;
            setDefeatedCount(defeatedCountRef.current);

            // Release any active pin or shiny lock held by this defeated enemy
            if (player.pinnedByEnemyId === enemy.id) {
              player.pinnedByEnemyId = undefined;
            }
            if (player.shinyLockedByEnemyId === enemy.id) {
              player.shinyLockedByEnemyId = undefined;
            }

            // RULE: Standard Hacker Natsuki's sabotaged weapons & support items PERSIST even after she is eliminated!
            // ONLY defeating a SHINY Hacker Natsuki restores items she sabotaged back to normal!
            if (enemy.archetype === 'hacker' && enemy.isShiny) {
              let restoredCount = 0;
              for (const pk of pickupsRef.current) {
                if (pk.isSabotaged && (pk.sabotagedByShiny || pk.sabotagedByEnemyId === enemy.id)) {
                  pk.isSabotaged = false;
                  pk.sabotagedByShiny = false;
                  pk.sabotagedByEnemyId = undefined;
                  restoredCount++;
                }
              }
              for (const mk of medkitsRef.current) {
                if (mk.isSabotaged && (mk.sabotagedByShiny || mk.sabotagedByEnemyId === enemy.id)) {
                  mk.isSabotaged = false;
                  mk.sabotagedByShiny = false;
                  mk.sabotagedByEnemyId = undefined;
                  restoredCount++;
                }
              }
              if (player.isWeaponSabotaged && player.sabotagedByShiny) {
                player.isWeaponSabotaged = false;
                player.sabotagedByShiny = false;
                player.sabotagedByEnemyId = undefined;
                restoredCount++;
              }
              showNotification(
                restoredCount > 0
                  ? `💻★ Shiny Hacker Natsuki defeated! ${restoredCount} Shiny-sabotaged item(s) restored to normal!`
                  : '💻★ Shiny Hacker Natsuki defeated!'
              );
            }

            // Wanted Level Progression: Purely based on enemy eliminations!
            wantedKillsProgressRef.current += 1;
            setAdorationExp(wantedKillsProgressRef.current);

            const currentReq = getKillsForNextWantedLevel(adorationLevelRef.current);
            if (wantedKillsProgressRef.current >= currentReq) {
              wantedKillsProgressRef.current = 0;
              adorationLevelRef.current += 1;
              setAdorationLevel(adorationLevelRef.current);
              setAdorationExp(0);
              const nextReq = getKillsForNextWantedLevel(adorationLevelRef.current);
              setExpToNextLevel(nextReq);

              sounds.playLevelUp();
              // Compute Level-Up choice count (1 if sabotaged by a hacked Love Dossier, or 3 + extra choices up to 6, then reset!)
              const choiceCount = player.nextLevelForcedSingle
                ? 1
                : Math.min(6, 3 + (player.nextLevelExtraChoices || 0));
              player.nextLevelForcedSingle = false;
              player.nextLevelExtraChoices = 0;

              const rolledUpgrades = rollEnemyUpgrades(activeUpgradesRef.current, choiceCount, env.id);
              setPendingLevelUpUpgrades(rolledUpgrades);
              setGameState('levelup');
            }

            // Defeated enemies burst into a shower of collectible Hearts (Shop Currency)!
            const heartDropCount = enemy.isShiny ? 8 : 2 + Math.floor(Math.random() * 2);
            for (let h = 0; h < heartDropCount; h++) {
              const hAngle = Math.random() * Math.PI * 2;
              const hSpeed = 40 + Math.random() * 90;
              heartsRef.current.push({
                id: heartIdCounter.current++,
                x: enemy.x,
                y: enemy.y,
                vx: Math.cos(hAngle) * hSpeed,
                vy: Math.sin(hAngle) * hSpeed,
                bobTimer: Math.random() * 10,
                value: enemy.isShiny ? 3 : 2,
                color: enemy.isShiny ? '#fde047' : '#f43f5e',
                scale: 0.9 + Math.random() * 0.35,
              });
            }

            // Support Care Drop (guaranteed for Shiny Boss, 11% for normal pursuers)
            if (enemy.isShiny || Math.random() < 0.11) {
              const dropPos = findSafePickupPosition(
                env,
                enemy.x + (Math.random() - 0.5) * 24,
                enemy.y + (Math.random() - 0.5) * 24,
                20
              );
              medkitsRef.current.push({
                id: medkitIdCounter.current++,
                x: dropPos.x,
                y: dropPos.y,
                bobTimer: 0,
                itemType: rollSupportItemType(heartShopRef.current.supportTiers),
              });
              if (enemy.isShiny) {
                sounds.playShinyBossDefeat();
                showNotification('★ GOLDEN MINI-BOSS VANQUISHED! Care Drop & Weapon Cache secured!');
              }
            }

            // Bounty magnet debuff: pulls nearby chasers toward player
            if (debuffStats.bountyMagnet) {
              for (const chaser of enemiesRef.current) {
                if (chaser.id !== enemy.id && distanceSq(enemy.x, enemy.y, chaser.x, chaser.y) < 350 * 350) {
                  const toPlayerX = player.x - chaser.x;
                  const toPlayerY = player.y - chaser.y;
                  const d = Math.hypot(toPlayerX, toPlayerY) || 1;
                  chaser.x += (toPlayerX / d) * 70;
                  chaser.y += (toPlayerY / d) * 70;
                }
              }
            }

            for (let i = 0; i < 12; i++) {
              particlesRef.current.push({
                x: enemy.x,
                y: enemy.y,
                vx: (Math.random() - 0.5) * 260,
                vy: (Math.random() - 0.5) * 260,
                color: ['#f43f5e', '#ec4899', '#facc15', '#38bdf8', '#c084fc'][Math.floor(Math.random() * 5)],
                radius: 3 + Math.random() * 3,
                life: 0.45,
                maxLife: 0.45,
              });
            }

            // Guaranteed weapon cache on Shiny boss defeat, or 22% chance from normal mobs
            if ((enemy.isShiny || Math.random() < 0.22) && pickupsRef.current.length < 6) {
              spawnPickup();
            }
          } else {
            survivingEnemies.push(enemy);
          }
        }
        enemiesRef.current = survivingEnemies;

        // 6b. Update Enemy Projectiles (Officer Stun Darts, Shiny Sniper Bolts & Deflected Ricochets)
        const nextEnemyBullets: EnemyBulletState[] = [];
        for (const eb of enemyBulletsRef.current) {
          eb.x += eb.vx * dt;
          eb.y += eb.vy * dt;
          eb.lifetime -= dt;

          let ebConsumed = false;

          for (const w of env.walls) {
            if (checkCircleBoxOverlap(eb.x, eb.y, eb.radius, w.x, w.y, w.w, w.h)) {
              ebConsumed = true;
              break;
            }
          }

          if (!ebConsumed && !isPlayerImpervious(player, dazeTimerRef.current)) {
            if (distanceSq(player.x, player.y, eb.x, eb.y) < (player.radius + eb.radius) ** 2) {
              ebConsumed = true;

              if (eb.isReflectedBullet) {
                if (eb.isShinySniper) {
                  // Shiny Delinquent Ryuko's deflects hit hard enough to daze and stun until she reaches you!
                  stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 8.0);
                  heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 6.5);
                  const shinyDelinq = enemiesRef.current.find(
                    (e) => e.archetype === 'delinquent' && e.isShiny
                  );
                  if (shinyDelinq) {
                    player.shinyLockedByEnemyId = shinyDelinq.id;
                    shinyDelinq.speechText = 'HOME RUN~! Stay right there while I walk over! ★';
                    shinyDelinq.speechTimer = 3.5;
                  }
                  sounds.playStun();
                  showNotification(
                    '⚡💥 SHINY RYUKO GRAND SLAM RICOCHET! Dazed & stunned until she reaches you!'
                  );
                } else {
                  // Standard Deflected shots ONLY stun/daze the player and deal 0 HP damage!
                  stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 0.85);
                  player.invincibleTimer = 0.35;
                  sounds.playStun();
                  showNotification('⚡ Deflected Bat Ricochet grazed you! Stunned for 0.85s!');
                }
                for (let s = 0; s < 12; s++) {
                  particlesRef.current.push({
                    x: player.x + (Math.random() - 0.5) * 20,
                    y: player.y + (Math.random() - 0.5) * 20,
                    vx: (Math.random() - 0.5) * 150,
                    vy: (Math.random() - 0.5) * 150,
                    color: '#fde047',
                    radius: 2.5,
                    life: 0.3,
                    maxLife: 0.3,
                  });
                }
              } else if (eb.isStunDart && eb.isShinySniper) {
                // Shiny Officer Viki's high-velocity sniper bolt electrocutes on contact until she reaches you!
                stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 9.0);
                heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 7.5);
                const shinyOfficer = enemiesRef.current.find(
                  (e) => e.archetype === 'officer' && e.isShiny
                );
                if (shinyOfficer) {
                  player.shinyLockedByEnemyId = shinyOfficer.id;
                  shinyOfficer.isAiming = false;
                  shinyOfficer.speechText = 'BULLSEYE~! High-voltage lockdown! Wait right there! ★';
                  shinyOfficer.speechTimer = 3.5;
                }
                sounds.playStun();
                showNotification(
                  '⚡🎯 SHINY VIKI SNIPER BOLT! Electrocuted in place until Officer Viki reaches you!'
                );
                for (let s = 0; s < 18; s++) {
                  particlesRef.current.push({
                    x: player.x + (Math.random() - 0.5) * 28,
                    y: player.y + (Math.random() - 0.5) * 28,
                    vx: (Math.random() - 0.5) * 190,
                    vy: (Math.random() - 0.5) * 190,
                    color: s % 2 === 0 ? '#fde047' : '#38bdf8',
                    radius: 3.0,
                    life: 0.45,
                    maxLife: 0.45,
                  });
                }
              } else if (eb.isVolleyball) {
                // Sunset Beach Bouncing Volleyball Hazard: Bounces you back and dazes/slows for 1.1s (0 HP damage!)
                stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.15);
                const vbSpeed = Math.hypot(eb.vx, eb.vy) || 1;
                player.vx = (eb.vx / vbSpeed) * 390;
                player.vy = (eb.vy / vbSpeed) * 390;
                sounds.playStun();
                showNotification('🏐 BONK! Hit by a flying Beach Volleyball—Dazed!');
                for (let s = 0; s < 10; s++) {
                  particlesRef.current.push({
                    x: player.x,
                    y: player.y,
                    vx: (Math.random() - 0.5) * 160,
                    vy: (Math.random() - 0.5) * 160,
                    color: s % 2 === 0 ? '#f43f5e' : '#fde047',
                    radius: 3,
                    life: 0.35,
                    maxLife: 0.35,
                  });
                }
              } else {
                const dmg = eb.damage * (debuffStats.doubleDamage ? 2 : 1);
                player.hp -= dmg;
                setHp(player.hp);
                player.invincibleTimer = 1.0 * debuffStats.invulnDurationMultiplier;
                sounds.playPlayerHurt();
                if (debuffStats.impactBlur) impactBlurTimerRef.current = 0.35;

                const shooterArchetype: ArchetypeId = eb.isHeartNeedle ? 'yandere' : 'officer';
                triggerShinyYandereJealousRage(shooterArchetype);

                if (eb.isHeartNeedle) {
                  showNotification('💘 Ayame’s Crimson Heart Dagger pierced you!');
                }

                if (eb.isStunDart) {
                  stunSlowTimerRef.current = 1.4;
                  sounds.playStun();
                  showNotification('⚡ Taser Stun Dart hit! Movement speed impaired!');
                  for (let s = 0; s < 12; s++) {
                    particlesRef.current.push({
                      x: player.x + (Math.random() - 0.5) * 24,
                      y: player.y + (Math.random() - 0.5) * 24,
                      vx: (Math.random() - 0.5) * 160,
                      vy: (Math.random() - 0.5) * 160,
                      color: '#38bdf8',
                      radius: 2.5,
                      life: 0.35,
                      maxLife: 0.35,
                    });
                  }
                }

                if (player.hp <= 0) {
                  const shooter = enemiesRef.current.find((e) => e.archetype === shooterArchetype);
                  triggerGameOver(shooterArchetype, shooter?.isShiny || false, shooter);
                  break;
                }
              }
            }
          }

          if (!ebConsumed && eb.lifetime > 0 && eb.x >= 0 && eb.x <= env.width && eb.y >= 0 && eb.y <= env.height) {
            nextEnemyBullets.push(eb);
          }
        }
        enemyBulletsRef.current = nextEnemyBullets;

        // 7. Heart Pickup Physics, Magnetism & Fascination Level-Up
        const magnetRadiusSq = 140 * 140;
        const collectRadiusSq = (player.radius + 15) * (player.radius + 15);
        const survivingHearts: HeartPickup[] = [];
        let expGainedThisFrame = 0;

        for (const heart of heartsRef.current) {
          heart.vx *= Math.max(0, 1 - dt * 4);
          heart.vy *= Math.max(0, 1 - dt * 4);
          heart.x += heart.vx * dt;
          heart.y += heart.vy * dt;

          const distSqToPlayer = distanceSq(player.x, player.y, heart.x, heart.y);

          if (distSqToPlayer <= collectRadiusSq) {
            // Heart collected!
            expGainedThisFrame += heart.value;
            sounds.playHeartCollect();

            for (let s = 0; s < 4; s++) {
              particlesRef.current.push({
                x: heart.x,
                y: heart.y,
                vx: (Math.random() - 0.5) * 110,
                vy: (Math.random() - 0.5) * 110,
                color: heart.color || '#f472b6',
                radius: 2 + Math.random() * 2,
                life: 0.25,
                maxLife: 0.25,
              });
            }
          } else {
            // Magnet pull toward player if within range
            if (distSqToPlayer < magnetRadiusSq) {
              const d = Math.sqrt(distSqToPlayer) || 1;
              const pullSpeed = 420;
              heart.x += ((player.x - heart.x) / d) * pullSpeed * dt;
              heart.y += ((player.y - heart.y) / d) * pullSpeed * dt;
            }
            survivingHearts.push(heart);
          }
        }
        heartsRef.current = survivingHearts;

        // Process Hearts Currency Accumulation for Black Market Shop
        if (expGainedThisFrame > 0) {
          heartCurrencyRef.current += expGainedThisFrame;
          setHeartCurrency(heartCurrencyRef.current);
        }

        // 7b. Support Care Drops (Heal, Level-Up Modifier, 6s Invulnerability, 150% Ammo, Heart Up) & Hacker Sabotage Effects
        medkitSpawnTimerRef.current += dt;
        if (medkitSpawnTimerRef.current >= 28 && medkitsRef.current.length < 3) {
          medkitSpawnTimerRef.current = 0;
          const rolledType = rollSupportItemType(heartShopRef.current.supportTiers);
          const safeMedPos = findSafePickupPosition(
            env,
            180 + Math.random() * (env.width - 360),
            180 + Math.random() * (env.height - 360),
            20
          );
          medkitsRef.current.push({
            id: medkitIdCounter.current++,
            x: safeMedPos.x,
            y: safeMedPos.y,
            bobTimer: 0,
            itemType: rolledType,
          });
          showNotification(`🎁 ${SUPPORT_ITEM_META[rolledType].name} appeared in the area!`);
        }

        const remainingMedkits: MedkitPickup[] = [];
        for (const med of medkitsRef.current) {
          med.bobTimer += dt * 3;
          if (distanceSq(player.x, player.y, med.x, med.y) < (player.radius + 18) ** 2) {
            const itemType: SupportItemType = med.itemType || 'heal';
            const meta = SUPPORT_ITEM_META[itemType];

            if (med.isSabotaged) {
              // SABOTAGED SUPPORT CARE DROP!
              sounds.playBarricadeBreak();
              sounds.playStun();
              impactBlurTimerRef.current = 0.55;

              for (let k = 0; k < 20; k++) {
                particlesRef.current.push({
                  x: player.x + (Math.random() - 0.5) * 26,
                  y: player.y + (Math.random() - 0.5) * 26,
                  vx: (Math.random() - 0.5) * 190,
                  vy: (Math.random() - 0.5) * 190,
                  color: k % 2 === 0 ? '#f43f5e' : '#10b981',
                  radius: 3.5,
                  life: 0.55,
                  maxLife: 0.55,
                });
              }

              // If sabotaged by Shiny Hacker Natsuki, daze/lock the player and prompt her to rush over!
              const shinyHacker =
                enemiesRef.current.find((e) => e.id === med.sabotagedByEnemyId && e.isShiny) ||
                (med.sabotagedByShiny
                  ? enemiesRef.current.find((e) => e.archetype === 'hacker' && e.isShiny)
                  : undefined);
              if (shinyHacker) {
                player.shinyLockedByEnemyId = shinyHacker.id;
                player.vx = 0;
                player.vy = 0;
                heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 5.0);
                stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 5.0);
                shinyHacker.rushingToSabotagedPlayer = true;
                shinyHacker.hackingPickupId = undefined;
                shinyHacker.hackingMedkitId = undefined;
                shinyHacker.hackingTimer = undefined;
                shinyHacker.speechText = 'GOTCHA~! Care package malware triggered—rushing over now! 💻♥';
                shinyHacker.speechTimer = 3.5;
              }

              if (itemType === 'heal') {
                // Sabotaged Heal: Deals 1 damage and stuns!
                player.hp -= 1;
                setHp(player.hp);
                stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.6);
                heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 1.2);
                showNotification('💥 SABOTAGED BENTO! Malware shock dealt -1 HP & stunned you!');
                if (player.hp <= 0) {
                  const hackerEn = enemiesRef.current.find((e) => e.archetype === 'hacker');
                  triggerGameOver('hacker', Boolean(hackerEn?.isShiny), hackerEn);
                  break;
                }
              } else if (itemType === 'level_mod') {
                // Sabotaged Level-Up Modifier: Reduces next Level-Up choices to 1 (then resets after level-up)!
                player.nextLevelForcedSingle = true;
                player.nextLevelExtraChoices = 0;
                showNotification('💥 SABOTAGED DOSSIER! Next Level-Up is locked down to only 1 choice!');
              } else if (itemType === 'invuln') {
                // Sabotaged Invulnerability: For 6 seconds, ANY enemy touch triggers a Game Over animation & scene!
                player.starlightInvulnTimer = 0;
                player.invincibleTimer = 0;
                player.fragileCurseTimer = 6.0;
                showNotification('💔 SABOTAGED IDOL HALO! Cursed for 6s—ANY touch causes an instant Capture Scene!');
              } else if (itemType === 'ammo') {
                // Sabotaged Ammo Pack: Breaks the weapon!
                if (player.activeWeaponKey !== 'pistol') {
                  player.activeWeaponKey = 'pistol';
                  player.ammo = -1;
                  setActiveWeaponKey('pistol');
                  setAmmo(-1);
                  stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, 1.1);
                  showNotification('💥 SABOTAGED AMMO PACK! Spiked rounds shattered your weapon back to the Pistol!');
                } else {
                  player.fireCooldown = Math.max(player.fireCooldown, 2.5);
                  heartbreakStunTimerRef.current = Math.max(heartbreakStunTimerRef.current, 1.5);
                  showNotification('💥 SABOTAGED AMMO PACK! Spiked rounds jammed your Pistol for 2.5s!');
                }
              } else if (itemType === 'heart_up') {
                // Sabotaged Heart Up: Reduces Max Health by 1 (down to a minimum of 1)!
                player.maxHp = Math.max(1, player.maxHp - 1);
                player.hp = Math.min(player.hp, player.maxHp);
                setMaxHp(player.maxHp);
                setHp(player.hp);
                showNotification(`💔 SABOTAGED HEART LOCKET! Max Health reduced to ${player.maxHp} Heart(s)!`);
              }
            } else {
              // NORMAL THEMATIC SUPPORT CARE DROP!
              sounds.playHeal();
              for (let k = 0; k < 14; k++) {
                particlesRef.current.push({
                  x: player.x + (Math.random() - 0.5) * 24,
                  y: player.y + (Math.random() - 0.5) * 24,
                  vx: (Math.random() - 0.5) * 130,
                  vy: (Math.random() - 0.5) * 130,
                  color: meta.color,
                  radius: 3,
                  life: 0.55,
                  maxLife: 0.55,
                });
              }

              if (itemType === 'heal') {
                const healed = Math.min(player.maxHp, player.hp + 1);
                player.hp = healed;
                setHp(healed);
                showNotification('🍱 Sweetheart First-Aid Bento secured! +1 HP Restored!');
              } else if (itemType === 'level_mod') {
                player.nextLevelForcedSingle = false;
                player.nextLevelExtraChoices = Math.min(3, (player.nextLevelExtraChoices || 0) + 1);
                const totalNextChoices = 3 + player.nextLevelExtraChoices;
                showNotification(
                  `💌 Scented Love Letter Dossier! Next Level-Up provides ${totalNextChoices} choices!`
                );
              } else if (itemType === 'invuln') {
                player.fragileCurseTimer = 0;
                player.starlightInvulnTimer = 6.0;
                player.invincibleTimer = Math.max(player.invincibleTimer, 6.0);
                showNotification('🌟 Starlight Idol Halo! Impervious to all attacks for 6 seconds!');
              } else if (itemType === 'ammo') {
                if (player.activeWeaponKey === 'pistol') {
                  const specialKeys = ['shotgun', 'smg', 'laser', 'launcher', 'dual'];
                  const bonusKey = specialKeys[Math.floor(Math.random() * specialKeys.length)];
                  const bDef = WEAPON_DEFS[bonusKey];
                  const overchargedAmmo = Math.ceil(bDef.maxAmmo * 1.5);
                  player.activeWeaponKey = bonusKey;
                  player.ammo = overchargedAmmo;
                  setActiveWeaponKey(bonusKey);
                  setAmmo(overchargedAmmo);
                  showNotification(`🔋 Overstuffed Mag Pouch! Equipped ${bDef.name} at 150% Ammo (${overchargedAmmo})!`);
                } else {
                  const wDef = WEAPON_DEFS[player.activeWeaponKey] || WEAPON_DEFS.shotgun;
                  const overchargedAmmo = Math.ceil(wDef.maxAmmo * 1.5);
                  player.ammo = overchargedAmmo;
                  setAmmo(overchargedAmmo);
                  showNotification(`🔋 Overstuffed Mag Pouch! ${wDef.name} overcharged to 150% Ammo (${overchargedAmmo})!`);
                }
              } else if (itemType === 'heart_up') {
                if (selectedOutfitModeRef.current === 'swimsuit') {
                  player.starlightInvulnTimer = Math.max(player.starlightInvulnTimer || 0, 4.0);
                  player.invincibleTimer = Math.max(player.invincibleTimer, 4.0);
                  showNotification('👙 Two-Piece Swimsuit Challenge locks Max HP to 1! Granted 4s Invulnerability instead!');
                } else if (player.maxHp < 10) {
                  player.maxHp = Math.min(10, player.maxHp + 1);
                  setMaxHp(player.maxHp);
                  showNotification(
                    `💖 Crystal Heart Locket! Received +1 empty Max Heart (${player.hp}/${player.maxHp})!`
                  );
                } else {
                  const healed = Math.min(player.maxHp, player.hp + 1);
                  player.hp = healed;
                  setHp(healed);
                  showNotification('💖 Max Hearts already at 10! Restored +1 HP instead!');
                }
              }
            }
          } else {
            remainingMedkits.push(med);
          }
        }
        medkitsRef.current = remainingMedkits;

        // 8. Weapon Pickups (Instant reliable collection on overlap!)
        pickupsRef.current = pickupsRef.current.filter((pickup) => {
          if (checkCircleOverlap(player.x, player.y, player.radius + 4, pickup.x, pickup.y, pickup.radius)) {
            if (debuffStats.pickupDelay > 0) {
              // Speeding Citation debuff: briefly slows stride for 0.8s after grabbing a weapon cache (never blocks pickup!)
              stunSlowTimerRef.current = Math.max(stunSlowTimerRef.current, debuffStats.pickupDelay);
            }

            sounds.playPickup();
            const def = getEffectiveWeaponStats(pickup.weaponKey, heartShopRef.current.weaponTiers);
            player.activeWeaponKey = pickup.weaponKey;
            player.ammo = def.maxAmmo;
            player.isWeaponSabotaged = Boolean(pickup.isSabotaged);
            player.sabotagedByShiny = Boolean(pickup.sabotagedByShiny);
            setActiveWeaponKey(pickup.weaponKey);
            setAmmo(def.maxAmmo);

            const pickupMsg =
              GAME_TEXT.weapons[pickup.weaponKey as keyof typeof GAME_TEXT.weapons]?.pickupNotification ||
              `Equipped ${def.name}!`;
            showNotification(pickupMsg);
            pickupHoverTimersRef.current.delete(pickup.id);
            return false;
          }
          return true;
        });

        // 9. Particle Lifecycles
        particlesRef.current = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life - dt,
          }))
          .filter((p) => p.life > 0);
        }
      } else if (gameState === 'capturing' && captureCutsceneRef.current?.active) {
        // --- POST-DEFEAT CELEBRATION & DRAG-TO-SPOT CUTSCENE ---
        simTimeRef.current += dt;
        const cs = captureCutsceneRef.current;
        const captor = cs.catcher;
        const player = playerRef.current;
        const spot = env.captureSpot;
        const archData = GAME_TEXT.archetypes[captor.archetype as ArchetypeKey];

        cs.timer += dt;
        cs.cameraZoom = Math.min(1.36, cs.cameraZoom + dt * 0.28);

        if (cs.phase === 'celebrate') {
          // Phase 1 (0.0s - 1.55s): Winning pursuer celebrates with dialogue & heart particles!
          const toPlayerAngle = Math.atan2(player.y - captor.y, player.x - captor.x);
          captor.angle = toPlayerAngle;
          // Keep captor right next to the player during celebration
          const idealX = player.x - Math.cos(toPlayerAngle) * 28;
          const idealY = player.y - Math.sin(toPlayerAngle) * 28;
          captor.x += (idealX - captor.x) * Math.min(1, dt * 8);
          captor.y += (idealY - captor.y) * Math.min(1, dt * 8);
          player.vx = 0;
          player.vy = 0;

          if (Math.random() < 0.35) {
            particlesRef.current.push({
              x: captor.x + (Math.random() - 0.5) * 28,
              y: captor.y - 12 + (Math.random() - 0.5) * 20,
              vx: (Math.random() - 0.5) * 50,
              vy: -35 - Math.random() * 45,
              color: archData?.colorHex || '#f43f5e',
              radius: 3.5,
              life: 0.65,
              maxLife: 0.65,
            });
          }

          if (cs.timer >= 1.55) {
            cs.phase = 'drag';
            cs.timer = 0;
            cs.quote = archData?.dragQuote || `Taking you straight to the ${spot.label}~! ♥`;
          }
        } else if (cs.phase === 'drag') {
          // Phase 2: Captor grabs player and drags them along the multi-hop path to the map's Capture Spot!
          const distToSpot = Math.hypot(spot.x - captor.x, spot.y - captor.y);
          // Exclude bed and nightstand furniture from collision/blocking so the captor can walk directly onto the Bed!
          const dragWalls = env.walls.filter(
            (w) => w.furnitureType !== 'bed' && !w.label?.toLowerCase().includes('nightstand')
          );

          let steer = computeSmartSteering(
            captor,
            spot.x,
            spot.y,
            dragWalls,
            env.doorways,
            env.breachPoints,
            env.id
          );

          // If close with clear line of sight, steer straight onto the capture spot!
          if (distToSpot < 190 && !isLineBlockedByWalls(captor.x, captor.y, spot.x, spot.y, dragWalls, 8)) {
            const dx = spot.x - captor.x;
            const dy = spot.y - captor.y;
            const d = Math.hypot(dx, dy) || 1;
            steer = {
              moveX: dx / d,
              moveY: dy / d,
              dirX: dx / d,
              dirY: dy / d,
            };
          }

          // Futile Player Struggle: Combine Directional Pull (WASD / Arrows / Touch) + Rapid Key-Tapping Resistance!
          struggleTapImpulseRef.current = Math.max(0, struggleTapImpulseRef.current - dt * 1.4);
          let pullX = 0;
          let pullY = 0;
          if (keysDown.current.has('w') || keysDown.current.has('arrowup')) pullY -= 1;
          if (keysDown.current.has('s') || keysDown.current.has('arrowdown')) pullY += 1;
          if (keysDown.current.has('a') || keysDown.current.has('arrowleft')) pullX -= 1;
          if (keysDown.current.has('d') || keysDown.current.has('arrowright')) pullX += 1;
          if (touchMoveVector.current.x !== 0 || touchMoveVector.current.y !== 0) {
            pullX += touchMoveVector.current.x;
            pullY += touchMoveVector.current.y;
          }

          const pullLen = Math.hypot(pullX, pullY);
          const normPullX = pullLen > 0 ? pullX / pullLen : 0;
          const normPullY = pullLen > 0 ? pullY / pullLen : 0;
          // How strongly the player is pulling against or perpendicular to the captor's heading
          const dotAgainst = -(normPullX * steer.dirX + normPullY * steer.dirY);
          const dirResistance = pullLen > 0 ? Math.max(0.35, Math.min(1.0, dotAgainst * 0.5 + 0.5)) : 0;
          const totalResistance = Math.min(1.0, dirResistance * 0.55 + struggleTapImpulseRef.current * 0.65);
          cs.struggleResistance = totalResistance;

          // Resistance noticeably slows the pull (up to ~38% slower) and tugs the trajectory slightly, but remains futile!
          const baseDragSpeed = 290;
          const dragSpeed = baseDragSpeed * (1.0 - totalResistance * 0.38);
          captor.vx = steer.dirX * dragSpeed + normPullX * 26 * dirResistance;
          captor.vy = steer.dirY * dragSpeed + normPullY * 26 * dirResistance;
          captor.x += captor.vx * dt;
          captor.y += captor.vy * dt;
          if (Math.hypot(steer.dirX, steer.dirY) > 0.05) {
            captor.angle = Math.atan2(steer.dirY, steer.dirX);
          }

          // Resolve non-bed walls for captor when far from the capture spot so she walks cleanly through doorways
          if (distToSpot > 55) {
            for (const w of dragWalls) {
              const res = resolveCircleBoxCollision(captor.x, captor.y, captor.radius * 0.65, w.x, w.y, w.w, w.h);
              if (res.collided) {
                captor.x = res.x;
                captor.y = res.y;
              }
            }
          }

          // Player is dragged behind the captor, visibly tugging in their held direction & wiggling!
          const wiggle = Math.sin(simTimeRef.current * (20 + totalResistance * 14)) * (5 + totalResistance * 4);
          const perpX = -Math.sin(captor.angle);
          const perpY = Math.cos(captor.angle);
          const tugOffsetX = normPullX * 18 + normPullX * struggleTapImpulseRef.current * 8;
          const tugOffsetY = normPullY * 18 + normPullY * struggleTapImpulseRef.current * 8;
          const targetPlayerX = captor.x - Math.cos(captor.angle) * (26 + totalResistance * 10) + perpX * wiggle + tugOffsetX;
          const targetPlayerY = captor.y - Math.sin(captor.angle) * (26 + totalResistance * 10) + perpY * wiggle + tugOffsetY;
          player.x += (targetPlayerX - player.x) * Math.min(1, dt * 18);
          player.y += (targetPlayerY - player.y) * Math.min(1, dt * 18);
          player.angle =
            pullLen > 0
              ? Math.atan2(normPullY, normPullX)
              : captor.angle + Math.PI + Math.sin(simTimeRef.current * 16) * 0.25;

          if (Math.random() < 0.35 + totalResistance * 0.4) {
            particlesRef.current.push({
              x: player.x + (Math.random() - 0.5) * 22,
              y: player.y + (Math.random() - 0.5) * 22,
              vx: (Math.random() - 0.5) * 75,
              vy: -25 - Math.random() * 40,
              color: totalResistance > 0.35 ? '#fde047' : '#fda4af',
              radius: 3,
              life: 0.5,
              maxLife: 0.5,
            });
          }

          if (distToSpot <= 45 || cs.timer >= 15.0) {
            cs.phase = 'arrive';
            cs.timer = 0;
            cs.struggleResistance = 0;
          }
        } else if (cs.phase === 'arrive') {
          // Phase 3: Arrived at the Capture Spot — settle onto spot & check Extra Life vs Game Over!
          // (Lasts 3.8s — 2 full seconds longer than before!)
          captor.x += (spot.x - 12 - captor.x) * Math.min(1, dt * 7);
          captor.y += (spot.y - captor.y) * Math.min(1, dt * 7);
          player.x += (spot.x + 14 - player.x) * Math.min(1, dt * 7);
          player.y += (spot.y + 4 - player.y) * Math.min(1, dt * 7);
          captor.vx = 0;
          captor.vy = 0;

          // Rhythmic soft plush "plap" bass thump every 0.28s while hearts and "plap" text bounce off the capture spot!
          const prevBeat = Math.floor((cs.timer - dt) / 0.28);
          const currBeat = Math.floor(cs.timer / 0.28);
          if (currBeat > prevBeat) {
            sounds.playPlapThump();
          }

          if (Math.random() < 0.65) {
            particlesRef.current.push({
              x: spot.x + (Math.random() - 0.5) * 50,
              y: spot.y + (Math.random() - 0.5) * 40,
              vx: (Math.random() - 0.5) * 90,
              vy: -45 - Math.random() * 60,
              color: '#f43f5e',
              radius: 4,
              life: 0.7,
              maxLife: 0.7,
            });
          }

          if (cs.timer >= 3.8) {
            const isComfyInfinite = selectedOutfitModeRef.current === 'comfy';
            if (isComfyInfinite || extraLivesRef.current > 0) {
              // Consume Extra Life (or Infinite Comfy Second Chance!): Player wanders out dazed for 5s, and the winning woman becomes a normal Immortal Victor!
              if (!isComfyInfinite) {
                extraLivesRef.current -= 1;
                setExtraLives(extraLivesRef.current);
              }

              player.hp = player.maxHp;
              setHp(player.maxHp);
              dazeTimerRef.current = 5.0;
              player.dazeTimer = 5.0;
              player.invincibleTimer = 5.5;
              player.x = spot.x;
              player.y = Math.min(env.height - 80, spot.y + 52);
              player.vx = (Math.random() - 0.5) * 60;
              player.vy = 85;

              captor.isShiny = false;
              captor.isVictor = true;
              captor.isImmortalVictor = true;
              captor.isHauntingWinner = true;
              captor.postWinWaitTimer = 10.0; // 5s while player is dazed + 5s after normal game resumes
              captor.hp = captor.maxHp;
              captor.x = spot.x;
              captor.y = spot.y;
              captor.vx = 0;
              captor.vy = 0;
              const hauntLines = archData?.hauntCallouts;
              captor.speechText =
                hauntLines && hauntLines.length > 0
                  ? hauntLines[0]
                  : 'Winning felt so good~! Catch your breath, round two starts soon! ♥';
              captor.speechTimer = 5.0;
              enemiesRef.current = [captor];

              captureCutsceneRef.current = null;
              setGameState('playing');
              showNotification(
                isComfyInfinite
                  ? `🧸 Comfy Infinite Lives! You wander out dazed (5s)... ${archData?.name || 'Your captor'} is now an Immortal Victor!`
                  : `💫 Second Chance used! You wander out dazed (5s)... ${archData?.name || 'Your captor'} is now IMMORTAL!`
              );
            } else {
              finalizeGameOver(captor.archetype, cs.isShiny);
            }
          }
        }

        particlesRef.current = particlesRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx * dt,
            y: p.y + p.vy * dt,
            life: p.life - dt,
          }))
          .filter((p) => p.life > 0);
      }

      // --- RENDERING PHASE ---
      const player = playerRef.current;
      const activeCutscene = captureCutsceneRef.current;
      const activeShinySession = shinyCaptureRef.current;
      const isCutsceneOrGameOver = Boolean(
        activeCutscene?.active || activeShinySession?.active || gameState === 'gameover'
      );
      const focusX = activeCutscene?.active
        ? (player.x + activeCutscene.catcher.x) / 2
        : activeShinySession?.active
        ? (player.x + activeShinySession.catcher.x) / 2
        : player.x;
      const focusY = activeCutscene?.active
        ? (player.y + activeCutscene.catcher.y) / 2
        : activeShinySession?.active
        ? (player.y + activeShinySession.catcher.y) / 2
        : player.y;

      // Lock camera smoothly onto the midpoint between captor & player so it NEVER disjoints or whiplashes to (0, 0)!
      const cameraX = isCutsceneOrGameOver
        ? focusX - canvas.width / 2
        : Math.max(0, Math.min(env.width - canvas.width, focusX - canvas.width / 2));
      const cameraY = isCutsceneOrGameOver
        ? focusY - canvas.height / 2
        : Math.max(0, Math.min(env.height - canvas.height, focusY - canvas.height / 2));

      const renderCtx = {
        ctx,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        cameraX,
        cameraY,
        player,
        enemies: enemiesRef.current,
        bullets: bulletsRef.current,
        enemyBullets: enemyBulletsRef.current,
        pickups: pickupsRef.current,
        medkits: medkitsRef.current,
        puddles: puddlesRef.current,
        hearts: heartsRef.current,
        adorationLevel: adorationLevelRef.current,
        activeUpgrades: activeUpgradesRef.current,
        debuffStats: computeDebuffedPlayerStats(
          290,
          10,
          0.05,
          0.2,
          player.activeDebuffs
        ),
        yandereRef: enemiesRef.current.find((e) => e.archetype === 'yandere') || null,
        cautionRibbons: cautionRibbonsRef.current,
        whiteoutTimer: whiteoutTimerRef.current,
        impactBlurTimer: impactBlurTimerRef.current,
        jumpscareTimer: jumpscareTimerRef.current,
        repairTarget: repairTargetRef.current,
        sanctuaryActive:
          env.id === 'home' &&
          isInsideHouse(player.x, player.y) &&
          env.breachPoints.filter((bp) => (bp.id === 'front-door' || bp.id === 'back-door' || bp.isWindow) && bp.isBarricaded && (bp.barricadeHp || 0) > 0).length >= 4,
        captureCutscene: activeCutscene?.active ? activeCutscene : null,
        shinyCapture: activeShinySession?.active ? activeShinySession : null,
        particles: particlesRef.current,
        mapEnv: env,
        cars: carsRef.current,
        civilians: civiliansRef.current,
        npcFemboys: npcFemboysRef.current,
        arenaWidth: env.width,
        arenaHeight: env.height,
        gameTime: simTimeRef.current,
      };

      // Clear background canvas before any camera zoom transform
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();
      const zoom =
        activeCutscene?.cameraZoom ||
        activeShinySession?.cameraZoom ||
        (isCutsceneOrGameOver ? 1.30 : 1.0);
      if (isCutsceneOrGameOver && zoom > 1.001) {
        const pivotX = canvas.width / 2;
        const pivotY = canvas.height / 2;
        ctx.translate(pivotX, pivotY);
        ctx.scale(zoom, zoom);
        ctx.translate(-pivotX, -pivotY);
      }

      drawArena(renderCtx);
      drawCars(renderCtx);
      drawCivilians(renderCtx);
      drawWeaponPickups(renderCtx);
      drawMedkits(renderCtx); // First-Aid Medical Kits!
      drawHearts(renderCtx); // Sparkling bouncing heart EXP drops!
      drawPlayer(renderCtx); // Cute femboy with dynamic Charm Evolutions!
      drawEnemies(renderCtx);
      drawBullets(renderCtx);
      drawEnemyBullets(renderCtx); // Officer stun darts & Boss shockwaves!
      drawParticles(renderCtx);
      drawTreeCanopies(renderCtx);

      // Draw world-space cutscene tether, struggle lines & dialogue INSIDE the zoomed transform so it never disjoints!
      if (activeCutscene?.active || activeShinySession?.active) {
        drawCaptureCutsceneOverlay(renderCtx);
      }

      ctx.restore();

      if (!activeCutscene?.active && !activeShinySession?.active) {
        drawForestFog(renderCtx); // Atmospheric drifting mist in forest!
        drawMansionFlashlight(renderCtx); // Haunted Mansion pitch darkness + mouse-aimed flashlight beam & glowing enemy eyes!
        drawDebuffOverlays(renderCtx); // Visual debuffs, Red String of Fate, Searchlights, Vignettes, Flames!
      } else {
        drawCaptureCutsceneVignette(renderCtx);
      }

      if (gameState === 'playing' || gameState === 'paused' || gameState === 'levelup') {
        drawMinimap(renderCtx);
      }

      animFrameId.current = requestAnimationFrame(gameLoop);
    };

    animFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animFrameId.current);
    };
  }, [gameState, spawnEnemy, spawnPickup, fireCurrentWeapon, showNotification]);

  const activeWeaponDef = WEAPON_DEFS[activeWeaponKey] || WEAPON_DEFS.pistol;
  const currentMapName = GAME_TEXT.maps[selectedMap as MapKey]?.name || 'Stage';

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Outfit'] select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {gameState === 'title' && (
        <TitleScreen
          selectedMap={selectedMap}
          onSelectMap={(map) => setSelectedMap(map)}
          selectedSkin={selectedSkin}
          onSelectSkin={(skin) => setSelectedSkin(skin)}
          selectedOutfitMode={selectedOutfitMode}
          onSelectOutfitMode={(mode) => {
            selectedOutfitModeRef.current = mode;
            setSelectedOutfitMode(mode);
          }}
          bestTime={bestTime}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={() => startGame(selectedMap)}
          onOpenManual={() => setIsDebuffManualOpen(true)}
        />
      )}

      {(gameState === 'playing' || gameState === 'paused' || gameState === 'levelup') && (
        <GameHud
          survivalTime={survivalTime}
          bestTime={bestTime}
          hp={hp}
          maxHp={maxHp}
          activeWeaponKey={activeWeaponKey}
          ammo={ammo}
          defeatedCount={defeatedCount}
          notification={notification}
          activeDebuffs={activeDebuffs}
          isMuted={isMuted}
          adorationLevel={adorationLevel}
          adorationExp={adorationExp}
          expToNextLevel={expToNextLevel}
          activeUpgradesCount={activeEnemyUpgrades.length}
          extraLives={extraLives}
          homeSanctuaryStatus={
            selectedMap === 'home'
              ? {
                  intactCount: intactBarricadesCount,
                  totalCount: totalBarricadesCount,
                  sanctuaryActive: sanctuaryBuffActive,
                  nearBreachLabel: nearbyRepairPrompt?.label || null,
                }
              : null
          }
          onToggleMute={handleToggleMute}
          onPause={() => setGameState('paused')}
          onRestart={() => startGame(selectedMap)}
          onOpenManual={() => setIsDebuffManualOpen(true)}
          heartCurrency={heartCurrency}
          outfitMode={selectedOutfitMode}
          tauntCooldown={tauntCooldownState}
          npcFemboys={npcFemboysHud}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={() => startGame(selectedMap)}
          onMainMenu={() => setGameState('title')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onOpenManual={() => setIsDebuffManualOpen(true)}
        />
      )}

      {/* Bullet-Heaven Style Enemy Upgrade Modal */}
      {gameState === 'levelup' && pendingLevelUpUpgrades && (
        <LevelUpModal
          currentLevel={adorationLevel}
          upgrades={pendingLevelUpUpgrades}
          onSelectUpgrade={handleSelectUpgrade}
        />
      )}

      {/* Heart Black Market Requisitions Shop Modal (Automatically pops up every 60s survived!) */}
      {isHeartShopOpen && (
        <HeartShopModal
          heartCurrency={heartCurrency}
          shopState={heartShopState}
          playerHp={hp}
          playerMaxHp={maxHp}
          activeDebuffs={activeDebuffs}
          isFreeShopMode={selectedOutfitMode === 'comfy'}
          onBuyWeaponUpgrade={handleBuyWeaponUpgrade}
          onBuySupportUpgrade={handleBuySupportUpgrade}
          onBuyFullHeal={handleBuyFullHeal}
          onBuyPurgeDebuff={handleBuyPurgeDebuff}
          onClose={() => {
            isHeartShopOpenRef.current = false;
            setIsHeartShopOpen(false);
          }}
        />
      )}

      {gameState === 'gameover' && (
        <GameOverSunset
          survivalTime={survivalTime}
          bestTime={bestTime}
          defeatedCount={defeatedCount}
          lastWeaponName={activeWeaponDef.name}
          mapName={currentMapName}
          caughtByArchetype={caughtByArchetype}
          activeDebuffs={activeDebuffs}
          isNewBest={survivalTime >= bestTime && survivalTime > 0}
          isShiny={isShinyCaught}
          onRestart={() => startGame(selectedMap)}
          onChangeArea={() => setGameState('title')}
          onMainMenu={() => setGameState('title')}
          onOpenManual={() => setIsDebuffManualOpen(true)}
        />
      )}

      {/* Debuff & Enemy Upgrade Compendium Modal */}
      <DebuffManualModal
        isOpen={isDebuffManualOpen}
        onClose={() => setIsDebuffManualOpen(false)}
      />
    </div>
  );
}
