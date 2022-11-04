import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import LogoWhite from "../../assets/Logowhite.png";
import User from "../../assets/user.png";
import Add from "../../assets/add.png";
import Close from "../../assets/close.png";
import Pencil from "../../assets/pencil.png";
import DatePicker from "react-datepicker";
import Modal from 'react-modal';
import * as anchor from "@project-serum/anchor";
import { REWARD_MINT_GLITCH } from "../TokenCreation/AlphaTokenConfig";
import { Metaplex } from "@metaplex-foundation/js";
import { UPDATE_AUTHORITY_OF_TOKEN_STRING } from "../AlphaStaking/StakePoolConfig";

import "react-datepicker/dist/react-datepicker.css";
import "../../css/App.css";
import { useParams } from "react-router-dom";

const StartStaking = () => {

    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl('devnet'));

    const params = useParams();
    console.log(params['*']);

    const [logoLoading, setLogoLoading] = useState(true);
    let d:any = new Date();
    const [currentDate, setCurrentDate] = useState(d);
    const [raffleTicketSupply, setRaffleTicketSupply] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const wallet = useWallet();

    const anchorWallet = useMemo(() => {
        // wallet.connect();
        if (
          !wallet ||
          !wallet.publicKey ||
          !wallet.signAllTransactions ||
          !wallet.signTransaction
        ) {
          return;
        }
    
        return {
          publicKey: wallet.publicKey,
          signAllTransactions: wallet.signAllTransactions,
          signTransaction: wallet.signTransaction,
        } as anchor.Wallet;
    }, [wallet]);

    useEffect(() => {
        // getRaffle();
        setTimeout(function() {
            setLogoLoading(false);
        }, 3000)
    }, [wallet]);

    const onRaffleNFTAfterOpen = async () => {
        console.log('Logging after modal opening');
    }

    // const getRaffle = async () => {
    //     if (wallet && wallet.connected && !gotNfts) {
    //         const connection = new Connection(clusterApiUrl("devnet"));
    //         const metaplex = Metaplex.make(connection);
    //         const allNfts = await metaplex.nfts().findAllByOwner({owner: wallet?.publicKey!}).run();
    //         let temp_nfts:any = [];
    //         for (let index = 0; index < allNfts.length; index++) {
    //             const nft:any = allNfts[index];
    //             var is_ours = false;
    //             if (temp_nfts && temp_nfts.length > 0) {
    //                 // break;
    //             }
    //             else {
    //                 if (nft.mintAddress.toBase58() == params['*']) {
    //                     var xhr = new XMLHttpRequest();
    //                     xhr.addEventListener("readystatechange", function() {
    //                         if(this.readyState === 4) {
    //                             var obj:any = {
    //                                 id:temp_nfts.length,
    //                                 name: nft.name,
    //                                 link: JSON.parse(this.responseText).image,
    //                                 mint: nft.mintAddress,
    //                                 updateAuthority: nft.updateAuthority,
    //                                 creator: nft.creators[0].address
    //                             }
    //                             temp_nfts.push(obj);
    //                             setRaffles(obj!);
    //                         }
    //                     });
    //                     xhr.open("GET", nft.uri);
    //                     xhr.send();
    //                 }
    //             }
    //         }
    //         setGotNfts(true);
    //     }
    // }

    return (
        <div className={logoLoading ? "main-bg-raffles black-bg" : "main-bg-raffles"}>
            {logoLoading && (
                <div className="logo-loader-parent">
                <img alt="Alpha-logo" src={LogoWhite} className="pulse-animation" />
                </div>
            )}
            {!logoLoading && wallet && wallet.connected &&
            <div className="raffle-parent">
                <div className="raffle-header">
                    <div className="raffle-user-parent">
                        <img src={User} onClick={() => setShowUserMenu(!showUserMenu)} className="raffle-user-img" alt="" />
                    </div>
                    {showUserMenu && 
                    <div className="raffle-user-menu-parent">
                      <ul>
                        <li className="pointer"><a href="/raffles">Running Raffles</a></li>
                      </ul>
                    </div>
                    }
                </div>
                <div className="create-raffle-body">
                    <div className="pull-left full-width">
                        
                    </div>

                </div>
            </div>
            }
            {!logoLoading && !wallet.connected && 
            <WalletDialogButton className="Connect-Wallet-btn" onClick={() => onRaffleNFTAfterOpen()}>
                Connect Wallet
            </WalletDialogButton>
            }
        </div>
    );
};

export default StartStaking;
