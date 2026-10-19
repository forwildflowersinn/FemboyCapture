import React, { useEffect } from 'react';
import { GAME_TEXT, ArchetypeKey, MapKey } from '../gameText.ts';
import { formatTime, MapType } from '../game/logic.ts';
import { Play, Sparkles, Volume2, VolumeX, ShieldAlert, Trees, Home as HomeIcon, Building2, MapPin } from 'lucide-react';

interface TitleScreenProps {
  selectedMap: MapType;
  onSelectMap: (map: MapType) => void;
  bestTime: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onStart: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  selectedMap,
  onSelectMap,
  bestTime,
  isMuted,
  onToggleMute,
  onStart,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onStart]);

  const archetypeEntries = Object.entries(GAME_TEXT.archetypes) as [
    ArchetypeKey,
    typeof GAME_TEXT.archetypes[ArchetypeKey],
  ][];

  const mapList: { id: MapType; icon: React.ReactNode }[] = [
    { id: 'forest', icon: <Trees className="w-5 h-5 text-emerald-400" /> },
    { id: 'home', icon: <HomeIcon className="w-5 h-5 text-amber-400" /> },
    { id: 'city', icon: <Building2 className="w-5 h-5 text-sky-400" /> },
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white select-none overflow-y-auto">
      {/* Top bar with audio & record */}
      <header className="flex items-center justify-between w-full max-w-5xl mx-auto pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-bold tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> ARCADE SURVIVAL
          </span>
          {bestTime > 0 && (
            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-mono font-bold">
              RECORD: {formatTime(bestTime)}
            </span>
          )}
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </header>

      {/* Main Center Section */}
      <main className="w-full max-w-5xl mx-auto my-auto py-4 flex flex-col items-center text-center">
        {/* Emblem / Title */}
        <div className="relative mb-2">
          <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/30 via-purple-500/30 to-sky-500/30 rounded-3xl blur-xl opacity-70"></div>
          <div className="relative">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-sky-300 drop-shadow-lg font-['Outfit']">
              {GAME_TEXT.gameTitle}
            </h1>
            <div className="flex items-center justify-center gap-2 text-lg sm:text-xl font-black tracking-widest text-pink-400 font-mono mt-0.5">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>{GAME_TEXT.gameSubtitle}</span>
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
          </div>
        </div>

        <p className="max-w-xl text-slate-300 text-xs sm:text-sm mb-5">
          {GAME_TEXT.tagline}
        </p>

        {/* Stage Environment Selector */}
        <div className="w-full max-w-2xl mb-6">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-pink-400" /> {GAME_TEXT.selectMapLabel}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {mapList.map(({ id, icon }) => {
              const mapInfo = GAME_TEXT.maps[id as MapKey];
              const isSelected = selectedMap === id;
              return (
                <button
                  key={id}
                  onClick={() => onSelectMap(id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-pink-500/20 border-pink-400 shadow-md shadow-pink-500/20 ring-1 ring-pink-400'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {icon}
                    <span className="font-bold text-sm text-white">{mapInfo.name}</span>
                  </div>
                  <div className="text-[11px] text-pink-300 font-medium mb-1">
                    {mapInfo.tagline}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    {mapInfo.hazardNote}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          data-start="true"
          onClick={onStart}
          className="group relative px-8 py-3.5 sm:px-10 sm:py-4 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 text-white font-black text-lg shadow-xl shadow-pink-500/35 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-3"
        >
          <Play className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />
          <span>{GAME_TEXT.startButton}</span>
          <span className="hidden sm:inline-block text-xs font-normal opacity-80 ml-2 bg-white/20 px-2 py-0.5 rounded-md">
            SPACE
          </span>
        </button>

        {/* Pursuer Archetypes Roster */}
        <div className="w-full mt-7">
          <div className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-2 flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-pink-400" /> PURSUER ARCHETYPES & TACTICS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-left">
            {archetypeEntries.map(([key, arch]) => (
              <div
                key={key}
                className="bg-slate-900/80 border border-slate-800 hover:border-pink-500/40 rounded-xl p-2.5 transition flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-2.5 h-2.5 rounded-full mb-1 shadow-sm"
                    style={{ backgroundColor: arch.colorHex }}
                  />
                  <div className="font-bold text-xs text-white">{arch.name}</div>
                  <div className="text-[10px] text-pink-300 font-medium mb-1">
                    {arch.title}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-snug line-clamp-2">
                    {arch.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Control hints footer */}
      <footer className="w-full max-w-5xl mx-auto py-1 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span><strong className="text-slate-200">WASD / Arrows:</strong> {GAME_TEXT.controls.moveLabel}</span>
          <span><strong className="text-slate-200">Mouse / Space:</strong> {GAME_TEXT.controls.aimLabel}</span>
        </div>
        <div className="flex items-center gap-1.5 text-pink-300">
          <span>{GAME_TEXT.controls.weaponHint}</span>
        </div>
      </footer>
    </div>
  );
};
