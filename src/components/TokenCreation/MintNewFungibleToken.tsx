import {
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, SystemProgram } from "@solana/web3.js";
import React, { useState } from "react";
import { mintNewFungibleTokenArgs, REWARD_MINT_GLITCH, ALPHA_OWNER_ATA } from "./AlphaTokenConfig";
import { MintNewFungibleTokenArgs } from "./TokenInterface";
import SwappingIcon from "../../assets/swapping_icon.png";
import { sendTransactions } from '../../config/connection';
import LogoWhite from "../../assets/Logowhite.png";
import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";
import { getStakeProgram } from "../../GrandProgramUtils/gemBank/getProgramObjects";
import { TOKEN_PROGRAM_ID } from "../../config/config";
import { alphaTokenSwapPda,alphaPotPda } from "../../GrandProgramUtils/AssociatedTokenAccountProgram/pda"

function MintNewFungibleToken() {
  const [glitchTokenVal, setGlitchTokenVal] = useState(0);
  const [alphaTokenVal, setAlphaTokenVal] = useState(0);
  const wallet = useWallet();

  const changeGlitchToken = async (val:any) => {
    setGlitchTokenVal(val);
    setAlphaTokenVal(val);
  };

  const getTokenAccountBalanceFn =async () => {
    let ata = await getAssociatedTokenAddress(
      REWARD_MINT_GLITCH, // mint
      wallet?.publicKey! // owner
    );
  
    let tokenAmount = await connection.getTokenAccountBalance(ata);
    if (glitchTokenVal == 0) {
      setGlitchTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
      setAlphaTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
    }
  }
  getTokenAccountBalanceFn();

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const mintNewFungibleToken = async (args: MintNewFungibleTokenArgs) => {
    if (wallet.publicKey) {
      // let stakeProgram = await getStakeProgram(wallet);
      let mint_new_fung_token_ix: any = [];
      let userOldTokenAccountPDA = await getAssociatedTokenAddress(
        args.oldMint, // mint
        wallet.publicKey // owner
      );
      let ownerOldTokenAccountPDA = await getAssociatedTokenAddress(
        args.oldMint, // mint
        args.ownerOldMint // owner
      );
      let ownerNewTokenAccountPDA = await getAssociatedTokenAddress(
        args.newMint, // mint
        args.ownerOldMint // owner
      );
      let userNewTokenAccountPDA = await getAssociatedTokenAddress(
        args.newMint, // mint
        wallet.publicKey // owner
      );
      let userNewTokenAccount = await getAccount(
        connection,
        userNewTokenAccountPDA
      );

      console.log(
        `userOldTokenAccountPDA ATA: ${userOldTokenAccountPDA.toBase58()}`
      );
      console.log(
        `ownerOldTokenAccountPDA ATA: ${ownerOldTokenAccountPDA.toBase58()}`
      );
      console.log(
        `userNewTokenAccountPDA ATA: ${userNewTokenAccountPDA.toBase58()}`
      );
      let amount = glitchTokenVal * (10 ** args.decimalsOld);
      console.log('amount : '+ amount);
      mint_new_fung_token_ix.push(
        createTransferCheckedInstruction(
          userOldTokenAccountPDA, // from (should be a token account)
          args.oldMint, // mint
          ownerOldTokenAccountPDA, // to (should be a token account)
          wallet.publicKey, // from's owner
          amount, // amount, if your deciamls is 8, send 10^8 for 1 token
          args.decimalsOld // decimals
        )
      );
      if (!userNewTokenAccount) {
        mint_new_fung_token_ix.push(
          createAssociatedTokenAccountInstruction(
            wallet.publicKey, // payer
            userNewTokenAccountPDA, // ata
            wallet.publicKey, // owner
            args.newMint // mint
          )
        );
      }
      // mint_new_fung_token_ix.push(
      //   createTransferCheckedInstruction(
      //     ownerNewTokenAccountPDA, // from (should be a token account)
      //     args.newMint, // mint
      //     userNewTokenAccountPDA, // to (should be a token account)
      //     args.ownerOldMint, // from's owner
      //     amount, // amount, if your deciamls is 8, send 10^8 for 1 token
      //     args.decimalsOld
      //   )
      // );
      const mint_new_fung_token_sig = await sendTransactions(
        connection,
        wallet,
        [mint_new_fung_token_ix],
        [[]]
    )
    console.log(mint_new_fung_token_sig)
    } else {
      throw new WalletNotConnectedError();
    }
  };

  const testingBtn =async (args: MintNewFungibleTokenArgs) => {
    const [alpha_token_swap_pda, bumpAlphaTokenSwap] = await alphaTokenSwapPda(args.ownerOldMint, args.newMint);
    const [alpha_pot_pda, bumpAlphaPot] = await alphaPotPda(alpha_token_swap_pda, args.newMint);
    console.log(alpha_pot_pda.toBase58());
  }

  const alphaTokenSwap =async (args: MintNewFungibleTokenArgs) => {
    if (wallet.publicKey) {
      let stakeProgram = await getStakeProgram(wallet);
      let token_swap_instructions: any = [];
      let amount = new BN(glitchTokenVal);
      let userOldTokenAccountPDA = await getAssociatedTokenAddress(
        args.oldMint, // mint
        wallet.publicKey // owner
      );
      let ownerOldTokenAccountPDA = await getAssociatedTokenAddress(
        args.oldMint, // mint
        args.ownerOldMint // owner
      );
      let ownerNewTokenAccountPDA = await getAssociatedTokenAddress(
        args.newMint, // mint
        args.ownerOldMint // owner
      );
      let userNewTokenAccountPDA = await getAssociatedTokenAddress(
        args.newMint, // mint
        wallet.publicKey // owner
      );
      

      console.log(
        `userOldTokenAccountPDA ATA: ${userOldTokenAccountPDA.toBase58()}`
      );
      console.log(
        `ownerOldTokenAccountPDA ATA: ${ownerOldTokenAccountPDA.toBase58()}`
      );
      console.log(
        `userNewTokenAccountPDA ATA: ${userNewTokenAccountPDA.toBase58()}`
      );
      let amount_old = glitchTokenVal * (10 ** args.decimalsOld);
      console.log('amount : '+ amount);
      console.log(args.newMint);
      amount = new BN(amount_old);
      const [alpha_token_swap_pda, bumpAlphaTokenSwap] = await alphaTokenSwapPda(args.ownerOldMint, args.newMint);
      const [alpha_pot_pda, bumpAlphaPot] = await alphaPotPda(alpha_token_swap_pda, args.newMint);
      token_swap_instructions.push(
        createTransferCheckedInstruction(
          userOldTokenAccountPDA, // from (should be a token account)
          args.oldMint, // mint
          ownerOldTokenAccountPDA, // to (should be a token account)
          wallet.publicKey, // from's owner
          amount_old, // amount, if your deciamls is 8, send 10^8 for 1 token
          args.decimalsOld // decimals
        )
      );
      let userNewTokenAccount;
      try {
        userNewTokenAccount = await getAccount(
          connection,
          userNewTokenAccountPDA
        );
      } catch (error) {
        if (!userNewTokenAccount) {
          token_swap_instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey, // payer
              userNewTokenAccountPDA, // ata
              wallet.publicKey, // owner
              args.newMint // mint
            )
          );
        }
      }    
      
      token_swap_instructions.push(stakeProgram.instruction.transferAlphaTokens(bumpAlphaTokenSwap, bumpAlphaPot, amount,{
        accounts: {
          alphaTokenswap: alpha_token_swap_pda,
          alphaCreator: args.ownerOldMint,
          alphaPot: alpha_pot_pda,
          // alphaOwnerSource: ALPHA_OWNER_ATA,
          alphaMint: args.newMint,
          userTokenAccount: userNewTokenAccountPDA,
          user: wallet.publicKey,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      }));
      const token_swap__sig = await sendTransactions(
        connection,
        wallet,
        [token_swap_instructions],
        [[]]
      )
      console.log(token_swap__sig);
    } else {
      throw new WalletNotConnectedError();
    }
  }
  return (
    <div>
      <div className="swapping-logo-parent">
        <img src={LogoWhite} className="swapping-logo" alt="" />
      </div>
      <div className="swapping-box">
        <label className="swapping-label">Trade</label>
        <div className="from-token-box">
          <div className="token-image-parent">
            <img
              className="token-image"
              src="https://dgnvzn3x5fqusqpvst65sizekrfhwtklzokfk7usi64h7erzb7iq.arweave.net/GZtct3fpYUlB9ZT92SMkVEp7TUvLlFV-kke4f5I5D9E?ext=jpg"
              alt=""
            />
          </div>
          <div className="token-name-parent">
            <h2 className="token-name">GLITCH</h2>
          </div>
          <div className="token-count-parent">
            <input
              type="number"
              max={1000000}
              className="token-count-input"
              value={glitchTokenVal}
              onChange={(event) =>
                changeGlitchToken(parseInt(event.target.value))
              }
            />
          </div>
        </div>
        <div className="pull-left full-width">
          <div className="swap-icon-parent">
            <img src={SwappingIcon} className="swap-icon" alt="" />
          </div>
        </div>
        <div className="to-token-box">
          <div className="token-image-parent">
            <img
              className="token-image"
              src="https://dgnvzn3x5fqusqpvst65sizekrfhwtklzokfk7usi64h7erzb7iq.arweave.net/GZtct3fpYUlB9ZT92SMkVEp7TUvLlFV-kke4f5I5D9E?ext=jpg"
              alt=""
            />
          </div>
          <div className="token-name-parent">
            <h2 className="token-name">ALPHA</h2>
          </div>
          <div className="token-count-parent">
            <input
              type="number"
              max={1000000}
              className="token-count-input"
              value={alphaTokenVal}
              onChange={(event) =>
                changeGlitchToken(parseInt(event.target.value))
              }
            />
          </div>
        </div>
        <div className="pull-left full-width text-center">
          <button
            className="swap-btn"
            onClick={() => alphaTokenSwap(mintNewFungibleTokenArgs)}
            disabled={glitchTokenVal <= 0}
          >
            Swap
          </button>
          <button className="swap-btn"
            onClick={() => testingBtn(mintNewFungibleTokenArgs)}
          >
            Testing
          </button>
        </div>
      </div>
      {/* <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button
            className="Inside-Farm-btn"
            onClick={() => mintNewFungibleToken(mintNewFungibleTokenArgs)}
          >
            Swap
          </button>
        </div>
      </div> */}
    </div>
  );
}

export default MintNewFungibleToken;
