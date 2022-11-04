import { Connection, clusterApiUrl } from '@solana/web3.js'
import type { AccountData } from 'cardinalCommon2011'
import { useQuery } from 'react-query'
import { StakeEntryData } from '../programs/stakePool'
import { getAllStakeEntries } from '../programs/stakePool/accounts'

import { useStakePoolId } from './useStakePoolId'

export const useAllStakeEntries = () => {
  const stakePoolId = useStakePoolId()
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<AccountData<StakeEntryData>[] | undefined>(
    ['useAllStakeEntries', stakePoolId?.toString()],
    async () => {
      return getAllStakeEntries(connection)
    }
  )
}
