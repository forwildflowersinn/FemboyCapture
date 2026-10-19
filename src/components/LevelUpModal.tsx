import React from 'react';
import { type EnemyUpgrade, getCharmPerkForLevel } from '../game/logic.ts';
import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';
import { Heart, Sparkles, Shield, Flame, Zap, Eye, Bell, Moon, Sun } from 'lucide-react';

interface LevelUpModalProps {
  currentLevel: number;
  upgrades: EnemyUpgrade[];
  onSelectUpgrade: (upgrade: EnemyUpgrade) => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  currentLevel,
  upgrades,
  onSelectUpgrade,
}) => {
  const charmPerk = getCharmPerkForLevel(currentLevel);

  const getArchetypeColor = (archKey: string): string => {
    return GAME_TEXT.archetypes[archKey as ArchetypeKey]?.colorHex || '#f43f5e';
  };

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Shield':
      case 'ShieldAlert':
        return <Shield className="w-5 h-5" />;
      case 'Flame':
        return <Flame className="w-5 h-5 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'Eye':
      case 'EyeOff':
        return <Eye className="w-5 h-5 text-sky-400" />;
      case 'Bell':
        return <Bell className="w-5 h-5 text-blue-400" />;
      case 'Moon':
      case 'CloudRain':
        return <Moon className="w-5 h-5 text-purple-400" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-300" />;
      default:
        return <Sparkles className="w-5 h-5 text-pink-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border-2 border-pink-500/60 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-white overflow-hidden">
        {/* Decorative Top Accent Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent blur-sm" />

        {/* Modal Header */}
        <div className="text-center flex flex-col items-center gap-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
            <span>FASCINATION SURGE · LEVEL {currentLevel}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1">
            THEY ADORE YOU EVEN MORE...
          </h2>

          <div className="text-sm text-pink-200/90 font-medium max-w-md">
            Your look has evolved:{' '}
            <strong className="text-pink-400">{charmPerk.title}</strong>
            <span className="text-slate-400 block text-xs mt-0.5">({charmPerk.accessory})</span>
          </div>

          <p className="text-xs text-slate-300 mt-1">
            Choose which pursuer gains a formidable power-up fueled by their desire for you:
          </p>
        </div>

        {/* Upgrade Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {upgrades.map((upgrade) => {
            const archColor = getArchetypeColor(upgrade.archetype);
            const archData = GAME_TEXT.archetypes[upgrade.archetype as ArchetypeKey];

            return (
              <button
                key={upgrade.id}
                onClick={() => onSelectUpgrade(upgrade)}
                className="group relative flex flex-col justify-between text-left p-4 rounded-xl bg-slate-950/90 hover:bg-slate-900 border border-slate-800 hover:border-pink-500 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl cursor-pointer"
                style={{
                  borderTopColor: archColor,
                  borderTopWidth: '3px',
                }}
              >
                <div>
                  {/* Archetype & Icon Badge */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${archColor}22`,
                        color: archColor,
                      }}
                    >
                      {archData?.name || upgrade.archetype}
                    </span>
                    <div className="p-1.5 rounded-lg bg-slate-800/80 group-hover:bg-slate-700/80 transition">
                      {getIcon(upgrade.icon)}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-pink-300 transition-colors leading-tight mb-2">
                    {upgrade.title}
                  </h3>

                  {/* Desire Note */}
                  <div className="text-[11px] text-pink-300/80 italic leading-snug mb-3">
                    &ldquo;{upgrade.desireNote}&rdquo;
                  </div>
                </div>

                {/* Mechanical Effect Box */}
                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-medium leading-relaxed">
                  <span className="text-amber-400 font-semibold block mb-0.5">Evolution:</span>
                  {upgrade.effectDescription}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500">
          Select an upgrade to empower their pursuit and resume survival.
        </div>
      </div>
    </div>
  );
};
