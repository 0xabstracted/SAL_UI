/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToCheckedInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from 'solanaSPLToken036';
import { SystemProgram, Connection, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from '@project-serum/anchor';
import * as web3 from "@solana/web3.js";
import { CreateTokenMetadataArgs } from './TokenInterface';
import { glthFungTokenArgs, glitchFungTokenArgs, createMetadataArgs } from './AlphaTokenConfig';
import { sendTransactions } from '../../config/connection';
import { findAssociatedTokenAddress } from '../../GrandProgramUtils/AssociatedTokenAccountProgram/pda';
import { getStakeProgram } from "../../GrandProgramUtils/GemBank/GetProgramObjects";
import { getTokenSwapProgramObject } from "../../GrandProgramUtils/TokenSwap/GetProgramObject";
import { alphaTokenSwapPda,alphaPotPda } from "../../GrandProgramUtils/AssociatedTokenAccountProgram/pda"

function CreateTokenMetadata() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

    const createTokenMetadata = async (args: CreateTokenMetadataArgs) => {
        if (wallet.publicKey) {
            let create_token_metadata_ix:any = [];

            const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
            const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
            const seed3 = Buffer.from(args.mint.toBytes());
            const [metadataPDA, metadataBump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);

            const accounts:any = {
                metadata: metadataPDA,
                mint : args.mint,
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
            const cmaArgs =  {
                createMetadataAccountArgsV2: {
                    data: metadataV2,
                    isMutable: args.isMutable,
                }
            };
            create_token_metadata_ix.push(mpl.createCreateMetadataAccountV2Instruction(accounts, cmaArgs))
            const ctm_sig = await sendTransactions(
                connection,
                wallet,
                [create_token_metadata_ix],
                [[]]
            )
            console.log(`ctm_sig: ${ctm_sig}`);
        }
        else {
            throw new WalletNotConnectedError()
        }
    }
  return (
    <div>
      <div className='gen-farm-stats'>
        <div className='gen-farm-stats-left'>
            <button className='Inside-Farm-btn' onClick={() => createTokenMetadata(createMetadataArgs)}> Create GLITCH Metadata</button>
        </div>
      </div>
    </div>
  )
}

export default CreateTokenMetadata
