import { clusterApiUrl, ConfirmedSignatureInfo, PublicKey  } from '@solana/web3.js'
import { Connection } from '@solana/web3.js';
import { useQuery } from 'react-query'

export const useRecentSignatures = (address: PublicKey | undefined) => {
  const connection = new Connection(clusterApiUrl("devnet"));

  return useQuery<ConfirmedSignatureInfo[] | undefined>(
    ['useRecentSignatures', address?.toString()],
    async () => {
      if (!address) return
      return connection.getSignaturesForAddress(
        address,
        { limit: 10 },
        'confirmed'
      )
    },
    { refetchInterval: 3000 }
  )
}
