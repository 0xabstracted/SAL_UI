/* eslint-disable @typescript-eslint/no-unused-expressions */
import { BN } from '@project-serum/anchor'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection, Signer, Transaction } from '@solana/web3.js'
import { PublicKey } from '@solana/web3.js'
import { notify } from '../common/Notification'
import { asWallet } from '../common/Wallets'
import { useStakedTokenDatas } from '../hooks/useStakedTokenDatas'
import { useMutation, useQueryClient } from 'react-query'

import type { AllowedTokenData } from '../hooks/useAllowedTokenDatas'
import { TOKEN_DATAS_KEY } from '../hooks/useAllowedTokenDatas'
import { useStakePoolId } from '../hooks/useStakePoolId'
import { createStakeEntryAndStakeMint, stake } from '../api'
import { ReceiptType } from '../programs/stakePool'
import { parseMintNaturalAmountFromDecimal } from '../ui_units'
import { executeAllTransactions } from '../ui_utils'

export const useHandleStake = (callback?: () => void) => {
  const wallet = asWallet(useWallet())
  const connection = new Connection(clusterApiUrl("devnet"));
  const queryClient = useQueryClient()
  const stakePoolId = useStakePoolId()
  const stakedTokenDatas = useStakedTokenDatas()
  return useMutation(
    async ({
      tokenDatas,
      receiptType = ReceiptType.Original,
    }: {
      tokenDatas: AllowedTokenData[]
      receiptType?: ReceiptType
    }): Promise<string[]> => {
      if (!wallet) throw new Error("Wallet not connected")
      if (!stakePoolId) throw new Error("No stake pool found")
      if (tokenDatas.length <= 0) throw new Error("No tokens selected")
      if (tokenDatas.length <= 0) throw new Error("No tokens selected")
      const initTxs: { tx: Transaction; signers: Signer[] }[] = []
      for (let i = 0; i < tokenDatas.length; i++) {
        try {
          const token = tokenDatas[i]!
          if (!token.tokenAccount) throw new Error("Token account invalid")
          if (receiptType === ReceiptType.Receipt) {
            console.log('Creating stake entry and stake mint...')
            const [initTx, , stakeMintKeypair] =
              await createStakeEntryAndStakeMint(connection, wallet, {
                stakePoolId: stakePoolId,
                originalMintId: new PublicKey(
                  token.tokenAccount.account.data.parsed.info.mint
                ),
              })
            if (initTx.instructions.length > 0) {
              initTxs.push({
                tx: initTx,
                signers: stakeMintKeypair ? [stakeMintKeypair] : [],
              })
            }
          }
        } catch (e) {
          notify({
            message: `Failed to stake token ${tokenDatas[i]?.tokenAccount?.account.data.parsed.info.mint}`,
            description: `${e}`,
            type: 'error',
          })
        }
      }

      if (initTxs.length > 0) {
        try {
          await executeAllTransactions(
            connection,
            wallet,
            initTxs.map(({ tx }) => tx),
            {
              signers: initTxs.map(({ signers }) => signers),
              throwIndividualError: true,
              notificationConfig: {
                message: `Successfully staked`,
                description: 'Stake progress will now dynamically update',
              },
            }
          )
        } catch (e) {}
      }

      const txs: (Transaction | null)[] = await Promise.all(
        tokenDatas.map(async (token) => {
          try {
            if (!token.tokenAccount) throw new Error("Token account invalid")
            if (
              token.tokenAccount?.account.data.parsed.info.tokenAmount.amount >
                1 &&
              !token.amountToStake
            ) {
              throw new Error('Invalid amount chosen for token')
            }

            const mint = token.tokenAccount?.account.data.parsed.info.mint
            const stakedToken = stakedTokenDatas.data?.find(
              (s) => s.stakeEntry?.parsed.originalMint.toString() === mint
            )
            if (
              stakedToken &&
              stakedToken.stakeEntry?.parsed.amount.gt(new BN(0))
            ) {
              throw new Error("Fungible tokens already staked in the pool. Staked tokens need to be unstaked and then restaked together with the new tokens.")
            }

            const amount = token?.amountToStake
              ? new BN(
                  token?.amountToStake &&
                  token.tokenAccount.account.data.parsed.info.tokenAmount
                    .amount > 1
                    ? parseMintNaturalAmountFromDecimal(
                        token?.amountToStake,
                        token.tokenAccount.account.data.parsed.info.tokenAmount
                          .decimals
                      ).toString()
                    : 1
                )
              : undefined
            return stake(connection, wallet, {
              stakePoolId: stakePoolId,
              receiptType:
                (!amount ||
                  (amount &&
                    amount.eq(new BN(1)) &&
                    receiptType === ReceiptType.Receipt)) &&
                receiptType !== ReceiptType.None
                  ? receiptType
                  : undefined,
              originalMintId: new PublicKey(mint),
              userOriginalMintTokenAccountId: token.tokenAccount.pubkey,
              amount: amount,
            })
          } catch (e) {
            console.log({
              message: `Failed to unstake token ${token?.tokenAccount?.account.data.parsed.info.mint}`,
              description: `${e}`,
              type: 'error',
            })
            return null
          }
        })
      )

      await executeAllTransactions(
        connection,
        wallet,
        txs.filter((tx): tx is Transaction => tx !== null),
        {
          notificationConfig: {
            message: `Successfully staked`,
            description: 'Stake progress will now dynamically update',
          },
        }
      )

      return []
    },
    {
      onSuccess: () => {
        queryClient.resetQueries([TOKEN_DATAS_KEY])
        if (callback) callback
      },
      onError: (e) => {
        notify({ message: 'Failed to stake', description: `${e}` })
      },
    }
  )
}
