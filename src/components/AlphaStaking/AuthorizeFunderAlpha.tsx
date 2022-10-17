import { SystemProgram } from '@solana/web3.js';

import React from 'react';
import { useContext } from 'react'

import { useWallet } from '@solana/wallet-adapter-react';

import { getStakeProgram } from '../../GrandProgramUtils/gemBank/GetProgramObjects';
import { funderToAuthorizePDA } from '../../GrandProgramUtils/gemBank/pda';

import { 
  authorizeFunderAlphaCyborgArgs,
  authorizeFunderAlphaCyborgPetArgs,
  authorizeFunderAlphaHumanPetsArgs,
  authorizeFunderAlphaHumansArgs,
} from './StakeConfig';

import { AuthorizeFunderAlphaArgs } from './StakeConfigInterface';

import { InitFarmAlphaContext } from './InitFarmAlpha';

export const AuthorizeFunderAlphaContext = React.createContext({})

function AuthorizeFunderAlpha() {
  const wallet = useWallet();
  
  const farms = useContext(InitFarmAlphaContext)
  console.log("farms from useContext: ", farms)

  const authorizeFunderAlpha = async (args: AuthorizeFunderAlphaArgs) => {  
    if (args.funderToAuthorize && args.farmId) {
      try {
        console.log("authorizedFunder: ",args.funderToAuthorize);
        const [authorizationProof] = await funderToAuthorizePDA(args.farmId,args.funderToAuthorize);
        console.log("authorizationProof: ",authorizationProof.toBase58());

        
        const stakeProgram = await getStakeProgram(wallet);

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
    </div>
  )
}
export default AuthorizeFunderAlpha