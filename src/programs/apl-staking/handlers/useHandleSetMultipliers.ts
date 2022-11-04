import {
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from 'cardinalCommon2011'
import { BN } from 'projectSerumAnchor0250'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js'
import { asWallet } from '../common/Wallets'
import { useRewardDistributorData } from '../hooks/useRewardDistributorData'
import { useMutation } from 'react-query'

import { useStakePoolData } from '../hooks/useStakePoolData'
import { handleError } from '../errors'
import { getRewardEntry } from '../programs/rewardDistributor/accounts'
import { findRewardEntryId } from '../programs/rewardDistributor/pda'
import { withInitRewardEntry, withUpdateRewardEntry } from '../programs/rewardDistributor/transaction'
import { getStakeEntry } from '../programs/stakePool/accounts'
import { withInitStakeEntry } from '../programs/stakePool/transaction'
import { findStakeEntryIdFromMint } from '../programs/stakePool/utils'
import { executeTransaction } from '../utils'
import { notify } from '../common/Notification'

export const useHandleSetMultipliers = () => {
  const wallet = asWallet(useWallet())
  const connection = new Connection(clusterApiUrl("devnet"));
  const stakePool = useStakePoolData()
  const rewardDistributor = useRewardDistributorData()

  return useMutation(
    async ({
      multiplierMints,
      multipliers,
    }: {
      multiplierMints: (string | undefined)[] | undefined
      multipliers: (string | undefined)[] | undefined
    }): Promise<void> => {
      if (!wallet) throw new Error("Wallet not found")
      if (!stakePool.data) throw new Error("No stake pool found")
      if (!rewardDistributor.data) throw new Error("No reward distributor found")
      if (!multiplierMints) throw new Error("Invalid multiplier mints")
      if (!multipliers) {throw new Error("Invalid multipliers")}
      if (multipliers.length !== multiplierMints.length) {
        notify({
          message: `Error: Multiplier and mints aren't 1:1`,
          type: 'error',
        })
        return
      }

      if (multiplierMints.toString() === [''].toString()) multiplierMints = []
      if (multipliers.toString() === [''].toString()) multipliers = []
      const pubKeysToSetMultiplier = []
      for (let i = 0; i < multiplierMints.length; i++) {
        if (multiplierMints[i] !== '' && multipliers[i] !== '') {
          pubKeysToSetMultiplier.push(new PublicKey(multiplierMints[i]!))
        } else {
          notify({
            message: `Error: Invalid multiplier mint "${multiplierMints[
              i
            ]!}" or multiplier "${multipliers[i]!}"`,
          })
          return
        }
      }

      if (pubKeysToSetMultiplier.length === 0) {
        notify({ message: `Info: No mints inserted` })
      }
      if (multipliers.length === 0) {
        notify({ message: `Info: No multiplier inserted` })
      }

      for (let i = 0; i < pubKeysToSetMultiplier.length; i++) {
        const transaction = new Transaction()

        const mintId = pubKeysToSetMultiplier[i]!
        const [stakeEntryId] = await findStakeEntryIdFromMint(
          connection,
          wallet.publicKey!,
          stakePool.data.pubkey,
          mintId
        )
        await withFindOrInitAssociatedTokenAccount(
          transaction,
          connection,
          mintId,
          stakeEntryId,
          wallet.publicKey,
          true
        )

        const stakeEntry = await tryGetAccount(() =>
          getStakeEntry(connection, stakeEntryId)
        )
        if (!stakeEntry) {
          await withInitStakeEntry(transaction, connection, wallet, {
            stakePoolId: stakePool.data.pubkey,
            originalMintId: mintId,
          })
          notify({
            message: `Initializing stake entry`,
            type: 'info',
          })
        }

        const [rewardEntryId] = await findRewardEntryId(
          rewardDistributor.data.pubkey,
          stakeEntryId
        )
        const rewardEntry = await tryGetAccount(() =>
          getRewardEntry(connection, rewardEntryId)
        )
        if (!rewardEntry) {
          await withInitRewardEntry(transaction, connection, wallet, {
            stakeEntryId,
            rewardDistributorId: rewardDistributor.data.pubkey,
          })
          notify({
            message: `Initializing reward entry`,
            type: 'info',
          })
        }

        await withUpdateRewardEntry(transaction, connection, wallet, {
          stakePoolId: stakePool.data.pubkey,
          rewardDistributorId: rewardDistributor.data.pubkey,
          stakeEntryId: stakeEntryId,
          multiplier: new BN(multipliers[i]!),
        })
        notify({
          message: `Updating multipler`,
          type: 'info',
        })
        await executeTransaction(connection, wallet, transaction, {
          silent: false,
          signers: [],
        })
        notify({
          message: `Successfully set multiplier ${i + 1}/${
            pubKeysToSetMultiplier.length
          }`,
          type: 'success',
        })
      }
    },
    {
      onError: (e) => {
        notify({
          message: 'Failed to set multiplier',
          description: handleError(e, `${e}`),
        })
      },
    }
  )
}
