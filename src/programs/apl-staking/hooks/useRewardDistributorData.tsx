import type { AccountData } from 'cardinalCommon2011'
import { REWARD_QUERY_KEY } from '../handlers/useHandleClaimRewards'
import { useQuery } from 'react-query'

import { useStakePoolId } from './useStakePoolId'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { RewardDistributorData } from '../programs/rewardDistributor'
import { getRewardDistributor } from '../programs/rewardDistributor/accounts'
import { findRewardDistributorId } from '../programs/rewardDistributor/pda'

export const useRewardDistributorData = () => {
  const stakePoolId = useStakePoolId()
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<AccountData<RewardDistributorData> | undefined>(
    [REWARD_QUERY_KEY, 'useRewardDistributorData', stakePoolId?.toString()],
    async () => {
      if (!stakePoolId) return
      const [rewardDistributorId] = await findRewardDistributorId(stakePoolId)
      return await getRewardDistributor(
        connection,
        rewardDistributorId
      )
    },
    { enabled: !!stakePoolId }
  )
}
