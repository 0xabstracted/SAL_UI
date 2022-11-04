import { Connection, clusterApiUrl } from '@solana/web3.js'
import type { AccountData } from 'cardinalCommon2011'
import { useQuery } from 'react-query'
import { StakeEntryData } from '../programs/stakePool'
import { getActiveStakeEntriesForPool } from '../programs/stakePool/accounts'

import { TOKEN_DATAS_KEY } from './useAllowedTokenDatas'
import { useStakePoolId } from './useStakePoolId'

export const useStakePoolEntries = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const stakePoolId = useStakePoolId()
  return useQuery<AccountData<StakeEntryData>[] | undefined>(
    [TOKEN_DATAS_KEY, 'useStakePoolEntries', stakePoolId?.toString()],
    async () => {
      if (stakePoolId) {
        return getActiveStakeEntriesForPool(connection, stakePoolId)
      }
    },
    { enabled: !!stakePoolId }
  )
}
