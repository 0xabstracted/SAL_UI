import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { clusterApiUrl, Connection, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "solanaSPLToken036";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import LogoWhite from "../../assets/Logowhite.png";
import User from "../../assets/user.png";
import Add from "../../assets/add.png";
import Close from "../../assets/close.png";
import Pencil from "../../assets/pencil.png";
import DatePicker from "react-datepicker";
import Modal from 'react-modal';
import * as anchor from "@project-serum/anchor";
import { REWARD_MINT_GLTCH } from "../TokenCreation/AlphaTokenConfig";
import { Metaplex } from "@metaplex-foundation/js";
import { UPDATE_AUTHORITY_OF_TOKEN_STRING, STAKE_POOL_ADDRESS, IDENTIFIER_SEED, STAKE_POOL_SEED, REWARD_DISTRIBUTOR_SEED, REWARD_DISTRIBUTOR_ADDRESS, RewardDistributorKind, STAKE_AUTHORIZATION_SEED, STAKE_ENTRY_SEED, REWARD_ENTRY_SEED } from "../AlphaStaking/StakePoolConfig";

import "react-datepicker/dist/react-datepicker.css";
import "../../css/App.css";
import { useParams } from "react-router-dom";
import { AnchorProvider, BN, Program } from "projectSerumAnchor0250";
import * as STAKE_POOL_TYPES from "../../programs/apl-staking/idl/apl_stake_pool";
import * as REWARD_DISTRIBUTOR_TYPES from "../../programs/apl-staking/idl/apl_reward_distributor";
import {
    AccountData,
    findAta,
    tryGetAccount,
    withFindOrInitAssociatedTokenAccount,
  } from "cardinalCommon2011";
import { sendTransactions } from "../../config/connection";
import * as metaplex125 from "mplTokenMetadata125";
import { StakeEntryData } from "../../programs/apl-staking/programs/stakePool/constants";
// import * as splToken from "@solana/spl-token";
import * as splToken36 from "solanaSPLToken036";
import { withRemainingAccountsForKind } from "../../programs/apl-staking/programs/rewardDistributor/utils";
import { SAL_DEVNET_4200 } from "./ATBW_SAL_Devnet_4200";

const AdminStaking = () => {

    const connection = new anchor.web3.Connection(anchor.web3.clusterApiUrl('devnet'));

    const urlQueryParams = useParams();

    const [logoLoading, setLogoLoading] = useState(true);
    let d:any = new Date();
    const [currentDate, setCurrentDate] = useState(d);
    const [gotNfts, setGotNfts] = useState(false);
    const [raffleTicketSupply, setRaffleTicketSupply] = useState(0);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [nfts, setNFts] = useState<any>([]);

    const wallet = useWallet();
    let stack_opener = 0; 

    const anchorWallet = useMemo(() => {
        // wallet.connect();
        if (
          !wallet ||
          !wallet.publicKey ||
          !wallet.signAllTransactions ||
          !wallet.signTransaction
        ) {
          return;
        }
    
        return {
          publicKey: wallet.publicKey,
          signAllTransactions: wallet.signAllTransactions,
          signTransaction: wallet.signTransaction,
        } as anchor.Wallet;
    }, [wallet]);

    useEffect(() => {
        // getNFTs();
        setTimeout(function() {
            setLogoLoading(false);
        }, 3000)
    }, [nfts, wallet]);

    const onRaffleNFTAfterOpen = async () => {
        console.log('Logging after modal opening');
    }

    const findIdentifierId = (identifier: PublicKey) => {
        return PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode(IDENTIFIER_SEED), identifier.toBuffer()],
          STAKE_POOL_ADDRESS
        );
    };

    const findStakePoolId = (identifier: BN) => {
        return PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode(STAKE_POOL_SEED), identifier.toArrayLike(Buffer, "le", 8)],
          STAKE_POOL_ADDRESS
        );
    };

    const findRewardDistributorId = (stakePoolId: PublicKey) => {
        return PublicKey.findProgramAddress(
          [anchor.utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED), stakePoolId.toBuffer()],
          REWARD_DISTRIBUTOR_ADDRESS
        );
    };

    const getNFTs = async () => {
        if (wallet && wallet.connected && !gotNfts) {
          const connection = new Connection(clusterApiUrl("devnet"));
          const metaplex = Metaplex.make(connection);
          const allNfts = await metaplex.nfts().findAllByOwner({ owner: wallet?.publicKey! }).run();
          let temp_nfts:any = [];
          for (let index = 0; index < allNfts.length; index++) {
              const nft:any = allNfts[index];
              var creators = nft.creators;
              var is_ours = false;
              if (nft.updateAuthorityAddress.toBase58() == UPDATE_AUTHORITY_OF_TOKEN_STRING) {
                is_ours = true;
                for (let iindex = 0; iindex < creators.length; iindex++) {
                  const element = creators[iindex];
                  if (element.share === 0) {
                  }
                }
              }
              if (is_ours) {
                var xhr = new XMLHttpRequest();
                xhr.addEventListener("readystatechange", function() {
                  if(this.readyState === 4) {
                    var attributes = JSON.parse(this.responseText).attributes;
                    var is_human;
                    var is_cyborg;
                    var is_pet;
                    var trait_type;
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
                      trait_type = 'Human Pet';
                    }
                    else if (is_human && !is_pet) {
                      trait_type = 'Human';
                    }
                    else if (is_cyborg && is_pet) {
                      trait_type = 'Cyborg Pet';
                    }
                    else if (is_cyborg && !is_pet) {
                      trait_type = 'Cyborg';
                    }
                    var obj:any = {
                      id:temp_nfts.length,
                      name: nft.name,
                      link: JSON.parse(this.responseText).image,
                      mint: nft.mintAddress,
                      updateAuthority: nft.updateAuthority,
                      creator: nft.creators[0].address,
                      trait_type: trait_type
                    }
                    temp_nfts.push(obj);
                    setNFts(temp_nfts!);
                  }
                });
                xhr.open("GET", nft.uri);
                xhr.send();
              }
          }
          setGotNfts(true);
        }
    }

    const findStakeAuthorizationId = async (
        stakePoolId: anchor.web3.PublicKey,
        mintId: anchor.web3.PublicKey
      ): Promise<[anchor.web3.PublicKey, number]> => {
        return anchor.web3.PublicKey.findProgramAddress(
          [
            anchor.utils.bytes.utf8.encode(STAKE_AUTHORIZATION_SEED),
            stakePoolId.toBuffer(),
            mintId.toBuffer(),
          ],
          STAKE_POOL_ADDRESS
        );
    };

    const remainingAccountsForInitStakeEntry = async (
        stakePoolId: anchor.web3.PublicKey,
        originalMintId: anchor.web3.PublicKey
      ): Promise<anchor.web3.AccountMeta[]> => {
        const [stakeAuthorizationRecordId] = await findStakeAuthorizationId(
          stakePoolId,
          originalMintId
        );
        return [
          {
            pubkey: stakeAuthorizationRecordId,
            isSigner: false,
            isWritable: false,
          },
        ];
    };

    const findStakeEntryId = async (
        wallet: anchor.web3.PublicKey,
        stakePoolId: anchor.web3.PublicKey,
        originalMintId: anchor.web3.PublicKey,
        isFungible: boolean
      ): Promise<[anchor.web3.PublicKey, number]> => {
        return anchor.web3.PublicKey.findProgramAddress(
          [
            anchor.utils.bytes.utf8.encode(STAKE_ENTRY_SEED),
            stakePoolId.toBuffer(),
            originalMintId.toBuffer(),
            isFungible ? wallet.toBuffer() : anchor.web3.PublicKey.default.toBuffer(),
          ],
          STAKE_POOL_ADDRESS
        );
    };

    const getMintSupply = async (
        connection: anchor.web3.Connection,
        originalMintId: anchor.web3.PublicKey
      ): Promise<BN> => {
        // const mint = new splToken.Token(
        //   connection,
        //   originalMintId,
        //   splToken.TOKEN_PROGRAM_ID,
        //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //   // @ts-ignore
        //   null
        // );
        const mint = await splToken36.getMint(
            connection,
            originalMintId
          )
        return mint.supply as unknown as BN;
    };

    const findStakeEntryIdFromMint = async (
        connection: anchor.web3.Connection,
        wallet: anchor.web3.PublicKey,
        stakePoolId: anchor.web3.PublicKey,
        originalMintId: anchor.web3.PublicKey,
        isFungible?: boolean
      ): Promise<[anchor.web3.PublicKey, number]> => {
        if (isFungible === undefined) {
            const supply = await getMintSupply(connection, originalMintId);
            isFungible = supply.gt(new BN(1));
            // isFungible = true;
        }
        return findStakeEntryId(wallet, stakePoolId, originalMintId, isFungible!);
    };

    const findRewardEntryId = async (
        rewardDistributorId: PublicKey,
        stakeEntryId: PublicKey
      ): Promise<[PublicKey, number]> => {
        return PublicKey.findProgramAddress(
          [
            anchor.utils.bytes.utf8.encode(REWARD_ENTRY_SEED),
            rewardDistributorId.toBuffer(),
            stakeEntryId.toBuffer(),
          ],
          REWARD_DISTRIBUTOR_ADDRESS
        );
    };

    const getStakeEntry = async (
        connection: Connection,
        stakeEntryId: PublicKey
      ): Promise<AccountData<StakeEntryData>> => {
        let wallet_t:any = wallet;
        const provider = new AnchorProvider(connection, wallet_t, {});
        const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
            STAKE_POOL_TYPES.IDL,
            STAKE_POOL_ADDRESS,
            provider
        );
      
        const parsed = await stakePoolProgram.account.stakeEntry.fetch(stakeEntryId);
        return {
          parsed,
          pubkey: stakeEntryId,
        };
    };

    const createGltchATA =async () => {
        let wallet_t:any = wallet;
        const provider = new AnchorProvider(connection, wallet_t, {});
        const [identifierId] = await findIdentifierId(wallet_t.publicKey);
        console.log(`identifierId: ${identifierId}`)
        let [stakePoolId]:any = [null];
        const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
            STAKE_POOL_TYPES.IDL,
            STAKE_POOL_ADDRESS,
            provider
        );
        const parsed:any = await stakePoolProgram.account.identifier.fetch(identifierId);
            console.log(parsed);
            const identifier = parsed?.count.toNumber();
            [stakePoolId] = await findStakePoolId(new BN(identifier));
        console.log(`stakePoolId: ${stakePoolId}`)
        const [rewardDistributorId] = await findRewardDistributorId(
            stakePoolId
        );
        console.log(`rewardDistributorId: ${rewardDistributorId}`)
        // const associatedAddress = await splToken36.getAssociatedTokenAddress(
        //     REWARD_MINT_GLTCH,
        //     rewardDistributorId,
        //     true,
        //     // splToken36.ASSOCIATED_TOKEN_PROGRAM_ID,
        //     // splToken36.TOKEN_PROGRAM_ID,
        // );
        // console.log(`associatedAddress: ${associatedAddress}`)
        // var inst = splToken36.createAssociatedTokenAccountInstruction(
        //     wallet_t.publicKey,
        //     associatedAddress,
        //     rewardDistributorId,
        //     REWARD_MINT_GLTCH,
        //     // splToken36.ASSOCIATED_TOKEN_PROGRAM_ID,
        //     // splToken36.TOKEN_PROGRAM_ID,
        //     )
            const gltch_ata = await splToken36.getOrCreateAssociatedTokenAccount(
                connection,
                wallet_t.publicKey,
                REWARD_MINT_GLTCH,
                rewardDistributorId,
                true
            );
        // console.log(`inst: ${inst}`)
        // const gltch_ata = await sendTransactions(
        //     connection,
        //     wallet_t,
        //     [[inst]],
        //     // [anchor.utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED), stakePoolId.toBytes()]
        //     [[]]
        // );
        console.log('Reward Distributor ATA address : ', gltch_ata.address.toBase58());
        console.log('Reward Distributor ATA amount : ', gltch_ata.amount);
    }

    const createStakePool = async (str:any) => {
        console.log(str);
        const transaction = new Transaction();
        let wallet_t:any = wallet;
        let params:any = {
            overlayText: "",
            imageUri: "https://dgnvzn3x5fqusqpvst65sizekrfhwtklzokfk7usi64h7erzb7iq.arweave.net/GZtct3fpYUlB9ZT92SMkVEp7TUvLlFV-kke4f5I5D9E?ext=jpg",
            requiresCollections: [],
            requiresCreators: ["C5VUx4cjauGxVU3u9KEU6zuuLW5SDV4icbDRC51qZLwX"],
            requiresAuthorization: false,
            authority: wallet_t.publicKey,
            resetOnStake: true,
            cooldownSeconds: null,
            minStakeSeconds: null,
            endDate: null,
            rewardAmount: new BN(500_000_000_000),
            rewardDurationSeconds: new BN(5),
            supply: new BN(9_000_000_000_000_000),
            kind: RewardDistributorKind.Treasury
        };
        const provider = new AnchorProvider(connection, wallet_t, {});
        const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
            STAKE_POOL_TYPES.IDL,
            STAKE_POOL_ADDRESS,
            provider
        );
        const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
            REWARD_DISTRIBUTOR_TYPES.IDL,
            REWARD_DISTRIBUTOR_ADDRESS,
            provider
        );
        let start_pool_instructions:any = [];
        const [identifierId] = await findIdentifierId(wallet_t.publicKey);
        let [stakePoolId]:any = [null];
        try {
            const parsed:any = await stakePoolProgram.account.identifier.fetch(identifierId);
            console.log(parsed);
            const identifier = parsed?.count.toNumber();
            if (identifier === 0) {
                let identifier_instructions = stakePoolProgram.instruction.initIdentifier({
                    accounts: {
                        identifier: identifierId,
                        payer: wallet_t.publicKey,
                        systemProgram: SystemProgram.programId,
                    }
                });
                start_pool_instructions.push(identifier_instructions);
            }
            [stakePoolId] = await findStakePoolId(new BN(identifier));
        } catch (error) {
            const identifier = new anchor.BN(0);
            let identifier_instructions = stakePoolProgram.instruction.initIdentifier({
                accounts: {
                    identifier: identifierId,
                    payer: wallet_t.publicKey,
                    systemProgram: SystemProgram.programId,
                }
            });
            [stakePoolId] = await findStakePoolId(identifier);
            start_pool_instructions.push(identifier_instructions);
        }
        console.log("stakePoolId : ",stakePoolId.toBase58());
        console.log("identifierId : ",identifierId.toBase58());
        let init_pool_instruction = stakePoolProgram.instruction.initPool(
            {
                overlayText: params.overlayText,
                imageUri: params.imageUri,
                requiresCollections: params.requiresCollections,
                requiresCreators: params.requiresCreators,
                requiresAuthorization: params.requiresAuthorization ?? false,
                authority: params.authority,
                resetOnStake: params.resetOnStake,
                cooldownSeconds: params.cooldownSeconds ?? null,
                minStakeSeconds: params.minStakeSeconds ?? null,
                endDate: params.endDate ?? null
            },
            {
                accounts: {
                    stakePool: stakePoolId,
                    identifier: identifierId,
                    payer: wallet_t.publicKey,
                    systemProgram: SystemProgram.programId
                }
            }
        );
        start_pool_instructions.push(init_pool_instruction);
        
        const [rewardDistributorId] = await findRewardDistributorId(
            stakePoolId
        );
        let remainingAccountsForKind = await withRemainingAccountsForKind(
            transaction,
            connection,
            wallet_t,
            rewardDistributorId,
            params.kind,
            REWARD_MINT_GLTCH
        );
        // remainingAccountsForKind = [];
        console.log(remainingAccountsForKind);
        let init_reward_distributor = rewardDistributorProgram.instruction.initRewardDistributor(
            {
                rewardAmount: params.rewardAmount,
                rewardDurationSeconds: params.rewardDurationSeconds,
                maxSupply: params.maxSupply || null,
                supply: params.supply || null,
                kind: params.kind,
                defaultMultiplier: params.defaultMultiplier || null,
                multiplierDecimals: params.multiplierDecimals || null,
                maxRewardSecondsReceived: params.maxRewardSecondsReceived || null,
            },
            {
                accounts: {
                    rewardDistributor: rewardDistributorId,
                    stakePool: stakePoolId,
                    rewardMint: REWARD_MINT_GLTCH,
                    authority: wallet_t.publicKey,
                    payer: wallet_t.publicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                },
                remainingAccounts: remainingAccountsForKind
            }
        )
        start_pool_instructions.push(init_reward_distributor);

        const start_pool_signature = await sendTransactions(
            connection,
            wallet,
            [start_pool_instructions],
            [[]]
        );
        console.log('Start Pool Signature : ', start_pool_signature);
    }

    const authorizeStakeEntryInst = async (stakePoolId:PublicKey, originalMintId: PublicKey,  arr:any) => {
        const transaction = new Transaction();
        let wallet_t:any = wallet;
        const provider = new AnchorProvider(connection, wallet_t, {});
        const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
            STAKE_POOL_TYPES.IDL,
            STAKE_POOL_ADDRESS,
            provider
        );
        const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
            REWARD_DISTRIBUTOR_TYPES.IDL,
            REWARD_DISTRIBUTOR_ADDRESS,
            provider
        );
        let authorize_stake_instructions:any = [];
        const [identifierId] = await findIdentifierId(wallet_t.publicKey);
        console.log("stakePoolId : ",stakePoolId.toBase58());
        console.log("identifierId : ",identifierId.toBase58());

        const [stakeAuthorizationId] = await findStakeAuthorizationId(
            stakePoolId,
            originalMintId
        );
        let stake_authorize_instruction = stakePoolProgram.instruction.authorizeMint(originalMintId, {
            accounts: {
              stakePool: stakePoolId,
              stakeAuthorizationRecord: stakeAuthorizationId,
              payer: wallet_t.publicKey,
              systemProgram: SystemProgram.programId,
            },
        })
        arr.push(stake_authorize_instruction);
        return arr;
    }

    const parseArrayToAuthorizeStake = async () => {
        const connection = new Connection(clusterApiUrl("devnet"));
        let authorize_stake_instruction: any = [];
        console.log(stack_opener);
        for (let index = stack_opener; index < stack_opener + 7; index++) {
          // bank_instruction = await sendAddtoBankWhitelistInstruction(BANK_WL_OBJECT[index]['farmId'], BANK_WL_OBJECT[index]['mint'], bank_instruction);
          authorize_stake_instruction = await authorizeStakeEntryInst(
            new anchor.web3.PublicKey(SAL_DEVNET_4200[index]["stakePoolId"]),
            new anchor.web3.PublicKey(SAL_DEVNET_4200[index]["mint"]),
            authorize_stake_instruction
          );
        }
        const authorize_stake_entry_sig = await sendTransactions(
          connection,
          wallet,
          [authorize_stake_instruction],
          [[]]
        );
        console.log(stack_opener);
        console.log(authorize_stake_entry_sig);
        if (stack_opener < 4200) {
          stack_opener = stack_opener + 7;
          parseArrayToAuthorizeStake();
        }
    };

    return (
        <div className={logoLoading ? "main-bg-raffles black-bg" : "main-bg-raffles"}>
            {logoLoading && (
                <div className="logo-loader-parent">
                <img alt="Alpha-logo" src={LogoWhite} className="pulse-animation" />
                </div>
            )}
            {!logoLoading && wallet && wallet.connected &&
            <div className="raffle-parent">
                <div className="create-raffle-body">
                    <div className="pull-left full-width">
                    <div className="admin-staking-parent">
                            <div className="raffle-details-div">
                                <div className="pull-left full-width m-t-5 m-b-5">
                                    <label className="sal-logo-text">Secret Alpha Labs</label>
                                    <div className="pull-left full-width m-t-10 m-b-10 text-center">
                                        <button className="create-raffle-button no-float" onClick={() => createStakePool('humans')}>Create Humans Staking Pool</button>
                                    </div>
                                    <div className="pull-left full-width m-t-10 m-b-10 text-center">
                                        <button className="create-raffle-button no-float" onClick={() => createStakePool('human_pets')}>Create Human Pets Staking Pool</button>
                                    </div>
                                    <div className="pull-left full-width m-t-10 m-b-10 text-center">
                                        <button className="create-raffle-button no-float" onClick={() => createStakePool('cyborg')}>Create Cyborgs Staking Pool</button>
                                    </div>
                                    <div className="pull-left full-width m-t-10 m-b-10 text-center">
                                        <button className="create-raffle-button no-float" onClick={() => createStakePool('cyborg_pets')}>Create Cyborg Pets Staking Pool</button>
                                    </div>
                                    <div className="pull-left full-width m-t-10 m-b-10 text-center">
                                        <button className="create-raffle-button no-float" onClick={() => createGltchATA()}>Create Gltch ATA</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            }
            {!logoLoading && !wallet.connected && 
            <WalletDialogButton className="Connect-Wallet-btn" onClick={() => onRaffleNFTAfterOpen()}>
                Connect Wallet
            </WalletDialogButton>
            }
        </div>
    );
};

export default AdminStaking;
