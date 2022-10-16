import { CreateFungibleTokenArgs, AlphaTokenSwapArgs, UpdateTokenMetadataArgs, CreateSwapRegistryArgs, TransferOutTokensToPotArgs } from "./TokenInterface";
import * as anchor from '@project-serum/anchor';
import { BN } from "@project-serum/anchor";
export const REWARD_MINT_GLITCH = new anchor.web3.PublicKey('4Tg6mZJSgyDc8BoJkZpJX5XrBCaLg6VUrnmvJmbEwqmV');
export const REWARD_MINT_GLITCH_MAINNET = new anchor.web3.PublicKey('GLTChgv7uPRGoRpuQcW7B9tYSUmQmLzeWTjxF4FoEVbY');
export const REWARD_MINT_GLTCH = new anchor.web3.PublicKey('9oFGYpdL1LhbvJjrw9n2imSBfc1gfs8F4SWjucKcfk57');
export const REWARD_MINT_GLTCH_MAINET = new anchor.web3.PublicKey('3tL5Ho7gLUW21VmXaH8hBXCFEPies4VDWKFkchfAD1La');
export const ALPHA_OWNER_ATA = new anchor.web3.PublicKey('7HL9xo4rA48cR6CYsxZ4dzJa3zt3FZgGGUaB26JRWwrS');

export const glitchFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount: 1e17,
    name: "GLITCHC",
    symbol: "GLITCHC",
    uri: "https://arweave.net/J8YZfcgaMi3oTMyXWsTKelIaD8g2-RGT4cu0TKeYWfQ",
    isMutable: true,
}

export const glthFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount:  1e17,
    name: "GLTCHC",
    symbol: "GLTCHC",
    uri: "https://arweave.net/wFymyPGgPW2EVggMfjTwJEWN-j5Ye6tchV8MQGEDvy0",
    isMutable: true,
}

export const createSwapRegistryAlphaArgs : CreateSwapRegistryArgs = {
    rateTokenIn: new BN(1),
    rateTokenOut: new BN(1),
    mintTokenIn: REWARD_MINT_GLITCH,
    mintTokenOut: REWARD_MINT_GLTCH,
}

export const updateGlitchFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: REWARD_MINT_GLITCH,
    name: "GLITCHBB",
    symbol: "GLITCHBB",
    uri: "https://arweave.net/J8YZfcgaMi3oTMyXWsTKelIaD8g2-RGT4cu0TKeYWfQ",
    isMutable: true,
    primarySaleHappened: true
}

export const updateAlphaFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: REWARD_MINT_GLTCH,
    name: "GLTCHBB",
    symbol: "GLTCHBB",
    uri: "https://arweave.net/wFymyPGgPW2EVggMfjTwJEWN-j5Ye6tchV8MQGEDvy0",
    isMutable: true,
    primarySaleHappened: true
}

export const mintNewFungibleTokenArgs : AlphaTokenSwapArgs = {
    mintTokenIn: REWARD_MINT_GLITCH,
    mintTokenOut: REWARD_MINT_GLTCH,
    decimalsTokenIn: 9,
}   

export const mintNewFungibleTokenMainetArgs : AlphaTokenSwapArgs = {
    mintTokenIn: REWARD_MINT_GLITCH_MAINNET,
    mintTokenOut: REWARD_MINT_GLTCH_MAINET,
    decimalsTokenIn: 9,
}   

export const transferOutTokensToPotOwnerArgs : TransferOutTokensToPotArgs = {
    mintTokenIn: REWARD_MINT_GLITCH,
    mintTokenOut: REWARD_MINT_GLTCH,
    amount: 1e16,
    decimalsTokenOut: 9,
}