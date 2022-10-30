import { BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

// import * as anchor from '@project-serum/anchor'

export interface CreateFungibleTokenArgs{
    decimals: number,
    amount: number,
    name: string,
    symbol: string,
    uri: string,
    isMutable: boolean,
}
export interface CreateSwapRegistryArgs {
    rateTokenIn: BN,
    rateTokenOut: BN,
    mintTokenIn: PublicKey,
    mintTokenOut: PublicKey,
}
export interface CreateTokenMetadataArgs {
    mint : PublicKey,
    name: string,
    symbol: string,
    uri: string,
    isMutable: boolean,
}
export interface UpdateTokenMetadataArgs{
    mint : PublicKey,
    name: string,
    symbol: string,
    uri: string,
    isMutable: boolean,
    primarySaleHappened: boolean,
}

export interface AlphaTokenSwapArgs{
    mintTokenIn: PublicKey,
    mintTokenOut: PublicKey,
    decimalsTokenIn: number,
}

export interface TransferOutTokensToPotArgs{
    mintTokenIn: PublicKey,
    mintTokenOut: PublicKey,
    amount: number,
    decimalsTokenOut: number,
}
