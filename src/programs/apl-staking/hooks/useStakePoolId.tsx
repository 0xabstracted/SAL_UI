import { tryPublicKey } from '@cardinal/namespaces-components'
import { PublicKey } from '@solana/web3.js'
import { useStakePoolMetadataCtx } from '../StakePoolMetadataProvider'
import { stakePoolMetadatas } from '../ui_mapping'

export const useStakePoolId = () => {
  const { stakePoolMetadata } = useStakePoolMetadataCtx()
  const stakePoolId: string = ""
  if (stakePoolMetadata)
    return new PublicKey(stakePoolMetadata.stakePoolAddress)
  const nameMapping = stakePoolMetadatas.find((p) => p.name === stakePoolId)
  const addressMapping = stakePoolMetadatas.find(
    (p) => p.stakePoolAddress.toString() === stakePoolId
  )
  const publicKey =
    nameMapping?.stakePoolAddress ||
    addressMapping?.stakePoolAddress ||
    tryPublicKey(stakePoolId)

  return publicKey
}
