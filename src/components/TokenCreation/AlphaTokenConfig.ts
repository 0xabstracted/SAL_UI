import { CreateFungibleTokenArgs, MintFungibleTokenArgs, MintNewFungibleTokenArgs, UpdateTokenMetadataArgs } from "./TokenInterface";
import * as anchor from '@project-serum/anchor'
export const alphaFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount: 1e16,
    name: "GLITCHD",
    symbol: "GLD",
    uri: "https://arweave.net/Na2LKhfjbEGT6zIgXgXPzSI-VsUeyVAlY5FLiShcrhM",
    isMutable: true,
}

export const updateAlphaFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: new anchor.web3.PublicKey("CWWV264XyHW5KJGF4G2RV7LBNaZmzRa5vHqSeDq4AddS"),
    name: "GLITCHDD",
    symbol: "GLDD",
    uri: "https://arweave.net/Na2LKhfjbEGT6zIgXgXPzSI-VsUeyVAlY5FLiShcrhM",
    isMutable: true,
    primarySaleHappened: true
}

export const mintNewFungibleTokenArgs : MintNewFungibleTokenArgs = {
    oldMint: new anchor.web3.PublicKey("CWWV264XyHW5KJGF4G2RV7LBNaZmzRa5vHqSeDq4AddS"),
    newMint: new anchor.web3.PublicKey("CWWV264XyHW5KJGF4G2RV7LBNaZmzRa5vHqSeDq4AddS"),
    ownerOldMint: new anchor.web3.PublicKey("CWWV264XyHW5KJGF4G2RV7LBNaZmzRa5vHqSeDq4AddS"),
    amountOld: 1e14,
    decimalsOld: 9,
    decimalsNew: 9
}   

export const mintFungibleTokenArgs: MintFungibleTokenArgs = {
    mint: new anchor.web3.PublicKey("CWWV264XyHW5KJGF4G2RV7LBNaZmzRa5vHqSeDq4AddS"),
    amount: 1e14,
    decimals: 9
}