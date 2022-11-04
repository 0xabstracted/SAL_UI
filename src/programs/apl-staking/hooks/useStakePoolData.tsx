import { Connection, clusterApiUrl } from '@solana/web3.js'
import type { AccountData } from 'cardinalCommon2011'
import { useQuery } from 'react-query'
import { StakePoolData } from '../programs/stakePool'
import { getStakePool } from '../programs/stakePool/accounts'

import { useStakePoolId } from './useStakePoolId'

export const useStakePoolData = () => {
  const stakePoolId = useStakePoolId()
  const connection = new Connection(clusterApiUrl("devnet"));

  return useQuery<AccountData<StakePoolData> | undefined>(
    ['stakePoolData', stakePoolId?.toString()],
    async () => {
      if (!stakePoolId) return
      return getStakePool(connection, stakePoolId)
    }
  )
}
