import { BN } from 'projectSerumAnchor0250'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, Transaction } from '@solana/web3.js'
import { asWallet } from '../common/Wallets'
import { useRewardDistributorData } from '../hooks/useRewardDistributorData'
import { useMutation } from 'react-query'
import { notify } from '../common/Notification'

import { useStakePoolData } from '../hooks/useStakePoolData'
import { withReclaimFunds } from '../programs/rewardDistributor/transaction'
import { executeTransaction } from '../utils'

export const useHandleReclaimFunds = () => {
  const wallet = asWallet(useWallet())
  const connection = new Connection(clusterApiUrl("devnet"));
  const stakePool = useStakePoolData()
  const rewardDistributor = useRewardDistributorData()

  return useMutation(
    async ({
      reclaimAmount,
    }: {
      reclaimAmount: string | undefined
    }): Promise<string> => {
      if (!wallet) throw new Error("Wallet not found")
      if (!stakePool.data) throw new Error("No stake pool found")
      if (!rewardDistributor.data) throw new Error("No reward distributor found")
      const transaction = new Transaction()
      await withReclaimFunds(transaction, connection, wallet, {
        stakePoolId: stakePool.data.pubkey,
        amount: new BN(reclaimAmount || 0),
      })
      return executeTransaction(connection, wallet, transaction, {})
    },
    {
      onSuccess: (txid) => {
        notify({
          message: `Successfully reclaimed funds from pool`,
          txid,
          type: 'success',
        })
      },
      onError: (e:any) => {
        notify({
          message: 'Failed to reclaim funds from pool',
          description: `${e}`,
        })
      },
    }
  )
}
