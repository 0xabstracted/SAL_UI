import * as splToken from '@solana/spl-token'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import { useQuery } from 'react-query'

export const useMintInfo = (mint: PublicKey | undefined) => {
  const connection = new Connection(clusterApiUrl("devnet"));
  return useQuery<splToken.MintInfo | undefined>(
    ['useRewardMintInfo', mint?.toString()],
    async () => {
      if (!mint) return
      const mintResult = new splToken.Token(
        connection,
        mint,
        splToken.TOKEN_PROGRAM_ID,
        Keypair.generate() // not used
      )
      const mintInfo = await mintResult.getMintInfo()
      return mintInfo
    },
    {
      enabled: !!mint,
    }
  )
}
