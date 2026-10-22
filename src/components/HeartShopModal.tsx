import React, { useState, useEffect } from 'react';
import {
  Heart,
  Sparkles,
  Crosshair,
  ShieldAlert,
  PlusCircle,
  X,
  Package,
  Wrench,
  Activity,
  Zap,
} from 'lucide-react';
import {
  WEAPON_DEFS,
  SUPPORT_ITEM_META,
  getWeaponUpgradeCost,
  getSupportUpgradeCost,
  getFullHealServiceCost,
  getPurgeDebuffServiceCost,
  type HeartShopState,
  type SupportItemType,
  type ActiveDebuff,
} from '../game/logic.ts';

interface HeartShopModalProps {
  heartCurrency: number;
  shopState: HeartShopState;
  playerHp: number;
  playerMaxHp: number;
  activeDebuffs: ActiveDebuff[];
  onBuyWeaponUpgrade: (weaponKey: string) => void;
  onBuySupportUpgrade: (itemType: SupportItemType) => void;
  onBuyFullHeal: () => void;
  onBuyPurgeDebuff: () => void;
  onClose: () => void;
  isFreeShopMode?: boolean;
}

export const HeartShopModal: React.FC<HeartShopModalProps> = ({
  heartCurrency,
  shopState,
  playerHp,
  playerMaxHp,
  activeDebuffs,
  onBuyWeaponUpgrade,
  onBuySupportUpgrade,
  onBuyFullHeal,
  onBuyPurgeDebuff,
  onClose,
  isFreeShopMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'weapons' | 'support' | 'services'>('all');
  const [purchaseFeedback, setPurchaseFeedback] = useState<string | null>(null);

  // Close on Escape or Space key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const showFeedback = (text: string) => {
    setPurchaseFeedback(text);
    setTimeout(() => {
      setPurchaseFeedback(null);
    }, 2800);
  };

  const fullHealCost = isFreeShopMode ? 0 : getFullHealServiceCost(shopState.healPurchases);
  const purgeCost = isFreeShopMode ? 0 : getPurgeDebuffServiceCost(shopState.purgePurchases);
  const canAffordHeal = (isFreeShopMode || heartCurrency >= fullHealCost) && playerHp < playerMaxHp;
  const canAffordPurge = (isFreeShopMode || heartCurrency >= purgeCost) && activeDebuffs.length > 0;

  const weaponList = ['dual', 'smg', 'shotgun', 'laser', 'launcher'];
  const supportList: SupportItemType[] = ['heal', 'ammo', 'level_mod', 'heart_up', 'invuln'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900/95 border-2 border-pink-500/70 rounded-2xl shadow-2xl p-4 sm:p-6 flex flex-col gap-4 text-white overflow-hidden my-auto max-h-[92vh]">
        {/* Top Decorative Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent blur-sm" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-300 text-xs font-bold uppercase tracking-wider w-fit">
              <Package className="w-3.5 h-3.5 text-pink-400" />
              <span>BLACK MARKET HEART EXCHANGE</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>UNDERGROUND REQUISITIONS</span>
            </h2>
            <p className="text-xs text-slate-300">
              Spend Hearts collected from defeated pursuers. Unlocks permanently expand the map spawn pool and{' '}
              <strong className="text-amber-300">immediately deliver a free drop</strong> right to you!
            </p>
          </div>

          {/* Heart Currency Counter & Close */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/90 border border-pink-500/60 rounded-xl px-4 py-2 shadow-lg flex items-center gap-2.5">
              <Heart className="w-5 h-5 fill-pink-500 text-pink-400 animate-pulse" />
              <div>
                <div className="text-[9px] font-bold tracking-wider text-pink-400 uppercase">HEARTS AVAILABLE</div>
                <div className="text-xl font-black font-mono text-white tabular-nums tracking-tight">
                  {heartCurrency}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
              title="Close Shop [Esc]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Purchase Notification Banner */}
        {purchaseFeedback && (
          <div className="bg-pink-950/90 border border-pink-500/70 text-pink-200 text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
            <Sparkles className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>{purchaseFeedback}</span>
          </div>
        )}

        {/* Tab Filters */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            All Requisitions
          </button>
          <button
            onClick={() => setActiveTab('weapons')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'weapons'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Weapons Arsenal</span>
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'support'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Support Care Drops</span>
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'services'
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Medical & Debuff Purge</span>
          </button>
        </div>

        {/* Shop Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-5">
          {/* Section 1: Emergency Medical & Purge Services */}
          {(activeTab === 'all' || activeTab === 'services') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-400 tracking-wider">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Emergency Services</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Health Refill */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-black text-rose-300 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 fill-rose-500 text-rose-400" />
                        <span>Full Health Restoration</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Instantly restores all missing HP back to full capacity ({playerHp} / {playerMaxHp} Hearts).
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Service Fee</div>
                      <div className="text-sm font-bold font-mono text-pink-400">{fullHealCost} ♥</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-[11px] text-slate-400">
                      {playerHp >= playerMaxHp
                        ? 'Health is already full'
                        : `Needs ${playerMaxHp - playerHp} Heart(s)`}
                    </span>
                    <button
                      disabled={!canAffordHeal}
                      onClick={() => {
                        onBuyFullHeal();
                        showFeedback(`💖 Full Health Restored! Health capacity filled to ${playerMaxHp} Hearts.`);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        playerHp >= playerMaxHp
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                          : canAffordHeal
                          ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {playerHp >= playerMaxHp ? 'FULL HEALTH' : `RESTORE ALL (${fullHealCost} ♥)`}
                    </button>
                  </div>
                </div>

                {/* Debuff Purge */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between gap-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-black text-purple-300 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-purple-400" />
                        <span>Purify Affliction</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        Permanently cures 1 active debuff inflicted by pursuers.
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Service Fee</div>
                      <div className="text-sm font-bold font-mono text-purple-400">{purgeCost} ♥</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-[11px] text-slate-400">
                      {activeDebuffs.length === 0
                        ? 'No active debuffs'
                        : `${activeDebuffs.length} debuff(s) active`}
                    </span>
                    <button
                      disabled={!canAffordPurge}
                      onClick={() => {
                        onBuyPurgeDebuff();
                        showFeedback('✨ Affliction Purged! Cured 1 permanent debuff.');
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        activeDebuffs.length === 0
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed border border-slate-800'
                          : canAffordPurge
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md'
                          : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {activeDebuffs.length === 0 ? 'CLEAN SLATE' : `PURGE 1 (${purgeCost} ♥)`}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 2: Weapons Arsenal Unlocks & Multi-Tier Upgrades */}
          {(activeTab === 'all' || activeTab === 'weapons') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-400 tracking-wider">
                <Crosshair className="w-4 h-4 text-sky-400" />
                <span>Weapons Arsenal Requisitions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {weaponList.map((wKey) => {
                  const wDef = WEAPON_DEFS[wKey];
                  const currentTier = shopState.weaponTiers[wKey] ?? 0;
                  const isMax = currentTier >= 3;
                  const nextCost = isMax ? 0 : isFreeShopMode ? 0 : getWeaponUpgradeCost(wKey, currentTier);
                  const canAfford = !isMax && (isFreeShopMode || heartCurrency >= nextCost);

                  return (
                    <div
                      key={wKey}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2.5 relative"
                    >
                      {/* Top Weapon Info */}
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-black text-sm"
                            style={{ color: wDef.color }}
                          >
                            {wDef.name}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                              currentTier === 0
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : currentTier === 1
                                ? 'bg-sky-950 text-sky-300 border-sky-700'
                                : currentTier === 2
                                ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                                : 'bg-amber-950 text-amber-300 border-amber-600'
                            }`}
                          >
                            {currentTier === 0 ? 'LOCKED' : `TIER ${currentTier} ${'★'.repeat(currentTier)}`}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {currentTier === 0
                            ? 'Unlocks in map weapon spawn pool + immediate weapon drop right now!'
                            : currentTier === 1
                            ? 'Tier 2: +25% Max Ammo capacity, +15% Damage + 1 immediate free weapon drop!'
                            : currentTier === 2
                            ? 'Tier 3: +50% Max Ammo capacity, +30% Damage + 1 immediate free weapon drop!'
                            : 'Maximum enhancement reached! Maximum damage and overcharged ammo capacity.'}
                        </p>
                      </div>

                      {/* Upgrade / Unlock Button */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isMax ? 'MAXED' : `${nextCost} HEARTS`}
                        </span>
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            onBuyWeaponUpgrade(wKey);
                            showFeedback(
                              `📦 ${wDef.name} ${
                                currentTier === 0 ? 'Unlocked' : `Upgraded to Tier ${currentTier + 1}`
                              }! Free weapon crate dropped beside you!`
                            );
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isMax
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-600/50 cursor-default'
                              : canAfford
                              ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md'
                              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isMax ? 'MAX TIER' : currentTier === 0 ? `UNLOCK (${nextCost} ♥)` : `UPGRADE (${nextCost} ♥)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Support Care Drops Unlocks & Multi-Tier Upgrades */}
          {(activeTab === 'all' || activeTab === 'support') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-400 tracking-wider">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                <span>Support Care Drop Requisitions</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {supportList.map((sKey) => {
                  const sMeta = SUPPORT_ITEM_META[sKey];
                  const currentTier = shopState.supportTiers[sKey] ?? 0;
                  const isMax = currentTier >= 3;
                  const nextCost = isMax ? 0 : isFreeShopMode ? 0 : getSupportUpgradeCost(sKey, currentTier);
                  const canAfford = !isMax && (isFreeShopMode || heartCurrency >= nextCost);

                  return (
                    <div
                      key={sKey}
                      className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex flex-col justify-between gap-2.5 relative"
                    >
                      {/* Top Support Info */}
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className="font-black text-sm"
                            style={{ color: sMeta.color }}
                          >
                            {sMeta.name}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                              currentTier === 0
                                ? 'bg-slate-800 text-slate-400 border-slate-700'
                                : currentTier === 1
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : currentTier === 2
                                ? 'bg-teal-950 text-teal-300 border-teal-700'
                                : 'bg-amber-950 text-amber-300 border-amber-600'
                            }`}
                          >
                            {currentTier === 0 ? 'LOCKED' : `TIER ${currentTier} ${'★'.repeat(currentTier)}`}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                          {currentTier === 0
                            ? 'Unlocks in map care drops pool + delivers 1 immediate care drop right now!'
                            : currentTier === 1
                            ? 'Tier 2: Enhanced effect potency & higher drop weight + 1 free immediate care drop!'
                            : currentTier === 2
                            ? 'Tier 3: Maximum potency & highest care drop weight + 1 free immediate care drop!'
                            : 'Maximum tier! High frequency and maximum potency.'}
                        </p>
                      </div>

                      {/* Upgrade / Unlock Button */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isMax ? 'MAXED' : `${nextCost} HEARTS`}
                        </span>
                        <button
                          disabled={!canAfford}
                          onClick={() => {
                            onBuySupportUpgrade(sKey);
                            showFeedback(
                              `🎁 ${sMeta.name} ${
                                currentTier === 0 ? 'Unlocked' : `Upgraded to Tier ${currentTier + 1}`
                              }! Free care drop delivered beside you!`
                            );
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                            isMax
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-600/50 cursor-default'
                              : canAfford
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                              : 'bg-slate-800/80 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          {isMax ? 'MAX TIER' : currentTier === 0 ? `UNLOCK (${nextCost} ♥)` : `UPGRADE (${nextCost} ♥)`}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 font-mono text-[10px]">ESC</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-pink-300 font-mono text-[10px]">SPACE</kbd> to return to action.
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-500 hover:to-rose-400 text-white font-black text-xs tracking-wider uppercase transition shadow-lg cursor-pointer"
          >
            RETURN TO RUN
          </button>
        </div>
      </div>
    </div>
  );
};
