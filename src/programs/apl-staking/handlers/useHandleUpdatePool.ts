import { tryGetAccount, tryPublicKey } from 'cardinalCommon2011'
import { BN } from 'projectSerumAnchor0250'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js'
import { handleError } from '../common/errors'
import { notify } from '../common/Notification'
import { asWallet } from '../common/Wallets'
// import type { CreationForm } from 'components/StakePoolForm'
import { useRewardDistributorData } from '../hooks/useRewardDistributorData'
import { useMutation } from 'react-query'

import { useStakePoolData } from '../hooks/useStakePoolData'
import { getRewardDistributor } from '../programs/rewardDistributor/accounts'
import { findRewardDistributorId } from '../programs/rewardDistributor/pda'
import { withCloseRewardDistributor, withInitRewardDistributor, withUpdateRewardDistributor } from '../programs/rewardDistributor/transaction'
import { withUpdateStakePool } from '../programs/stakePool/transaction'
import { executeTransaction } from '../utils'

export const useHandleUpdatePool = () => {
  const wallet = asWallet(useWallet())
  const connection = new Connection(clusterApiUrl("devnet"));
  const stakePool = useStakePoolData()
  const rewardDistributor = useRewardDistributorData()

  return useMutation(
    async ({ values }: { values: any }): Promise<void> => {
    // async ({ values }: { values: CreationForm }): Promise<void> => {
      if (!wallet) throw new Error("Wallet not found")
      if (!stakePool.data) throw new Error("No stake pool found")
      if (
        wallet.publicKey?.toString() !==
        stakePool.data?.parsed.authority.toString()
      ) {
        notify({
          message: 'You are not the pool authority.',
          type: 'error',
        })
        return
      }
      if (!stakePool.data?.pubkey) {
        throw new Error("Stake pool pubkey not found")
      }
      const transaction = new Transaction()
      if (
        values.rewardDistributorKind !== rewardDistributor.data?.parsed.kind
      ) {
        if (values.rewardDistributorKind === 0) {
          const [rewardDistributorId] = await findRewardDistributorId(
            stakePool.data.pubkey
          )
          const rewardDistributorData = await tryGetAccount(() =>
            getRewardDistributor(connection, rewardDistributorId)
          )
          if (rewardDistributorData) {
            await withCloseRewardDistributor(transaction, connection, wallet, {
              stakePoolId: stakePool.data.pubkey,
            })
            notify({
              message: 'Removing reward distributor for pool',
              type: 'info',
            })
          }
        } else {
          const rewardDistributorKindParams = {
            stakePoolId: stakePool.data.pubkey,
            rewardMintId: new PublicKey(values.rewardMintAddress!.trim())!,
            rewardAmount: values.rewardAmount
              ? new BN(values.rewardAmount)
              : undefined,
            rewardDurationSeconds: values.rewardDurationSeconds
              ? new BN(values.rewardDurationSeconds)
              : undefined,
            kind: values.rewardDistributorKind,
            supply: values.rewardMintSupply
              ? new BN(values.rewardMintSupply)
              : undefined,
            defaultMultiplier: values.defaultMultiplier
              ? new BN(values.defaultMultiplier)
              : undefined,
            multiplierDecimals: values.multiplierDecimals
              ? Number(values.multiplierDecimals)
              : undefined,
          }
          await withInitRewardDistributor(
            transaction,
            connection,
            wallet,
            rewardDistributorKindParams
          )
          notify({
            message: 'Initializing reward distributor for pool',
            type: 'info',
          })
        }
      } else if (rewardDistributor.data) {
        await withUpdateRewardDistributor(transaction, connection, wallet, {
          stakePoolId: stakePool.data.pubkey,
          defaultMultiplier: values.defaultMultiplier
            ? new BN(values.defaultMultiplier)
            : undefined,
          multiplierDecimals: values.multiplierDecimals
            ? Number(values.multiplierDecimals)
            : undefined,
          rewardAmount: values.rewardAmount
            ? new BN(values.rewardAmount)
            : undefined,
          rewardDurationSeconds: values.rewardDurationSeconds
            ? new BN(values.rewardDurationSeconds)
            : undefined,
          maxRewardSecondsReceived: values.maxRewardSecondsReceived
            ? new BN(values.maxRewardSecondsReceived)
            : undefined,
        })
        notify({
          message: `Updating reward distributor`,
          type: 'info',
        })
      }

      const collectionPublicKeys = values.requireCollections
        .map((c: string | string[] | null | undefined) => tryPublicKey(c))
        .filter((c: any) => c) as PublicKey[]
      const creatorPublicKeys = values.requireCreators
        .map((c: string | string[] | null | undefined) => tryPublicKey(c))
        .filter((c: any) => c) as PublicKey[]

      // format date
      let dateInNum: number | undefined = new Date(
        values.endDate?.toString() || ''
      ).getTime()
      if (dateInNum < Date.now()) {
        dateInNum = undefined
      }

      const stakePoolParams = {
        stakePoolId: stakePool.data.pubkey,
        requiresCollections: collectionPublicKeys,
        requiresCreators: creatorPublicKeys,
        requiresAuthorization: values.requiresAuthorization,
        resetOnStake: values.resetOnStake,
        overlayText: values.overlayText,
        cooldownSeconds: values.cooldownPeriodSeconds,
        minStakeSeconds: values.minStakeSeconds,
        endDate: dateInNum ? new BN(dateInNum / 1000) : undefined,
      }

      await withUpdateStakePool(
        transaction,
        connection,
        wallet,
        stakePoolParams
      )

      await executeTransaction(connection, wallet, transaction, {})
    },
    {
      onSuccess: () => {
        notify({
          message:
            'Successfully updated stake pool and reward distributor with ID: ' +
            stakePool.data?.pubkey.toString(),
          type: 'success',
        })
        setTimeout(() => {
          stakePool.refetch()
          rewardDistributor.refetch()
        }, 1000)
      },
      onError: (e) => {
        notify({
          message: 'Failed to update pool',
          description: handleError(e, `Error updating stake pool: ${e}`),
        })
      },
    }
  )
}
