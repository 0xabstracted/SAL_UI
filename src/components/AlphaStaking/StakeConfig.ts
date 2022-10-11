import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { FarmConfig, FixedRateConfig, MaxCounts } from "../../GrandProgramUtils/gemBank/interface";
import { REWARD_MINT_ALPHA } from "../TokenCreation/AlphaTokenConfig";
import { AuthorizeFunderAlphaArgs, InitFarmAlphaArgs } from "./StakeConfigInterface";
import * as anchor from '@project-serum/anchor'

export const UPDATE_AUTHORITY_ALPHA = new anchor.web3.PublicKey("TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq")

export const farmConfigAlpha:FarmConfig = {
    minStakingPeriodSec: new BN(0),
    cooldownPeriodSec: new BN(0),
    unstakingFeePercent: new BN(5)
}
export const maxCountsAlpha:MaxCounts = {
    maxFarmers: Number(4200),
    maxGems: Number(4200),
    maxRarityPoints: Number(65000)
}

export const  initFarmAlphaHumansArgs: InitFarmAlphaArgs = {
    rewardMintId: REWARD_MINT_ALPHA,  
    farmConfig: farmConfigAlpha, 
    maxCounts: maxCountsAlpha,
    id: "hu",
}
export const  initFarmAlphaHumanPetsArgs: InitFarmAlphaArgs = {
    rewardMintId: REWARD_MINT_ALPHA,  
    farmConfig: farmConfigAlpha, 
    maxCounts: maxCountsAlpha,
    id: "hp",
}
export const  initFarmAlphaCyborgArgs: InitFarmAlphaArgs = {
    rewardMintId: REWARD_MINT_ALPHA,  
    farmConfig: farmConfigAlpha, 
    maxCounts: maxCountsAlpha,
    id: "cy",
}
export const  initFarmAlphaCyborgPetArgs: InitFarmAlphaArgs = {
    rewardMintId: REWARD_MINT_ALPHA,  
    farmConfig: farmConfigAlpha, 
    maxCounts: maxCountsAlpha,
    id: "cp",
}

export const DEFAULT_PUBLIC_KEY =  new PublicKey('abstractedabstractedabstractedabstractedabs');

export const HUMANS_FARM_ID = new PublicKey("6e7HuZnhQWGtsH8pSy32Ap5NEJc9SWLeUff9hAwNEeUW");
export const HUMANPETS_FARM_ID = new PublicKey("F9op6Pf9NJbowmk7oVsfkjfAkofGCNEmai1fL4ftDrTJ");
export const CYBORG_FARM_ID = new PublicKey("AFoJsBkC99Z5DfRXQTG2sB26yTRxh1qPazcmB3wGyAhG");
export const CYBORGPET_FARM_ID = new PublicKey("21xq97XydC5gSLhQwySJ3oQbqK8eNfL1sZc1i6kfE1ob");

export const FUNDER_HUMANS_FARM = new PublicKey('TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq');
export const FUNDER_HUMANPETS_FARM = new PublicKey('TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq');
export const FUNDER_CYBORG_FARM = new PublicKey('TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq');
export const FUNDER_CYBORGPET_FARM = new PublicKey('TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq');

export const authorizeFunderAlphaHumansArgs: AuthorizeFunderAlphaArgs = {
    farmId: HUMANS_FARM_ID,
    funderToAuthorize: FUNDER_HUMANS_FARM,
    id: "hu",
}
export const authorizeFunderAlphaHumanPetsArgs: AuthorizeFunderAlphaArgs = {
    farmId: HUMANPETS_FARM_ID,
    funderToAuthorize: FUNDER_HUMANPETS_FARM,
    id: "hp",
}
export const authorizeFunderAlphaCyborgArgs: AuthorizeFunderAlphaArgs = {
    farmId: CYBORG_FARM_ID,
    funderToAuthorize: FUNDER_CYBORG_FARM,
    id: "cy",
}
export const authorizeFunderAlphaCyborgPetArgs: AuthorizeFunderAlphaArgs = {
    farmId: CYBORGPET_FARM_ID,
    funderToAuthorize: FUNDER_CYBORGPET_FARM,
    id: "cp",
}
const fixedrateConfigHumans: FixedRateConfig = {
    schedule: {
        baseRate: new BN(5),
        tier1: null,
        tier2:null,
        tier3:null,
        denominator: new BN(86400)
    },
    amount: new BN(1e14),
    durationSec: new BN(8640000),
};
const fixedrateConfigHumanPets: FixedRateConfig = {
    schedule: {
        baseRate: new BN(10),
        tier1: null,
        tier2:null,
        tier3:null,
        denominator: new BN(86400)
    },
    amount: new BN(1e14),
    durationSec: new BN(8640000),
};
const fixedrateConfigCyborg: FixedRateConfig = {
    schedule: {
        baseRate: new BN(15),
        tier1: null,
        tier2:null,
        tier3:null,
        denominator: new BN(86400)
    },
    amount: new BN(1e14),
    durationSec: new BN(8640000),
};
const fixedrateConfigCyborgPet: FixedRateConfig = {
    schedule: {
        baseRate: new BN(20),
        tier1: null,
        tier2:null,
        tier3:null,
        denominator: new BN(86400)
    },
    amount: new BN(1e14),
    durationSec: new BN(8640000),
};

export const fundRewardAlphaHumansArgs = {
    farmId: HUMANS_FARM_ID, 
    rewardMintId: REWARD_MINT_ALPHA, 
    fixedrateConfig: fixedrateConfigHumans,
    id: "hu",
}
export const fundRewardAlphaHumanPetsArgs = {
    farmId: HUMANPETS_FARM_ID, 
    rewardMintId: REWARD_MINT_ALPHA, 
    fixedrateConfig: fixedrateConfigHumanPets,
    id: "hp",
}
export const fundRewardAlphaCyborgArgs = {
    farmId: CYBORG_FARM_ID, 
    rewardMintId: REWARD_MINT_ALPHA, 
    fixedrateConfig: fixedrateConfigCyborg,
    id: "cy",
}
export const fundRewardAlphaCyborgPetArgs = {
    farmId: CYBORGPET_FARM_ID, 
    rewardMintId: REWARD_MINT_ALPHA, 
    fixedrateConfig: fixedrateConfigCyborgPet,
    id: "cp",
}

// export const HUMANS_BANK_ID = new PublicKey("hmbBXqzpzWdoav1ZM8kzo5fWX1hPHyPn4rSfhtrK7tc");
// export const HUMANPETS_BANK_ID = new PublicKey("hpbVSBmjHQM8Vc6rw45D7mmXVqVLw6cESwiyS4EbHKc");
// export const CYBORG_BANK_ID = new PublicKey("cbbw1rkEunwCjDFrq7eREd95nXnyg86MF5d7VdkDxrz");
// export const CYBORGPET_BANK_ID = new PublicKey("cpb7PdXZGpLiJj9xoCJun9GmwtV9PEBfbSzdNJ8wdTq");

// export const HUMANS_FARM_KP = web3.Keypair.fromSeed(Uint8Array.from([7,160,93,38,69,200,112,237,188,127,135,155,181,247,229,71,133,35,249,255,155,229,83,123,21,17,12,187,98,86,213,191,10,122,231,11,249,99,239,204,106,210,142,82,78,113,185,238,52,64,217,226,214,86,42,129,132,139,225,104,255,71,191,12].slice(0,32)));
// export const HUMANPETS_FARM_KP = web3.Keypair.fromSeed(Uint8Array.from([73,133,165,77,33,48,30,227,205,44,237,59,152,139,18,105,47,203,245,37,2,57,62,63,135,162,165,142,173,147,249,17,10,122,243,180,88,78,94,66,154,177,139,95,90,170,43,34,47,205,118,131,31,252,94,54,128,16,248,105,228,109,117,22].slice(0,32)));
// export const CYBORG_FARM_KP = web3.Keypair.fromSeed(Uint8Array.from([126,50,119,188,12,138,159,167,56,52,166,214,161,160,165,234,119,211,72,160,58,157,219,211,74,159,249,223,62,107,164,210,9,55,83,18,55,134,87,104,132,238,54,27,246,112,219,31,29,93,211,146,182,153,210,34,15,232,149,237,113,125,143,148].slice(0,32)));
// export const CYBORGPET_FARM_KP = web3.Keypair.fromSeed(Uint8Array.from([103,124,104,110,181,214,89,41,187,138,31,38,7,183,162,8,154,206,192,34,16,100,223,28,46,175,6,22,133,146,214,120,9,55,148,209,170,71,165,232,96,223,159,159,65,127,217,55,110,219,245,72,23,223,205,97,74,200,46,14,75,55,195,65].slice(0,32)));
// export const HUMANS_BANK_KP = web3.Keypair.fromSeed(Uint8Array.from([199,16,102,93,12,143,69,250,221,76,190,123,29,49,169,114,72,101,126,37,19,210,59,130,2,175,173,41,187,65,42,86,10,113,166,81,240,138,247,17,241,47,64,235,239,43,178,45,81,222,125,62,79,255,84,211,195,46,5,255,228,65,112,73].slice(0,32)));
// export const HUMANPETS_BANK_KP = web3.Keypair.fromSeed(Uint8Array.from([219,123,181,177,27,216,170,182,228,148,209,244,100,64,37,193,213,251,208,216,11,133,14,22,38,7,175,199,35,16,224,249,10,117,12,61,170,162,19,193,230,171,38,23,192,65,154,107,163,188,250,96,56,28,231,57,144,10,223,97,120,237,99,183].slice(0,32)));
// export const CYBORG_BANK_KP = web3.Keypair.fromSeed(Uint8Array.from([215,178,22,206,23,231,168,114,171,184,38,252,51,89,226,179,108,78,55,226,221,170,94,91,190,96,12,5,168,245,214,163,9,30,116,6,88,110,155,158,68,218,255,177,251,125,27,56,251,88,133,95,74,163,23,75,84,40,198,12,238,145,118,31].slice(0,32)));
// export const CYBORGPET_BANK_KP = web3.Keypair.fromSeed(Uint8Array.from([167,156,75,139,55,97,141,232,152,255,28,144,12,91,84,66,166,240,222,221,20,99,112,144,184,222,34,127,202,240,242,73,9,45,34,232,144,145,187,189,120,14,130,32,97,174,208,106,49,53,23,197,171,69,228,62,180,207,135,144,158,119,198,228].slice(0,32)));
