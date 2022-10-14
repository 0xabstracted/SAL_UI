import {
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, SystemProgram } from "@solana/web3.js";
import React, { useState } from "react";
import { mintNewFungibleTokenArgs, REWARD_MINT_GLITCH, ALPHA_OWNER_ATA, REWARD_MINT_GLTCH } from "./AlphaTokenConfig";
import { AlphaTokenSwapArgs } from "./TokenInterface";
import SwappingIcon from "../../assets/swapping_icon.png";
import { sendTransactions } from '../../config/connection';
import LogoWhite from "../../assets/Logowhite.png";
import { BN } from "@project-serum/anchor";
import { getStakeProgram } from "../../GrandProgramUtils/GemBank/GetProgramObjects";
import { TOKEN_PROGRAM_ID } from "../../config/config";
import { alphaTokenSwapPda,alphaPotPda } from "../../GrandProgramUtils/AssociatedTokenAccountProgram/pda"

function AlphaTokenSwap() {
  const [glitchTokenVal, setGlitchTokenVal] = useState(0);
  const [glitchTokenBal, setGlitchTokenBal] = useState(0);
  const [alphaTokenVal, setAlphaTokenVal] = useState(0);
  const [alphaTokenBal, setAlphaTokenBal] = useState(0);
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

    let alpha_ata = await getAssociatedTokenAddress(
      REWARD_MINT_GLTCH, // mint
      wallet?.publicKey! // owner
    );
    try {
      let tokenAmount = await connection.getTokenAccountBalance(ata);
      let tokenAmountAlpha = await connection.getTokenAccountBalance(alpha_ata);
      if (glitchTokenVal == 0) {
        // setGlitchTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        setGlitchTokenBal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        // setAlphaTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        setAlphaTokenBal(parseInt(tokenAmountAlpha.value.amount) / 10 ** tokenAmountAlpha.value.decimals);
      }
    } catch (error) {
      
    }  
  }
  getTokenAccountBalanceFn();

  const percentageBtn =async (str:string) => {
    if (str == '50') {
      let k = parseInt((glitchTokenBal / 2).toFixed(0));
      setGlitchTokenVal(k);
    }
    else if (str == '100') {
      setGlitchTokenVal(glitchTokenBal);
    }
  }

  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

  const alphaTokenSwap =async (args: AlphaTokenSwapArgs) => {
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
          <div className="from-token-header">
            <label className="from-token-text">From</label>
            <label className="from-token-bal">Bal : {glitchTokenBal}</label>
          </div>
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
            <button className="bal-half-btn" onClick={() => percentageBtn('50')}>50%</button>
            <button className="bal-half-btn" onClick={() => percentageBtn('100')}>100%</button>
            <input
              type="number"
              max={100000000}
              className="token-count-input"
              value={glitchTokenVal}
              pattern="^[0-9]*[.,]?[0-9]{0,9}$"
              inputMode='numeric'
              min="0"
              step="1e-9"
              onChange={(event) =>
                changeGlitchToken(parseInt(event.target.value))
              }
            />
          </div>
        </div>
        <div className="pull-left full-width text-center">
          <div className="swap-icon-parent">
            <img src={SwappingIcon} className="swap-icon" alt="" />
          </div>
        </div>
        <div className="to-token-box">
          <div className="from-token-header">
            <label className="from-token-text">To</label>
            <label className="from-token-bal">Bal : {alphaTokenBal}</label>
          </div>
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
              max={100000000}
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
        </div>
      </div>
    </div>
  );
}

export default AlphaTokenSwap;
