import React from 'react';
import { GAME_TEXT } from '../gameText.ts';
import { formatTime, WEAPON_DEFS, type ActiveDebuff } from '../game/logic.ts';
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
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenManual?: () => void;
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
  onToggleMute,
  onPause,
  onRestart,
  onOpenManual,
}) => {
  const [hoveredDebuff, setHoveredDebuff] = React.useState<ActiveDebuff | null>(null);
  const currentWeapon = WEAPON_DEFS[activeWeaponKey] || WEAPON_DEFS.pistol;
  const isInfinite = currentWeapon.maxAmmo === -1;
  const ammoRatio = isInfinite ? 1 : Math.max(0, ammo / currentWeapon.maxAmmo);

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

          <div className="flex items-center gap-2">
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1 text-xs font-semibold text-slate-300 inline-flex items-center gap-1.5 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{GAME_TEXT.hud.defeatedLabel}:</span>
              <strong className="text-white font-mono">{defeatedCount}</strong>
            </div>

            {/* Active permanent debuffs badge */}
            {activeDebuffs.length > 0 && (
              <div className="bg-rose-950/80 border border-rose-500/40 rounded-lg px-2.5 py-1 text-xs font-bold text-rose-300 inline-flex items-center gap-1 shadow-md">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{activeDebuffs.length} Debuff{activeDebuffs.length > 1 ? 's' : ''}</span>
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
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
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

        {/* Center: Notification Toast */}
        {notification && (
          <div className="pointer-events-none transition-all animate-bounce bg-pink-500/90 text-white font-bold text-xs sm:text-sm px-4 py-1.5 rounded-full shadow-lg border border-pink-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            {notification}
          </div>
        )}

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
          <div className="bg-slate-950/85 border border-slate-800 rounded-xl px-3 py-1.5 flex items-center gap-1.5 shadow-lg w-fit">
            <span className="text-[10px] font-bold text-pink-400 mr-1 uppercase">
              {GAME_TEXT.hud.hpLabel}
            </span>
            {Array.from({ length: maxHp }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-all ${
                  i < hp
                    ? 'fill-rose-500 text-rose-400 scale-100'
                    : 'fill-slate-800 text-slate-700 scale-90'
                }`}
              />
            ))}
          </div>

          <div className="bg-slate-950/85 border border-slate-800 rounded-xl p-3 shadow-lg flex items-center gap-3 min-w-[200px]">
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
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {GAME_TEXT.hud.weaponLabel}
              </div>
              <div className="text-sm font-bold text-white flex items-center justify-between">
                <span>{currentWeapon.name}</span>
                <span className="font-mono text-xs text-sky-300 ml-2">
                  {isInfinite ? GAME_TEXT.hud.infiniteAmmo : `${ammo} / ${currentWeapon.maxAmmo}`}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-150"
                  style={{
                    width: `${ammoRatio * 100}%`,
                    backgroundColor: currentWeapon.color,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="hidden md:block bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-1 text-[11px] text-slate-400">
          WASD: Move · Mouse / Space: Aim/Shoot · P: Pause
        </div>
      </footer>
    </div>
  );
};
