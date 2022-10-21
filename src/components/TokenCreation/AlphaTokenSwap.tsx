import {
  createAssociatedTokenAccountInstruction,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { useState } from "react";
import { mintNewFungibleTokenArgs, REWARD_MINT_GLITCH, REWARD_MINT_GLTCH, RYAN_ADDRESS } from "./AlphaTokenConfig";
import { AlphaTokenSwapArgs } from "./TokenInterface";
import SwappingIcon from "../../assets/swapping_icon.png";
import { sendTransactions } from '../../config/connection';
import LogoWhite from "../../assets/Logowhite.png";
import { BN } from "@project-serum/anchor";
import { TOKEN_PROGRAM_ID } from "../../config/config";
import { getTokenSwapProgramObject } from "../../GrandProgramUtils/TokenSwap/GetProgramObject";
import { findRegistryPDA, findVaultTokenInPDA, findVaultTokenOutPDA } from "../../GrandProgramUtils/TokenSwap/pda";
import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { AlertState } from "../../utils/utils";

function AlphaTokenSwap() {
  const [glitchTokenVal, setGlitchTokenVal] = useState(0);
  const [glitchTokenBal, setGlitchTokenBal] = useState(0);
  const [alphaTokenVal, setAlphaTokenVal] = useState(0);
  const [alphaTokenBal, setAlphaTokenBal] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });
  const wallet = useWallet();

  const changeGlitchToken = async (val:any) => {
    setGlitchTokenVal(val);
    setAlphaTokenVal(val);
  };

  const getTokenAccountBalanceFn =async () => {
    
    try {
      let ata = await getAssociatedTokenAddress(
        REWARD_MINT_GLITCH, // mint
        wallet?.publicKey! // owner
      );
      let tokenAmount = await connection.getTokenAccountBalance(ata);
      if (tokenAmount != null) {
        // setGlitchTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        setGlitchTokenBal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        // setAlphaTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        // setAlphaTokenBal(parseInt(tokenAmountAlpha.value.amount) / 10 ** tokenAmountAlpha.value.decimals);
      }
      let alpha_ata = await getAssociatedTokenAddress(
        REWARD_MINT_GLTCH, // mint
        wallet?.publicKey! // owner
      );
      let tokenAmountAlpha = await connection.getTokenAccountBalance(alpha_ata);
      // if (glitchTokenVal === 0) {
      if (tokenAmountAlpha != null) {
        // setGlitchTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        // setGlitchTokenBal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        // setAlphaTokenVal(parseInt(tokenAmount.value.amount) / 10 ** tokenAmount.value.decimals);
        setAlphaTokenBal(parseInt(tokenAmountAlpha.value.amount) / 10 ** tokenAmountAlpha.value.decimals);
      }
    } catch (error) {
      
    }  
  }
  getTokenAccountBalanceFn();

  const percentageBtn =async (str:string) => {
    if (str === '50') {
      let k = parseInt((glitchTokenBal / 2).toFixed(0));
      setGlitchTokenVal(k);
    }
    else if (str === '100') {
      setGlitchTokenVal(glitchTokenBal);
    }
  }

  const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

  const alphaTokenSwap =async (args: AlphaTokenSwapArgs) => {
    if (wallet.publicKey) {
      setSwapping(true);
      let tokenSwapProgram = await getTokenSwapProgramObject(wallet);
      let token_swap_instructions: any = [];
      let amount = new BN(glitchTokenVal);
      const [registry_pda] = await findRegistryPDA(RYAN_ADDRESS, args.mintTokenIn, args.mintTokenOut);
      const [vault_token_in_pda] = await findVaultTokenInPDA(registry_pda);
      const [vault_token_out_pda] = await findVaultTokenOutPDA(registry_pda);
        
      let userTokenInAccountPDA = await getAssociatedTokenAddress(
        args.mintTokenIn, // mint
        wallet.publicKey // owner
      );
      let userTokenOutAccountPDA = await getAssociatedTokenAddress(
        args.mintTokenOut, // mint
        wallet.publicKey // owner
      );
      

      console.log(
        `userTokenInAccountPDA ATA: ${userTokenInAccountPDA.toBase58()}`
      );
      console.log(
        `userTokenOutAccountPDA ATA: ${userTokenOutAccountPDA.toBase58()}`
      );
      let amount_old = glitchTokenVal * (10 ** args.decimalsTokenIn);
      console.log('amount : '+ amount);
      console.log(args.mintTokenOut);
      amount = new BN(amount_old);
      
      let userTokenOutAccount;
      try {
        userTokenOutAccount = await getAccount(
          connection,
          userTokenOutAccountPDA
        );
      } catch (error) {
        if (!userTokenOutAccount) {
          token_swap_instructions.push(
            createAssociatedTokenAccountInstruction(
              wallet.publicKey, // payer
              userTokenOutAccountPDA, // ata
              wallet.publicKey, // owner
              args.mintTokenOut // mint
            )
          );
        }
      }    
      
      token_swap_instructions.push(tokenSwapProgram.instruction.swap(amount,{
        accounts: {
          registry: registry_pda,
          swapper: wallet.publicKey,
          vaultTokenIn: vault_token_in_pda,
          vaultTokenOut: vault_token_out_pda,
          buyerTokenInAccount: userTokenInAccountPDA,
          buyerTokenOutAccount: userTokenOutAccountPDA,
          tokenProgram: TOKEN_PROGRAM_ID
        }
      }));
      try {
        const token_swap__sig = await sendTransactions(
          connection,
          wallet,
          [token_swap_instructions],
          [[]]
        )
        console.log(token_swap__sig);
        setSwapping(false);
        setAlertState({
          open: true,
          message: 'Successfully Swapped',
          severity: 'success',
        });
      } catch (error) {
        setSwapping(false);
        setAlertState({
          open: true,
          message: 'Please try again later',
          severity: 'error',
        });
      }
    } else {
      setSwapping(false);
      throw new WalletNotConnectedError();
    }
  }
  return (
    <div>
      <div className="swapping-logo-parent">
        <img src={LogoWhite} className="swapping-logo" alt="" />
      </div>
      <div className="swapping-box">
        <div className="swapping-box-child">
        <label className="swapping-label">3-Tier Token System</label>
        <div className="from-token-box">
          <div className="from-token-header">
            <label className="from-token-text"></label>
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
            <label className="from-token-text"></label>
            <label className="from-token-bal">Bal : {alphaTokenBal}</label>
          </div>
          <div className="token-image-parent">
            <img
              className="token-image"
              src="https://phnhi7zckm7jflblrjawdoei6ymbfjtfceqihngixxho6rkxluhq.arweave.net/edp0fyJTPpKsK4pBYbiI9hgSpmURIIO0yL3O70VXXQ8?ext=png"
              alt=""
            />
          </div>
          <div className="token-name-parent">
            <h2 className="token-name">GLTCH</h2>
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
            className={!swapping ? "swap-btn": "swap-btn loading-btn"}
            onClick={() => alphaTokenSwap(mintNewFungibleTokenArgs)}
            disabled={glitchTokenVal <= 0}
          >
            {!swapping && <span>Swap</span>}
            {swapping && <span>Swapping ...</span>}
          </button>
        </div>
        </div>
      </div>
      <Snackbar
          className="snack-bar"
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          <Alert
            className="bold"
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
          >
            {alertState.message}
          </Alert>
        </Snackbar>
    </div>
  );
}

export default AlphaTokenSwap;
