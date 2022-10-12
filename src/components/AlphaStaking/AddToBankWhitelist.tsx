import { useWallet } from '@solana/wallet-adapter-react';
import { clusterApiUrl, Connection, SystemProgram } from '@solana/web3.js';

import * as anchor from '@project-serum/anchor'

import { getStakeProgram, GEM_BANK_PROGRAM_ID } from '../../GrandProgramUtils/gemBank/getProgramObjects';
import { findFarmAuthorityPDA, whitelistProofPda } from '../../GrandProgramUtils/gemBank/pda';


import { CYBORGPET_FARM_ID, CYBORG_FARM_ID, DEFAULT_PUBLIC_KEY, HUMANPETS_FARM_ID, HUMANS_FARM_ID, UPDATE_AUTHORITY_OF_TOKEN, UPDATE_AUTHORITY_OF_TOKEN_STRING, BANK_WL_OBJECT } from './StakeConfig';

import { Metaplex } from '@metaplex-foundation/js';

import { sendTransactions } from '../../config/connection';

function AddToBankWhitelist() {
  const wallet = useWallet();
  let stack_opener = 0;

  const getFarmIfFromAttributes = (attributes: any) => {
    let body;
    let is_pet;

    for (let index = 0; index < attributes.length; index++) {
      const element = attributes[index];
      // console.log(element);
      if (element.trait_type === 'BaseBody' && element.value === 'Human') {
        body = 'human';
      }
      else if (element.trait_type === 'BaseBody' && element.value === 'Cyborg') {
        body = 'cyborg';
      }
      if (element.trait_type === 'Pets' && element.value && element.value.length > 0) {
        is_pet = true;
      }
    }

    if (body === 'human' && is_pet) {
      return HUMANPETS_FARM_ID 
    }
    else if (body === 'human' && !is_pet) {
      return HUMANS_FARM_ID
    }
    else if (body === 'cyborg' && is_pet) {
      return  CYBORGPET_FARM_ID
    }
    else if (body === 'cyborg' && !is_pet) {
      return  CYBORG_FARM_ID
    }
    return DEFAULT_PUBLIC_KEY
  }

  const sendAddtoBankWhitelistInstruction  = async (farmId: any, mint: string, arr:any) => {
      // console.log(`farmId: ${farmId}`)
      // const myKeypair = web3.Keypair.fromSecretKey(new Uint8Array([236,35,125,15,184,98,170,93,245,91,234,165,3,54,0,180,142,100,16,191,246,119,76,165,198,213,25,233,208,63,67,20,8,155,30,8,104,196,143,170,188,27,225,142,108,115,152,245,37,32,121,148,60,55,148,73,62,232,234,178,128,194,190,14]))
      const address_to_whitelist = new anchor.web3.PublicKey(mint);
      farmId = new anchor.web3.PublicKey(farmId);
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farmId);
        const farms:any = await stakeProgram.account.farm.fetch(farmId);
        const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
        let k = await stakeProgram.instruction.addToBankWhitelist(farmAuthBump, 2, 
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
        arr.push(k);
        return arr;
        // console.log(`add to whitelist bank signature : ${wallet_create} `);
      } catch (error) {
        console.log("Transaction error: ", error);
        return null;
      }
    // }
  }

  interface ATBWl{
    farmId: any, 
    mint: any, 
    id: number,
  }

  const getFramIdFromUpdateAuthority = async () => {
    if (wallet && wallet.connected) {
      const connection = new Connection(clusterApiUrl("devnet"));

      const metaplex = Metaplex.make(connection);
      
      const allNfts = await metaplex
                          .nfts()
                          .findAllByUpdateAuthority({updateAuthority: UPDATE_AUTHORITY_OF_TOKEN})
                          .run();
      
      let obj_list :ATBWl[] = [];
      let count = 0
      console.log(allNfts);

      for (let index = 0; index < allNfts.length; index++) {
        const nft:any = allNfts[index];
        if (nft.updateAuthorityAddress.toBase58() === UPDATE_AUTHORITY_OF_TOKEN_STRING) {
          console.log(`count1: ${count++}`)
          let xhr = new XMLHttpRequest();
          xhr.open("GET", nft.uri);
          xhr.onreadystatechange = async () => {
            if(xhr.readyState === 4) {
              try {
                let farmId = getFarmIfFromAttributes(JSON.parse(xhr.responseText).attributes)
                if (farmId === HUMANPETS_FARM_ID ||  farmId === HUMANS_FARM_ID || farmId === CYBORGPET_FARM_ID || farmId === CYBORG_FARM_ID){
                  let obj : ATBWl = {
                    mint: nft.mintAddress,
                    farmId: farmId,
                    id:obj_list.length,
                  }
                  obj_list.push(obj);
                  if (index === allNfts.length - 1) {
                    console.log(obj_list);
                  }
                }
              } catch (error) {
                console.log(1);
                console.log(nft);
                let obj : ATBWl = {
                  mint: nft.mintAddress,
                  farmId: HUMANS_FARM_ID,
                  id:obj_list.length,
                }
                obj_list.push(obj);
              }
            }
          };
          xhr.send();
        }
      }
      console.log(obj_list);
    }
  }

  const parseArrayToBankWhitelist = async () => {
    const connection = new Connection(clusterApiUrl("devnet"));
    let bank_instruction:any = [];
    console.log(stack_opener)
    for (let index = stack_opener; index < stack_opener + 7; index++) {
      bank_instruction = await sendAddtoBankWhitelistInstruction(BANK_WL_OBJECT[index]['farmId'], BANK_WL_OBJECT[index]['mint'], bank_instruction);
      // bank_instruction.push(k)
      // const element = BANK_WL_OBJECT[index];
    }
    console.log(bank_instruction);
    const add_to_bank_wl_sig = await sendTransactions(
      connection,
      wallet,
      [bank_instruction],
      [[]]
    )

    console.log(stack_opener)
    console.log(add_to_bank_wl_sig);
    if (stack_opener < 360){
      stack_opener = stack_opener + 7
      parseArrayToBankWhitelist()
    }
  }
  
  return (
    <div>
      <div className="gen-farm-stats">
            <div className="gen-farm-stats-right">
              <button className="Inside-Farm-btn" onClick={() => getFramIdFromUpdateAuthority()}>Get FarmId List</button>
            </div>
            <div className="gen-farm-stats-left">
              <button className="Inside-Farm-btn" onClick={() => parseArrayToBankWhitelist()}>Whitelist NFTs</button>
            </div>
        </div>
    </div>
  )
}

export default AddToBankWhitelist
