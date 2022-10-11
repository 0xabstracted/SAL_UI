import { CreateFungibleTokenArgs, MintFungibleTokenArgs, MintNewFungibleTokenArgs, UpdateTokenMetadataArgs } from "./TokenInterface";
import * as anchor from '@project-serum/anchor';
export const REWARD_MINT_GLITCH = new anchor.web3.PublicKey('FSPM5My4PEniQt5sQvbH5LM3s4F7BVFKbG5YxJT8n3Na');
export const REWARD_MINT_ALPHA = new anchor.web3.PublicKey('MzUzPR47MwkyswusHBzXmeCWpRne78FhyZ58cAeCXhJ');
export const ALPHA_OWNER_ATA = new anchor.web3.PublicKey('5atqDVxyfFa62kXDCn7763ursC5164zaxoAaiNyV6DUE');
export const glitchFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount: 1e16,
    name: "GLITCHD",
    symbol: "GLD",
    uri: "https://arweave.net/Na2LKhfjbEGT6zIgXgXPzSI-VsUeyVAlY5FLiShcrhM",
    isMutable: true,
}

export const alphaFungTokenArgs : CreateFungibleTokenArgs = {
    decimals: 9,
    amount: 1e16,
    name: "ALPHAA",
    symbol: "ALPS",
    uri: "https://arweave.net/pNIhhW2nHT21lHwQQk4K8ZLRzaigyjotvpJxcUT5BDg",
    isMutable: true,
}

export const updateGlitchFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: new anchor.web3.PublicKey("FSPM5My4PEniQt5sQvbH5LM3s4F7BVFKbG5YxJT8n3Na"),
    name: "GLITCHDD",
    symbol: "GLDD",
    uri: "https://arweave.net/Na2LKhfjbEGT6zIgXgXPzSI-VsUeyVAlY5FLiShcrhM",
    isMutable: true,
    primarySaleHappened: true
}

export const updateAlphaFungTokenMetadataArgs : UpdateTokenMetadataArgs = {
    mint: new anchor.web3.PublicKey("MzUzPR47MwkyswusHBzXmeCWpRne78FhyZ58cAeCXhJ"),
    name: "ALPHAD",
    symbol: "ALP",
    uri: "https://arweave.net/Na2LKhfjbEGT6zIgXgXPzSI-VsUeyVAlY5FLiShcrhM",
    isMutable: true,
    primarySaleHappened: true
}

export const mintNewFungibleTokenArgs : MintNewFungibleTokenArgs = {
    oldMint: new anchor.web3.PublicKey("FSPM5My4PEniQt5sQvbH5LM3s4F7BVFKbG5YxJT8n3Na"),
    newMint: new anchor.web3.PublicKey("MzUzPR47MwkyswusHBzXmeCWpRne78FhyZ58cAeCXhJ"),
    ownerOldMint: new anchor.web3.PublicKey("UXX91ApKnrc1NyATPYqMJaDeJBQ3r9kSva1a4XTY3FD"),
    amountOld: 1e14,
    decimalsOld: 9,
    decimalsNew: 9
}   

export const mintFungibleTokenArgs: MintFungibleTokenArgs = {
    mint: new anchor.web3.PublicKey("CWWV264XyHW5KJGF4G2RV7LBNaZmzRa5vHqSeDq4AddS"),
    amount: 1e14,
    decimals: 9
}