import { Program } from "@project-serum/anchor";
import * as anchor from "@project-serum/anchor"

import idlTokenSwap from "../../idl/token_swap.json";

import { WalletContextState } from "@solana/wallet-adapter-react";

export const TOKEN_SWAP_PROGRAM_ID = new anchor.web3.PublicKey("2PrbTwpNBDNDrZQBWtxmGcuSnxZzRxE1ECfL9EEMVxkG");

export const getTokenSwapProgramObject = async (wallet: WalletContextState) => {
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

  const idl_o: any = idlTokenSwap;
  // console.log(MAGIC_STAKE_PROGRAM_ID.toBase58())
  return new Program(idl_o, TOKEN_SWAP_PROGRAM_ID, provider);
};