import { CreateFungibleTokenArgs, AlphaTokenSwapArgs, UpdateTokenMetadataArgs } from "./TokenInterface";
import * as anchor from '@project-serum/anchor';
export const REWARD_MINT_GLITCH = new anchor.web3.PublicKey('6Vq11ujh2dwrsD4rKF131dY7EgfejEd9A3gTt4ChWPeu');
export const REWARD_MINT_GLTCH = new anchor.web3.PublicKey('3tL5Ho7gLUW21VmXaH8hBXCFEPies4VDWKFkchfAD1La');
export const ALPHA_OWNER_ATA = new anchor.web3.PublicKey('7HL9xo4rA48cR6CYsxZ4dzJa3zt3FZgGGUaB26JRWwrS');

export const glitchFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount: 1e17,
    pot_transfer_amount: new anchor.BN(0),
    name: "GLITCHZ",
    symbol: "GLITCHZ",
    uri: "https://arweave.net/J8YZfcgaMi3oTMyXWsTKelIaD8g2-RGT4cu0TKeYWfQ",
    isMutable: true,
}

export const glthFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount: 1e17,
    pot_transfer_amount: new anchor.BN(1e15),
    name: "GLTCHZ",
    symbol: "GLTCHZ",
    uri: "https://arweave.net/wFymyPGgPW2EVggMfjTwJEWN-j5Ye6tchV8MQGEDvy0",
    isMutable: true,
}

export const updateGlitchFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: REWARD_MINT_GLITCH,
    name: "GLITCHZZ",
    symbol: "GLITCHZZ",
    uri: "https://arweave.net/J8YZfcgaMi3oTMyXWsTKelIaD8g2-RGT4cu0TKeYWfQ",
    isMutable: true,
    primarySaleHappened: true
}

export const updateAlphaFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: REWARD_MINT_GLTCH,
    name: "GLTCHZZ",
    symbol: "GLTCHZZ",
    uri: "https://arweave.net/wFymyPGgPW2EVggMfjTwJEWN-j5Ye6tchV8MQGEDvy0",
    isMutable: true,
    primarySaleHappened: true
}

export const mintNewFungibleTokenArgs : AlphaTokenSwapArgs = {
    oldMint: REWARD_MINT_GLITCH,
    newMint: REWARD_MINT_GLTCH,
    ownerOldMint: new anchor.web3.PublicKey("TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq"),
    decimalsOld: 9,
}   
