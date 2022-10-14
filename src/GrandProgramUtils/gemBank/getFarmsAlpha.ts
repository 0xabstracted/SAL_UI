import { getStakeProgram } from "./GetProgramObjects";

import { PublicKey } from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";

export const getFarmsAlpha = async (farm_id: PublicKey, wallet: WalletContextState) => {
  if(wallet && wallet.connected) {
    const stakeProgram = await getStakeProgram(wallet);
    try {
      const farmAcc:any = await stakeProgram.account.farm.fetch(farm_id);
      console.log(' Farm Account read for farm_id:', farm_id);
      console.log(farmAcc);
      return farmAcc;
    } catch (error) {
      return null;
    }
  }
}
  
  