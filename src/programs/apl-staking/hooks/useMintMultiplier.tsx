import { tryPublicKey } from 'cardinalCommon2011'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { notify } from '../common/Notification'
import { useQuery } from 'react-query'

import { useRewardDistributorData } from './useRewardDistributorData'
import { useStakePoolId } from './useStakePoolId'
import { useWalletId } from './useWalletId'
import { getRewardEntry } from '../programs/rewardDistributor/accounts'
import { findRewardEntryId } from '../programs/rewardDistributor/pda'
import { findStakeEntryIdFromMint } from '../programs/stakePool/utils'

export const useMintMultiplier = (mint: string) => {
  const stakePoolId = useStakePoolId()
  const walletId = useWalletId()
  const rewardDistributor = useRewardDistributorData()
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<number | undefined>(
    ['useMintMultiplier', mint?.toString()],
    async () => {
      if (!walletId) throw new Error("Wallet not found")
      if (!stakePoolId) throw new Error("No stake pool found")
      if (!rewardDistributor.data) throw new Error("No reward distributor found")
      const mintId = tryPublicKey(mint)
      if (!mintId) {
        notify({ message: 'Invalid mint' })
        return undefined
      }
      let stakeEntryId: PublicKey
      try {
        stakeEntryId = (
          await findStakeEntryIdFromMint(
            connection,
            walletId,
            stakePoolId,
            mintId
          )
        )[0]
      } catch (e) {
        throw new Error("Invalid mint ID or no reward entry for mint")
      }
      const [rewardEntryId] = await findRewardEntryId(
        rewardDistributor.data.pubkey,
        stakeEntryId
      )
      const rewardEntryData = await getRewardEntry(connection, rewardEntryId)
      return (
        rewardEntryData.parsed.multiplier.toNumber() /
        10 ** rewardDistributor.data.parsed.multiplierDecimals
      )
    },
    { enabled: !!stakePoolId && mint.length > 0 }
  )
}
