/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState, useCallback } from "react";

import OutsideClickHandler from "react-outside-click-handler";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import "react-circular-progressbar/dist/styles.css";

import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";

import {
  PublicKey,
  SystemProgram,
  Transaction,
  clusterApiUrl,
  Connection,
} from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { Metaplex } from "@metaplex-foundation/js";

import MobileMenu from "../assets/mobile_menu.png";
import Twitter from "../assets/twitter_copy.png";
import Discord from "../assets/discord.png";
import LogoWhite from "../assets/Logowhite.png";
import LogoWhiteCropped from "../assets/Logowhite_cropped.png";
import KatanaImage from "../assets/katana.png";
import PizzaImage from "../assets/pizza.png";
import FanSpinning from "../assets/fan_spinning.mp4";
import Sopha from "../assets/sopha.png";
import Beanbag from "../assets/bean_bag.png";
import SophaSider from "../assets/sopha_sider.png";
import CloseAlpha from "../assets/turn-back.png";
import Close from "../assets/close.png";
import AlphaScroll from "../assets/down-arrow.png";
import Dev1 from "../assets/dev1.png";
import Dev2 from "../assets/dev2.png";
import Sashi from "../assets/sashi.png";
import Wallace from "../assets/wallace.png";
import Gabriel from "../assets/gabriel.png";
import Kaizer from "../assets/kaizer.png";
import Walter from "../assets/walter.png";
import Yogantar from "../assets/yogantar.png";
import SwappingIcon from "../assets/swapping_icon.png";
import User from "../assets/user.png";
import Refresh from "../assets/refresh.png";
import ProgressBar from "./progress-bar";
import "react-circular-progressbar/dist/styles.css";
import StakingMobile from "../assets/staking_mobile.png";
import TokenSwapMobile from "../assets/token_swap_mobile.png";
import RaffleCave from "../assets/raffle_cave_mobile.png";

import {
  pdaSeed,
  pdaWhitelistSeed,
  MAGIC_HAT_CREATOR,
  GOG_TIME,
  WL_TIME,
  PUBLIC_TIME,
  COMMUNITY_TIME,
  FARM_ID,
  TOKEN_PROGRAM_ID,
  BASEMENT_FARM_ID,
  COLLECTION_ID,
  REWARD_MINT,
  FEE_WALLET,
  MAGIC_HAT_PROGRAM_V2_ID,
} from "../config/config";

import { sendTransaction, sendTransactions } from "../config/connection";

import { AlertState } from "../utils/utils";
import {
  createInitializeMintInstruction,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToCheckedInstruction,
} from "solanaSPLToken036";

import * as mpl from "@metaplex-foundation/mpl-token-metadata";

import { MagicHatAccount, getMagicHatState } from "../programs/candy-machine";

import idl from "../idl/magic_hat.json";

import { findAssociatedTokenAddress } from "../GrandProgramUtils/AssociatedTokenAccountProgram/pda";
import {
  MAGIC_STAKE_PROGRAM_ID,
  GEM_BANK_PROGRAM_ID,
  getBankProgram,
  getStakeProgram,
} from "../GrandProgramUtils/GemBank/GetProgramObjects";
// import { FixedRateConfig, RarityConfig } from "../GrandProgramUtils/GemBank/interface";
import {
  TOKEN_METADATA_PROGRAM_ID,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from "../GrandProgramUtils/TokenMetadata/constants";

import MenuContent from "./menu";
import StartStakePool from "./AlphaStaking/StartStakePool";
import AddToBankWhitelist from "./AlphaStaking/AddToBankWhitelist";
import CreateFungibleToken from "./TokenCreation/CreateFungibleToken";

import {
  CYBORGPET_FARM_ID,
  CYBORG_FARM_ID,
  HUMANPETS_FARM_ID,
  HUMANS_FARM_ID,
  UPDATE_AUTHORITY_OF_TOKEN_STRING,
} from "./AlphaStaking/StakePoolConfig";
import {
  REWARD_MINT_GLITCH,
  REWARD_MINT_GLTCH,
} from "./TokenCreation/AlphaTokenConfig";
import AlphaTokenSwap from "./TokenCreation/AlphaTokenSwap";
import { findFarmTreasuryTokenPDA } from "../GrandProgramUtils/GemBank/pda";
import TransferOutTokensToPot from "./TokenCreation/TransferOutTokensToPot";
import CreateSwapRegistry from "./TokenCreation/CreateSwapRegistry";
import UpdateTokenMetadata from "./TokenCreation/UpdateTokenMetadata";
import CreateTokenMetadata from "./TokenCreation/CreateTokenMetadata";
import GetNftsbyOwnerAndCollection from "./TokenCreation/GetNftsbyOwnerAndCollection";
import GetURIOfNFTs from "./TokenCreation/GetURIOfNFTs";

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

interface LpTierConfig {
  lpTierRate: BN;
  lpRequiredTenure: BN;
}

interface ProbTierConfig {
  probableRewardRate: BN;
  probability: BN;
}

interface ProbableRateScheduleStake {
  prob1: ProbTierConfig | null;
  prob2: ProbTierConfig | null;
  prob3: ProbTierConfig | null;
  prob4: ProbTierConfig | null;
  prob5: ProbTierConfig | null;
  denominator: BN;
}

interface LpRateScheduleStake {
  lpBaseRate: BN;
  lpTier1: LpTierConfig | null;
  lpTier2: LpTierConfig | null;
  lpTier3: LpTierConfig | null;
  lpDenominator: BN;
}

interface LpRateConfig {
  lpSchedule: LpRateScheduleStake;
  lpDurationSec: BN;
}

interface ProbableRateConfig {
  probableSchedule: ProbableRateScheduleStake;
  probableAmount: BN;
  probableDurationSec: BN;
}

interface WhiteListType {
  whitelist_type: string;
  number_of_whitelist_spots_total: any;
  mint_price: any;
  start_time: any;
}

const Home = () => {
  // const url = window.location.origin;
  // if (!url.includes('https')) {
  //   if (url.split(':')[2]) {
  //     var loc:any = 'https:' + url.split(':')[1] + ':' +  + url.split(':')[2];
  //     window.location = loc;
  //   }
  //   else {
  //     var loc:any = 'https:' + url.split(':')[1];
  //     window.location = loc;
  //   }
  // }
  const connection = new anchor.web3.Connection(
    anchor.web3.clusterApiUrl("devnet")
  );

  const [magicHat, setMagicHat] = useState<MagicHatAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: "",
    severity: undefined,
  });
  const [classNameState, setClassNameState] = useState<string>(
    "main-bg-after-door-open black-bg"
  );
  const [isMobile, setIsMobile] = useState(false);
  const [logoLoading] = useState(false);
  const [logoAlphaLoading, setLogoAlphaLoading] = useState(true);
  const [showFarming, setShowFarming] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [showAlphaRoom, setShowAlphaRoom] = useState(false);
  const [showStakeRoom, setShowStakeRoom] = useState(false);
  const [showTeamRoom, setShowTeamRoom] = useState(false);
  const [showFirstPhil, setShowFirstPhil] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMobileDoor, setShowMobileDoor] = useState(false);
  const [mobileDoor, setMobileDoor] = useState(null);
  const [showTeamInfo, setShowTeamInfo] = useState(false);
  const [shouldMint, setShouldMint] = useState(false);
  const [teamInfoMember, setTeamInfoMember] = useState<any>(null);
  const [whitelists, setWhitelists] = useState<any>(null);
  const [currentWl, setCurrentWl] = useState("");
  const [time, setTime] = useState("");
  const [showWhitelist, setShowWhitelist] = useState(false);
  const [showStakeCity, setShowStakeCity] = useState(false);
  const [showStaking, setShowStaking] = useState(false);
  const [roomOneInfoClass, setRoomOneInfoClass] = useState(
    "stake-room-info-one"
  );
  const [roomTwoInfoClass, setRoomTwoInfoClass] = useState(
    "stake-room-info-one"
  );
  const [roomThreeInfoClass, setRoomThreeInfoClass] = useState(
    "stake-room-info-one"
  );
  const [roomFourInfoClass, setRoomFourInfoClass] = useState(
    "stake-room-info-one"
  );
  const [roomFiveInfoClass, setRoomFiveInfoClass] = useState(
    "stake-room-info-one"
  );
  const [createdWlCounts, setCreatedWlCounts] = useState(0);
  const [nftStakeStep, setNftStakeStep] = useState(0);
  const [currentStakeRoom, setCurrentStakeRoom] = useState(0);
  const [stakedNft, setStakedNft] = useState<any>(null);
  const [unstakedNft, setUnstakedNft] = useState<any>(null);
  const [stakedNfts, setStakedNfts] = useState<any>([]);
  const [stakedTokens, setStakedTokens] = useState<any>(0);
  const [multiplierLevel, setMultiplierLevel] = useState<any>(0);
  const [respectEarned, setRespectEarned] = useState<any>(0);
  const [stakedCity, setStakedCity] = useState("");
  const [mintResponse, setMintResponse] = useState("");
  const [collectionId, setCollectionId] = useState<any>("");
  const [mintResponseType, setMintResponseType] = useState("");
  const [maxCount, setMaxCount] = useState<number>(3);
  const [setBars] = useState([
    2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40,
    42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78,
    80, 82, 84, 86, 88, 90, 92, 94, 96, 98, 100,
  ]);
  const [gotNfts, setGotNfts] = useState(false);
  const [showStakeDashboard, setShowStakeDashboard] = useState(false);
  const [nfts, setNFts] = useState<any>([]);
  const [farm, setFarm] = useState<any>(null);
  const [humanFarm, setHumanFarm] = useState<any>(null);
  const [humanPetsFarm, setHumanPetsFarm] = useState<any>(null);
  const [cyborgFarm, setCyborgFarm] = useState<any>(null);
  const [cyborgPetFarm, setCyborgPetFarm] = useState<any>(null);
  const [basementFarm, setBasementFarm] = useState<any>(null);
  const [farmer, setFarmer] = useState<any>(null);
  const [farmerHuman, setFarmerHuman] = useState<any>(null);
  const [farmerHumanPet, setFarmerHumanPet] = useState<any>(null);
  const [farmerCyborg, setFarmerCyborg] = useState<any>(null);
  const [farmerCyborgPet, setFarmerCyborgPet] = useState<any>(null);
  const [farmerBasement, setFarmerBasement] = useState<any>(null);
  const [funderOne, setFunderOne] = useState<any>("");
  const [funderTwo, setFunderTwo] = useState<any>("");
  const [funderThree, setFunderThree] = useState<any>("");
  const [funderFour, setFunderFour] = useState<any>("");
  const [funderFive, setFunderFive] = useState<any>("");
  const [nftMint, setNftMint] = useState<any>("");
  const [collectionIdMint, setCollectionIdMint] = useState<any>("");
  const [showTokenSwapping, setShowTokenSwapping] = useState(false);
  const [glitchTokenVal, setGlitchTokenVal] = useState(0);
  const [alphaTokenVal, setAlphaTokenVal] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [stakedBal, setStakedBal] = useState(0);
  const [nftsTab, setNftsTab] = useState(0);

  const wallet = useWallet();
  // wallet.connect();

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

  // const refreshMagicHatState = useCallback(async () => {
  //   if (!anchorWallet) {
  //     return;
  //   }

  //   if (props.magicHatId) {
  //     try {
  //       const cndy = await getMagicHatState(
  //         anchorWallet,
  //         props.magicHatId,
  //         connection
  //       );
  //       console.log(JSON.stringify(cndy.state, null, 4));
  //       const k: any = cndy?.state.itemsRedeemed.toString()!;
  //       const l: any = cndy?.state.itemsAvailable.toString()!;
  //       setMagicHat(cndy);
  //     } catch (e) {
  //       console.log("There was a problem fetching Candy Machine state");
  //       console.log(e);
  //     }
  //   }
  // }, [anchorWallet, props.magicHatId, connection]);

  // const createVRFAccount = async () => {
  //   let payer = anchor.web3.Keypair.generate();
  //   const program = await loadSwitchboardProgram("devnet", undefined, payer);
  //   const queueAccount = new queueAccount({ program, publicKey: queueKey });
  //   const queue = await queueAccount.loadData();

  //   // load client program used for callback
  //   const vrfClientProgram = anchor.workspace
  //     .AnchorVrfParser as anchor.Program<AnchorVrfParser>;
  //   const vrfSecret = anchor.web3.Keypair.generate();

  //   const vrfIxCoder = new anchor.BorshInstructionCoder(vrfClientProgram.idl);
  //   const vrfClientCallback: Callback = {
  //     programId: vrfClientProgram.programId,
  //     accounts: [
  //       // ensure all accounts in updateResult are populated
  //       { pubkey: vrfClientKey, isSigner: false, isWritable: true },
  //       { pubkey: vrfSecret.publicKey, isSigner: false, isWritable: false },
  //     ],
  //     ixData: vrfIxCoder.encode("updateResult", ""), // pass any params for instruction here
  //   };

  //   // create VRF
  //   const vrfAccount = await VrfAccount.create(program, {
  //     queue: queueAccount,
  //     callback: vrfClientCallback,
  //     authority: vrfClientKey, // vrf authority
  //     keypair: vrfSecret,
  //   });

  //   // create permission
  //   const permissionAccount = await PermissionAccount.create(program, {
  //     authority: queue.authority,
  //     granter: queue.publicKey,
  //     grantee: vrfAccount.publicKey,
  //   });

  //   // if queue has not enabled unpermissionedVrfEnabled, queue will need to grant permission
  //   let queueAuthority: anchor.web3.Keypair;
  //   await permissionAccount.set({
  //     authority: queueAuthority,
  //     permission: SwitchboardPermission.PERMIT_VRF_REQUESTS,
  //     enable: true,
  //   });
  // }

  const openStaking = async () => {
    setShowStaking(true);
  };

  let nftStakeStepCount = 0;

  const nextStepStake = async () => {
    nftStakeStepCount = nftStakeStep;
    console.log(nftStakeStepCount);
    completeStake();
    // if(nftStakeStepCount == 0) {
    //   nftStakeStepCount = nftStakeStepCount + 1;
    //   setNftStakeStep(nftStakeStepCount);
    //   completeStake();
    // }
    // else {
    //   if (stakedCity && stakedCity.length > 0 && nftStakeStepCount == 0) {
    //     nftStakeStepCount = nftStakeStepCount + 2;
    //     setNftStakeStep(nftStakeStepCount);
    //     completeStake();
    //   }
    //   else {
    //     nftStakeStepCount = nftStakeStepCount + 1;
    //     setNftStakeStep(nftStakeStepCount);
    //   }
    // }
  };

  const closeStaking = async () => {
    setNftStakeStep(0);
    setStakedNft(null);
    setStakedCity("");
    setShowStaking(false);
  };

  const getWhitelistAccounts = async () => {
    if (
      wallet &&
      wallet.publicKey &&
      wallet.publicKey.toBase58().length > 0 &&
      !shouldMint &&
      whitelists != null
    ) {
      const whitelistAccounts = Object.keys(whitelists);
      console.log(whitelists);
      if (whitelistAccounts && whitelistAccounts.length > 0) {
        for (let index = 0; index < whitelistAccounts.length; index++) {
          const element = whitelistAccounts[index];
          if (wallet.publicKey?.toBase58() === element) {
            if (
              whitelists[element].numberOfWhitelistSpotsPerUser.toNumber() > 0
            ) {
              setShouldMint(true);
              break;
            } else {
              setShouldMint(true);
            }
          }
        }
      }
    }
  };

  useEffect(() => {
    // anchor.Wallet.C;
    // refreshMagicHatState();
    var elem: HTMLElement | null = document.getElementById("main");
    if (elem!.clientWidth < 480) {
      setIsMobile(true);
    }
    // console.log(currentWl);
    setTimeout(function () {
      setClassNameState("main-bg-after-door-open");
      setLogoAlphaLoading(false);
      // getWhitelistAccounts();
      getNFTs();
      // getStakedNfts();
      // getStakedVaults();
      // getFarms();
      // getFarmers();
      // getTimeToMInt();
    }, 900);
  }, [
    anchorWallet,
    // props.magicHatId,
    // connection,
    // refreshMagicHatState,
    wallet,
    whitelists,
    shouldMint,
    currentWl,
  ]);

  const showToaster = async (id: any) => {
    if (id === 1) {
      setShowMessage(true);
      setMessageText("Wonder how that binary cheese tastes like?");
      setTimeout(function () {
        setShowMessage(false);
        setMessageText("");
      }, 900);
    } else if (id === 2) {
      setShowMessage(true);
      setMessageText("Better if you let jesse handle that");
      setTimeout(function () {
        setShowMessage(false);
        setMessageText("");
      }, 900);
    } else if (id === 3) {
      setShowMessage(true);
      setMessageText("WAGShhh, hide it back again");
      setTimeout(function () {
        setShowMessage(false);
        setMessageText("");
      }, 900);
    } else if (id === 4) {
      setShowMessage(true);
      setMessageText("Holy shit this is comfy af");

      setTimeout(function () {
        setShowMessage(false);
        setMessageText("");
      }, 900);
    } else if (id === 5) {
      var arr = [
        "Patience is key",
        "Shh...",
        "Not yet, the time will come",
        "Calm down man",
        "It's locked, come back later.",
      ];
      var k = Math.floor(Math.random() * 5);
      // k = k - 1;
      setShowMessage(true);
      setMessageText(arr[k]);

      setTimeout(function () {
        setShowMessage(false);
        setMessageText("");
      }, 900);
    }
  };

  const getProgram = async () => {
    const wallet_t: any = wallet;
    const provider = new anchor.Provider(
      connection,
      wallet_t,
      anchor.Provider.defaultOptions()
    );
    const idl_o: any = idl;
    return new Program(idl_o, MAGIC_HAT_PROGRAM_V2_ID, provider);
  };

  const findFarmAuthorityPDA = async (farm: PublicKey) => {
    return PublicKey.findProgramAddress(
      [farm.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const findFarmTreasuryPDA = (farm: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("treasury"), farm.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const findRewardsPotPDA = (farm: PublicKey, rewardMint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("reward_pot"), farm.toBytes(), rewardMint.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const funderToAuthorizePDA = (
    farm: PublicKey,
    funder_to_authorize: PublicKey
  ) => {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("authorization"),
        farm.toBytes(),
        funder_to_authorize.toBytes(),
      ],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const farmerPDA = (farm: PublicKey, farmer: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("farmer"), farm.toBytes(), farmer.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const farmerVaultPDA = (bank: PublicKey, creator: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("vault"), bank.toBytes(), creator.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const farmerStakedMintPDA = (index: any, creator: PublicKey) => {
    console.log(index);
    return PublicKey.findProgramAddress(
      [Buffer.from("farmer_staked_mints"), creator.toBytes()],
      // [Buffer.from('farmer_staked_mints'), Uint8Array.of(index), creator.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const gemBoxPda = (vault: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("gem_box"), vault.toBytes(), gem_mint.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const gemDepositBoxPda = (vault: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("gem_deposit_receipt"), vault.toBytes(), gem_mint.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const gemBoxRarityPda = (bank: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from("gem_rarity"), bank.toBytes(), gem_mint.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const vaultAuthorityPda = (valut: PublicKey) => {
    return PublicKey.findProgramAddress([valut.toBytes()], GEM_BANK_PROGRAM_ID);
  };

  const whitelistProofPda = (
    bank: PublicKey,
    address_to_whitelist: PublicKey
  ) => {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("whitelist"),
        bank.toBytes(),
        address_to_whitelist.toBytes(),
      ],
      GEM_BANK_PROGRAM_ID
    );
  };

  const tokenMetadataPda = (mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBytes(),
        mint.toBytes(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    );
  };

  const getStakedVaults = async () => {
    if (wallet && wallet.connected) {
      const bankProgram = await getBankProgram(wallet);
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const humanFarm: any = await stakeProgram.account.farm.fetch(
          HUMANS_FARM_ID
        );
        console.log("farm with " + HUMANS_FARM_ID.toBase58());
        const [farmerVaultHumanPda] = await farmerVaultPDA(
          humanFarm.bank,
          wallet.publicKey!
        );
        const humanVaults: any = await bankProgram.account.vault.fetch(
          farmerVaultHumanPda
        );
        console.log("human vaults");
        console.log(humanVaults);
      } catch (error) {}

      try {
        const humanPetFarm: any = await stakeProgram.account.farm.fetch(
          HUMANPETS_FARM_ID
        );
        console.log("farm with " + HUMANPETS_FARM_ID.toBase58());
        const [farmerVaultHumanPetPda] = await farmerVaultPDA(
          humanPetFarm.bank,
          wallet.publicKey!
        );
        const humanPetVaults: any = await bankProgram.account.vault.fetch(
          farmerVaultHumanPetPda
        );
        console.log("human pet vaults");
        console.log(humanPetVaults);
      } catch (error) {}

      try {
        const cyborgFarm: any = await stakeProgram.account.farm.fetch(
          CYBORG_FARM_ID
        );
        console.log("farm with " + CYBORG_FARM_ID.toBase58());
        const [farmerVaultCyborgPda] = await farmerVaultPDA(
          cyborgFarm.bank,
          wallet.publicKey!
        );
        const cyborgVaults: any = await bankProgram.account.vault.fetch(
          farmerVaultCyborgPda
        );
        console.log("cyborg vaults");
        console.log(cyborgVaults);
      } catch (error) {}

      try {
        const cyborgPetFarm: any = await stakeProgram.account.farm.fetch(
          CYBORGPET_FARM_ID
        );
        console.log("farm with " + CYBORGPET_FARM_ID.toBase58());
        const [farmerVaultCyborgPetPda] = await farmerVaultPDA(
          cyborgPetFarm.bank,
          wallet.publicKey!
        );
        const cyborgPetVaults: any = await bankProgram.account.vault.fetch(
          farmerVaultCyborgPetPda
        );
        console.log("cyborg pet vaults");
        console.log(cyborgPetVaults);
      } catch (error) {}
    }
  };

  // const getStakedNfts = async () => {
  //   if (wallet && wallet.connected) {
  //     const bankProgram = await getBankProgram(wallet);
  //     // const [farmerVaultPda] = await farmerVaultPDA(
  //     //   farms.bank,
  //     //   wallet.publicKey!
  //     // );
  //     const gdprs:any = await bankProgram.account.gemDepositReceipt.all();
  //     // console.log(gdprs);
  //     var array:any = [];
  //     for (let index = 0; index < gdprs.length; index++) {
  //       const element = gdprs[index];
  //       const connection = new Connection(clusterApiUrl("devnet"));
  //       const metaplex = new Metaplex(connection);
  //       // console.log(element.account.gemMint.toBase58());
  //       let nft:any = await metaplex.nfts().findByMint({ mintAddress: element.account.gemMint }).run();
  //       console.log(nft);
  //       if (nft.updateAuthorityAddress.toBase58() == "TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq") {
  //         var obj:any = {
  //           name: nft.name,
  //           link: nft.json.image,
  //           auth: nft.updateAuthorityAddress.toBase58()
  //         }
  //         // console.log(obj);
  //         array.push(obj);
  //       }
  //     }
  //     if (array && array.length > 0) {
  //       console.log(array);
  //       setStakedNfts(array);
  //       // setStakedTokens(array.length * 100);
  //       // setRespectEarned(array.length * 100);
  //       // setMultiplierLevel(array.length);
  //     }
  //   }
  // }

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
              const connection = new Connection(clusterApiUrl("devnet"));
              const metaplex = new Metaplex(connection);
              // console.log(element.account.gemMint.toBase58());
              var pk = new anchor.web3.PublicKey(element);
              let nft: any = await metaplex
                .nfts()
                .findByMint({ mintAddress: pk })
                .run();
              console.log(nft);
              var obj: any = {
                mint: element,
                name: nft.name,
                link: nft.json.image,
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

  // Farm Manager Should call this

  // Farm Manager Should call this

  const closeFarming = async () => {
    setShowFarming(false);
    setFunderOne("");
    setFunderTwo("");
    setFunderThree("");
    setFunderFour("");
    setFunderFive("");
  };

  // Farm Manager should call this

  const getFarmers = async () => {
    if (wallet && wallet.connected) {
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const [humanFarmerVar] = await farmerPDA(
          HUMANS_FARM_ID,
          wallet.publicKey!
        );
        const farmersHuman: any = await stakeProgram.account.farmer.fetch(
          humanFarmerVar
        );
        if (farmersHuman != null) {
          console.log("Human Farmer ");
          console.log(farmersHuman);
          let [pda] = await farmerStakedMintPDA(0, humanFarmerVar);
          const nftsStakedCyborg: any =
            await stakeProgram.account.farmerStakedMints.fetch(pda);
          console.log("Nfts Staked : ");
          let arr: any = [];
          console.log(nftsStakedCyborg);
          console.log(nftsStakedCyborg.farmerStakedMints[0]);
          console.log(nftsStakedCyborg.farmerStakedMints[0].toBase58());
          arr.push(nftsStakedCyborg.farmerStakedMints[0]);
          let array: any = [];
          const connection = new Connection(clusterApiUrl("devnet"));
          const metaplex = new Metaplex(connection);
          let nft: any = await metaplex
            .nfts()
            .findByMint({ mintAddress: arr[0] })
            .run();
          console.log(nft);
          var obj: any = {
            name: nft.name,
            link: nft.json.image,
            auth: nft.updateAuthorityAddress.toBase58(),
          };
          array.push(obj);
          setStakedNfts(array);
          setFarmerHuman(farmersHuman);
          setStakedBal(
            stakedBal + farmersHuman.rewardA.accruedReward.toNumber()
          );
          // setStakedTokens(farmersHuman.gemsStaked!.toNumber());
          // setRespectEarned(farmersHuman.lpPoints.lpAccrued.toNumber());
          // setMultiplierLevel(farmersHuman.lpPoints.lpLevel.toNumber());
          setFarmerHuman(farmersHuman);
        }
      } catch (error) {
        setStakedTokens(0);
        setRespectEarned(0);
        setMultiplierLevel(0);
        setFarmerHuman(null);
      }

      try {
        const [humanPetsFarmerVar] = await farmerPDA(
          HUMANPETS_FARM_ID,
          wallet.publicKey!
        );
        const farmersHumanPets: any = await stakeProgram.account.farmer.fetch(
          humanPetsFarmerVar
        );
        if (farmersHumanPets != null) {
          console.log("Human Pet Farmer ");
          console.log(farmersHumanPets);
          let [pda] = await farmerStakedMintPDA(0, humanPetsFarmerVar);
          const nftsStakedHumanPets =
            await stakeProgram.account.farmerStakedMints.fetch(pda);
          console.log("Nfts Staked : ");
          console.log(nftsStakedHumanPets);
          setFarmerHumanPet(farmersHumanPets);
          setStakedBal(
            stakedBal + farmersHumanPets.rewardA.accruedReward.toNumber()
          );
          // setStakedTokens(farmersHumanPets.gemsStaked!.toNumber());
          // setRespectEarned(farmersHumanPets.lpPoints.lpAccrued.toNumber());
          // setMultiplierLevel(farmersHumanPets.lpPoints.lpLevel.toNumber());
        }
      } catch (error) {
        setStakedTokens(0);
        setRespectEarned(0);
        setMultiplierLevel(0);
        setFarmerHumanPet(null);
      }

      try {
        const [cyborgFarmerVar] = await farmerPDA(
          CYBORG_FARM_ID,
          wallet.publicKey!
        );
        const farmersCyborg: any = await stakeProgram.account.farmer.fetch(
          cyborgFarmerVar
        );
        if (farmersCyborg != null) {
          console.log("Cyborg Farmer ");
          console.log(farmersCyborg);
          let [pda] = await farmerStakedMintPDA(0, cyborgFarmerVar);
          const nftsStakedCyborg: any =
            await stakeProgram.account.farmerStakedMints.fetch(pda);
          console.log("Nfts Staked : ");
          let arr: any = [];
          console.log(nftsStakedCyborg);
          console.log(nftsStakedCyborg.farmerStakedMints[0]);
          console.log(nftsStakedCyborg.farmerStakedMints[0].toBase58());
          arr.push(nftsStakedCyborg.farmerStakedMints[0]);
          let array: any = [];
          const connection = new Connection(clusterApiUrl("devnet"));
          const metaplex = new Metaplex(connection);
          let nft: any = await metaplex
            .nfts()
            .findByMint({ mintAddress: arr[0] })
            .run();
          console.log(nft);
          var obj1: any = {
            name: nft.name,
            link: nft.json.image,
            auth: nft.updateAuthorityAddress.toBase58(),
          };
          array.push(obj1);
          setStakedNfts(array);
          setFarmerCyborg(farmersCyborg);
          // setStakedTokens(farmersCyborg.gemsStaked!.toNumber());
          setStakedBal(
            stakedBal + farmersCyborg.rewardA.accruedReward.toNumber()
          );
          // setRespectEarned(farmersCyborg.lpPoints.lpAccrued.toNumber());
          // setMultiplierLevel(farmersCyborg.lpPoints.lpLevel.toNumber());
        }
      } catch (error) {
        setStakedTokens(0);
        setRespectEarned(0);
        setMultiplierLevel(0);
        setFarmerCyborg(null);
      }

      try {
        const [cyborgPetFarmerVar] = await farmerPDA(
          CYBORGPET_FARM_ID,
          wallet.publicKey!
        );
        const farmersCyborgPets: any = await stakeProgram.account.farmer.fetch(
          cyborgPetFarmerVar
        );
        if (farmersCyborgPets != null) {
          console.log("Cyborg Pet Farmer ");
          console.log(farmersCyborgPets);
          let [pda] = await farmerStakedMintPDA(0, cyborgPetFarmerVar);
          const nftsStakedCyborgpets =
            await stakeProgram.account.farmerStakedMints.fetch(pda);
          console.log("Nfts Staked : ");
          console.log(nftsStakedCyborgpets);
          setFarmerCyborgPet(farmersCyborgPets);
          // setStakedTokens(farmersCyborgPets.gemsStaked!.toNumber());
          setStakedBal(
            stakedBal + farmersCyborgPets.rewardA.accruedReward.toNumber()
          );
          // setRespectEarned(farmersCyborgPets.lpPoints.lpAccrued.toNumber());
          // setMultiplierLevel(farmersCyborgPets.lpPoints.lpLevel.toNumber());
        }
      } catch (error) {
        setStakedTokens(0);
        setRespectEarned(0);
        setMultiplierLevel(0);
        setFarmerCyborgPet(null);
      }
    }
  };

  const getFarms = async () => {
    if (wallet && wallet.connected) {
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const humanFarmVar: any = await stakeProgram.account.farm.fetch(
          HUMANS_FARM_ID
        );
        // console.log('Humans Farm');
        // console.log(humanFarmVar);
        setHumanFarm(humanFarmVar);
      } catch (error) {
        setHumanFarm(null);
      }
      try {
        const humanPetsFarmVar: any = await stakeProgram.account.farm.fetch(
          HUMANPETS_FARM_ID
        );
        // console.log('Human Pets Farm ');
        // console.log(humanPetsFarmVar);
        setHumanPetsFarm(humanPetsFarmVar);
      } catch (error) {
        setHumanPetsFarm(null);
      }
      try {
        const cyborgFarmVar: any = await stakeProgram.account.farm.fetch(
          CYBORG_FARM_ID
        );
        // console.log('Cyborgs Farm ');
        // console.log(cyborgFarmVar);
        setCyborgFarm(cyborgFarmVar);
      } catch (error) {
        setCyborgFarm(null);
      }
      try {
        const cyborgPetFarmVar: any = await stakeProgram.account.farm.fetch(
          CYBORGPET_FARM_ID
        );
        // console.log('Cyborg Pets Farm ');
        // console.log(cyborgPetFarmVar);
        setCyborgPetFarm(cyborgPetFarmVar);
      } catch (error) {
        setCyborgPetFarm(null);
      }
    }
  };

  const getNFTs = async () => {
    // const connectionMetaplex = new Connection(
    //   "https://api.metaplex.solana.com",
    //   "confirmed"
    // );
    // const metadata:any = Metadata;
    // // const walletAddress = "6vRx1iVZo3xfrBHdpvuwArL2jucVj9j9nLpd2VUTTGMG"
    // const nftsmetadata = await metadata.findDataByOwner(connectionMetaplex, wallet.publicKey?.toBase58());
    // console.log(nftsmetadata);
    // const connection = new Connection(clusterApiUrl("devnet"));
    // const wallet = anchor.web3.Keypair.generate();

    // const metaplex = Metaplex.make(connection).use(keypairIdentity(wallet));
    // const myNfts = await metaplex.nfts().findAllByOwner(wallet.publicKey);
    // console.log(myNfts);
    // const nftsmetadata = await Metadata.findDataByOwner(props.connection, wallet.publicKey);
    // console.log(nftsmetadata)
    setCollectionId(COLLECTION_ID);
    if (wallet && wallet.connected && !gotNfts) {
      const connection = new Connection(clusterApiUrl("devnet"));
      let ata = await getAssociatedTokenAddress(
        REWARD_MINT_GLITCH, // mint
        wallet?.publicKey! // owner
      );
      try {
        let tokenAmount = await connection.getTokenAccountBalance(ata);
        setGlitchTokenVal(parseInt(tokenAmount.value.amount));
        setAlphaTokenVal(parseInt(tokenAmount.value.amount));
        console.log(`amount: ${tokenAmount.value.amount}`);
        console.log(`decimals: ${tokenAmount.value.decimals}`);
      } catch (error) {
        setGlitchTokenVal(0);
        setAlphaTokenVal(0);
      }
      const metaplex = Metaplex.make(connection);
      const allNfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: wallet?.publicKey! })
        .run();
      let temp_nfts: any = [];
      // console.log(allNfts);
      for (let index = 0; index < allNfts.length; index++) {
        const nft: any = allNfts[index];
        var creators = nft.creators;
        var is_ours = false;
        // console.log(nft.updateAuthorityAddress.toBase58(), nft.name);
        if (
          nft.updateAuthorityAddress.toBase58() ==
          UPDATE_AUTHORITY_OF_TOKEN_STRING
        ) {
          is_ours = true;
          for (let iindex = 0; iindex < creators.length; iindex++) {
            const element = creators[iindex];
            if (element.share == 0) {
              // setCollectionId(element.address);
            }
          }
        }
        if (is_ours) {
          var xhr = new XMLHttpRequest();
          xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
              // console.log(this.responseText);
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
              // console.log(allNfts);
            }
          });
          xhr.open("GET", nft.uri);
          xhr.send();
        }
      }
      // console.log(temp_nfts);
      setGotNfts(true);
    }
  };

  // // Farmer should call this
  // const initFixedFarmerInst = async (id:any,stake_instructions:any, stakeProgram:any) => {
  //   let farm_id:any;
  //   if (id == 1) {
  //     farm_id = HUMANS_FARM_ID;
  //   }
  //   else if (id == 4) {
  //     farm_id = CYBORGPET_FARM_ID;
  //   }
  //   else if (id == 5) {
  //     farm_id = BASEMENT_FARM_ID;
  //   }
  //   if (id == 1) {
  //     const [farmerPda] = await farmerPDA(
  //       farm_id,
  //       wallet.publicKey!
  //     );
  //     const farms:any =
  //       await stakeProgram.account.farm.fetch(farm_id);
  //     console.log('farm with ' + farm_id.toBase58());
  //     const [farmerVaultPda] = await farmerVaultPDA(
  //       farms.bank,
  //       wallet.publicKey!
  //     );
  //     stake_instructions.push(stakeProgram.rpc.initFixedFarmer(
  //       {
  //         accounts: {
  //           farm: farm_id,
  //           farmer: farmerPda,
  //           identity: wallet.publicKey,
  //           bank: farms.bank,
  //           vault: farmerVaultPda,
  //           gemBank: GEM_BANK_PROGRAM_ID,
  //           payer: wallet.publicKey,
  //           systemProgram: SystemProgram.programId,
  //         }
  //       }
  //     ));
  //     return stake_instructions;
  //   }
  //   else if (id == 2) {
  //     const [farmerPda] = await farmerPDA(
  //       FARM_ID,
  //       wallet.publicKey!
  //     );
  //     const farms:any =
  //       await stakeProgram.account.farm.fetch(FARM_ID);
  //     console.log('farm with ' + FARM_ID.toBase58());
  //     const [farmerVaultPda] = await farmerVaultPDA(
  //       farms.bank,
  //       wallet.publicKey!
  //     );
  //     stake_instructions.push(stakeProgram.rpc.initFixedFarmer(
  //       {
  //         accounts: {
  //           farm: FARM_ID,
  //           farmer: farmerPda,
  //           identity: wallet.publicKey,
  //           bank: farms.bank,
  //           vault: farmerVaultPda,
  //           gemBank: GEM_BANK_PROGRAM_ID,
  //           payer: wallet.publicKey,
  //           systemProgram: SystemProgram.programId,
  //         }
  //       }
  //     ));
  //     return stake_instructions;
  //   }
  // }

  //Farmer should call this
  const initFixedFarmerAlpha = async (
    id: any,
    stake_instructions: any,
    stakeProgram: any
  ) => {
    let farm_id: any;
    if (id == 1) {
      farm_id = HUMANS_FARM_ID;
    } else if (id == 2) {
      farm_id = HUMANPETS_FARM_ID;
    } else if (id == 3) {
      farm_id = CYBORG_FARM_ID;
    } else if (id == 4) {
      farm_id = CYBORGPET_FARM_ID;
    }
    const [farmerPda] = await farmerPDA(farm_id, wallet.publicKey!);
    const farms: any = await stakeProgram.account.farm.fetch(farm_id);
    console.log("farm with " + farm_id.toBase58());
    const [farmerVaultPda] = await farmerVaultPDA(
      farms.bank,
      wallet.publicKey!
    );
    const [farmerStakedMintVarPDA, farmerStakedMintBump] =
      await farmerStakedMintPDA(0, farmerPda);
    stake_instructions.push(
      stakeProgram.instruction.initFixedFarmer(new BN(0), {
        accounts: {
          farm: farm_id,
          farmer: farmerPda,
          farmerStakedMints: farmerStakedMintVarPDA,
          identity: wallet.publicKey,
          bank: farms.bank,
          vault: farmerVaultPda,
          gemBank: GEM_BANK_PROGRAM_ID,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
      })
    );
    return stake_instructions;
  };

  const claimReward = async () => {
    const stakeProgram = await getStakeProgram(wallet);
    const claim_instructions: any = [];
    let userNewTokenAccountPDA = await getAssociatedTokenAddress(
      REWARD_MINT_GLTCH, // mint
      wallet.publicKey! // owner
    );
    if (farmerHuman != null) {
      const [farmerPda, farmerBump] = await farmerPDA(
        HUMANS_FARM_ID,
        wallet.publicKey!
      );
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(
        HUMANS_FARM_ID
      );
      const farmsH: any = await stakeProgram.account.farm.fetch(HUMANS_FARM_ID);
      let [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(
        HUMANS_FARM_ID,
        REWARD_MINT_GLTCH
      );
      let inst = await stakeProgram.instruction.claim(
        farmAuthBump,
        farmerBump,
        rewardAPotBump,
        rewardAPotBump,
        {
          accounts: {
            farm: HUMANS_FARM_ID,
            farmAuthority: farmAuth,
            farmer: farmerPda,
            identity: wallet.publicKey,
            rewardAPot: rewardAPot,
            rewardAMint: REWARD_MINT_GLTCH,
            rewardADestination: userNewTokenAccountPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
      );
      claim_instructions.push(inst);
    }
    if (farmerHumanPet != null) {
      const [farmerHPPda, farmerBumpHP] = await farmerPDA(
        HUMANPETS_FARM_ID,
        wallet.publicKey!
      );
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(
        HUMANPETS_FARM_ID
      );
      const farmsHP: any = await stakeProgram.account.farm.fetch(
        HUMANPETS_FARM_ID
      );
      let [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(
        HUMANPETS_FARM_ID,
        REWARD_MINT_GLTCH
      );
      let inst = await stakeProgram.instruction.claim(
        farmAuthBump,
        farmerBumpHP,
        rewardAPotBump,
        rewardAPotBump,
        {
          accounts: {
            farm: HUMANPETS_FARM_ID,
            farmAuthority: farmsHP.farmAuthority,
            farmer: farmerHPPda,
            identity: wallet.publicKey,
            rewardAPot: rewardAPot,
            rewardAMint: REWARD_MINT_GLTCH,
            rewardADestination: userNewTokenAccountPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
      );
      claim_instructions.push(inst);
    }
    if (farmerCyborg != null) {
      const [farmerCPda, farmerBumpC] = await farmerPDA(
        CYBORG_FARM_ID,
        wallet.publicKey!
      );
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(
        CYBORG_FARM_ID
      );
      const farmsC: any = await stakeProgram.account.farm.fetch(CYBORG_FARM_ID);
      let [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(
        CYBORG_FARM_ID,
        REWARD_MINT_GLTCH
      );
      let inst = await stakeProgram.instruction.claim(
        farmAuthBump,
        farmerBumpC,
        rewardAPotBump,
        rewardAPotBump,
        {
          accounts: {
            farm: CYBORG_FARM_ID,
            farmAuthority: farmsC.farmAuthority,
            farmer: farmerCPda,
            identity: wallet.publicKey,
            rewardAPot: rewardAPot,
            rewardAMint: REWARD_MINT_GLTCH,
            rewardADestination: userNewTokenAccountPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
      );
      claim_instructions.push(inst);
    }
    if (farmerCyborgPet != null) {
      const [farmerCPPda, farmerBumpCP] = await farmerPDA(
        CYBORGPET_FARM_ID,
        wallet.publicKey!
      );
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(
        CYBORGPET_FARM_ID
      );
      const farmsCP: any = await stakeProgram.account.farm.fetch(
        CYBORGPET_FARM_ID
      );
      let [rewardAPot, rewardAPotBump] = await findRewardsPotPDA(
        CYBORGPET_FARM_ID,
        REWARD_MINT_GLTCH
      );
      let inst = await stakeProgram.instruction.claim(
        farmAuthBump,
        farmerBumpCP,
        rewardAPotBump,
        rewardAPotBump,
        {
          accounts: {
            farm: CYBORGPET_FARM_ID,
            farmAuthority: farmsCP.farmAuthority,
            farmer: farmerCPPda,
            identity: wallet.publicKey,
            rewardAPot: rewardAPot,
            rewardAMint: REWARD_MINT_GLTCH,
            rewardADestination: userNewTokenAccountPDA,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          },
        }
      );
      claim_instructions.push(inst);
    }
    console.log(claim_instructions);
    const claim_farmer_sig = await sendTransactions(
      connection,
      wallet,
      [claim_instructions],
      [[]]
    );
    console.log(claim_farmer_sig);
  };

  // Farmer should call this
  const refreshFarmers = async () => {
    console.log(farmerHuman);
    console.log(farmerHumanPet);
    console.log(farmerCyborg);
    console.log(farmerCyborgPet);
    const stakeProgram = await getStakeProgram(wallet);
    const farmers = await stakeProgram.account.farmer.all();
    console.log(farmers);
    let fresh_instructions: any = [];
    if (farmerHuman != null) {
      try {
        const [farmerPda, farmerBump] = await farmerPDA(
          HUMANS_FARM_ID,
          wallet.publicKey!
        );
        const farms: any = await stakeProgram.account.farm.fetch(
          HUMANS_FARM_ID
        );
        console.log("farm with " + HUMANS_FARM_ID.toBase58());
        const wallet_create = await stakeProgram.instruction.refreshFarmer(
          farmerBump,
          {
            accounts: {
              farm: HUMANS_FARM_ID,
              farmer: farmerPda,
              identity: wallet.publicKey,
            },
          }
        );
        fresh_instructions.push(wallet_create);
      } catch (error) {
        console.log("Transaction error: ", error);
      }
    }
    if (farmerHumanPet != null) {
      try {
        const [farmerPdaO, farmerBumpO] = await farmerPDA(
          HUMANPETS_FARM_ID,
          wallet.publicKey!
        );
        const farms: any = await stakeProgram.account.farm.fetch(
          HUMANPETS_FARM_ID
        );
        console.log("farm with " + HUMANPETS_FARM_ID.toBase58());
        const wallet_create_o = await stakeProgram.instruction.refreshFarmer(
          farmerBumpO,
          {
            accounts: {
              farm: HUMANPETS_FARM_ID,
              farmer: farmerPdaO,
              identity: wallet.publicKey,
            },
          }
        );
        fresh_instructions.push(wallet_create_o);
      } catch (error) {}
    }
    if (farmerCyborg != null) {
      try {
        const [farmerPdaT, farmerBumpT] = await farmerPDA(
          CYBORG_FARM_ID,
          wallet.publicKey!
        );
        const farms: any = await stakeProgram.account.farm.fetch(
          CYBORG_FARM_ID
        );
        console.log("farm with " + CYBORG_FARM_ID.toBase58());
        const wallet_create_t = await stakeProgram.instruction.refreshFarmer(
          farmerBumpT,
          {
            accounts: {
              farm: CYBORG_FARM_ID,
              farmer: farmerPdaT,
              identity: wallet.publicKey,
            },
          }
        );
        fresh_instructions.push(wallet_create_t);
      } catch (error) {
        console.log("Transaction error: ", error);
      }
    }
    if (farmerCyborgPet != null) {
      try {
        const [farmerPdaF, farmerBumpF] = await farmerPDA(
          CYBORGPET_FARM_ID,
          wallet.publicKey!
        );
        const farms: any = await stakeProgram.account.farm.fetch(
          CYBORGPET_FARM_ID
        );
        console.log("farm with " + CYBORGPET_FARM_ID.toBase58());
        const wallet_create_f = await stakeProgram.instruction.refreshFarmer(
          farmerBumpF,
          {
            accounts: {
              farm: CYBORGPET_FARM_ID,
              farmer: farmerPdaF,
              identity: wallet.publicKey,
            },
          }
        );
        fresh_instructions.push(wallet_create_f);
      } catch (error) {
        console.log("Transaction error: ", error);
      }
    }
    console.log(fresh_instructions);
    const refresh_farmer_sig = await sendTransactions(
      connection,
      wallet,
      [fresh_instructions],
      [[]]
    );
    console.log(refresh_farmer_sig);
  };

  // Farmer should call this
  const refreshFarmerSigned = async () => {
    const stakeProgram = await getStakeProgram(wallet);
    const farmers = await stakeProgram.account.farmer.all();
    console.log(farmers);
    try {
      const [farmerPda, farmerBump] = await farmerPDA(
        FARM_ID,
        wallet.publicKey!
      );
      const farms: any = await stakeProgram.account.farm.fetch(FARM_ID);
      console.log("farm with " + FARM_ID.toBase58());
      const wallet_create = await stakeProgram.rpc.refreshFarmerSigned(
        farmerBump,
        true,
        {
          accounts: {
            farm: FARM_ID,
            farmer: farmerPda,
            identity: wallet.publicKey,
          },
        }
      );
      getFarmers();
      console.log("refresh farmer signed signature : " + wallet_create);
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  };

  // Complete Staking NFT
  const completeStake = async () => {
    // let tokens = await getStakedNfts();
    var add_init_human = true;
    var add_init_human_pets = true;
    var add_init_cyborg = true;
    var add_init_cyborg_pets = true;
    if (farmerHuman != null) {
      add_init_human = false;
    } else if (farmerHumanPet != null) {
      add_init_human_pets = false;
    } else if (farmerCyborg != null) {
      add_init_cyborg = false;
    } else if (farmerCyborgPet != null) {
      add_init_cyborg_pets = false;
    }
    if (stakedNft) {
      let farm_id: any;
      if (stakedNft.trait_type == "Human") {
        farm_id = HUMANS_FARM_ID;
      } else if (stakedNft.trait_type == "Human Pet") {
        farm_id = HUMANPETS_FARM_ID;
      } else if (stakedNft.trait_type == "Cyborg") {
        farm_id = CYBORG_FARM_ID;
      } else if (stakedNft.trait_type == "Cyborg Pet") {
        farm_id = CYBORGPET_FARM_ID;
      }
      let stake_instructions: any = [];
      const stakeProgram: any = await getStakeProgram(wallet);
      const bankProgram = await getBankProgram(wallet);
      // let tokens = await getTokensByOwner(wallet.publicKey!);
      console.log(stakedNft);
      // const farmers = await stakeProgram.account.farmer.all();
      if (add_init_human && stakedNft.trait_type == "Human") {
        stake_instructions = await initFixedFarmerAlpha(
          1,
          stake_instructions,
          stakeProgram
        );
      } else if (add_init_human_pets && stakedNft.trait_type == "Human Pet") {
        stake_instructions = await initFixedFarmerAlpha(
          2,
          stake_instructions,
          stakeProgram
        );
      } else if (add_init_cyborg && stakedNft.trait_type == "Cyborg") {
        stake_instructions = await initFixedFarmerAlpha(
          3,
          stake_instructions,
          stakeProgram
        );
      } else if (add_init_cyborg_pets && stakedNft.trait_type == "Cyborg Pet") {
        stake_instructions = await initFixedFarmerAlpha(
          4,
          stake_instructions,
          stakeProgram
        );
      }
      const [farmerPda, farmerBump] = await farmerPDA(
        farm_id,
        wallet.publicKey!
      );
      const farms: any = await stakeProgram.account.farm.fetch(farm_id);
      const [farmerVaultPda, farmerVaultBump] = await farmerVaultPDA(
        farms.bank,
        wallet.publicKey!
      );
      let nft;
      if (stakedNft) {
        nft = stakedNft;
      } else {
        nft = nfts[0];
      }
      const vaults = await bankProgram.account.vault.all();
      // console.log(vaults[0].account.authoritySeed.toBase58());
      const [gemBoxPdaVal] = await gemBoxPda(
        farmerVaultPda,
        new anchor.web3.PublicKey(nft.mint)
      );
      const [gemDepositBoxPdaVal] = await gemDepositBoxPda(
        farmerVaultPda,
        new anchor.web3.PublicKey(nft.mint)
      );
      const [gemBoxRarityPdaVal, gemBoxrarityBump] = await gemBoxRarityPda(
        farms.bank,
        new anchor.web3.PublicKey(nft.mint)
      );
      const [vaultAuthorityPdaVal, vaultAuthorityBump] =
        await vaultAuthorityPda(farmerVaultPda);
      const gem_mint = new anchor.web3.PublicKey(nft.mint);
      // const address_to_whitelist = new anchor.web3.PublicKey(collectionId);
      // const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
      const [mintWhitelistProofPdaVal] = await whitelistProofPda(
        farms.bank,
        new anchor.web3.PublicKey(nft.mint)
      );
      const [creatorWhitelistProofPdaVal] = await whitelistProofPda(
        farms.bank,
        new anchor.web3.PublicKey(nft.creator)
      );
      const gem_source_old = await findAssociatedTokenAddress(
        wallet.publicKey!,
        new anchor.web3.PublicKey(nft.mint)
      );
      const gem_source_obj = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey!,
        {
          mint: new anchor.web3.PublicKey(nft.mint),
        }
      );
      const gem_source = gem_source_obj.value[0].pubkey;
      const [gem_metadata] = await tokenMetadataPda(gem_mint);
      const remainingAccounts = [];
      if (mintWhitelistProofPdaVal)
        remainingAccounts.push({
          pubkey: mintWhitelistProofPdaVal,
          isWritable: false,
          isSigner: false,
        });
      if (gem_metadata)
        remainingAccounts.push({
          pubkey: gem_metadata,
          isWritable: false,
          isSigner: false,
        });
      console.log(nft.creator);
      // console.log(whitelistProofPdaVal.toBase58());
      if (creatorWhitelistProofPdaVal) {
        remainingAccounts.push({
          pubkey: creatorWhitelistProofPdaVal,
          isWritable: false,
          isSigner: false,
        });
      }
      console.log(stake_instructions);
      // const farmerId:any = await stakeProgram.account.farm.fetch(farmerPda)!;
      const [farmerStakedMintVarPDA, farmerStakedMintBump] =
        await farmerStakedMintPDA(0, farmerPda);
      stake_instructions.push(
        await stakeProgram.instruction.flashDeposit(
          farmerBump,
          vaultAuthorityBump,
          gemBoxrarityBump,
          new BN(0),
          new BN(1),
          {
            accounts: {
              farm: farm_id,
              farmAuthority: farms.farmAuthority,
              farmer: farmerPda,
              // farmerStakedMints: farmerId.fsmAccountKeys[0],
              farmerStakedMints: farmerStakedMintVarPDA,
              identity: wallet.publicKey,
              bank: farms.bank,
              vault: farmerVaultPda,
              vaultAuthority: vaultAuthorityPdaVal,
              gemBox: gemBoxPdaVal,
              gemDepositReceipt: gemDepositBoxPdaVal,
              gemSource: gem_source,
              gemMint: gem_mint,
              gemRarity: gemBoxRarityPdaVal,
              tokenProgram: TOKEN_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
              rent: anchor.web3.SYSVAR_RENT_PUBKEY,
              gemBank: GEM_BANK_PROGRAM_ID,
            },
            remainingAccounts,
          }
        )
      );
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farm_id);
      const address_to_whitelist = new anchor.web3.PublicKey(collectionId);
      const [whitelistProofPdaVal] = await whitelistProofPda(
        farms.bank,
        address_to_whitelist
      );
      stake_instructions.push(
        stakeProgram.instruction.stake(farmAuthBump, farmerBump, {
          accounts: {
            farm: farm_id,
            farmAuthority: farms.farmAuthority,
            farmer: farmerPda,
            identity: wallet.publicKey,
            bank: farms.bank,
            vault: farmerVaultPda,
            gemBank: GEM_BANK_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          },
        })
      );
      let tr = new Transaction();
      tr.add(stake_instructions);
      const complete_stake = await sendTransactions(
        connection,
        wallet,
        [stake_instructions],
        [[]]
      );
      console.log("complete stake signature ", complete_stake);
      nftStakeStepCount = nftStakeStepCount + 1;
      setNftStakeStep(nftStakeStepCount);
      var arr = stakedNfts;
      var temp_arr = nfts.slice(0, nfts.indexOf(nft));
      setNFts(temp_arr);
      // var data = JSON.stringify({
      //   "owner": wallet.publicKey?.toBase58(),
      //   "mint": nft.mint
      // });

      // var xhr = new XMLHttpRequest();
      // // xhr.withCredentials = true;

      // xhr.addEventListener("readystatechange", function() {
      //   if(this.readyState === 4) {
      //     console.log(this.responseText);
      //   }
      // });

      // xhr.open("POST", "http://34.198.111.186:8000/stakeNft");
      // xhr.setRequestHeader("Content-Type", "application/json");

      // xhr.send(data);
      // arr.push(nft);
      // setStakedNfts(arr);
      getStakedNfts();
      // setStakedTokens(stakedNfts.length * 100);
      // setRespectEarned(stakedNfts.length * 100);
      // setMultiplierLevel(stakedNfts.length);
    } else {
      setAlertState({
        open: true,
        message: "Select an NFT to stake",
        severity: "error",
      });
    }
  };

  // Farmer should call this

  // Farm Manager should call this

  // Farm Manager should call this

  // Farmer should call this

  // Farmer should call this
  const UnStakeNft = async () => {
    const stakeProgram = await getStakeProgram(wallet);
    const bankProgram = await getBankProgram(wallet);
    // const farmers = await stakeProgram.account.farmer.all();
    try {
      let nft;
      if (unstakedNft) {
        nft = unstakedNft;
      } else {
        nft = nfts[0];
      }
      console.log(nft);
      let farm_id: anchor.web3.PublicKey;
      if (nft.trait_type == "Human") {
        farm_id = HUMANS_FARM_ID;
      } else if (nft.trait_type == "Human Pet") {
        farm_id = HUMANPETS_FARM_ID;
      } else if (nft.trait_type == "Cyborg") {
        farm_id = CYBORG_FARM_ID;
      } else if (nft.trait_type == "Cyborg Pet") {
        farm_id = CYBORGPET_FARM_ID;
      } else {
        farm_id = HUMANS_FARM_ID;
      }
      const [farmerPda, farmerBump] = await farmerPDA(
        farm_id,
        wallet.publicKey!
      );
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farm_id!);
      const farms: any = await stakeProgram.account.farm.fetch(farm_id)!;
      const [farmerVaultPda, farmerVaultBump] = await farmerVaultPDA(
        farms.bank,
        wallet.publicKey!
      );
      // const [farmTreasury, farmTreasuryBump] = await findFarmTreasuryPDA(
      //   farm_id!
      // );
      const [farmerStakedMintVarPDA, farmerStakedMintBump] =
        await farmerStakedMintPDA(0, farmerPda);
      // const vaults = await bankProgram.account.vault.all();
      // console.log(vaults[0].account.authoritySeed.toBase58());
      let nftMintPublicKey = new anchor.web3.PublicKey(nft.mint);

      const [gemBoxPdaVal, gemBoxBump] = await gemBoxPda(
        farmerVaultPda,
        nftMintPublicKey
        // new anchor.web3.PublicKey(nft.mint)
      );
      const [gemDepositBoxPdaVal, gemDepositReceiptBump] =
        await gemDepositBoxPda(
          farmerVaultPda,
          nftMintPublicKey
          // new anchor.web3.PublicKey(nft.mint)
        );
      const [gemBoxRarityPdaVal, gemBoxrarityBump] = await gemBoxRarityPda(
        farms.bank,
        nftMintPublicKey
        // new anchor.web3.PublicKey(nft.mint)
      );
      const [vaultAuthorityPdaVal, vaultAuthorityBump] =
        await vaultAuthorityPda(farmerVaultPda);
      const gem_mint = new anchor.web3.PublicKey(nft.mint);
      const [farmTreasuryToken, farmTreasuryTokenBump] =
        await findFarmTreasuryTokenPDA(farm_id);
      const gem_source_obj = await connection.getParsedTokenAccountsByOwner(
        wallet.publicKey!,
        {
          mint: new anchor.web3.PublicKey(nft.mint),
        }
      );
      const gem_destination = gem_source_obj.value[0].pubkey;
      const wallet_create = await stakeProgram.rpc.unstake(
        farmAuthBump,
        farmTreasuryTokenBump,
        farmerBump,
        gemBoxBump,
        gemDepositReceiptBump,
        gemBoxrarityBump,
        new BN(1),
        new BN(0),
        false,
        {
          accounts: {
            farm: farm_id,
            farmAuthority: farms.farmAuthority,
            farmTreasuryToken: farmTreasuryToken,
            farmer: farmerPda,
            farmerStakedMints: farmerStakedMintVarPDA,
            identity: wallet.publicKey,
            bank: farms.bank,
            vault: farmerVaultPda,
            vaultAuthority: vaultAuthorityPdaVal,
            gemBox: gemBoxPdaVal,
            gemDepositReceipt: gemDepositBoxPdaVal,
            gemDestination: gem_destination,
            gemMint: gem_mint,
            gemRarity: gemBoxRarityPdaVal,
            gemBank: GEM_BANK_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
            rent: anchor.web3.SYSVAR_RENT_PUBKEY,
            systemProgram: SystemProgram.programId,
          },
        }
      );
      console.log("unstake signature : " + wallet_create);
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  };

  const showTeamInfoHover = async (id: any) => {
    setShowTeamInfo(true);
    setTeamInfoMember(id);
  };

  const closeMenu = async (id: any) => {
    if (id && id === "ANT.LABS") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setShowTeamRoom(true);
      setClassNameState("main-ant-labs-room-door");
      setShowTokenSwapping(false);
    } else if (id && id === "WORKSHOP") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setClassNameState("main-workshop-room-door");
      setShowTokenSwapping(false);
    } else if (id && id === "ALPHAZEX") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setShowStakeRoom(true);
      setShowTokenSwapping(false);
      setClassNameState("main-alphazex-mobile-room-door");
      setShowTokenSwapping(false);
    } else if (id && id === "ALPHA") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setShowAlphaRoom(true);
      setClassNameState("main-alpha-room-door");
      setShowTokenSwapping(false);
    } else {
      setMenuOpen(false);
    }
  };

  const closeAlphaRoom = async () => {
    var n = "";
    if (mobileDoor === "VAULT") {
      n = "main-workshop-room-door";
    } else if (mobileDoor === "ALPHA") {
      n = "main-alpha-room-door";
    } else if (mobileDoor === "TEAM") {
      n = "main-ant-labs-room-door";
    } else if (mobileDoor === "ALPHAZEX") {
      n = "main-alphazex-mobile-room-door";
    }
    if (showMobileDoor) {
      setClassNameState(n);
      setLogoAlphaLoading(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowTeamRoom(false);
      setShowMobileDoor(true);
      setShowTokenSwapping(false);
    } else {
      setClassNameState("main-bg-after-door-open");
      setLogoAlphaLoading(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowTeamRoom(false);
      setShowTokenSwapping(false);
    }
  };

  let currentWltype: String;

  const closeForm = async () => {
    setClassNameState("main-bg-after-door-open");
    setShowAlphaRoom(false);
    setShowTeamRoom(false);
    setShowStakeRoom(false);
    setShowMobileDoor(false);
  };

  const handleMobileHome = async () => {
    if (showAlphaRoom || showTeamRoom || showStakeRoom || showTokenSwapping) {
      closeAlphaRoom();
    } else {
      closeForm();
    }
  };

  const openMenu = async () => {
    setMenuOpen(true);
  };

  const openStakeRoom = async (id: any) => {
    setCurrentStakeRoom(id);
    setShowStakeCity(true);
  };

  const closeTokenSwapping = async () => {
    setClassNameState("alphazen-room");
    setLogoAlphaLoading(false);
    setShowAlphaRoom(false);
    setShowTeamRoom(false);
    setShowStakeRoom(true);
    setShowMobileDoor(false);
    setShowTokenSwapping(false);
  };

  const openTokenSwapping = async (params: any) => {
    setClassNameState("main-bg-after-door-open black-bg");
    setLogoAlphaLoading(true);
    setTimeout(function () {
      setLogoAlphaLoading(false);
      setClassNameState("token-swapping-room");
      setShowTeamRoom(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowMobileDoor(false);
      setShowTokenSwapping(true);
    }, 600);
  };

  const openAlphaRoom = async (key: string) => {
    if (isMobile) {
      if (mobileDoor === "ALPHA") {
        setClassNameState("main-bg-after-door-open black-bg");
        setLogoAlphaLoading(true);
        setTimeout(function () {
          setLogoAlphaLoading(false);
          setClassNameState("alpha-room");
          setShowTeamRoom(false);
          setShowAlphaRoom(true);
          setShowStakeRoom(false);
          setShowMobileDoor(false);
        }, 600);
      } else if (mobileDoor === "ALPHAZEX") {
        setClassNameState("main-bg-after-door-open black-bg");
        setLogoAlphaLoading(true);
        setTimeout(function () {
          setLogoAlphaLoading(false);
          setClassNameState("alphazen-room");
          setShowTeamRoom(false);
          setShowAlphaRoom(false);
          setShowStakeRoom(true);
          setShowMobileDoor(false);
        }, 600);
      } else {
        var arr = [
          "Patience is key",
          "Shh...",
          "Not yet, the time will come",
          "Calm down man",
          "It's locked, come back later.",
        ];
        const k: number | undefined = Math.floor(Math.random() * 5);
        setShowMessage(true);
        setMessageText(arr[k as number]);
        setTimeout(function () {
          setShowMessage(false);
          setMessageText("");
        }, 900);
      }
    } else {
      if (key == "alpha") {
        setClassNameState("main-bg-after-door-open black-bg");
        setLogoAlphaLoading(true);
        setTimeout(function () {
          setClassNameState("alpha-room");
          setLogoAlphaLoading(false);
          setShowAlphaRoom(true);
          setShowStakeRoom(false);
          setShowMobileDoor(false);
        }, 600);
      } else if (key == "ALPHAZEX") {
        setClassNameState("main-bg-after-door-open black-bg");
        setLogoAlphaLoading(true);
        setTimeout(function () {
          setClassNameState("alphazen-room");
          setLogoAlphaLoading(false);
          setShowAlphaRoom(false);
          setShowTeamRoom(false);
          setShowStakeRoom(true);
          setShowMobileDoor(false);
        }, 600);
        setTimeout(function () {
          if (roomOneInfoClass == "stake-room-info-one") {
            setRoomOneInfoClass("stake-room-info-one flip");
          } else {
            setRoomOneInfoClass("stake-room-info-one");
          }
          if (roomTwoInfoClass == "stake-room-info-one") {
            setRoomTwoInfoClass("stake-room-info-one flip");
          } else {
            setRoomTwoInfoClass("stake-room-info-one");
          }
          if (roomThreeInfoClass == "stake-room-info-one") {
            setRoomThreeInfoClass("stake-room-info-one flip");
          } else {
            setRoomThreeInfoClass("stake-room-info-one");
          }
          if (roomFourInfoClass == "stake-room-info-one") {
            setRoomFourInfoClass("stake-room-info-one flip");
          } else {
            setRoomFourInfoClass("stake-room-info-one");
          }
          if (roomFiveInfoClass == "stake-room-info-one") {
            setRoomFiveInfoClass("stake-room-info-one flip");
          } else {
            setRoomFiveInfoClass("stake-room-info-one");
          }
        }, 3000);
      } else {
        var arr1 = [
          "Patience is key",
          "Shh...",
          "Not yet, the time will come",
          "Calm down man",
          "It's locked, come back later.",
        ];
        const k: number | undefined = Math.floor(Math.random() * 5);
        setShowMessage(true);
        setMessageText(arr1[k as number]);
        setTimeout(function () {
          setShowMessage(false);
          setMessageText("");
        }, 900);
      }
    }
  };

  const hideTeamInfo = async () => {
    setShowTeamInfo(false);
    setTeamInfoMember(null);
  };

  const scrollStory = async () => {
    var elem: HTMLElement | null = document.getElementById("alpha-scroll");
    elem!.scrollTop = elem!.scrollTop + 180;
  };

  const openFirstPhilAlphaRoom = async () => {
    setShowFirstPhil(true);
  };

  const closeAlphaUpdates = async () => {
    setShowFirstPhil(false);
    setShowAlphaRoom(true);
  };

  return (
    <div id="main" className={classNameState}>
      {wallet && wallet.connected && (
        <div className="pull-left full-width">
          <div id="wrapper">
            {isMobile && <div></div>}
            {logoLoading && !logoAlphaLoading && (
              <div className="logo-loader-parent">
                <img
                  alt="Alpha-logo"
                  src={LogoWhite}
                  className="pulse-animation"
                />
              </div>
            )}
            {!logoLoading &&
              !showAlphaRoom &&
              !showStakeRoom &&
              !showTeamRoom &&
              !logoAlphaLoading &&
              !showTokenSwapping &&
              !isMobile && (
                <div
                  onClick={() => openAlphaRoom("ALPHAZEX")}
                  // onClick={() => refreshFarmer()}
                  // onClick={() => refreshFarmerSigned()}
                  className="stake-room-div"
                ></div>
              )}
            {!logoLoading && isMobile && !logoAlphaLoading && !menuOpen && (
              <div className="hamburger-menu">
                <img alt="Menu" onClick={openMenu} src={MobileMenu} />
              </div>
            )}
            {!logoLoading && isMobile && !logoAlphaLoading && (
              <div className="alpha-home-logo" onClick={handleMobileHome}>
                <img alt="Alpha-Logo-Cropped" src={LogoWhiteCropped} />
              </div>
            )}
            {!logoLoading &&
              isMobile &&
              !logoAlphaLoading &&
              showTeamRoom &&
              !showMobileDoor && (
                <div className="team-room-header" onClick={handleMobileHome}>
                  <h2>TEAM</h2>
                </div>
              )}
            {!logoLoading &&
              isMobile &&
              showMobileDoor &&
              !logoAlphaLoading && (
                <div
                  className="mobile-room-div"
                  onClick={() => openAlphaRoom("")}
                ></div>
              )}
            {!logoLoading &&
              !showAlphaRoom &&
              !showStakeRoom &&
              !showTeamRoom &&
              !logoAlphaLoading &&
              !showTokenSwapping &&
              !isMobile && (
                <div
                  // onClick={() => showToaster(5)}
                  onClick={() => setShowFarming(true)}
                  className="vault-room-div"
                ></div>
              )}
            {!logoLoading &&
              !showAlphaRoom &&
              !showTeamRoom &&
              !showStakeRoom &&
              !logoAlphaLoading &&
              !showTokenSwapping &&
              !isMobile && (
                <div
                  onClick={() => openAlphaRoom("alpha")}
                  className="alpha-room-div"
                ></div>
              )}
            {!logoLoading &&
              !showAlphaRoom &&
              !showStakeRoom &&
              !showTeamRoom &&
              !logoAlphaLoading &&
              !showTokenSwapping &&
              !isMobile && (
                <div
                  onClick={() => openAlphaRoom("team")}
                  className="team-room-div"
                ></div>
                // <a href="/create-raffle" className="team-room-div"></a>
              )}
            {!logoLoading && showMessage && (
              <div className="mesage-container">
                <label>{messageText}</label>
              </div>
            )}
            {!logoLoading &&
              !showAlphaRoom &&
              !showStakeRoom &&
              !showTeamRoom &&
              !showTokenSwapping &&
              !logoAlphaLoading &&
              !isMobile && (
                <div className="social-media-links">
                  <a
                    href="https://twitter.com/SecretAlphaLabs"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img alt="Twitter" className="social-icons" src={Twitter} />
                  </a>
                  <a
                    href="https://discord.com/invite/SecretAlpha"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img alt="Discord" className="social-icons" src={Discord} />
                  </a>
                </div>
              )}
            {showAlphaRoom &&
              !logoAlphaLoading &&
              !logoLoading &&
              !showMobileDoor &&
              !showTokenSwapping &&
              !isMobile && (
                <div className="close-alpha-room" onClick={closeAlphaRoom}>
                  <img alt="close" src={CloseAlpha} />
                </div>
              )}
            {showStakeRoom &&
              !showStakeCity &&
              !showStaking &&
              !showStakeDashboard &&
              !logoAlphaLoading &&
              !logoLoading &&
              !showMobileDoor &&
              !showTokenSwapping &&
              !isMobile && (
                <div className="close-stake-room" onClick={closeAlphaRoom}>
                  <img alt="close" src={CloseAlpha} />
                </div>
              )}
            {showTeamRoom &&
              !logoAlphaLoading &&
              !logoLoading &&
              !showMobileDoor &&
              !showTokenSwapping &&
              !isMobile && (
                <div className="close-team-room" onClick={closeAlphaRoom}>
                  <img alt="close" src={CloseAlpha} />
                </div>
              )}
            {showTeamRoom && !isMobile && (
              <div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(1)}
                  className="first-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(2)}
                  className="second-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(3)}
                  className="third-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(4)}
                  className="fourth-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(5)}
                  className="fifth-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(6)}
                  className="sixth-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(7)}
                  className="seventh-team-member"
                ></div>
                <div
                  onMouseLeave={hideTeamInfo}
                  onMouseOver={() => showTeamInfoHover(8)}
                  className="eigth-team-member"
                ></div>
              </div>
            )}
            {isMobile && menuOpen && (
              <div className="cheeseburger-menu">
                <MenuContent closeCallback={closeMenu} />
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 1 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Gabriel</b>
                  <br />
                  <i>NFT artist</i>
                  <br />
                  Artist Extraordinaire. Delicately detailed.
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 2 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Yogantar</b>
                  <br />
                  <i>Artist</i>
                  <br />
                  He sees, He makes, He thinks, He creates. No world is too far.
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 3 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Wallace</b>
                  <br />
                  <i>Collab Chief</i>
                  <br />
                  Master Negotiator, One handshake is all it takes.
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 4 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Vamshi</b>
                  <br />
                  <i>Front-end Dev</i>
                  <br />
                  Skillful savant. Code is art.
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 5 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Bhargav</b>
                  <br />
                  <i>Back-end Dev</i>
                  <br />
                  Code Whizz. The magic happens at the back.
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 6 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Walter</b>
                  <br />
                  <i>CEO</i>
                  <br />
                  Eyes all around. <span className="strikethrough">
                    Sex
                  </span>{" "}
                  Genius Sells.
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 7 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Kaizer</b>
                  <br />
                  <i>CMO</i>
                  <br />
                  The one holding all the cards. Shh…
                </label>
              </div>
            )}
            {showTeamRoom && showTeamInfo && teamInfoMember === 8 && (
              <div className="mesage-container-team">
                <label className="message-container-label-small">
                  <b>Sashi</b>
                  <br />
                  <i>COO</i>
                  <br />
                  King of discord. No bullshit, only work.
                </label>
              </div>
            )}
            {showTeamRoom && isMobile && !showMobileDoor && (
              <div className="team-member-div">
                <Carousel responsive={responsive}>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Walter <span className="text-right">CEO</span>
                    </label>
                    <img alt="Walter" src={Walter} />
                    <label className="team-member-info-bottom">
                      <q>
                        Eyes all around.{" "}
                        <span className="strikethrough">Sex</span> Genius Sells.
                      </q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Kaizer <span className="text-right">CMO</span>
                    </label>
                    <img alt="kaizer" src={Kaizer} />
                    <label className="team-member-info-bottom">
                      <q>The one holding all the cards. Shh…</q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Sashi <span className="text-right">COO</span>
                    </label>
                    <img alt="Sashi" src={Sashi} />
                    <label className="team-member-info-bottom">
                      <q>King of discord. No bullshit, only work.</q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Gabriel <span className="text-right">NFT artist</span>
                    </label>
                    <img alt="Gabriel" src={Gabriel} />
                    <label className="team-member-info-bottom">
                      <q>Artist Extraordinaire. Delicately detailed.</q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Yogantar <span className="text-right">Artist</span>
                    </label>
                    <img alt="Yogantar" src={Yogantar} />
                    <label className="team-member-info-bottom">
                      <q>
                        He sees, He makes, He thinks, He creates. No world is
                        too far.
                      </q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Wallace <span className="text-right">Collab Chief</span>
                    </label>
                    <img alt="Wallace" src={Wallace} />
                    <label className="team-member-info-bottom">
                      <q>Master Negotiator, One handshake is all it takes.</q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Vamshi <span className="text-right">Front-end Dev</span>
                    </label>
                    <img alt="Dev1" src={Dev1} />
                    <label className="team-member-info-bottom">
                      <q>Skillful savant. Code is art.</q>
                    </label>
                  </div>
                  <div className="team-member-image">
                    <label className="team-member-info-top">
                      Bhargav <span className="text-right">Back-end Dev</span>
                    </label>
                    <img alt="Dev2" src={Dev2} />
                    <label className="team-member-info-bottom">
                      <q>Code Whizz. The magic happens at the back.</q>
                    </label>
                  </div>
                </Carousel>
              </div>
            )}
            {showAlphaRoom &&
              !showTeamRoom &&
              !showStakeRoom &&
              !logoAlphaLoading &&
              !logoLoading &&
              !showMobileDoor && (
                <div className="Backdrop-other">
                  <div
                    className="alpha-room-phil-one"
                    onClick={openFirstPhilAlphaRoom}
                  >
                    <div className="smaller-alpha-updates">
                      <label className="typing-text story-line">
                        The Story
                      </label>
                    </div>
                  </div>
                </div>
              )}
            {!showAlphaRoom &&
              !showTeamRoom &&
              showStakeRoom &&
              !logoAlphaLoading &&
              !logoLoading &&
              !showMobileDoor && (
                <div className="">
                  {!isMobile && <a href="/raffles" className="raffle-cave"></a>}
                  {!isMobile && (
                    <div
                      className="token-swapping"
                      onClick={openTokenSwapping}
                    ></div>
                  )}
                  {!isMobile && (
                    <div className="staking-portal">
                      <div className="staking-portal-parent"></div>
                      <div className="adventure-staking-div"></div>
                      <a
                        href="/fixed-staking"
                        className="fixed-staking-div"
                      ></a>
                    </div>
                  )}
                  {isMobile && (
                    <div className="pull-left full-width">
                      <Carousel responsive={responsive}>
                        <div className="team-member-image">
                          <img alt="Walter" src={TokenSwapMobile} />
                          <div
                            onClick={openTokenSwapping}
                            className="opening-feature-room-token-swap-mobile"
                          ></div>
                        </div>
                        <div className="team-member-image">
                          <img alt="kaizer" src={StakingMobile} />
                          <div className="opening-feature-room-staking-mobile"></div>
                        </div>
                        <div className="team-member-image">
                          <img alt="Sashi" src={RaffleCave} />
                          <div className="opening-feature-room-raffle-cave-mobile"></div>
                        </div>
                      </Carousel>
                    </div>
                  )}
                  {!wallet.connected && (
                    <div className="staking-room-six">
                      <WalletDialogButton
                        className="Connect-Wallet-btn"
                        onClick={() => openAlphaRoom("stake")}
                      >
                        Connect Wallet
                      </WalletDialogButton>
                    </div>
                  )}
                </div>
              )}
            {showTokenSwapping && (
              <div className="Backdrop-other">
                <div className="fixed-staking-main-bg">
                  <div className="pull-left full-width">
                    {!isMobile && (
                      <img
                        src={CloseAlpha}
                        onClick={closeTokenSwapping}
                        className="swap-close-logo"
                        alt=""
                      />
                    )}
                    <div className="swapping-process-parent">
                      <AlphaTokenSwap></AlphaTokenSwap>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showStaking && (
              <div className="Backdrop-other-mint">
                <OutsideClickHandler onOutsideClick={closeStaking}>
                  <div className="stake-room-opened">
                    <img
                      className="stake-close-image"
                      onClick={closeStaking}
                      src={Close}
                    />
                    {nftStakeStep == 0 && (
                      <div className="pull-left full-width full-height">
                        <div className="stake-room-header">
                          <h2>NFT Selection</h2>
                        </div>
                        <div className="nft-parent-div">
                          {nfts &&
                            nfts.length > 0 &&
                            nfts.map(function (item: any, i: any) {
                              return (
                                <div
                                  className="nft-div"
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
                                </div>
                              );
                            })}
                        </div>
                        {stakedNft && (
                          <div className="stake-button-div">
                            <button
                              className="nft-select-button"
                              onClick={nextStepStake}
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {nftStakeStep == 1 && (
                      <div className="pull-left full-width full-height">
                        <div className="nft-deal-div">
                          <h2 className="deal-finalizing-text">
                            Finalizing the Deal
                          </h2>
                        </div>
                      </div>
                    )}
                    {nftStakeStep == 2 && (
                      <div className="pull-left full-width full-height">
                        <div className="nft-parent-div">
                          <h2 className="stake-congrats-header">
                            Congratulations !!!
                          </h2>
                          <label className="stake-congrats-text">
                            Your {stakedNft.name} has been
                            <br />
                            successfully staked in
                            <br />
                            {stakedCity}
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </OutsideClickHandler>
              </div>
            )}

            {/* {showStakeDashboard && (
            <div className="Backdrop-other-mint">
              <OutsideClickHandler onOutsideClick={() => setShowStakeDashboard(false)}>
                <div className="stake-room-opened">
                  <img className="stake-close-image" onClick={() => setShowStakeDashboard(false)} src={Close} />
                  <div className="stake-room-header">
                    <h2 className="p-l-10-i">General Dashboard</h2>
                  </div>
                  <div className="gen-dashboard-scroller">
                    <div className="gen-dahboard-stats">
                      <div className="gen-dashboard-stats-left">
                        <label>NFTs Staked</label>
                        <h2>{stakedNfts.length} {unstakedNft != null && <button className="nft-select-button" onClick={UnStakeNft}>Unstake</button>}</h2>
                      </div>
                      <div className="gen-dashboard-stats-right">
                        {stakedNfts && stakedNfts.length > 0 && stakedNfts.map(function (item:any, i:any) {
                          return (
                            <div className="nft-small-div" style={{borderColor: unstakedNft == item ? "white": "transparent"}} onClick={() => setUnstakedNft(item)}>
                              <img src={item.link} />
                              <label>{item.name}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="gen-dahboard-stats">
                      <div className="gen-dashboard-stats-left">
                        <label>Tokens Generated</label>
                        <h2>{stakedTokens}</h2>
                      </div>
                      <div className="gen-dashboard-stats-right">
                        {stakedNfts && stakedNfts.length > 0 && stakedNfts.map(function (item:any, i:any) {
                          return (
                            <div className="nft-small-div">
                              <img src={item.link} />
                              <label>{item.name}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="gen-dahboard-stats">
                      <div className="gen-dashboard-stats-left">
                        <label>Respect Generated</label>
                        <h2>{respectEarned}</h2>
                      </div>
                      <div className="gen-dashboard-stats-right">
                        {stakedNfts && stakedNfts.length > 0 && stakedNfts.map(function (item:any, i:any) {
                          return (
                            <div className="nft-small-div">
                              <img src={item.link} />
                              <label>{item.name}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="gen-dahboard-stats">
                      <div className="gen-dashboard-stats-left">
                        <label>Multiplier Level</label>
                        <h2>{multiplierLevel}</h2>
                      </div>
                      <div className="gen-dashboard-stats-right">
                        {stakedNfts && stakedNfts.length > 0 && stakedNfts.map(function (item:any, i:any) {
                          return (
                            <div className="nft-small-div">
                              <img src={item.link} />
                              <label>{item.name}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  
                </div>
              </OutsideClickHandler>
            </div>
          )} */}
            {showFirstPhil && (
              <div className="Backdrop-other">
                <OutsideClickHandler onOutsideClick={closeAlphaUpdates}>
                  <div className="alpha-holo">
                    <div className="alpha-holo-updates" id="alpha-scroll">
                      <img
                        alt="Story-background"
                        src={AlphaScroll}
                        className="alpha-scroll-icon"
                        onClick={scrollStory}
                      />
                      <label className="typing-text">
                        In the year 6969, a gang of 4 kids, led by their leader
                        Jesse, venture out into the wild post-apocalyptic
                        cyberpunk world of Alphazex, traveling through various
                        cities, meandering through multiple adventures, just to
                        answer a single question...
                      </label>
                      <label className="typing-text m-t-15">
                        Throughout the world of Alphazex, there is only one
                        safeplace, one haven for Jesse and his friends. It's the
                        Alpha hood.{" "}
                      </label>
                      <label className="typing-text m-t-15">
                        Originally, what was one of the biggest laboratories in
                        the world for AI research, Alpha Labs was destroyed in
                        the world wars that kept on occurring, The not-so-okay
                        wars, the Creck wars, the cult vs tribe wars, and the
                        once grand building of Alpha Labs was destroyed, or
                        that's what people thought.
                      </label>
                      <label className="typing-text m-t-15">
                        Goverments and rulers came and went, and even though the
                        existence of autonomous organizations was banned, one
                        group thrived in the ruins of the same building that was
                        thought to not exist. This organisation was, Secret
                        Alpha.
                      </label>
                    </div>
                  </div>
                </OutsideClickHandler>
              </div>
            )}
            {/* {showWhitelist && 
          <div>
            <div className="Backdrop-other-mint">
              <OutsideClickHandler onOutsideClick={closeUpdates}>
                <div className="bigger-holo">
                  <div className="mint-inside-div">
                    <div className="whitelist-parent">
                      {!wallet.connected && 
                      <div className="pull-left full-width text-center">
                        <WalletDialogButton className="Inside-Connect-btn">
                          Connect
                        </WalletDialogButton>
                      </div>
                      }
                      <button className="whitelist-create-button m-t-15" onClick={createWhitelistConfig}>Create Whitelist Config</button>
                      <div className="pull-left full-width text-center m-t-15 m-b-15">
                        <label className="whitelist-texts">Created Whitelist Accounts : {createdWlCounts}</label>
                        <button className="whitelist-account-create" onClick={createWhitelistAccountMultiple}>Create 10 Accounts</button>
                      </div>
                    </div>
                  </div>
                </div>
              </OutsideClickHandler>
            </div>
          </div>} */}
            {showFarming && (
              <div className="Backdrop-other-mint">
                <OutsideClickHandler onOutsideClick={() => closeFarming()}>
                  {wallet.connected && (
                    <div className="bigger-holo">
                      <div className="stake-room-farm">
                        <div className="gen-dashboard-scroller">
                          {/* <CreateFungibleToken/> */}
                          {/* <UpdateTokenMetadata/> */}
                          {/* <CreateTokenMetadata/> */}
                          {/* <CreateSwapRegistry/> */}
                          {/* <TransferOutTokensToPot/> */}
                          {/* <GetNftsbyOwnerAndCollection /> */}
                          <GetURIOfNFTs />
                          <StartStakePool />
                          <AddToBankWhitelist />
                          {/* <div className="gen-farm-stats">
                        <div className="gen-farm-stats-left">
                          <input className="authorize-funder-reward-input" placeholder="NFT Mint" value={nftMint} onChange={event => setNftMint(event.target.value)} />
                        </div>
                        <div className="gen-farm-stats-right">
                          <button className="Inside-Farm-btn" onClick={addRaritiesToBank}>Add Rarities to Bank</button>
                        </div> 
                      </div>*/}
                        </div>
                      </div>
                    </div>
                  )}
                  {!wallet.connected && (
                    <div className="bigger-holo">
                      <div className="holo-updates">
                        <div className="mint-inside-div">
                          <WalletDialogButton className="Connect-Wallet-btn">
                            Connect Wallet
                          </WalletDialogButton>
                        </div>
                      </div>
                    </div>
                  )}
                </OutsideClickHandler>
              </div>
            )}
            {!logoLoading && logoAlphaLoading && (
              <div className="logo-loader-parent-alpha">
                <img
                  alt="Alpha-logo"
                  src={LogoWhite}
                  className="pulse-animation"
                />
              </div>
            )}
          </div>
          <Snackbar
            className="snack-bar"
            open={alertState.open}
            autoHideDuration={6000}
            onClose={() => setAlertState({ ...alertState, open: false })}
          >
            <Alert
              className="bold"
              onClose={() => setAlertState({ ...alertState, open: false })}
              severity={alertState.severity}
            >
              {alertState.message}
            </Alert>
          </Snackbar>
        </div>
      )}
      {(!wallet || !wallet.connected) && (
        <WalletDialogButton
          className="Connect-Wallet-btn"
          onClick={() => openAlphaRoom("stake")}
        >
          Connect Wallet
        </WalletDialogButton>
      )}
    </div>
  );
};

export default Home;
