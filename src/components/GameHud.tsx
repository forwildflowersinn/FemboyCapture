import React from 'react';
import { GAME_TEXT } from '../gameText.ts';
import { formatTime, WEAPON_DEFS, type ActiveDebuff, type NpcFemboyState } from '../game/logic.ts';
import { Heart, Pause, RotateCcw, Volume2, VolumeX, Crosshair, Sparkles, ShieldAlert } from 'lucide-react';

interface GameHudProps {
  survivalTime: number;
  bestTime: number;
  hp: number;
  maxHp: number;
  activeWeaponKey: string;
  ammo: number;
  defeatedCount: number;
  notification: string | null;
  activeDebuffs: ActiveDebuff[];
  isMuted: boolean;
  adorationLevel: number;
  adorationExp: number;
  expToNextLevel: number;
  heartCurrency?: number;
  activeUpgradesCount?: number;
  extraLives?: number;
  invulnSeconds?: number;
  cursedSeconds?: number;
  nextLevelModifier?: 'single' | number | null;
  homeSanctuaryStatus?: {
    intactCount: number;
    totalCount: number;
    sanctuaryActive: boolean;
    nearBreachLabel?: string | null;
  } | null;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenManual?: () => void;
  outfitMode?: 'standard' | 'swimsuit' | 'comfy';
  tauntCooldown?: number;
  npcFemboys?: NpcFemboyState[];
}

export const GameHud: React.FC<GameHudProps> = ({
  survivalTime,
  bestTime,
  hp,
  maxHp,
  activeWeaponKey,
  ammo,
  defeatedCount,
  notification,
  activeDebuffs,
  isMuted,
  adorationLevel,
  adorationExp,
  expToNextLevel,
  heartCurrency = 0,
  activeUpgradesCount = 0,
  extraLives = 1,
  invulnSeconds = 0,
  cursedSeconds = 0,
  nextLevelModifier = null,
  homeSanctuaryStatus = null,
  onToggleMute,
  onPause,
  onRestart,
  onOpenManual,
  outfitMode = 'standard',
  tauntCooldown = 0,
  npcFemboys = [],
}) => {
  const [hoveredDebuff, setHoveredDebuff] = React.useState<ActiveDebuff | null>(null);
  const currentWeapon = WEAPON_DEFS[activeWeaponKey] || WEAPON_DEFS.pistol;
  const isInfinite = currentWeapon.maxAmmo === -1;
  const ammoRatio = isInfinite ? 1 : Math.max(0, ammo / currentWeapon.maxAmmo);
  const isOverchargedAmmo = !isInfinite && ammo > currentWeapon.maxAmmo;

  return (
    <div className="fixed inset-0 pointer-events-none z-30 select-none flex flex-col justify-between p-3 sm:p-5">
      {/* Top Header Cluster */}
      <header className="flex items-start justify-between w-full">
        {/* Left: Timer & Defeated */}
        <div className="flex flex-col gap-1.5">
          <div className="bg-slate-950/85 border border-pink-500/30 rounded-xl px-4 py-2 shadow-lg flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-pink-400 uppercase">
                {GAME_TEXT.hud.timerLabel}
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums tracking-tight">
                {formatTime(survivalTime)}
              </div>
            </div>
            {bestTime > 0 && (
              <div className="hidden sm:block pl-3 border-l border-slate-800">
                <div className="text-[9px] font-bold tracking-wider text-amber-400 uppercase">
                  {GAME_TEXT.hud.personalBestLabel}
                </div>
                <div className="text-sm font-bold font-mono text-amber-300 tabular-nums">
                  {formatTime(bestTime)}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-xs font-semibold text-slate-300 inline-flex items-center gap-1.5 w-fit">
              <span>{GAME_TEXT.hud.defeatedLabel}:</span>
              <strong className="text-white font-mono tabular-nums">{defeatedCount}</strong>
            </div>

            {/* Suburban Home Sanctuary & Barricade Counter */}
            {homeSanctuaryStatus && (
              <div
                className={`rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1.5 shadow-md border ${
                  homeSanctuaryStatus.sanctuaryActive
                    ? 'bg-emerald-950/85 border-emerald-500/50 text-emerald-300'
                    : 'bg-amber-950/85 border-amber-500/40 text-amber-300'
                }`}
              >
                <span>
                  Barricades: {homeSanctuaryStatus.intactCount}/{homeSanctuaryStatus.totalCount}
                </span>
                <span>·</span>
                <span>
                  {homeSanctuaryStatus.sanctuaryActive
                    ? 'SANCTUARY ACTIVE (+20% Fire Rate & Supplies)'
                    : 'Repair 4+ for Sanctuary Buff [Hold E]'}
                </span>
              </div>
            )}

            {/* Active permanent debuffs badge */}
            {activeDebuffs.length > 0 && (
              <div className="bg-rose-950/80 border border-rose-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-rose-300 inline-flex items-center gap-1 shadow-md">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{activeDebuffs.length} Debuff{activeDebuffs.length > 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Active enemy evolutions badge */}
            {activeUpgradesCount > 0 && (
              <div className="bg-amber-950/80 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-amber-300 inline-flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{activeUpgradesCount} Evolution{activeUpgradesCount > 1 ? 's' : ''}</span>
              </div>
            )}

            {onOpenManual && (
              <button
                onClick={onOpenManual}
                className="pointer-events-auto bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-pink-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-pink-300 inline-flex items-center gap-1 transition cursor-pointer shadow-sm"
                title="View Debuff Compendium"
              >
                <span>MANUAL</span>
              </button>
            )}
          </div>

          {/* Active NPC Femboy Survivors Status Strip (Max 2) */}
          {npcFemboys.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              {npcFemboys.map((npc) => {
                const isDragged = npc.aiMode === 'captured_dragged';
                const isStruggling = npc.aiMode === 'captured_struggle';
                const statusLabel = isDragged
                  ? 'DRAGGED TO BED!'
                  : isStruggling
                    ? `STRUGGLING (${Math.ceil(npc.struggleTimer)}s)`
                    : npc.aiMode === 'rescuing_player'
                      ? 'RESCUING YOU!'
                      : npc.isLoyalCompanion
                        ? 'PARTNER'
                        : 'ROAMING';
                return (
                  <div
                    key={npc.id}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold inline-flex items-center gap-1.5 border shadow-md ${
                      isDragged
                        ? 'bg-rose-950/95 border-rose-500 text-rose-200 animate-pulse'
                        : isStruggling
                          ? 'bg-amber-950/95 border-amber-400 text-amber-200 animate-bounce'
                          : npc.isLoyalCompanion
                            ? 'bg-pink-950/85 border-pink-400/60 text-pink-200'
                            : 'bg-slate-950/85 border-teal-500/50 text-teal-200'
                    }`}
                  >
                    <span>{npc.name}</span>
                    <span className="text-rose-400 font-mono">
                      {'♥'.repeat(Math.max(0, npc.hp))}
                      {'♡'.repeat(Math.max(0, npc.maxHp - npc.hp))}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span>{statusLabel}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Debuff Pill Tray with Hover Details */}
          {activeDebuffs.length > 0 && (
            <div className="pointer-events-auto relative flex flex-wrap gap-1 max-w-sm mt-0.5">
              {activeDebuffs.map((d) => (
                <div
                  key={d.id}
                  onMouseEnter={() => setHoveredDebuff(d)}
                  onMouseLeave={() => setHoveredDebuff(null)}
                  className="px-2 py-0.5 rounded bg-slate-950/90 border border-rose-500/40 hover:border-pink-400 text-[10px] text-rose-300 font-semibold cursor-help transition hover:bg-rose-950/80 flex items-center gap-1 shadow-sm"
                >
                  <span>{d.name}</span>
                </div>
              ))}

              {/* Rich Floating Tooltip Card */}
              {hoveredDebuff && (
                <div className="absolute top-full left-0 mt-2 z-50 w-72 p-3 bg-slate-950/95 border-2 border-pink-500 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in duration-150">
                  <div className="flex items-center justify-between gap-1 mb-1 border-b border-slate-800 pb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                      {hoveredDebuff.name}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                      {hoveredDebuff.archetype}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium leading-snug mb-2">
                    {hoveredDebuff.description}
                  </p>
                  <div className="text-[10px] text-pink-300/80 italic border-t border-slate-900 pt-1">
                    Effect: {hoveredDebuff.effectType.replace(/_/g, ' ')}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Center: Wanted Level Kills Progression & Heart Currency Shop Button */}
        <div className="flex flex-col items-center gap-1.5 max-w-xs sm:max-w-sm w-full mx-2">
          {/* Wanted Level & Kills Progress (Level-up is now purely based on enemy eliminations!) */}
          <div className="w-full bg-slate-950/90 border border-amber-500/50 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-sm flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] font-black tracking-wider uppercase">
              <span className="text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>WANTED LEVEL {adorationLevel}</span>
              </span>
              <span className="text-slate-400 font-mono tabular-nums">
                {adorationExp} / {expToNextLevel} KILLS
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-amber-900/40">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 rounded-full transition-all duration-200"
                style={{ width: `${Math.min(100, Math.max(0, (adorationExp / expToNextLevel) * 100))}%` }}
              />
            </div>
          </div>

          {/* Heart Currency Counter, 60s Auto-Shop Timer & Bratty Taunt [F] Indicator */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="bg-slate-950/90 border border-pink-500/60 rounded-lg px-2.5 py-1 text-xs font-bold text-pink-300 inline-flex items-center gap-1.5 shadow-md">
              <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-400" />
              <span>{outfitMode === 'comfy' ? 'FREE SHOP (COMFY)' : `${heartCurrency} HEARTS`}</span>
              <span className="text-[10px] text-slate-400 font-mono pl-1 border-l border-slate-800">
                Shop in {Math.max(1, 60 - (Math.floor(survivalTime) % 60))}s
              </span>
            </div>

            <div
              className={`rounded-lg px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1 shadow-md border ${
                tauntCooldown > 0
                  ? 'bg-slate-950/80 border-slate-800 text-slate-500'
                  : 'bg-rose-950/90 border-pink-400/60 text-pink-200'
              }`}
            >
              <span>{tauntCooldown > 0 ? `TEASE [F]: ${tauntCooldown.toFixed(1)}s` : 'BRATTY TEASE [F]: READY!'}</span>
            </div>
          </div>

          {homeSanctuaryStatus?.nearBreachLabel && (
            <div className="pointer-events-none bg-amber-500/95 text-slate-950 font-black text-xs px-3.5 py-1 rounded-lg shadow-lg border border-amber-300">
              Hold [E] to Repair {homeSanctuaryStatus.nearBreachLabel} (+Hearts)
            </div>
          )}

          {notification && (
            <div className="pointer-events-none transition-all animate-bounce bg-pink-500/90 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg border border-pink-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              {notification}
            </div>
          )}
        </div>

        {/* Right: Quick action buttons */}
        <div className="pointer-events-auto flex items-center gap-2">
          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-pink-300 shadow-md transition cursor-pointer text-xs font-bold px-3 hidden sm:flex items-center gap-1"
              title="Open Debuff Compendium"
              aria-label="Debuff Manual"
            >
              <span>MANUAL</span>
            </button>
          )}
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-slate-300 shadow-md transition cursor-pointer"
            title="Toggle Sound"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onRestart}
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-slate-300 shadow-md transition cursor-pointer"
            title="Restart Run [R]"
            aria-label="Restart Run"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>
          <button
            onClick={onPause}
            className="p-2 rounded-xl bg-slate-950/85 hover:bg-slate-900 border border-slate-800 text-slate-300 shadow-md transition cursor-pointer"
            title="Pause [P / Esc]"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </header>

      {/* Bottom Footer Cluster: Stamina + Weapon */}
      <footer className="flex flex-wrap items-end justify-between w-full gap-3">
        {/* Left: Health Hearts & Weapon Card */}
        <div className="flex flex-col gap-2">
          {/* Active Support Item Status Timers (Invuln / Cursed / Level Choice Mod) */}
          {(invulnSeconds > 0 || cursedSeconds > 0 || nextLevelModifier !== null) && (
            <div className="flex items-center gap-2 flex-wrap">
              {invulnSeconds > 0 && (
                <div className="bg-amber-950/90 border border-amber-400/80 text-amber-200 rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>STARLIGHT INVULNERABLE: {invulnSeconds.toFixed(1)}s</span>
                </div>
              )}
              {cursedSeconds > 0 && (
                <div className="bg-rose-950/95 border-2 border-rose-500 text-rose-200 rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-bounce">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>CURSED COLLAR (1-TOUCH CAPTURE!): {cursedSeconds.toFixed(1)}s</span>
                </div>
              )}
              {nextLevelModifier === 'single' && (
                <div className="bg-purple-950/90 border border-purple-500/70 text-purple-200 rounded-xl px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <span>NEXT LV UP: LOCKED TO 1 CHOICE!</span>
                </div>
              )}
              {typeof nextLevelModifier === 'number' && nextLevelModifier > 0 && (
                <div className="bg-indigo-950/90 border border-indigo-400/70 text-indigo-200 rounded-xl px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3 text-indigo-300" />
                  <span>NEXT LV UP: {Math.min(6, 3 + nextLevelModifier)} CHOICES READY</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-slate-950/85 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-1 shadow-lg w-fit flex-wrap max-w-md">
              <span className="text-[10px] font-bold text-pink-400 mr-1 uppercase">
                {GAME_TEXT.hud.hpLabel} ({hp}/{maxHp})
              </span>
              {Array.from({ length: maxHp }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 sm:w-5 sm:h-5 transition-all ${
                    i < hp
                      ? 'fill-rose-500 text-rose-400 scale-100'
                      : 'fill-slate-800 text-slate-700 scale-90'
                  }`}
                />
              ))}
            </div>

            <div
              className={`rounded-xl px-3 py-1.5 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg border ${
                outfitMode === 'comfy'
                  ? 'bg-emerald-950/90 border-emerald-400/60 text-emerald-200'
                  : outfitMode === 'swimsuit'
                    ? 'bg-rose-950/90 border-rose-500/70 text-rose-200'
                    : extraLives > 0
                      ? 'bg-pink-950/85 border-pink-500/50 text-pink-300'
                      : 'bg-purple-950/90 border-purple-500/60 text-purple-300'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {outfitMode === 'comfy'
                  ? 'COMFY OUTFIT: INFINITE LIVES ♥'
                  : outfitMode === 'swimsuit'
                    ? 'TWO-PIECE SWIMSUIT: 1-HEART CHALLENGE!'
                    : extraLives > 0
                      ? 'SECOND CHANCE: READY'
                      : 'SECOND CHANCE: SPENT (HAUNTED!)'}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/85 border border-slate-800 rounded-xl p-3 shadow-lg flex items-center gap-3 min-w-[215px]">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-black text-xs shadow-inner"
              style={{
                backgroundColor: `${currentWeapon.color}22`,
                color: currentWeapon.color,
                border: `1.5px solid ${currentWeapon.color}`,
              }}
            >
              <Crosshair className="w-5 h-5" />
            </div>

            <div className="flex-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                <span>{GAME_TEXT.hud.weaponLabel}</span>
                {isOverchargedAmmo && (
                  <span className="text-[9px] font-black text-amber-300 uppercase">150% OVERCHARGED</span>
                )}
              </div>
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span>{currentWeapon.name}</span>
                <span
                  className={`font-mono text-xs ml-2 ${
                    isOverchargedAmmo ? 'text-amber-300 font-black' : 'text-sky-300'
                  }`}
                >
                  {isInfinite ? GAME_TEXT.hud.infiniteAmmo : `${ammo} / ${currentWeapon.maxAmmo}`}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${Math.min(100, ammoRatio * 100)}%`,
                    backgroundColor: isOverchargedAmmo ? '#fbbf24' : currentWeapon.color,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-1 text-[11px] text-slate-400">
          WASD: Move · Mouse / Space: Aim/Shoot · F: Bratty Tease · P: Pause
        </div>
      </footer>
    </div>
  );
};
