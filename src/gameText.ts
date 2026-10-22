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
      name: "Untamed Wilderness",
      tagline: "Winding Creek, Fallen Redwoods & Deep Woodland Fog",
      description: "An untamed primeval wilderness with a rushing mountain creek, fallen log bridges, jagged mossy granite crags, and thick fog of war.",
      hazardNote: "Creek fords & log bridges · Sight-limiting fog · Wild brambles",
    },
    home: {
      name: "Cozy Suburban Home",
      tagline: "Furnished Rooms, Sturdy Barricades & Sanctuary Buffs",
      description: "Hold [E] near doors and windows to reinforce sturdy wooden barricades for Hearts and maintain the Indoor Sanctuary Buff (+20% Fire Rate & Supply Drops)!",
      hazardNote: "Hold [E] to repair breaches · Sanctuary buff indoors · Exterior yards",
    },
    city: {
      name: "Neon Metropolis",
      tagline: "Wide Avenues, Traffic & Deceptive Civilians",
      description: "Spacious multi-lane boulevards with fast traffic that threatens you while pursuers smartly yield at crosswalks. Gunfire summons Police Officers!",
      hazardNote: "Traffic threatens you · Civilians resemble pursuers · Panic calls Police",
    },
    mansion: {
      name: "Haunted Mansion",
      tagline: "Pitch Darkness, Flashlight Cone & Glowing Eyes in Shadows",
      description: "A sprawling Gothic Victorian manor shrouded in pitch darkness. Sweep your mouse-aimed flashlight beam through velvet corridors while glowing anime eyes stalk you from the dark!",
      hazardNote: "Mouse-aimed flashlight cone · Glowing eyes in darkness · Gothic halls",
    },
    beach: {
      name: "Sunset Beach",
      tagline: "Swimsuit Pursuers, Surging Ocean Tide & Volleyballs",
      description: "A golden sunset coastline where all pursuers wear beach swimsuits! Navigate surging ocean tide waves, shallow tidal lagoons, and ricocheting beach volleyballs!",
      hazardNote: "Swimsuit outfits · Surging ocean tide waves · Bouncing volleyballs",
    },
  },

  // --- Selectable Outfit Modes (Standard, Challenge 1-Heart Swimsuit, Fun Comfy Mode) ---
  outfitModes: {
    standard: {
      id: "standard",
      name: "Standard Outfit",
      badge: "CLASSIC RUN",
      description: "Iconic signature outfit with 5 Hearts, 1 Extra Life, and normal Heart Shop prices.",
      accentColor: "#f472b6",
    },
    swimsuit: {
      id: "swimsuit",
      name: "Two Piece Swimsuit Outfit",
      badge: "CHALLENGE · 1 HEART",
      description: "Changes your look to a cute Two Piece Swimsuit and locks your Max Stamina to 1 Heart!",
      accentColor: "#f43f5e",
    },
    comfy: {
      id: "comfy",
      name: "Comfy Outfit",
      badge: "FUN · FREE SHOP & ∞ LIVES",
      description: "Changes your look to a cozy Comfy Sweater, makes the Heart Shop 100% FREE, and gives Infinite Lives (no true game over)!",
      accentColor: "#38bdf8",
    },
  },

  // --- Player Verbal Bratty Taunts [F Key] ---
  playerTaunts: [
    "Too slow~ Catch me if you can, ladies! ♪",
    "Is that really all you've got~? How cute! ♥",
    "Missed me again~ Try a little harder! ★",
    "Bet you can't even lay a finger on me~!",
    "Nyah-nyah~ Look who's eating my dust! ♪",
    "Aww, getting tired already? Keep chasing me~ ♥",
  ],

  // --- Selectable & Random Anime Femboy Skins ---
  playerSkins: {
    random: {
      name: "Random Skin",
      subtitle: "Surprise Anime Look",
      accentColor: "#f472b6",
    },
    astolfo: {
      name: "Paladin Astolfo",
      subtitle: "Pink Braid & Ribbon Knight",
      accentColor: "#f472b6",
    },
    venti: {
      name: "Sky-Bard Venti",
      subtitle: "Aqua Twin-Braids & Cecilia",
      accentColor: "#2dd4bf",
    },
    felix: {
      name: "Neko-Maid Felix",
      subtitle: "Cat Ears & Frilly Blue Maid",
      accentColor: "#38bdf8",
    },
    bridget: {
      name: "Pastel Bridget",
      subtitle: "Cropped Hoodie & Habit Bow",
      accentColor: "#60a5fa",
    },
    nagisa: {
      name: "Twintail Nagisa",
      subtitle: "Sapphire Pigtails & Vest",
      accentColor: "#818cf8",
    },
  },

  // --- Controls & Instruction Hints ---
  controls: {
    moveHint: "WASD / Arrow Keys",
    moveLabel: "Move & Evade",
    aimHint: "Mouse / Space",
    aimLabel: "Aim & Shoot",
    weaponHint: "Hold [E] / Pickups",
    weaponLabel: "Repair / Equip",
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
    shinyAlert: "★ SHINY PURSUER DETECTED! GOLDEN MINI-BOSS IN THE AREA! ★",
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
    officer: {
      name: "Officer Viki",
      title: "The Patrol Deputy",
      description: "Tall navy-uniformed policewoman with aviator shades and flashing sirens who fires electric stun darts.",
      colorHex: "#3b82f6",
      callouts: [
        "Officer on scene! Stop right there, cutie!",
        "You have the right to remain adorable!",
        "Taking aim with the stun dart—hold still!",
        "Pull over immediately!",
      ],
      hauntCallouts: [
        "Winning against you felt way too good, cutie—ready for round two?! ♥",
        "Your little dazed walk is adorable! Come back for another session~ ♥",
        "Your shots can't stop me now! Let's do that all over again~ ♥",
        "Protective custody with you was the best part of my shift! ♥",
      ],
      victoryQuote: "Gotcha! You're officially under protective custody, cutie~ ♥",
      dragQuote: "Taking you straight to my private quarters for questioning~ ♥",
      tauntReactions: [
        "Resisting arrest AND talking back?! That's double cuff time, brat!",
        "Oh, you think this is a game?! Wait till I tase those cute little legs!",
        "Dispatch, suspect is being a total brat—requesting immediate takedown!",
      ],
    },
    delinquent: {
      name: "Delinquent Ryuko",
      title: "The Sukeban Brawler",
      description: "Fierce sukeban gang boss in a long crimson skirt & open gakuran coat who deflects frontal shots outward with her bat.",
      colorHex: "#dc2626",
      callouts: [
        "Oi, pretty boy! Where do you think you're going?!",
        "You're coming with my gang!",
        "Don't make me use the bat, cutie!",
        "Heh, nice shot, watch the ricochet!",
      ],
      hauntCallouts: [
        "Heh, winning felt incredible, pretty boy! Let's go another round! ♥",
        "Still dizzy from our little session? Get back over here! ♥",
        "Bullets won't scratch me anymore—you're mine for round two! ♥",
        "You have no idea how good it felt claiming you, cutie~ ♥",
      ],
      victoryQuote: "Heh, finally ran out of breath, pretty boy?! You're mine now! ♥",
      dragQuote: "C'mon, quit squirming! You're the gang's new mascot tonight~ ♥",
      tauntReactions: [
        "Keep running that bratty mouth, pretty boy—my bat's itching to teach you manners!",
        "Hah?! You're practically begging to get pinned against the wall, aren't ya?!",
        "Ooh, I love a feisty brat! Don't cry when I finally corner you, cutie!",
      ],
    },
    tomboy: {
      name: "Tomboy Roxie",
      title: "The Athletic Charger",
      description: "Sun-kissed track sprinter in a cropped orange varsity jacket, sweatband & dolphin shorts who dashes at high speed.",
      colorHex: "#f97316",
      callouts: [
        "Think you can outrun me?!",
        "Tag! You're it!",
        "Catch you on the next corner!",
        "Nice dodge, handsome!",
      ],
      hauntCallouts: [
        "Winning that first round felt SO good! Ready for our rematch, cutie?! ♥",
        "Aww, look at you stumbling around dazed! Let's do it again! ♥",
        "I'm totally unstoppable now—time for overtime together! ♥",
        "Best victory ever! Come on, one more session with me! ♥",
      ],
      victoryQuote: "Tag, I win!! Nobody outruns the track captain, cutie! ♥",
      dragQuote: "Come on, time for our post-workout cooldown together~ ♥",
      tauntReactions: [
        "Ooh, talking trash?! Now I'm REALLY gonna tackle you flat, cutie!",
        "Haha! Keep teasing me like that and I won't let you walk tomorrow!",
        "Oh, it is ON now, little brat! Watch this sprint!",
      ],
    },
    goth: {
      name: "Goth Raven",
      title: "The Shadow Phaser",
      description: "Pale Gothic Lolita occultist in a frilled Victorian bell dress & lace headdress who phases through shadow mists.",
      colorHex: "#a855f7",
      callouts: [
        "Nowhere to hide in the shadows...",
        "I like when you try to escape.",
        "Cold hands, warm embrace...",
        "Come into the dark with me...",
      ],
      hauntCallouts: [
        "Our first ritual felt divinely sweet... let us repeat it forever~ ♥",
        "Wander all you like in a daze, my familiar... I am immortal now. ♥",
        "Winning your heart once only deepened my hunger for round two... ♥",
        "Your weapons pass right through me... return to my embrace~ ♥",
      ],
      victoryQuote: "The shadows have claimed you at last, my sweet familiar... ♥",
      dragQuote: "Step onto the velvet altar... our midnight ritual begins~ ♥",
      tauntReactions: [
        "Such a deliciously bratty little sacrifice... your gasps will sound even sweeter~",
        "Tease the shadows all you like, darling... my hexes already have your scent.",
        "Hehe... keep mocking me, sweet familiar. The altar awaits your defiance~",
      ],
    },
    hacker: {
      name: "Hacker Natsuki",
      title: "The NEET Saboteur",
      description: "Sleepy-smug NEET gamer & hacker in an oversized RGB hoodie and cat-ear headset who pauses at weapon caches to rig them with explosive malware.",
      colorHex: "#10b981",
      callouts: [
        "Hold up, let me just patch your weapon real quick~",
        "Touch grass? Why, when I can hack your loadout right here!",
        "Hehe, 200 IQ trap deployed! Go ahead, pull the trigger~",
        "GG EZ, cutie! Coming back to my gaming den!",
      ],
      hauntCallouts: [
        "Winning that co-op session with you felt god-tier—ready for NG+?! ♥",
        "Look at you lagging around all dazed! Come back for round two~ ♥",
        "I enabled god-mode immunity, cutie! You can't stop our rematch~ ♥",
        "10/10 session, would speedrun catching you again right now! ♥",
      ],
      victoryQuote: "GG no re, cutie!! You're officially my player two for tonight~ ♥",
      dragQuote: "Come on, dragging you straight to my RGB blanket fort for co-op~ ♥",
      tauntReactions: [
        "LMAO look at this brat taunting me! Clipping this for when I corner you~",
        "Keep yapping, cutie—I just overclocked my tracker on your exact coordinates!",
        "Ooh, toxic emote spam?! You're getting 100% spawn-camped tonight, brat!",
      ],
    },
    senpai: {
      name: "Office Senpai",
      title: "The Calculated Siren",
      description: "Sultry silver-haired office executive in red glasses, pencil skirt & necktie who drops scalding espresso hazards.",
      colorHex: "#0ea5e9",
      callouts: [
        "Overtime with me is mandatory, sweetie.",
        "Your break time is officially over.",
        "Nowhere on the schedule to hide.",
        "Let's review your performance in private.",
      ],
      hauntCallouts: [
        "Winning our first session felt wonderfully satisfying... ready for a follow-up? ♥",
        "Still dazed from your private review, sweetie? We're just getting started~ ♥",
        "Your little toys can't touch executive immunity. Come back here~ ♥",
        "That session exceeded all expectations. I'm scheduling round two right now! ♥",
      ],
      victoryQuote: "Performance review complete. You're working private overtime with me~ ♥",
      dragQuote: "Follow me to the executive suite, junior... no clocking out tonight~ ♥",
      tauntReactions: [
        "My, what an insolent junior... looks like your private overtime just tripled.",
        "*Adjusts glasses* Keep teasing me, darling. You won't be sitting down tomorrow~",
        "Insubordination noted on your file, cutie. Prepare for a very thorough correction.",
      ],
    },
    yandere: {
      name: "Yandere Ayame",
      title: "The Devoted Stalker",
      description: "Obsessive schoolgirl in a classic navy sailor fuku with pink twin-tails, heart pupils & kitchen knife who tethers you.",
      colorHex: "#f43f5e",
      callouts: [
        "Only I get to look at you!",
        "Found you at last, my love~",
        "We're going to be together forever!",
        "You can never leave me!",
      ],
      hauntCallouts: [
        "Ahaha~! Winning you felt like heaven! Let's do it again and again~! ♥",
        "Look at you wandering out so dazed and cute... come back to me, darling! ♥",
        "Nothing can hurt me now! Our love makes me completely invincible~! ♥",
        "One session wasn't nearly enough, my love... round two starts now~! ♥",
      ],
      victoryQuote: "Ahaha~! Caught you, my darling! Now we'll NEVER be apart~ ♥",
      dragQuote: "Just you and me forever and ever... come to bed, my love~ ♥",
      tauntReactions: [
        "Ahaha♥ Look how cute you are when you tease me!! I'm locking you up forever~!",
        "Teasing me means you're flirting with me, right?! Wait right there, darling~ ♥",
        "Keep calling my name like that, my love! My heart is beating SO fast~! ♥",
      ],
    },
    trainer: {
      name: "Trainer Maya",
      title: "The K-9 Agility Handler",
      description: "Sporty canine handler in an amber agility vest & visor accompanied by her large athletic hound Rex who stuns from the front and pins from behind.",
      colorHex: "#f59e0b",
      callouts: [
        "Sic 'em, Rex! Fetch that cutie right now!",
        "Good boy! Pin him down from behind and hold him there!",
        "Heel, sweetie! We've got private training to do~",
        "Rex picked up your scent from a mile away!",
      ],
      hauntCallouts: [
        "Winning that first round felt SO good, cutie! Rex and I want an encore~ ♥",
        "Aww, look at you wandering out all dazed! Good boy, let's go again! ♥",
        "Your shots can't stop us now—time for round two of obedience training~ ♥",
        "Best session ever! Come back here and sit stay for me, sweetie! ♥",
      ],
      victoryQuote: "Good boy, Rex!! We cornered the cutest prize on the whole course~ ♥",
      dragQuote: "Come along on the lead, sweetie... time for our private reward session~ ♥",
      tauntReactions: [
        "Hear that, Rex?! Our cute little puppy is barking for attention—pin him down!",
        "Ooh, feisty! Bratty boys who tease their handler get the tightest collar~!",
        "Keep wagging that tongue, cutie! Rex loves a lively chase before obedience training!",
      ],
    },
  },

  // --- Shiny Archetype Encounter Text ---
  shiny: {
    badge: "★ SHINY MINI-BOSS ★",
    warning: "PRISMATIC GOLDEN ELITE! Signature daze tactics and on-the-spot heart capture! Defeat for massive treasure!",
    gameOverBanner: "ELITE CAPTURE!",
    monologue:
      "A radiant golden shimmer envelops your vision as the exceedingly rare Shiny Pursuer holds you close! With gleaming iridescent hair and a sparkling golden aura, she laughs playfully: 'Did you really think a rare beauty like me would let you slip away? You put up such a wonderful, thrilling fight, sweet boy!'",
  },

  // --- Lengthy Character-Specific Game Over Monologues ---
  gameOverMonologues: {
    sheriff: {
      speaker: "Officer Viki",
      title: "The Patrol Deputy",
      monologue:
        "Dispatch, cancel all units! Suspect is officially cornered and in custody! Whew... you know, you are somehow even cuter up close when you're completely out of breath. Don't worry, I won't cuff you too tightly—as long as you promise to sit nicely in the passenger seat of my cruiser. You're coming with me for direct booking, and I'm not letting you out of my sight!",
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
    hacker: {
      speaker: "Hacker Natsuki",
      title: "The NEET Saboteur",
      monologue:
        "Heh... GG EZ, cutie! Did you really think you could out-micro a top-ranked NEET with root access to every supply crate on the map? Look at you, all dazed from my custom weapon firmware! Don't worry, my room has dual monitors, blackout curtains, and a giant beanbag chair just for the two of us. You're logging into an all-night co-op marathon with me, and the disconnect button is disabled~",
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
    trainer: {
      speaker: "Trainer Maya",
      title: "The K-9 Agility Handler",
      monologue:
        "Who's a good boy? Rex tracked your scent across every single corner of the stage, pinned you right down, and now you're finally tangled in my lead! Look at you, all breathless and flustered while Rex wags his tail beside us. You gave us such an exciting agility run, cutie, so I think you've earned some very special one-on-one handler attention tonight. Stay right here with me~",
    },
  },

  // --- 6 Unique Themed Debuffs per Active Archetype with Mechanical Variety ---
  archetypeDebuffs: {
    officer: [
      {
        id: 'officer_cuffs',
        name: 'Handcuffed Left Wrist',
        description: 'Gun fires in locked double-burst pairs and recoils slightly backward on each shot.',
        flavor: 'Precinct-grade steel cuffs click around your wrist!',
        effectType: 'burst_lock',
        effectValue: 2,
      },
      {
        id: 'officer_glare',
        name: 'Cruiser Spotlight Glare',
        description: 'A rotating high-beam cruiser searchlight sweeps the screen, casting dark contrast shadows.',
        flavor: 'Viki’s patrol cruiser tracks your every move with high-intensity halogen beams.',
        effectType: 'searchlight_glare',
        effectValue: 1,
      },
      {
        id: 'officer_radio',
        name: 'Police Radio Jam',
        description: 'Radar minimap suffers dispatch static interference and displays false ghost blips.',
        flavor: 'Emergency precinct frequencies overpower your directional radar.',
        effectType: 'radar_glitch',
        effectValue: 1,
      },
      {
        id: 'officer_citation',
        name: 'Speeding Citation',
        description: 'Picking up a new weapon crate imposes a 0.45s safety-inspection chamber delay before firing its first shot.',
        flavor: 'A deputy safety tag is stapled to every supply crate in the area!',
        effectType: 'pickup_delay',
        effectValue: 0.45,
      },
      {
        id: 'officer_twitch',
        name: 'Taser Muscle Twitch',
        description: 'Every 8 seconds, residual stun current triggers an involuntary stray gunshot.',
        flavor: 'Static electricity from her taser darts crackles along your nerves.',
        effectType: 'periodic_twitch',
        effectValue: 8.0,
      },
      {
        id: 'officer_caution_tether',
        name: 'Caution Tape Tether',
        description: 'A trailing yellow caution ribbon drags behind you. Any chaser who steps on it gains a +35% sprint boost.',
        flavor: 'Police perimeter tape tangles around your waist as you run.',
        effectType: 'caution_tether',
        effectValue: 1,
      },
    ],
    delinquent: [
      {
        id: 'delinquent_rattle',
        name: 'Bat Rattle Concussion',
        description: 'Taking impacts causes the viewport to jolt, shake, and blur with crimson shock.',
        flavor: 'A glancing swing from her wooden bat leaves your head spinning.',
        effectType: 'impact_blur',
        effectValue: 1,
      },
      {
        id: 'delinquent_shakes',
        name: 'Intimidated Tremor',
        description: 'Aim crosshairs sway continuously in a nervous figure-eight wave.',
        flavor: 'Her menacing sukeban glare has your hands visibly trembling.',
        effectType: 'crosshair_sway',
        effectValue: 1.4,
      },
      {
        id: 'delinquent_collar',
        name: 'Collar Snatch',
        description: 'Pursuer impacts yank you inward toward the attacker rather than knocking you back!',
        flavor: 'She grabs your hoodie collar with a fierce brawler grip!',
        effectType: 'inverse_knockback',
        effectValue: -1,
      },
      {
        id: 'delinquent_graffiti',
        name: 'Territory Graffiti',
        description: 'Spray paint fumes reduce weapon projectile flight range by 30%.',
        flavor: 'Her gang has claimed this entire turf as their personal territory.',
        effectType: 'bullet_decay',
        effectValue: 0.7,
      },
      {
        id: 'delinquent_shrapnel',
        name: 'Spiked Bat Shrapnel',
        description: 'Repelling pursuers launches flying wooden splinters that ricochet across the arena.',
        flavor: 'Splinters from broken wooden bats scatter violently on defeat.',
        effectType: 'splinter_shrapnel',
        effectValue: 1,
      },
      {
        id: 'delinquent_brawler_stance',
        name: "Brawler's Pressure",
        description: 'Firing weapons while moving reduces bullet flight velocity by 40%. Stand still for full velocity.',
        flavor: 'She taunts you to plant your feet and face her head-on!',
        effectType: 'move_shot_penalty',
        effectValue: 0.6,
      },
    ],
    tomboy: [
      {
        id: 'tomboy_sprain',
        name: 'Twisted Ankle',
        description: 'Rapidly reversing movement direction causes an ankle click and a 0.25s stumble slowdown.',
        flavor: 'A hard cut on the turf leaves your ankle aching.',
        effectType: 'turn_stumble',
        effectValue: 0.25,
      },
      {
        id: 'tomboy_disarm',
        name: 'Disarmed Grip',
        description: 'Taking a hit instantly knocks your weapon down to the default Pea Blaster.',
        flavor: 'A flying athletic tackle knocks the gun right out of your hands!',
        effectType: 'disarm_on_hit',
        effectValue: 1,
      },
      {
        id: 'tomboy_pace',
        name: 'Competitive Sprint',
        description: 'Pursuers within 220px match your current movement speed in straightaways.',
        flavor: 'She refuses to let anyone outpace her in a footrace!',
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
        description: 'A glistening peripheral moisture vignette blurs and tints the outer edges of your vision.',
        flavor: 'Exhaustion and heat sting your eyes after non-stop sprinting.',
        effectType: 'vignette_blur',
        effectValue: 1,
      },
      {
        id: 'tomboy_press',
        name: 'Full-Court Press',
        description: 'Bullet knockback dealt to pursuers is halved so they maintain tight flanking pressure.',
        flavor: 'Pure varsity full-court pressure applied from every angle!',
        effectType: 'tight_flank',
        effectValue: 0.5,
      },
    ],
    goth: [
      {
        id: 'goth_hex',
        name: 'Shadow Hex',
        description: 'Dark creeping violet shadow tentacles reach inward from the corners of your screen.',
        flavor: 'Occult shadows dance along the periphery of your awareness.',
        effectType: 'shadow_tentacles',
        effectValue: 1,
      },
      {
        id: 'goth_siphon',
        name: 'Soul Siphon Misses',
        description: 'Missing 8 consecutive gunshots triggers a dark soul-drain chill that slows you for 2s.',
        flavor: 'Wasted shots feed the hungry spirits lurking in the gloom.',
        effectType: 'miss_penalty',
        effectValue: 8,
      },
      {
        id: 'goth_phantom',
        name: 'Phantom Will-o-Wisp',
        description: 'Projectiles drift in eerie sinusoidal wave arcs instead of straight lines.',
        flavor: 'Bullets turn spectral and weave like dancing ghost lights.',
        effectType: 'wisp_bullets',
        effectValue: 0.75,
      },
      {
        id: 'goth_eclipse',
        name: 'Eclipse Mists',
        description: 'The radar minimap is swallowed by an ominous swirling purple occult void.',
        flavor: 'No sensor can pierce the veil of her lunar eclipse.',
        effectType: 'radar_void',
        effectValue: 1,
      },
      {
        id: 'goth_candlelight',
        name: 'Candlelight Radius',
        description: 'Only a 240px circular radius around you is illuminated. Beyond it lies deep darkness.',
        flavor: 'You carry only a single flickering candle into the abyss.',
        effectType: 'candlelight_radius',
        effectValue: 240,
      },
      {
        id: 'goth_skulls',
        name: 'Grave Magnetism',
        description: 'Defeated chasers leave spectral skulls on the ground that magnetically curve your bullets.',
        flavor: 'Phantom gravestones pull passing projectiles toward the earth.',
        effectType: 'bullet_gravity',
        effectValue: 1,
      },
    ],
    hacker: [
      {
        id: 'hacker_popups',
        name: 'Adware Pop-Up Flood',
        description: 'Firing weapons spawns floating pixel terminal glyphs across your screen.',
        flavor: 'Natsuki injected cute retro pop-up widgets directly into your HUD!',
        effectType: 'glitter_burst',
        effectValue: 1,
      },
      {
        id: 'hacker_macro',
        name: 'Macro Key Throttle',
        description: 'Weapon fire rate is reduced by 12% due to background macro scripts.',
        flavor: 'Natsuki bound a background throttling script to your trigger finger!',
        effectType: 'fire_rate',
        effectValue: 0.88,
      },
      {
        id: 'hacker_desync',
        name: 'Packet-Loss Crate Teleport',
        description: 'Walking onto a weapon pickup lags and rubberbands it 90px away once before you can grab it.',
        flavor: '999ms ping spike! The item crate rubberbanded across the floor!',
        effectType: 'pickup_kick',
        effectValue: 90,
      },
      {
        id: 'hacker_overclock',
        name: 'Discord Raid Ping',
        description: 'Nearby chasers receive overclocked speed pings that grant allies a +30% sprint surge.',
        flavor: 'She @everyone pinged the entire server with your live coordinates!',
        effectType: 'cheer_surge',
        effectValue: 1.3,
      },
      {
        id: 'hacker_ice_physics',
        name: 'Low-Friction Physics Mod',
        description: 'Floor traction is hacked to 50%, giving your movement a slippery speedrunner drift.',
        flavor: 'She edited your character controller’s ground_friction variable to 0.04!',
        effectType: 'floor_slip',
        effectValue: 0.5,
      },
      {
        id: 'hacker_dpi',
        name: '16,000 DPI Mouse Spinout',
        description: 'Taking knockback scrambles your aim angle for 0.45s like a maxed-out gaming mouse sensor.',
        flavor: 'She remotely cranked your mouse sensitivity to maximum DPI!',
        effectType: 'spin_knockback',
        effectValue: 1,
      },
    ],
    senpai: [
      {
        id: 'senpai_memo_snare',
        name: 'Performance Memo Pin-Down',
        description: 'Stepping in coffee or taking a hit pins a red-ink memo that slows firing cadence by 30% for 4s.',
        flavor: 'An urgent performance notice stapled directly to your sleeve!',
        effectType: 'memo_snare',
        effectValue: 0.7,
      },
      {
        id: 'senpai_coffee',
        name: 'Scalding Coffee Puddles',
        description: 'Standing in hot coffee puddles for more than 0.9s inflicts a direct 1 HP scalding burn.',
        flavor: 'Freshly brewed dark roast served at boiling temperatures!',
        effectType: 'coffee_burn',
        effectValue: 1,
      },
      {
        id: 'senpai_redtape',
        name: 'Bureaucracy Red Tape',
        description: 'Your projectiles are stopped upon touching coffee puddles or bushes instead of flying over.',
        flavor: 'Strict office regulations prohibit low-altitude projectile flight!',
        effectType: 'red_tape_bullets',
        effectValue: 1,
      },
      {
        id: 'senpai_cardinal',
        name: 'Strict Corporate Dress Code',
        description: 'Diagonal movement is prohibited. You can only move in 4 cardinal directions (Up, Down, Left, Right).',
        flavor: 'Corporate protocol strictly forbids taking diagonal shortcuts!',
        effectType: 'cardinal_only',
        effectValue: 1,
      },
      {
        id: 'senpai_heartbeat',
        name: 'Review Anxiety Heartbeat',
        description: 'Screen border pulses with heavy crimson heartbeat vibrations whenever a pursuer is within 200px.',
        flavor: 'The thumping dread of an impending one-on-one evaluation!',
        effectType: 'anxiety_pulse',
        effectValue: 200,
      },
      {
        id: 'senpai_audit',
        name: 'Quarterly Audit Delay',
        description: 'Weapon pickups require 1.4s of standing inspection for manager sign-off before equipping.',
        flavor: 'Every new equipment requisition requires two forms of signature!',
        effectType: 'audit_delay',
        effectValue: 1.4,
      },
    ],
    yandere: [
      {
        id: 'yandere_string',
        name: 'Obsessive Red String of Fate',
        description: 'A glowing crimson string tethers your heart to Ayame when she is within 260px, gently tugging you toward her until you break distance.',
        flavor: 'An intimate crimson thread tugs your heart whenever she gets close.',
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
        id: 'yandere_love_notes',
        name: 'Love-Letter Confetti Flurry',
        description: 'Fluttering pink love letters drift across your view and slow weapon fire recovery by 15% when Ayame is nearby.',
        flavor: 'Hundreds of hand-written confessions rain down around you!',
        effectType: 'love_letter_flurry',
        effectValue: 0.85,
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
    trainer: [
      {
        id: 'trainer_scent',
        name: 'Hound Scent Trail',
        description: 'Leaves a glowing amber scent trail behind you that boosts nearby pursuers’ tracking speed by +18%.',
        flavor: 'Rex’s keen nose locks onto the sweet scent of your panic!',
        effectType: 'scent_trail',
        effectValue: 1.18,
      },
      {
        id: 'trainer_leash',
        name: 'Nylon Leash Snag',
        description: 'When Trainer Maya is within 230px, her glowing agility lead gently tugs your movement speed down by 16%.',
        flavor: 'Her braided training lead clips right onto your collar!',
        effectType: 'leash_tug',
        effectValue: 0.84,
      },
      {
        id: 'trainer_fetch',
        name: 'Playful Fetch Instinct',
        description: 'Weapon crates slowly drift 35px toward the nearest pursuer whenever you approach them.',
        flavor: 'Rex treats every supply drop like his favorite chew toy!',
        effectType: 'fetch_drift',
        effectValue: 35,
      },
      {
        id: 'trainer_hurdles',
        name: 'Agility Course Hurdles',
        description: 'Moving diagonally trims your stride speed by 14% as if stepping over K-9 training bars.',
        flavor: 'Maya set up regulation agility hurdles across your escape route!',
        effectType: 'agility_hurdles',
        effectValue: 0.86,
      },
      {
        id: 'trainer_whistle',
        name: 'Handler Command Pulse',
        description: 'Every 8 seconds, Maya’s command chime briefly widens your weapon spread by 30% for 1.5s.',
        flavor: 'Her crisp training cue makes you flinch on command!',
        effectType: 'whistle_spread',
        effectValue: 1.3,
      },
      {
        id: 'trainer_paws',
        name: 'Bounding Paw Tackles',
        description: 'Taking a hit from any pursuer knocks your aim 35° off-center from a playful K-9 pounce.',
        flavor: 'Enthusiastic paws plant right on your shoulders!',
        effectType: 'paw_nudge',
        effectValue: 0.6,
      },
    ],
  },

  // --- World Simulation: Off-Duty Idle Actions, Map-Contextual Monologues, Paired Banter & Awareness Callouts ---
  worldIdleDialogue: {
    soloByMap: {
      officer: {
        forest: [
          "[Checking compass] Dispatch sent me all the way into the woods... my boots are covered in mud.",
          "[Scanning trail] Keep an eye out for stray hikers—or a cute runaway.",
          "[Adjusting utility belt] At least the pine air beats downtown exhaust fumes.",
          "[Sipping thermos coffee] Quiet shift in the timberland... almost too quiet.",
        ],
        home: [
          "[Inspecting porch] Neighbor called in a noise complaint, might as well do a perimeter walk.",
          "[Flipping notepad] Cozy little neighborhood... wonder if anyone's hiding inside.",
          "[Adjusting sunglasses] Doors are boarded up? Now that's definitely probable cause~",
          "[Checking radio] Unit 4 reporting in, patrolling the yard perimeter.",
        ],
        city: [
          "[Writing parking ticket] Another sports car parked in a red zone... easy quota today.",
          "[Sipping iced coffee] Beat patrol on 5th Ave. Hope someone cute tries jaywalking~",
          "[Watching crosswalk] Traffic's wild today, gotta watch my step at the curb.",
          "[Resting hand on holster] Just another neon evening on the metro beat.",
        ],
        mansion: [
          "[Shining tactical light] Who builds a Victorian manor without hallway lights?",
          "[Touching velvet drape] Creepy place... feels like the portraits are staring at my badge.",
          "[Listening closely] Floorboards creak with every step. Definitely someone sneaking around.",
          "[Adjusting collar] If I catch a suspect in here, I'm locking the bedroom door myself~",
        ],
        beach: [
          "[Fanning collar] Coast Guard swimsuit patrol is the best assignment in the precinct~",
          "[Watching waves] Tide's surging high today—better make sure nobody gets swept away.",
          "[Adjusting shades] Sun, surf, and full authority to detain cuties on the boardwalk!",
          "[Shaking sand off] Ugh, sand in my holster again...",
        ],
      },
      delinquent: {
        forest: [
          "[Tapping bat on shoulder] Why the heck am I hiking through bushes? Bugs better stay off my jacket.",
          "[Kicking a pinecone] Zero convenience stores out here... I'm starving.",
          "[Stretching back] Good spot for a secret turf hideout though, ngl.",
          "[Leaning on boulder] Next person who crosses this trail is buying me yakisoba bread.",
        ],
        home: [
          "[Testing bat swing] Nice quiet house... bet the fridge inside is fully stocked.",
          "[Peering at window] Boarded-up windows? Hah, like a couple planks can keep me out!",
          "[Cracking knuckles] Couch inside looks super comfy for an afternoon nap.",
          "[Chewing gum] Loitering on private property is kinda my whole brand.",
        ],
        city: [
          "[Leaning against streetlight] This whole block is my turf after sundown.",
          "[Scrolling phone] Arcade down the street beat my high score?! I'm going back later.",
          "[Resting bat on shoulder] Anybody looking at me funny gets a home-run swing.",
          "[Blowing bubblegum] City lights hit different when you're skipping cram school.",
        ],
        mansion: [
          "[Whistling in the dark] Spooky old rich-kid house... bet they've got vintage snacks.",
          "[Swinging bat at cobweb] Ghosts better catch these hands if they try haunting me.",
          "[Checking antique vase] Think nobody'll notice if I nap on that velvet sofa?",
          "[Rolling shoulders] Dark hallways don't scare me—I run the night streets!",
        ],
        beach: [
          "[Stretching by the surf] Skipping summer school for the beach was a 200-IQ move.",
          "[Spinning bat in sand] Ready to smash a watermelon—or spike a volleyball into orbit!",
          "[Fixing bikini strap] Sun's blazing... need shaved ice, strawberry flavor.",
          "[Watching the tide] Anyone splashes my hair, they're getting tackled into the waves!",
        ],
      },
      tomboy: {
        forest: [
          "[Jogging in place] Cross-country trail altitude training! Heart rate's right in the zone!",
          "[Doing lunges] Jump the creek, vault the logs—nature's ultimate obstacle course!",
          "[Wiping brow] Nothing beats a ten-mile trail run through the redwoods!",
          "[Stretching hamstrings] Gotta keep my calves loose in case a sprint breaks out!",
        ],
        home: [
          "[Bouncing on heels] Yard work warm-up! Maybe I'll vault the backyard fence for reps!",
          "[Rolling shoulders] Coach said rest day, but I can't sit still for five minutes!",
          "[Shadowboxing] Bet I could clear this whole lawn in three seconds flat!",
          "[Drinking sports bottle] Hydration check! Ready for full-contact tackling!",
        ],
        city: [
          "[Stretching at curb] Urban parkour sprint! Sidewalks are just aconcrete track!",
          "[Checking stopwatch] Beat the green light by two seconds—new personal best!",
          "[Hopping side to side] Asphalt's warm, sneakers have maximum grip today!",
          "[Flexing bicep] Gym was packed, so I'm doing street sprints instead!",
        ],
        mansion: [
          "[Doing high-knees] Indoor stair-climb circuit! These long halls are great for wind sprints!",
          "[Peering into shadows] Running in the dark sharpens your reflexes!",
          "[Touching toes] Cold stone floors—gotta stay moving so my muscles don't cool down!",
          "[Cracking neck] Even a haunted house is just another arena to win!",
        ],
        beach: [
          "[Spiking imaginary ball] Beach volleyball season! Sand resistance builds explosive speed!",
          "[Stretching in swimsuit] Surf sprint intervals—run against the tide, dive in the waves!",
          "[Adjusting visor] Who's up for a two-on-two match on the court?!",
          "[Shaking off water] Ocean breeze feels amazing after a coastal run!",
        ],
      },
      goth: {
        forest: [
          "[Tracing mossy rune] Ancient woods hold the sweetest whispers in the mist...",
          "[Gathering nightshade] Deep shade under the redwoods... the sun can't wither me here.",
          "[Murmuring incantation] Even the creek murmurs a lullaby for lost little lambs...",
          "[Gazing into fog] The veil between shadows is wonderfully thin among these ferns.",
        ],
        home: [
          "[Tracing window frame] Domestic tranquility... how delightfully fragile when night falls.",
          "[Opening black parasol] Standing in the yard like an omen on a quiet street~",
          "[Reading leather grimoire] A cozy little sanctuary... until the shadows seep under the door.",
          "[Sighing softly] Suburbia is so mundane, it practically begs for a little hex.",
        ],
        city: [
          "[Avoids neon glare] Too much gaudy neon... I prefer the quiet back alleys.",
          "[Sipping black clove tea] All these crowds rushing past, blind to the occult.",
          "[Checking silver pocketwatch] Midnight approaches even under artificial streetlights.",
          "[Standing in building shade] Watching the city bustle from the cold comfort of the shadows.",
        ],
        mansion: [
          "[Admiring candelabrum] Finally, architecture that understands my aesthetic~",
          "[Gliding down hall] Velvet, dust, and eternal twilight... I could live here forever.",
          "[Whispering to shadows] The spirits of this manor promised me a darling plaything~",
          "[Twirling lace cuff] Every dark corner here feels like an embrace.",
        ],
        beach: [
          "[Hiding under black parasol] SPF 100 and dark lace... the things I endure for a coastal ritual.",
          "[Watching dark tide] The ocean is just an abyss with better PR.",
          "[Drawing sigil in wet sand] The tide washes away every footprint... except mine.",
          "[Adjusting gothic swimwear] At least the sunset looks like a bleeding sky~",
        ],
      },
      hacker: {
        forest: [
          "[Holding laptop up] One bar of signal?! Who puts zero cell towers in a forest?!",
          "[Checking drone map] GPS still works at least... scanning thermal signatures through the trees.",
          "[Sipping energy drink] Touching grass is overrated, give me fiber-optic Wi-Fi.",
          "[Typing rapidly] Boosting my antenna gain... someone's device is pinging nearby.",
        ],
        home: [
          "[Cracking Wi-Fi password] Haha, their router password was literally 12345678!",
          "[Sitting on gaming mode] Smart-home locks? Give me thirty seconds and a USB stick~",
          "[Checking stream chat] Chat, clip this—we're doing an IRL suburban infiltration!",
          "[Tapping tablet] Signal strength right outside the living room is 100%!",
        ],
        city: [
          "[Hacking crosswalk sign] Connected to the municipal grid~ Downtown Wi-Fi is blazing fast!",
          "[Taking selfie] Neon lighting is top-tier for the stream thumbnail~ ☆",
          "[Monitoring packet sniffer] So many unsecured phones on this street, lol.",
          "[Adjusting cat-ear headphones] Just grabbed boba and three zero-day exploits~",
        ],
        mansion: [
          "[Scanning EMF & Wi-Fi] Surprisingly good bandwidth in a haunted manor!",
          "[Using screen as light] Using my RGB keyboard as a flashlight, peak gamer move.",
          "[Typing code] Setting up hidden cams in the foyer—chat's gonna love the spooky vibes!",
          "[Giggling at screen] Found a secret LAN server behind the bookshelf!",
        ],
        beach: [
          "[Shielding laptop screen] Glare on my monitor is brutal, need a shaded cabana ASAP.",
          "[Posing in swimsuit] Beach stream special! Don't forget to drop subs, chat~ ♥",
          "[Checking waterproof tablet] Waterproof case tested and approved!",
          "[Sipping coconut soda] Hacking from a lounge chair beats my desk setup any day~",
        ],
      },
      senpai: {
        forest: [
          "[Checking clipboard] Off-site team-building retreat... and half the attendees are missing.",
          "[Pushing up glasses] Nature trails lack proper directional signage. Highly inefficient.",
          "[Sighing with coffee] At least my travel mug keeps the espresso hot in the woods.",
          "[Reviewing schedule] We are twelve minutes behind the wilderness itinerary.",
        ],
        home: [
          "[Checking watch] I scheduled a mandatory home-visit evaluation for this afternoon.",
          "[Straightening blazer] Boarded windows are a clear HOA compliance violation.",
          "[Sipping espresso] If my junior is slacking off indoors, we'll have a thorough one-on-one.",
          "[Flipping folder] Attendance records must be signed in person, no exceptions.",
        ],
        city: [
          "[Checking stocks on phone] Walking between corporate headquarters... coffee break is almost over.",
          "[Adjusting glasses] Commuter traffic is dreadful, walking is 14% faster.",
          "[Holding fresh latte] Grabbed a triple-shot espresso from the corner café.",
          "[Reviewing quarterly notes] If I spot my junior skipping work downtown, overtime is mandatory.",
        ],
        mansion: [
          "[Inspecting dusty ledger] Auditing an historic estate requires immaculate attention to detail.",
          "[Frowning at lighting] This lighting is a workplace hazard. Where is the facilities manager?",
          "[Swirling coffee cup] Quiet halls... ideal for an uninterrupted private mentoring session~",
          "[Tapping pen] Nobody leaves the estate until every form is initialed.",
        ],
        beach: [
          "[Reading report under umbrella] Mandatory company beach retreat... I still brought my clipboard.",
          "[Sipping iced americano] Switched to iced espresso for coastal humidity compliance.",
          "[Adjusting sunglasses] Even in a swimsuit, a senior must maintain executive poise.",
          "[Checking tide timetable] High tide at 17:00—everything proceeds on schedule.",
        ],
      },
      yandere: {
        forest: [
          "[Hugging self dreamy-eyed] His footprints are in the soft moss... I know he passed this way~ ♥",
          "[Picking wildflower] Loves me, loves me not, loves me... of course he loves me! ♥",
          "[Giggling softly] So quiet out here in the woods... nobody will hear us cuddling~",
          "[Inhaling deeply] Even the breeze carries a hint of his sweet scent...",
        ],
        home: [
          "[Peeking toward curtains] Home sweet home~ I already picked out our matching mugs! ♥",
          "[Tracing heart on wall] He locked the doors just so we could have privacy together, right~?",
          "[Clasping hands] I'll cook, I'll clean, I'll never let him leave the bedroom~ ♥",
          "[Humming wedding march] Every room in this house is going to be ours...",
        ],
        city: [
          "[Checking 400 photos on phone] Took another candid from across the street~ He looks so cute today!",
          "[Glaring at passersby] Why are all these other girls walking on the same sidewalk as him?!",
          "[Holding ribboned gift] Bought a spare collar at the boutique just in case~ ♥",
          "[Whispering to locket] Crowded streets won't hide you from my heart, darling~",
        ],
        mansion: [
          "[Candles reflecting in eyes] A big dark manor with a grand canopy bed... it's fate! ♥",
          "[Running fingers along wall] No windows to jump out of, no neighbors to interrupt us~",
          "[Giggling in the dark] I can hear his little heartbeat echoing down the corridor~ ♥",
          "[Twirling red ribbon] Once I catch him in the dark, I'm tying our hands together forever!",
        ],
        beach: [
          "[Writing initials in sand] Wrote our names inside a giant sand heart~ Tide better not touch it!",
          "[Blushing in swimsuit] Bought this swimsuit just so he'd stare at me and only me~ ♥",
          "[Holding sunscreen bottle] I'll volunteer to put sunscreen on every inch of him~",
          "[Gazing at horizon] Sunset on the beach... the most romantic place to claim him! ♥",
        ],
      },
      trainer: {
        forest: [
          "[Patting Rex's head] Good boy, Rex! Plenty of open trail for off-leash scent work!",
          "[Checking whistle] Woodland tracking drills keep a K-9's nose razor-sharp!",
          "[Tossing dog treat] Easy, boy—save your lunges until we pick up a fresh trail!",
          "[Stretching calves] Rex loves splashing through the mountain creek!",
        ],
        home: [
          "[Coiling nylon lead] Yard perimeter walk! Rex always knows when someone's hiding inside!",
          "[Scratching Rex's ears] Smell snacks in the kitchen, boy? Or someone cute behind the door?",
          "[Adjusting whistle lanyard] Suburban fences are just warm-up agility hurdles for us!",
          "[Smiling warmly] Heel, Rex—let's check the backyard patio next.",
        ],
        city: [
          "[Holding leash at curb] Wait for the crosswalk, Rex—good urban obedience!",
          "[Giving Rex water bowl] Hot pavement today, gotta keep my champion hound hydrated.",
          "[Scanning plaza] Lots of competing scents downtown, but Rex never loses his mark!",
          "[Adjusting cap] Just taking my best boy for an evening boulevard stroll!",
        ],
        mansion: [
          "[Whispering to Rex] Low light is no problem when you've got the best ears and nose in the manor!",
          "[Checking collar glow-tag] Echoes in these halls make Rex's ears perk right up!",
          "[Keeping slack on lead] Easy boy, carpeted hallways mean high-speed indoor zoomies~",
          "[Smiling in the dark] Rex already caught a sweet scent near the grand parlor~",
        ],
        beach: [
          "[Laughing by the surf] Rex loves chasing seafoam along the shoreline!",
          "[Shaking wet sand off] Coastal agility run! Wet sand is great for paw conditioning!",
          "[Adjusting sporty swimsuit] Sun's out, whistle's ready—best beach day ever!",
          "[Pointing at waves] Fetch the driftwood, Rex! Good boy!",
        ],
      },
      sheriff: {
        forest: [
          "[Tippingetson hat] County line runs right through these redwoods. Nothing gets past me.",
          "[Checkinglasso rope] Quiet timber country... good day for a slow patrol.",
          "[Scanning ridge] Tracks in the mud tell a whole story if you know how to read 'em.",
        ],
        home: [
          "[Resting hand on belt] County Ordinance says I check every boarded-up homestead.",
          "[Looking over fence] Peaceful yard... reckon someone's hunkered down inside.",
          "[Tipping hat] Just making my rounds through the neighborhood.",
        ],
        city: [
          "[Frowning at traffic] Too many flashing signs in the big city for my taste.",
          "[Adjusting badge] Helping the city precinct keep order on the avenues.",
          "[Watching street] Folks sure walk fast downtown.",
        ],
        mansion: [
          "[Shining lantern] Old manor's been standing since the frontier days.",
          "[Checking floorboards] Mighty dark in here—best keep my eyes peeled.",
          "[Twirling rope] Plenty of room to swing a lasso in this grand hall.",
        ],
        beach: [
          "[Fanning with hat] Even a County Sheriff appreciates a coastal breeze.",
          "[Watching tide] Ocean's restless this evening.",
          "[Adjusting boots] Sand and spurs are an interesting combination.",
        ],
      },
    },

    // Paired Social Banter when two unaware enemies stand near each other
    pairedBanter: {
      "officer+delinquent": [
        { opener: "Mind keeping that baseball bat out of trouble today, Ryuko?", reply: "Relax, Officer Viki—I'm just working on my batting average~!" },
        { opener: "Don't make me write you up for loitering again.", reply: "Tch, I'm literally just standing here! Go ticket a sports car!" },
      ],
      "officer+senpai": [
        { opener: "Everything orderly on your beat, Miss Elena?", reply: "Quite orderly, Officer—though my junior is still unaccounted for." },
        { opener: "If you spot a cute suspect running around, radio me first~", reply: "Only after I finish his mandatory performance review, Officer Viki." },
      ],
      "delinquent+tomboy": [
        { opener: "Yo Roxie, bet my bat swing hits harder than your slide tackle!", reply: "Oh yeah?! Wanna race to the end of the block and find out?!" },
        { opener: "You ever stop jogging for like five seconds?", reply: "Nope! Gotta stay warmed up for the big catch!" },
      ],
      "hacker+tomboy": [
        { opener: "Roxie, hold still—you're in the background of my stream!", reply: "Awesome! Tell your chat I can do fiftyone-handed pushups!" },
        { opener: "My stamina bar is at 10% just watching you sprint...", reply: "Come do wind sprints with me, Natsuki! Ditch the laptop!" },
      ],
      "goth+yandere": [
        { opener: "Your aura is practically dripping with crimson obsession today, Ayame~", reply: "Hehe~ Is it that obvious, Raven? Did your tarot cards show where he is?!" },
        { opener: "Save a little piece of his soul for the shadows, darling.", reply: "Hands off, Raven—every single heartbeat of his belongs to me~ ♥" },
      ],
      "senpai+delinquent": [
        { opener: "Unbuttoned jacket and a wooden bat? That violates every dress code.", reply: "Whoa, chill out, Glasses! We're not even in the office!" },
        { opener: "Stand up straight when a senior addresses you.", reply: "Yeah, yeah, whatever you say, boss lady~" },
      ],
      "trainer+tomboy": [
        { opener: "Rex loves pacing your sprints, Roxie—you two have the same energy!", reply: "Heck yeah! Me and Rex are the ultimate speed duo!" },
        { opener: "Think you can outrun a K-9 agility champion?", reply: "Bring it on, Maya! First one across the map wins!" },
      ],
      "goth+hacker": [
        { opener: "Your glowing screens offend the ancient spirits, Natsuki...", reply: "Bestie, your 'ancient spirits' are literally just my Wi-Fi router blinking~" },
        { opener: "Care to have your fortune read in the dark?", reply: "Only if it predicts a viral clip today! ☆" },
      ],
      "yandere+senpai": [
        { opener: "Miss Elena, you're only looking for him because of work... right~?", reply: "My supervision of him is strictly professional... mostly." },
        { opener: "I brought extra coffee for you so you can take a nice long break~ ♥", reply: "Hm. Suspiciously generous, Ayame, but I never turn down espresso." },
      ],
      "trainer+officer": [
        { opener: "Rex is ready to assist the K-9 unit whenever you need a tracker, Viki!", reply: "Appreciate it, Maya! With Rex's nose, no cutie stays hidden for long~" },
      ],
      defaultOpeners: [
        "Seen anything cute wandering around here lately?",
        "Quiet around here... think he's hiding nearby?",
        "Taking five before I check the next corner.",
        "If I spot him first, I'm calling dibs~ ♥",
      ],
      defaultReplies: [
        "Not yet, but I've got my eyes wide open~",
        "Heh, if he's around here, he won't stay hidden for long!",
        "Fair's fair—first one to catch him gets the prize~ ♥",
        "Let's keep checking the area, I heard footsteps earlier.",
      ],
    },

    // Awareness State Transitions
    awarenessCallouts: {
      officer: {
        spotted: [
          "There you are! Suspect spotted—pursuit in progress!",
          "Caught you in my sights, cutie! Freeze!",
          "Heard that commotion! Officer Viki responding!",
        ],
        searching: [
          "Suspect broke visual contact... sweeping the sector.",
          "Huh? Thought I saw movement around that corner...",
          "Come on out, cutie, hiding only adds to the sentence~",
        ],
        lost: [
          "Lost visual... resuming normal beat patrol for now.",
          "Slipped away, huh? I'll catch you on the next round.",
        ],
      },
      delinquent: {
        spotted: [
          "Aha! Found you, little brat—get over here!",
          "Heard you making noise! Ready to get cornered?!",
          "Eyes on the prize! You're not running past me!",
        ],
        searching: [
          "Tch, where'd you duck off to, coward?!",
          "Hey! I know you're sneaking around here somewhere...",
        ],
        lost: [
          "Whatever, lost him. Going back to chilling.",
          "Lucky break, punk... next time I see you, you're mine.",
        ],
      },
      tomboy: {
        spotted: [
          "Spotted! Game on, cutie—let's see your top speed!",
          "There you are! Time for full-court press!",
          "Heard footsteps! Sprint mode activated!",
        ],
        searching: [
          "Whoa, nice juke! Where'd you pivot to?!",
          "Checking the blind spots... can't fake me out forever!",
        ],
        lost: [
          "Phew, lost track of him. Back to my warm-up jog!",
          "Good round! Catch my breath and look again later.",
        ],
      },
      goth: {
        spotted: [
          "The shadows whispered your name... found you, darling~ ♥",
          "Step into the light? Bad mistake, little moth~",
          "My dark intuition never misses... come here~",
        ],
        searching: [
          "Hiding in the gloom? Remember who rules the dark...",
          "Where did that sweet little shadow flutter off to~?",
        ],
        lost: [
          "Vanished into the mist... fate will cross our paths again.",
          "Back to my quiet brooding until you return~",
        ],
      },
      hacker: {
        spotted: [
          "Pinged on radar! Chat, we found him—initiating chase!",
          "Caught you on cam, cutie! Don't run away~ ☆",
          "Audio spike detected! Locking onto target!",
        ],
        searching: [
          "Wait, lag spike?! Where'd he despawn to?!",
          "Scanning local area... he broke line-of-sight...",
        ],
        lost: [
          "Target lost signal. Going back to browsing for a bit.",
          "Aw, lost the cam feed. Back to idle mode~",
        ],
      },
      senpai: {
        spotted: [
          "There you are! You're late for our private evaluation!",
          "Spotted! Don't think you can slip past your senior!",
          "Noise in the area—found my truant junior!",
        ],
        searching: [
          "Excusing yourself without permission? Where did you go?",
          "Searching the vicinity... hiding won't clear your ledger.",
        ],
        lost: [
          "Hm. Lost sight of him. Returning to my schedule.",
          "I'll mark him absent for now and resume my break.",
        ],
      },
      yandere: {
        spotted: [
          "FOUND YOU!! My heart knew you were right here~ ♥",
          "I heard your sweet voice! Come into my arms, darling!!",
          "There's my beloved! Nobody hides from true love~ ♥",
        ],
        searching: [
          "Darling~? Why are you playing hide-and-seek with me...?",
          "I can still smell your cologne... where are you hiding~?",
        ],
        lost: [
          "Aw, I lost him... I'll just keep wandering until I find him again~ ♥",
          "Resting my feet for a moment... wait for me, sweetheart~",
        ],
      },
      trainer: {
        spotted: [
          "Rex's ears perked up! Target spotted—sic 'em, boy!",
          "Found you! Good tracking, Rex—let's reel him in!",
          "Scent locked! On the double, Rex!",
        ],
        searching: [
          "Easy, Rex... sniff out where he turned around that obstacle...",
          "Did the trail go cold around this corner, boy?",
        ],
        lost: [
          "Trail faded out. Good effort, Rex—back to our walk.",
          "Let's pace the route again until we catch a fresh scent.",
        ],
      },
      sheriff: {
        spotted: [
          "Spotted the outlaw! Lasso's ready!",
          "Hold it right there, sugar!",
        ],
        searching: [
          "Tracks ducked behind cover... looking around.",
        ],
        lost: [
          "Trail went cold. Back to my rounds.",
        ],
      },
    },
  },

  // --- Autonomous NPC Femboy Survivors Dialogue & Commentary ---
  npcFemboyDialogue: {
    spawnGreetings: [
      "Eep! Another cute survivor?! Stay sharp, the girls are patrolling everywhere!",
      "Psst! Over here! Let's watch each other's backs out there~ ♪",
      "Whew, glad I'm not the only femboy trying not to get dragged to that bed!",
      "Heya! I found a spare blaster—if they gang up on you, I've got your back!",
    ],
    idleByMap: {
      forest: [
        "Watch your step in the creek—the water slows your skirt right down!",
        "At least the fog and redwoods make it easier to sneak past them...",
        "Is that a hound barking in the woods?! Stay quiet...",
      ],
      home: [
        "If we keep the barricades up, we've got a safe place to catch our breath!",
        "Hear them knocking on the planks?! Keep your blaster ready!",
        "This house would be super cozy if we weren't being hunted~",
      ],
      city: [
        "Look both ways before crossing the avenue—those cars don't brake for us!",
        "Half these pedestrians look suspiciously like pursuers...",
        "Careful firing near civilians or the cops will swarm the block!",
      ],
      mansion: [
        "So dark in here... those glowing eyes in the hallway give me chills!",
        "Stick near the light—Goth Raven loves ambushing from the shadows!",
        "Whatever you do, stay away from that velvet canopy bed in the parlor!",
      ],
      beach: [
        "Even in swimsuits these women are relentless! Watch the surging tide!",
        "Incoming beach volleyball! Dodge left!",
        "Running in wet sand is a workout~ don't let them corner you by the surf!",
      ],
    },
    spottedEnemy: [
      "Uh-oh, she just noticed me! Time to kite!",
      "Yikes, she's got that hungry look in her eyes—falling back!",
      "Ack! Spotted! Eat plasma bubbles, lady!",
    ],
    combatCallouts: [
      "Back off, lady! I'm not going down that easy! ★",
      "Take this! Keep your hands to yourself!",
      "Suppressing fire~ Don't let her close the gap!",
      "Pew pew! Stay out of grabbing range!",
    ],
    rescuingPlayer: [
      "Hang on! I'm shooting her off you right now!!",
      "Hands off him, lady!! I've got you covered!",
      "Don't panic—I'm breaking her grip! Keep struggling!",
      "Nobody drags my friend to the bed on my watch!!",
    ],
    thankPlayerForHelp: [
      "Phew~! You saved me! Thanks a million, cutie! ♥",
      "Whoa, nice shot! She almost had me pinned there!",
      "Thank goodness you showed up! I owe you big time~ ♪",
    ],
    loyaltyFollowJoin: [
      "You've helped me out so much... I'm sticking right by your side from now on! ♥",
      "We make an unstoppable duo! Lead the way, partner—I'll guard your flank! ★",
      "I trust you completely now~ Let's survive this together! ♥",
    ],
    followingChatter: [
      "Right behind you, partner~ Watching our six! ♪",
      "Stick together and none of these women can corner us!",
      "You take point, I'll cover our escape route~ ♥",
      "Still with you! Let me know if we need to sprint!",
    ],
    struggleCries: [
      "Eek!! She grabbed me—somebody shoot her off me!!",
      "N-no, let go!! Help! I'm pinned down!!",
      "Aaah! Her grip's too strong—need backup quick!!",
    ],
    draggedPleas: [
      "NO!! She's dragging me to the bed!! Save me before she gets there!!",
      "H-help!! I'm out of stamina—don't let her take me to the bed!!",
      "Please shoot her!! I don't want a Game Over—aaah!!",
    ],
    gameOverEliminated: [
      "Aaaah~ Too late... she got me to the bed... survive for both of us~ ♥",
      "N-no more strength left... tell the others I tried my best~ ♥",
      "Eep~ Cornered on the mattress... looks like it's game over for me~ ♥",
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

    flyingWords: ["plap", "PLAP", "plap~ ♥", "PLAP! ♥", "plap"],
    flyingHeartSymbols: ["♥", "♡", "plap", "💖", "💕", "PLAP", "✨"],
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
export type PlayerSkinKey = keyof typeof GAME_TEXT.playerSkins;


