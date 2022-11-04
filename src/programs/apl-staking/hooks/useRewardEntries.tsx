import type { AccountData } from 'cardinalCommon2011'
import { REWARD_QUERY_KEY } from '../handlers/useHandleClaimRewards'
import { useQuery } from 'react-query'

import { useRewardDistributorData } from './useRewardDistributorData'
import { useStakedTokenDatas } from './useStakedTokenDatas'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { RewardEntryData } from '../programs/rewardDistributor'
import { getRewardEntries } from '../programs/rewardDistributor/accounts'
import { findRewardEntryId } from '../programs/rewardDistributor/pda'

export const useRewardEntries = () => {
  const { data: rewardDistibutorData } = useRewardDistributorData()
  const { data: stakedTokenDatas } = useStakedTokenDatas()
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<AccountData<RewardEntryData>[] | undefined>(
    [
      REWARD_QUERY_KEY,
      'useRewardEntries',
      rewardDistibutorData?.pubkey?.toString(),
      stakedTokenDatas?.map((s) => s.stakeEntry?.pubkey.toString()).join(','),
    ],
    async () => {
      const rewardDistibutorId = rewardDistibutorData?.pubkey
      if (!rewardDistibutorData || !stakedTokenDatas || !rewardDistibutorId) {
        return []
      }
      const stakeEntryIds = stakedTokenDatas
        .filter((tk) => tk && tk.stakeEntry)
        .map((tk) => tk.stakeEntry!)
        .map((entry) => entry.pubkey)

      const rewardEntryIds = await Promise.all(
        stakeEntryIds.map(
          async (stakeEntryId) =>
            (
              await findRewardEntryId(rewardDistibutorId, stakeEntryId)
            )[0]
        )
      )

      return (
        await getRewardEntries(connection, rewardEntryIds)
      ).filter((rewardEntry) => rewardEntry.parsed)
    }
  )
}
