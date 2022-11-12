import {
  findAta,
  withFindOrInitAssociatedTokenAccount,
} from "cardinalCommon2011";
import type { Wallet } from "saberhqSolanaContrib11244";
import {
  AccountMeta,
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import * as splToken36 from "solanaSPLToken036"
import { RewardDistributorKind } from "./constants";

export const withRemainingAccountsForKind = async (
  transaction: Transaction,
  connection: Connection,
  wallet: Wallet,
  rewardDistributorId: PublicKey,
  kind: RewardDistributorKind,
  rewardMint: PublicKey,
  isClaimRewards?: boolean
): Promise<AccountMeta[]> => {
  switch (kind) {
    case RewardDistributorKind.Mint: {
      return [];
    }
    case RewardDistributorKind.Treasury: {
      let wallet_t:any = wallet;

    //   const rewardDistributorRewardMintTokenAccountId = await splToken36.getOrCreateAssociatedTokenAccount(
    //     connection,
    //     wallet,
    //     rewardMint,
    //     rewardDistributorId,
    //     true
    // );
      const rewardDistributorRewardMintTokenAccountId = new PublicKey("FNYBie5kK9mjfbZ5FJGmTbyyMHwVaGcTQA2Q1tVEkx7J")
      // const rewardDistributorRewardMintTokenAccountId =
      //   await withFindOrInitAssociatedTokenAccount(
      //     transaction,
      //     connection,
      //     rewardMint,
      //     rewardDistributorId,
      //     wallet.publicKey,
      //     true
      //   );
      const userRewardMintTokenAccountId = await findAta(
        rewardMint,
        wallet.publicKey,
        true
      );
      return [
        {
          pubkey: rewardDistributorRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
      ].concat(
        !isClaimRewards
          ? [
              {
                pubkey: userRewardMintTokenAccountId,
                isSigner: false,
                isWritable: true,
              },
            ]
          : []
      );
    }
    default:
      return [];
  }
};
