import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, SystemProgram } from "@solana/web3.js";

import * as anchor from "@project-serum/anchor";

import {
  getStakeProgram,
  GEM_BANK_PROGRAM_ID,
  getBankProgram,
} from "../../GrandProgramUtils/GemBank/GetProgramObjects";
import {
  findFarmAuthorityPDA,
  whitelistProofPda,
} from "../../GrandProgramUtils/GemBank/pda";

import {
  CYBORGPET_FARM_ID,
  CYBORG_FARM_ID,
  DEFAULT_PUBLIC_KEY,
  HUMANPETS_FARM_ID,
  HUMANS_FARM_ID,
  UPDATE_AUTHORITY_OF_TOKEN,
  UPDATE_AUTHORITY_OF_TOKEN_STRING,
  BANK_WL_OBJECT,
  CREATOR_SECRET_ALPHA_DEV_COLLECTION,
  CREATOR_SECRET_ALPHA_MAIN_COLLECTION,
} from "./StakePoolConfig";

import {
  FindNftsByCreatorOutput,
  JsonMetadata,
  Metadata,
  Metaplex,
  Nft,
  Sft,
} from "@metaplex-foundation/js";

import { sendTransactions } from "../../config/connection";
import { SAL_DEVNET_4200 } from "./ATBW_SAL_Devnet_4200";

function AddToBankWhitelist() {
  const wallet = useWallet();
  let stack_opener = 3150;

  const getFarmIfFromAttributes = (attributes: any) => {
    let body;
    let is_pet;

    for (let index = 0; index < attributes.length; index++) {
      const element = attributes[index];
      // console.log(element);
      if (element.trait_type === "BaseBody" && element.value === "Human") {
        body = "human";
      } else if (
        element.trait_type === "BaseBody" &&
        element.value === "Cyborg"
      ) {
        body = "cyborg";
      }
      if (
        element.trait_type === "Pets" &&
        element.value &&
        element.value.length > 0
      ) {
        is_pet = true;
      }
    }

    if (body === "human" && is_pet) {
      // console.log("HUMANPETS_FARM_ID")
      return HUMANPETS_FARM_ID;
    } else if (body === "human" && !is_pet) {
      // console.log("HUMANS_FARM_ID")
      return HUMANS_FARM_ID;
    } else if (body === "cyborg" && is_pet) {
      // console.log("CYBORGPET_FARM_ID")
      return CYBORGPET_FARM_ID;
    } else if (body === "cyborg" && !is_pet) {
      // console.log("CYBORG_FARM_ID")
      return CYBORG_FARM_ID;
    }
    return DEFAULT_PUBLIC_KEY;
  };

  const sendAddtoBankWhitelistInstruction = async (
    farmId: any,
    mint: string,
    arr: any
  ) => {
    // console.log(`farmId: ${farmId}`)
    const address_to_whitelist = new anchor.web3.PublicKey(mint);
    farmId = new anchor.web3.PublicKey(farmId);
    const stakeProgram = await getStakeProgram(wallet);
    try {
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farmId);
      const farms: any = await stakeProgram.account.farm.fetch(farmId);
      const [whitelistProofPdaVal] = await whitelistProofPda(
        farms.bank,
        address_to_whitelist
      );
      let k = await stakeProgram.instruction.addToBankWhitelist(
        farmAuthBump,
        2,
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
            gemBank: GEM_BANK_PROGRAM_ID,
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
  };

  interface ATBWl {
    farmId: any;
    mint: any;
    id: number;
  }

  const callMetadataAPI = async (arr: any, i: any, main_arr:any) => {
    const nft: any = arr[i];
    console.log(
      "else nft.creators[0].address.toBase58(): ",
      nft.creators[0].address.toBase58()
    );
    let xhr = new XMLHttpRequest();
    xhr.open("GET", nft.uri);
    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {
        try {
          let farmId = getFarmIfFromAttributes(
            JSON.parse(xhr.responseText).attributes
          );
          if (
            farmId === HUMANPETS_FARM_ID ||
            farmId === HUMANS_FARM_ID ||
            farmId === CYBORGPET_FARM_ID ||
            farmId === CYBORG_FARM_ID
          ) {
            let obj: ATBWl = {
              mint: nft.mintAddress.toBase58(),
              farmId: farmId.toBase58(),
              id: i + 1,
            };
            main_arr.push(obj);
            setTimeout(function () {
              callMetadataAPI(arr, i + 1, main_arr);
              if (main_arr.length == arr.length) {
                console.log('final object : ', main_arr)
              }
            }, 100);
          }
        } catch (error) {
          console.log("Error Reading from URI");
        }
      }
    };
    xhr.send();
  };

  const getFramIdFromUpdateAuthority = async () => {
    if (wallet && wallet.connected) {
      // const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
      // const connection = new Connection("https://api.metaplex.solana.com/", "confirmed");
      // const connection = new Connection("https://snowy-bitter-morning.solana-mainnet.quiknode.pro/9dd2ee037aa0a92503bd345d7f92c8beda03ce73/", "confirmed");
      // const connection = new Connection(clusterApiUrl("devnet"),"confirmed");
      const connection = new Connection(
        "https://metaplex.devnet.rpcpool.com/",
        "confirmed"
      );

      const metaplex = Metaplex.make(connection);

      // const allNfts1 = await metaplex
      //                     .nfts()
      //                     .findAllByUpdateAuthority({updateAuthority: UPDATE_AUTHORITY_OF_TOKEN})
      //                     .run();

      const allNfts = await metaplex
        .nfts()
        .findAllByCreator({ creator: CREATOR_SECRET_ALPHA_DEV_COLLECTION })
        .run();

      // const allNfts = await metaplex.nfts().findAllByCreator({creator: CREATOR_SECRET_ALPHA_MAIN_COLLECTION}).run();

      let obj_list: ATBWl[] = [];
      // let count = 0
      console.log(allNfts);
      // console.log(allNfts1);
      console.log(
        "CREATOR_SECRET_ALPHA_DEV_COLLECTION:",
        CREATOR_SECRET_ALPHA_DEV_COLLECTION.toBase58()
      );

      // console.log("CREATOR_SECRET_ALPHA_MAIN_COLLECTION:", CREATOR_SECRET_ALPHA_MAIN_COLLECTION.toBase58())
      let index = 0;
      let main_arr:any = [];
      callMetadataAPI(allNfts, index, main_arr);
      console.log(main_arr);
      // for (let index = 0; index < allNfts.length; index++) {
      //   const nft: any = await metaplex.nfts().load({ metadata: allNfts[index].metadataAddress })
      //   // console.log(nft.creators[0].address.toBase58())
      //   // if (nft.creators[0].address.toBase58() === CREATOR_SECRET_ALPHA_MAIN_COLLECTION.toBase58()) {
      //   if (
      //     nft.creators[0].address.toBase58() ===
      //     CREATOR_SECRET_ALPHA_DEV_COLLECTION.toBase58()
      //   ) {
      //     if (nft && nft.json && nft.json.attributes) {
      //       console.log(
      //         "if nft.creators[0].address.toBase58(): ",
      //         nft.creators[0].address.toBase58()
      //       );
      //       let farmId = getFarmIfFromAttributes(nft.json.attributes);
      //       if (
      //         farmId === HUMANPETS_FARM_ID ||
      //         farmId === HUMANS_FARM_ID ||
      //         farmId === CYBORGPET_FARM_ID ||
      //         farmId === CYBORG_FARM_ID
      //       ) {
      //         let obj: ATBWl = {
      //           mint: nft.mintAddress,
      //           farmId: farmId,
      //           id: obj_list.length,
      //         };
      //         obj_list.push(obj);
      //         if (index === allNfts.length - 1) {
      //           console.log(obj_list);
      //         }
      //       }
      //     } else {
      //       // callMetadataAPI(allNfts, index);
      //     }
      //     // console.log(`count1: ${count++}`)
      //   } else {
      //     // console.log(nft.creators[0].address.toBase58());
      //   }
      // }
      console.log("obj_list: ", obj_list);
    }
  };

  const parseArrayToBankWhitelist = async () => {
    const connection = new Connection(clusterApiUrl("devnet"));
    let bank_instruction: any = [];
    console.log(stack_opener);
    for (let index = stack_opener; index < stack_opener + 7; index++) {
      // bank_instruction = await sendAddtoBankWhitelistInstruction(BANK_WL_OBJECT[index]['farmId'], BANK_WL_OBJECT[index]['mint'], bank_instruction);
      bank_instruction = await sendAddtoBankWhitelistInstruction(
        SAL_DEVNET_4200[index]["stakePoolId"],
        SAL_DEVNET_4200[index]["mint"],
        bank_instruction
      );
      // bank_instruction.push(k)
      // const element = BANK_WL_OBJECT[index];
    }
    // console.log(bank_instruction);
    const add_to_bank_wl_sig = await sendTransactions(
      connection,
      wallet,
      [bank_instruction],
      [[]]
    );

    console.log(stack_opener);
    console.log(add_to_bank_wl_sig);
    if (stack_opener < 4300) {
      stack_opener = stack_opener + 7;
      parseArrayToBankWhitelist();
    }
  };

  const getWLMintProofAccounts = async () => {
    const bankProgram = await getBankProgram(wallet);
    const whitelistProofs = await bankProgram.account.whitelistProof.all();
    console.log("whitelistProofs.length",whitelistProofs.length)
    console.log("whitelistProofs",whitelistProofs)
  }

  const getFarmerAccounts = async () => {
    const stakeProgram = await getStakeProgram(wallet);
    const farmers = await stakeProgram.account.farmer.all();
    console.log("farmers.length",farmers.length)
    console.log("farmers",farmers)
  }
  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-right">
          <button
            className="Inside-Farm-btn"
            onClick={() => getFramIdFromUpdateAuthority()}
          >
            Get FarmId List
          </button>
        </div>
        <div className="gen-farm-stats-left">
          <button
            className="Inside-Farm-btn"
            onClick={() => parseArrayToBankWhitelist()}
          >
            Whitelist NFTs
          </button>
        </div>
        <div className="gen-farm-stats-right">
          <button
            className="Inside-Farm-btn"
            onClick={() => getWLMintProofAccounts()}
          >
            Get WL Mint Proofs
          </button>
        </div>
        <div className="gen-farm-stats-left">
          <button
            className="Inside-Farm-btn"
            onClick={() => getFarmerAccounts()}
          >
            Get Farmer Proofs
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddToBankWhitelist;
