import { useWallet } from '@solana/wallet-adapter-react'
import type { PublicKey } from '@solana/web3.js'

export const useWalletIds = () => {
  const wallet = useWallet()
  const walletIds = [
    wallet.publicKey,
  ]
  return walletIds.filter((id): id is PublicKey => id !== null)
}
