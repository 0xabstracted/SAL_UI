import { withFindOrInitAssociatedTokenAccount } from 'cardinalCommon2011'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, Transaction } from '@solana/web3.js'
import { asWallet } from '../common/Wallets'
import { TOKEN_DATAS_KEY } from '../hooks/useAllowedTokenDatas'
import type { StakeEntryTokenData } from '../hooks/useStakedTokenDatas'
import { useMutation, useQueryClient } from 'react-query'
import { notify } from '../common/Notification'

import { useRewardDistributorData } from '../hooks/useRewardDistributorData'
import { useStakePoolData } from '../hooks/useStakePoolData'
import { claimRewards } from '../api'
import { executeAllTransactions } from '../ui_utils'

export const REWARD_QUERY_KEY = 'rewards'

export const useHandleClaimRewards = () => {
  const wallet = asWallet(useWallet())
  const connection = new Connection(clusterApiUrl("devnet"));
  const queryClient = useQueryClient()
  const { data: stakePool } = useStakePoolData()
  const rewardDistributorData = useRewardDistributorData()

  return useMutation(
    async ({
      tokenDatas,
    }: {
      tokenDatas: StakeEntryTokenData[]
    }): Promise<void> => {
      if (!wallet) throw new Error("Wallet not found")
      if (!stakePool) throw new Error("No stake pool found")

      const ataTx = new Transaction()
      if (rewardDistributorData.data && rewardDistributorData.data.parsed) {
        // create user reward mint ata
        await withFindOrInitAssociatedTokenAccount(
          ataTx,
          connection,
          rewardDistributorData.data.parsed.rewardMint,
          wallet.publicKey!,
          wallet.publicKey!
        )
      }

      const tokensToStake = tokenDatas
      const txs: Transaction[] = (
        await Promise.all(
          tokensToStake.map(async (token, i) => {
            try {
              if (!token || !token.stakeEntry) {
                throw new Error('No stake entry for token')
              }
              const transaction = new Transaction()
              if (i === 0 && ataTx.instructions.length > 0) {
                transaction.instructions = ataTx.instructions
              }
              const claimTx = await claimRewards(connection, wallet, {
                stakePoolId: stakePool.pubkey,
                stakeEntryId: token.stakeEntry.pubkey,
                skipRewardMintTokenAccount: true,
              })
              transaction.instructions = [
                ...transaction.instructions,
                ...claimTx.instructions,
              ]
              return transaction
            } catch (e) {
              notify({
                message: `${e}`,
                description: `Failed to claim rewards for token ${token?.stakeEntry?.pubkey.toString()}`,
                type: 'error',
              })
              return null
            }
          })
        )
      ).filter((x): x is Transaction => x !== null)

      const [firstTx, ...remainingTxs] = txs
      await executeAllTransactions(
        connection,
        wallet,
        ataTx.instructions.length > 0 ? remainingTxs : txs,
        {
          notificationConfig: {
            message: 'Successfully claimed rewards',
            description: 'These rewards are now available in your wallet',
          },
        },
        ataTx.instructions.length > 0 ? firstTx : undefined
      )
    },
    {
      onSuccess: () => {
        queryClient.resetQueries([REWARD_QUERY_KEY])
        queryClient.resetQueries([TOKEN_DATAS_KEY])
      },
      onError: (e) => {
        notify({ message: 'Failed to claim rewards', description: `${e}` })
      },
    }
  )
}
