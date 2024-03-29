import type { AccountData } from "cardinalCommon2011";
import { getBatchedMultipleAccounts } from "cardinalCommon2011";
import * as metaplex from "mplTokenMetadata125";
import * as spl from "@solana/spl-token";
import {
  AccountInfo,
  clusterApiUrl,
  Connection,
  ParsedAccountData,
} from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";
import { useQuery } from "react-query";

import { useStakeAuthorizationsForPool } from "./useStakeAuthorizationsForPool";
import { useStakePoolData } from "./useStakePoolData";
import { useStakePoolId } from "./useStakePoolId";
import type { TokenListData } from "./useTokenList";
import { useTokenList } from "./useTokenList";
import { useWalletId } from "./useWalletId";
import { StakePoolData, StakeAuthorizationData } from "../programs/stakePool";

export const TOKEN_DATAS_KEY = "tokenDatas";

export type AllowedTokenData = {
  tokenAccount?: {
    pubkey: PublicKey;
    account: AccountInfo<ParsedAccountData>;
  };
  metaplexData?: { pubkey: PublicKey; data: metaplex.MetadataData } | null;
  tokenListData?: TokenListData;
  amountToStake?: string;
};

export const allowedTokensForPool = (
  tokenDatas: AllowedTokenData[],
  stakePool: AccountData<StakePoolData>,
  stakeAuthorizations?: AccountData<StakeAuthorizationData>[],
  allowFrozen?: boolean
) =>
  tokenDatas.filter((token) => {
    let isAllowed = true;
    const creatorAddresses = stakePool.parsed.requiresCreators;
    const collectionAddresses = stakePool.parsed.requiresCollections;
    const requiresAuthorization = stakePool.parsed.requiresAuthorization;
    if (
      !allowFrozen &&
      token.tokenAccount?.account.data.parsed.info.state === "frozen"
    ) {
      return false;
    }

    if (
      stakePool.parsed.requiresCreators.length > 0 ||
      stakePool.parsed.requiresCollections.length > 0 ||
      stakePool.parsed.requiresAuthorization
    ) {
      isAllowed = false;
      if (creatorAddresses && creatorAddresses.length > 0) {
        creatorAddresses.forEach(
          (filterCreator: { toString: () => string }) => {
            if (
              token?.metaplexData?.data?.data?.creators &&
              (token?.metaplexData?.data?.data?.creators).some(
                (c) => c.address === filterCreator.toString() && c.verified
              )
            ) {
              isAllowed = true;
            }
          }
        );
      }

      if (collectionAddresses && collectionAddresses.length > 0 && !isAllowed) {
        collectionAddresses.forEach(
          (collectionAddress: { toString: () => string }) => {
            if (
              token.metaplexData?.data?.collection?.verified &&
              token.metaplexData?.data?.collection?.key.toString() ===
                collectionAddress.toString()
            ) {
              isAllowed = true;
            }
          }
        );
      }
      if (
        requiresAuthorization &&
        stakeAuthorizations
          ?.map((s) => s.parsed.mint.toString())
          ?.includes(token?.tokenAccount?.account.data.parsed.info.mint)
      ) {
        isAllowed = true;
      }
    }
    return isAllowed;
  });

export const useAllowedTokenDatas = (showFungibleTokens: boolean) => {
  const stakePoolId = useStakePoolId();
  const walletId = useWalletId();
  const connection = new Connection(clusterApiUrl("devnet"));
  const tokenList = useTokenList();
  const stakePool = useStakePoolData();
  const stakeAuthorizations = useStakeAuthorizationsForPool();
  return useQuery<AllowedTokenData[] | undefined>(
    [
      TOKEN_DATAS_KEY,
      "allowedTokenDatas",
      stakePool.data?.pubkey.toString(),
      walletId?.toString(),
      showFungibleTokens,
      tokenList.data?.length,
      stakeAuthorizations.data?.length ?? 0,
    ],
    async () => {
      if (!stakePoolId || !stakePool.data || !walletId) return;

      const allTokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletId!,
        {
          programId: spl.TOKEN_PROGRAM_ID,
        }
      );

      const tokenAccounts = allTokenAccounts.value
        .filter(
          (tokenAccount) =>
            tokenAccount.account.data.parsed.info.tokenAmount.uiAmount > 0
        )
        .sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()));
      const metaplexIds = await Promise.all(
        tokenAccounts.map(
          async (tokenAccount) =>
            (
              await metaplex.MetadataProgram.findMetadataAccount(
                new PublicKey(tokenAccount.account.data.parsed.info.mint)
              )
            )[0]
        )
      );
      const metaplexAccountInfos = await getBatchedMultipleAccounts(
        connection,
        metaplexIds
      );
      const metaplexData = metaplexAccountInfos.reduce(
        (acc, accountInfo, i) => {
          try {
            acc[tokenAccounts[i]!.pubkey.toString()] = {
              pubkey: metaplexIds[i]!,
              ...accountInfo,
              data: metaplex.MetadataData.deserialize(
                accountInfo?.data as Buffer
              ) as metaplex.MetadataData,
            };
          } catch (e) {}
          return acc;
        },
        {} as {
          [tokenAccountId: string]: {
            pubkey: PublicKey;
            data: metaplex.MetadataData;
          };
        }
      );

      const baseTokenDatas = tokenAccounts.map((tokenAccount, i) => ({
        tokenAccount,
        metaplexData: metaplexData[tokenAccount.pubkey.toString()],
        tokenListData: tokenList.data?.find(
          (t) =>
            t.address === tokenAccount?.account.data.parsed.info.mint.toString()
        ),
      }));

      const allowedTokens = allowedTokensForPool(
        baseTokenDatas,
        stakePool.data,
        stakeAuthorizations.data
      ).filter(
        (tokenData) =>
          showFungibleTokens ===
          (!!tokenData.tokenListData ||
            tokenData.metaplexData?.data.tokenStandard ===
              metaplex.TokenStandard.Fungible ||
            tokenData.metaplexData?.data.tokenStandard ===
              metaplex.TokenStandard.FungibleAsset)
      );

      return allowedTokens;
    },
    {
      enabled: tokenList.isFetched && !!stakePool.data && !!walletId,
    }
  );
};
