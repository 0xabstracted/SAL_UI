import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
} from "solanaSPLToken036";
import type { Wallet } from "saberhqSolanaContrib11244";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import { tokenManager } from "cardinalTokenManager179/dist/cjs/programs";
import LogoWhite from "../../assets/Logowhite.png";
import CloseAlpha from "../../assets/turn-back.png";
import User from "../../assets/user.png";
import Add from "../../assets/add.png";
import Close from "../../assets/close.png";
import Pencil from "../../assets/pencil.png";
import DatePicker from "react-datepicker";
import Refresh from "../../assets/refresh.png";
import Modal from "react-modal";
import * as anchor from "@project-serum/anchor";
import {
  REWARD_MINT_GLITCH,
  REWARD_MINT_GLTCH,
} from "../TokenCreation/AlphaTokenConfig";
import { Metaplex } from "@metaplex-foundation/js";
import ProgressBar from "../progress-bar";
import "react-circular-progressbar/dist/styles.css";
import {
  UPDATE_AUTHORITY_OF_TOKEN_STRING,
  STAKE_POOL_ADDRESS,
  IDENTIFIER_SEED,
  STAKE_POOL_SEED,
  REWARD_DISTRIBUTOR_SEED,
  REWARD_DISTRIBUTOR_ADDRESS,
  RewardDistributorKind,
  STAKE_AUTHORIZATION_SEED,
  STAKE_ENTRY_SEED,
  REWARD_ENTRY_SEED,
  CREATOR_ADDRESS_STRING,
} from "../AlphaStaking/StakePoolConfig";

import "react-datepicker/dist/react-datepicker.css";
import "../../css/App.css";
import { useParams } from "react-router-dom";
import { AnchorProvider, BN, Program } from "projectSerumAnchor0250";
import * as STAKE_POOL_TYPES from "../../programs/apl-staking/idl/apl_stake_pool";
import * as REWARD_DISTRIBUTOR_TYPES from "../../programs/apl-staking/idl/apl_reward_distributor";
import provider from "@project-serum/anchor/dist/provider";
import { GEM_BANK_PROGRAM_ID } from "../../GrandProgramUtils/GemBank/GetProgramObjects";
import {
  AccountData,
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "cardinalCommon2011";
import { sendTransactions } from "../../config/connection";
import * as metaplex125 from "mplTokenMetadata125";
import {
  ReceiptType,
  StakeEntryData,
} from "../../programs/apl-staking/programs/stakePool/constants";
import * as splToken from "@solana/spl-token";
import { withRemainingAccountsForKind } from "../../programs/apl-staking/programs/rewardDistributor/utils";
import {
  getRewardDistributor,
  getRewardEntry,
} from "../../programs/apl-staking/programs/rewardDistributor/accounts";
import { executeAllTransactions } from "../../programs/apl-staking/ui_utils";
import { QueryClientProvider, useMutation, useQueryClient } from "react-query";
import { useStakePoolData } from "../../programs/apl-staking/hooks/useStakePoolData";
import { useRewardDistributorData } from "../../programs/apl-staking/hooks/useRewardDistributorData";
import {
  claimRewards,
  createStakeEntryAndStakeMint,
  stake,
} from "../../programs/apl-staking";
import { notify } from "../../programs/apl-staking/common/Notification";
import { REWARD_QUERY_KEY } from "../../programs/apl-staking/handlers/useHandleClaimRewards";
import {
  AllowedTokenData,
  TOKEN_DATAS_KEY,
} from "../../programs/apl-staking/hooks/useAllowedTokenDatas";
import {
  StakeEntryTokenData,
  useStakedTokenDatas,
} from "../../programs/apl-staking/hooks/useStakedTokenDatas";
import { parseMintNaturalAmountFromDecimal } from "../../programs/apl-staking/ui_units";
import { useStakePoolId } from "../../programs/apl-staking/hooks/useStakePoolId";
import { asWallet } from "../../programs/apl-staking/common/Wallets";
import {
  REWARD_DISTRIBUTOR_IDL,
  REWARD_DISTRIBUTOR_PROGRAM,
  REWARD_MANAGER,
} from "../../programs/apl-staking/programs/rewardDistributor";
import {
  findMintCounterId,
  findTokenManagerAddress,
  tokenManagerAddressFromMint,
} from "cardinalTokenManager179/dist/cjs/programs/tokenManager/pda";
import {
  CRANK_KEY,
  getRemainingAccountsForKind,
  InvalidationType,
  TokenManagerKind,
  TokenManagerState,
  TOKEN_MANAGER_ADDRESS,
  TOKEN_MANAGER_IDL,
  TOKEN_MANAGER_PROGRAM,
  withRemainingAccountsForReturn,
} from "cardinalTokenManager179/dist/cjs/programs/tokenManager";
import { SYSVAR_RENT_PUBKEY } from "../../config/config";
import { withRemainingAccountsForUnstake } from "../../programs/apl-staking/programs/stakePool/utils";
import { getStakePool } from "../../programs/apl-staking/programs/stakePool/accounts";

const FixedStaking = (props: any) => {
  // console.log(props);
  const connection = new anchor.web3.Connection(
    "https://metaplex.devnet.rpcpool.com/"
  );

  const urlQueryParams = useParams();

  const [logoLoading, setLogoLoading] = useState(true);
  let d: any = new Date();
  const [currentDate, setCurrentDate] = useState(d);
  const [gotNfts, setGotNfts] = useState(false);
  const [raffleTicketSupply, setRaffleTicketSupply] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [nfts, setNFts] = useState<any>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [stakedBal, setStakedBal] = useState(0);
  const [stakedNft, setStakedNft] = useState<any>(null);
  const [rewardNft, setRewardNft] = useState<any>(null);
  const [unstakedNft, setUnstakedNft] = useState<any>(null);
  const [claimedNft, setClaimedNft] = useState<any>(null);
  const [stakedNfts, setStakedNfts] = useState<any>([]);
  const [nftsTab, setNftsTab] = useState(0);

  const wallet = useWallet();

  // const stakePoolId = useStakePoolId();
  // const stakedTokenDatas = useStakedTokenDatas();
  // const { data: stakePool } = useStakePoolData();
  // const rewardDistributorData = useRewardDistributorData();

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
    getNFTs();
    getStakedNfts();
    var elem: HTMLElement | null = document.getElementById("main-mobile");
    if (elem!.clientWidth < 480) {
      setIsMobile(true);
    }
    setTimeout(function () {
      setLogoLoading(false);
    }, 3000);
  }, [nfts, wallet]);

  const onRaffleNFTAfterOpen = async () => {
    console.log("Logging after modal opening");
  };

  const findIdentifierId = (identifier: PublicKey) => {
    return PublicKey.findProgramAddress(
      [anchor.utils.bytes.utf8.encode(IDENTIFIER_SEED), identifier.toBuffer()],
      STAKE_POOL_ADDRESS
    );
  };

  const findStakePoolId = (identifier: PublicKey, str: any) => {
    return PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode(STAKE_POOL_SEED),
        identifier.toBuffer(),
        anchor.utils.bytes.utf8.encode(str),
        // identifier.toArrayLike(Buffer, "le", 8),
      ],
      STAKE_POOL_ADDRESS
    );
  };

  const findStakeEntryIdPda = (stakePool: PublicKey, mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode(STAKE_ENTRY_SEED),
        stakePool.toBuffer(),
        mint.toBuffer(),
        anchor.web3.PublicKey.default.toBuffer(),
        // new PublicKey().,
      ],
      STAKE_POOL_ADDRESS
    );
  };

  const findRewardDistributorId = (stakePoolId: PublicKey) => {
    return PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED),
        stakePoolId.toBuffer(),
      ],
      REWARD_DISTRIBUTOR_ADDRESS
    );
  };

  const getNFTs = async (id?: any) => {
    if (
      (wallet && wallet.connected && !gotNfts && (!nfts || nfts.length == 0)) ||
      (id && id == 1)
    ) {
      const connection = new Connection("https://metaplex.devnet.rpcpool.com/");
      const metaplex = Metaplex.make(connection);
      const allNfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: wallet?.publicKey! })
        .run();
      let temp_nfts: any = [];
      let temp_staked_nfts: any = [];
      let wallet_t: any = wallet;
      console.log(allNfts);
      let [stakePoolIdHumans] = await findStakePoolId(
        wallet_t.publicKey,
        "humans_dev"
      );
      console.log("Stake Humans Pool : ", stakePoolIdHumans.toBase58());
      let [stakePoolIdHumanPets] = await findStakePoolId(
        wallet_t.publicKey,
        "humanpets_dev"
      );
      console.log("Stake Human Pets Pool : ", stakePoolIdHumanPets.toBase58());

      let [stakePoolIdCyborg] = await findStakePoolId(
        wallet_t.publicKey,
        "cyborgs_dev"
      );
      console.log("Stake Cyborg Pool : ", stakePoolIdCyborg.toBase58());

      let [stakePoolIdCyborgPets] = await findStakePoolId(
        wallet_t.publicKey,
        "cyborgpets_dev"
      );
      console.log(
        "Stake Cyborg Pets Pool : ",
        stakePoolIdCyborgPets.toBase58()
      );

      for (let index = 0; index < allNfts.length; index++) {
        const nft: any = allNfts[index];
        const mint_info = await getMint(connection, nft.mintAddress);
        const account_freeze: any = await connection.getAccountInfo(
          nft.mintAddress
        );
        // console.log("Freeze Authority account : ", account_freeze);
        const account_freeze_new: any = await connection.getAccountInfo(
          account_freeze.owner
        );
        console.log(
          "Freeze Authority account : ",
          account_freeze_new.owner.toBase58()
        );

        console.log(
          "Mint Authority account : ",
          mint_info.mintAuthority?.toBase58()
        );
        let is_staked = false;
        // if (
        //   mint_info.freezeAuthority == stakePoolIdHumans ||
        //   mint_info.freezeAuthority == stakePoolIdHumanPets ||
        //   mint_info.freezeAuthority == stakePoolIdCyborg ||
        //   mint_info.freezeAuthority == stakePoolIdCyborgPets
        // ) {
        //   is_staked = true;
        // }
        var creators = nft.creators;
        var is_ours = false;
        if (creators[0].address.toBase58() == CREATOR_ADDRESS_STRING) {
          is_ours = true;
          for (let iindex = 0; iindex < creators.length; iindex++) {
            const element = creators[iindex];
            if (element.share == 0) {
            }
          }
        }
        if (is_ours) {
          if (nft.json && nft.json != null) {
            var attributes = nft.json.attributes;
            var is_human;
            var is_cyborg;
            var is_pet;
            var trait_type;
            for (let index = 0; index < attributes.length; index++) {
              const element = attributes[index];
              if (
                element.trait_type == "BaseBody" &&
                element.value == "Human"
              ) {
                is_human = true;
              } else if (
                element.trait_type == "BaseBody" &&
                element.value == "Cyborg"
              ) {
                is_cyborg = true;
              }
              if (
                element.trait_type == "Pets" &&
                element.value &&
                element.value.length > 0
              ) {
                is_pet = true;
              }
            }
            if (is_human && is_pet) {
              trait_type = "humanpets_dev";
            } else if (is_human && !is_pet) {
              trait_type = "humans_dev";
            } else if (is_cyborg && is_pet) {
              trait_type = "cyborgpets_dev";
            } else if (is_cyborg && !is_pet) {
              trait_type = "cyborgs_dev";
            }
            var obj: any = {
              id: temp_nfts.length,
              name: nft.name,
              link: nft.json.image,
              mint: nft.mintAddress,
              updateAuthority: nft.updateAuthority,
              creator: nft.creators[0].address,
              trait_type: trait_type,
            };
            if (is_staked) {
              temp_staked_nfts.push(obj);
              // setStakedNfts(temp_staked_nfts!);
            } else {
              var l;
              for (let ii = 0; ii < stakedNfts.length; ii++) {
                const element = stakedNfts[ii];
                if (element.mint == obj.mint.toBase58()) {
                  l = true;
                }
              }
              if (!l) {
                temp_nfts.push(obj);
                setNFts(temp_nfts!);
              }
            }
          } else {
            var xhr = new XMLHttpRequest();
            xhr.addEventListener("readystatechange", function () {
              if (this.readyState === 4) {
                var attributes = JSON.parse(this.responseText).attributes;
                var is_human;
                var is_cyborg;
                var is_pet;
                var trait_type;
                for (let index = 0; index < attributes.length; index++) {
                  const element = attributes[index];
                  if (
                    element.trait_type == "BaseBody" &&
                    element.value == "Human"
                  ) {
                    is_human = true;
                  } else if (
                    element.trait_type == "BaseBody" &&
                    element.value == "Cyborg"
                  ) {
                    is_cyborg = true;
                  }
                  if (
                    element.trait_type == "Pets" &&
                    element.value &&
                    element.value.length > 0
                  ) {
                    is_pet = true;
                  }
                }
                if (is_human && is_pet) {
                  trait_type = "humanpets_dev";
                } else if (is_human && !is_pet) {
                  trait_type = "humans_dev";
                } else if (is_cyborg && is_pet) {
                  trait_type = "cyborgpets_dev";
                } else if (is_cyborg && !is_pet) {
                  trait_type = "cyborgs_dev";
                }
                var obj: any = {
                  id: temp_nfts.length,
                  name: nft.name,
                  link: JSON.parse(this.responseText).image,
                  mint: nft.mintAddress,
                  updateAuthority: nft.updateAuthority,
                  creator: nft.creators[0].address,
                  trait_type: trait_type,
                };
                if (is_staked) {
                  temp_staked_nfts.push(obj);
                  // setStakedNfts(temp_staked_nfts!);
                } else {
                  var l;
                  for (let ii = 0; ii < stakedNfts.length; ii++) {
                    const element = stakedNfts[ii];
                    if (element.mint == obj.mint.toBase58()) {
                      l = true;
                    }
                  }
                  if (!l) {
                    temp_nfts.push(obj);
                    setNFts(temp_nfts!);
                  }
                }
              }
            });
            xhr.open("GET", nft.uri);
            xhr.send();
          }
        }
      }
      setGotNfts(true);
    }
  };

  const getStakedNfts = async () => {
    if (wallet && wallet.connected) {
      // WARNING: For POST requests, body is set to null by browsers.
      var data = JSON.stringify({
        owner: wallet.publicKey?.toBase58(),
      });

      var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", async function () {
        if (this.readyState === 4) {
          console.log(this.responseText);
          try {
            var mints = JSON.parse(this.responseText).data;
            var array: any = [];
            for (let index = 0; index < mints.length; index++) {
              const element = mints[index];
              const connection = new Connection(
                "https://metaplex.devnet.rpcpool.com/"
              );
              const metaplex = new Metaplex(connection);
              // console.log(element.account.gemMint.toBase58());
              var pk = new anchor.web3.PublicKey(element.mint);
              let nft: any = await metaplex
                .nfts()
                .findByMint({ mintAddress: pk })
                .run();
              console.log(nft);
              var obj: any = {
                mint: element.mint,
                name: nft.name,
                link: nft.json.image,
                trait_type: element.trait_type,
                auth: nft.updateAuthorityAddress.toBase58(),
              };
              array.push(obj);
            }
            if (array && array.length > 0) {
              console.log(array);
              setStakedNfts(array);
            }
          } catch (error) {}
        }
      });

      xhr.open("POST", "http://34.198.111.186:8000/getNfts");
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(data);
    }
  };

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
        isFungible
          ? wallet.toBuffer()
          : anchor.web3.PublicKey.default.toBuffer(),
      ],
      STAKE_POOL_ADDRESS
    );
  };

  const getMintSupply = async (
    connection: anchor.web3.Connection,
    originalMintId: anchor.web3.PublicKey
  ): Promise<BN> => {
    const mint = new splToken.Token(
      connection,
      originalMintId,
      splToken.TOKEN_PROGRAM_ID,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      null
    );
    return (await mint.getMintInfo()).supply;
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
      isFungible = true;
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
    let wallet_t: any = wallet;
    const provider = new AnchorProvider(connection, wallet_t, {});
    const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
      STAKE_POOL_TYPES.IDL,
      STAKE_POOL_ADDRESS,
      provider
    );

    const parsed = await stakePoolProgram.account.stakeEntry.fetch(
      stakeEntryId
    );
    return {
      parsed,
      pubkey: stakeEntryId,
    };
  };

  const wallet_n: Wallet = asWallet(useWallet());

  const completeStakeFn = async () => {
    const transaction = new Transaction();
    let nft = stakedNft;
    let wallet_t: any = wallet;
    const provider = new AnchorProvider(connection, wallet_t, {});
    const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
      STAKE_POOL_TYPES.IDL,
      STAKE_POOL_ADDRESS,
      provider
    );
    const rewardDistributorProgram =
      new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
        REWARD_DISTRIBUTOR_TYPES.IDL,
        REWARD_DISTRIBUTOR_ADDRESS,
        provider
      );
    let complete_stake_instructions: any = [];
    const [identifierId] = await findIdentifierId(wallet_t.publicKey);
    let [stakePoolId]: any = [null];
    [stakePoolId] = await findStakePoolId(wallet_t.publicKey, nft.trait_type);
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());

    const [originalMintMetadataId] = await Promise.all([
      metaplex125.Metadata.getPDA(nft.mint),
    ]);
    console.log(stakePoolId.toBase58());

    const [stakeEntryId] = await findStakeEntryIdPda(stakePoolId, nft.mint);

    // const stakeEntryData = await tryGetAccount(() =>
    //   getStakeEntry(connection, stakeEntryId)
    // );
    let stakeEntryData: any = null;
    try {
      const parsed = await stakePoolProgram.account.stakeEntry.fetch(
        stakeEntryId
      );

      console.log(parsed);

      stakeEntryData = {
        parsed,
        stakeEntryId,
      };
    } catch (error) {}
    const remainingAccounts = await remainingAccountsForInitStakeEntry(
      stakePoolId,
      nft.mint
    );

    let init_entry_instruction = stakePoolProgram.instruction.initEntry(
      wallet_t.publicKey,
      {
        accounts: {
          stakeEntry: stakeEntryId,
          stakePool: stakePoolId,
          originalMint: nft.mint,
          originalMintMetadata: originalMintMetadataId,
          payer: wallet_t.publicKey,
          systemProgram: SystemProgram.programId,
        },
        // remainingAccounts,
      }
    );
    if (!stakeEntryData) {
      complete_stake_instructions.push(init_entry_instruction);
    }

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const [rewardEntryId] = await findRewardEntryId(
      rewardDistributorId,
      stakeEntryId
    );
    let init_reward_entry_instruction =
      rewardDistributorProgram.instruction.initRewardEntry({
        accounts: {
          rewardEntry: rewardEntryId,
          stakeEntry: stakeEntryId,
          rewardDistributor: rewardDistributorId,
          payer: wallet_t.publicKey,
          systemProgram: SystemProgram.programId,
        },
      });

    complete_stake_instructions.push(init_reward_entry_instruction);

    const associatedAddress = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      stakedNft.mint,
      stakeEntryId,
      true
    );
    const account = await connection.getAccountInfo(associatedAddress);

    if (!account) {
      complete_stake_instructions.push(
        splToken.Token.createAssociatedTokenAccountInstruction(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          stakedNft.mint,
          associatedAddress,
          stakeEntryId,
          wallet_t.publicKey
        )
      );
    }

    let userOriginalMintTokenAccountId = await findAta(
      stakedNft.mint,
      wallet_n.publicKey,
      true
    );
    let stake_instruction = stakePoolProgram.instruction.stake(new BN(1), {
      accounts: {
        stakeEntry: stakeEntryId,
        stakePool: stakePoolId,
        stakeEntryOriginalMintTokenAccount: associatedAddress,
        originalMint: stakedNft.mint,
        user: wallet_n.publicKey,
        userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
    complete_stake_instructions.push(stake_instruction);

    if (
      !stakeEntryData?.parsed ||
      stakeEntryData.parsed.amount.toNumber() === 0
    ) {
      const associatedAddressReward =
        await splToken.Token.getAssociatedTokenAddress(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          stakedNft.mint,
          (
            await findTokenManagerAddress(stakedNft.mint)
          )[0],
          true
        );
      const accountReward = await connection.getAccountInfo(associatedAddress);

      if (!accountReward) {
        complete_stake_instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            stakedNft.mint,
            associatedAddressReward,
            (await findTokenManagerAddress(stakedNft.mint))[0],
            wallet_t.publicKey
          )
        );
      }
      // const tokenManagerReceiptMintTokenAccountId =
      //   await withFindOrInitAssociatedTokenAccount(
      //     transaction,
      //     connection,
      //     stakedNft.mint,
      //     (
      //       await findTokenManagerAddress(stakedNft.mint)
      //     )[0],
      //     wallet_n.publicKey,
      //     true
      //   );

      const [
        [tokenManagerId],
        [mintCounterId],
        stakeEntryReceiptMintTokenAccountId,
        userReceiptMintTokenAccountId,
        remainingAccounts,
      ] = await Promise.all([
        findTokenManagerAddress(stakedNft.mint),
        findMintCounterId(stakedNft.mint),
        findAta(stakedNft.mint, stakeEntryId, true),
        findAta(stakedNft.mint, wallet_n.publicKey, true),
        getRemainingAccountsForKind(stakedNft.mint, TokenManagerKind.Edition),
      ]);

      var claim_receipt_mint_inst =
        stakePoolProgram.instruction.claimReceiptMint({
          accounts: {
            stakeEntry: stakeEntryId,
            originalMint: stakedNft.mint,
            receiptMint: stakedNft.mint,
            stakeEntryReceiptMintTokenAccount:
              stakeEntryReceiptMintTokenAccountId,
            user: wallet_n.publicKey,
            userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
            mintCounter: mintCounterId,
            tokenManager: tokenManagerId,
            tokenManagerReceiptMintTokenAccount: associatedAddressReward,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
            systemProgram: SystemProgram.programId,
            associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            rent: SYSVAR_RENT_PUBKEY,
          },
          remainingAccounts,
        });

      complete_stake_instructions.push(claim_receipt_mint_inst);
    }

    const complete_stake_signature = await sendTransactions(
      connection,
      wallet,
      [complete_stake_instructions],
      [[]]
    );
    console.log("Start Pool Signature : ", complete_stake_signature);

    if (complete_stake_signature) {
      var data = JSON.stringify({
        owner: wallet_n.publicKey.toBase58(),
        mint: nft.mint,
        trait_type: nft.trait_type,
      });

      var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          console.log(this.responseText);
          getStakedNfts();
        }
      });

      xhr.open("POST", "http://34.198.111.186:8000/stakeNft");
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(data);
    }
  };

  const completeAllNftsStakeFn = async () => {
    let unsignedTxns: any = [];
    for (let index = 10; index < 13; index++) {
      const transaction = new Transaction();
      let complete_stake_instructions: any = [];
      let nft = nfts[index];
      let wallet_t: any = wallet;
      const provider = new AnchorProvider(connection, wallet_t, {});
      const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
        STAKE_POOL_TYPES.IDL,
        STAKE_POOL_ADDRESS,
        provider
      );
      const rewardDistributorProgram =
        new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
          REWARD_DISTRIBUTOR_TYPES.IDL,
          REWARD_DISTRIBUTOR_ADDRESS,
          provider
        );
      const [identifierId] = await findIdentifierId(wallet_t.publicKey);
      let [stakePoolId]: any = [null];
      [stakePoolId] = await findStakePoolId(wallet_t.publicKey, nft.trait_type);
      console.log("stakePoolId : ", stakePoolId.toBase58());
      console.log("identifierId : ", identifierId.toBase58());

      const [originalMintMetadataId] = await Promise.all([
        metaplex125.Metadata.getPDA(nft.mint),
      ]);
      console.log(stakePoolId.toBase58());

      const [stakeEntryId] = await findStakeEntryIdPda(stakePoolId, nft.mint);

      let stakeEntryData: any = null;
      try {
        const parsed = await stakePoolProgram.account.stakeEntry.fetch(
          stakeEntryId
        );

        console.log(
          "stakeEntryData Last Staker : ",
          parsed.lastStaker.toBase58()
        );

        stakeEntryData = {
          parsed,
          stakeEntryId,
        };
      } catch (error) {}
      const remainingAccounts = await remainingAccountsForInitStakeEntry(
        stakePoolId,
        nft.mint
      );

      let init_entry_instruction = stakePoolProgram.instruction.initEntry(
        wallet_t.publicKey,
        {
          accounts: {
            stakeEntry: stakeEntryId,
            stakePool: stakePoolId,
            originalMint: nft.mint,
            originalMintMetadata: originalMintMetadataId,
            payer: wallet_t.publicKey,
            systemProgram: SystemProgram.programId,
          },
          // remainingAccounts,
        }
      );
      if (!stakeEntryData) {
        complete_stake_instructions.push(init_entry_instruction);
      }

      const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
      const [rewardEntryId] = await findRewardEntryId(
        rewardDistributorId,
        stakeEntryId
      );
      let parsedRewardEntry;
      try {
        parsedRewardEntry =
          await rewardDistributorProgram.account.rewardEntry.fetch(
            rewardEntryId
          );

        console.log(parsedRewardEntry);
      } catch (error) {
        parsedRewardEntry = null;
      }
      let init_reward_entry_instruction =
        rewardDistributorProgram.instruction.initRewardEntry({
          accounts: {
            rewardEntry: rewardEntryId,
            stakeEntry: stakeEntryId,
            rewardDistributor: rewardDistributorId,
            payer: wallet_t.publicKey,
            systemProgram: SystemProgram.programId,
          },
        });

      if (parsedRewardEntry == null) {
        complete_stake_instructions.push(init_reward_entry_instruction);
      }

      const associatedAddress = await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        nft.mint,
        stakeEntryId,
        true
      );
      const account = await connection.getAccountInfo(associatedAddress);

      if (!account) {
        complete_stake_instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            nft.mint,
            associatedAddress,
            stakeEntryId,
            wallet_t.publicKey
          )
        );
      }

      let userOriginalMintTokenAccountId = await findAta(
        nft.mint,
        wallet_n.publicKey,
        true
      );
      console.log(
        "userOriginalMintTokenAccountId : ",
        userOriginalMintTokenAccountId.toBase58()
      );

      let stake_instruction = stakePoolProgram.instruction.stake(new BN(1), {
        accounts: {
          stakeEntry: stakeEntryId,
          stakePool: stakePoolId,
          stakeEntryOriginalMintTokenAccount: associatedAddress,
          originalMint: nft.mint,
          user: wallet_n.publicKey,
          userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });
      complete_stake_instructions.push(stake_instruction);

      if (
        !stakeEntryData?.parsed ||
        stakeEntryData.parsed.amount.toNumber() === 0
      ) {
        const associatedAddressReward =
          await splToken.Token.getAssociatedTokenAddress(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            nft.mint,
            (
              await findTokenManagerAddress(nft.mint)
            )[0],
            true
          );
        const accountReward = await connection.getAccountInfo(
          associatedAddress
        );

        if (!accountReward) {
          complete_stake_instructions.push(
            splToken.Token.createAssociatedTokenAccountInstruction(
              splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              splToken.TOKEN_PROGRAM_ID,
              nft.mint,
              associatedAddressReward,
              (await findTokenManagerAddress(nft.mint))[0],
              wallet_t.publicKey
            )
          );
        }

        const stakeEntryReceiptMintTokenAccountId = await findAta(
          nft.mint,
          stakeEntryId,
          true
        );
        console.log(
          "stakeEntryReceiptMintTokenAccountId : ",
          stakeEntryReceiptMintTokenAccountId
        );
        console.log(stakeEntryReceiptMintTokenAccountId.toBase58());

        const [
          [tokenManagerId],
          [mintCounterId],
          // stakeEntryReceiptMintTokenAccountId,
          userReceiptMintTokenAccountId,
          remainingAccounts,
        ] = await Promise.all([
          findTokenManagerAddress(nft.mint),
          findMintCounterId(nft.mint),
          // findAta(nft.mint, stakeEntryId, true),
          findAta(nft.mint, wallet_n.publicKey, true),
          getRemainingAccountsForKind(nft.mint, TokenManagerKind.Edition),
        ]);

        var claim_receipt_mint_inst =
          stakePoolProgram.instruction.claimReceiptMint({
            accounts: {
              stakeEntry: stakeEntryId,
              originalMint: nft.mint,
              receiptMint: nft.mint,
              stakeEntryReceiptMintTokenAccount:
                stakeEntryReceiptMintTokenAccountId,
              user: wallet_n.publicKey,
              userReceiptMintTokenAccount: userReceiptMintTokenAccountId,
              mintCounter: mintCounterId,
              tokenManager: tokenManagerId,
              tokenManagerReceiptMintTokenAccount: associatedAddressReward,
              tokenProgram: TOKEN_PROGRAM_ID,
              tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
              systemProgram: SystemProgram.programId,
              associatedTokenProgram: splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              rent: SYSVAR_RENT_PUBKEY,
            },
            remainingAccounts,
          });

        complete_stake_instructions.push(claim_receipt_mint_inst);
      }
      for (let ki = 0; ki < complete_stake_instructions.length; ki++) {
        transaction.add(complete_stake_instructions[ki]);
      }
      unsignedTxns.push(transaction);
    }
    let complete_stake_signature;
    try {
      complete_stake_signature = await executeAllTransactions(
        connection,
        wallet_n,
        unsignedTxns,
        {
          notificationConfig: {
            message: `Successfully staked`,
            description: "Stake progress will now dynamically update",
          },
        }
      );
    } catch (e) {
      complete_stake_signature = null;
    }

    // const complete_stake_signature = await sendTransactions(
    //   connection,
    //   wallet,
    //   [complete_stake_instructions],
    //   [[]]
    // );
    // console.log("Start Pool Signature : ", complete_stake_signature);
    if (complete_stake_signature != null) {
      // for (let index = 0; index < nfts.length; index++) {
      //   let nft = nfts[index];
      //   if (complete_stake_signature) {
      //     var data = JSON.stringify({
      //       owner: wallet_n.publicKey.toBase58(),
      //       mint: nft.mint,
      //       trait_type: nft.trait_type,
      //     });
      //     var xhr = new XMLHttpRequest();
      //     // xhr.withCredentials = true;
      //     xhr.addEventListener("readystatechange", function () {
      //       if (this.readyState === 4) {
      //         console.log(this.responseText);
      //         getStakedNfts();
      //       }
      //     });
      //     xhr.open("POST", "http://34.198.111.186:8000/stakeNft");
      //     xhr.setRequestHeader("Content-Type", "application/json");
      //     xhr.send(data);
      //   }
      // }
    }
  };

  const completeUnstakeFn = async (nft: any) => {
    const transaction = new Transaction();
    let wallet_t: any = wallet;
    // var nft = unstakedNft;
    const provider = new AnchorProvider(connection, wallet_n, {});
    const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
      STAKE_POOL_TYPES.IDL,
      STAKE_POOL_ADDRESS,
      provider
    );
    const rewardDistributorProgram =
      new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
        REWARD_DISTRIBUTOR_TYPES.IDL,
        REWARD_DISTRIBUTOR_ADDRESS,
        provider
      );

    const tokenManagerProgram = new Program<TOKEN_MANAGER_PROGRAM>(
      TOKEN_MANAGER_IDL,
      TOKEN_MANAGER_ADDRESS,
      provider
    );

    let complete_unstake_instructions: any = [];
    const [identifierId] = await findIdentifierId(wallet_n.publicKey);
    let [stakePoolId]: any = [null];
    [stakePoolId] = await findStakePoolId(wallet_n.publicKey, nft.trait_type);
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    console.log(stakePoolId.toBase58());

    const [stakeEntryId] = await findStakeEntryIdPda(
      stakePoolId,
      new PublicKey(nft.mint)
    );

    let stakeEntryData: any = null;
    try {
      const parsed = await stakePoolProgram.account.stakeEntry.fetch(
        stakeEntryId
      );

      console.log(parsed);

      stakeEntryData = {
        parsed,
        stakeEntryId,
      };
    } catch (error) {}

    let rewardDistributorData: any = null;
    try {
      const parsed =
        await rewardDistributorProgram.account.rewardDistributor.fetch(
          rewardDistributorId
        );

      console.log(parsed);

      rewardDistributorData = {
        parsed,
        rewardDistributorId,
      };
    } catch (error) {}

    let stakePoolData: any = null;
    try {
      const parsed = await stakePoolProgram.account.stakePool.fetch(
        stakePoolId
      );

      console.log(parsed);

      stakePoolData = {
        parsed,
        stakePoolId,
      };
    } catch (error) {}

    if (
      (!stakePoolData.parsed.cooldownSeconds ||
        stakePoolData.parsed.cooldownSeconds === 0 ||
        (stakeEntryData?.parsed.cooldownStartSeconds &&
          Date.now() / 1000 -
            stakeEntryData.parsed.cooldownStartSeconds.toNumber() >=
            stakePoolData.parsed.cooldownSeconds)) &&
      (!stakePoolData.parsed.minStakeSeconds ||
        stakePoolData.parsed.minStakeSeconds === 0 ||
        (stakeEntryData?.parsed.lastStakedAt &&
          Date.now() / 1000 - stakeEntryData.parsed.lastStakedAt.toNumber() >=
            stakePoolData.parsed.minStakeSeconds)) &&
      (stakeEntryData?.parsed.originalMintClaimed ||
        stakeEntryData?.parsed.stakeMintClaimed)
    ) {
      const tokenManagerId = await tokenManagerAddressFromMint(
        connection,
        new PublicKey(nft.mint)
      );

      let tokenManagerData: any = null;
      try {
        const parsed = await tokenManagerProgram.account.tokenManager.fetch(
          tokenManagerId
        );

        console.log(parsed);

        tokenManagerData = {
          parsed,
          tokenManagerId,
        };
      } catch (error) {}

      // const tokenManagerData = await tryGetAccount(() =>
      //   tokenManager.accounts.getTokenManager(connection, tokenManagerId)
      // );
      let remainingAccountsForReturn: any;
      const {
        issuer,
        mint,
        claimApprover,
        invalidationType,
        receiptMint,
        state,
        kind,
      } = tokenManagerData.parsed;
      console.log("Issuer Public Key : ", issuer.toBase58());
      console.log("claimApprover Public Key : ", claimApprover?.toBase58());
      console.log("invalidationType : ", invalidationType);
      console.log("state : ", state);
      console.log("kind : ", kind);

      if (
        invalidationType === InvalidationType.Vest &&
        state === TokenManagerState.Issued
      ) {
        if (!claimApprover) throw "Claim approver must be set";

        const associatedAddressClaimApprove =
          await splToken.Token.getAssociatedTokenAddress(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            wallet_n.publicKey,
            true
          );
        const accountClaimApprove = await connection.getAccountInfo(
          associatedAddressClaimApprove
        );
        complete_unstake_instructions.push(
          splToken.Token.createAssociatedTokenAccountInstruction(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mint,
            claimApprover,
            claimApprover,
            wallet_t.publicKey
          )
        );
        // const claimApproverTokenAccountId =
        //   await withFindOrInitAssociatedTokenAccount(
        //     transaction,
        //     connection,
        //     mint,
        //     claimApprover,
        //     wallet_n.publicKey,
        //     true
        //   );
        console.log("one");
        remainingAccountsForReturn = [
          {
            pubkey: accountClaimApprove,
            isSigner: false,
            isWritable: true,
          },
        ];
      } else if (
        invalidationType === InvalidationType.Return ||
        state === TokenManagerState.Issued
      ) {
        if (receiptMint) {
          const receiptMintLargestAccount =
            await connection.getTokenLargestAccounts(receiptMint);

          // get holder of receipt mint
          const receiptTokenAccountId =
            receiptMintLargestAccount.value[0]?.address;
          if (!receiptTokenAccountId)
            throw new Error("No token accounts found");
          const receiptMintToken = new splToken.Token(
            connection,
            receiptMint,
            TOKEN_PROGRAM_ID,
            Keypair.generate()
          );
          const receiptTokenAccount = await receiptMintToken.getAccountInfo(
            receiptTokenAccountId
          );

          // get ATA for this mint of receipt mint holder

          const associatedAddressInitAssoc =
            await splToken.Token.getAssociatedTokenAddress(
              splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              splToken.TOKEN_PROGRAM_ID,
              mint,
              receiptTokenAccount.owner,
              true
            );
          const accountInitAssoc = await connection.getAccountInfo(
            associatedAddressInitAssoc
          );
          console.log(
            "withFindOrInitAssociatedTokenAccount associatedAddress:",
            associatedAddressInitAssoc
          );
          console.log(
            "withFindOrInitAssociatedTokenAccount account:",
            accountInitAssoc
          );

          if (!accountInitAssoc) {
            complete_unstake_instructions.push(
              splToken.Token.createAssociatedTokenAccountInstruction(
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                splToken.TOKEN_PROGRAM_ID,
                mint,
                associatedAddressInitAssoc,
                receiptTokenAccount.owner,
                wallet_t.publicKey
              )
            );
          }
          console.log("abcd");

          remainingAccountsForReturn = [
            {
              pubkey: associatedAddressInitAssoc,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: receiptTokenAccountId,
              isSigner: false,
              isWritable: true,
            },
          ];
        } else {
          const associatedAddressIssuerToken =
            await splToken.Token.getAssociatedTokenAddress(
              splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              splToken.TOKEN_PROGRAM_ID,
              mint,
              issuer,
              true
            );
          const accountIssuerToken = await connection.getAccountInfo(
            associatedAddressIssuerToken
          );
          console.log(
            "withFindOrInitAssociatedTokenAccount associatedAddress:",
            associatedAddressIssuerToken
          );
          console.log(
            "withFindOrInitAssociatedTokenAccount account:",
            accountIssuerToken
          );
          if (!accountIssuerToken) {
            complete_unstake_instructions.push(
              splToken.Token.createAssociatedTokenAccountInstruction(
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                splToken.TOKEN_PROGRAM_ID,
                mint,
                associatedAddressIssuerToken,
                issuer,
                wallet_t.publicKey
              )
            );
          }

          console.log("efgh");
          remainingAccountsForReturn = [
            {
              pubkey: associatedAddressIssuerToken,
              isSigner: false,
              isWritable: true,
            },
          ];
        }
      } else {
        console.log("empty");
        remainingAccountsForReturn = [];
      }

      const [tokenManagerIdNew] = await findTokenManagerAddress(
        new PublicKey(nft.mint)
      );
      const tokenManagerTokenAccountId = await findAta(
        new PublicKey(nft.mint),
        (
          await findTokenManagerAddress(new PublicKey(nft.mint))
        )[0],
        true
      );

      const userReceiptMintTokenAccount = await findAta(
        new PublicKey(nft.mint),
        wallet_n.publicKey,
        true
      );

      const transferAccounts = await getRemainingAccountsForKind(
        new PublicKey(nft.mint),
        tokenManagerData?.parsed.kind!
      );
      console.log("transferAccounts0:", transferAccounts[0].pubkey.toBase58());
      console.log("transferAccounts1:", transferAccounts[1].pubkey.toBase58());
      console.log(
        "remainingAccountsForReturn",
        remainingAccountsForReturn
        // remainingAccountsForReturn[0].pubkey.toBase58()
      );
      var return_receipt_mint_inst =
        stakePoolProgram.instruction.returnReceiptMint({
          accounts: {
            stakeEntry: stakeEntryId,
            receiptMint: new PublicKey(nft.mint),
            tokenManager: tokenManagerId,
            tokenManagerTokenAccount: tokenManagerTokenAccountId,
            userReceiptMintTokenAccount: userReceiptMintTokenAccount,
            user: wallet_n.publicKey,
            collector: wallet_n.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
            rent: SYSVAR_RENT_PUBKEY,
          },
          remainingAccounts: [
            ...(tokenManagerData?.parsed.state === TokenManagerState.Claimed
              ? transferAccounts
              : []),
            ...remainingAccountsForReturn,
          ],
        });
      complete_unstake_instructions.push(return_receipt_mint_inst);
    }

    const associatedAddressStakeEntry =
      await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        new PublicKey(nft.mint),
        stakeEntryId,
        true
      );
    const accountStakeEntry = await connection.getAccountInfo(
      associatedAddressStakeEntry
    );

    if (!accountStakeEntry) {
      complete_unstake_instructions.push(
        splToken.Token.createAssociatedTokenAccountInstruction(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          new PublicKey(nft.mint),
          associatedAddressStakeEntry,
          stakeEntryId,
          wallet_t.publicKey
        )
      );
    }

    const associatedAddressUserOriginal =
      await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        new PublicKey(nft.mint),
        wallet_n.publicKey,
        true
      );
    const accountUserOriginal = await connection.getAccountInfo(
      associatedAddressUserOriginal
    );

    if (!accountUserOriginal) {
      complete_unstake_instructions.push(
        splToken.Token.createAssociatedTokenAccountInstruction(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          new PublicKey(nft.mint),
          associatedAddressUserOriginal,
          wallet_n.publicKey,
          wallet_n.publicKey
        )
      );
    }

    const associatedAddressUnstake =
      await splToken.Token.getAssociatedTokenAddress(
        splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        splToken.TOKEN_PROGRAM_ID,
        new PublicKey(nft.mint),
        stakeEntryId,
        true
      );
    const accountUnstake = await connection.getAccountInfo(
      associatedAddressUnstake
    );
    console.log(
      "withFindOrInitAssociatedTokenAccount associatedAddress:",
      associatedAddressUnstake
    );
    console.log(
      "withFindOrInitAssociatedTokenAccount account:",
      accountUnstake
    );
    if (!accountUnstake) {
      complete_unstake_instructions.push(
        splToken.Token.createAssociatedTokenAccountInstruction(
          splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
          splToken.TOKEN_PROGRAM_ID,
          stakeEntryData?.parsed.stakeMint,
          associatedAddressUnstake,
          stakeEntryId,
          wallet_n.publicKey
        )
      );
    }

    // const remainingAccounts = [
    //   {
    //     pubkey: associatedAddressUnstake,
    //     isSigner: false,
    //     isWritable: false,
    //   },
    // ];

    let unstake_instruction = stakePoolProgram.instruction.unstake({
      accounts: {
        stakePool: stakePoolId,
        stakeEntry: stakeEntryId,
        originalMint: nft.mint,
        stakeEntryOriginalMintTokenAccount: associatedAddressStakeEntry,
        user: wallet_n.publicKey,
        userOriginalMintTokenAccount: associatedAddressUserOriginal,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      // remainingAccounts: remainingAccounts,
    });
    complete_unstake_instructions.push(unstake_instruction);

    if (rewardDistributorData) {
      const [rewardEntryId] = await findRewardEntryId(
        rewardDistributorData.rewardDistributorId,
        stakeEntryId
      );
      const rewardMintTokenAccountId = await findAta(
        REWARD_MINT_GLTCH,
        wallet_n.publicKey,
        true
      );
      console.log(
        "rewardMintTokenAccountId : ",
        rewardMintTokenAccountId.toBase58()
      );

      const rewardDistributorRewardMintTokenAccountId = await findAta(
        REWARD_MINT_GLTCH,
        rewardDistributorId,
        // wallet_n.publicKey,
        true
      );

      const userRewardMintTokenAccountId = await findAta(
        rewardDistributorData.parsed.rewardMint,
        wallet_n.publicKey,
        true
      );

      const remainingAccountsForKind: any = [
        {
          pubkey: rewardDistributorRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: userRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
      ];

      // const remainingAccountsForKind = await withRemainingAccountsForKind(
      //   transaction,
      //   connection,
      //   wallet_n,
      //   rewardDistributorId,
      //   rewardDistributorData.parsed.kind,
      //   rewardDistributorData.parsed.rewardMint,
      //   true
      // );
      let claim_reward_inst = rewardDistributorProgram.instruction.claimRewards(
        {
          accounts: {
            rewardEntry: rewardEntryId,
            rewardDistributor: rewardDistributorId,
            stakeEntry: stakeEntryId,
            stakePool: stakePoolId,
            rewardMint: REWARD_MINT_GLTCH,
            userRewardMintTokenAccount: rewardMintTokenAccountId,
            rewardManager: REWARD_MANAGER,
            user: wallet_n.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          },
          remainingAccounts: [...remainingAccountsForKind],
        }
      );
      complete_unstake_instructions.push(claim_reward_inst);
    }

    const complete_unstake_signature = await sendTransactions(
      connection,
      wallet,
      [complete_unstake_instructions],
      [[]]
    );
    console.log("Start Pool Signature : ", complete_unstake_signature);

    if (complete_unstake_signature != null) {
      // WARNING: For POST requests, body is set to null by browsers.
      var data = JSON.stringify({
        owner: wallet.publicKey?.toBase58(),
        mint: nft.mint,
      });

      var xhr = new XMLHttpRequest();
      // xhr.withCredentials = true;

      xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
          console.log(this.responseText);
          getNFTs(1);
        }
      });

      xhr.open("POST", "http://34.198.111.186:8000/unStakeNft");
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(data);
    }
  };

  const completeAllUnstakeFn = async (nft: any) => {
    let unsignedTxns: any = [];
    if (stakedNfts && stakedNfts.length > 0) {
      for (let ik = 0; ik < stakedNfts.length; ik++) {
        const transaction = new Transaction();
        let complete_unstake_instructions: any = [];
        let nft = stakedNfts[ik];
        let wallet_t: any = wallet;
        const provider = new AnchorProvider(connection, wallet_n, {});
        const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
          STAKE_POOL_TYPES.IDL,
          STAKE_POOL_ADDRESS,
          provider
        );
        const rewardDistributorProgram =
          new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
            REWARD_DISTRIBUTOR_TYPES.IDL,
            REWARD_DISTRIBUTOR_ADDRESS,
            provider
          );

        const tokenManagerProgram = new Program<TOKEN_MANAGER_PROGRAM>(
          TOKEN_MANAGER_IDL,
          TOKEN_MANAGER_ADDRESS,
          provider
        );

        const [identifierId] = await findIdentifierId(wallet_n.publicKey);
        let [stakePoolId]: any = [null];
        [stakePoolId] = await findStakePoolId(
          wallet_n.publicKey,
          nft.trait_type
        );
        console.log("stakePoolId : ", stakePoolId.toBase58());
        console.log("identifierId : ", identifierId.toBase58());

        const [rewardDistributorId] = await findRewardDistributorId(
          stakePoolId
        );
        console.log(stakePoolId.toBase58());

        const [stakeEntryId] = await findStakeEntryIdPda(
          stakePoolId,
          new PublicKey(nft.mint)
        );

        let stakeEntryData: any = null;
        try {
          const parsed = await stakePoolProgram.account.stakeEntry.fetch(
            stakeEntryId
          );

          console.log(parsed);

          stakeEntryData = {
            parsed,
            stakeEntryId,
          };
        } catch (error) {}

        let rewardDistributorData: any = null;
        try {
          const parsed =
            await rewardDistributorProgram.account.rewardDistributor.fetch(
              rewardDistributorId
            );

          console.log(parsed);

          rewardDistributorData = {
            parsed,
            rewardDistributorId,
          };
        } catch (error) {}

        let stakePoolData: any = null;
        try {
          const parsed = await stakePoolProgram.account.stakePool.fetch(
            stakePoolId
          );

          console.log(parsed);

          stakePoolData = {
            parsed,
            stakePoolId,
          };
        } catch (error) {}

        if (
          (!stakePoolData.parsed.cooldownSeconds ||
            stakePoolData.parsed.cooldownSeconds === 0 ||
            (stakeEntryData?.parsed.cooldownStartSeconds &&
              Date.now() / 1000 -
                stakeEntryData.parsed.cooldownStartSeconds.toNumber() >=
                stakePoolData.parsed.cooldownSeconds)) &&
          (!stakePoolData.parsed.minStakeSeconds ||
            stakePoolData.parsed.minStakeSeconds === 0 ||
            (stakeEntryData?.parsed.lastStakedAt &&
              Date.now() / 1000 -
                stakeEntryData.parsed.lastStakedAt.toNumber() >=
                stakePoolData.parsed.minStakeSeconds)) &&
          (stakeEntryData?.parsed.originalMintClaimed ||
            stakeEntryData?.parsed.stakeMintClaimed)
        ) {
          const tokenManagerId = await tokenManagerAddressFromMint(
            connection,
            new PublicKey(nft.mint)
          );

          let tokenManagerData: any = null;
          try {
            const parsed = await tokenManagerProgram.account.tokenManager.fetch(
              tokenManagerId
            );

            console.log(parsed);

            tokenManagerData = {
              parsed,
              tokenManagerId,
            };
          } catch (error) {}

          // const tokenManagerData = await tryGetAccount(() =>
          //   tokenManager.accounts.getTokenManager(connection, tokenManagerId)
          // );
          let remainingAccountsForReturn: any;
          const {
            issuer,
            mint,
            claimApprover,
            invalidationType,
            receiptMint,
            state,
            kind,
          } = tokenManagerData.parsed;
          console.log("Issuer Public Key : ", issuer.toBase58());
          console.log("claimApprover Public Key : ", claimApprover?.toBase58());
          console.log("invalidationType : ", invalidationType);
          console.log("state : ", state);
          console.log("kind : ", kind);

          if (
            invalidationType === InvalidationType.Vest &&
            state === TokenManagerState.Issued
          ) {
            if (!claimApprover) throw "Claim approver must be set";

            const associatedAddressClaimApprove =
              await splToken.Token.getAssociatedTokenAddress(
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                wallet_n.publicKey,
                true
              );
            const accountClaimApprove = await connection.getAccountInfo(
              associatedAddressClaimApprove
            );
            complete_unstake_instructions.push(
              splToken.Token.createAssociatedTokenAccountInstruction(
                splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                TOKEN_PROGRAM_ID,
                mint,
                claimApprover,
                claimApprover,
                wallet_t.publicKey
              )
            );
            console.log("one");
            remainingAccountsForReturn = [
              {
                pubkey: accountClaimApprove,
                isSigner: false,
                isWritable: true,
              },
            ];
          } else if (
            invalidationType === InvalidationType.Return ||
            state === TokenManagerState.Issued
          ) {
            if (receiptMint) {
              const receiptMintLargestAccount =
                await connection.getTokenLargestAccounts(receiptMint);

              // get holder of receipt mint
              const receiptTokenAccountId =
                receiptMintLargestAccount.value[0]?.address;
              if (!receiptTokenAccountId)
                throw new Error("No token accounts found");
              const receiptMintToken = new splToken.Token(
                connection,
                receiptMint,
                TOKEN_PROGRAM_ID,
                Keypair.generate()
              );
              const receiptTokenAccount = await receiptMintToken.getAccountInfo(
                receiptTokenAccountId
              );

              // get ATA for this mint of receipt mint holder

              const associatedAddressInitAssoc =
                await splToken.Token.getAssociatedTokenAddress(
                  splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                  splToken.TOKEN_PROGRAM_ID,
                  mint,
                  receiptTokenAccount.owner,
                  true
                );
              const accountInitAssoc = await connection.getAccountInfo(
                associatedAddressInitAssoc
              );
              console.log(
                "withFindOrInitAssociatedTokenAccount associatedAddress:",
                associatedAddressInitAssoc
              );
              console.log(
                "withFindOrInitAssociatedTokenAccount account:",
                accountInitAssoc
              );

              if (!accountInitAssoc) {
                complete_unstake_instructions.push(
                  splToken.Token.createAssociatedTokenAccountInstruction(
                    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                    splToken.TOKEN_PROGRAM_ID,
                    mint,
                    associatedAddressInitAssoc,
                    receiptTokenAccount.owner,
                    wallet_t.publicKey
                  )
                );
              }
              console.log("abcd");

              remainingAccountsForReturn = [
                {
                  pubkey: associatedAddressInitAssoc,
                  isSigner: false,
                  isWritable: true,
                },
                {
                  pubkey: receiptTokenAccountId,
                  isSigner: false,
                  isWritable: true,
                },
              ];
            } else {
              const associatedAddressIssuerToken =
                await splToken.Token.getAssociatedTokenAddress(
                  splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                  splToken.TOKEN_PROGRAM_ID,
                  mint,
                  issuer,
                  true
                );
              const accountIssuerToken = await connection.getAccountInfo(
                associatedAddressIssuerToken
              );
              console.log(
                "withFindOrInitAssociatedTokenAccount associatedAddress:",
                associatedAddressIssuerToken
              );
              console.log(
                "withFindOrInitAssociatedTokenAccount account:",
                accountIssuerToken
              );
              if (!accountIssuerToken) {
                complete_unstake_instructions.push(
                  splToken.Token.createAssociatedTokenAccountInstruction(
                    splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
                    splToken.TOKEN_PROGRAM_ID,
                    mint,
                    associatedAddressIssuerToken,
                    issuer,
                    wallet_t.publicKey
                  )
                );
              }

              console.log("efgh");
              remainingAccountsForReturn = [
                {
                  pubkey: associatedAddressIssuerToken,
                  isSigner: false,
                  isWritable: true,
                },
              ];
            }
          } else {
            console.log("empty");
            remainingAccountsForReturn = [];
          }

          const [tokenManagerIdNew] = await findTokenManagerAddress(
            new PublicKey(nft.mint)
          );
          const tokenManagerTokenAccountId = await findAta(
            new PublicKey(nft.mint),
            (
              await findTokenManagerAddress(new PublicKey(nft.mint))
            )[0],
            true
          );

          const userReceiptMintTokenAccount = await findAta(
            new PublicKey(nft.mint),
            wallet_n.publicKey,
            true
          );

          const transferAccounts = await getRemainingAccountsForKind(
            new PublicKey(nft.mint),
            tokenManagerData?.parsed.kind!
          );
          console.log(
            "transferAccounts0:",
            transferAccounts[0].pubkey.toBase58()
          );
          console.log(
            "transferAccounts1:",
            transferAccounts[1].pubkey.toBase58()
          );
          console.log(
            "remainingAccountsForReturn",
            remainingAccountsForReturn
            // remainingAccountsForReturn[0].pubkey.toBase58()
          );
          var return_receipt_mint_inst =
            stakePoolProgram.instruction.returnReceiptMint({
              accounts: {
                stakeEntry: stakeEntryId,
                receiptMint: new PublicKey(nft.mint),
                tokenManager: tokenManagerId,
                tokenManagerTokenAccount: tokenManagerTokenAccountId,
                userReceiptMintTokenAccount: userReceiptMintTokenAccount,
                user: wallet_n.publicKey,
                collector: wallet_n.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                tokenManagerProgram: TOKEN_MANAGER_ADDRESS,
                rent: SYSVAR_RENT_PUBKEY,
              },
              remainingAccounts: [
                ...(tokenManagerData?.parsed.state === TokenManagerState.Claimed
                  ? transferAccounts
                  : []),
                ...remainingAccountsForReturn,
              ],
            });
          complete_unstake_instructions.push(return_receipt_mint_inst);
        }

        const associatedAddressStakeEntry =
          await splToken.Token.getAssociatedTokenAddress(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            new PublicKey(nft.mint),
            stakeEntryId,
            true
          );
        const accountStakeEntry = await connection.getAccountInfo(
          associatedAddressStakeEntry
        );

        if (!accountStakeEntry) {
          complete_unstake_instructions.push(
            splToken.Token.createAssociatedTokenAccountInstruction(
              splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              splToken.TOKEN_PROGRAM_ID,
              new PublicKey(nft.mint),
              associatedAddressStakeEntry,
              stakeEntryId,
              wallet_t.publicKey
            )
          );
        }

        const associatedAddressUserOriginal =
          await splToken.Token.getAssociatedTokenAddress(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            new PublicKey(nft.mint),
            wallet_n.publicKey,
            true
          );
        const accountUserOriginal = await connection.getAccountInfo(
          associatedAddressUserOriginal
        );

        if (!accountUserOriginal) {
          complete_unstake_instructions.push(
            splToken.Token.createAssociatedTokenAccountInstruction(
              splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              splToken.TOKEN_PROGRAM_ID,
              new PublicKey(nft.mint),
              associatedAddressUserOriginal,
              wallet_n.publicKey,
              wallet_n.publicKey
            )
          );
        }

        const associatedAddressUnstake =
          await splToken.Token.getAssociatedTokenAddress(
            splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
            splToken.TOKEN_PROGRAM_ID,
            new PublicKey(nft.mint),
            stakeEntryId,
            true
          );
        const accountUnstake = await connection.getAccountInfo(
          associatedAddressUnstake
        );
        console.log(
          "withFindOrInitAssociatedTokenAccount associatedAddress:",
          associatedAddressUnstake
        );
        console.log(
          "withFindOrInitAssociatedTokenAccount account:",
          accountUnstake
        );
        if (!accountUnstake) {
          complete_unstake_instructions.push(
            splToken.Token.createAssociatedTokenAccountInstruction(
              splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
              splToken.TOKEN_PROGRAM_ID,
              stakeEntryData?.parsed.stakeMint,
              associatedAddressUnstake,
              stakeEntryId,
              wallet_n.publicKey
            )
          );
        }

        let unstake_instruction = stakePoolProgram.instruction.unstake({
          accounts: {
            stakePool: stakePoolId,
            stakeEntry: stakeEntryId,
            originalMint: nft.mint,
            stakeEntryOriginalMintTokenAccount: associatedAddressStakeEntry,
            user: wallet_n.publicKey,
            userOriginalMintTokenAccount: associatedAddressUserOriginal,
            tokenProgram: TOKEN_PROGRAM_ID,
          },
          // remainingAccounts: remainingAccounts,
        });
        complete_unstake_instructions.push(unstake_instruction);

        if (rewardDistributorData) {
          const [rewardEntryId] = await findRewardEntryId(
            rewardDistributorData.rewardDistributorId,
            stakeEntryId
          );
          const rewardMintTokenAccountId = await findAta(
            REWARD_MINT_GLTCH,
            wallet_n.publicKey,
            true
          );
          console.log(
            "rewardMintTokenAccountId : ",
            rewardMintTokenAccountId.toBase58()
          );

          const rewardDistributorRewardMintTokenAccountId = await findAta(
            REWARD_MINT_GLTCH,
            rewardDistributorId,
            // wallet_n.publicKey,
            true
          );

          const userRewardMintTokenAccountId = await findAta(
            rewardDistributorData.parsed.rewardMint,
            wallet_n.publicKey,
            true
          );

          const remainingAccountsForKind: any = [
            {
              pubkey: rewardDistributorRewardMintTokenAccountId,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: userRewardMintTokenAccountId,
              isSigner: false,
              isWritable: true,
            },
          ];

          let claim_reward_inst =
            rewardDistributorProgram.instruction.claimRewards({
              accounts: {
                rewardEntry: rewardEntryId,
                rewardDistributor: rewardDistributorId,
                stakeEntry: stakeEntryId,
                stakePool: stakePoolId,
                rewardMint: REWARD_MINT_GLTCH,
                userRewardMintTokenAccount: rewardMintTokenAccountId,
                rewardManager: REWARD_MANAGER,
                user: wallet_n.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              },
              remainingAccounts: [...remainingAccountsForKind],
            });
          complete_unstake_instructions.push(claim_reward_inst);
        }
        for (let ki = 0; ki < complete_unstake_instructions.length; ki++) {
          transaction.add(complete_unstake_instructions[ki]);
        }
        unsignedTxns.push(transaction);
      }
    }
    // let unsignedTxns: any = [];
    let signersSet: any = [];
    let complete_unstake_signature;
    try {
      complete_unstake_signature = await executeAllTransactions(
        connection,
        wallet_n,
        unsignedTxns,
        {
          notificationConfig: {
            message: `Successfully staked`,
            description: "Stake progress will now dynamically update",
          },
        }
      );
    } catch (e) {
      complete_unstake_signature = null;
    }
    // const complete_unstake_signature = await sendTransactions(
    //   connection,
    //   wallet,
    //   [complete_unstake_instructions],
    //   [[]]
    // );
    console.log("Start Pool Signature : ", complete_unstake_signature);

    if (complete_unstake_signature != null) {
      // var data = JSON.stringify({
      //   owner: wallet.publicKey?.toBase58(),
      //   mint: nft.mint,
      // });
      // var xhr = new XMLHttpRequest();
      // xhr.addEventListener("readystatechange", function () {
      //   if (this.readyState === 4) {
      //     console.log(this.responseText);
      //     getNFTs(1);
      //   }
      // });
      // xhr.open("POST", "http://34.198.111.186:8000/unStakeNft");
      // xhr.setRequestHeader("Content-Type", "application/json");
      // xhr.send(data);
    }
  };

  const claimRewardsFn = async (nft: any) => {
    const transaction = new Transaction();
    let wallet_t: any = wallet;
    const provider = new AnchorProvider(connection, wallet_t, {});
    const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
      STAKE_POOL_TYPES.IDL,
      STAKE_POOL_ADDRESS,
      provider
    );
    const rewardDistributorProgram =
      new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
        REWARD_DISTRIBUTOR_TYPES.IDL,
        REWARD_DISTRIBUTOR_ADDRESS,
        provider
      );
    let claim_rewards_instructions: any = [];
    const [identifierId] = await findIdentifierId(wallet_t.publicKey);
    let [stakePoolId]: any = [null];
    [stakePoolId] = await findStakePoolId(wallet_t.publicKey, nft.trait_type);
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());
    const [stakeEntryId] = await findStakeEntryIdPda(
      stakePoolId,
      new PublicKey(nft.mint)
    );
    const [originalMintMetadataId] = await Promise.all([
      metaplex125.Metadata.getPDA(nft.mint),
    ]);

    let update_total_seconds_instruction =
      stakePoolProgram.instruction.updateTotalStakeSeconds({
        accounts: {
          stakeEntry: stakeEntryId,
          lastStaker: wallet_t.publicKey,
        },
      });
    claim_rewards_instructions.push(update_total_seconds_instruction);

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    let rewardDistributorData: any = null;
    try {
      const parsed =
        await rewardDistributorProgram.account.rewardDistributor.fetch(
          rewardDistributorId
        );

      console.log(parsed);

      rewardDistributorData = {
        parsed,
        rewardDistributorId,
      };
    } catch (error) {}

    if (rewardDistributorData) {
      const rewardMintTokenAccountId = await findAta(
        rewardDistributorData.parsed.rewardMint,
        wallet_t.publicKey,
        true
      );

      // const rewardDistributorRewardMintTokenAccountId = new PublicKey(
      //   "FNYBie5kK9mjfbZ5FJGmTbyyMHwVaGcTQA2Q1tVEkx7J"
      // );

      const rewardDistributorRewardMintTokenAccountId = await findAta(
        REWARD_MINT_GLTCH,
        rewardDistributorId,
        // wallet_n.publicKey,
        true
      );

      const userRewardMintTokenAccountId = await findAta(
        rewardDistributorData.parsed.rewardMint,
        wallet_n.publicKey,
        true
      );

      console.log(
        "rewardMintTokenAccountId : ",
        userRewardMintTokenAccountId.toBase58()
      );

      const remainingAccountsForKind: any = [
        {
          pubkey: rewardDistributorRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
        {
          pubkey: userRewardMintTokenAccountId,
          isSigner: false,
          isWritable: true,
        },
      ];

      // const remainingAccountsForKind = await withRemainingAccountsForKind(
      //   transaction,
      //   connection,
      //   wallet_n,
      //   rewardDistributorId,
      //   rewardDistributorData.parsed.kind,
      //   rewardDistributorData.parsed.rewardMint,
      //   true
      // );

      const [rewardEntryId] = await findRewardEntryId(
        rewardDistributorData.rewardDistributorId,
        stakeEntryId
      );
      // const rewardEntryData = await tryGetAccount(() =>
      //   getRewardEntry(connection, rewardEntryId)
      // );

      let rewardEntryData: any = null;
      try {
        const parsed = await rewardDistributorProgram.account.rewardEntry.fetch(
          rewardEntryId
        );

        console.log(parsed);

        rewardEntryData = {
          parsed,
          rewardDistributorId,
        };
      } catch (error) {}

      if (!rewardEntryData) {
        let init_reward_entry_instruction =
          rewardDistributorProgram.instruction.initRewardEntry({
            accounts: {
              rewardEntry: rewardEntryId,
              stakeEntry: stakeEntryId,
              rewardDistributor: rewardDistributorData.rewardDistributorId,
              payer: wallet_n.publicKey,
              systemProgram: SystemProgram.programId,
            },
          });
        claim_rewards_instructions.push(init_reward_entry_instruction);
      }

      let claim_reward_inst = rewardDistributorProgram.instruction.claimRewards(
        {
          accounts: {
            rewardEntry: rewardEntryId,
            rewardDistributor: rewardDistributorId,
            stakeEntry: stakeEntryId,
            stakePool: stakePoolId,
            rewardMint: REWARD_MINT_GLTCH,
            userRewardMintTokenAccount: rewardMintTokenAccountId,
            rewardManager: REWARD_MANAGER,
            user: wallet_n.publicKey,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          },
          remainingAccounts: [...remainingAccountsForKind],
        }
      );
      claim_rewards_instructions.push(claim_reward_inst);

      const claim_reward_signature = await sendTransactions(
        connection,
        wallet,
        [claim_rewards_instructions],
        [[]]
      );
      console.log("Start Pool Signature : ", claim_reward_signature);
    }
  };

  const claimAllRewardsFn = async () => {
    let unsignedTxns: any = [];
    if (stakedNfts && stakedNfts.length > 0) {
      for (let index = 0; index < stakedNfts.length; index++) {
        let transaction: Transaction = new Transaction();
        let claim_rewards_instructions: any = [];
        const nft = stakedNfts[index];
        let wallet_t: any = wallet;
        const provider = new AnchorProvider(connection, wallet_t, {});
        const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
          STAKE_POOL_TYPES.IDL,
          STAKE_POOL_ADDRESS,
          provider
        );
        const rewardDistributorProgram =
          new Program<REWARD_DISTRIBUTOR_TYPES.aplRewardDistributor>(
            REWARD_DISTRIBUTOR_TYPES.IDL,
            REWARD_DISTRIBUTOR_ADDRESS,
            provider
          );
        const [identifierId] = await findIdentifierId(wallet_t.publicKey);
        let [stakePoolId]: any = [null];
        [stakePoolId] = await findStakePoolId(
          wallet_t.publicKey,
          nft.trait_type
        );
        console.log("stakePoolId : ", stakePoolId.toBase58());
        console.log("identifierId : ", identifierId.toBase58());
        const [stakeEntryId] = await findStakeEntryIdPda(
          stakePoolId,
          new PublicKey(nft.mint)
        );
        const [originalMintMetadataId] = await Promise.all([
          metaplex125.Metadata.getPDA(nft.mint),
        ]);

        let stakeEntryData: any = null;
        try {
          const parsed = await stakePoolProgram.account.stakeEntry.fetch(
            stakeEntryId
          );

          console.log(
            "stakeEntryData Last Staker : ",
            parsed.lastStaker.toBase58()
          );

          stakeEntryData = {
            parsed,
            stakeEntryId,
          };
        } catch (error) {}

        let update_total_seconds_instruction =
          stakePoolProgram.instruction.updateTotalStakeSeconds({
            accounts: {
              stakeEntry: stakeEntryId,
              lastStaker: wallet_t.publicKey,
            },
          });
        claim_rewards_instructions.push(update_total_seconds_instruction);

        const [rewardDistributorId] = await findRewardDistributorId(
          stakePoolId
        );
        let rewardDistributorData: any = null;
        try {
          const parsed =
            await rewardDistributorProgram.account.rewardDistributor.fetch(
              rewardDistributorId
            );

          console.log(
            "Reward Distributor Authority : ",
            parsed.authority.toBase58()
          );

          console.log(PublicKey.default.toBase58());

          rewardDistributorData = {
            parsed,
            rewardDistributorId,
          };
        } catch (error) {}

        if (rewardDistributorData) {
          const rewardMintTokenAccountId = await findAta(
            rewardDistributorData.parsed.rewardMint,
            wallet_t.publicKey,
            true
          );

          // const rewardDistributorRewardMintTokenAccountId = new PublicKey(
          //   "FNYBie5kK9mjfbZ5FJGmTbyyMHwVaGcTQA2Q1tVEkx7J"
          // );

          const rewardDistributorRewardMintTokenAccountId = await findAta(
            REWARD_MINT_GLTCH,
            rewardDistributorId,
            // wallet_n.publicKey,
            true
          );

          const userRewardMintTokenAccountId = await findAta(
            rewardDistributorData.parsed.rewardMint,
            wallet_n.publicKey,
            true
          );

          console.log(
            "rewardMintTokenAccountId : ",
            userRewardMintTokenAccountId.toBase58()
          );

          const remainingAccountsForKind: any = [
            {
              pubkey: rewardDistributorRewardMintTokenAccountId,
              isSigner: false,
              isWritable: true,
            },
            {
              pubkey: userRewardMintTokenAccountId,
              isSigner: false,
              isWritable: true,
            },
          ];

          const [rewardEntryId] = await findRewardEntryId(
            rewardDistributorData.rewardDistributorId,
            stakeEntryId
          );

          let rewardEntryData: any = null;
          try {
            const parsed =
              await rewardDistributorProgram.account.rewardEntry.fetch(
                rewardEntryId
              );

            console.log(parsed);

            rewardEntryData = {
              parsed,
              rewardDistributorId,
            };
          } catch (error) {}

          if (!rewardEntryData) {
            let init_reward_entry_instruction =
              rewardDistributorProgram.instruction.initRewardEntry({
                accounts: {
                  rewardEntry: rewardEntryId,
                  stakeEntry: stakeEntryId,
                  rewardDistributor: rewardDistributorData.rewardDistributorId,
                  payer: wallet_n.publicKey,
                  systemProgram: SystemProgram.programId,
                },
              });
            claim_rewards_instructions.push(init_reward_entry_instruction);
          }

          let claim_reward_inst =
            rewardDistributorProgram.instruction.claimRewards({
              accounts: {
                rewardEntry: rewardEntryId,
                rewardDistributor: rewardDistributorId,
                stakeEntry: stakeEntryId,
                stakePool: stakePoolId,
                rewardMint: REWARD_MINT_GLTCH,
                userRewardMintTokenAccount: rewardMintTokenAccountId,
                rewardManager: REWARD_MANAGER,
                user: wallet_n.publicKey,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
              },
              remainingAccounts: [...remainingAccountsForKind],
            });
          claim_rewards_instructions.push(claim_reward_inst);
        }
        for (let ki = 0; ki < claim_rewards_instructions.length; ki++) {
          transaction.add(claim_rewards_instructions[ki]);
        }
        unsignedTxns.push(transaction);
      }
    }
    let signersSet: any = [];
    let claim_reward_signature;
    try {
      claim_reward_signature = await executeAllTransactions(
        connection,
        wallet_n,
        unsignedTxns,
        {
          notificationConfig: {
            message: `Successfully staked`,
            description: "Stake progress will now dynamically update",
          },
        }
      );
    } catch (e) {
      claim_reward_signature = null;
    }
    // const claim_reward_signature = await sendTransactions(
    //   connection,
    //   wallet,
    //   [claim_rewards_instructions],
    //   [[]]
    // );
    console.log("Start Pool Signature : ", claim_reward_signature);
  };

  const refreshRewardsFn = async () => {
    console.log("refresh rewards here");
  };

  const changeNFTsTab = async (id: any) => {
    console.log(id);
    setNftsTab(id);
  };

  return (
    <div
      id="main-mobile"
      className={logoLoading ? "main-bg-raffles black-bg" : "main-bg-raffles"}
    >
      {logoLoading && (
        <div className="logo-loader-parent">
          <img alt="Alpha-logo" src={LogoWhite} className="pulse-animation" />
        </div>
      )}
      {!logoLoading && wallet && wallet.connected && (
        <div className="raffle-parent">
          <div className="Backdrop-other">
            <div className="fixed-staking-main-bg">
              <div className="pull-left full-width">
                <div className="stake-logo-parent">
                  {!isMobile && (
                    <a href="/">
                      <img
                        src={LogoWhite}
                        className="stake-logo pointer"
                        alt=""
                      />
                    </a>
                  )}
                  {!isMobile && (
                    <a href="/">
                      <img
                        src={CloseAlpha}
                        className="stake-close-logo"
                        alt=""
                      />
                    </a>
                  )}
                  <div
                    className="user-profile-box"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <img src={User} className="user-profile-img" alt="" />
                  </div>
                  {showUserMenu && (
                    <div className="user-menu-parent">
                      <ul>
                        <li>
                          Claimed Tokens : {stakedBal}{" "}
                          <img
                            src={Refresh}
                            onClick={refreshRewardsFn}
                            className="refresh-farmer-icon"
                            alt=""
                          />
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <div className="stake-progress">
                  <ProgressBar bgcolor={"#6a1b9a"} completed={63} />
                </div>
                {!isMobile && (
                  <div className="staking-process-parent">
                    <div className="unstaked-nfts-div">
                      <div className="staking-nft-display">
                        <div className="nft-parent-div">
                          {nfts &&
                            nfts.length > 0 &&
                            nfts.map(function (item: any, i: any) {
                              return (
                                <div
                                  className="nft-div"
                                  key={i}
                                  style={{
                                    boxShadow:
                                      stakedNft == item
                                        ? "1px 1px 5px 1px #00f5ffab"
                                        : "none",
                                  }}
                                  onClick={() => setStakedNft(item)}
                                >
                                  <img src={item.link} />
                                  {/* <label>{item.name}</label> */}
                                  {/* <label>{item.trait_type}</label> */}
                                </div>
                              );
                            })}
                        </div>
                        {
                          <div className="stake-button-div">
                            {stakedNft && (
                              <button
                                className="nft-select-button"
                                onClick={() => completeStakeFn()}
                              >
                                Stake Now
                              </button>
                            )}
                            {nfts && nfts.length > 0 && (
                              <button
                                className="nft-select-button"
                                onClick={() => completeAllNftsStakeFn()}
                              >
                                Stake All
                              </button>
                            )}
                          </div>
                        }
                      </div>
                    </div>
                    <div className="staked-nfts-div">
                      <div className="staking-nft-display">
                        <div className="nft-parent-div">
                          {stakedNfts &&
                            stakedNfts.length > 0 &&
                            stakedNfts.map(function (item: any, i: any) {
                              return (
                                <div className="nft-div" key={i}>
                                  <img src={item.link} />
                                  <div className="pull-left full-width text-center">
                                    <button
                                      className="unstake-nft-btn"
                                      onClick={() => completeUnstakeFn(item)}
                                    >
                                      Unstake Now
                                    </button>
                                  </div>
                                  <div className="pull-left full-width text-center">
                                    <button
                                      className="unstake-nft-btn"
                                      onClick={() => claimRewardsFn(item)}
                                    >
                                      Claim Tokens
                                    </button>
                                  </div>
                                  {/* <label>{item.name}</label> */}
                                  {/* <label>{item.trait_type}</label> */}
                                </div>
                              );
                            })}
                        </div>
                        {stakedNfts && stakedNfts.length > 0 && (
                          <div className="stake-button-div">
                            <button
                              className="nft-select-button"
                              onClick={claimAllRewardsFn}
                            >
                              Claim All Rewards
                            </button>
                            <button
                              className="nft-select-button"
                              onClick={completeAllUnstakeFn}
                            >
                              Unstake ALL
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {isMobile && (
                  <div className="staking-process-parent">
                    <div className="nfts-tab-parent" aria-label="NFTs Tabs">
                      <label
                        className={
                          nftsTab == 0
                            ? "selected-nfts-tab nfts-tab b-r-left"
                            : "nfts-tab b-r-left"
                        }
                        id="simple-tab-0"
                        aria-controls="simple-tabpanel-0"
                        onClick={() => changeNFTsTab(0)}
                      >
                        Unstaked NFTs
                      </label>
                      <label
                        className={
                          nftsTab == 1
                            ? "selected-nfts-tab nfts-tab b-r-right"
                            : "nfts-tab b-r-right"
                        }
                        id="simple-tab-1"
                        aria-controls="simple-tabpanel-1"
                        onClick={() => changeNFTsTab(1)}
                      >
                        Staked NFTs
                      </label>
                    </div>
                    <div
                      role="tabpanel"
                      hidden={nftsTab !== 0}
                      id="simple-tabpanel-0"
                      aria-labelledby="simple-tab-0"
                    >
                      {nftsTab === 0 && (
                        <div className="unstaked-nfts-div">
                          <div className="staking-nft-display">
                            <div className="nft-parent-div">
                              {nfts &&
                                nfts.length > 0 &&
                                nfts.map(function (item: any, i: any) {
                                  return (
                                    <div
                                      className="nft-div"
                                      key={i}
                                      style={{
                                        borderColor:
                                          stakedNft == item
                                            ? "white"
                                            : "transparent",
                                      }}
                                      onClick={() => setStakedNft(item)}
                                    >
                                      <img src={item.link} />
                                      {/* <label>{item.name}</label> */}
                                      {/* <label>{item.trait_type}</label> */}
                                    </div>
                                  );
                                })}
                            </div>
                            {stakedNft && (
                              <div className="stake-button-div">
                                <button
                                  className="nft-select-button"
                                  onClick={() => completeStakeFn()}
                                >
                                  Stake Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      role="tabpanel"
                      hidden={nftsTab !== 1}
                      id="simple-tabpanel-0"
                      aria-labelledby="simple-tab-0"
                    >
                      {nftsTab === 1 && (
                        <div className="staked-nfts-div">
                          <div className="staking-nft-display">
                            <div className="nft-parent-div">
                              {stakedNfts &&
                                stakedNfts.length > 0 &&
                                stakedNfts.map(function (item: any, i: any) {
                                  return (
                                    <div
                                      className="nft-div"
                                      key={i}
                                      style={{
                                        borderColor:
                                          unstakedNft == item
                                            ? "white"
                                            : "transparent",
                                      }}
                                      onClick={() => setUnstakedNft(item)}
                                    >
                                      <img src={item.link} />
                                      {/* <label>{item.name}</label> */}
                                      {/* <label>{item.trait_type}</label> */}
                                    </div>
                                  );
                                })}
                            </div>
                            {unstakedNft && (
                              <div className="stake-button-div">
                                <button
                                  className="nft-select-button"
                                  onClick={completeUnstakeFn}
                                >
                                  Unstake Now
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {!logoLoading && !wallet.connected && (
        <WalletDialogButton
          className="Connect-Wallet-btn"
          onClick={() => onRaffleNFTAfterOpen()}
        >
          Connect Wallet
        </WalletDialogButton>
      )}
    </div>
  );
};

export default FixedStaking;
