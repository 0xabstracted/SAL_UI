/* eslint-disable @typescript-eslint/no-unused-vars */
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from '@project-serum/anchor';
import * as web3 from "@solana/web3.js";
import { UpdateTokenMetadataArgs } from './TokenInterface';
import { updateAlphaFungTokenMetadataArgs } from './AlphaTokenConfig';
import { sendTransactions } from '../../config/connection';
import React from 'react';

function UpdateTokenMetadata() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const updateTokenMetadata = async (args: UpdateTokenMetadataArgs) => {
        if (wallet.publicKey) {
        let update_metadata_token_ix:any = [];

                // create mint account
                const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
                const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
                const seed3 = Buffer.from(args.mint.toBytes());
                const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);
    
                const accounts = {
                    metadata: metadataPDA,
                    mint :args.mint,
                    mintAuthority: wallet.publicKey,
                    payer: wallet.publicKey,
                    updateAuthority: wallet.publicKey,
                }
                const metadataV2 = {
                    name: args.name,
                    symbol: args.symbol,
                    uri: args.uri,
                    // we don't need that
                    sellerFeeBasisPoints: 0,
                    creators: null,
                    collection: null,
                    uses: null
                }
                const umaArgs =  {
                    updateMetadataAccountArgsV2: {
                        data: metadataV2,
                        isMutable: args.isMutable,
                        updateAuthority: wallet.publicKey,
                        primarySaleHappened: args.primarySaleHappened
                    }
                };
                update_metadata_token_ix.push(mpl.createUpdateMetadataAccountV2Instruction(accounts, umaArgs))
                const cft_sig = await sendTransactions(
                    connection,
                    wallet,
                    [update_metadata_token_ix],
                    [[]]
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
            <button className='Inside-Farm-btn' onClick={() => updateTokenMetadata(updateAlphaFungTokenMetadataArgs)}> Create Whitelist Token</button>
        </div>
      </div>
    </div>
  )
}

export default UpdateTokenMetadata