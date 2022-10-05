import { BN } from "@project-serum/anchor";

import { PublicKey } from "@solana/web3.js";

export interface FarmConfig {
    minStakingPeriodSec: BN;
    cooldownPeriodSec: BN;
    unstakingFeePercent: BN;
}
export const RewardType = {
    Probable: { probable: {} },
    Fixed: { fixed: {} },
  };
  
export interface MaxCounts {
    maxFarmers: number;
    maxGems: number;
    maxRarityPoints: number;
}
  

export interface TierConfig {
    rewardRate: BN;
    requiredTenure: BN;
}
  
export interface FixedRateScheduleStake {
    baseRate: BN;
    tier1: TierConfig | null;
    tier2: TierConfig | null;
    tier3: TierConfig | null;
    denominator: BN;
}
  
export interface FixedRateConfig {
    schedule: FixedRateScheduleStake;
    amount: BN;
    durationSec: BN;
}
  
export interface RarityConfig {
    mint: PublicKey;
    rarityPoints: BN;
}
