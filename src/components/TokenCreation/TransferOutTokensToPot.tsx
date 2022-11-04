import { createTransferCheckedInstruction } from 'solanaSPLToken036';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { sendTransactions } from '../../config/connection';
import { findAssociatedTokenAddress } from '../../GrandProgramUtils/AssociatedTokenAccountProgram/pda';
import { findRegistryPDA, findVaultTokenOutPDA } from '../../GrandProgramUtils/TokenSwap/pda';
import { transferOutTokensToPotOwnerArgs } from './AlphaTokenConfig';
import { TransferOutTokensToPotArgs } from './TokenInterface';

function TransferOutTokensToPot() {
    const wallet = useWallet()

    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    const transferOutTokensToPot = async (args: TransferOutTokensToPotArgs) => {

        const [registry_pda] = await findRegistryPDA(wallet.publicKey!, args.mintTokenIn, args.mintTokenOut);
        const [vault_token_out_pda] = await findVaultTokenOutPDA(registry_pda);
        let  [ata, ataBump]  = await findAssociatedTokenAddress(
            wallet?.publicKey!, // owner
            args.mintTokenOut, // mint
        );
        console.log('ata : ', ata.toBase58());
        
        if (wallet.publicKey) {
            let create_swap_registry_ix:any = [];
            create_swap_registry_ix.push(
                createTransferCheckedInstruction(
                    ata, // from (should be a token account)
                    args.mintTokenOut, // mint
                    vault_token_out_pda, // to (should be a token account)
                    wallet.publicKey, // from's owner
                    args.amount, // amount, if your deciamls is 8, send 10^8 for 1 token
                    args.decimalsTokenOut // decimals
                )
            )
            const totp_sig = await sendTransactions(
                connection,
                wallet,
                [create_swap_registry_ix],
                [[]]
            )
            console.log(`totp_sig: ${totp_sig}`);
        }
        else {
            throw new WalletNotConnectedError()
        }
    }

  return (
    <div>
      <div className='gen-farm-stats'>
        <div className='gen-farm-stats-right'>
            <button className='Inside-Farm-btn' onClick={() => transferOutTokensToPot(transferOutTokensToPotOwnerArgs)}> Transfer to Pot</button>
        </div>
      </div>
    </div>
  )
}

export default TransferOutTokensToPot
