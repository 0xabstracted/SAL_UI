// Farm Manager Should call this

import * as anchor from "@project-serum/anchor"

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection, PublicKey, SystemProgram } from "@solana/web3.js";

import React from "react";
import { useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";

import { GEM_BANK_PROGRAM_ID, getStakeProgram } from "../../GrandProgramUtils/GemBank/GetProgramObjects";
import { findFarmAuthorityPDA, findFarmTreasuryTokenPDA, findRewardsPotPDA, funderToAuthorizePDA } from "../../GrandProgramUtils/GemBank/pda";

import { 
  StartStakePoolArgs,
  StartStakePoolCyborgArgs, 
  StartStakePoolCyborgPetArgs, 
  StartStakePoolHumanPetsArgs, 
  StartStakePoolHumansArgs 
} from "./StakeConfig";


import { findAssociatedTokenAddress } from "../../GrandProgramUtils/AssociatedTokenAccountProgram/pda";
import { sendTransactions } from "../../config/connection";


function StartStakePool() {
  const [humansFarm, setHumansFarm] = useState<PublicKey>();
  const [humanPetsFarm, setHumanPetsFarm] = useState<PublicKey>();
  const [cyborgFarm, setCyborgFarm] = useState<PublicKey>();
  const [cyborgPetFarm, setCyborgPetFarm] = useState<PublicKey>();

  const [humansBank, setHumansBank] = useState<PublicKey>();
  const [humanPetsBank, setHumanPetsBank] = useState<PublicKey>();
  const [cyborgBank, setCyborgBank] = useState<PublicKey>();
  const [cyborgPetBank, setCyborgPetBank] = useState<PublicKey>();
 
  const wallet = useWallet();
  const connection = new Connection(clusterApiUrl("devnet"));
  
  const StartStakePool = async (args : StartStakePoolArgs) => {  
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
    // console.log("farmId: ",farm.publicKey)
    // console.log("bankId: ",bank.publicKey)
    console.log("farmId.toBase58(): ",farm.publicKey.toBase58())
    // console.log("bankId.toBase58(): ",bank.publicKey.toBase58())
    
    try { 
      const [farmAuthority, farmAuthorityBump] = await findFarmAuthorityPDA(farm.publicKey);
      // console.log("farmAuthorityBump:",farmAuthorityBump);
      // console.log("farmAuthority:",farmAuthority);
      // console.log("farmAuthority.toBase58():",farmAuthority.toBase58());
            
      // const [farmTreasury, farmTreasuryBump] = await findFarmTreasuryPDA(farm.publicKey);
      // console.log("farmAuthority:",farmAuthorityBump);
      // console.log("farmTreasury:",farmTreasury);
      // console.log("farmTreasury.toBase58():",farmTreasury.toBase58());
      
      const [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(farm.publicKey, args.rewardMintId);
      // console.log("rewardAPotBump:",rewardAPotBump);
      // console.log("rewardAPot:",rewardAPot);
      // console.log("rewardAPot.toBase58():",rewardAPot.toBase58());
      
      const [farmTreasuryToken, farmTreasuryTokenBump] = await findFarmTreasuryTokenPDA(farm.publicKey);
      // console.log("farmTreasuryTokenBump:",farmTreasuryTokenBump);
      // console.log("farmTreasuryToken:",farmTreasuryToken);
      // console.log("farmTreasuryToken.toBase58():",farmTreasuryToken.toBase58());
      
      const signers = [farm, bank];
      
      const stakeProgram = await getStakeProgram(wallet);
      let init_farm_tx:any = [];

      // const ifaSig = await stakeProgram.instruction.initFixedFarm(
        init_farm_tx.push(await stakeProgram.instruction.initFixedFarm(
          farmAuthorityBump, 
          args.farmConfig,
          args.maxCounts, 
          farmTreasuryToken,
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
      ));
      const [authorizationProof, authorizationProofBump] = await funderToAuthorizePDA(farm.publicKey,wallet.publicKey!);
      // console.log("farmAuauthorizationProofBumpthority:",authorizationProofBump);
      // console.log("authorizationProof:",authorizationProof);
      // console.log("authorizationProof.toBase58():",authorizationProof.toBase58());
      
      // const afaSig = await stakeProgram.instruction.authorizeFunder({
        init_farm_tx.push(await stakeProgram.instruction.authorizeFunder({
          accounts: {
            farm: farm.publicKey.toBase58(),
            farmManager: wallet.publicKey,
            funderToAuthorize: wallet.publicKey,
            authorizationProof: authorizationProof,
            systemProgram: SystemProgram.programId,
          }
        }
      ));
      // console.log('authorize funder signature : ' + afaSig);


      // const [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(farm.publicKey.toBase58(), args.rewardMintId);
      // console.log("farmAuthority:",rewardAPotBump);
      // console.log("rewardAPot:",rewardAPot);
      // console.log("rewardAPot.toBase58():",rewardAPot.toBase58());
      
      // const [authorizationProof, authorizationProofBump] = await funderToAuthorizePDA(farm.publicKey.toBase58(),wallet.publicKey!);
      
      const [rewardSource, rewardSourceBump] = await findAssociatedTokenAddress(wallet.publicKey!,args.rewardMintId);
      // console.log("rewardSourceBump:",rewardSourceBump);
      // console.log("rewardSource.toBase58():",rewardSource.toBase58());
      // console.log("rewardSource:",rewardSource);

      // console.log("stakeProgram:",stakeProgram);

      // const farmB = await stakeProgram.account.farm.fetch(farm.publicKey.toBase58());
      // console.log('farm account fetched from blockchain: ' + farm.publicKey.toBase58() + ' account: ' + farmB);

      // const fraSig = await stakeProgram.instruction.fundReward(
        init_farm_tx.push(await stakeProgram.instruction.fundReward(
          authorizationProofBump, 
          rewardAPotBump, 
          args.fixedrateConfig,
          {
              accounts: {
                  farm: farm.publicKey.toBase58(),
                  authorizationProof: authorizationProof,
                  authorizedFunder: wallet.publicKey,
                  rewardPot: rewardAPot,
                  rewardSource: rewardSource,
                  rewardMint: args.rewardMintId,
                  tokenProgram: TOKEN_PROGRAM_ID,
                  systemProgram: SystemProgram.programId,
              }
          }
      ));

      const ifaSig = await sendTransactions(
        connection,
        wallet,
        [init_farm_tx],
        [[farm, bank]]
      )
      // console.log('fund reward signature : ' + fraSig);

      // setAlertState({
      //   open: true,
      //   message: farm_str + "Farm Alpha has been created successfully at " + farm.publicKey.toBase58() + "\nPlease copy this id into the config file.",
      //   severity: "success",
      // });
      console.log('init farm alpha number:' + ifaSig.number);
      for (let i = 0 ; i < ifaSig.txs.length; i++){
        console.log('ifaSig.txs[i].txid: ', ifaSig.txs[i].txid)
        console.log('ifaSig.txs[i].slot: ', ifaSig.txs[i].slot)
      }
    } catch (error) {
      console.log("Transaction error: ", error);
  }

  }
  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => StartStakePool(StartStakePoolHumansArgs)}>Start Humans Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {humansFarm && <label>HUMANS FARM ID : {StartStakePoolHumansArgs.farmKp.publicKey.toBase58()}</label>} */}
          {humansFarm && humansBank && <label>HUMANS FARM ID : {humansFarm.toBase58()}</label>}
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => StartStakePool(StartStakePoolHumanPetsArgs)}>Start HumanPets Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {humanPetsFarm && <label>HUMANPETS FARM ID : {StartStakePoolHumanPetsArgs.farmKp.publicKey.toBase58()}</label>} */}
          {humanPetsFarm && humanPetsBank && <label>HUMANPETS FARM ID : {humanPetsFarm.toBase58()}</label>}
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => StartStakePool(StartStakePoolCyborgArgs)}>Start Cyborg Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {cyborgFarm && <label>CYBORG FARM ID : {StartStakePoolCyborgArgs.farmKp.publicKey.toBase58()}</label>} */}
          {cyborgFarm && cyborgBank && <label>CYBORG FARM ID : {cyborgFarm.toBase58()}</label>}
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => StartStakePool(StartStakePoolCyborgPetArgs)}>Start CyborgPet Farm</button>
        </div>
        <div className="gen-farm-stats-right">
          {/* {cyborgPetFarm && <label>CYBORGPET FARM ID : {StartStakePoolCyborgPetArgs.farmKp.publicKey.toBase58()}</label>} */}
          {cyborgPetFarm && cyborgPetBank && <label>CYBORGPET FARM ID : {cyborgPetFarm.toBase58()}</label>}
        </div>
      </div>
    </div>
  )
}
  
export default StartStakePool
  