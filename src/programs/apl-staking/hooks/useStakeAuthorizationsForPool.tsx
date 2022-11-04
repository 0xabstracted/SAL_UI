import { Connection, clusterApiUrl } from '@solana/web3.js';
import type { AccountData } from 'cardinalCommon2011'
import { useQuery } from 'react-query'
import { StakeAuthorizationData } from '../programs/stakePool';
import { getStakeAuthorizationsForPool } from '../programs/stakePool/accounts';

import { useStakePoolId } from './useStakePoolId'

export const useStakeAuthorizationsForPool = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const stakePoolId = useStakePoolId()
  return useQuery<AccountData<StakeAuthorizationData>[] | undefined>(
    ['useStakeAuthorizationsForPool', stakePoolId?.toString()],
    async () => {
      if (stakePoolId) {
        return getStakeAuthorizationsForPool(connection, stakePoolId)
      }
    },
    { enabled: !!stakePoolId }
  )
}
