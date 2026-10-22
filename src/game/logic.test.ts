import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatTime,
  distanceSq,
  checkCircleOverlap,
  checkCircleBoxOverlap,
  resolveCircleBoxCollision,
  lineIntersectsBox,
  computeSmartSteering,
  getActiveArchetypes,
  createArchetypeSpecs,
  createMapEnvironment,
  rollArchetypeDebuff,
  computeDebuffedPlayerStats,
  updateEnemyAI,
  type EnemyState,
  type ActiveDebuff,
  type BreachPoint,
} from './logic.ts';

test('formatTime formats seconds into mm:ss.ms accurately', () => {
  assert.equal(formatTime(0), '00:00.00');
  assert.equal(formatTime(65.25), '01:05.25');
  assert.equal(formatTime(125.99), '02:05.99');
});

test('lineIntersectsBox detects ray intersection with obstacle', () => {
  // Box at 100, 100, w: 100, h: 100
  // Line crossing through the box
  assert.equal(lineIntersectsBox(50, 150, 250, 150, 100, 100, 100, 100), true);
  // Line completely above the box
  assert.equal(lineIntersectsBox(50, 50, 250, 50, 100, 100, 100, 100), false);
});

test('computeSmartSteering steers around obstacle when direct line is blocked', () => {
  const wall = { x: 100, y: 50, w: 50, h: 200 };
  const enemy: EnemyState = {
    id: 1,
    archetype: 'officer',
    x: 50,
    y: 150,
    vx: 0,
    vy: 0,
    radius: 18,
    hp: 30,
    maxHp: 30,
    baseSpeed: 160,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 2.0,
  };

  // Direct line to (200, 150) goes straight through the wall
  const steer = computeSmartSteering(enemy, 200, 150, [wall]);
  // Instead of direct right (moveY == 0), smart steering should deflect around the wall (moveY != 0)
  assert.notEqual(steer.moveY, 0, 'Smart steering should steer around the wall');
});

test('enemies path to and assault barricaded doors and windows when player is inside home', () => {
  const enemy: EnemyState = {
    id: 2,
    archetype: 'delinquent',
    x: 400,
    y: 100, // outside above front door at (400, 300)
    vx: 0,
    vy: 0,
    radius: 19,
    hp: 45,
    maxHp: 45,
    baseSpeed: 190,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0,
  };

  const breach: BreachPoint = {
    id: 'front-door',
    label: 'Front Door',
    x: 380,
    y: 290,
    w: 50,
    h: 20,
    isDoor: true,
    isBarricaded: true,
    barricadeHp: 100,
    maxBarricadeHp: 100,
    outsideX: 400,
    outsideY: 260,
    insideX: 400,
    insideY: 340,
  };

  // Player is deep inside at (800, 800)
  const result = updateEnemyAI(
    enemy,
    800,
    800,
    [enemy],
    [{ x: 200, y: 290, w: 1000, h: 20 }], // exterior wall
    undefined,
    0.1,
    2000,
    2000,
    10,
    [],
    [breach],
    'home'
  );

  // Enemy should steer toward the breach point to assault it
  assert.ok(enemy.vy > 0, 'Enemy should steer downward toward the front door');
});

test('rollArchetypeDebuff picks distinct debuffs from archetype pool', () => {
  const d1 = rollArchetypeDebuff('officer', []);
  assert.ok(d1, 'Should roll a valid debuff for officer');
  assert.equal(d1?.archetype, 'officer');

  // Should not roll a duplicate if already active
  const existing: ActiveDebuff[] = [d1!];
  const d2 = rollArchetypeDebuff('officer', existing);
  if (d2) {
    assert.notEqual(d2.id, d1!.id);
  }
});

test('computeDebuffedPlayerStats aggregates modifiers correctly', () => {
  const debuffs: ActiveDebuff[] = [
    {
      id: 'test_slow',
      name: 'Slow',
      archetype: 'tomboy',
      description: 'Slows',
      effectType: 'slow',
      effectValue: 0.8,
    },
    {
      id: 'test_dmg',
      name: 'Weak',
      archetype: 'delinquent',
      description: 'Weaker',
      effectType: 'damage_penalty',
      effectValue: 0.8,
    },
  ];

  const stats = computeDebuffedPlayerStats(300, 20, 0.05, 0.2, debuffs);
  assert.equal(stats.speed, 240); // 300 * 0.8
  assert.equal(stats.damageMultiplier, 0.8);
});

test('city map is expanded with open avenues and spawns officers not sheriffs', () => {
  const city = createMapEnvironment('city');
  assert.ok(city.width >= 3000);
  assert.ok(city.height >= 2500);

  const cityArchetypes = getActiveArchetypes(10, 'city');
  assert.ok(cityArchetypes.includes('officer'));
  assert.equal(cityArchetypes.includes('sheriff'), false, 'City should not spawn sheriffs');
});

test('officer aims and fires stun darts when alerted and in line of sight', () => {
  const officer: EnemyState = {
    id: 10,
    archetype: 'officer',
    x: 400,
    y: 400,
    vx: 0,
    vy: 0,
    radius: 18,
    hp: 40,
    maxHp: 40,
    baseSpeed: 175,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0,
    isAlerted: true,
    shootCooldown: 0, // Ready to shoot
    isAiming: false,
  };

  // Player at (600, 400), distance 200, clear line of sight
  const result1 = updateEnemyAI(officer, 600, 400, [officer], [], undefined, 0.1, 2000, 2000);
  assert.equal(officer.isAiming, true, 'Officer should initiate aiming when ready to shoot');
  assert.ok((officer.aimTelegraphTimer || 0) > 0, 'Officer telegraph timer should be active');

  // Fast forward telegraph completion
  officer.aimTelegraphTimer = 0.05;
  const result2 = updateEnemyAI(officer, 600, 400, [officer], [], undefined, 0.1, 2000, 2000);
  assert.ok(result2.firesBullet, 'Officer should fire stun dart upon completing aim telegraph');
  assert.equal(result2.firesBullet?.isStunDart, true);
  assert.equal(officer.isAiming, false);
});

test('officer patrols with moderate pace when unalerted and alerts upon line of sight', () => {
  const officer: EnemyState = {
    id: 11,
    archetype: 'officer',
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 18,
    hp: 36,
    maxHp: 36,
    baseSpeed: 175,
    speedMultiplier: 1.0,
    angle: 0, // facing right
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0,
    isAlerted: false,
    patrolAngle: 0,
    patrolTimer: 3.0,
  };

  // Player far away at (900, 900) -> not alerted
  updateEnemyAI(officer, 900, 900, [officer], [], undefined, 0.1, 2000, 2000);
  assert.equal(officer.isAlerted, false, 'Officer should stay unalerted when player is outside LOS');
  assert.equal(officer.isSirenActive, false);

  // Player right in front of officer at (420, 300) -> distance 120px, angle 0 -> alerted!
  updateEnemyAI(officer, 420, 300, [officer], [], undefined, 0.1, 2000, 2000);
  assert.equal(officer.isAlerted, true, 'Officer should alert upon spotting player in forward cone');
  assert.equal(officer.isSirenActive, true, 'Officer siren should activate upon alert');
});

test('mob caps and wanted level kill progression scale cleanly', async () => {
  const { getMaxMobCap, getExpForLevel, getKillsForNextWantedLevel, rollEnemyUpgrades, ENEMY_UPGRADE_POOL } = await import('./logic.ts');
  assert.equal(getMaxMobCap('home'), 10);
  assert.equal(getMaxMobCap('forest'), 14);
  assert.equal(getMaxMobCap('city'), 16);

  assert.equal(getExpForLevel(1), 5);
  assert.equal(getKillsForNextWantedLevel(1), 5);
  assert.equal(getKillsForNextWantedLevel(2), 8);

  assert.ok(ENEMY_UPGRADE_POOL.length >= 24);
  const rolled = rollEnemyUpgrades([], 3);
  assert.equal(rolled.length, 3);
  assert.notEqual(rolled[0].id, rolled[1].id);
  assert.notEqual(rolled[1].id, rolled[2].id);
});

test('checkBulletDeflection reflects frontal shots back toward player for Delinquent, Officer, Senpai, and Gyaru', async () => {
  const { checkBulletDeflection, createMapEnvironment, computeDebuffedPlayerStats } = await import('./logic.ts');

  const delinquent = {
    id: 10,
    archetype: 'delinquent' as const,
    x: 500,
    y: 500,
    vx: 0,
    vy: 0,
    radius: 20,
    hp: 65,
    maxHp: 65,
    baseSpeed: 215,
    speedMultiplier: 1.0,
    angle: 0, // facing right toward player at (700, 500)
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0,
  };

  // Bullet flying left (vx = -800, vy = 0) into Delinquent's front
  const bullet = {
    id: 1,
    x: 510,
    y: 500,
    vx: -800,
    vy: 0,
    radius: 5,
    damage: 10,
    knockback: 100,
    color: '#38bdf8',
    trailColor: '#38bdf8',
    lifetime: 0.1,
    maxLifetime: 1.4,
  };

  const res = checkBulletDeflection(bullet, delinquent, 700, 500, ['delinquent_reinforced_shinai']);
  assert.equal(res.deflected, true, 'Delinquent should deflect frontal bullets');
  assert.equal(res.damageMultiplier, 0, 'Delinquent frontal block should negate incoming bullet damage');
  assert.equal(res.isDazeSpark, true, 'Reinforced shinai should flag daze spark');
  assert.ok(res.reflectedVx > 0, 'Reflected bullet should travel back toward the player on the right');

  // Forest should have 28 dense multi-layered trees
  const forestEnv = createMapEnvironment('forest');
  assert.ok(forestEnv.trees.length >= 28, 'Forest should contain at least 28 dense trees');

  // Verify modernized debuffs compute properly
  const stats = computeDebuffedPlayerStats(290, 10, 0.05, 0.2, [
    {
      id: 'yandere_empty_stun',
      name: 'Heartbreak Ammo Shock',
      archetype: 'yandere',
      description: 'Stunned on empty ammo',
      effectType: 'empty_stun',
      effectValue: 1,
    },
    {
      id: 'senpai_overtime_clock',
      name: 'Performance Memo Pin-Down',
      archetype: 'senpai',
      description: 'Periodic citation snare',
      effectType: 'memo_snare',
      effectValue: 1,
    },
  ]);
  assert.equal(stats.emptyStun, true);
  assert.equal(stats.memoSnare, true);
});

test('impervious state prevents stuns/pins and dazed state prevents firing', async () => {
  const { isPlayerImpervious, isPlayerDazed, updateEnemyAI } = await import('./logic.ts');

  const basePlayer = {
    x: 500,
    y: 500,
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

  assert.equal(isPlayerImpervious(basePlayer), false);
  assert.equal(isPlayerImpervious({ ...basePlayer, invincibleTimer: 1.0 }), true);
  assert.equal(isPlayerImpervious({ ...basePlayer, starlightInvulnTimer: 4.0 }), true);
  assert.equal(isPlayerImpervious(basePlayer, 2.5), true);

  assert.equal(isPlayerDazed(basePlayer), false);
  assert.equal(isPlayerDazed({ ...basePlayer, dazeTimer: 2.0 }), true);
  assert.equal(isPlayerDazed(basePlayer, 1.5), true);

  // Verify Trainer Maya's hound cannot stun or pin an impervious player
  const maya = {
    id: 50,
    archetype: 'trainer' as const,
    x: 460,
    y: 500,
    vx: 0,
    vy: 0,
    radius: 19,
    hp: 45,
    maxHp: 45,
    baseSpeed: 190,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0,
    houndX: 500,
    houndY: 500,
    isHoundLunging: true,
    isHoundPinning: true,
  };

  const res = updateEnemyAI(
    maya,
    500,
    500,
    [maya],
    [],
    undefined,
    0.05,
    2000,
    2000,
    1.0,
    [],
    undefined,
    'forest',
    undefined,
    undefined,
    true,
    0,
    undefined,
    true // isPlayerCurrentlyImpervious = true
  );
  assert.equal(res.houndFrontStun, undefined, 'Impervious player must not be front-stunned by hound');
  assert.equal(res.houndRearPin, undefined, 'Impervious player must not be rear-pinned by hound');
  assert.equal(maya.isHoundPinning, false, 'Maya pin state should clear immediately when player is impervious');
});

test('dog lunge extends leash by 50% taut without teleporting and Maya failsafe reaches blocked player', async () => {
  const { updateEnemyAI } = await import('./logic.ts');

  const maya = {
    id: 51,
    archetype: 'trainer' as const,
    x: 400,
    y: 400,
    vx: 0,
    vy: 0,
    radius: 19,
    hp: 45,
    maxHp: 45,
    baseSpeed: 190,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0.01, // ready to lunge
    houndX: 460,
    houndY: 400,
  };

  // Step 0.02s when player is at (550, 400): hound initiates lunge smoothly without instant teleport
  updateEnemyAI(maya, 550, 400, [maya], [], undefined, 0.02, 2000, 2000, 1.0);
  const distAfterStart = Math.hypot((maya.houndX ?? 0) - 460, (maya.houndY ?? 0) - 400);
  assert.ok(distAfterStart < 35, `Hound should not teleport forward on lunge start (moved ${distAfterStart.toFixed(1)}px)`);

  // Step multiple frames to reach max extension: leash must pull taut at 82 * 1.5 = 123px (+50% of normal limit)
  for (let i = 0; i < 20; i++) {
    updateEnemyAI(maya, 750, 400, [maya], [], undefined, 0.03, 2000, 2000, 1.0 + i * 0.03);
  }
  const leashExtension = Math.hypot((maya.houndX ?? 0) - maya.x, (maya.houndY ?? 0) - maya.y);
  assert.ok(leashExtension <= 123.5, `Leash extension (${leashExtension.toFixed(1)}px) must not exceed 150% taut limit (123px)`);
});

test('Victor enemies move slower and Shiny Officer is impervious while aiming and shooting', async () => {
  const { isVictorEnemy, isShinyOfficerImpervious, updateEnemyAI } = await import('./logic.ts');

  const shinyOfficer = {
    id: 60,
    archetype: 'officer' as const,
    x: 300,
    y: 300,
    vx: 0,
    vy: 0,
    radius: 19,
    hp: 100,
    maxHp: 100,
    baseSpeed: 185,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0,
    isShiny: true,
    isAiming: true,
    aimTimer: 0.4,
    shootRecoveryTimer: 0,
  };

  assert.equal(isShinyOfficerImpervious(shinyOfficer), true, 'Shiny Officer should be impervious while aiming');
  shinyOfficer.isAiming = false;
  shinyOfficer.shootRecoveryTimer = 0.5;
  assert.equal(isShinyOfficerImpervious(shinyOfficer), true, 'Shiny Officer should be impervious while shooting');
  shinyOfficer.shootRecoveryTimer = 0;
  assert.equal(isShinyOfficerImpervious(shinyOfficer), false, 'Shiny Officer should be vulnerable when not aiming or shooting');

  // Compare normal enemy speed vs Victor enemy speed (Victor is confident and 0.84x slower)
  const normalEnemy = {
    ...shinyOfficer,
    isShiny: false,
    x: 300,
    y: 300,
    isAlerted: true,
    shootCooldown: 10,
  };
  const victorEnemy = {
    ...normalEnemy,
    id: 61,
    x: 300,
    y: 300,
    isVictor: true,
  };
  assert.equal(isVictorEnemy(victorEnemy), true);

  updateEnemyAI(normalEnemy, 600, 300, [normalEnemy], [], undefined, 0.1, 2000, 2000, 1.0);
  updateEnemyAI(victorEnemy, 600, 300, [victorEnemy], [], undefined, 0.1, 2000, 2000, 1.0);
  assert.ok(
    Math.hypot(victorEnemy.vx, victorEnemy.vy) < Math.hypot(normalEnemy.vx, normalEnemy.vy),
    'Victor enemy should move slower than normal enemy'
  );
});

test('Heart Shop starts with Pistol and First-Aid only, tiered unlock costs (15-45), and Suburban Home two-way breaches', async () => {
  const {
    createInitialHeartShopState,
    rollUnlockedWeaponKey,
    rollSupportItemType,
    getWeaponUpgradeCost,
    getSupportUpgradeCost,
    getFullHealServiceCost,
    getPurgeDebuffServiceCost,
    getKillsForNextWantedLevel,
    createMapEnvironment,
    updateEnemyAI,
  } = await import('./logic.ts');

  const initShop = createInitialHeartShopState();
  assert.equal(rollUnlockedWeaponKey(initShop.weaponTiers), null, 'No special weapons should spawn before unlocking in shop');
  assert.equal(rollSupportItemType(initShop.supportTiers), 'heal', 'Only First-Aid Heal should spawn before unlocking support items in shop');

  // Verify tiered weapon & support unlock costs (15 to 45 Hearts)
  assert.equal(getWeaponUpgradeCost('dual', 0), 15);
  assert.equal(getWeaponUpgradeCost('smg', 0), 20);
  assert.equal(getWeaponUpgradeCost('shotgun', 0), 25);
  assert.equal(getWeaponUpgradeCost('laser', 0), 35);
  assert.equal(getWeaponUpgradeCost('launcher', 0), 45);

  assert.equal(getSupportUpgradeCost('ammo', 0), 15);
  assert.equal(getSupportUpgradeCost('level_mod', 0), 22);
  assert.equal(getSupportUpgradeCost('invuln', 0), 30);
  assert.equal(getSupportUpgradeCost('heart_up', 0), 40);

  // Escalating service costs
  assert.ok(getFullHealServiceCost(1) > getFullHealServiceCost(0));
  assert.ok(getPurgeDebuffServiceCost(1) > getPurgeDebuffServiceCost(0));
  assert.equal(getKillsForNextWantedLevel(1), 5);

  // Suburban Home two-way barricade breaking (both outside->inside and inside->outside)
  const homeEnv = createMapEnvironment('home');
  const frontDoor = homeEnv.breachPoints.find((bp) => bp.id === 'front-door')!;
  assert.ok(frontDoor, 'Suburban Home should have front-door breach point');
  const initialHp = frontDoor.barricadeHp!;

  // Enemy inside the house trying to reach player outside the front door should attack the barricade from inside!
  const indoorEnemy = {
    id: 70,
    archetype: 'yandere' as const,
    x: frontDoor.x + frontDoor.w / 2,
    y: frontDoor.y - 18, // inside the house just north of front door
    vx: 0,
    vy: 0,
    radius: 18,
    hp: 50,
    maxHp: 50,
    baseSpeed: 210,
    speedMultiplier: 1.0,
    angle: Math.PI / 2,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 5,
  };

  const aiRes = updateEnemyAI(
    indoorEnemy,
    frontDoor.x + frontDoor.w / 2,
    frontDoor.y + 180, // player outside in the Front Yard
    [indoorEnemy],
    homeEnv.walls,
    homeEnv.doorways,
    0.1,
    homeEnv.width,
    homeEnv.height,
    1.0,
    [],
    homeEnv.breachPoints,
    'home'
  );
  assert.ok(aiRes.attackingBreach, 'Indoor enemy should attack intact barricade when player is outside');
  assert.ok((frontDoor.barricadeHp ?? 0) < initialHp, 'Barricade HP should decrease when attacked from inside');
});


