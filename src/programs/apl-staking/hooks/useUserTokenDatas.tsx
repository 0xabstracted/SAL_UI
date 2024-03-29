import { getBatchedMultipleAccounts } from 'cardinalCommon2011'
import * as metaplex from 'mplTokenMetadata125'
import * as spl from '@solana/spl-token'
import { AccountInfo, clusterApiUrl, Connection, ParsedAccountData } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import type { TokenListData } from './useTokenList'
import { useTokenList } from './useTokenList'
import { useWalletId } from './useWalletId'

export type UserTokenData = {
  tokenAccount?: {
    pubkey: PublicKey
    account: AccountInfo<ParsedAccountData>
  }
  metaplexData?: { pubkey: PublicKey; data: metaplex.MetadataData } | null
  tokenListData?: TokenListData
}

export const useUserTokenDatas = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const walletId = useWalletId()
  const tokenList = useTokenList()
  return useQuery<UserTokenData[]>(
    ['useUserTokenDatas', walletId?.toString(), tokenList.data?.length],
    async () => {
      const allTokenAccounts =
        await connection.getParsedTokenAccountsByOwner(walletId!, {
          programId: spl.TOKEN_PROGRAM_ID,
        })

      const tokenAccounts = allTokenAccounts.value
        .filter(
          (tokenAccount) =>
            tokenAccount.account.data.parsed.info.tokenAmount.uiAmount > 0
        )
        .sort((a, b) => a.pubkey.toBase58().localeCompare(b.pubkey.toBase58()))

      const metaplexIds = await Promise.all(
        tokenAccounts.map(
          async (tokenAccount) =>
            (
              await metaplex.MetadataProgram.findMetadataAccount(
                new PublicKey(tokenAccount.account.data.parsed.info.mint)
              )
            )[0]
        )
      )
      const metaplexAccountInfos = await getBatchedMultipleAccounts(
        connection,
        metaplexIds
      )
      const metaplexData = metaplexAccountInfos.reduce(
        (acc, accountInfo, i) => {
          try {
            acc[tokenAccounts[i]!.pubkey.toString()] = {
              pubkey: metaplexIds[i]!,
              ...accountInfo,
              data: metaplex.MetadataData.deserialize(
                accountInfo?.data as Buffer
              ) as metaplex.MetadataData,
            }
          } catch (e) {}
          return acc
        },
        {} as {
          [tokenAccountId: string]: {
            pubkey: PublicKey
            data: metaplex.MetadataData
          }
        }
      )

      return tokenAccounts.map((tokenAccount, i) => ({
        tokenAccount,
        metaplexData: metaplexData[tokenAccount.pubkey.toString()],
        tokenListData: tokenList.data?.find(
          (t) =>
            t.address === tokenAccount?.account.data.parsed.info.mint.toString()
        ),
      }))
    },
    {
      enabled: !!walletId && tokenList.isFetched,
    }
  )
}
