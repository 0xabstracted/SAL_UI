import { PublicKey } from "@solana/web3.js";

import { MAGIC_STAKE_PROGRAM_ID, GEM_BANK_PROGRAM_ID } from "./getProgramObjects";

export const findFarmAuthorityPDA = async (farm: PublicKey) => {
    return PublicKey.findProgramAddress([farm.toBytes()], MAGIC_STAKE_PROGRAM_ID);
};

// export const findFarmTreasuryPDA = (farm: PublicKey) => {
//     return PublicKey.findProgramAddress(
//         [Buffer.from('treasury'), farm.toBytes()],
//         MAGIC_STAKE_PROGRAM_ID
//     );
// };

export const findRewardsPotPDA = (farm: PublicKey, rewardMint: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('reward_pot'), farm.toBytes(), rewardMint.toBytes()],
        MAGIC_STAKE_PROGRAM_ID
    );
};

export const findFarmTreasuryTokenPDA = (farm: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('token_treasury'), farm.toBytes()],
        MAGIC_STAKE_PROGRAM_ID
    );
};

export const funderToAuthorizePDA = (farm: PublicKey, funder_to_authorize: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('authorization'), farm.toBytes(), funder_to_authorize.toBytes()],
        MAGIC_STAKE_PROGRAM_ID
    );
};

export const farmerPDA = (farm: PublicKey, farmer: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('farmer'), farm.toBytes(), farmer.toBytes()],
        MAGIC_STAKE_PROGRAM_ID
    );
};

export const farmerVaultPDA = (bank: PublicKey, creator: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('vault'), bank.toBytes(), creator.toBytes()],
        GEM_BANK_PROGRAM_ID
    );
};

export const gemBoxPda = (vault: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('gem_box'), vault.toBytes(), gem_mint.toBytes()],
        GEM_BANK_PROGRAM_ID
    );
};

export const gemDepositBoxPda = (vault: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('gem_deposit_receipt'), vault.toBytes(), gem_mint.toBytes()],
        GEM_BANK_PROGRAM_ID
    );
};

export const gemBoxRarityPda = (bank: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('gem_rarity'), bank.toBytes(), gem_mint.toBytes()],
        GEM_BANK_PROGRAM_ID
    );
};

export const vaultAuthorityPda = (valut: PublicKey) => {
    return PublicKey.findProgramAddress(
        [valut.toBytes()],
        GEM_BANK_PROGRAM_ID
    );
};

export const whitelistProofPda = (bank: PublicKey, address_to_whitelist: PublicKey) => {
    return PublicKey.findProgramAddress(
        [Buffer.from('whitelist'),bank.toBytes(), address_to_whitelist.toBytes()],
        GEM_BANK_PROGRAM_ID
    );
};
