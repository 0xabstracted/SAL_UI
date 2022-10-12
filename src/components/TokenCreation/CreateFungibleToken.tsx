/* eslint-disable @typescript-eslint/no-unused-vars */
import { createAssociatedTokenAccountInstruction, createInitializeMintInstruction, createMintToCheckedInstruction, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { SystemProgram, Connection, clusterApiUrl } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import * as mpl from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from '@project-serum/anchor';
import * as web3 from "@solana/web3.js";
import { CreateFungibleTokenArgs } from './TokenInterface';
import { glthFungTokenArgs, glitchFungTokenArgs } from './AlphaTokenConfig';
import { sendTransactions } from '../../config/connection';
import { findAssociatedTokenAddress } from '../../GrandProgramUtils/AssociatedTokenAccountProgram/pda';
import { getStakeProgram } from "../../GrandProgramUtils/gemBank/getProgramObjects";
import { alphaTokenSwapPda,alphaPotPda } from "../../GrandProgramUtils/AssociatedTokenAccountProgram/pda"

function CreateFungibleToken() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const createFungibleToken = async (args: CreateFungibleTokenArgs) => {
        const mint = anchor.web3.Keypair.generate();
        console.log(`mint: ${mint.publicKey.toBase58()}`);
        let  [ata, ataBump]  = await findAssociatedTokenAddress(
            wallet?.publicKey!, // owner
            mint.publicKey, // mint
        );
        console.log('ata : ', ata.toBase58());
        let stakeProgram = await getStakeProgram(wallet);
        const [alpha_token_swap_pda] = await alphaTokenSwapPda(wallet.publicKey!, mint.publicKey);
        const [alpha_pot_pda] = await alphaPotPda(alpha_token_swap_pda, mint.publicKey);
        console.log(`ATA: ${ata.toBase58()}`);
        if (wallet.publicKey) {
            let create_fung_token_ix:any = [];

            // create mint account
            create_fung_token_ix.push(SystemProgram.createAccount({
                fromPubkey: wallet.publicKey,
                newAccountPubkey: mint.publicKey,
                space: MINT_SIZE,
                lamports: await getMinimumBalanceForRentExemptMint(connection),
                programId: TOKEN_PROGRAM_ID,
            }))
            // init mint account
            create_fung_token_ix.push(createInitializeMintInstruction(
                mint.publicKey, // mint pubkey
                args.decimals, // decimals
                wallet.publicKey, // mint authority
                wallet.publicKey // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
            ))
            // let mintAccount = await getMint(connection, mint.publicKey);
            // console.log(`mintAccount: `,mintAccount)

            create_fung_token_ix.push(
                createAssociatedTokenAccountInstruction(
                    wallet?.publicKey!, // payer
                    ata, // ata
                    wallet?.publicKey!, // owner
                    mint.publicKey // mint
                  )
            )

            create_fung_token_ix.push(
                createMintToCheckedInstruction(
                    mint.publicKey, // mint
                    ata, // receiver (sholud be a token account)
                    wallet?.publicKey!, // mint authority
                    args.amount, // amount. if your decimals is 8, you mint 10^8 for 1 token.
                    args.decimals // decimals
                    // [signer1, signer2 ...], // only multisig account will use
                )
            )
            console.log("args.pot_transfer_amount: ",args.pot_transfer_amount.toNumber())
            if (args.pot_transfer_amount.toNumber() > 0 ){
                create_fung_token_ix.push(
                    stakeProgram.rpc.createAlphaTokenswap(args.pot_transfer_amount,{
                        accounts: {
                        alphaTokenswap: alpha_token_swap_pda,
                        alphaCreator: wallet.publicKey,
                        alphaPot: alpha_pot_pda,
                        alphaOwnerSource: ata,
                        alphaMint: mint.publicKey,
                        systemProgram: SystemProgram.programId,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        rent: anchor.web3.SYSVAR_RENT_PUBKEY
                        }
                    })
                )
            }
            const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
            const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
            const seed3 = Buffer.from(mint.publicKey.toBytes());
            const [metadataPDA, metadataBump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);

            const accounts:any = {
                metadata: metadataPDA,
                mint : mint.publicKey,
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
            create_fung_token_ix.push(mpl.createCreateMetadataAccountV2Instruction(accounts, cmaArgs))
            const cft_sig = await sendTransactions(
                connection,
                wallet,
                [create_fung_token_ix],
                [[mint]]
            )
            console.log(`cft_sig: ${cft_sig}`);
            console.log(cft_sig);
        }
        else {
            throw new WalletNotConnectedError()
        }
    }
  return (
    <div>
      <div className='gen-farm-stats'>
        <div className='gen-farm-stats-left'>
            <button className='Inside-Farm-btn' onClick={() => createFungibleToken(glitchFungTokenArgs)}> Create GLITCH Token</button>
        </div>
        <div className='gen-farm-stats-right'>
            <button className='Inside-Farm-btn' onClick={() => createFungibleToken(glthFungTokenArgs)}> Create GLTCH Token</button>
        </div>
      </div>
    </div>
  )
}

export default CreateFungibleToken
