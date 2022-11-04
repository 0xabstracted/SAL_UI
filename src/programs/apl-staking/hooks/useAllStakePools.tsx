import type { AccountData } from 'cardinalCommon2011'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import { useQuery } from 'react-query'
import { StakePoolData } from '../programs/stakePool'
import { getAllStakePools } from '../programs/stakePool/accounts'
import { StakePoolMetadata, stakePoolMetadatas } from '../ui_mapping'

export type StakePool = {
  stakePoolMetadata?: StakePoolMetadata
  stakePoolData: AccountData<StakePoolData>
}

export const useAllStakePools = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<
    | {
        stakePoolsWithMetadata: StakePool[]
        stakePoolsWithoutMetadata: StakePool[]
      }
    | undefined
  >(['useAllStakePools'], async () => {
    const allStakePoolDatas = await getAllStakePools(connection)
    const [stakePoolsWithMetadata, stakePoolsWithoutMetadata] =
      allStakePoolDatas.reduce(
        (acc: any[], stakePoolData: { pubkey: { toString: () => any } }) => {
          const stakePoolMetadata = stakePoolMetadatas.find(
            (md: { stakePoolAddress: { toString: () => any } }) =>
              md.stakePoolAddress.toString() === stakePoolData.pubkey.toString()
          )
          if (stakePoolMetadata) {
            return [[...acc[0], { stakePoolMetadata, stakePoolData }], acc[1]]
          }
          return [acc[0], [...acc[1], { stakePoolData }]]
        },
        [[] as StakePool[], [] as StakePool[]]
      )
    return {
      stakePoolsWithMetadata: stakePoolsWithMetadata.sort((a: { stakePoolMetadata: any }, b: { stakePoolMetadata: any }) =>
        a
          .stakePoolMetadata!.name.toString()
          .localeCompare(b.stakePoolMetadata!.name.toString())
      ),
      stakePoolsWithoutMetadata: stakePoolsWithoutMetadata,
    }
  })
}
