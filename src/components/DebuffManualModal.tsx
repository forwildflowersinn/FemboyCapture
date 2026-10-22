import React, { useState, useEffect, useRef } from 'react';
import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';
import { type ArchetypeId } from '../game/logic.ts';
import { drawEnemyModelPreview } from '../game/renderer.ts';
import { ShieldAlert, X, Sparkles, BookOpen, Search, Info, Eye, Crown, Zap } from 'lucide-react';

interface DebuffManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialArchetype?: string;
}

const MODEL_VISUAL_NOTES: Record<string, string[]> = {
  officer: [
    'Peaked navy police cap with gold badge',
    'Tailored uniform jacket, tie & utility handcuffs',
    'Electric blue stun dart taser sidearm',
  ],
  delinquent: [
    'Draped black sukeban gakuran coat & red scarf',
    'Ankle-length crimson pleated skirt & sarashi wrap',
    'Nail-studded oak bat (cracks & snaps under fire)',
  ],
  tomboy: [
    'High crimson-auburn ponytail with white ribbon',
    'Cropped red varsity track jacket & pleated skort',
    'Knee-high striped socks & varsity volleyball',
  ],
  goth: [
    'Jet-black floor-length twin-tails & rose headdress',
    'Tiered Victorian bell dress with white lace trim',
    'Occult grimoire & telegraphed blink sigil at destination',
  ],
  hacker: [
    'Oversized charcoal RGB hoodie & glowing cat-ear headset',
    'Sleepy-smug coder glasses & striped programmer thigh-highs',
    'Terminal laptop rigs weapon & care drops (persists unless Shiny)',
  ],
  senpai: [
    'Sleek silver-lavender high bun & red glasses',
    'Executive vest, crimson silk tie & pencil skirt',
    'Performance clipboard & steaming espresso mug',
  ],
  yandere: [
    'Sakura-pink twin-tails with crimson ribbons',
    'Classic navy serafuku sailor uniform & red scarf',
    'Glowing heart pupils & gleaming kitchen knife',
  ],
  trainer: [
    'Honey-blonde braided ponytail & K-9 sun visor cap',
    'Cropped amber agility vest, whistle & treat pouch',
    'Extended-lead hound Rex (88px patrol / 124px lunge)',
  ],
};

const SHINY_ABILITY_NOTES: Record<string, string> = {
  officer: 'Shiny Elite: Fires ultra-fast long-range sniper rounds that electrocute & daze you in place until she arrives for a 3.5s on-the-spot heart capture (3 DMG).',
  delinquent: 'Shiny Elite: Deflected bat ricochets hit with concussive force, stunning & dazing you until she arrives for a 3.5s on-the-spot heart capture (3 DMG).',
  tomboy: 'Shiny Elite: Visibly weaves to dodge 50% of bullets and always launches a high-speed tackle that sends you flying & knocked out until she arrives.',
  goth: 'Shiny Elite: Never walks—teleports erratically via dark destination sigils, then triggers a jumpscare & giggle up close before slowly approaching.',
  hacker: 'Shiny Elite: Sabotaged weapons & care drops stun and prompt her to sprint straight over; defeating her cleanses her rigged items (normal Hacker sabotage persists!).',
  senpai: 'Shiny Elite: Spilled coffee puddles cause a cartoon slip-and-fall knockdown, keeping you dazed on the floor until she comes over to catch you.',
  yandere: 'Shiny Elite: Stalks from afar; if ANY other woman harms you, she enters an impervious, high-speed jealous rage charge straight at you!',
  trainer: 'Shiny Elite: Unleashed large hound rushes independently to pin you from any angle until Maya arrives. Shoot the hound to knock it out temporarily!',
};

export const DebuffManualModal: React.FC<DebuffManualModalProps> = ({
  isOpen,
  onClose,
  initialArchetype = 'officer',
}) => {
  const [selectedArch, setSelectedArch] = useState<string>(
    initialArchetype === 'gyaru' ? 'hacker' : (initialArchetype || 'officer')
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [previewMode, setPreviewMode] = useState<'standard' | 'shiny' | 'immortal'>('standard');
  const [isActionPose, setIsActionPose] = useState<boolean>(true);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const archetypesList = Object.keys(GAME_TEXT.archetypes) as ArchetypeKey[];
  const currentArchKey = ((selectedArch === 'gyaru' ? 'hacker' : selectedArch) as ArchetypeKey) || 'officer';
  const currentArchInfo = GAME_TEXT.archetypes[currentArchKey] || GAME_TEXT.archetypes.officer;
  const debuffs = GAME_TEXT.archetypeDebuffs[currentArchKey] || [];
  const visualNotes = MODEL_VISUAL_NOTES[currentArchKey] || [];

  useEffect(() => {
    if (!isOpen) return;
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const startT = performance.now();

    const renderLoop = (now: number) => {
      const elapsed = (now - startT) / 1000;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const logicalW = 240;
      const logicalH = 220;
      if (canvas.width !== logicalW * dpr || canvas.height !== logicalH * dpr) {
        canvas.width = logicalW * dpr;
        canvas.height = logicalH * dpr;
      }
      ctx.save();
      ctx.scale(dpr, dpr);
      drawEnemyModelPreview(
        ctx,
        currentArchKey as ArchetypeId,
        logicalW,
        logicalH,
        elapsed,
        {
          isShiny: previewMode === 'shiny',
          isHauntingWinner: previewMode === 'immortal',
          isActionPose,
          zoom: currentArchKey === 'trainer' ? 2.15 : 2.4,
        }
      );
      ctx.restore();
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, currentArchKey, previewMode, isActionPose]);

  if (!isOpen) return null;

  const filteredDebuffs = debuffs.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.flavor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[92vh] bg-slate-900 border border-pink-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide font-['Outfit'] flex items-center gap-2">
                PURSUER MODEL & DEBUFF COMPENDIUM
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold font-mono">
                  {archetypesList.length} ARCHETYPES · LIVE MODEL VIEWER
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Inspect each pursuer’s animated character model, signature gear, and 6 persistent contact debuffs.
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

        {/* Shiny Mini-Boss Banner */}
        <div className="px-6 py-2 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="font-bold tracking-wide">
              ★ LIVE CHARACTER SHOWCASE:
            </span>
            <span className="text-amber-100/90 hidden sm:inline">
              Toggle between Standard, Shiny Golden Elite, and Immortal Haunting Victor states in the model viewer below!
            </span>
          </div>
        </div>

        {/* Archetype Selector Tabs */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-thin">
          {archetypesList.map((key) => {
            const arch = GAME_TEXT.archetypes[key];
            const isSelected = currentArchKey === key;
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
                {arch.name}
              </button>
            );
          })}
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Top Showcase Grid: Live Enemy Model Canvas + Bio & Equipment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Left: Interactive Live 2D Character Model Showcase */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-950/90 border border-slate-800 p-4 flex flex-col items-center justify-between relative overflow-hidden shadow-inner">
              <div className="w-full flex items-center justify-between z-10 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-pink-400" />
                  LIVE 60FPS MODEL
                </span>
                <button
                  onClick={() => setIsActionPose((p) => !p)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                    isActionPose
                      ? 'bg-pink-500/20 border-pink-500/50 text-pink-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3 h-3" />
                  {isActionPose ? 'Action Pose: ON' : 'Idle Pose'}
                </button>
              </div>

              <canvas
                ref={previewCanvasRef}
                style={{ width: '240px', height: '220px' }}
                className="my-1 select-none pointer-events-none"
              />

              {/* Appearance Mode Toggles */}
              <div className="w-full grid grid-cols-3 gap-1.5 z-10 mt-1">
                <button
                  onClick={() => setPreviewMode('standard')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer ${
                    previewMode === 'standard'
                      ? 'bg-slate-800 text-white border-pink-400/70 shadow-sm'
                      : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  Standard
                </button>
                <button
                  onClick={() => setPreviewMode('shiny')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer flex items-center justify-center gap-1 ${
                    previewMode === 'shiny'
                      ? 'bg-amber-500/25 text-amber-200 border-amber-400/80 shadow-sm'
                      : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-amber-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Shiny
                </button>
                <button
                  onClick={() => setPreviewMode('immortal')}
                  className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition cursor-pointer flex items-center justify-center gap-1 ${
                    previewMode === 'immortal'
                      ? 'bg-rose-500/25 text-rose-200 border-rose-400/80 shadow-sm'
                      : 'bg-slate-900/70 text-slate-400 border-slate-800 hover:text-rose-200'
                  }`}
                >
                  <Crown className="w-3 h-3 text-rose-400" />
                  Victor
                </button>
              </div>
            </div>

            {/* Right: Active Archetype Bio, Signature Details & Callout Preview */}
            <div
              className="lg:col-span-7 p-5 rounded-2xl border flex flex-col justify-between gap-4"
              style={{
                backgroundColor: `${currentArchInfo.colorHex}12`,
                borderColor: `${currentArchInfo.colorHex}44`,
              }}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-lg shadow-inner border"
                      style={{
                        backgroundColor: `${currentArchInfo.colorHex}30`,
                        borderColor: currentArchInfo.colorHex,
                        color: currentArchInfo.colorHex,
                      }}
                    >
                      {currentArchInfo.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-white font-['Outfit']">
                          {currentArchInfo.name}
                        </h3>
                        <span
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded uppercase font-mono"
                          style={{
                            backgroundColor: `${currentArchInfo.colorHex}33`,
                            color: currentArchInfo.colorHex,
                          }}
                        >
                          {currentArchInfo.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1 leading-relaxed">
                        {currentArchInfo.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Visual Features List */}
                <div className="bg-slate-950/65 border border-slate-800/90 rounded-xl p-3.5 space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-pink-300 font-bold">
                    CHARACTER MODEL & SIGNATURE GEAR
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {visualNotes.map((note, idx) => (
                      <div
                        key={idx}
                        className="text-[11px] text-slate-300 bg-slate-900/90 border border-slate-800/80 rounded-lg p-2 leading-snug"
                      >
                        <span
                          className="font-bold mr-1"
                          style={{ color: currentArchInfo.colorHex }}
                        >
                          •
                        </span>
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Signature Quote & Haunting Counterplay Info */}
              <div className="space-y-2">
                <div className="text-xs italic text-pink-200/90 bg-slate-950/60 px-3.5 py-2 rounded-lg border border-pink-500/20">
                  “{previewMode === 'immortal' && currentArchInfo.hauntCallouts?.[0]
                    ? currentArchInfo.hauntCallouts[0]
                    : currentArchInfo.victoryQuote}”
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
                  <Info className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span>
                    {previewMode === 'immortal'
                      ? 'Immortal Victor Mode: Impervious to HP damage after claiming your Extra Life, but CAN be knocked back and staggered by gunfire!'
                      : previewMode === 'shiny'
                      ? SHINY_ABILITY_NOTES[currentArchKey]
                      : `${SHINY_ABILITY_NOTES[currentArchKey]}`}
                  </span>
                </div>
              </div>
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

