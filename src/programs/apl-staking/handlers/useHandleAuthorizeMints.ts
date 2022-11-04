import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, PublicKey, Transaction } from '@solana/web3.js'
import { asWallet } from '../common/Wallets'
import { useMutation } from 'react-query'
import { notify } from '../common/Notification'

import { useStakePoolData } from '../hooks/useStakePoolData'
import { withAuthorizeStakeEntry } from '../programs/stakePool/transaction'
import { executeTransaction } from '../utils'

export const useHandleAuthorizeMints = () => {
  const wallet = asWallet(useWallet())
  const { data: stakePool } = useStakePoolData()
  const connection = new Connection(clusterApiUrl("devnet"));

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
        const transaction = await withAuthorizeStakeEntry(
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
          message: `Successfully authorized ${i + 1}/${
            authorizePublicKeys.length
          }`,
          type: 'success',
        })
      }
    },
    {
      onError: (e: any) => {
        notify({ message: 'Failed to authorize mints', description: `${e}` })
      },
    }
  )
}
