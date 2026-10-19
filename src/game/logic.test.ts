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

test('sheriff kites away when player is too close and sounds alarm', () => {
  const sheriff: EnemyState = {
    id: 2,
    archetype: 'sheriff',
    x: 200,
    y: 200,
    vx: 0,
    vy: 0,
    radius: 19,
    hp: 45,
    maxHp: 45,
    baseSpeed: 95,
    speedMultiplier: 1.0,
    angle: 0,
    knockbackVx: 0,
    knockbackVy: 0,
    hitFlashTimer: 0,
    speechText: '',
    speechTimer: 0,
    specialTimer: 0, // ready to sound alarm
  };

  // Player is at (220, 200) -> distance only 20px! (well below 380px)
  const result = updateEnemyAI(sheriff, 220, 200, [sheriff], [], undefined, 0.1, 2000, 2000);
  assert.equal(sheriff.isKiting, true, 'Sheriff should kite away from player');
  assert.equal(result.requestsOfficerBackup, true, 'Sheriff should request officer backup on timer');
});

test('rollArchetypeDebuff picks distinct debuffs from archetype pool', () => {
  const d1 = rollArchetypeDebuff('sheriff', []);
  assert.ok(d1, 'Should roll a valid debuff for sheriff');
  assert.equal(d1?.archetype, 'sheriff');

  // Should not roll a duplicate if already active
  const existing: ActiveDebuff[] = [d1!];
  const d2 = rollArchetypeDebuff('sheriff', existing);
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
