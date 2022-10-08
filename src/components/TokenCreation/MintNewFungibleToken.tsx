import { createAssociatedTokenAccountInstruction, createMintToCheckedInstruction, createTransferCheckedInstruction, getAccount, getAssociatedTokenAddress } from '@solana/spl-token'
import { WalletNotConnectedError } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { clusterApiUrl, Connection } from '@solana/web3.js'
import React from 'react'
import { mintNewFungibleTokenArgs } from './AlphaTokenConfig'
import { MintNewFungibleTokenArgs } from './TokenInterface'

function MintNewFungibleToken() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed")

    const mintNewFungibleToken =async (args:MintNewFungibleTokenArgs) => {
        if (wallet.publicKey){
            let mint_new_fung_token_ix: any =[] 
            let userOldTokenAccountPDA = await getAssociatedTokenAddress(
              args.oldMint, // mint
              wallet.publicKey // owner
            );
            let ownerOldTokenAccountPDA = await getAssociatedTokenAddress(
              args.oldMint, // mint
              args.ownerOldMint // owner
            );
            let userNewTokenAccountPDA = await getAssociatedTokenAddress(
              args.newMint, // mint
              wallet.publicKey // owner
            );  
            let userNewTokenAccount = await getAccount(connection, userNewTokenAccountPDA);

            console.log(`userOldTokenAccountPDA ATA: ${userOldTokenAccountPDA.toBase58()}`);
            console.log(`ownerOldTokenAccountPDA ATA: ${ownerOldTokenAccountPDA.toBase58()}`);
            console.log(`userNewTokenAccountPDA ATA: ${userNewTokenAccountPDA.toBase58()}`);
        
            mint_new_fung_token_ix = createTransferCheckedInstruction(
                userOldTokenAccountPDA, // from (should be a token account)
                args.oldMint, // mint
                userNewTokenAccountPDA, // to (should be a token account)
                wallet.publicKey, // from's owner
                args.amountOld, // amount, if your deciamls is 8, send 10^8 for 1 token
                args.decimalsOld // decimals
              )
              if(!userNewTokenAccount)
              {
                mint_new_fung_token_ix.push(createAssociatedTokenAccountInstruction(
                  wallet.publicKey, // payer
                  userNewTokenAccountPDA, // ata
                  wallet.publicKey, // owner
                  args.newMint // mint
                ))
              }
              mint_new_fung_token_ix.push(createMintToCheckedInstruction(
                  args.newMint, // mint
                  userNewTokenAccountPDA, // receiver (sholud be a token account)
                  wallet.publicKey, // mint authority
                  args.amountOld, // amount. if your decimals is 8, you mint 10^8 for 1 token.
                  args.decimalsNew // decimals
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
          <button className='Inside-Farm-btn' onClick={() => mintNewFungibleToken(mintNewFungibleTokenArgs)}></button>
        </div>
      </div>
    </div>
  )
}

export default MintNewFungibleToken
