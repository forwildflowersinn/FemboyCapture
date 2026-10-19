import React, { useState } from 'react';
import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';
import { ShieldAlert, X, Sparkles, BookOpen, Search, Info, Flame, Eye, Skull, AlertCircle } from 'lucide-react';

interface DebuffManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArchetype?: string;
}

export const DebuffManualModal: React.FC<DebuffManualModalProps> = ({
  isOpen,
  onClose,
  initialArchetype = 'sheriff',
}) => {
  const [selectedArch, setSelectedArch] = useState<string>(initialArchetype);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const archetypesList = Object.keys(GAME_TEXT.archetypes) as ArchetypeKey[];
  const currentArchKey = (selectedArch as ArchetypeKey) || 'sheriff';
  const currentArchInfo = GAME_TEXT.archetypes[currentArchKey];
  const debuffs = GAME_TEXT.archetypeDebuffs[currentArchKey] || [];

  const filteredDebuffs = debuffs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.flavor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-pink-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide font-['Outfit'] flex items-center gap-2">
                DEBUFF COMPENDIUM & MANUAL
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold font-mono">
                  6 PER ARCHETYPE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Explore the persistent mechanical debuffs inflicted upon direct contact with each archetype.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shiny Warning Banner */}
        <div className="px-6 py-2.5 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-bold tracking-wide">
              ★ SHINY ENCOUNTERS:
            </span>
            <span className="text-amber-100/90 hidden sm:inline">
              Every archetype has an exceedingly rare Shiny variant! Glowing with iridescent light, touching a shiny results in an INSTANT GAME OVER!
            </span>
            <span className="text-amber-100/90 sm:hidden">
              Touching a rare shiny pursuer is an instant game over!
            </span>
          </div>
        </div>

        {/* Archetype Selector Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {archetypesList.map((key) => {
            const arch = GAME_TEXT.archetypes[key];
            const isSelected = selectedArch === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedArch(key)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-gradient-to-r from-pink-600/80 to-rose-600/80 text-white border-pink-400/80 shadow-md shadow-pink-500/20 scale-[1.02]'
                    : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:text-white'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: arch.colorHex }}
                />
                {arch.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Archetype Banner */}
          <div
            className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            style={{
              backgroundColor: `${currentArchInfo.colorHex}15`,
              borderColor: `${currentArchInfo.colorHex}44`,
            }}
          >
            <div className="flex items-center gap-3.5">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner border"
                style={{
                  backgroundColor: `${currentArchInfo.colorHex}33`,
                  borderColor: currentArchInfo.colorHex,
                  color: currentArchInfo.colorHex,
                }}
              >
                {currentArchInfo.name[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white font-['Outfit']">
                    {currentArchInfo.name}
                  </h3>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono"
                    style={{
                      backgroundColor: `${currentArchInfo.colorHex}33`,
                      color: currentArchInfo.colorHex,
                    }}
                  >
                    {currentArchInfo.title}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentArchInfo.description}
                </p>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
              <Info className="w-3.5 h-3.5 text-pink-400" />
              <span>Contact inflicts 1 of 6 persistent debuffs that last until game over.</span>
            </div>
          </div>

          {/* Search Bar for Debuffs */}
          <div className="flex items-center justify-between gap-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Unique Archetype Debuffs ({debuffs.length})
            </h4>
            <div className="relative w-48 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search debuff effects..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          {/* Debuff Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredDebuffs.map((d, idx) => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/90 hover:border-pink-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-lg hover:shadow-pink-500/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] font-mono font-bold">
                        {idx + 1}
                      </span>
                      <h5 className="text-sm font-bold text-white group-hover:text-pink-300 transition">
                        {d.name}
                      </h5>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-pink-300 border border-slate-700">
                      {d.effectType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
                    {d.description}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-slate-800/80 flex items-center gap-1.5 text-[11px] text-slate-400 italic">
                  <span className="text-pink-400 not-italic font-bold">Flavor:</span>
                  <span>"{d.flavor}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Tip: You can also hover over any active debuff badge in the HUD during gameplay!
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-md shadow-pink-500/20"
          >
            CLOSE MANUAL
          </button>
        </div>
      </div>
    </div>
  );
};
