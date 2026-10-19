# Implementation Plan: Archetype Refinements, Home Barricades, Golden Mini-Bosses & Complete Debuff/Upgrade Systems

The goal of this update is to solve Sheriff cone fairness and single-entity spawning, remove Officer cones, fix Suburban Home pathing with an interactive barricade system, transform Shinies into true aggressive golden mini-bosses, and ensure every single debuff and upgrade has functioning mechanics.

---

## 1. Sheriff Cone & Officer Detection Overhaul
- **Strict Single-Sheriff Rule**:
  - In `spawnEnemy()`, if `archetype === 'sheriff'`, verify if any active enemy already has `archetype === 'sheriff'`. If so, reroll or pick an alternate archetype so there is strictly never more than 1 active Sheriff on the field.
- **Fair Sheriff Searchlight Cone**:
  - Reduce visual and detection cone radius from 360–480px down to 175px (or 220px with the spotlight upgrade), with a tight 28° angle.
  - Fix detection calculation to perfectly match the visual cone (`dist <= coneReach && angleDiff <= coneSpread && !isLineBlockedByWalls`), ensuring zero phantom detection outside visible light.
- **Remove Officer Cone**:
  - Remove all cone rendering and forward-cone vision calculation for Officers.
  - Officers patrol naturally using local proximity / line-of-sight hearing (85px radius), alerting with siren when alerted.

---

## 2. Suburban Home Breach Pathing & Player Barricades
- **Smart Pathing to Breaches**:
  - When an enemy is outside the house footprint (`x < 80 || x > 1792 || y < 80 || y > 1342`) or obstructed by exterior perimeter walls, `computeSmartSteering()` routes them directly toward the closest accessible breach point (window or doorway).
- **Interactive Barricade System**:
  - Player can approach any breach point (doors or windows) and press `[E]` (or on-screen action button on mobile) to barricade it with sturdy wooden planks.
  - Barricades have health (e.g., 75 HP for windows, 120 HP for reinforced doors) and visually render cross-planks with health bars.
  - Enemies arriving at a barricaded breach stop and assault the barricade, triggering wood impact particles and crunch sounds until it splinters and shatters, granting enemies access into the house.

---

## 3. Shinies as Aggressive Golden Mini-Bosses
- **No More Arbitrary Instant Death**:
  - Shinies are no longer a cheap contact instant-game-over. Instead, they are rare, imposing golden mini-bosses.
- **Stats & Visual Presence**:
  - 3.5x HP with a gilded boss health bar, radiant golden trail, orbiting runic stars, and +25% base speed.
- **Archetype-Themed Golden Attacks**:
  - *Shiny Sheriff*: Discharges sweeping golden searchlight beams that summon temporary search hounds.
  - *Shiny Delinquent*: Ground-slam shockwave that knocks the player backward and deflects bullets with golden bat sparks.
  - *Shiny Officer*: Golden squad siren aura that temporarily deafens weapon sounds and speeds up nearby allies.
  - *Shiny Tomboy / Yandere / Gyaru / Goth / Senpai*: High-speed prismatic dashes and petal / espresso / shadow bursts.
- **Rewarding Triumph**:
  - Defeating a Shiny bursts into 12+ golden hearts (huge Adoration EXP) and guarantees a high-tier weapon drop.

---

## 4. Comprehensive Mechanical Audit of All 48 Debuffs & 24 Upgrades
- Ensure every single one of the 48 debuffs (6 per archetype) is fully implemented in logic, active stats, and visual/audio feedback:
  - *Sheriff*: Handcuffs (burst lock), Wanted Bounty (magnet pull), Leg Irons (drift momentum), Searchlight Glare (visual contrast overlay), Radio Jam (radar static), Curfew Citation (vignette).
  - *Officer*: Citation (pickup delay), Whistle Tinnitus (audio filter & recoil pull), Baton Bruise (reduced knockback dealt), Taser Twitch (periodic wild shot), Caution Tether (speed boost trail), Siren Frenzy (car acceleration).
  - *Delinquent*: Bat Rattle (viewport tremor), Intimidated Tremor (aim sway), Collar Snatch (inward pull), Territory Graffiti (bullet decay), Spiked Shrapnel (flying wooden splinters), Brawler Pressure (move shot penalty).
  - *Tomboy*: Twisted Ankle (turn stumble delay), Disarmed Grip (drops active weapon on hit), Competitive Sprint (speed matching within 220px), Winded (halved invulnerability duration), Sweat in Eyes (vignette), Full-Court Press (flanking coordination).
  - *Goth*: Shadow Hex (corner tentacles), Velvet Chains (stamina drag), Sorrow Aura (cadence reduction), Mirror Fracture (reversed cursor indicator), Twilight Chill (reloading freeze), Eclipse Veil (reduced radar distance).
  - *Gyaru*: Flash Glare (camera flash strobe), Hype Cheer (squad speed buffs), Perfume Daze (wandering aim sway), Platform Shock (ground ripples deflecting bullets), Trendy Tagging (delayed bonus tick), Self-Obsession (speech distraction).
  - *Senpai*: Hot Espresso (spilled coffee puddles), Performance Review (forced test timer), Corporate Gaze (aim spread bloom), Overtime Fatigue (slowed sprint), Paperwork Stack (pickup obstruction), Authority Demand (weapon cooldown penalty).
  - *Yandere*: Red String of Fate (footstep tracking speedup), Crimson Frenzy (low-HP rage acceleration), Obsessive Vortex (long-range phase leap), Stalker Cling (grabbing snare), Love Letter Trap (decoy pickup), Eternal Vow (damage transfer).
- Audit all 24 Enemy Upgrades in `ENEMY_UPGRADE_POOL` so each upgrade's `statModifierKey` actively influences enemy behaviors, speeds, shields, abilities, and mechanics during gameplay.

---

## 5. Verification Plan
- Run automated unit tests in `src/game/logic.test.ts` covering:
  - Sheriff cone reach limits & single-sheriff spawn gate.
  - Officer zero-cone detection.
  - Home breach point pathing and barricade health depletion.
  - Shiny mini-boss stats, HP scaling, and non-instant-kill damage.
  - Debuff calculation consistency across all 48 debuff keys.
- Run `lint_applet` and `compile_applet`.
- Verify full gameplay in dev server.
