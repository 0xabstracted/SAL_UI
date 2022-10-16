import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl, SystemProgram } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor'


import { getTokenSwapProgramObject } from '../../GrandProgramUtils/TokenSwap/GetProgramObject';
import { findRegistryPDA, findVaultTokenInPDA, findVaultTokenOutPDA } from '../../GrandProgramUtils/TokenSwap/pda';
import { CreateSwapRegistryArgs } from './TokenInterface';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { sendTransactions } from '../../config/connection';
import { createSwapRegistryAlphaArgs } from './AlphaTokenConfig';

function CreateSwapRegistry() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const createSwapRegistry = async (args: CreateSwapRegistryArgs) => {
        let tokenSwapProgram = await getTokenSwapProgramObject(wallet);
        const [registry_pda] = await findRegistryPDA(wallet.publicKey!, args.mintTokenIn, args.mintTokenOut);
        const [vault_token_in_pda] = await findVaultTokenInPDA(registry_pda);
        const [vault_token_out_pda] = await findVaultTokenOutPDA(registry_pda);
        if (wallet.publicKey) {
            let create_swap_registry_ix:any = [];
            create_swap_registry_ix.push(
                tokenSwapProgram.instruction.createRegistry(args.rateTokenIn, args.rateTokenOut,{
                    accounts: {
                    registry: registry_pda,
                    vaultTokenIn: vault_token_in_pda,
                    vaultTokenOut: vault_token_out_pda, 
                    admin: wallet.publicKey,
                    mintTokenIn: args.mintTokenIn,
                    mintTokenOut: args.mintTokenOut,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY
                    }
                })
            )
            const csr_sig = await sendTransactions(
                connection,
                wallet,
                [create_swap_registry_ix],
                [[]]
            )
            console.log(`csr_sig: ${csr_sig}`);
        }
        else {
            throw new WalletNotConnectedError()
        }
    }
  return (
    <div>
      <div className='gen-farm-stats'>
        <div className='gen-farm-stats-left'>
            <button className='Inside-Farm-btn' onClick={() => createSwapRegistry(createSwapRegistryAlphaArgs)}> Create Swap Registry</button>
        </div>
      </div>
    </div>
  )
}

export default CreateSwapRegistry
