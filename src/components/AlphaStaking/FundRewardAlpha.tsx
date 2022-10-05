import { SystemProgram } from "@solana/web3.js";

import { useWallet } from "@solana/wallet-adapter-react";

import { findAssociatedTokenAddress } from "../../GrandProgramUtils/AssociatedTokenAccountProgram/pda";
import { findRewardsPotPDA, funderToAuthorizePDA } from "../../GrandProgramUtils/gemBank/pda";
import { getStakeProgram } from "../../GrandProgramUtils/gemBank/getProgramObjects";

import { FundRewardAlphaArgs } from "./StakeConfigInterface";

import { 
    fundRewardAlphaCyborgArgs, 
    fundRewardAlphaCyborgPetArgs, 
    fundRewardAlphaHumanPetsArgs, 
    fundRewardAlphaHumansArgs 
} from "./StakeConfig";

import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

function FundRewardAlpha() {
    // funder to authorize should call this
    const wallet = useWallet();

    const fundRewardAlpha = async (args: FundRewardAlphaArgs) => {
        try {
            const [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(args.farmId, args.rewardMintId);
            console.log("farmAuthority:",rewardAPotBump);
            console.log("rewardAPot:",rewardAPot);
            console.log("rewardAPot.toBase58():",rewardAPot.toBase58());
            
            const [authorizationProof, authorizationProofBump] = await funderToAuthorizePDA(args.farmId,wallet.publicKey!);
            console.log("farmAuthority:",authorizationProofBump);
            console.log("authorizationProof:",authorizationProof);
            console.log("authorizationProof.toBase58():",authorizationProof.toBase58());
            
            const [rewardSource, rewardSourceBump] = await findAssociatedTokenAddress(wallet.publicKey!,args.rewardMintId);
            console.log("rewardSourceBump:",rewardSourceBump);
            console.log("rewardSource.toBase58():",rewardSource.toBase58());
            console.log("rewardSource:",rewardSource);

            const stakeProgram = await getStakeProgram(wallet);
            console.log("stakeProgram:",stakeProgram);

            const farmB = await stakeProgram.account.farm.fetch(args.farmId);
            console.log('farm account fetched from blockchain: ' + args.farmId.toBase58() + ' account: ' + farmB);

            const fraSig = await stakeProgram.rpc.fundRewardAlpha(
                authorizationProofBump, 
                rewardAPotBump, 
                args.fixedrateConfig,
                {
                    accounts: {
                        farm: args.farmId,
                        authorizationProof: authorizationProof,
                        authorizedFunder: wallet.publicKey,
                        rewardPot: rewardAPot,
                        rewardSource: rewardSource,
                        rewardMint: args.rewardMintId,
                        tokenProgram: TOKEN_PROGRAM_ID,
                        systemProgram: SystemProgram.programId,
                    }
                }
            );
            console.log('fund reward signature : ' + fraSig);
        } catch (error) {
            console.log("Transaction error: ", error);
        }
    }

    return (
        <div>
            <div className="gen-farm-stats">
                <div className="gen-farm-stats-left">
                    <button className="Inside-Farm-btn" onClick={() => fundRewardAlpha(fundRewardAlphaHumansArgs)}>Fund Reward for Humans</button>
                </div>
            </div>
            <div className="gen-farm-stats">
                <div className="gen-farm-stats-left">
                    <button className="Inside-Farm-btn" onClick={() => fundRewardAlpha(fundRewardAlphaHumanPetsArgs)}>Fund Reward for HumanPets</button>
                </div>
            </div>
            <div className="gen-farm-stats">
                <div className="gen-farm-stats-left">
                    <button className="Inside-Farm-btn" onClick={() => fundRewardAlpha(fundRewardAlphaCyborgArgs)}>Fund Reward for Cyborg</button>
                </div>
            </div>
            <div className="gen-farm-stats">
                <div className="gen-farm-stats-left">
                    <button className="Inside-Farm-btn" onClick={() => fundRewardAlpha(fundRewardAlphaCyborgPetArgs)}>Fund Reward for CyborgPet</button>
                </div>
            </div>
        </div>
    )
}

export default FundRewardAlpha
