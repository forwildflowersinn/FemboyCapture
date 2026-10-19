import React, { useEffect } from 'react';
import { GAME_TEXT } from '../gameText.ts';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenManual?: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  isMuted,
  onToggleMute,
  onOpenManual,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onResume]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center text-white">
        <h2 className="text-2xl font-black tracking-tight text-pink-400 mb-6 font-['Outfit']">
          {GAME_TEXT.pause.title}
        </h2>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-400 hover:to-rose-400 font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            {GAME_TEXT.pause.resumeButton}
            <span className="text-xs opacity-70">(Esc / P)</span>
          </button>

          {onOpenManual && (
            <button
              onClick={onOpenManual}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sm text-pink-300 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>DEBUFF MANUAL</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            {GAME_TEXT.pause.restartButton}
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            {GAME_TEXT.pause.mainMenuButton}
          </button>

          <div className="pt-2 border-t border-slate-800 mt-2 flex justify-center">
            <button
              onClick={onToggleMute}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-2 cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              {isMuted ? 'Unmute Sound' : 'Mute Sound'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
