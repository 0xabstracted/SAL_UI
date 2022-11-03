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

const SingleRaffle = () => {

    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl('devnet'));

    const params = useParams();
    console.log(params['*']);

    const [logoLoading, setLogoLoading] = useState(true);
    let d:any = new Date();
    const [currentDate, setCurrentDate] = useState(d);
    const [raffleTicketSupply, setRaffleTicketSupply] = useState(0);
    const [raffleSelectedToken, setRaffleselectedToken] = useState("GLTCH");
    const [raffleTicketPrice, setRaffleTicketPrice] = useState(0);
    const [holderCreator, setHolderCreator] = useState("");
    const [holderCreatorOptionOne, setHolderCreatorOptionOne] = useState("");
    const [holderCreatorOptionTwo, setHolderCreatorOptionTwo] = useState("");
    const [ticketLimit, setTicketLimit] = useState(1);
    const [raffleWinners, setRaffleWinners] = useState(1);
    const [termsAccepted, setTermsAccepted] = useState("false");
    const [isRaffleNftOpen, setIsRaffleNftOpen] = useState(false);
    const [gotNfts, setGotNfts] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [raffles, setRaffles] = useState<any>(null);
    const [raffleSelectedNFT, setRaffleSelectedNFT] = useState<any>(null);

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
        getRaffle();
        setTimeout(function() {
            setLogoLoading(false);
        }, 3000)
    }, [raffles,wallet]);

    const handleDateChange =async (id:any) => {
        setCurrentDate(id);
        console.log(id)
    }

    const changeTicket =async (val:any) => {
        val = parseInt(val);
        if (val > 1) {
            setTicketLimit(val);
        }
        else {
            setTicketLimit(1);
        }
    }

    const changeWinners =async (val:any) => {
        val = parseInt(val);
        if (val > 1) {
            setRaffleWinners(val);
        }
        else {
            setRaffleWinners(1);
        }
    }

    const checkTerms =async (val:any) => {
        console.log('check terms');
        if (val == "false") {
            setTermsAccepted("true");
        }
        else {
            setTermsAccepted("false");
        }
    }

    const onRaffleNFTAfterOpen = async () => {
        console.log('Logging after modal opening');
    }

    const onRaffleNFTClose = async () => {
        console.log('Logging before modal closing');
    }

    const confirmRaffleNft =async () => {
        setIsRaffleNftOpen(false);
    }

    const getRaffle = async () => {
        if (wallet && wallet.connected && !gotNfts) {
            const connection = new Connection(clusterApiUrl("devnet"));
            const metaplex = Metaplex.make(connection);
            const allNfts = await metaplex.nfts().findAllByOwner({owner: wallet?.publicKey!}).run();
            let temp_nfts:any = [];
            for (let index = 0; index < allNfts.length; index++) {
                const nft:any = allNfts[index];
                var is_ours = false;
                if (temp_nfts && temp_nfts.length > 0) {
                    // break;
                }
                else {
                    if (nft.mintAddress.toBase58() == params['*']) {
                        var xhr = new XMLHttpRequest();
                        xhr.addEventListener("readystatechange", function() {
                            if(this.readyState === 4) {
                                var obj:any = {
                                    id:temp_nfts.length,
                                    name: nft.name,
                                    link: JSON.parse(this.responseText).image,
                                    mint: nft.mintAddress,
                                    updateAuthority: nft.updateAuthority,
                                    creator: nft.creators[0].address
                                }
                                temp_nfts.push(obj);
                                setRaffles(obj!);
                            }
                        });
                        xhr.open("GET", nft.uri);
                        xhr.send();
                    }
                }
            }
            setGotNfts(true);
        }
    }

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
                        <div className="raffle-nft-select-parent">
                            {raffles && 
                            <div className="raffle-nft-parent-no-hover">
                                <img src={raffles.link} className="raffle-selected-nft-img" alt="" />
                            </div>
                            }
                        </div>
                        <div className="raffle-details-parent">
                            <div className="raffle-details-div">
                                <div className="pull-left full-width m-t-5 m-b-5">
                                    <label className="sal-logo-text">Secret Alpha Labs</label>
                                    <h3 className="raffle-nft-name-header">{raffles.name}</h3>
                                    <div className="pull-left inline-block">
                                        <div className="pull-left m-r-10">
                                            <label className="raffle-nft-details-price">NFT Floor Price : 2.5</label>
                                        </div>
                                        <div className="pull-left m-l-10 m-r-10">
                                            <label className="raffle-nft-details-price">Total Ticket Value : 3.12</label>
                                        </div>
                                    </div>
                                </div>
                                <div className="terms-conditions-parent">
                                    <h3 className="terms-conditions-header">Terms and Conditions</h3>
                                    <ul className="terms-conditions-ul">
                                        <li>When you create a raffle, the NFT prize you have chosen will be transferred from your wallet into an escrow wallet.</li>
                                        <li>You will be charged an up-front rent fee, in SOL, which will be taken in proportion to the number of tickets you choose to raffle, with a maximum rent fee of 1.1 SOL. The rent fee will be automatically refunded after the raffle concludes.</li>
                                        <li>FFF and TFF holders will get a 50% fee waiver for staking or sending foxes on missions prior to creating the raffle and will be hosted on the “Featured” section of the home page.</li>
                                        <li>If no tickets are sold for your raffle, your NFT will be returned to you. If even one ticket is sold, the NFT is non-refundable to you.</li>
                                        <li>You can specify the amount of time a raffle runs at the creation of the raffle. Raffles require a minimum 24 hour run time.</li>
                                        <li>Raffle will take a 5% commission fee from the ticket sales.</li>
                                        <li>To enable Holder-only, you will be charged 1 SOL per raffle withdrawn at the time of creation. More information about holder-only raffles is available on the create raffle site.</li>
                                        <li>If you incorrectly add the "multiple winners" option to a verified NFT raffle, the #1 winner in the list of winners will receive the NFT</li>
                                        <li>Raffles <b>CANNOT</b> be edited or canceled once a ticket is sold.</li>
                                        <li>Purchasing your own tickets with alternative wallets will result in your raffle being marked as suspicious and removed from all search results on RAFFFLE</li>
                                        <li>Rafffle, its agents, directors, or officers shall not assume any liability or responsibility for your use of Rafffle, promoting or marketing the raffles.</li>
                                    </ul>
                                </div>
                                <div className="create-raffle-button-parent">
                                    <div className="terms-conditions-checkbox-parent">
                                        <label className="terms-conditions-checkbox-label"><input type="checkbox" value={termsAccepted} onChange={(event) => checkTerms(event.target.value)} className="raffle-terms-checkbox" /> I accept the terms & conditions</label>
                                    </div>
                                    <div className="create-raffle-btn-parent">
                                        <button className={termsAccepted == "false" ? "create-raffle-button disabled-raffle" : "create-raffle-button"}>Create Raffle</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            }
            <Modal
                id="raffle-nft"
                contentLabel="Choose NFT for raffles creation"
                closeTimeoutMS={150}
                ariaHideApp={false}
                isOpen={isRaffleNftOpen}
                onAfterOpen={onRaffleNFTAfterOpen}
                onRequestClose={onRaffleNFTClose}>
                <div className="raffle-nft-modal-body">
                    <h2 className="nft-prize-header">Choose NFT for Raffle Prize <img onClick={() => setIsRaffleNftOpen(false)} src={Close} className="nft-raffle-prize-close" alt="" /></h2>
                    <div className="raffle-nfts-body">
                        <div className="nft-parent-div">
                            {raffles && raffles.length > 0 && raffles.map(function (item:any, i:any) {
                            return (
                                <div className="nft-div" key={i} style={{boxShadow: raffleSelectedNFT == item ? "1px 1px 5px 1px #00f5ffab": "none"}} onClick={() => setRaffleSelectedNFT(item)}>
                                    <img src={item.link} />
                                </div>
                            );
                            })}
                        </div>
                    </div>
                    {raffleSelectedNFT && 
                    <div className="raffle-nft-select-button-parent">
                        <button className="select-raffle-nft-btn" onClick={() => confirmRaffleNft()}>Select NFT</button>
                    </div>
                    }
                </div>
            </Modal>
            {!logoLoading && !wallet.connected && 
            <WalletDialogButton className="Connect-Wallet-btn" onClick={() => onRaffleNFTAfterOpen()}>
                Connect Wallet
            </WalletDialogButton>
            }
        </div>
    );
};

export default SingleRaffle;
