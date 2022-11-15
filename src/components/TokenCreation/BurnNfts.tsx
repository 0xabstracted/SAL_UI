import { keypairIdentity, Metaplex } from '@metaplex-foundation/js';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, clusterApiUrl, Keypair, PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react'
import { getAssociatedTokenAddress } from 'solanaSPLToken036';
import { COLLECTION_ID } from '../../config/config';
import { UPDATE_AUTHORITY_OF_TOKEN_STRING } from '../AlphaStaking/StakePoolConfig';
import { REWARD_MINT_GLITCH } from './AlphaTokenConfig';

export const  BurnNfts = () => {
  const [nfts, setNFts] = useState<any>([]);
  const [gotNfts, setGotNfts] = useState(false);
  const wallet = useWallet();
  const burnNftsFn = async () => {
        // const connectionMetaplex = new Connection(
        //   "https://api.metaplex.solana.com",
        //   "confirmed"
        // );
        // const metadata:any = Metadata;
        // // const walletAddress = "6vRx1iVZo3xfrBHdpvuwArL2jucVj9j9nLpd2VUTTGMG"
        // const nftsmetadata = await metadata.findDataByOwner(connectionMetaplex, wallet.publicKey?.toBase58());
        // console.log(nftsmetadata);
        // const connection = new Connection(clusterApiUrl("devnet"));
        // const wallet = anchor.web3.Keypair.generate();
    
        // const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
        // const myNfts = await metaplex.nfts().findAllByOwner(wallet.publicKey);
        // console.log(myNfts);
        // const nftsmetadata = await Metadata.findDataByOwner(props.connection, wallet.publicKey);
        // console.log(nftsmetadata)
        if (wallet && wallet.connected && !gotNfts) {
          const connection = new Connection(clusterApiUrl("devnet"));
          const metaplex = Metaplex.make(connection);
          const allNfts = await metaplex
                              .nfts()
                                .findAllByOwner({ owner: wallet?.publicKey! })
                                .run();
        console.log(allNfts.length);
          for (let index = 0; index < 1000; index++) {
              const nft:any = allNfts[index];
              var creators = nft.creators;
              var is_ours = false;
              const parameters = {
                mintAddress : nft.mintAddress
              }
              const parameters1 = {
                mintAddress : nft.mintAddress,
                collectionMintAddress: new PublicKey("HMVefCQzjXU3R7ptKau17WQ2YX5hcjGygz2Zug73ndLH"),
              }
              var bhar = await metaplex.nfts().unverifyCollection(parameters1).run();
              console.log(bhar);
              var k = await metaplex.nfts().delete(parameters).run();
              console.log(k);
          } 
            // console.log(temp_nfts);
          setGotNfts(true);
        }
      }

    
  return (
    <div>
      <div className="pull-left full-width full-height">
        <div className="stake-room-header">
        <h2>NFT Selection</h2>
        </div>
        <div className="nft-parent-div">
        </div>
        {/* {stakedNft &&  */}
        <div className="stake-button-div"> 
            <button className="nft-select-button" onClick={burnNftsFn}>Burn</button>
        </div>
        {/* } */}
      </div>
    </div>
  )
}
