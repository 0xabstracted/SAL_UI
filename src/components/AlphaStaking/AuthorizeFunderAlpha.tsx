import { PublicKey, SystemProgram } from '@solana/web3.js';

import React from 'react';
import { useContext, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react';

import { getStakeProgram } from '../../GrandProgramUtils/gemBank/getProgramObjects';
import { funderToAuthorizePDA } from '../../GrandProgramUtils/gemBank/pda';

import { 
  authorizeFunderAlphaCyborgArgs,
  authorizeFunderAlphaCyborgPetArgs,
  authorizeFunderAlphaHumanPetsArgs,
  authorizeFunderAlphaHumansArgs,
} from './StakeConfig';

import { AuthorizeFunderAlphaArgs } from './StakeConfigInterface';

import FundRewardAlpha from './FundRewardAlpha';

import { InitFarmAlphaContext } from './InitFarmAlpha';

export const AuthorizeFunderAlphaContext = React.createContext({})

function AuthorizeFunderAlpha() {
  const [funderHumans, setFunderHumans] = useState<PublicKey>();
  const [funderHumanPets, setFunderHumanPets] = useState<PublicKey>();
  const [funderCyborg, setFunderCyborg] = useState<PublicKey>();
  const [funderCyborgPet, setFunderCyborgPet] = useState<PublicKey>();

  const [authorizationProofHumans, setAuthorizationProofHumans] = useState<PublicKey>();
  const [authorizationProofHumanPets, setAuthorizationProofHumanPets] = useState<PublicKey>();
  const [authorizationProofCyborg, setAuthorizationProofCyborg] = useState<PublicKey>();
  const [authorizationProofCyborgPet, setAuthorizationProofCyborgPet] = useState<PublicKey>();
  
  const wallet = useWallet();
  
  const farms = useContext(InitFarmAlphaContext)
  console.log("farms from useContext: ", farms)

  const authorizeFunderAlpha = async (args: AuthorizeFunderAlphaArgs) => {  
    if (args.funderToAuthorize && args.farmId) {
      try {
        console.log("authorizedFunder: ",args.funderToAuthorize);
        const [authorizationProof] = await funderToAuthorizePDA(args.farmId,args.funderToAuthorize);
        console.log("authorizationProof: ",authorizationProof.toBase58());

        if (args.id === "hu") {
          setFunderHumans(args.funderToAuthorize);
          setAuthorizationProofHumans(authorizationProof);
        }
        else if (args.id === "hp") {
          setFunderHumanPets(args.funderToAuthorize);
          setAuthorizationProofHumanPets(authorizationProof);
        }
        else if (args.id === "cy") {
          setFunderCyborg(args.funderToAuthorize);
          setAuthorizationProofCyborg(authorizationProof);
        }
        else if (args.id === "cp") {
          setFunderCyborgPet(args.funderToAuthorize);
          setAuthorizationProofCyborgPet(authorizationProof);
        }
    
        const stakeProgram = await getStakeProgram(wallet);

        const farmB = await stakeProgram.account.farm.fetch(args.farmId);
        console.log('farm account fetched from blockchain: ' + args.farmId.toBase58() + ' account: ' + farmB);

        const afaSig = await stakeProgram.rpc.authorizeFunder({
            accounts: {
              farm: args.farmId,
              farmManager: wallet.publicKey,
              funderToAuthorize: args.funderToAuthorize,
              authorizationProof: authorizationProof,
              systemProgram: SystemProgram.programId,
            }
          }
        );
        console.log('authorize funder signature : ' + afaSig);

        // setAlertState({
        //   open: true,
        //   message: "Funder has been authorized successfully",
        //   severity: "success",
        // });
      } catch (error) {
        console.log("Transaction error: ", error);
      }
    }
    else {
      // setAlertState({
      //   open: true,
      //   message: "Funder is empty",
      //   severity: "error",
      // });
    }
  }
  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-right">
          <button className="Inside-Farm-btn" onClick={() => authorizeFunderAlpha(authorizeFunderAlphaHumansArgs)}>Authorize Funder For Humans</button>
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-right">
          <button className="Inside-Farm-btn" onClick={() => authorizeFunderAlpha(authorizeFunderAlphaHumanPetsArgs)}>Authorize Funder For HumanPets</button>
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-right">
          <button className="Inside-Farm-btn" onClick={() => authorizeFunderAlpha(authorizeFunderAlphaCyborgArgs)}>Authorize Funder For Cyborgs</button>
        </div>
      </div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-right">
          <button className="Inside-Farm-btn" onClick={() => authorizeFunderAlpha(authorizeFunderAlphaCyborgPetArgs)}>Authorize Funder For CyborgPet</button>
        </div>
      </div>   
      {/* {
        funderHumans && funderHumanPets && funderCyborg && funderCyborgPet && 
        authorizationProofHumans && authorizationProofHumanPets && authorizationProofCyborg && authorizationProofCyborgPet &&
        <AuthorizeFunderAlphaContext.Provider value={{funderHumans, funderHumanPets, funderCyborg, funderCyborgPet}}>
          <FundRewardAlpha/>
        </AuthorizeFunderAlphaContext.Provider>
      } */}
    </div>
  )
}
export default AuthorizeFunderAlpha