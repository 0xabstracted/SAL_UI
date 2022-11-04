import type { Wallet } from 'saberhqSolanaContrib11244'
import type { WalletContextState } from '@solana/wallet-adapter-react'

export const asWallet = (wallet: WalletContextState): Wallet => {
  return {
    signTransaction: wallet.signTransaction!,
    signAllTransactions: wallet.signAllTransactions!,
    publicKey: wallet.publicKey!,
  }
}
