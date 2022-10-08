import { getAssociatedTokenAddress, getAccount, createAssociatedTokenAccountInstruction, createMintToCheckedInstruction } from '@solana/spl-token'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, clusterApiUrl } from '@solana/web3.js'
import React from 'react'
import { mintFungibleTokenArgs } from './AlphaTokenConfig'
import { MintFungibleTokenArgs } from './TokenInterface'

function MintFungibleTokens() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

    const mintFungibleToken =async (args:MintFungibleTokenArgs) => {
        if (wallet.publicKey){
            let mint_fung_token_ix: any =[] 
            let userTokenAccountPDA = await getAssociatedTokenAddress(
              args.mint, // mint
              wallet.publicKey // owner
            );  
            let userTokenAccount = await getAccount(connection, userTokenAccountPDA);

            console.log(`userNewTokenAccountPDA ATA: ${userTokenAccountPDA.toBase58()}`);
                
              if(!userTokenAccount){
                mint_fung_token_ix = createAssociatedTokenAccountInstruction(
                    wallet.publicKey, // payer
                    userTokenAccountPDA, // ata
                    wallet.publicKey, // owner
                    args.mint // mint
                )
              }
              mint_fung_token_ix.push(createMintToCheckedInstruction(
                  args.mint, // mint
                  userTokenAccountPDA, // receiver (sholud be a token account)
                  wallet.publicKey, // mint authority
                  args.amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
                  args.decimals// decimals
                  // [signer1, signer2 ...], // only multisig account will use
                )
          
              )
        }
        else {
            throw new WalletNotConnectedError()
        }
    }
  return (
    <div>
      <div className='gen-farm-stats'>
        <div className='gen-farm-stats-left'>
          <button className='Inside-Farm-btn' onClick={() => mintFungibleToken(mintFungibleTokenArgs)}></button>
        </div>
      </div>
    </div>
  )
}

export default MintFungibleTokens
