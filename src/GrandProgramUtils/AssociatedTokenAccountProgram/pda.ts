import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID } from "./constants";
import { MAGIC_STAKE_PROGRAM_ID, GEM_BANK_PROGRAM_ID } from "../gemBank/getProgramObjects";

export const findAssociatedTokenAddress = async(walletAddress: PublicKey, tokenMintAddress: PublicKey) => {
  return (await PublicKey.findProgramAddress([
      walletAddress.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      tokenMintAddress.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  ));
}

export const alphaTokenSwapPda =async (walletAddress: PublicKey, mint:PublicKey) => {
  return (await PublicKey.findProgramAddress([
      Buffer.from('alpha_tokenswap'),
      walletAddress.toBuffer(),
      mint.toBuffer()
    ],
    MAGIC_STAKE_PROGRAM_ID
  ));
}

export const alphaPotPda =async (pda:any, mint:PublicKey) => {
  return (await PublicKey.findProgramAddress([
      Buffer.from('alpha_pot'),
      pda.toBuffer(),
      mint.toBuffer()
    ],
    MAGIC_STAKE_PROGRAM_ID
  ));
}
