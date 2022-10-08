/* eslint-disable @typescript-eslint/no-unused-vars */
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';

import * as anchor from '@project-serum/anchor'

import { useState } from 'react'

import { getStakeProgram, GEM_BANK_PROGRAM_ID } from '../../GrandProgramUtils/gemBank/getProgramObjects';
import { findFarmAuthorityPDA, whitelistProofPda } from '../../GrandProgramUtils/gemBank/pda';

import { MAGNEXIA_FARM_ID } from '../../config/config';
import { readTraits } from '../../nft-utilities/readTraits';

import { CYBORGPET_FARM_ID, CYBORG_FARM_ID, HUMANPETS_FARM_ID, HUMANS_FARM_ID } from './StakeConfig';

const dirName = "/Users/bhargavveepuri/Downloads/metadata"

function AddToBankWhitelist() {
  const wallet = useWallet();
  const [collectionIdInputOne, setCollectionIdInputOne] = useState<string>();
  const [collectionIdInputTwo, setCollectionIdInputTwo] = useState<string>();
  const [collectionIdInputThree, setCollectionIdInputThree] = useState<string>();
  const [collectionIdInputFour, setCollectionIdInputFour] = useState<string>();
  const [collectionIdMint, setCollectionIdMint] = useState<string>();

  const addToBankWhitelist = async (farmId : PublicKey) => {
    var fs = require('fs');
    fs.readdir(dirName, function(err: any, filenames: any[]) {
      if (err) {
      return;
      }
      filenames.forEach(function(filename: string) {
      fs.readFile(dirName + filename, 'utf-8', async function(err: any, content: any) {
          if (err) {
              return;
          }
          var metadata = JSON.parse(content);
          var uriObj:any = readTraits(metadata.uri, filename)
          
          console.log(uriObj);
          if (uriObj.mint && uriObj.mint.length > 0) {
              try {
                const address_to_whitelist = new anchor.web3.PublicKey(uriObj.mint);
                const stakeProgram = await getStakeProgram(wallet);
                try {
                  const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farmId);
                  const farms:any = await stakeProgram.account.farm.fetch(farmId);
                  const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
                  const wallet_create = await stakeProgram.rpc.addToBankWhitelist(farmAuthBump, 2, 
                    {
                      accounts: {
                        farm: farmId,
                        farmManager: farms.farmManager,
                        farmAuthority: farmAuth,
                        bank: farms.bank,
                        addressToWhitelist: address_to_whitelist,
                        whitelistProof: whitelistProofPdaVal,
                        systemProgram: SystemProgram.programId,
                        gemBank: GEM_BANK_PROGRAM_ID
                      }
                    }
                  );
                  console.log('add to whitelist bank signature : ' + wallet_create);
                //   setAlertState({
                //     open: true,
                //     message: "Collection Id has beed added to bank whitelist",
                //     severity: "success",
                //   });
                } catch (error) {
                  console.log("Transaction error: ", error);
                }
              } catch (error) {
                // setAlertState({
                //   open: true,
                //   message: "Collection Id is not a valid public key",
                //   severity: "error",
                // });
              }
            }
            else {
            //   setAlertState({
            //     open: true,
            //     message: "Collection Id is empty",
            //     severity: "error",
            //   });
            }
        });
      });
    });  
  }

  // Farm Manager should call this
  const addToBankWhitelistMint = async () => {
    if (collectionIdMint && collectionIdMint.length > 0) {
      try {
        const address_to_whitelist = new anchor.web3.PublicKey(collectionIdMint);
        const stakeProgram = await getStakeProgram(wallet);
        try {
          const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(MAGNEXIA_FARM_ID);
          const farms:any = await stakeProgram.account.farm.fetch(MAGNEXIA_FARM_ID);
          const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
          const wallet_create = await stakeProgram.rpc.addToBankWhitelist(farmAuthBump, 1, 
            {
              accounts: {
                farm: MAGNEXIA_FARM_ID,
                farmManager: farms.farmManager,
                farmAuthority: farmAuth,
                bank: farms.bank,
                addressToWhitelist: address_to_whitelist,
                whitelistProof: whitelistProofPdaVal,
                systemProgram: SystemProgram.programId,
                gemBank: GEM_BANK_PROGRAM_ID
              }
            }
          );
          console.log('add to whitelist bank signature : ' + wallet_create);
        //   setAlertState({
        //     open: true,
        //     message: "Collection Id has beed added to bank whitelist",
        //     severity: "success",
        //   });
        } catch (error) {
          console.log("Transaction error: ", error);
        }
      } catch (error) {
        // setAlertState({
        //   open: true,
        //   message: "Collection Id is not a valid public key",
        //   severity: "error",
        // });
      }
    }
    else {
    //   setAlertState({
    //     open: true,
    //     message: "Collection Id is empty",
    //     severity: "error",
    //   });
    }
  }

  return (
    <div>
      <div className="gen-farm-stats">
            <div className="gen-farm-stats-left">
            <input className="authorize-funder-reward-input" placeholder="Collection Id" value={collectionIdInputOne} onChange={event => setCollectionIdInputOne(event.target.value)} />
            </div>
            <div className="gen-farm-stats-right">
            <button className="Inside-Farm-btn" onClick={() => addToBankWhitelist(HUMANS_FARM_ID)}>Add To Humans Farm Bank Whitelist</button>
            </div>
        </div>
        <div className="gen-farm-stats">
            <div className="gen-farm-stats-left">
            <input className="authorize-funder-reward-input" placeholder="Collection Id" value={collectionIdInputTwo} onChange={event => setCollectionIdInputTwo(event.target.value)} />
            </div>
            <div className="gen-farm-stats-right">
            <button className="Inside-Farm-btn" onClick={() => addToBankWhitelist(HUMANPETS_FARM_ID)}>Add To Humanpets Farm Bank Whitelist</button>
            </div>
        </div>
        <div className="gen-farm-stats">
            <div className="gen-farm-stats-left">
            <input className="authorize-funder-reward-input" placeholder="Collection Id" value={collectionIdInputThree} onChange={event => setCollectionIdInputThree(event.target.value)} />
            </div>
            <div className="gen-farm-stats-right">
            <button className="Inside-Farm-btn" onClick={() => addToBankWhitelist(CYBORG_FARM_ID)}>Add To Cyborg Farm Bank Whitelist</button>
            </div>
        </div>
        <div className="gen-farm-stats">
            <div className="gen-farm-stats-left">
            <input className="authorize-funder-reward-input" placeholder="Collection Id" value={collectionIdInputFour} onChange={event => setCollectionIdInputFour(event.target.value)} />
            </div>
            <div className="gen-farm-stats-right">
            <button className="Inside-Farm-btn" onClick={() => addToBankWhitelist(CYBORGPET_FARM_ID)}>Add To Cyborgpet Farm Bank Whitelist</button>
            </div>
        </div>
    </div>
  )
}

export default AddToBankWhitelist
