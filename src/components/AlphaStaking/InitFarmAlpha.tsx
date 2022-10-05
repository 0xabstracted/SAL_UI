/* eslint-disable @typescript-eslint/no-unused-vars */

// Farm Manager Should call this

import * as anchor from "@project-serum/anchor"

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import React from "react";
import { useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";

import { GEM_BANK_PROGRAM_ID, getStakeProgram } from "../../GrandProgramUtils/gemBank/getProgramObjects";
import { findFarmAuthorityPDA, findFarmTreasuryTokenPDA, findRewardsPotPDA } from "../../GrandProgramUtils/gemBank/pda";

import { 
  initFarmAlphaCyborgArgs, 
  initFarmAlphaCyborgPetArgs, 
  initFarmAlphaHumanPetsArgs, 
  initFarmAlphaHumansArgs 
} from "./StakeConfig";

import { InitFarmAlphaArgs } from "./StakeConfigInterface";

import AuthorizeFunderAlpha from "./AuthorizeFunderAlpha";

export const InitFarmAlphaContext = React.createContext({})

function InitFarmAlpha() {
  const [humansFarm, setHumansFarm] = useState<PublicKey>();
  const [humanPetsFarm, setHumanPetsFarm] = useState<PublicKey>();
  const [cyborgFarm, setCyborgFarm] = useState<PublicKey>();
  const [cyborgPetFarm, setCyborgPetFarm] = useState<PublicKey>();

  const [humansBank, setHumansBank] = useState<PublicKey>();
  const [humanPetsBank, setHumanPetsBank] = useState<PublicKey>();
  const [cyborgBank, setCyborgBank] = useState<PublicKey>();
  const [cyborgPetBank, setCyborgPetBank] = useState<PublicKey>();
 
  const wallet = useWallet();
  
  const initFarmAlpha = async (args : InitFarmAlphaArgs) => {  
    const farm = anchor.web3.Keypair.generate();
    const bank = anchor.web3.Keypair.generate();

    if (args.id === "hu") {
      setHumansFarm(farm.publicKey);
      setHumansBank(bank.publicKey);
    }
    else if (args.id === "hp") {
      setHumanPetsFarm(farm.publicKey);
      setHumanPetsBank(bank.publicKey);
    }
    else if (args.id === "cy") {
      setCyborgFarm(farm.publicKey);
      setCyborgBank(bank.publicKey);
    }
    else if (args.id === "cp") {
      setCyborgPetFarm(farm.publicKey);
      setCyborgPetBank(bank.publicKey);
    }
    console.log("farmId: ",farm.publicKey)
    console.log("bankId: ",bank.publicKey)
    console.log("farmId.toBase58(): ",farm.publicKey.toBase58())
    console.log("bankId.toBase58(): ",bank.publicKey.toBase58())
    
    try { 
      const [farmAuthority, farmAuthorityBump] = await findFarmAuthorityPDA(farm.publicKey);
      console.log("farmAuthority:",farmAuthorityBump);
      console.log("farmAuthority:",farmAuthority);
      console.log("farmAuthority.toBase58():",farmAuthority.toBase58());
            
      // const [farmTreasury, farmTreasuryBump] = await findFarmTreasuryPDA(farm.publicKey);
      // console.log("farmAuthority:",farmAuthorityBump);
      // console.log("farmTreasury:",farmTreasury);
      // console.log("farmTreasury.toBase58():",farmTreasury.toBase58());
      
      const [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(farm.publicKey, args.rewardMintId);
      console.log("farmAuthority:",farmAuthorityBump);
      console.log("rewardAPot:",rewardAPot);
      console.log("rewardAPot.toBase58():",rewardAPot.toBase58());
      
      const [farmTreasuryToken, farmTreasuryTokenBump] = await findFarmTreasuryTokenPDA(farm.publicKey, args.rewardMintId);
      console.log("farmAuthority:",farmAuthorityBump);
      console.log("rewardAPot:",rewardAPot);
      console.log("rewardAPot.toBase58():",rewardAPot.toBase58());
      
      const signers = [farm, bank];
      
      const stakeProgram = await getStakeProgram(wallet);

      const ifaSig = await stakeProgram.rpc.initFarmAlpha(
          farmAuthorityBump, 
          farmTreasuryTokenBump,
          args.farmConfig,
          args.maxCounts, 
          {
            accounts: {
              farm: farm.publicKey.toBase58(),
              farmManager: wallet.publicKey,
              farmAuthority: farmAuthority,
              rewardAPot: rewardAPot,
              rewardAMint: args.rewardMintId,
              farmTreasuryToken: farmTreasuryToken,
              bank: bank.publicKey.toBase58(),
              gemBank: GEM_BANK_PROGRAM_ID,
              payer: wallet.publicKey,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            },
            signers: signers
        }
      );
      // setAlertState({
      //   open: true,
      //   message: farm_str + "Farm Alpha has been created successfully at " + farm.publicKey.toBase58() + "\nPlease copy this id into the config file.",
      //   severity: "success",
      // });
      console.log('init farm alpha signature : ' + ifaSig);
    } catch (error) {
      console.log("Transaction error: ", error);
  }

  }
  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => initFarmAlpha(initFarmAlphaHumansArgs)}>Start Humans Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {humansFarm && <label>HUMANS FARM ID : {initFarmAlphaHumansArgs.farmKp.publicKey.toBase58()}</label>} */}
          {humansFarm && humansBank && <label>HUMANS FARM ID : {humansFarm.toBase58()}</label>}
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => initFarmAlpha(initFarmAlphaHumanPetsArgs)}>Start HumanPets Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {humanPetsFarm && <label>HUMANPETS FARM ID : {initFarmAlphaHumanPetsArgs.farmKp.publicKey.toBase58()}</label>} */}
          {humanPetsFarm && humanPetsBank && <label>HUMANPETS FARM ID : {humanPetsFarm.toBase58()}</label>}
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => initFarmAlpha(initFarmAlphaCyborgArgs)}>Start Cyborg Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {cyborgFarm && <label>CYBORG FARM ID : {initFarmAlphaCyborgArgs.farmKp.publicKey.toBase58()}</label>} */}
          {cyborgFarm && cyborgBank && <label>CYBORG FARM ID : {cyborgFarm.toBase58()}</label>}
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => initFarmAlpha(initFarmAlphaCyborgPetArgs)}>Start CyborgPet Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {cyborgPetFarm && <label>CYBORGPET FARM ID : {initFarmAlphaCyborgPetArgs.farmKp.publicKey.toBase58()}</label>} */}
          {cyborgPetFarm && cyborgPetBank && <label>CYBORGPET FARM ID : {cyborgPetFarm.toBase58()}</label>}
        </div>
      </div>
      <InitFarmAlphaContext.Provider value={{humansFarm, humanPetsFarm, cyborgFarm, cyborgPetFarm}}>
        <AuthorizeFunderAlpha/>
      </InitFarmAlphaContext.Provider>
    </div>
  )
}
  
export default InitFarmAlpha
  