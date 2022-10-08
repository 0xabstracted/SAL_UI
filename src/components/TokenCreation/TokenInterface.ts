import { PublicKey } from "@solana/web3.js";

export interface CreateFungibleTokenArgs{
    decimals: number,
    amount: number,
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

export interface MintNewFungibleTokenArgs{
    oldMint: PublicKey,
    newMint: PublicKey,
    ownerOldMint: PublicKey,
    amountOld: number,
    decimalsOld: number,
    decimalsNew: number,
}

export interface MintFungibleTokenArgs{
    mint: PublicKey,
    amount: number,
    decimals: number,
}