# Lived-In World AI, Contextual Idle Dialogue & Autonomous NPC Femboys

Transform the arena into a living, breathing environment where pursuers logically patrol, stand around idling, and converse based on their archetype, who they are hanging out with, and which map they are on—until they catch wind of you or one of the rare NPC Femboy survivors (maximum 2 active) who roam, fight back, comment on events, bond with you through mutual rescues, and face the exact same capture and bed game-over stakes.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following design decisions incorporate your answers and clarify how enemy awareness, contextual idle life, and NPC Femboys work together seamlessly.

- **Contextual Enemy Awareness & De-Aggro**:
  - Pursuers spawn in an **Unaware (`patrol` / `idle` / `socializing`)** state rather than automatically homing in on you from across the map.
  - They catch wind of a target (either you or an NPC Femboy) via:
    1. **Close Proximity** (stepping within personal awareness radius or bumping near them).
    2. **Nearby Gunfire / Verbal Taunts (`[F]`)** (hearing weapon shots or bratty taunts within an audible radius).
    3. **Sight Cone in Vision-Hindered / Obstructed Areas** (e.g., Haunted Mansion darkness, Untamed Wilderness fog/trees, or behind walls/alleys—requiring line-of-sight within their facing cone rather than seeing through walls).
    4. **Other Femboy Interest / Alert Propagation** (spotting or hearing a commotion involving another femboy, or being tipped off by an alerted pursuer nearby).
  - **Out of Sight De-Aggro**: If an alerted pursuer loses line-of-sight and distance to their target for too long (e.g., ~7–9 seconds without visual or audio contact), they utter a frustrated "lost them" remark and transition back to logical patrolling and idling.
- **Contextual Off-Duty Actions & Dialogue Matrix**:
  - While unaware, pursuers alternate between **Logical Waypoint Strolling** (walking along paths, sidewalks, hallways, shorelines, or room-to-room) and **Idle / Social Pauses** (standing around doing archetype- and map-specific micro-actions like stretching, checking phones, sipping drinks, adjusting gear, or chatting with a nearby pursuer).
  - Extensive dialogue pools tailored to:
    1. **Solo Archetype + Map Context** (e.g., Officer Viki writing tickets in the City vs. complaining about sand in her boots at Sunset Beach; Goth Raven admiring the Haunted Mansion vs. hiding under shade at the Beach).
    2. **Paired / Group Social Banter** (when two pursuers idle near each other, they face one another and exchange archetype-specific banter—e.g., Delinquent Roxie teasing Senpai Elena, or Hacker Natsuki showing phone clips to Tomboy Sadie).
- **Rare Autonomous NPC Femboys (Max 2 Active)**:
  - Up to **2 NPC Femboys** (using distinct skins from the player's current skin, such as Astolfo, Venti, Felix, Bridget, or Nagisa) can rarely enter the stage.
  - **Autonomous Combat & Affinity**: They roam, evade hazards, pick up or fire weapons at alerted pursuers, and actively shoot captors to **rescue you** if you are grabbed or dragged. If you help/rescue them (or fight alongside them) often enough, their **Trust / Affinity** crosses a threshold and they choose to **follow and guard you** as a loyal partner.
  - **Identical Capture & Final Game Over Rules**: When caught by a pursuer, NPC Femboys experience the **exact same capture mechanics as the player**—on-the-spot struggles (which they can fight out of or be saved from if you shoot their captor), stamina loss, and when their stamina is depleted or caught by a Shiny/Victor, they are **dragged toward the bed**. If the captor reaches the bed without you rescuing them in time, a **Final Game Over** triggers for that NPC Femboy, permanently removing them from the match (and empowering the captor into a Victor!).
  - **Live Commentary**: NPC Femboys speak their mind with floating speech bubbles—commenting when spotting enemies, thanking you for rescues, cheering when you repel a pursuer, panicking when grabbed, or bantering while following you.

---

## 1. Overview & Core Concept

- **What It Does**: Replaces omniscient spawn-homing with a believable stealth-and-pursuit world simulation. Pursuers live out their daily routines across the five stages until alerted, while rare fellow Femboy survivors share the arena's dangers and fight beside you.
- **Target Audience / Persona**: Players looking for an expressive, emergent, character-driven survival sandbox rich in personality, banter, and high-stakes rescues.
- **Key Value**: Every run feels like stepping into an inhabited world with dynamic social interactions, tactical stealth opportunities, and emotional stakes when trying to protect (or be saved by) fellow femboys.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Observing the Living World**: As you move through the stage, you see unalerted pursuers strolling along logical routes or pausing to perform idle animations and chat with each other via soft ambient speech bubbles.
  2. **Triggering & Breaking Pursuit**: Firing a loud weapon, pressing `[F]` to taunt, or stepping into an enemy's sight cone / close proximity triggers an **`!`** alert icon and a situational spot quote as they launch into pursuit. Breaking line-of-sight around obstacles or fog for several seconds displays a **`?`** search state before they return to their off-duty routine.
  3. **Meeting & Bonding with NPC Femboys**: Occasionally, a fellow Femboy spawns into the world (up to 2 max). They greet you, comment on nearby women, fire at threats, and rush to shoot any woman grabbing you. Helping them out of grabs or fighting near them builds bond hearts, switching their behavior from independent roaming to companion follow mode.
  4. **High-Stakes NPC Captures & Bed Rescues**: If an NPC Femboy is pinned in a struggle or being dragged to the bed, an on-screen distress callout and directional indicator alert you so you can intercept the captor before they reach the bed and permanently eliminate that femboy from the run.
- **Visual Identity & Theme**:
  - *Awareness Cues*: Subtle visual posture differences between Unaware (relaxed walking bob, small ambient activity icon or chat bubble, optional faint vision cone hint in dark/foggy maps), Searching (`?` indicator), and Alerted (`!` pop and intense pursuit stance).
  - *Speech Bubble Hierarchy*: Unaware idle chatter uses a calmer translucent dark-slate bubble so it remains readable without cluttering active combat callouts; NPC Femboy commentary uses a distinct pastel-teal/pink survivor border.
  - *HUD Companion Status*: Compact, unobtrusive status badges in the top-left HUD showing active NPC Femboys (their name, heart stamina, current state: *Roaming*, *Following You*, *Struggling!*, or *Being Dragged!*).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Sight-Cone + Sound + De-Aggro State Machine**
  - *Chosen Approach*: Three-state awareness machine (`unaware` → `searching` → `alerted`) per enemy, capable of targeting either the player or the nearest noticed NPC Femboy.
  - *Why*: Makes obstacles, alleys, Mansion darkness, and Wilderness fog tactically meaningful while allowing pursuers to showcase their idle personalities when out of combat.
- **Decision 2: Contextual Dialogue Generator (Archetype × Activity × Map × Companion)**
  - *Chosen Approach*: A structured dialogue & idle-action engine with hundreds of handcrafted lines organized by archetype, current stage (`forest`, `home`, `city`, `mansion`, `beach`), solo idle activity, and pair-specific banter when two archetypes stand near each other.
  - *Why*: Ensures what enemies say and do always makes logical sense for who they are, where they are standing, and who is next to them.
- **Decision 3: Full Player-Parity Capture Loop for NPC Femboys**
  - *Chosen Approach*: Give each NPC Femboy their own HP/stamina hearts, weapon state, struggle progress, and bed-drag state rather than simple hit-point death.
  - *Why*: Directly fulfills the requirement that captures and final game overs function for them just like they do for you, creating dramatic rescue moments when a woman is dragging a fellow femboy toward the bed.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        LIVED-IN WORLD SIMULATION                         │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         ▼                           ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│  ENEMY OFF-DUTY &       │ │  CONTEXTUAL DIALOGUE &  │ │  AUTONOMOUS NPC FEMBOYS │
│  AWARENESS ENGINE       │ │  IDLE ACTION MATRIX     │ │  (MAX 2 ACTIVE)         │
├─────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
│ • States:               │ │ • Solo Map Lines:       │ │ • Distinct Anime Skins  │
│   - unaware (stroll /   │ │   9 Archetypes × 5 Maps │ │ • AI Modes:             │
│     idle / socialize)   │ │ • Idle Micro-Actions:   │ │   - Roam & Scavenge     │
│   - searching (?)       │ │   stretching, phone,    │ │   - Combat & Self-Def   │
│   - alerted (!)         │ │   sunbathing, patrolling│ │   - Rescue Player       │
│ • Triggers:             │ │ • Paired Banter:        │ │   - Follow Player (Bond)│
│   - Sight cone & LOS    │ │   Two nearby enemies    │ │ • Full Capture Parity:  │
│   - Close proximity     │ │   face each other &     │ │   - On-spot struggle    │
│   - Gunfire / Taunt [F] │ │   trade lines           │ │   - Bed drag on 0 HP /  │
│   - Femboy commotion    │ │ • Spot / Lost-Sight     │ │     Shiny / Victor      │
│ • De-Aggro Timer:       │ │   Transition Callouts   │ │   - Permanent Removal   │
│   - Lose LOS -> return  │ │                         │ │     on Bed Game Over    │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

### Data Model & State Extensions

1. **Enemy Awareness & Off-Duty Fields (`EnemyState`)**:
   - `awarenessState?: 'unaware' | 'searching' | 'alerted'`
   - `loseSightTimer?: number` (counts up when target is out of line-of-sight or far away; resets to `'unaware'` after threshold)
   - `targetEntity?: 'player' | 'npc_femboy'` and `targetNpcId?: number`
   - `idleBehavior?: 'strolling' | 'standing' | 'stretching' | 'checking_phone' | 'looking_around' | 'Fixing_hair' | 'socializing'`
   - `idleTimer?: number`, `patrolWaypoint?: Vector2`, `socialPartnerId?: number`
   - `alertIndicatorTimer?: number` (renders `!` or `?` pop above enemy)

2. **NPC Femboy Entity (`NpcFemboyState`)**:
   - `id: number`, `skinId: PlayerSkinId`, `name: string`, `outfitMode: OutfitMode`
   - `x: number`, `y: number`, `vx: number`, `vy: number`, `angle: number`, `radius: number`
   - `hp: number`, `maxHp: number`, `invincibleTimer: number`
   - `activeWeaponKey: string`, `ammo: number`, `fireCooldown: number`
   - `aiMode: 'roaming' | 'following_player' | 'rescuing_player' | 'combat' | 'captured_struggle' | 'captured_dragged'`
   - `affinityScore: number` (increases when player shoots enemies near/grabbing the NPC; at `>= 2`, NPC switches default mode to `'following_player'`)
   - `capturedByEnemyId?: number`, `struggleProgress?: number`, `struggleTimer?: number`
   - `speechText?: string`, `speechTimer?: number`, `commentCooldown?: number`

3. **Contextual Dialogue & Commentary Library**:
   - **Map-Specific Idle Lines**: Dedicated lines for every archetype across `forest`, `home`, `city`, `mansion`, and `beach` reflecting what they are doing there.
   - **Paired Social Exchanges**: Dynamic 2-part exchanges when two unaware enemies pause within social range of one another.
   - **Target Spotting & Losing Sight Lines**: Natural reactions when catching wind of you/an NPC femboy or losing track of you in an alley/fog.
   - **NPC Femboy Voice Lines**: Spawn greetings, ambient map observations, combat callouts, rescue thanks, player-rescue vows, following-mode banter, struggle cries, and bed-drag pleas.
