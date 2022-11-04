import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js'
import { asWallet } from '../common/Wallets'
import { useMutation } from 'react-query'
import { notify } from '../common/Notification'

import { useStakePoolData } from '../hooks/useStakePoolData'
import { withDeauthorizeStakeEntry } from '../programs/stakePool/transaction'
import { executeTransaction } from '../utils'

export const useHandleDeauthorizeMints = () => {
  const wallet = asWallet(useWallet())
  const connection = new Connection(clusterApiUrl("devnet"));
  const { data: stakePool } = useStakePoolData()

  return useMutation(
    async ({
      mintsToAuthorize,
    }: {
      mintsToAuthorize: string
    }): Promise<void> => {
      if (!wallet) throw new Error("Wallet not found")
      if (!stakePool) throw new Error("No stake pool found")
      const authorizePublicKeys =
        mintsToAuthorize.length > 0
          ? mintsToAuthorize
              .split(',')
              .map((address) => new PublicKey(address.trim()))
          : []

      if (authorizePublicKeys.length === 0) {
        notify({ message: `Error: No mints inserted` })
        return
      }

      for (let i = 0; i < authorizePublicKeys.length; i++) {
        const mint = authorizePublicKeys[i]!
        const transaction = await withDeauthorizeStakeEntry(
          new Transaction(),
          connection,
          wallet,
          {
            stakePoolId: stakePool.pubkey,
            originalMintId: mint,
          }
        )
        await executeTransaction(connection, wallet, transaction, {
          silent: false,
          signers: [],
        })
        notify({
          message: `Successfully deauthorized ${i + 1}/${
            authorizePublicKeys.length
          }`,
          type: 'success',
        })
      }
    },
    {
      onError: (e) => {
        notify({ message: 'Failed to deauthorize mints', description: `${e}` })
      },
    }
  )
}
