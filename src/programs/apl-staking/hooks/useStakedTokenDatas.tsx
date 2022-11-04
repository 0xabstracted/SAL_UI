import { AccountData, getBatchedMultipleAccounts } from 'cardinalCommon2011'
import * as metaplex from 'mplTokenMetadata125'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import * as useAllowedTokenDatas from './useAllowedTokenDatas'
import { useStakePoolId } from './useStakePoolId'
import type { TokenListData } from './useTokenList'
import { useTokenList } from './useTokenList'
import { useWalletIds } from './useWalletIds'
import { StakeEntryData } from '../programs/stakePool'
import { getStakeEntriesForUser } from '../programs/stakePool/accounts'

export type StakeEntryTokenData = {
  tokenListData?: TokenListData
  metaplexData?: { pubkey: PublicKey; data: metaplex.MetadataData } | null
  stakeEntry: AccountData<StakeEntryData> | null | undefined
}

export async function getStakeEntryDatas(
  connection: Connection,
  stakePoolId: PublicKey,
  userId: PublicKey
): Promise<StakeEntryTokenData[]> {
  const stakeEntries = (
    await getStakeEntriesForUser(connection, userId)
  ).filter((entry) => entry.parsed.pool.toString() === stakePoolId.toString())

  const metaplexIds = await Promise.all(
    stakeEntries.map(
      async (stakeEntry) =>
        (
          await metaplex.MetadataProgram.findMetadataAccount(
            stakeEntry.parsed.originalMint
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
        acc[stakeEntries[i]!.pubkey.toString()] = {
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
      [stakeEntryId: string]: {
        pubkey: PublicKey
        data: metaplex.MetadataData
      }
    }
  )

  return stakeEntries.map((stakeEntry) => ({
    stakeEntry,
    metaplexData: metaplexData[stakeEntry.pubkey.toString()],
  }))
}

export const useStakedTokenDatas = () => {
  const stakePoolId = useStakePoolId()
  const walletIds = useWalletIds()
  const tokenList = useTokenList()
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<StakeEntryTokenData[] | undefined>(
    [
      useAllowedTokenDatas.TOKEN_DATAS_KEY,
      'stakedTokenDatas',
      stakePoolId?.toString(),
      walletIds.join(','),
      tokenList?.data?.length,
    ],
    async () => {
      if (!stakePoolId || !walletIds || walletIds.length <= 0) return
      const stakeEntryDataGroups = await Promise.all(
        walletIds.map((walletId) =>
          getStakeEntryDatas(connection, stakePoolId, walletId)
        )
      )
      const tokenDatas = stakeEntryDataGroups.flat()
      const hydratedTokenDatas = tokenDatas.reduce((acc, tokenData) => {
        let tokenListData
        try {
          tokenListData = tokenList.data?.find(
            (t) =>
              t.address === tokenData.stakeEntry?.parsed.originalMint.toString()
          )
        } catch (e) {}

        if (tokenListData) {
          acc.push({
            ...tokenData,
            tokenListData: tokenListData,
          })
        } else {
          acc.push({
            ...tokenData,
            tokenListData: undefined,
          })
        }
        return acc
      }, [] as StakeEntryTokenData[])
      return hydratedTokenDatas
    },
    { enabled: tokenList.isFetched && !!stakePoolId && walletIds.length > 0 }
  )
}
