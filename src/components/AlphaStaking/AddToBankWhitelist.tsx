import { useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from '@solana/web3.js';

import * as web3 from "@solana/web3.js";

import * as anchor from '@project-serum/anchor'

import { getStakeProgram, GEM_BANK_PROGRAM_ID } from '../../GrandProgramUtils/gemBank/getProgramObjects';
import { findFarmAuthorityPDA, whitelistProofPda } from '../../GrandProgramUtils/gemBank/pda';


import { CYBORGPET_FARM_ID, CYBORG_FARM_ID, DEFAULT_PUBLIC_KEY, HUMANPETS_FARM_ID, HUMANS_FARM_ID, UPDATE_AUTHORITY_ALPHA } from './StakeConfig';
import { Metaplex } from '@metaplex-foundation/js';

function AddToBankWhitelist() {
  const wallet = useWallet();

  const getFarmIfFromAttributes = (attributes: any) => {
    let is_human;
    let is_cyborg;
    let is_pet;

    for (let index = 0; index < attributes.length; index++) {
      const element = attributes[index];
      if (element.trait_type === 'BaseBody' && element.value === 'Human') {
        is_human = true;
      }
      else if (element.trait_type === 'BaseBody' && element.value === 'Cyborg') {
        is_cyborg = true;
      }
      if (element.trait_type === 'Pets' && element.value && element.value.length > 0) {
        is_pet = true;
      }
    }

    if (is_human && is_pet) {
      return HUMANPETS_FARM_ID 
    }
    else if (is_cyborg && !is_pet) {
      return HUMANS_FARM_ID
    }
    else if (is_cyborg && is_pet) {
      return  CYBORGPET_FARM_ID
    }
    else if (is_cyborg && !is_pet) {
      return  CYBORG_FARM_ID
    }
    return DEFAULT_PUBLIC_KEY
  }

  const sendAddtoBankWhitelistInstruction  = async (farmId: PublicKey, mint: PublicKey) => {
      console.log(`farmId: ${farmId}`)
      const myKeypair = web3.Keypair.fromSecretKey(new Uint8Array([236,35,125,15,184,98,170,93,245,91,234,165,3,54,0,180,142,100,16,191,246,119,76,165,198,213,25,233,208,63,67,20,8,155,30,8,104,196,143,170,188,27,225,142,108,115,152,245,37,32,121,148,60,55,148,73,62,232,234,178,128,194,190,14]))
      const address_to_whitelist = new anchor.web3.PublicKey(mint);
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farmId);
        const farms:any = await stakeProgram.account.farm.fetch(farmId);
        const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
        const wallet_create = await stakeProgram.rpc.addToBankWhitelist(farmAuthBump, 2, 
          {
            accounts: {
              farm: farmId,
              // farmManager: myKeypair.publicKey,
              farmManager: farms.farmManager,
              farmAuthority: farmAuth,
              bank: farms.bank,
              addressToWhitelist: address_to_whitelist,
              whitelistProof: whitelistProofPdaVal,
              systemProgram: SystemProgram.programId,
              gemBank: GEM_BANK_PROGRAM_ID
            },
            // signers: [myKeypair]
          }
        );
        console.log(`add to whitelist bank signature : ${wallet_create} `);
      } catch (error) {
        console.log("Transaction error: ", error);
      }
    // }
  }
  interface ATBWl{
    farmId: any, 
    mint: PublicKey, 
    id: number,
  }
  const addToBankWhitelistAlpha = async () => {
    if (wallet && wallet.connected) {
      const connection = new Connection(clusterApiUrl("devnet"));

      const metaplex = Metaplex.make(connection);
      
      const allNfts = await metaplex
                          .nfts()
                          .findAllByUpdateAuthority({updateAuthority: UPDATE_AUTHORITY_ALPHA})
                          .run();
      
      let obj_list :ATBWl[] = [];
      let count = 0

      for (let index = 0; index < allNfts.length; index++) {
        const nft:any = allNfts[index];
        if (nft.updateAuthorityAddress.toBase58() === "abSzV5zXTKCbkjzN2hzrg2BPTbkYAQ7tt4jQPett2jX") {
          console.log(`count1: ${count++}`)
          let xhr = new XMLHttpRequest();
          xhr.open("GET", nft.uri);
          xhr.onreadystatechange = async () => {
            if(xhr.readyState === 4) {
              let farmId = getFarmIfFromAttributes(JSON.parse(xhr.responseText).attributes)
              
              if (farmId === HUMANPETS_FARM_ID ||  farmId === HUMANS_FARM_ID || farmId === CYBORGPET_FARM_ID || farmId === CYBORG_FARM_ID){
                let obj : ATBWl = {
                  mint: nft.mintAddress,
                  farmId: farmId,
                  id:obj_list.length,
              }
              console.log("index: ",index);
              console.log("farmid: ",obj.farmId.toBase58());
              console.log("mint:", obj.mint.toBase58());
              console.log("length:",allNfts.length);
              obj_list.push(obj);
              // await sendAddtoBankWhitelistInstruction(farmId, nft.mintAddress)
              }
            }
          };
          xhr.send();
        }
      }
      console.log(obj_list)
    }
  }
  
  return (
    <div>
      <div className="gen-farm-stats">
            <div className="gen-farm-stats-right">
            <button className="Inside-Farm-btn" onClick={() => addToBankWhitelistAlpha()}>Add To Bank Whitelist</button>
            </div>
        </div>
    </div>
  )
}

export default AddToBankWhitelist
