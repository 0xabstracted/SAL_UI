import { PublicKey } from "@solana/web3.js"
import { FarmConfig, FixedRateConfig, MaxCounts } from "../../GrandProgramUtils/gemBank/interface";

export interface InitFarmAlphaArgs{
    rewardMintId: PublicKey,  
    farmConfig: FarmConfig, 
    maxCounts: MaxCounts,
    id: String,
}
export interface AuthorizeFunderAlphaArgs{
    farmId: PublicKey, 
    funderToAuthorize: PublicKey,
    id: String,
}
export interface FundRewardAlphaArgs{
    farmId: PublicKey, 
    rewardMintId: PublicKey, 
    fixedrateConfig: FixedRateConfig,
    id: String,
}