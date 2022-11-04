import { useQuery } from 'react-query'
import { StakePoolMetadata, stakePoolMetadatas } from '../ui_mapping'

import { useStakePoolId } from './useStakePoolId'

export const useStakePoolMetadata = () => {
  const stakePoolId = useStakePoolId()
  return useQuery<StakePoolMetadata | undefined>(
    ['useStakePoolMetadata', stakePoolId?.toString()],
    async () => {
      if (!stakePoolId) return
      return stakePoolMetadatas.find(
        (p) => p.stakePoolAddress.toString() === stakePoolId.toString()
      )
    }
  )
}
