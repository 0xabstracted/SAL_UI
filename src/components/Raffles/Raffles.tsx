import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection } from "@solana/web3.js";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import "../../css/App.css";
import LogoWhite from "../../assets/Logowhite.png";
import User from "../../assets/user.png";
import * as anchor from "@project-serum/anchor";
import { Metaplex } from "@metaplex-foundation/js";
import { UPDATE_AUTHORITY_OF_TOKEN_STRING } from "../AlphaStaking/StakePoolConfig";

const RaffleContent = (props: any) => {


    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl('devnet'));

    const [logoLoading, setLogoLoading] = useState(true);
    let d:any = new Date();
    const [gotNfts, setGotNfts] = useState(false);
    const [raffles, setRaffles] = useState([]);

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
        getRaffles();
        setTimeout(function() {
            setLogoLoading(false);
        }, 3000)
    }, [raffles,wallet]);

    const getRaffles = async () => {
        if (wallet && wallet.connected && !gotNfts) {
            const connection = new Connection(clusterApiUrl("devnet"));
            const metaplex = Metaplex.make(connection);
            const allNfts = await metaplex.nfts().findAllByOwner({owner: wallet?.publicKey!}).run();
            let temp_nfts:any = [];
            for (let index = 0; index < allNfts.length; index++) {
                const nft:any = allNfts[index];
                var is_ours = false;
                if (nft.updateAuthorityAddress.toBase58() == UPDATE_AUTHORITY_OF_TOKEN_STRING) {
                  is_ours = true;
                }
                if (is_ours) {
                    var xhr = new XMLHttpRequest();
                    xhr.addEventListener("readystatechange", function() {
                        if(this.readyState === 4) {
                            var obj:any = {
                                id:temp_nfts.length,
                                name: nft.name,
                                link: JSON.parse(this.responseText).image,
                                mint: nft.mintAddress,
                                updateAuthority: nft.updateAuthority,
                                creator: nft.creators[0].address,
                                tickets: temp_nfts.length * 10,
                                timeLeft: temp_nfts.length + ' days left'
                            }
                            temp_nfts.push(obj);
                            setRaffles(temp_nfts!);
                        }
                    });
                    xhr.open("GET", nft.uri);
                    xhr.send();
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
            {!logoLoading && wallet.connected && 
            <div className="raffle-parent">
                <div className="raffle-header">
                    <div className="raffle-user-parent">
                        <img src={User} className="raffle-user-img" alt="" />
                    </div>
                    <div className="create-raffle-parent">
                        <a href="/create-raffle" className="pull-left m-r-10"><button className="create-raffle-btn">Create Raffle</button></a>
                    </div>
                </div>
                <div className="create-raffle-body">
                    <div className="running-raffles-header-parent">
                        <h2 className="running-raffles-header">Raffles</h2>
                    </div>
                    <div className="running-raffles-body">
                        {raffles && raffles.length > 0 && raffles.map(function (item:any, i:any) {
                            return (
                              <div className="running-raffle-parent">
                                <div className="running-raffle-div">
                                    <img src={item.link} />
                                    <label className="raffle-title">{item.name}</label>
                                    <label className="raffle-time-tickets">Tickets: {item.tickets} <span className="raffle-time-left">{item.timeLeft}</span></label>
                                    <div className="pull-left full-width text-center">
                                        <button className="open-raffle-btn">Open Raffle</button>
                                    </div>
                                </div>
                              </div>
                            );
                        })}
                        {!(raffles && raffles.length > 0) &&
                        <div className="no-raffles-section">
                            <h2 className="no-raffles-text">No Raffles Now.</h2>
                            <div className="pull-left full-width m-t-10 m-b-10">
                                <a href="/create-raffle" className="pull-left m-r-10"><button className="create-raffle-btn">Create Raffle</button></a>
                            </div>
                        </div>
                        }
                    </div>
                </div>
            </div>
            }
            {!logoLoading && !wallet.connected && 
            <WalletDialogButton className="Connect-Wallet-btn">
                Connect Wallet
            </WalletDialogButton>
            }
        </div>
    );
};

export default RaffleContent;
