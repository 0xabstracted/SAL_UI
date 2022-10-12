import { PublicKey } from "@solana/web3.js";

import * as anchor from '@project-serum/anchor'

export interface CreateFungibleTokenArgs{
    decimals: number,
    amount: number,
    pot_transfer_amount: anchor.BN,
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
    oldMint: PublicKey,
    newMint: PublicKey,
    ownerOldMint: PublicKey,
    decimalsOld: number,
}
