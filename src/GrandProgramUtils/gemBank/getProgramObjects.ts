import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor"

import idlStake from "../../idl/magic_stake.json";
import idlBank from "../../idl/gem_bank.json";

import { WalletContextState } from "@solana/wallet-adapter-react";

export const MAGIC_STAKE_PROGRAM_ID = new anchor.web3.PublicKey("GNiDApGeBX1Yj5aTRzqetj7ULVWZbyMPa2jw9E8EP9YX");
export const GEM_BANK_PROGRAM_ID = new anchor.web3.PublicKey('9ug6fAsdBT3cu4YzA57KDxFadZSPHXX4d2ke7UXL6Vmz');

export const getStakeProgram = async (wallet: WalletContextState) => {
  const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
  const connection = new anchor.web3.Connection(rpcHost
      ? rpcHost
      : anchor.web3.clusterApiUrl('devnet'));
  const wallet_t:any = wallet;  
  const provider = new anchor.Provider(
    connection,
    wallet_t,
    anchor.Provider.defaultOptions()
  );

  const idl_o: any = idlStake;
  // console.log(MAGIC_STAKE_PROGRAM_ID.toBase58())
  return new Program(idl_o, MAGIC_STAKE_PROGRAM_ID, provider);
};

export const getBankProgram = async (wallet: WalletContextState) => {
  const rpcHost = process.env.REACT_APP_SOLANA_RPC_HOST!;
  const connection = new anchor.web3.Connection(rpcHost
      ? rpcHost
      : anchor.web3.clusterApiUrl('devnet'));
  const wallet_t:any = wallet;  
  const provider = new anchor.Provider(
    connection,
    wallet_t,
    anchor.Provider.defaultOptions()
  );

  const idl_o: any = idlBank;
  console.log(GEM_BANK_PROGRAM_ID.toBase58())
  return new Program(idl_o, GEM_BANK_PROGRAM_ID, provider);
};
