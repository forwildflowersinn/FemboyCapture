import React, { useEffect, useRef } from 'react';
import { GAME_TEXT, type ArchetypeKey } from '../gameText.ts';
import {
  formatTime,
  FlyingSunsetParticle,
  createSunsetParticle,
  updateSunsetParticles,
  type ArchetypeId,
  type ActiveDebuff,
} from '../game/logic.ts';
import { RotateCcw, Home, Trophy, Clock, Target, MapPin, MessageSquareQuote, ShieldAlert } from 'lucide-react';

interface GameOverSunsetProps {
  survivalTime: number;
  bestTime: number;
  defeatedCount: number;
  lastWeaponName: string;
  mapName: string;
  caughtByArchetype: ArchetypeId;
  activeDebuffs: ActiveDebuff[];
  isNewBest: boolean;
  isShiny?: boolean;
  onRestart: () => void;
  onChangeArea: () => void;
  onMainMenu: () => void;
  onOpenManual?: () => void;
}

export const GameOverSunset: React.FC<GameOverSunsetProps> = ({
  survivalTime,
  bestTime,
  defeatedCount,
  lastWeaponName,
  mapName,
  caughtByArchetype,
  activeDebuffs,
  isNewBest,
  isShiny = false,
  onRestart,
  onChangeArea,
  onMainMenu,
  onOpenManual,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<FlyingSunsetParticle[]>([]);
  const spawnTimerRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  const baseMonologue =
    GAME_TEXT.gameOverMonologues[caughtByArchetype as keyof typeof GAME_TEXT.gameOverMonologues] ||
    GAME_TEXT.gameOverMonologues.sheriff;

  const monologueInfo = isShiny
    ? {
        speaker: `Shiny ${baseMonologue.speaker}`,
        title: 'Prismatic One-in-a-Million Archetype',
        monologue: GAME_TEXT.shiny.monologue,
      }
    : baseMonologue;

  const archColor = isShiny
    ? '#facc15'
    : GAME_TEXT.archetypes[caughtByArchetype as ArchetypeKey]?.colorHex || '#f43f5e';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastT = performance.now();

    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial burst of particles from below
    for (let i = 0; i < 12; i++) {
      const p = createSunsetParticle(
        canvas.width,
        canvas.height,
        GAME_TEXT.gameOver.flyingWords,
        GAME_TEXT.gameOver.flyingHeartSymbols
      );
      p.y += i * 25;
      particlesRef.current.push(p);
    }

    const loop = (now: number) => {
      const dt = Math.min((now - lastT) / 1000, 0.05);
      lastT = now;

      const w = canvas.width;
      const h = canvas.height;

      // Sunset gradient
      const sunsetGrad = ctx.createLinearGradient(0, 0, 0, h);
      sunsetGrad.addColorStop(0, '#1e112a');
      sunsetGrad.addColorStop(0.3, '#4a154b');
      sunsetGrad.addColorStop(0.55, '#9d174d');
      sunsetGrad.addColorStop(0.72, '#ea580c');
      sunsetGrad.addColorStop(0.88, '#f59e0b');
      sunsetGrad.addColorStop(1, '#b45309');

      ctx.fillStyle = sunsetGrad;
      ctx.fillRect(0, 0, w, h);

      // Sinking golden sun at horizon
      const sunY = h * 0.76;
      const sunX = w * 0.5;
      const sunGrad = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 140);
      sunGrad.addColorStop(0, '#fffbeb');
      sunGrad.addColorStop(0.2, '#fef08a');
      sunGrad.addColorStop(0.5, 'rgba(251, 146, 60, 0.6)');
      sunGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');

      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 140, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 55, 0, Math.PI * 2);
      ctx.fill();

      // Silhouetted horizon skyline
      ctx.fillStyle = '#0f0a17';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.82);
      ctx.lineTo(w * 0.15, h * 0.8);
      ctx.lineTo(w * 0.35, h * 0.83);
      ctx.lineTo(w * 0.5, h * 0.81);
      ctx.lineTo(w * 0.7, h * 0.84);
      ctx.lineTo(w * 0.88, h * 0.79);
      ctx.lineTo(w, h * 0.82);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Spawn new particles periodically
      spawnTimerRef.current += dt;
      if (spawnTimerRef.current > 0.18 && particlesRef.current.length < 24) {
        spawnTimerRef.current = 0;
        particlesRef.current.push(
          createSunsetParticle(
            w,
            h,
            GAME_TEXT.gameOver.flyingWords,
            GAME_TEXT.gameOver.flyingHeartSymbols
          )
        );
      }

      // Update particle physics
      particlesRef.current = updateSunsetParticles(particlesRef.current, dt, h);

      // Draw flying particles
      for (const p of particlesRef.current) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);
        ctx.globalAlpha = p.opacity;

        if (p.type === 'heart') {
          const s = 14;
          ctx.beginPath();
          ctx.moveTo(0, s * 0.3);
          ctx.bezierCurveTo(-s * 0.5, -s * 0.4, -s * 1.1, s * 0.3, 0, s * 1.1);
          ctx.bezierCurveTo(s * 1.1, s * 0.3, s * 0.5, -s * 0.4, 0, s * 0.3);
          ctx.closePath();

          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          ctx.font = `900 ${p.fontSize}px "Outfit", "Fredoka", sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 4;
          ctx.strokeText(p.text, 0, 0);

          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fillText(p.text, 0, 0);
        }

        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none overflow-y-auto">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
      />

      <div className="relative z-10 w-full max-w-lg my-auto bg-slate-950/90 border border-pink-500/40 rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-md text-center text-white">
        <div className="mb-2">
          {isShiny && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/30 via-pink-500/30 to-purple-500/30 border border-amber-300 text-amber-200 font-black text-xs uppercase tracking-wider mb-2 animate-pulse shadow-lg">
              ★ SHINY CAPTURE! ONE-IN-A-MILLION ★
            </div>
          )}
          {isNewBest && !isShiny && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-bold text-xs uppercase tracking-wider mb-2 animate-bounce">
              <Trophy className="w-3.5 h-3.5" /> New High Score!
            </div>
          )}
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-300 to-amber-300 tracking-tight drop-shadow-md">
            {isShiny ? GAME_TEXT.shiny.gameOverBanner : GAME_TEXT.gameOver.banner}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
            {isShiny
              ? "A radiant prismatic chaser captured you instantly!"
              : GAME_TEXT.gameOver.subtitle}
          </p>
        </div>

        {/* Character-Specific Lengthy Monologue Card */}
        <div
          className="my-3.5 p-3.5 sm:p-4 rounded-xl text-left border relative overflow-hidden bg-slate-900/80 shadow-lg"
          style={{ borderColor: `${archColor}66` }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: archColor }}
            />
            <span className="font-bold text-sm text-white">{monologueInfo.speaker}</span>
            <span className="text-[11px] font-semibold text-pink-300">({monologueInfo.title})</span>
            <MessageSquareQuote className="w-4 h-4 text-slate-400 ml-auto" />
          </div>
          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed italic">
            "{monologueInfo.monologue}"
          </p>
        </div>

        {/* Permanent Debuffs Incurred */}
        {activeDebuffs.length > 0 && (
          <div className="mb-3 text-left">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              Incurred Contact Debuffs ({activeDebuffs.length}):
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
              {activeDebuffs.map((d) => (
                <span
                  key={d.id}
                  className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/40 text-[10px] text-rose-300 font-medium"
                  title={d.description}
                >
                  {d.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 my-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-medium flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-pink-400" /> {GAME_TEXT.gameOver.timeSurvivedLabel}
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-pink-300 tabular-nums">
              {formatTime(survivalTime)}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2.5 flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-medium flex items-center gap-1 mb-0.5">
              <Trophy className="w-3 h-3 text-amber-400" /> {GAME_TEXT.gameOver.personalBestLabel}
            </span>
            <span className="text-xl sm:text-2xl font-black font-mono text-amber-300 tabular-nums">
              {formatTime(bestTime)}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-medium flex items-center gap-1">
              <Target className="w-3 h-3 text-emerald-400" /> {GAME_TEXT.gameOver.chasersRepelledLabel}
            </span>
            <span className="text-base font-bold font-mono text-emerald-300">
              {defeatedCount}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] uppercase text-slate-400 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3 text-sky-400" /> {GAME_TEXT.gameOver.environmentLabel}
            </span>
            <span className="text-xs font-semibold text-sky-300 truncate max-w-[130px]">
              {mapName}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-2">
          <button
            data-start="true"
            onClick={onRestart}
            className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold text-base shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {GAME_TEXT.gameOver.restartButton}
            <span className="text-xs font-normal opacity-80">(Space / Enter)</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onChangeArea}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-pink-400" />
              {GAME_TEXT.gameOver.changeMapButton}
            </button>

            <button
              onClick={onMainMenu}
              className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              {GAME_TEXT.gameOver.menuButton}
            </button>
          </div>

          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-pink-500/50 text-pink-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              VIEW DEBUFF MANUAL & COMPENDIUM
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
