import { useEffect, useMemo, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  Signer,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "solanaSPLToken036";
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
  TokenManagerKind,
  TokenManagerState,
  TOKEN_MANAGER_ADDRESS,
  withRemainingAccountsForReturn,
} from "cardinalTokenManager179/dist/cjs/programs/tokenManager";
import { SYSVAR_RENT_PUBKEY } from "../../config/config";
import { withRemainingAccountsForUnstake } from "../../programs/apl-staking/programs/stakePool/utils";
import { getStakePool } from "../../programs/apl-staking/programs/stakePool/accounts";

const FixedStaking = (props: any) => {
  console.log(props);
  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl("devnet")
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
  const [stakedNfts, setStakedNfts] = useState<any>([]);
  const [nftsTab, setNftsTab] = useState(0);

  const wallet = useWallet();

  const stakePoolId = useStakePoolId();
  const stakedTokenDatas = useStakedTokenDatas();
  const { data: stakePool } = useStakePoolData();
  const rewardDistributorData = useRewardDistributorData();

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

  const findStakePoolId = (identifier: BN) => {
    return PublicKey.findProgramAddress(
      [
        anchor.utils.bytes.utf8.encode(STAKE_POOL_SEED),
        identifier.toArrayLike(Buffer, "le", 8),
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

  const getNFTs = async () => {
    if (wallet && wallet.connected && !gotNfts) {
      const connection = new Connection(clusterApiUrl("devnet"));
      const metaplex = Metaplex.make(connection);
      const allNfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: wallet?.publicKey! })
        .run();
      let temp_nfts: any = [];
      for (let index = 0; index < allNfts.length; index++) {
        const nft: any = allNfts[index];
        var creators = nft.creators;
        var is_ours = false;
        if (
          nft.updateAuthorityAddress.toBase58() ==
          UPDATE_AUTHORITY_OF_TOKEN_STRING
        ) {
          is_ours = true;
          for (let iindex = 0; iindex < creators.length; iindex++) {
            const element = creators[iindex];
            if (element.share == 0) {
            }
          }
        }
        if (is_ours) {
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
                trait_type = "Human Pet";
              } else if (is_human && !is_pet) {
                trait_type = "Human";
              } else if (is_cyborg && is_pet) {
                trait_type = "Cyborg Pet";
              } else if (is_cyborg && !is_pet) {
                trait_type = "Cyborg";
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

  const createGltchATA = async () => {
    let wallet_t: any = wallet;
    const provider = new AnchorProvider(connection, wallet_t, {});
    const [identifierId] = await findIdentifierId(wallet_t.publicKey);
    console.log(`identifierId: ${identifierId}`);
    let [stakePoolId]: any = [null];
    const stakePoolProgram = new Program<STAKE_POOL_TYPES.aplStakePool>(
      STAKE_POOL_TYPES.IDL,
      STAKE_POOL_ADDRESS,
      provider
    );
    const parsed: any = await stakePoolProgram.account.identifier.fetch(
      identifierId
    );
    console.log(parsed);
    const identifier = parsed?.count.toNumber();
    [stakePoolId] = await findStakePoolId(new BN(identifier));
    console.log(`stakePoolId: ${stakePoolId}`);
    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    console.log(`rewardDistributorId: ${rewardDistributorId}`);
    const associatedAddress = await splToken.Token.getAssociatedTokenAddress(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      REWARD_MINT_GLTCH,
      rewardDistributorId,
      true
    );
    console.log(`associatedAddress: ${associatedAddress}`);
    var inst = splToken.Token.createAssociatedTokenAccountInstruction(
      splToken.ASSOCIATED_TOKEN_PROGRAM_ID,
      splToken.TOKEN_PROGRAM_ID,
      REWARD_MINT_GLTCH,
      associatedAddress,
      rewardDistributorId,
      wallet_t.publicKey
    );
    console.log(`inst: ${inst}`);
    const gltch_ata = await sendTransactions(
      connection,
      wallet_t,
      [[inst]],
      // [anchor.utils.bytes.utf8.encode(REWARD_DISTRIBUTOR_SEED), stakePoolId.toBytes()]
      []
    );
    console.log("Reward Distributor ATA Signature : ", gltch_ata);
  };

  const createStakePool = async (str: any) => {
    console.log(str);
    const transaction = new Transaction();
    let wallet_t: any = wallet;
    let params: any = {
      overlayText: "",
      imageUri:
        "https://dgnvzn3x5fqusqpvst65sizekrfhwtklzokfk7usi64h7erzb7iq.arweave.net/GZtct3fpYUlB9ZT92SMkVEp7TUvLlFV-kke4f5I5D9E?ext=jpg",
      requiresCollections: [],
      requiresCreators: [],
      requiresAuthorization: false,
      authority: wallet_t.publicKey,
      resetOnStake: false,
      cooldownSeconds: null,
      minStakeSeconds: null,
      endDate: null,
      rewardAmount: new BN(50000000),
      rewardDurationSeconds: new BN(5),
      supply: new BN(50000000),
      kind: RewardDistributorKind.Treasury,
    };
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
    let start_pool_instructions: any = [];
    const [identifierId] = await findIdentifierId(wallet_t.publicKey);
    let [stakePoolId]: any = [null];
    try {
      const parsed: any = await stakePoolProgram.account.identifier.fetch(
        identifierId
      );
      console.log(parsed);
      const identifier = parsed?.count.toNumber();
      if (identifier == 0) {
        let identifier_instructions =
          stakePoolProgram.instruction.initIdentifier({
            accounts: {
              identifier: identifierId,
              payer: wallet_t.publicKey,
              systemProgram: SystemProgram.programId,
            },
          });
        start_pool_instructions.push(identifier_instructions);
      }
      [stakePoolId] = await findStakePoolId(new BN(identifier));
    } catch (error) {
      const identifier = new anchor.BN(0);
      let identifier_instructions = stakePoolProgram.instruction.initIdentifier(
        {
          accounts: {
            identifier: identifierId,
            payer: wallet_t.publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );
      [stakePoolId] = await findStakePoolId(identifier);
      start_pool_instructions.push(identifier_instructions);
    }
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());
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
        endDate: params.endDate ?? null,
      },
      {
        accounts: {
          stakePool: stakePoolId,
          identifier: identifierId,
          payer: wallet_t.publicKey,
          systemProgram: SystemProgram.programId,
        },
      }
    );
    start_pool_instructions.push(init_pool_instruction);

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
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
    let init_reward_distributor =
      rewardDistributorProgram.instruction.initRewardDistributor(
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
          remainingAccounts: remainingAccountsForKind,
        }
      );
    start_pool_instructions.push(init_reward_distributor);

    const start_pool_signature = await sendTransactions(
      connection,
      wallet,
      [start_pool_instructions],
      [[]]
    );
    console.log("Start Pool Signature : ", start_pool_signature);
  };

  const initializeRewardEntry = async () => {
    var selected_nft: any = nfts[0];
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
    let init_reward_entry_instructions: any = [];
    const [identifierId] = await findIdentifierId(wallet_t.publicKey);
    let [stakePoolId]: any = [null];
    try {
      const parsed: any = await stakePoolProgram.account.identifier.fetch(
        identifierId
      );
      console.log(parsed);
      const identifier = parsed?.count;
      if (!identifier) {
        let identifier_instructions =
          stakePoolProgram.instruction.initIdentifier({
            accounts: {
              identifier: identifierId,
              payer: wallet_t.publicKey,
              systemProgram: SystemProgram.programId,
            },
          });
        init_reward_entry_instructions.push(identifier_instructions);
      }
      [stakePoolId] = await findStakePoolId(identifier);
    } catch (error) {
      const identifier = new anchor.BN(1);
      let identifier_instructions = stakePoolProgram.instruction.initIdentifier(
        {
          accounts: {
            identifier: identifierId,
            payer: wallet_t.publicKey,
            systemProgram: SystemProgram.programId,
          },
        }
      );
      [stakePoolId] = await findStakePoolId(identifier);
      init_reward_entry_instructions.push(identifier_instructions);
    }
    const remainingAccounts = await remainingAccountsForInitStakeEntry(
      stakePoolId,
      selected_nft.mint
    );
    const [[stakeEntryId], originalMintMetadataId] = await Promise.all([
      findStakeEntryIdFromMint(
        connection,
        wallet_t.publicKey,
        stakePoolId,
        selected_nft.mint,
        true
      ),
      metaplex125.Metadata.getPDA(selected_nft.mint),
    ]);

    const stakeEntryData = await tryGetAccount(() =>
      getStakeEntry(connection, stakeEntryId)
    );

    let init_entry_instruction = stakePoolProgram.instruction.initEntry(
      wallet_t.publicKey,
      {
        accounts: {
          stakeEntry: stakeEntryId,
          stakePool: stakePoolId,
          originalMint: selected_nft.mint,
          originalMintMetadata: originalMintMetadataId,
          payer: wallet_t.publicKey,
          systemProgram: SystemProgram.programId,
        },
        remainingAccounts,
      }
    );
    if (!stakeEntryData) {
      init_reward_entry_instructions.push(init_entry_instruction);
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
    init_reward_entry_instructions.push(init_reward_entry_instruction);

    const init_reward_signature = await sendTransactions(
      connection,
      wallet,
      [init_reward_entry_instructions],
      [[]]
    );
    console.log("Init Reward Signature : ", init_reward_signature);
  };

  const wallet_n = asWallet(useWallet());

  const completeStakeFn = async () => {
    const transaction = new Transaction();
    let nft = nfts[0];
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
    try {
      const parsed: any = await stakePoolProgram.account.identifier.fetch(
        identifierId
      );
      console.log(parsed);
      const identifier = parsed?.count.toNumber();
      [stakePoolId] = await findStakePoolId(new BN(identifier));
    } catch (error) {
      const identifier = new anchor.BN(0);
      [stakePoolId] = await findStakePoolId(identifier);
    }
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());

    const [[stakeEntryId], originalMintMetadataId] = await Promise.all([
      findStakeEntryIdFromMint(
        connection,
        wallet_t.publicKey,
        stakePoolId,
        rewardNft.mint,
        true
      ),
      metaplex125.Metadata.getPDA(rewardNft.mint),
    ]);

    const stakeEntryData = await tryGetAccount(() =>
      getStakeEntry(connection, stakeEntryId)
    );

    const remainingAccounts = await remainingAccountsForInitStakeEntry(
      stakePoolId,
      stakedNft.mint
    );

    let init_entry_instruction = stakePoolProgram.instruction.initEntry(
      wallet_t.publicKey,
      {
        accounts: {
          stakeEntry: stakeEntryId,
          stakePool: stakePoolId,
          originalMint: stakedNft.mint,
          originalMintMetadata: originalMintMetadataId,
          payer: wallet_t.publicKey,
          systemProgram: SystemProgram.programId,
        },
        remainingAccounts,
      }
    );
    if (!stakeEntryData) {
      complete_stake_instructions.push(init_entry_instruction);
    }

    const stakeEntryOriginalMintTokenAccountId =
      await withFindOrInitAssociatedTokenAccount(
        transaction,
        connection,
        stakedNft.mint,
        stakeEntryId,
        wallet_n.publicKey,
        true
      );
    let userOriginalMintTokenAccountId = await findAta(
      stakedNft.mint,
      wallet_n.publicKey,
      true
    );
    let stake_instruction = stakePoolProgram.instruction.stake(new BN(1), {
      accounts: {
        stakeEntry: stakeEntryId,
        stakePool: stakePoolId,
        stakeEntryOriginalMintTokenAccount:
          stakeEntryOriginalMintTokenAccountId,
        originalMint: stakedNft.mint,
        user: wallet_n.publicKey,
        userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
    complete_stake_instructions.push(init_entry_instruction);

    if (
      !stakeEntryData?.parsed ||
      stakeEntryData.parsed.amount.toNumber() === 0
    ) {
      const tokenManagerReceiptMintTokenAccountId =
        await withFindOrInitAssociatedTokenAccount(
          transaction,
          connection,
          stakedNft.mint,
          (
            await findTokenManagerAddress(stakedNft.mint)
          )[0],
          wallet_n.publicKey,
          true
        );

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
            tokenManagerReceiptMintTokenAccount:
              tokenManagerReceiptMintTokenAccountId,
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
  };

  const completeUnstakeFn = async () => {
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
    let complete_unstake_instructions: any = [];
    const [identifierId] = await findIdentifierId(wallet_t.publicKey);
    let [stakePoolId]: any = [null];
    try {
      const parsed: any = await stakePoolProgram.account.identifier.fetch(
        identifierId
      );
      console.log(parsed);
      const identifier = parsed?.count.toNumber();
      [stakePoolId] = await findStakePoolId(new BN(identifier));
    } catch (error) {
      const identifier = new anchor.BN(0);
      [stakePoolId] = await findStakePoolId(identifier);
    }
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());

    const [[stakeEntryId], [rewardDistributorId]] = await Promise.all([
      findStakeEntryIdFromMint(
        connection,
        wallet_n.publicKey,
        stakePoolId,
        unstakedNft.mint
      ),
      await findRewardDistributorId(stakePoolId),
    ]);

    const [stakeEntryData, rewardDistributorData] = await Promise.all([
      tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
      tryGetAccount(() =>
        getRewardDistributor(connection, rewardDistributorId)
      ),
    ]);

    const stakePoolData = await getStakePool(connection, stakePoolId);

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
        unstakedNft.mint
      );
      const tokenManagerData = await tryGetAccount(() =>
        tokenManager.accounts.getTokenManager(connection, tokenManagerId)
      );
      const remainingAccountsForReturn = await withRemainingAccountsForReturn(
        transaction,
        connection,
        wallet_n,
        tokenManagerData!
      );
      const [tokenManagerIdNew] = await findTokenManagerAddress(
        unstakedNft.mint
      );
      const tokenManagerTokenAccountId = await findAta(
        unstakedNft.mint,
        (
          await findTokenManagerAddress(unstakedNft.mint)
        )[0],
        true
      );

      const userReceiptMintTokenAccount = await findAta(
        unstakedNft.mint,
        wallet_n.publicKey,
        true
      );

      const transferAccounts = await getRemainingAccountsForKind(
        unstakedNft.mint,
        tokenManagerData?.parsed.kind!
      );

      var return_receipt_mint_inst =
        stakePoolProgram.instruction.returnReceiptMint({
          accounts: {
            stakeEntry: stakeEntryId,
            receiptMint: unstakedNft.mint,
            tokenManager: tokenManagerId,
            tokenManagerTokenAccount: tokenManagerTokenAccountId,
            userReceiptMintTokenAccount: userReceiptMintTokenAccount,
            user: wallet_n.publicKey,
            collector: CRANK_KEY,
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

    const stakeEntryOriginalMintTokenAccountId =
      await withFindOrInitAssociatedTokenAccount(
        transaction,
        connection,
        unstakedNft.mint,
        stakeEntryId,
        wallet_n.publicKey,
        true
      );

    const userOriginalMintTokenAccountId =
      await withFindOrInitAssociatedTokenAccount(
        transaction,
        connection,
        unstakedNft.mint,
        wallet_n.publicKey,
        wallet_n.publicKey
      );

    const remainingAccounts = await withRemainingAccountsForUnstake(
      transaction,
      connection,
      wallet_n,
      stakeEntryId,
      stakeEntryData?.parsed.stakeMint
    );

    let unstake_instruction = stakePoolProgram.instruction.unstake({
      accounts: {
        stakePool: stakePoolId,
        stakeEntry: stakeEntryId,
        originalMint: unstakedNft.mint,
        stakeEntryOriginalMintTokenAccount:
          stakeEntryOriginalMintTokenAccountId,
        user: wallet_n.publicKey,
        userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      remainingAccounts: remainingAccounts,
    });
    complete_unstake_instructions.push(unstake_instruction);

    if (rewardDistributorData) {
      const [rewardEntryId] = await findRewardEntryId(
        rewardDistributorData.pubkey,
        stakeEntryId
      );
      const rewardMintTokenAccountId = await findAta(
        rewardDistributorData.parsed.rewardMint,
        wallet_n.publicKey,
        true
      );
      const remainingAccountsForKind = await withRemainingAccountsForKind(
        transaction,
        connection,
        wallet_n,
        rewardDistributorId,
        rewardDistributorData.parsed.kind,
        rewardDistributorData.parsed.rewardMint,
        true
      );
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
  };

  const claimRewardsFn = async () => {
    const transaction = new Transaction();
    let nft = nfts[0];
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
    try {
      const parsed: any = await stakePoolProgram.account.identifier.fetch(
        identifierId
      );
      console.log(parsed);
      const identifier = parsed?.count.toNumber();
      [stakePoolId] = await findStakePoolId(new BN(identifier));
    } catch (error) {
      const identifier = new anchor.BN(0);
      [stakePoolId] = await findStakePoolId(identifier);
    }
    console.log("stakePoolId : ", stakePoolId.toBase58());
    console.log("identifierId : ", identifierId.toBase58());

    const [[stakeEntryId], originalMintMetadataId] = await Promise.all([
      findStakeEntryIdFromMint(
        connection,
        wallet_t.publicKey,
        stakePoolId,
        rewardNft.mint,
        true
      ),
      metaplex125.Metadata.getPDA(rewardNft.mint),
    ]);

    let update_total_seconds_instruction =
      stakePoolProgram.instruction.updateTotalStakeSeconds({
        accounts: {
          stakeEntry: stakeEntryId,
          lastStaker: wallet_n.publicKey,
        },
      });
    claim_rewards_instructions.push(update_total_seconds_instruction);

    const [rewardDistributorId] = await findRewardDistributorId(stakePoolId);
    const rewardDistributorData = await tryGetAccount(() =>
      getRewardDistributor(connection, rewardDistributorId)
    );

    if (rewardDistributorData) {
      const rewardMintTokenAccountId = await findAta(
        rewardDistributorData.parsed.rewardMint,
        wallet_n.publicKey,
        true
      );

      const remainingAccountsForKind = await withRemainingAccountsForKind(
        transaction,
        connection,
        wallet_n,
        rewardDistributorId,
        rewardDistributorData.parsed.kind,
        rewardDistributorData.parsed.rewardMint,
        true
      );

      const [rewardEntryId] = await findRewardEntryId(
        rewardDistributorData.pubkey,
        stakeEntryId
      );
      const rewardEntryData = await tryGetAccount(() =>
        getRewardEntry(connection, rewardEntryId)
      );

      const rewardDistributorProgram = new Program<REWARD_DISTRIBUTOR_PROGRAM>(
        REWARD_DISTRIBUTOR_IDL,
        REWARD_DISTRIBUTOR_ADDRESS,
        provider
      );

      if (!rewardEntryData) {
        let init_reward_entry_instruction =
          rewardDistributorProgram.instruction.initRewardEntry({
            accounts: {
              rewardEntry: rewardEntryId,
              stakeEntry: stakeEntryId,
              rewardDistributor: rewardDistributorData.pubkey,
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
                        <li className="pointer" onClick={claimRewardsFn}>
                          Claim Tokens
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
