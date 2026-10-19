/**
 * =============================================================================
 * GAME TEXT & DIALOGUE CONFIGURATION
 * =============================================================================
 * All visible text, strings, character archetype dialogue, monologues,
 * permanent debuffs, shiny encounters, weapon descriptions, and maps.
 * Fully customizable in this single file!
 * =============================================================================
 */

export const GAME_TEXT = {
  // --- Game Title & Header ---
  gameTitle: "FEMBOY SURVIVAL",
  gameSubtitle: "ARCHETYPE RUSH",
  tagline: "Outrun, dodge, and repel relentless pursuers across distinct stages with unique environmental hazards!",
  startPrompt: "Press [SPACE] or Click to Start",
  startButton: "START SURVIVAL",
  selectMapLabel: "SELECT STAGE ENVIRONMENT",
  openCompendiumButton: "DEBUFF MANUAL",

  // --- Environments / Maps ---
  maps: {
    forest: {
      name: "Enchanted Forest",
      tagline: "Dense Foliage, Ambient Fog & Ambush Clearings",
      description: "Thick bushes slow your sprint, while eerie drifting mist and leafy tree canopies partially obscure overhead vision.",
      hazardNote: "Bushes slow movement · Ambient fog · Ambush clearings",
    },
    home: {
      name: "Cozy Suburban Home",
      tagline: "Furnished Rooms, Doors & Window Breaches",
      description: "A fully furnished house with kitchen counters, sofa, bed, and bathtub. Chasers breach through windows and doors!",
      hazardNote: "Interior walls & furniture · Chasers breach through windows & doors",
    },
    city: {
      name: "Neon Metropolis",
      tagline: "Wide Avenues, Traffic & Deceptive Civilians",
      description: "Spacious multi-lane boulevards with moving traffic and erratic civilians who look like pursuers. Gunfire summons Police Officers!",
      hazardNote: "Watch for traffic · Civilians resemble pursuers · Panic calls Police",
    },
  },

  // --- Controls & Instruction Hints ---
  controls: {
    moveHint: "WASD / Arrow Keys",
    moveLabel: "Move & Evade",
    aimHint: "Mouse / Space",
    aimLabel: "Aim & Shoot",
    weaponHint: "Step on Pickups",
    weaponLabel: "Equip Weapons",
    pauseHint: "Press [P] or [ESC] to Pause",
    mobileTouchNote: "Drag to move · Tap/Hold to fire",
  },

  // --- In-Game HUD Elements ---
  hud: {
    timerLabel: "SURVIVED",
    personalBestLabel: "BEST RECORD",
    hpLabel: "STAMINA",
    weaponLabel: "WEAPON",
    ammoLabel: "ROUNDS",
    infiniteAmmo: "∞ INF",
    defeatedLabel: "REPELLED",
    difficultyWave: "PRESSURE",
    chaosAlert: "POLICE BACKUP DISPATCHED!",
    carHitWarning: "STRUCK BY TRAFFIC!",
    debuffsLabel: "ACTIVE PERMANENT DEBUFFS",
    hoverDebuffHint: "Hover debuffs for details",
    shinyAlert: "SHINY PURSUER DETECTED! INSTANT GAME OVER ON CONTACT!",
  },

  // --- Weapon Inventory & Pickups ---
  weapons: {
    pistol: {
      name: "Pea Blaster",
      shortName: "PISTOL",
      description: "Standard sidearm. Infinite ammo and steady cadence.",
      pickupNotification: "Equipped Pea Blaster!",
    },
    shotgun: {
      name: "Heartbreaker Scattergun",
      shortName: "SHOTGUN",
      description: "Fires 5 heart-shaped pellets with heavy knockback.",
      pickupNotification: "Acquired Heartbreaker Scattergun!",
    },
    smg: {
      name: "Bubble Sprayer",
      shortName: "BUBBLE SMG",
      description: "High-speed rapid stream of sparkling bubble projectiles.",
      pickupNotification: "Found Bubble Sprayer!",
    },
    laser: {
      name: "Neon Prism Beam",
      shortName: "LASER",
      description: "Piercing straight laser that cuts through lines of chasers.",
      pickupNotification: "Charged Neon Prism Beam!",
    },
    launcher: {
      name: "Confetti Cannon",
      shortName: "CANNON",
      description: "Fires festive explosive shells with large area knockback.",
      pickupNotification: "Armed Confetti Cannon!",
    },
    dual: {
      name: "Twin Pop-Guns",
      shortName: "DUAL BLOWERS",
      description: "Twin-barreled volley firing angled twin projectiles.",
      pickupNotification: "Armed Twin Pop-Guns!",
    },
  },

  // --- Archetype Personalities, Visual Labels, & Speech Callouts ---
  archetypes: {
    sheriff: {
      name: "Sheriff Abigail",
      title: "The Chief Law Enforcer",
      description: "Projects a visible searchlight vision cone! Kites away while sounding her whistle to summon Deputy Officers.",
      colorHex: "#ca8a04",
      callouts: [
        "This is the Sheriff! Keep your hands where I can see them!",
        "Deputies, converge on my position! Suspect in sight!",
        "Don't make this harder on yourself, handsome!",
        "Dispatch, sounding the county alarm!",
      ],
    },
    officer: {
      name: "Officer Viki",
      title: "The Patrol Deputy",
      description: "Responds to the Sheriff's call with blazing sprint speed and flashing pursuit sirens.",
      colorHex: "#3b82f6",
      callouts: [
        "Officer on scene! Stop right there, cutie!",
        "You have the right to remain adorable!",
        "Backing up the Sheriff!",
        "Pull over immediately!",
      ],
    },
    delinquent: {
      name: "Delinquent Ryuko",
      title: "The Sukeban Brawler",
      description: "Gorgeous rebellious brawler! Her heavy wooden bat visibly deflects frontal gunfire with clanking sparks.",
      colorHex: "#dc2626",
      callouts: [
        "Oi, pretty boy! Where do you think you're going?!",
        "You're coming with my gang!",
        "Don't make me use the bat, cutie!",
        "Heh, nice shot, but my bat's too tough for that!",
      ],
    },
    tomboy: {
      name: "Tomboy Roxie",
      title: "The Athletic Charger",
      description: "Kicks up dust and sprints in straight-line pursuit dashes.",
      colorHex: "#f97316",
      callouts: [
        "Think you can outrun me?!",
        "Tag! You're it!",
        "Catch you on the next corner!",
        "Nice dodge, handsome!",
      ],
    },
    goth: {
      name: "Goth Raven",
      title: "The Shadow Phaser",
      description: "Teleports through purple shadow mists to cut off exits.",
      colorHex: "#a855f7",
      callouts: [
        "Nowhere to hide in the shadows...",
        "I like when you try to escape.",
        "Cold hands, warm embrace...",
        "Come into the dark with me...",
      ],
    },
    gyaru: {
      name: "Gyaru Chloe",
      title: "The Swarm Flanker",
      description: "Flanks in groups and rallies others with speed cheers.",
      colorHex: "#ec4899",
      callouts: [
        "Omg wait up, you're literally so gorgeous!!",
        "Group selfie right now!!",
        "Don't run, let me dress you up!",
        "Caught you in 4K, cutie!",
      ],
    },
    senpai: {
      name: "Office Senpai",
      title: "The Calculated Siren",
      description: "High endurance chaser who drops coffee cup slowing zones.",
      colorHex: "#0ea5e9",
      callouts: [
        "Overtime with me is mandatory, sweetie.",
        "Your break time is officially over.",
        "Nowhere on the schedule to hide.",
        "Let's review your performance in private.",
      ],
    },
    yandere: {
      name: "Yandere Ayame",
      title: "The Relentless Stalker",
      description: "Accelerates relentlessly while maintaining direct line-of-sight.",
      colorHex: "#f43f5e",
      callouts: [
        "Only I get to look at you!",
        "Found you at last, my love~",
        "We're going to be together forever!",
        "You can never leave me!",
      ],
    },
  },

  // --- Shiny Archetype Encounter Text ---
  shiny: {
    badge: "★ SHINY ENCOUNTER ★",
    warning: "PRISMATIC ARCHETYPE! TOUCHING HER RESULTS IN AN INSTANT CAPTURE!",
    gameOverBanner: "SHINY CAPTURE!",
    monologue:
      "A radiant prismatic shimmer envelops your vision as the exceedingly rare Shiny Pursuer sweeps you off your feet! With gleaming iridescent hair and a sparkling golden halo, she laughs playfully: 'Did you really think a rare beauty like me would let you slip away? You're my one-in-a-million prize now, sweet boy!'",
  },

  // --- Lengthy Character-Specific Game Over Monologues ---
  gameOverMonologues: {
    sheriff: {
      speaker: "Sheriff Abigail",
      title: "The Chief Law Enforcer",
      monologue:
        "Hands right where I can see them, cutie. *click* Hear that? That's the sound of county-grade steel cuffs clicking around those delicate wrists. You gave my whole precinct quite the workout dodging through these streets, but nobody outruns the Sheriff forever. Take a deep breath, sweetheart—you've got a very long, very private interrogation waiting for you back at headquarters...",
    },
    officer: {
      speaker: "Officer Viki",
      title: "The Patrol Deputy",
      monologue:
        "Dispatch, cancel all units! Suspect is officially cornered and in custody! Whew... you know, you are somehow even cuter up close when you're completely out of breath. Don't worry, I won't cuff you too tightly—as long as you promise to sit nicely in the passenger seat of my cruiser. You're coming with me for direct booking, and I'm not letting you out of my sight!",
    },
    delinquent: {
      speaker: "Delinquent Ryuko",
      title: "The Sukeban Brawler",
      monologue:
        "Heh! Where do you think you're scurrying off to now, pretty boy? Running right into my bat like that... you've got some real guts for a soft little guy. Guess what? You're under my gang's official protection now, whether you like it or not. Sit tight and let me fix that hair of yours. I take real good care of the cuties that belong to me...",
    },
    tomboy: {
      speaker: "Tomboy Roxie",
      title: "The Athletic Charger",
      monologue:
        "Hah... whew! *pant* Gotcha! Did you really think you could outrun a track star forever, handsome? Look at you, completely out of breath and cornered against me! That was the most fun chase I've had all year, but you're officially tagged out now. No more running away—you owe me a whole afternoon together, and you're not getting away this time!",
    },
    goth: {
      speaker: "Goth Raven",
      title: "The Shadow Phaser",
      monologue:
        "At last... the noise of the chase fades into sweet, velvet silence. Did you truly believe you could escape the encroaching shadows? Your heartbeat is racing so fast against mine... so wonderfully warm in this cold dusk. Shh, don't tremble, my delicate captive. You belong to the quiet night with me now, far away from the rest of the world...",
    },
    gyaru: {
      speaker: "Gyaru Chloe",
      title: "The Swarm Flanker",
      monologue:
        "OMG YAAAAS!! I CAUGHT YOU!! Bestie, hold still and look at this lighting for our victory selfie! Say cheese! *flash* You are literally the most adorbs thing that has ever existed in this whole city. Look at this outfit—I am taking you straight to the boutique for a total high-glam makeover and sweet boba, no excuses allowed!",
    },
    senpai: {
      speaker: "Office Senpai",
      title: "The Calculated Siren",
      monologue:
        "Pencils down, sweetie. Your break time is officially terminated. Look at you, all flushed and disheveled from trying to run... Now that the office doors are locked, it's finally time we conducted your mandatory private performance review. Don't worry, I cleared my entire schedule for tonight just for you...",
    },
    yandere: {
      speaker: "Yandere Ayame",
      title: "The Relentless Stalker",
      monologue:
        "My love... my darling, beautiful boy... you're finally in my arms! Look how gorgeous you look with the sunset reflecting in your eyes. I told you, didn't I? No matter where you ran, no matter how many weapons you fired, our red strings of fate would always pull you back to me. Now we can be together forever... and ever... and ever... and you can never, ever leave me again~",
    },
  },

  // --- 6 Unique Themed Debuffs per Archetype with Mechanical Variety ---
  archetypeDebuffs: {
    sheriff: [
      {
        id: 'sheriff_cuffs',
        name: 'Handcuffed Left Wrist',
        description: 'Gun fires in locked double-burst pairs. Rapid single firing is disabled.',
        flavor: 'Heavy steel chain links restrict your wrist dexterity.',
        effectType: 'burst_lock',
        effectValue: 2,
      },
      {
        id: 'sheriff_bounty',
        name: 'Wanted Poster Bounty',
        description: 'A bounty mark hovers over you. Defeated pursuers drop gold sparks that pull nearby chasers toward you.',
        flavor: 'The county sheriff has posted your portrait on every bulletin board!',
        effectType: 'bounty_magnet',
        effectValue: 1.25,
      },
      {
        id: 'sheriff_legirons',
        name: 'Heavy Leg Irons',
        description: 'Instant turning is disabled. Sharp changes in direction cause a sliding drift.',
        flavor: 'Weighted cast-iron cuffs drag along the asphalt.',
        effectType: 'drift_momentum',
        effectValue: 0.82,
      },
      {
        id: 'sheriff_glare',
        name: 'Searchlight Glare',
        description: 'A bright rotating spotlight sweeps the screen, casting heavy dark contrast shadows.',
        flavor: 'High-intensity cruiser halogen beams follow your tracks.',
        effectType: 'searchlight_glare',
        effectValue: 1,
      },
      {
        id: 'sheriff_radio',
        name: 'Police Radio Jam',
        description: 'Radar minimap suffers static interference and periodically displays false ghost blips.',
        flavor: 'Emergency dispatch frequencies overpower your directional sensors.',
        effectType: 'radar_glitch',
        effectValue: 1,
      },
      {
        id: 'sheriff_curfew',
        name: 'Curfew Citation',
        description: 'Screen twilight darkness deepens and weapon muzzle flashes are intensely bright.',
        flavor: 'Town curfew is strictly enforced after sundown.',
        effectType: 'curfew_contrast',
        effectValue: 1,
      },
    ],
    officer: [
      {
        id: 'officer_citation',
        name: 'Speeding Citation',
        description: 'Weapon pickup pedestals require standing on them for 0.8s to inspect and unlock.',
        flavor: 'A deputy ticket is stapled to every supply crate in the precinct!',
        effectType: 'pickup_delay',
        effectValue: 0.8,
      },
      {
        id: 'officer_whistle',
        name: 'Piercing Whistle Tinnitus',
        description: 'Audio is muffled by a high-frequency whistle ring, and gunshot recoil pulls aim slightly backward.',
        flavor: 'Her emergency whistle shrills right beside your sensitive ears.',
        effectType: 'recoil_pull',
        effectValue: 1.2,
      },
      {
        id: 'officer_baton',
        name: 'Baton Bruise',
        description: 'Bullet impact knockback dealt to chasers is reduced by 30%.',
        flavor: 'A stinging impact leaves your upper body sore and bruised.',
        effectType: 'knockback_dealt',
        effectValue: 0.7,
      },
      {
        id: 'officer_twitch',
        name: 'Taser Muscle Twitch',
        description: 'Every 9 seconds, an involuntary motor twitch causes you to fire a wild stray projectile.',
        flavor: 'Residual static electricity crackles along your nerve endings.',
        effectType: 'periodic_twitch',
        effectValue: 9.0,
      },
      {
        id: 'officer_caution_tether',
        name: 'Caution Tape Tether',
        description: 'A trailing yellow caution ribbon drags behind you. Any chaser who steps on it gains an instant sprint dash.',
        flavor: 'Crush tape from the police perimeter tangles around your belt.',
        effectType: 'caution_tether',
        effectValue: 1,
      },
      {
        id: 'officer_siren_frenzy',
        name: 'Cruiser Siren Frenzy',
        description: 'Moving city cars honk and accelerate by 30% across road lanes.',
        flavor: 'All precinct cruisers have their sirens blaring at maximum volume!',
        effectType: 'car_speed',
        effectValue: 1.3,
      },
    ],
    delinquent: [
      {
        id: 'delinquent_rattle',
        name: 'Bat Rattle Concussion',
        description: 'Taking heavy impacts causes the viewport to jolt and blur dynamically.',
        flavor: 'A glancing swing from her wooden bat leaves your head spinning.',
        effectType: 'impact_blur',
        effectValue: 1,
      },
      {
        id: 'delinquent_shakes',
        name: 'Intimidated Tremor',
        description: 'Aim crosshairs sway continuously in a gentle figure-eight loop.',
        flavor: 'Her menacing delinquent glare has your hands visibly trembling.',
        effectType: 'crosshair_sway',
        effectValue: 1.4,
      },
      {
        id: 'delinquent_collar',
        name: 'Collar Snatch',
        description: 'Pursuer impacts yank you inward toward the attacker rather than knocking you back!',
        flavor: 'She grabs your hoodie collar with fierce brawler grip!',
        effectType: 'inverse_knockback',
        effectValue: -1,
      },
      {
        id: 'delinquent_graffiti',
        name: 'Territory Graffiti',
        description: 'Spray paint skid marks appear behind you, decaying weapon bullet flight range by 25%.',
        flavor: 'Her gang has claimed this entire block as their personal turf.',
        effectType: 'bullet_decay',
        effectValue: 0.75,
      },
      {
        id: 'delinquent_shrapnel',
        name: 'Spiked Bat Shrapnel',
        description: 'Repelling pursuers launches flying wooden splinters that bounce around the arena.',
        flavor: 'Splinters from broken wooden shinai litter the battlefield.',
        effectType: 'splinter_shrapnel',
        effectValue: 1,
      },
      {
        id: 'delinquent_brawler_stance',
        name: "Brawler's Pressure",
        description: 'Firing weapons while moving reduces bullet flight velocity by 40%. You must stand still for full speed.',
        flavor: 'She taunts you to stand and face her head-on!',
        effectType: 'move_shot_penalty',
        effectValue: 0.6,
      },
    ],
    tomboy: [
      {
        id: 'tomboy_sprain',
        name: 'Twisted Ankle',
        description: 'Rapidly switching movement directions causes an ankle click and a 0.2s stumble delay.',
        flavor: 'A hard cut on the pavement leaves your ankle aching.',
        effectType: 'turn_stumble',
        effectValue: 0.2,
      },
      {
        id: 'tomboy_disarm',
        name: 'Disarmed Grip',
        description: 'Taking a hit instantly knocks your weapon down to the default Pea Blaster and drops ammo.',
        flavor: 'A flying tackle knocks the gun right out of your hands!',
        effectType: 'disarm_on_hit',
        effectValue: 1,
      },
      {
        id: 'tomboy_pace',
        name: 'Competitive Sprint',
        description: 'Pursuers within 220px match your current sprint speed, making outrunning them impossible without turns.',
        flavor: 'She refuses to let anyone outpace her in a straight race!',
        effectType: 'match_speed',
        effectValue: 1,
      },
      {
        id: 'tomboy_winded',
        name: 'Wind Knocked Out',
        description: 'Post-hit invulnerability immunity frames are cut in half.',
        flavor: 'A hard shoulder check leaves your chest gasping for air.',
        effectType: 'invuln_halved',
        effectValue: 0.5,
      },
      {
        id: 'tomboy_sweat',
        name: 'Sweat in the Eyes',
        description: 'A peripheral moisture vignette blurs the outer edges of your vision.',
        flavor: 'Exhaustion and heat sting your eyes after endless sprinting.',
        effectType: 'vignette_blur',
        effectValue: 1,
      },
      {
        id: 'tomboy_press',
        name: 'Full-Court Press',
        description: 'Chasers never disperse when repelled; they maintain tight flanking positions.',
        flavor: 'Pure athletic varsity team pressure applied from every angle!',
        effectType: 'tight_flank',
        effectValue: 1,
      },
    ],
    goth: [
      {
        id: 'goth_hex',
        name: 'Shadow Hex',
        description: 'Dark creeping purple shadow tentacles reach inward from screen corners.',
        flavor: 'Occult shadows dance along the periphery of your awareness.',
        effectType: 'shadow_tentacles',
        effectValue: 1,
      },
      {
        id: 'goth_siphon',
        name: 'Soul Siphon Misses',
        description: 'Missing 8 consecutive gunshots drains a small sliver of stamina.',
        flavor: 'Wasted effort feeds the hungry spirits in the gloom.',
        effectType: 'miss_penalty',
        effectValue: 8,
      },
      {
        id: 'goth_phantom',
        name: 'Phantom Will-o-Wisp',
        description: 'Projectiles float slowly in curved floating arcs instead of straight lines.',
        flavor: 'Bullets feel ethereal and float like dancing ghost lights.',
        effectType: 'wisp_bullets',
        effectValue: 0.7,
      },
      {
        id: 'goth_eclipse',
        name: 'Eclipse Mists',
        description: 'The radar minimap is swallowed by an ominous swirling purple void.',
        flavor: 'No technology can pierce the veil of the lunar eclipse.',
        effectType: 'radar_void',
        effectValue: 1,
      },
      {
        id: 'goth_candlelight',
        name: 'Candlelight Radius',
        description: 'Only a 240px circular radius around you is illuminated. The rest of the world is pitch black.',
        flavor: 'You carry only a single dying candle into the dark.',
        effectType: 'candlelight_radius',
        effectValue: 240,
      },
      {
        id: 'goth_skulls',
        name: 'Grave Magnetism',
        description: 'Defeated chasers leave shadowy skulls that magnetically bend bullet trajectories downward.',
        flavor: 'Spectral gravestones pull all physical matter toward the earth.',
        effectType: 'bullet_gravity',
        effectValue: 1,
      },
    ],
    gyaru: [
      {
        id: 'gyaru_glitter',
        name: 'Glitter Blindness',
        description: 'Firing weapons produces bursts of dazzling pink glitter that briefly block your forward aim.',
        flavor: 'Super-sparkly cosmetic glitter coated all your gun barrels!',
        effectType: 'glitter_burst',
        effectValue: 1,
      },
      {
        id: 'gyaru_flash',
        name: 'Paparazzi Flash',
        description: 'Taking a hit triggers a dazzling white phone flash that whites out the center screen for 0.25s.',
        flavor: 'Camera shutters click relentlessly for her social feed!',
        effectType: 'flash_whiteout',
        effectValue: 0.25,
      },
      {
        id: 'gyaru_warmers',
        name: 'Leg Warmers Clutter',
        description: 'Walking over weapon pickups kicks them 90px away before picking them up.',
        flavor: 'Fluffy oversized knitted leg warmers keep kicking supplies away!',
        effectType: 'pickup_kick',
        effectValue: 90,
      },
      {
        id: 'gyaru_cheer_wave',
        name: 'Cheer Rally Wave',
        description: 'Nearby chasers emit synchronized cheer rings that buff allies with sudden sprint surges.',
        flavor: 'Her high-energy cheering rallies everyone into a party frenzy!',
        effectType: 'cheer_surge',
        effectValue: 1.3,
      },
      {
        id: 'gyaru_slip',
        name: 'High-Gloss Floor Wax',
        description: 'Floor friction is halved, giving your movement a slippery roller-skating inertia.',
        flavor: 'Freshly buffed glossy floors leave no traction for your sneakers!',
        effectType: 'floor_slip',
        effectValue: 0.5,
      },
      {
        id: 'gyaru_spin',
        name: 'Selfie Stick Spin',
        description: 'Taking knockback spins your character like a spinning top.',
        flavor: 'Her telescopic selfie stick sends you twirling across the room!',
        effectType: 'spin_knockback',
        effectValue: 1,
      },
    ],
    senpai: [
      {
        id: 'senpai_overtime',
        name: 'Mandatory Overtime Clock',
        description: 'Difficulty scaling timer advances 1.3x faster, accelerating pursuer pressure.',
        flavor: 'Overtime hours count double under her watchful supervision!',
        effectType: 'clock_accel',
        effectValue: 1.3,
      },
      {
        id: 'senpai_coffee',
        name: 'Scalding Coffee Puddles',
        description: 'Standing in coffee puddles for more than 1s inflicts a direct half-heart damage burn.',
        flavor: 'Freshly brewed espresso served at boiling temperatures!',
        effectType: 'coffee_burn',
        effectValue: 1,
      },
      {
        id: 'senpai_redtape',
        name: 'Bureaucracy Red Tape',
        description: 'Projectiles are stopped immediately by puddles, furniture, and rugs instead of flying over.',
        flavor: 'Endless paperwork regulations prohibit low-altitude projectile flight!',
        effectType: 'red_tape_bullets',
        effectValue: 1,
      },
      {
        id: 'senpai_cardinal',
        name: 'Strict Corporate Dress Code',
        description: 'Diagonal movement is prohibited. You can only move in 4 cardinal directions (Up, Down, Left, Right).',
        flavor: 'Strict corporate protocol forbids taking any diagonal shortcuts!',
        effectType: 'cardinal_only',
        effectValue: 1,
      },
      {
        id: 'senpai_heartbeat',
        name: 'Review Anxiety Heartbeat',
        description: 'Screen border pulses with heavy red bass vibrations whenever an enemy is within 180px.',
        flavor: 'The terrifying dread of an impending performance evaluation!',
        effectType: 'anxiety_pulse',
        effectValue: 180,
      },
      {
        id: 'senpai_audit',
        name: 'Quarterly Audit Delay',
        description: 'Weapon pickups occasionally transform into audit documents that take 1.5s to file before equipping.',
        flavor: 'Every new weapon acquisition requires two forms of manager sign-off!',
        effectType: 'audit_delay',
        effectValue: 1.5,
      },
    ],
    yandere: [
      {
        id: 'yandere_string',
        name: 'Obsessive Red String of Fate',
        description: 'A glowing crimson string visibly tethers your heart directly to the Yandere at all times.',
        flavor: 'An unbreakable metaphysical thread ties your destiny to hers.',
        effectType: 'red_tether',
        effectValue: 1,
      },
      {
        id: 'yandere_lovebite',
        name: 'Lovebite Vulnerability',
        description: 'Direct contact with the Yandere inflicts 2 full hearts of damage instead of 1.',
        flavor: 'Her embrace is dangerously, painfully intense!',
        effectType: 'double_damage',
        effectValue: 2,
      },
      {
        id: 'yandere_tunnel',
        name: 'Terrified Tunnel Vision',
        description: 'Only a forward 120° arc of view is visible. Anything behind you is shrouded in pure darkness.',
        flavor: 'The horrifying sensation of being stalked from behind freezes your neck.',
        effectType: 'tunnel_vision',
        effectValue: 120,
      },
      {
        id: 'yandere_frenzy',
        name: 'Devotion Frenzy',
        description: 'Whenever you shoot or repel another pursuer, Yandere screams and gains a 30% speed burst.',
        flavor: 'How dare you pay attention to anyone else but her?!',
        effectType: 'jealousy_frenzy',
        effectValue: 1.3,
      },
      {
        id: 'yandere_lock',
        name: 'Heartbreak Ammo Shock',
        description: 'When your equipped gun runs out of ammunition, you are stunned in place for 0.5s.',
        flavor: 'The click of an empty chamber feels like a stab through the heart.',
        effectType: 'empty_stun',
        effectValue: 0.5,
      },
      {
        id: 'yandere_ring_fire',
        name: 'Burning Perimeter of Devotion',
        description: 'The outer edges of the arena burn with crimson soul fire that damages anyone touching them.',
        flavor: 'She has sealed off the entire outside world so nobody can interfere!',
        effectType: 'perimeter_fire',
        effectValue: 1,
      },
    ],
  },

  // --- Game Over Screen ---
  gameOver: {
    banner: "CORNERED!",
    subtitle: "The sun sets over the horizon as you're finally caught...",
    caughtByPrefix: "Caught By",
    timeSurvivedLabel: "Time Survived",
    personalBestLabel: "Longest Record",
    chasersRepelledLabel: "Chasers Repelled",
    finalWeaponLabel: "Last Weapon Held",
    environmentLabel: "Location",
    restartButton: "PLAY AGAIN",
    changeMapButton: "CHANGE AREA",
    menuButton: "MAIN MENU",

    flyingWords: ["PLAP", "PLAP", "PLAP", "PLAP"],
    flyingHeartSymbols: ["♥", "♡", "💖", "💕", "✨"],
  },

  // --- Pause Menu ---
  pause: {
    title: "GAME PAUSED",
    resumeButton: "RESUME CHASE",
    restartButton: "RESTART RUN",
    changeAreaButton: "CHOOSE NEW AREA",
    openManualButton: "VIEW DEBUFF MANUAL",
    mainMenuButton: "EXIT TO TITLE",
  },
} as const;

export type ArchetypeKey = keyof typeof GAME_TEXT.archetypes;
export type WeaponKey = keyof typeof GAME_TEXT.weapons;
export type MapKey = keyof typeof GAME_TEXT.maps;
