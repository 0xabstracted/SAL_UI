import type { AccountData } from 'cardinalCommon2011'
import { BorshAccountsCoder, utils } from 'projectSerumAnchor0250'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { useQuery } from 'react-query'

import { useWalletId } from './useWalletId'
import { StakePoolData, STAKE_POOL_ADDRESS, STAKE_POOL_IDL } from '../programs/stakePool'

export const getStakePoolsByAuthority = async (
  connection: Connection,
  user: PublicKey
): Promise<AccountData<StakePoolData>[]> => {
  const programAccounts = await connection.getProgramAccounts(
    STAKE_POOL_ADDRESS,
    {
      filters: [
        {
          memcmp: {
            offset: 0,
            bytes: utils.bytes.bs58.encode(
              BorshAccountsCoder.accountDiscriminator('stakePool')
            ),
          },
        },
        {
          memcmp: {
            offset: 17,
            bytes: user.toBase58(),
          },
        },
      ],
    }
  )
  const stakePoolDatas: AccountData<StakePoolData>[] = []
  const coder = new BorshAccountsCoder(STAKE_POOL_IDL)
  programAccounts.forEach((account) => {
    try {
      const stakePoolData: StakePoolData = coder.decode(
        'stakePool',
        account.account.data
      )
      if (stakePoolData) {
        stakePoolDatas.push({
          ...account,
          parsed: stakePoolData,
        })
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  })
  return stakePoolDatas.sort((a, b) =>
    a.pubkey.toBase58().localeCompare(b.pubkey.toBase58())
  )
}

export const useStakePoolsByAuthority = () => {
  const connection = new Connection(clusterApiUrl("devnet"));
  const walletId = useWalletId()

  return useQuery<AccountData<StakePoolData>[] | undefined>(
    ['useStakePoolsByAuthority', walletId?.toString()],
    async () => {
      if (!walletId) return
      return getStakePoolsByAuthority(connection, walletId)
    },
    {
      enabled: !!walletId,
    }
  )
}
