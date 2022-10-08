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
import { clusterApiUrl, Connection } from "@solana/web3.js";
import React, { useState } from "react";
import { mintNewFungibleTokenArgs, REWARD_MINT_GLITCH } from "./AlphaTokenConfig";
import { MintNewFungibleTokenArgs } from "./TokenInterface";
import SwappingIcon from "../../assets/swapping_icon.png";
import { sendTransactions } from '../../config/connection';
import LogoWhite from "../../assets/Logowhite.png";

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
      mint_new_fung_token_ix.push(
        createTransferCheckedInstruction(
          ownerNewTokenAccountPDA, // from (should be a token account)
          args.newMint, // mint
          userNewTokenAccountPDA, // to (should be a token account)
          args.ownerOldMint, // from's owner
          amount, // amount, if your deciamls is 8, send 10^8 for 1 token
          args.decimalsOld
        )
      );
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
            onClick={() => mintNewFungibleToken(mintNewFungibleTokenArgs)}
            disabled={glitchTokenVal <= 0}
          >
            Swap
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
