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
  WeaponPickupState,
  HazardPuddle,
  MovingCar,
  Civilian,
  MapType,
  MapEnvironment,
  createMapEnvironment,
  WEAPON_DEFS,
  getActiveArchetypes,
  getSpawnInterval,
  createArchetypeSpecs,
  updateEnemyAI,
  checkCircleOverlap,
  checkCircleBoxOverlap,
  resolveCircleBoxCollision,
  rollArchetypeDebuff,
  computeDebuffedPlayerStats,
  distanceSq,
  type ArchetypeId,
  type ActiveDebuff,
} from './game/logic.ts';
import {
  drawArena,
  drawCars,
  drawCivilians,
  drawWeaponPickups,
  drawPlayer,
  drawEnemies,
  drawBullets,
  drawParticles,
  drawTreeCanopies,
  drawForestFog,
  drawMinimap,
} from './game/renderer.ts';
import { sounds } from './game/sound.ts';
import { TitleScreen } from './components/TitleScreen.tsx';
import { GameHud } from './components/GameHud.tsx';
import { GameOverSunset } from './components/GameOverSunset.tsx';
import { PauseModal } from './components/PauseModal.tsx';

type GameState = 'title' | 'playing' | 'paused' | 'gameover';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('title');
  const [selectedMap, setSelectedMap] = useState<MapType>('forest');
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // HUD state
  const [survivalTime, setSurvivalTime] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(0);
  const [hp, setHp] = useState<number>(5);
  const [activeWeaponKey, setActiveWeaponKey] = useState<string>('pistol');
  const [ammo, setAmmo] = useState<number>(-1);
  const [defeatedCount, setDefeatedCount] = useState<number>(0);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeDebuffs, setActiveDebuffs] = useState<ActiveDebuff[]>([]);
  const [caughtByArchetype, setCaughtByArchetype] = useState<ArchetypeId>('sheriff');

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
  const pickupsRef = useRef<WeaponPickupState[]>([]);
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

  // Simulation timers
  const simTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const pickupSpawnTimerRef = useRef<number>(0);
  const defeatedCountRef = useRef<number>(0);
  const enemyIdCounter = useRef<number>(1);
  const bulletIdCounter = useRef<number>(1);
  const pickupIdCounter = useRef<number>(1);
  const puddleIdCounter = useRef<number>(1);
  const carIdCounter = useRef<number>(1);
  const civilianIdCounter = useRef<number>(1);
  const notificationTimeoutRef = useRef<number | null>(null);

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

  // Sync dataset.state
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
    const keys = ['shotgun', 'smg', 'laser', 'launcher', 'dual'];
    const chosen = weaponKey || keys[Math.floor(Math.random() * keys.length)];
    const env = mapEnvRef.current;
    const pad = 160;

    let x = pad + Math.random() * (env.width - pad * 2);
    let y = pad + Math.random() * (env.height - pad * 2);

    if (env.id === 'home') {
      x = 350 + Math.random() * 1000;
      y = 350 + Math.random() * 700;
    }

    pickupsRef.current.push({
      id: pickupIdCounter.current++,
      weaponKey: chosen,
      x,
      y,
      radius: 20,
      bobTimer: Math.random() * 10,
    });
  }, []);

  // Spawns a single enemy
  const spawnEnemy = useCallback((overrideArchetype?: ArchetypeId) => {
    const env = mapEnvRef.current;
    const activePool = getActiveArchetypes(simTimeRef.current, env.id);
    const archetype = overrideArchetype || activePool[Math.floor(Math.random() * activePool.length)];
    const specs = createArchetypeSpecs(archetype, simTimeRef.current);

    let x = env.width / 2;
    let y = env.height / 2;

    if (env.id === 'home' && env.breachPoints.length > 0) {
      const bp = env.breachPoints[Math.floor(Math.random() * env.breachPoints.length)];
      x = bp.x;
      y = bp.y;
    } else {
      const p = playerRef.current;
      const angle = Math.random() * Math.PI * 2;
      const spawnDist = 650 + Math.random() * 320;
      x = p.x + Math.cos(angle) * spawnDist;
      y = p.y + Math.sin(angle) * spawnDist;
    }

    x = Math.max(specs.radius + 20, Math.min(env.width - specs.radius - 20, x));
    y = Math.max(specs.radius + 20, Math.min(env.height - specs.radius - 20, y));

    const archInfo = GAME_TEXT.archetypes[archetype as ArchetypeKey];
    const initialCallout =
      archInfo?.callouts[Math.floor(Math.random() * archInfo.callouts.length)] || '';

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
      angle: 0,
      knockbackVx: 0,
      knockbackVy: 0,
      hitFlashTimer: 0,
      speechText: initialCallout,
      speechTimer: 2.4,
      specialTimer: 2.0,
    });
  }, []);

  // Reset and start new run
  const startGame = useCallback((mapToStart?: MapType) => {
    const mapType = mapToStart || selectedMap;
    const env = createMapEnvironment(mapType);
    mapEnvRef.current = env;

    playerRef.current = {
      x: env.width / 2,
      y: env.height / 2,
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
    };

    enemiesRef.current = [];
    bulletsRef.current = [];
    pickupsRef.current = [];
    puddlesRef.current = [];
    particlesRef.current = [];
    carsRef.current = [];
    civiliansRef.current = [];

    simTimeRef.current = 0;
    spawnTimerRef.current = 0;
    pickupSpawnTimerRef.current = 0;
    defeatedCountRef.current = 0;

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
        });
      }
    }

    spawnPickup('shotgun');
    spawnPickup('smg');
    spawnPickup('dual');

    setHp(5);
    setActiveWeaponKey('pistol');
    setAmmo(-1);
    setActiveDebuffs([]);
    setDefeatedCount(0);
    setSurvivalTime(0);
    setNotification(null);

    setGameState('playing');
  }, [selectedMap, spawnPickup]);

  // Autostart param support
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      const mapParam = params.get('map') as MapType;
      if (mapParam && ['forest', 'home', 'city'].includes(mapParam)) {
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

  // Fire active weapon (taking debuffs into account)
  const fireCurrentWeapon = useCallback(() => {
    const p = playerRef.current;
    const def = WEAPON_DEFS[p.activeWeaponKey] || WEAPON_DEFS.pistol;

    const debuffStats = computeDebuffedPlayerStats(
      p.speed,
      def.damage,
      def.spreadAngle,
      def.fireInterval,
      p.activeDebuffs
    );

    sounds.playShoot(def.id);
    p.fireCooldown = def.fireInterval * debuffStats.fireIntervalMultiplier;

    if (def.maxAmmo !== -1) {
      p.ammo -= 1;
      if (p.ammo <= 0) {
        p.activeWeaponKey = 'pistol';
        p.ammo = -1;
        showNotification('Ammo depleted! Switched to Pea Blaster.');
      }
      setAmmo(p.ammo);
      setActiveWeaponKey(p.activeWeaponKey);
    }

    const baseAngle = p.angle;
    const currentSpread = def.spreadAngle * debuffStats.spreadMultiplier;
    const halfSpread = currentSpread / 2;

    for (let i = 0; i < def.pelletCount; i++) {
      let shotAngle = baseAngle;
      if (def.pelletCount > 1) {
        const t = i / (def.pelletCount - 1);
        shotAngle = baseAngle - halfSpread + t * currentSpread;
      } else {
        shotAngle += (Math.random() - 0.5) * currentSpread;
      }

      bulletsRef.current.push({
        id: bulletIdCounter.current++,
        x: p.x + Math.cos(baseAngle) * (p.radius + 6),
        y: p.y + Math.sin(baseAngle) * (p.radius + 6),
        vx: Math.cos(shotAngle) * def.bulletSpeed,
        vy: Math.sin(shotAngle) * def.bulletSpeed,
        radius: def.bulletRadius,
        damage: def.damage * debuffStats.damageMultiplier,
        knockback: def.knockback,
        color: def.color,
        trailColor: def.trailColor,
        lifetime: 0,
        maxLifetime: 1.4,
        isExplosive: def.isExplosive,
        explosionRadius: def.explosionRadius,
      });
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
      keysDown.current.add(e.key.toLowerCase());

      if (e.key === ' ' && gameState === 'playing') {
        isMouseDown.current = true;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        if (gameState === 'playing') setGameState('paused');
        else if (gameState === 'paused') setGameState('playing');
      }

      if ((e.key === 'r' || e.key === 'R') && gameState === 'playing') {
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
      if (e.button === 0) isMouseDown.current = true;
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 0) isMouseDown.current = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
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

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const rawDt = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      const dt = Math.min(rawDt, 0.05);

      const env = mapEnvRef.current;

      if (gameState === 'playing') {
        simTimeRef.current += dt;
        hudTimerAccumulator += dt;

        if (hudTimerAccumulator >= 0.15) {
          hudTimerAccumulator = 0;
          setSurvivalTime(simTimeRef.current);
        }

        const player = playerRef.current;

        // Compute debuff-modified stats
        const debuffStats = computeDebuffedPlayerStats(
          290,
          10,
          0.05,
          0.2,
          player.activeDebuffs
        );

        // 1. Process Movement
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

        const moveLen = Math.hypot(moveX, moveY);
        let currentSpeed = debuffStats.speed;

        // Forest: Bushes slow movement
        if (env.id === 'forest') {
          for (const bush of env.bushes) {
            if (distanceSq(player.x, player.y, bush.x, bush.y) < bush.radius * bush.radius) {
              currentSpeed *= 0.55;
              break;
            }
          }
        }

        // Puddles
        for (const puddle of puddlesRef.current) {
          if (distanceSq(player.x, player.y, puddle.x, puddle.y) < puddle.radius * puddle.radius) {
            currentSpeed *= 0.6;
            break;
          }
        }

        if (moveLen > 0) {
          player.vx = (moveX / moveLen) * currentSpeed;
          player.vy = (moveY / moveLen) * currentSpeed;
        } else {
          player.vx *= 0.75;
          player.vy *= 0.75;
        }

        player.x += player.vx * dt;
        player.y += player.vy * dt;

        // Wall collisions
        for (const w of env.walls) {
          const res = resolveCircleBoxCollision(player.x, player.y, player.radius, w.x, w.y, w.w, w.h);
          if (res.collided) {
            player.x = res.x;
            player.y = res.y;
          }
        }

        player.x = Math.max(player.radius, Math.min(env.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(env.height - player.radius, player.y));

        const cameraX = Math.max(0, Math.min(env.width - canvas.width, player.x - canvas.width / 2));
        const cameraY = Math.max(0, Math.min(env.height - canvas.height, player.y - canvas.height / 2));
        const targetWorldX = mousePos.current.x + cameraX;
        const targetWorldY = mousePos.current.y + cameraY;
        player.angle = Math.atan2(targetWorldY - player.y, targetWorldX - player.x);

        if (player.fireCooldown > 0) player.fireCooldown -= dt;
        if (isMouseDown.current && player.fireCooldown <= 0) {
          fireCurrentWeapon();
        }

        if (player.invincibleTimer > 0) player.invincibleTimer -= dt;

        // 2. City traffic updates & collisions
        if (env.id === 'city') {
          for (const car of carsRef.current) {
            car.x += car.vx * dt;
            if (car.vx > 0 && car.x > env.width + 120) car.x = -120;
            if (car.vx < 0 && car.x < -120) car.x = env.width + 120;

            if (
              player.invincibleTimer <= 0 &&
              checkCircleBoxOverlap(player.x, player.y, player.radius, car.x - car.w / 2, car.y - car.h / 2, car.w, car.h)
            ) {
              player.hp -= 1;
              player.invincibleTimer = 1.2;
              setHp(player.hp);
              sounds.playPlayerHurt();
              showNotification(GAME_TEXT.hud.carHitWarning);

              player.vx = Math.sign(car.vx) * 550;
              player.vy = -200;

              if (player.hp <= 0) {
                setCaughtByArchetype('officer');
                triggerGameOver('officer');
                break;
              }
            }

            for (const enemy of enemiesRef.current) {
              if (checkCircleBoxOverlap(enemy.x, enemy.y, enemy.radius, car.x - car.w / 2, car.y - car.h / 2, car.w, car.h)) {
                enemy.hp -= 25;
                enemy.knockbackVx += Math.sign(car.vx) * 450;
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

        // 3. Spawning
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

        // 4. Update Enemies with Smart Pathing & Debuff On Contact
        for (const enemy of enemiesRef.current) {
          const aiResult = updateEnemyAI(
            enemy,
            player.x,
            player.y,
            enemiesRef.current,
            env.walls,
            env.doorways,
            dt,
            env.width,
            env.height
          );

          if (aiResult.dropsPuddle) {
            puddlesRef.current.push({
              id: puddleIdCounter.current++,
              x: aiResult.dropsPuddle.x,
              y: aiResult.dropsPuddle.y,
              radius: 42,
              duration: 8.0,
              type: aiResult.dropsPuddle.type,
            });
          }

          // Sheriff summoned Deputy Officer!
          if (aiResult.requestsOfficerBackup) {
            spawnEnemy('officer');
            showNotification('Sheriff Abigail sounded the county alarm! Deputy Officer deployed!');
          }

          if (enemy.speechTimer <= 0 && Math.random() < 0.003) {
            const arch = GAME_TEXT.archetypes[enemy.archetype as ArchetypeKey];
            if (arch?.callouts?.length) {
              enemy.speechText = arch.callouts[Math.floor(Math.random() * arch.callouts.length)];
              enemy.speechTimer = 2.5;
            }
          }

          // Enemy contact with player: inflicts contact debuff!
          if (
            player.invincibleTimer <= 0 &&
            checkCircleOverlap(player.x, player.y, player.radius, enemy.x, enemy.y, enemy.radius)
          ) {
            player.hp -= 1;
            player.invincibleTimer = 1.0;
            setHp(player.hp);
            sounds.playPlayerHurt();

            // Permanent archetype contact debuff roll
            const newDebuff = rollArchetypeDebuff(enemy.archetype, player.activeDebuffs);
            if (newDebuff) {
              player.activeDebuffs.push(newDebuff);
              setActiveDebuffs([...player.activeDebuffs]);
              showNotification(`Inflicted with ${newDebuff.name}: ${newDebuff.description}`);
            }

            const hitAngle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            const knockbackMultiplier = debuffStats.knockbackTakenMultiplier;
            player.vx = Math.cos(hitAngle) * 380 * knockbackMultiplier;
            player.vy = Math.sin(hitAngle) * 380 * knockbackMultiplier;

            if (player.hp <= 0) {
              setCaughtByArchetype(enemy.archetype);
              triggerGameOver(enemy.archetype);
              break;
            }
          }
        }

        // 5. Update Bullets & Wall Collisions (Delinquent bat shield)
        const nextBullets: BulletState[] = [];
        for (const b of bulletsRef.current) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          b.lifetime += dt;

          let bulletConsumed = false;

          for (const w of env.walls) {
            if (checkCircleBoxOverlap(b.x, b.y, b.radius, w.x, w.y, w.w, w.h)) {
              bulletConsumed = true;
              break;
            }
          }

          if (!bulletConsumed) {
            for (const enemy of enemiesRef.current) {
              if (checkCircleOverlap(b.x, b.y, b.radius, enemy.x, enemy.y, enemy.radius)) {
                let damageToApply = b.damage;

                // Delinquent frontal bat block mechanic
                if (enemy.archetype === 'delinquent') {
                  const bulletAngle = Math.atan2(b.vy, b.vx);
                  const angleDiff = Math.abs(bulletAngle - (enemy.angle + Math.PI));
                  if (angleDiff < 1.2 || angleDiff > Math.PI * 2 - 1.2) {
                    damageToApply *= 0.4; // bat blocks 60% damage!
                    // Clank spark particle
                    for (let sp = 0; sp < 6; sp++) {
                      particlesRef.current.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 200,
                        vy: (Math.random() - 0.5) * 200,
                        color: '#fef08a',
                        radius: 3,
                        life: 0.2,
                        maxLife: 0.2,
                      });
                    }
                  }
                }

                enemy.hp -= damageToApply;
                enemy.hitFlashTimer = 0.08;
                sounds.playHit();

                const hitDirX = b.vx / Math.hypot(b.vx, b.vy);
                const hitDirY = b.vy / Math.hypot(b.vy, b.vy);
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
                        otherEnemy.hp -= b.damage * 0.6;
                        otherEnemy.hitFlashTimer = 0.08;
                        const expDirX = (otherEnemy.x - b.x) / (distToExp || 1);
                        const expDirY = (otherEnemy.y - b.y) / (distToExp || 1);
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
          }
        }
        bulletsRef.current = nextBullets;

        // 6. Defeat
        const survivingEnemies: EnemyState[] = [];
        for (const enemy of enemiesRef.current) {
          if (enemy.hp <= 0) {
            sounds.playDefeatEnemy();
            defeatedCountRef.current += 1;
            setDefeatedCount(defeatedCountRef.current);

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

            if (Math.random() < 0.22 && pickupsRef.current.length < 6) {
              spawnPickup();
            }
          } else {
            survivingEnemies.push(enemy);
          }
        }
        enemiesRef.current = survivingEnemies;

        // 7. Pickups
        pickupsRef.current = pickupsRef.current.filter((pickup) => {
          if (checkCircleOverlap(player.x, player.y, player.radius, pickup.x, pickup.y, pickup.radius)) {
            sounds.playPickup();
            const def = WEAPON_DEFS[pickup.weaponKey] || WEAPON_DEFS.pistol;
            player.activeWeaponKey = pickup.weaponKey;
            player.ammo = def.maxAmmo;
            setActiveWeaponKey(pickup.weaponKey);
            setAmmo(def.maxAmmo);

            const pickupMsg =
              GAME_TEXT.weapons[pickup.weaponKey as keyof typeof GAME_TEXT.weapons]?.pickupNotification ||
              `Equipped ${def.name}!`;
            showNotification(pickupMsg);
            return false;
          }
          return true;
        });

        // 8. Particles
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
      const cameraX = Math.max(0, Math.min(env.width - canvas.width, player.x - canvas.width / 2));
      const cameraY = Math.max(0, Math.min(env.height - canvas.height, player.y - canvas.height / 2));

      const renderCtx = {
        ctx,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        cameraX,
        cameraY,
        player,
        enemies: enemiesRef.current,
        bullets: bulletsRef.current,
        pickups: pickupsRef.current,
        puddles: puddlesRef.current,
        particles: particlesRef.current,
        mapEnv: env,
        cars: carsRef.current,
        civilians: civiliansRef.current,
        arenaWidth: env.width,
        arenaHeight: env.height,
        gameTime: simTimeRef.current,
      };

      drawArena(renderCtx);
      drawCars(renderCtx);
      drawCivilians(renderCtx);
      drawWeaponPickups(renderCtx);
      drawPlayer(renderCtx);
      drawEnemies(renderCtx);
      drawBullets(renderCtx);
      drawParticles(renderCtx);
      drawTreeCanopies(renderCtx);
      drawForestFog(renderCtx); // Atmospheric drifting mist!

      if (gameState === 'playing' || gameState === 'paused') {
        drawMinimap(renderCtx);
      }

      animFrameId.current = requestAnimationFrame(gameLoop);
    };

    const triggerGameOver = (catcher: ArchetypeId) => {
      sounds.playGameOver();
      setCaughtByArchetype(catcher);
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
          bestTime={bestTime}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onStart={() => startGame(selectedMap)}
        />
      )}

      {gameState === 'playing' && (
        <GameHud
          survivalTime={survivalTime}
          bestTime={bestTime}
          hp={hp}
          maxHp={5}
          activeWeaponKey={activeWeaponKey}
          ammo={ammo}
          defeatedCount={defeatedCount}
          notification={notification}
          activeDebuffs={activeDebuffs}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          onPause={() => setGameState('paused')}
          onRestart={() => startGame(selectedMap)}
        />
      )}

      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestart={() => startGame(selectedMap)}
          onMainMenu={() => setGameState('title')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
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
          onRestart={() => startGame(selectedMap)}
          onChangeArea={() => setGameState('title')}
          onMainMenu={() => setGameState('title')}
        />
      )}
    </div>
  );
}
