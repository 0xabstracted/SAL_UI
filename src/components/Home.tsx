/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useMemo, useState, useCallback } from "react";

import OutsideClickHandler from "react-outside-click-handler";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import 'react-circular-progressbar/dist/styles.css';

import * as anchor from "@project-serum/anchor";
import { BN, Program } from "@project-serum/anchor";

import { PublicKey, SystemProgram, Transaction, clusterApiUrl, Connection } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";

import { Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

import { Metaplex } from "@metaplex-foundation/js"

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
import ProgressBar from "./progress-bar";
import 'react-circular-progressbar/dist/styles.css';

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
  MAGIC_HAT_PROGRAM_V2_ID
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
} from "@solana/spl-token";

import * as mpl from "@metaplex-foundation/mpl-token-metadata";

import {
  MagicHatAccount,
  getMagicHatState,
} from "../programs/candy-machine";

import idl from "../idl/magic_hat.json";


import { findAssociatedTokenAddress } from "../GrandProgramUtils/AssociatedTokenAccountProgram/pda";
import { MAGIC_STAKE_PROGRAM_ID, GEM_BANK_PROGRAM_ID, getBankProgram, getStakeProgram } from "../GrandProgramUtils/gemBank/getProgramObjects";
import { FixedRateConfig, RarityConfig } from "../GrandProgramUtils/gemBank/interface";
import { TOKEN_METADATA_PROGRAM_ID } from "../GrandProgramUtils/tokenMetadata/constants";

import MenuContent from "./menu";
import InitFarmAlpha from "./AlphaStaking/InitFarmAlpha";
import AddToBankWhitelist from "./AlphaStaking/AddToBankWhitelist";
import FundRewardAlpha from "./AlphaStaking/FundRewardAlpha";
import CreateFungibleToken from "./TokenCreation/CreateFungibleToken";

import { CYBORGPET_FARM_ID, CYBORG_FARM_ID, HUMANPETS_FARM_ID, HUMANS_FARM_ID } from "./AlphaStaking/StakeConfig";
import { REWARD_MINT_GLITCH } from "./TokenCreation/AlphaTokenConfig";
import MintNewFungibleToken from "./TokenCreation/MintNewFungibleToken";
import { findFarmTreasuryTokenPDA } from "../GrandProgramUtils/gemBank/pda";

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

export interface HomeProps {
  magicHatId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
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
  const [roomOneInfoClass, setRoomOneInfoClass] = useState("stake-room-info-one");
  const [roomTwoInfoClass, setRoomTwoInfoClass] = useState("stake-room-info-one");
  const [roomThreeInfoClass, setRoomThreeInfoClass] = useState("stake-room-info-one");
  const [roomFourInfoClass, setRoomFourInfoClass] = useState("stake-room-info-one");
  const [roomFiveInfoClass, setRoomFiveInfoClass] = useState("stake-room-info-one");
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
  const [showFixedStakingRoom, setShowFixedStakingRoom] = useState(false);
  const [showTokenSwapping, setShowTokenSwapping] = useState(false);
  const [glitchTokenVal, setGlitchTokenVal] = useState(0);
  const [alphaTokenVal, setAlphaTokenVal] = useState(0);

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

  const refreshMagicHatState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.magicHatId) {
      try {
        const cndy = await getMagicHatState(
          anchorWallet,
          props.magicHatId,
          props.connection
        );
        console.log(JSON.stringify(cndy.state, null, 4));
        const k: any = cndy?.state.itemsRedeemed.toString()!;
        const l: any = cndy?.state.itemsAvailable.toString()!;
        setMagicHat(cndy);
      } catch (e) {
        console.log("There was a problem fetching Candy Machine state");
        console.log(e);
      }
    }
  }, [anchorWallet, props.magicHatId, props.connection]);



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
  }


  let nftStakeStepCount = 0;

  const nextStepStake = async () => {
    nftStakeStepCount = nftStakeStep;
    console.log(nftStakeStepCount);
    if(nftStakeStepCount == 0) {
      nftStakeStepCount = nftStakeStepCount + 1;
      setNftStakeStep(nftStakeStepCount);
      completeStake();
    }
    else {
      if (stakedCity && stakedCity.length > 0 && nftStakeStepCount == 0) {
        nftStakeStepCount = nftStakeStepCount + 2;
        setNftStakeStep(nftStakeStepCount);
        completeStake();
      }
      else {
        nftStakeStepCount = nftStakeStepCount + 1;
        setNftStakeStep(nftStakeStepCount);
      }
    }
  }

  const closeStaking = async () => {
    setNftStakeStep(0);
    setStakedNft(null);
    setStakedCity("");
    setShowStaking(false);
  }

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
      getWhitelistAccounts();
      getNFTs();
      getStakedNfts();
      getFarms();
      getFarmers();
      getTimeToMInt();
    }, 900);
  }, [
    anchorWallet,
    props.magicHatId,
    props.connection,
    refreshMagicHatState,
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
      props.connection,
      wallet_t,
      anchor.Provider.defaultOptions()
    );
    const idl_o: any = idl;
    return new Program(idl_o, MAGIC_HAT_PROGRAM_V2_ID, provider);
  };

  const findFarmAuthorityPDA = async (farm: PublicKey) => {
    return PublicKey.findProgramAddress([farm.toBytes()], MAGIC_STAKE_PROGRAM_ID);
  };

  const findFarmTreasuryPDA = (farm: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('treasury'), farm.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const findRewardsPotPDA = (farm: PublicKey, rewardMint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('reward_pot'), farm.toBytes(), rewardMint.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const funderToAuthorizePDA = (farm: PublicKey, funder_to_authorize: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('authorization'), farm.toBytes(), funder_to_authorize.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const farmerPDA = (farm: PublicKey, farmer: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('farmer'), farm.toBytes(), farmer.toBytes()],
      MAGIC_STAKE_PROGRAM_ID
    );
  };

  const farmerVaultPDA = (bank: PublicKey, creator: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('vault'), bank.toBytes(), creator.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const gemBoxPda = (vault: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('gem_box'), vault.toBytes(), gem_mint.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const gemDepositBoxPda = (vault: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('gem_deposit_receipt'), vault.toBytes(), gem_mint.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const gemBoxRarityPda = (bank: PublicKey, gem_mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('gem_rarity'), bank.toBytes(), gem_mint.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };
  
  const vaultAuthorityPda = (valut: PublicKey) => {
    return PublicKey.findProgramAddress(
      [valut.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };
  
  const whitelistProofPda = (bank: PublicKey, address_to_whitelist: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('whitelist'),bank.toBytes(), address_to_whitelist.toBytes()],
      GEM_BANK_PROGRAM_ID
    );
  };

  const tokenMetadataPda = (mint: PublicKey) => {
    return PublicKey.findProgramAddress(
      [Buffer.from('metadata'),TOKEN_METADATA_PROGRAM_ID.toBytes(), mint.toBytes()],
      TOKEN_METADATA_PROGRAM_ID
    );
  };



  async function getStakedNfts() {
    if (wallet && wallet.connected) {
      const bankProgram = await getBankProgram(wallet);
      // const [farmerVaultPda] = await farmerVaultPDA(
      //   farms.bank,
      //   wallet.publicKey!
      // );
      const gdprs:any = await bankProgram.account.gemDepositReceipt.all();
      // console.log(gdprs);
      var array:any = [];
      for (let index = 0; index < gdprs.length; index++) {
        const element = gdprs[index];
        const connection = new Connection(clusterApiUrl("devnet"));
        const metaplex = new Metaplex(connection);
        let nft = await metaplex.nfts().findByMint(element.account.gemMint).run();
        if (nft.updateAuthorityAddress == new PublicKey("2LpGioZAG2GkzBpTye4e3jqQWiEL7mFBo74B6yvCmTaw") && nft.creators[0].address == new PublicKey("BNZy4DXcGZRpkkgnQn5nfqnkMPjjh7NLk1KBTe8qqtmZ")) {
          var xhr = new XMLHttpRequest();
          xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
              var obj:any = {
                name: nft.name,
                link: JSON.parse(this.responseText).image,
              }
              // console.log(obj);
              array.push(obj);
            }
          });
          xhr.open("GET", nft.uri);
          xhr.send();
        }
      }
      if (array && array.length > 0) {
        setStakedNfts(array);
        // setStakedTokens(array.length * 100);
        // setRespectEarned(array.length * 100);
        // setMultiplierLevel(array.length);
      }
    }
  }

  

  // Farm Manager Should call this

  // Farm Manager Should call this


  const closeFarming = async () => {
    setShowFarming(false);
    setFunderOne('');
    setFunderTwo('');
    setFunderThree('');
    setFunderFour('');
    setFunderFive('');
  }

  // Farm Manager should call this

  const getFarmers = async () => {
    if(wallet && wallet.connected) {
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const [humanFarmerVar] = await farmerPDA(
          HUMANS_FARM_ID,
          wallet.publicKey!
        );
        const farmersHuman:any = await stakeProgram.account.farmer.fetch(humanFarmerVar);
        if (farmersHuman != null) {
          console.log('Farmer ');
          console.log(farmersHuman);
          setStakedTokens(farmersHuman.gemsStaked!.toNumber());
          setRespectEarned(farmersHuman.lpPoints.lpAccrued.toNumber());
          setMultiplierLevel(farmersHuman.lpPoints.lpLevel.toNumber());
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
        const farmersHumanPets:any = await stakeProgram.account.farmer.fetch(humanPetsFarmerVar);
        if (farmersHumanPets != null) {
          console.log('Farmer ');
          console.log(farmersHumanPets);
          setStakedTokens(farmersHumanPets.gemsStaked!.toNumber());
          setRespectEarned(farmersHumanPets.lpPoints.lpAccrued.toNumber());
          setMultiplierLevel(farmersHumanPets.lpPoints.lpLevel.toNumber());
          setFarmerHumanPet(farmersHumanPets);
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
        const farmersCyborg:any = await stakeProgram.account.farmer.fetch(cyborgFarmerVar);
        if (farmersCyborg != null) {
          console.log('Farmer ');
          console.log(farmersCyborg);
          setStakedTokens(farmersCyborg.gemsStaked!.toNumber());
          setRespectEarned(farmersCyborg.lpPoints.lpAccrued.toNumber());
          setMultiplierLevel(farmersCyborg.lpPoints.lpLevel.toNumber());
          setFarmerCyborg(farmersCyborg);
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
        const farmersCyborgPets:any = await stakeProgram.account.farmer.fetch(cyborgPetFarmerVar);
        if (farmersCyborgPets != null) {
          console.log('Farmer ');
          console.log(farmersCyborgPets);
          setStakedTokens(farmersCyborgPets.gemsStaked!.toNumber());
          setRespectEarned(farmersCyborgPets.lpPoints.lpAccrued.toNumber());
          setMultiplierLevel(farmersCyborgPets.lpPoints.lpLevel.toNumber());
          setFarmerCyborgPet(farmersCyborgPets);
        }
      } catch (error) {
        setStakedTokens(0);
        setRespectEarned(0);
        setMultiplierLevel(0);
        setFarmerCyborgPet(null);
      }

      try {
        const [basementFarmerVar] = await farmerPDA(
          BASEMENT_FARM_ID,
          wallet.publicKey!
        );
        const farmersBasement:any = await stakeProgram.account.farmer.fetch(basementFarmerVar);
        if (farmersBasement != null) {
          console.log('Farmer ');
          console.log(farmersBasement);
          setStakedTokens(farmersBasement.gemsStaked!.toNumber());
          setRespectEarned(farmersBasement.lpPoints.lpAccrued.toNumber());
          setMultiplierLevel(farmersBasement.lpPoints.lpLevel.toNumber());
          setFarmerBasement(farmersBasement);
        }
      } catch (error) {
        setStakedTokens(0);
        setRespectEarned(0);
        setMultiplierLevel(0);
        setFarmerBasement(null);
      }
    }
  }

  const getFarms = async () => {
    if(wallet && wallet.connected) {
      const stakeProgram = await getStakeProgram(wallet);
      try {
        const humanFarmVar:any = await stakeProgram.account.farm.fetch(HUMANS_FARM_ID);
        // console.log('Humans Farm');
        // console.log(humanFarmVar);
        setHumanFarm(humanFarmVar);
      } catch (error) {
        setHumanFarm(null);
      }
      try {
        const humanPetsFarmVar:any = await stakeProgram.account.farm.fetch(HUMANPETS_FARM_ID);
        // console.log('Human Pets Farm ');
        // console.log(humanPetsFarmVar);
        setHumanPetsFarm(humanPetsFarmVar);
      } catch (error) {
        setHumanPetsFarm(null);
      }
      try {
        const cyborgFarmVar:any = await stakeProgram.account.farm.fetch(CYBORG_FARM_ID);
        // console.log('Cyborgs Farm ');
        // console.log(cyborgFarmVar);
        setCyborgFarm(cyborgFarmVar);
      } catch (error) {
        setCyborgFarm(null);
      }
      try {
        const cyborgPetFarmVar:any = await stakeProgram.account.farm.fetch(CYBORGPET_FARM_ID);
        // console.log('Cyborg Pets Farm ');
        // console.log(cyborgPetFarmVar);
        setCyborgPetFarm(cyborgPetFarmVar);
      } catch (error) {
        setCyborgPetFarm(null);
      }
    }
  }

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
  
      let tokenAmount = await connection.getTokenAccountBalance(ata);
      setGlitchTokenVal(parseInt(tokenAmount.value.amount));
      setAlphaTokenVal(parseInt(tokenAmount.value.amount));
      console.log(`amount: ${tokenAmount.value.amount}`);
      console.log(`decimals: ${tokenAmount.value.decimals}`);
      const metaplex = Metaplex.make(connection);
      const allNfts = await metaplex
                          .nfts()
                          .findAllByOwner({ owner: wallet?.publicKey! })
                          .run();
      let temp_nfts:any = [];
      console.log(allNfts);
      for (let index = 0; index < allNfts.length; index++) {
        const nft:any = allNfts[index];
        var creators = nft.creators;
        var is_ours = false;
        // console.log(nft.updateAuthorityAddress.toBase58(), nft.name);
        if (nft.updateAuthorityAddress.toBase58() == "TnCyU9sKGpStvmPkGDMxfSSyjTnE7Ad6eNDcUdGyxoq") {
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
          xhr.addEventListener("readystatechange", function() {
            if(this.readyState === 4) {
              // console.log(this.responseText);
              var attributes = JSON.parse(this.responseText).attributes;
              var is_human;
              var is_cyborg;
              var is_pet;
              var trait_type;
              for (let index = 0; index < attributes.length; index++) {
                const element = attributes[index];
                if (element.trait_type == 'BaseBody' && element.value == 'Human') {
                  is_human = true;
                }
                else if (element.trait_type == 'BaseBody' && element.value == 'Cyborg') {
                  is_cyborg = true;
                }
                if (element.trait_type == 'Pets' && element.value && element.value.length > 0) {
                  is_pet = true;
                }
              }
              if (is_human && is_pet) {
                trait_type = 'Human Pet';
              }
              else if (is_cyborg && !is_pet) {
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
  }

  // Farmer should call this
  const initFixedFarmerInst = async (id:any,stake_instructions:any, stakeProgram:any) => {
    let farm_id:any;
    if (id == 1) {
      farm_id = HUMANS_FARM_ID;
    }
    else if (id == 4) {
      farm_id = CYBORGPET_FARM_ID;
    }
    else if (id == 5) {
      farm_id = BASEMENT_FARM_ID;
    }
    if (id == 1) {
      const [farmerPda] = await farmerPDA(
        farm_id,
        wallet.publicKey!
      );
      const farms:any =
        await stakeProgram.account.farm.fetch(farm_id);
      console.log('farm with ' + farm_id.toBase58());
      const [farmerVaultPda] = await farmerVaultPDA(
        farms.bank,
        wallet.publicKey!
      );
      stake_instructions.push(stakeProgram.instruction.initFixedFarmer(
        {
          accounts: {
            farm: farm_id,
            farmer: farmerPda,
            identity: wallet.publicKey,
            bank: farms.bank,
            vault: farmerVaultPda,
            gemBank: GEM_BANK_PROGRAM_ID,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          }
        }
      ));
      return stake_instructions;
    }
    else if (id == 2) {
      const [farmerPda] = await farmerPDA(
        FARM_ID,
        wallet.publicKey!
      );
      const farms:any =
        await stakeProgram.account.farm.fetch(FARM_ID);
      console.log('farm with ' + FARM_ID.toBase58());
      const [farmerVaultPda] = await farmerVaultPDA(
        farms.bank,
        wallet.publicKey!
      );
      stake_instructions.push(stakeProgram.instruction.initFixedFarmer(
        {
          accounts: {
            farm: FARM_ID,
            farmer: farmerPda,
            identity: wallet.publicKey,
            bank: farms.bank,
            vault: farmerVaultPda,
            gemBank: GEM_BANK_PROGRAM_ID,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          }
        }
      ));
      return stake_instructions;
    }
  }

  //Farmer should call this
  const initFixedFarmerAlpha = async (id:any,stake_instructions:any, stakeProgram:any) => {
    let farm_id:any;
    if (id == 1) {
      farm_id = HUMANS_FARM_ID;
    }
    else if (id == 2) {
      farm_id = HUMANPETS_FARM_ID;
    }
    else if (id == 3) {
      farm_id = CYBORG_FARM_ID;
    }
    else if (id == 4) {
      farm_id = CYBORGPET_FARM_ID;
    }
    const [farmerPda] = await farmerPDA(
      farm_id,
      wallet.publicKey!
    );
    const farms:any =
      await stakeProgram.account.farm.fetch(farm_id);
    console.log('farm with ' + farm_id.toBase58());
    const [farmerVaultPda] = await farmerVaultPDA(
      farms.bank,
      wallet.publicKey!
    );
    stake_instructions.push(stakeProgram.instruction.initFarmerAlpha(
      {
        accounts: {
          farm: farm_id,
          farmer: farmerPda,
          identity: wallet.publicKey,
          bank: farms.bank,
          vault: farmerVaultPda,
          gemBank: GEM_BANK_PROGRAM_ID,
          payer: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        }
      }
    ));
    return stake_instructions;
  }

  // Farmer should call this
  const refreshFarmers = async () => {
    const stakeProgram = await getStakeProgram(wallet);
    const farmers = await stakeProgram.account.farmer.all();
    console.log(farmers);
    try {

      const [farmerPda, farmerBump] = await farmerPDA(
        FARM_ID,
        wallet.publicKey!
      );
      const farms:any = await stakeProgram.account.farm.fetch(FARM_ID);
      console.log('farm with ' + FARM_ID.toBase58());
      const wallet_create = await stakeProgram.rpc.refreshFarmerAlpha(farmerBump,
        {
          accounts: {
            farm: FARM_ID,
            farmer: farmerPda,
            identity: wallet.publicKey
          }
        }
      );
      getFarmers();
      console.log('refresh farmer signature : ' + wallet_create);
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  }

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
      const farms:any =
        await stakeProgram.account.farm.fetch(FARM_ID);
      console.log('farm with ' + FARM_ID.toBase58());
      const wallet_create = await stakeProgram.rpc.refreshFarmerSignedAlpha(farmerBump,true,
        {
          accounts: {
            farm: FARM_ID,
            farmer: farmerPda,
            identity: wallet.publicKey
          }
        }
      );
      getFarmers();
      console.log('refresh farmer signed signature : ' + wallet_create);
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  }

  // Farmer should call this
  const initProbableFarmerInst = async (id:any,stake_instructions:any, stakeProgram:any) => {
    let farm_id:any;
    if (id == 2) {
      farm_id = HUMANPETS_FARM_ID;
    }
    else if (id == 3) {
      farm_id = CYBORG_FARM_ID;
    }
    // console.log(farmers);
    try {
      const [farmerPda] = await farmerPDA(
        farm_id,
        wallet.publicKey!
      );
      const farms:any =
        await stakeProgram.account.farm.fetch(farm_id);
      console.log('farm with ' + farm_id.toBase58());
      const [farmerVaultPda] = await farmerVaultPDA(
        farms.bank,
        wallet.publicKey!
      );
      // console.log(JSON.parse(farms).bank);
      stake_instructions.push(await stakeProgram.rpc.initProbableFarmer(
        {
          accounts: {
            farm: farm_id,
            farmer: farmerPda,
            identity: wallet.publicKey,
            bank: farms.bank,
            vault: farmerVaultPda,
            gemBank: GEM_BANK_PROGRAM_ID,
            payer: wallet.publicKey,
            systemProgram: SystemProgram.programId,
          }
        }
      ));
      return stake_instructions;
    } catch (error) {
      console.log("Transaction error: ", error);
      return stake_instructions;
    }
  }

  // Farmer should call this

  // Farmer should call this

  // Farm Manager should call this
  const addRaritiesToBank = async () => {
    if (nftMint && nftMint.length > 0) {
      const nft_mint = new PublicKey(nftMint);
      try {
        const stakeProgram = await getStakeProgram(wallet);
        const farmers = await stakeProgram.account.farmer.all();
        console.log(farmers);
        try {
          const [farmerPda, farmerBump] = await farmerPDA(
            FARM_ID,
            wallet.publicKey!
          );
          let nft;
          if (stakedNft) {
            nft = stakedNft;
          }
          else {
            nft = nfts[0];
          }
          const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(FARM_ID);
          const farms:any = await stakeProgram.account.farm.fetch(FARM_ID);
          console.log('farm with ' + FARM_ID.toBase58());
          const rarityConfig: RarityConfig = {
            mint: nft_mint,
            rarityPoints: new BN(1)
          }
          const rarityConfigs = [rarityConfig];
          const remainingAccounts = [];
          const [gemRarity] = await gemBoxRarityPda(farms.bank, nft_mint);
          //add mint
          remainingAccounts.push({
            pubkey: nft_mint,
            isWritable: false,
            isSigner: false,
          });
          //add rarity pda
          remainingAccounts.push({
            pubkey: gemRarity,
            isWritable: true,
            isSigner: false,
          });
          const wallet_create = await stakeProgram.rpc.addRaritiesToBank(farmAuthBump,rarityConfigs,
            {
              accounts: {
                farm: FARM_ID,
                farmManager: farms.farmManager,
                farmAuthority: farmAuth,
                bank: farms.bank,
                gemBank: GEM_BANK_PROGRAM_ID,
                farmer: farmerPda,
                systemProgram: SystemProgram.programId
              },
              remainingAccounts
            }
          );
          getFarmers();
          setAlertState({
            open: true,
            message: "Rarities has been added to the NFT",
            severity: "success",
          });
          console.log('add rarities to bank signature : ' + wallet_create);
        } catch (error) {
          console.log("Transaction error: ", error);
        }
      } catch (error) {
        setAlertState({
          open: true,
          message: "NFT Mint is not a valid Public key",
          severity: "error",
        });
      }
    }
    else {
      setAlertState({
        open: true,
        message: "NFT Mint is empty",
        severity: "error",
      });
    }
  }

  // Complete Staking NFT
  const completeStake = async () => {
    // let tokens = await getStakedNfts();
    var add_init_human = true;
    var add_init_human_pets = true;
    var add_init_cyborg = true;
    var add_init_cyborg_pets = true;
    var add_init_basement = true;
    if (farmerHuman! != null) {
      add_init_human = false;
    }
    else if (farmerHumanPet! != null) {
      add_init_human_pets = false;
    }
    else if (farmerCyborg! != null) {
      add_init_cyborg = false;
    }
    else if (farmerCyborgPet! != null) {
      add_init_cyborg_pets = false;
    }
    else if (farmerBasement! != null) {
      add_init_basement = false;
    }
    if (stakedNft) {
      let farm_id:any;
        if (stakedNft.trait_type == 'Human') {
          farm_id = HUMANS_FARM_ID;
        }
        else if (stakedNft.trait_type == 'Human Pet') {
          farm_id = HUMANPETS_FARM_ID;
        }
        else if (stakedNft.trait_type == 'Cyborg') {
          farm_id = CYBORG_FARM_ID;
        }
        else if (stakedNft.trait_type == 'Cyborg Pet') {
          farm_id = CYBORGPET_FARM_ID;
        }
        let stake_instructions:any = [];
        const stakeProgram:any = await getStakeProgram(wallet);
        const bankProgram = await getBankProgram(wallet);
        // let tokens = await getTokensByOwner(wallet.publicKey!);
        const farmers = await stakeProgram.account.farmer.all();
        if (add_init_human && stakedNft.trait_type == 'Human') {
          stake_instructions = await initFixedFarmerAlpha(1,stake_instructions,stakeProgram);
        }
        else if (add_init_basement && stakedNft.trait_type == 'Human Pet') {
          stake_instructions = await initFixedFarmerAlpha(2,stake_instructions,stakeProgram);
        }
        else if (add_init_cyborg && stakedNft.trait_type == 'Cyborg') {
          stake_instructions = await initFixedFarmerAlpha(3,stake_instructions,stakeProgram);
        }
        else if (add_init_human_pets && stakedNft.trait_type == 'Cyborg Pet') {
          stake_instructions = await initFixedFarmerAlpha(4,stake_instructions,stakeProgram);
        }
        const [farmerPda, farmerBump] = await farmerPDA(
          farm_id,
          wallet.publicKey!
        );
        const farms:any = await stakeProgram.account.farm.fetch(farm_id);
        const [farmerVaultPda, farmerVaultBump] = await farmerVaultPDA(
          farms.bank,
          wallet.publicKey!
        );
        let nft;
        if (stakedNft) {
          nft = stakedNft;
        }
        else {
          nft = nfts[0];
        }
        const vaults = await bankProgram.account.vault.all();
        // console.log(vaults[0].account.authoritySeed.toBase58());
        const [gemBoxPdaVal] = await gemBoxPda(
          farmerVaultPda,
          new PublicKey(nft.mint)
        );
        const [gemDepositBoxPdaVal] = await gemDepositBoxPda(
          farmerVaultPda,
          new PublicKey(nft.mint)
        );
        const [gemBoxRarityPdaVal, gemBoxrarityBump] = await gemBoxRarityPda(
          farms.bank,
          new PublicKey(nft.mint)
        );
        const [vaultAuthorityPdaVal, vaultAuthorityBump] = await vaultAuthorityPda(
          farmerVaultPda
        );
        const gem_mint = new PublicKey(nft.mint);
        // const address_to_whitelist = new PublicKey(collectionId);
        // const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
        const [mintWhitelistProofPdaVal] = await whitelistProofPda(farms.bank,new PublicKey(nft.mint));
        const [creatorWhitelistProofPdaVal] = await whitelistProofPda(farms.bank,new PublicKey(nft.creator));
        const gem_source_old = await findAssociatedTokenAddress(wallet.publicKey!,new PublicKey(nft.mint));
        const gem_source_obj = await props.connection.getParsedTokenAccountsByOwner(wallet.publicKey!, {
          mint: new PublicKey(nft.mint),
        });
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
        stake_instructions.push(await stakeProgram.instruction.flashDepositAlpha(farmerBump, vaultAuthorityBump,gemBoxrarityBump, new BN(1), 
          {
            accounts: {
              farm: farm_id,
              farmAuthority: farms.farmAuthority,
              farmer: farmerPda,
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
              gemBank: GEM_BANK_PROGRAM_ID
            },
            remainingAccounts
          }
        ));
        const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(farm_id);
        const address_to_whitelist = new PublicKey(collectionId);
        const [whitelistProofPdaVal] = await whitelistProofPda(farms.bank,address_to_whitelist);
        stake_instructions.push(stakeProgram.instruction.stakeAlpha(farmAuthBump, farmerBump, 
          {
            accounts: {
              farm: farm_id,
              farmAuthority: farms.farmAuthority,
              farmer: farmerPda,
              identity: wallet.publicKey,
              bank: farms.bank,
              vault: farmerVaultPda,
              gemBank: GEM_BANK_PROGRAM_ID,
              systemProgram: SystemProgram.programId,
            }
          }
        ));
        let tr = new Transaction();
        tr.add(stake_instructions);
        const complete_stake = await sendTransactions(
          props.connection,
          wallet,
          [stake_instructions],
          [[]]
        )
        console.log('complete stake signature ',complete_stake);
        nftStakeStepCount = nftStakeStepCount + 1;
        setNftStakeStep(nftStakeStepCount);
        var arr = stakedNfts;
        arr.push(stakedNft);
        setStakedNfts(arr);
        // setStakedTokens(stakedNfts.length * 100);
        // setRespectEarned(stakedNfts.length * 100);
        // setMultiplierLevel(stakedNfts.length);
    }
    else {
      setAlertState({
        open: true,
        message: "Select an NFT to stake",
        severity: "error",
      });
    }
  }

  // Farmer should call this

  // Farm Manager should call this

  // Farm Manager should call this

  // Farmer should call this

  // Farmer should call this
  const UnStakeNft = async () => {
    const stakeProgram = await getStakeProgram(wallet);
    const [farmerPda, farmerBump] = await farmerPDA(
      FARM_ID,
      wallet.publicKey!
    );
    const farmers = await stakeProgram.account.farmer.all();
    try {
      const [farmAuth, farmAuthBump] = await findFarmAuthorityPDA(FARM_ID);
      const farms:any = await stakeProgram.account.farm.fetch(FARM_ID);
      let nft;
      if (stakedNft) {
        nft = stakedNft;
      }
      else {
        nft = nfts[0];
      }
      const [farmerPda, farmerBump] = await farmerPDA(
        FARM_ID,
        wallet.publicKey!
      );
      const [farmerVaultPda, farmerVaultBump] = await farmerVaultPDA(
        farms.bank,
        wallet.publicKey!
      );
      const [farmTreasury, farmTreasuryBump] = await findFarmTreasuryPDA(
        FARM_ID
      );
      const [farmTreasuryToken, farmTreasuryTokenBump] = await findFarmTreasuryTokenPDA(FARM_ID);
      const wallet_create = await stakeProgram.rpc.unstakeAlpha(farmAuthBump, farmTreasuryTokenBump, farmerBump, false,
        {
          accounts: {
            farm: FARM_ID,
            farmAuthority: farms.farmAuthority,
            farmTreasuryToken: farmTreasuryToken,
            farmer: farmerPda,
            identity: wallet.publicKey,
            bank: farms.bank,
            vault: farmerVaultPda,
            gemBank: GEM_BANK_PROGRAM_ID,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: SystemProgram.programId,
          }
        }
      );
      console.log('unstake signature : ' + wallet_create);
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  }

  const showTeamInfoHover = async (id: any) => {
    setShowTeamInfo(true);
    setTeamInfoMember(id);
  };

  const closeMenu = async (id: any) => {
    if (id && id === "VAULT") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setClassNameState("main-vault-room-door");
    } else if (id && id === "TEAM") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setShowTeamRoom(true);
      setClassNameState("main-team-room-door");
    } else if (id && id === "ALPHA") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setShowAlphaRoom(true);
      setClassNameState("main-alpha-room-door");
    } else if (id && id === "STAKE") {
      setShowMobileDoor(true);
      setMobileDoor(id);
      setMenuOpen(false);
      setShowStakeRoom(true);
      setClassNameState("main-stake-room-door");
    } else {
      setMenuOpen(false);
    }
  };

  const closeAlphaRoom = async () => {
    var n = "";
    if (mobileDoor === "VAULT") {
      n = "main-vault-room-door";
    } else if (mobileDoor === "ALPHA") {
      n = "main-alpha-room-door";
    } else if (mobileDoor === "TEAM") {
      n = "main-team-room-door";
    } else if (mobileDoor === "STAKE") {
      n = "main-stake-room-door";
    }
    if (showMobileDoor) {
      setClassNameState(n);
      setLogoAlphaLoading(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowTeamRoom(false);
      setShowMobileDoor(true);
    } else {
      setClassNameState("main-bg-after-door-open");
      setLogoAlphaLoading(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowTeamRoom(false);
    }
  };



  const createWhitelistConfig = async () => {
    try {
      const [whitelist_config_pda, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(pdaWhitelistSeed), wallet.publicKey!.toBuffer()],
        MAGIC_HAT_PROGRAM_V2_ID
      );
      // let config_t:any = Borsh.struct(JSON.stringify(config));
      // return { whitelistConfigAccounts };
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  };

  const updateWhitelistConfig = async () => {
    try {
      const [whitelist_config_pda, bump] = await PublicKey.findProgramAddress(
        [Buffer.from(pdaWhitelistSeed), wallet.publicKey!.toBuffer()],
        MAGIC_HAT_PROGRAM_V2_ID
      );
      // return { whitelistConfigAccounts };
    } catch (error) {
      console.log("Transaction error: ", error);
    }
  };





  let currentWltype: String;

  const getTimeToMInt = async () => {
    const date = new Date();
    const time: any = parseInt((date.getTime() / 1000).toFixed(0));
    if (time >= PUBLIC_TIME) {
      setCurrentWl("PUBLIC");
      currentWltype = "PUBLIC";
    } else if (time >= WL_TIME) {
      setCurrentWl("WL");
      currentWltype = "WL";
    } else if (time >= GOG_TIME) {
      setCurrentWl("GOG + OG");
      currentWltype = "GOG + OG";
    } else if (time >= COMMUNITY_TIME) {
      setCurrentWl("COMMUNITY");
      currentWltype = "COMMUNITY";
    }
    if (currentWltype == "PUBLIC") {
      return "";
    } else {
      if (currentWltype == "COMMUNITY") {
        const date = new Date();
        const time: any = parseInt((date.getTime() / 1000).toFixed(0));
        var delta = Math.abs(time - GOG_TIME);
        if (delta <= 0) {
          setCurrentWl("GOG + OG");
          currentWltype = "GOG + OG";
        }
        let days: any = Math.floor(delta / 86400);
        delta -= days * 86400;
        let hours: any = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        let minutes: any = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        let seconds: any = delta % 60;
        hours = Math.abs(hours);
        if (days < 10) {
          days = "0" + days;
        }
        if (hours < 10) {
          hours = "0" + hours;
        }
        minutes = Math.abs(minutes);
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        seconds = Math.abs(seconds);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        setTime(hours + ":" + minutes + ":" + seconds);
      } else if (currentWltype == "GOG + OG") {
        const date = new Date();
        const time: any = parseInt((date.getTime() / 1000).toFixed(0));
        delta = Math.abs(time - WL_TIME);
        if (delta <= 0) {
          setCurrentWl("WL");
          currentWltype = "WL";
        }
        let days: any = Math.floor(delta / 86400);
        delta -= days * 86400;
        let hours: any = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        let minutes: any = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        let seconds: any = delta % 60;
        hours = Math.abs(hours);
        if (days < 10) {
          days = "0" + days;
        }
        if (hours < 10) {
          hours = "0" + hours;
        }
        minutes = Math.abs(minutes);
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        seconds = Math.abs(seconds);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        setTime(hours + ":" + minutes + ":" + seconds);
      } else if (currentWltype == "WL") {
        const date = new Date();
        const time: any = parseInt((date.getTime() / 1000).toFixed(0));
        delta = Math.abs(time - PUBLIC_TIME);
        if (delta <= 0) {
          setCurrentWl("PUBLIC");
          currentWltype = "PUBLIC";
        }
        let days: any = Math.floor(delta / 86400);
        delta -= days * 86400;
        let hours: any = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        let minutes: any = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        let seconds: any = delta % 60;
        hours = Math.abs(hours);
        if (days < 10) {
          days = "0" + days;
        }
        if (hours < 10) {
          hours = "0" + hours;
        }
        minutes = Math.abs(minutes);
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        seconds = Math.abs(seconds);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        setTime(hours + ":" + minutes + ":" + seconds);
      } else if (currentWl == "PUBLIC") {
        setTime("");
      } else {
        const date = new Date();
        const time: any = parseInt((date.getTime() / 1000).toFixed(0));
        delta = Math.abs(time - COMMUNITY_TIME);
        if (delta <= 0) {
          setCurrentWl("COMMUNITY");
          currentWltype = "COMMUNITY";
        }
        let days: any = Math.floor(delta / 86400);
        delta -= days * 86400;
        let hours: any = Math.floor(delta / 3600) % 24;
        delta -= hours * 3600;
        let minutes: any = Math.floor(delta / 60) % 60;
        delta -= minutes * 60;
        let seconds: any = delta % 60;
        hours = Math.abs(hours);
        if (days < 10) {
          days = "0" + days;
        }
        if (hours < 10) {
          hours = "0" + hours;
        }
        minutes = Math.abs(minutes);
        if (minutes < 10) {
          minutes = "0" + minutes;
        }
        seconds = Math.abs(seconds);
        if (seconds < 10) {
          seconds = "0" + seconds;
        }
        setTime(hours + ":" + minutes + ":" + seconds);
      }
    }
  };



  const closeForm = async () => {
    setClassNameState("main-bg-after-door-open");
    setShowAlphaRoom(false);
    setShowTeamRoom(false);
    setShowStakeRoom(false);
    setShowMobileDoor(false);
  };

  const handleMobileHome = async () => {
    if (showAlphaRoom || showTeamRoom || showStakeRoom) {
      closeAlphaRoom();
    } else {
      closeForm();
    }
  };

  const openMenu = async () => {
    setMenuOpen(true);
  };

  const openStakeRoom = async (id:any) => {
    setCurrentStakeRoom(id);
    setShowStakeCity(true);
  };

  const closeStakeCity = async () => {
    setShowStakeCity(false);
    setShowStaking(false);
  };

  const closeFixedStaking =async () => {
    setClassNameState("alphazen-room");
    setLogoAlphaLoading(false);
    setShowAlphaRoom(false);
    setShowTeamRoom(false);
    setShowStakeRoom(true);
    setShowMobileDoor(false);
    setShowFixedStakingRoom(false);
  }

  const closeTokenSwapping =async () => {
    setClassNameState("alphazen-room");
    setLogoAlphaLoading(false);
    setShowAlphaRoom(false);
    setShowTeamRoom(false);
    setShowStakeRoom(true);
    setShowMobileDoor(false);
    setShowFixedStakingRoom(false);
    setShowTokenSwapping(false);
  }

  const openFixedStaking = async (id:any) => {
    console.log('1');
    setClassNameState("main-bg-after-door-open black-bg");
    setLogoAlphaLoading(true);
    setTimeout(function () {
    setLogoAlphaLoading(false);
      setClassNameState("fixed-staking-room");
      setShowTeamRoom(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowMobileDoor(false);
      setShowFixedStakingRoom(true)
    }, 600);
  };

  const openTokenSwapping =async (params:any) => {
    setClassNameState("main-bg-after-door-open black-bg");
    setLogoAlphaLoading(true);
    setTimeout(function () {
    setLogoAlphaLoading(false);
      setClassNameState("token-swapping-room");
      setShowTeamRoom(false);
      setShowAlphaRoom(false);
      setShowStakeRoom(false);
      setShowMobileDoor(false);
      setShowFixedStakingRoom(false);
      setShowTokenSwapping(true);
    }, 600);
  }

  const mintToCheckedFn =async (params:any) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    let mint = new PublicKey('57vavPcanGNxm9WYVnWyDNiwofxGniQHmTTocAeco3dk');
    let ata = await getAssociatedTokenAddress(
      mint, // mint
      wallet?.publicKey! // owner
    );
    let tx:any = new Transaction().add(
      createMintToCheckedInstruction(
        mint, // mint
        ata, // receiver (sholud be a token account)
        wallet?.publicKey!, // mint authority
        1e15, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        8 // decimals
        // [signer1, signer2 ...], // only multisig account will use
      )
    )
    const sig_token = await sendTransaction(connection, wallet, tx.instructions, []);
    console.log(sig_token);
  }

  const createToken = async (params:any) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const alice = anchor.web3.Keypair.generate();
    const mint = anchor.web3.Keypair.generate();
    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.publicKey.toBytes());
    const [metadataPDA, _bump] = anchor.web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);
    const accounts:any = {
        metadata: metadataPDA,
        mint,
        mintAuthority: wallet.publicKey,
        payer: wallet.publicKey,
        updateAuthority: wallet.publicKey,
    }
    const dataV2:any = {
        name: "Fake USD Token",
        symbol: "FUD",
        uri: "https://shdw-drive.genesysgo.net/ArP7jjhVZsp7vkzteU7mpKA1fyHRhv4ZBz6gR7MJ1JTC/metadata.json",
        // we don't need that
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }  
    const args:any =  {
      updateMetadataAccountArgsV2: {
          data: dataV2,
          isMutable: true,
          updateAuthority: wallet.publicKey,
          primarySaleHappened: true
      }
    };
    let ata = await getAssociatedTokenAddress(
      mint.publicKey, // mint
      wallet?.publicKey! // owner
    );
    console.log(`ATA: ${ata.toBase58()}`);
    let tx:any = new Transaction().add(
      // create mint account
      SystemProgram.createAccount({
        fromPubkey: wallet?.publicKey!,
        newAccountPubkey: mint.publicKey,
        space: MINT_SIZE,
        lamports: await getMinimumBalanceForRentExemptMint(connection),
        programId: TOKEN_PROGRAM_ID,
      }),
      // init mint account
      createInitializeMintInstruction(
        mint.publicKey, // mint pubkey
        8, // decimals
        wallet?.publicKey!, // mint authority
        wallet?.publicKey! // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      ),
      createAssociatedTokenAccountInstruction(
        wallet?.publicKey!, // payer
        ata, // ata
        wallet?.publicKey!, // owner
        mint.publicKey // mint
      ),
      createMintToCheckedInstruction(
        mint.publicKey, // mint
        ata, // receiver (sholud be a token account)
        wallet?.publicKey!, // mint authority
        1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        8 // decimals
        // [signer1, signer2 ...], // only multisig account will use
      )
      // ,mpl.createUpdateMetadataAccountV2Instruction(accounts, args)
    );
    const sig_token = await sendTransaction(connection, wallet, tx.instructions, [mint]);
    console.log(sig_token);
    console.log(mint.publicKey.toBase58());
    // const myKeypair = loadWalletKey("AndXYwDqSeoZHqk95TUC1pPdp93musGfCo1KztNFNBhd.json");
  }

  const openAlphaRoom = async (key:string) => {
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
      } 
      // else if (mobileDoor === "TEAM") {
      //   setClassNameState("main-bg-after-door-open black-bg");
      //   setLogoAlphaLoading(true);
      //   setTimeout(function () {
      //     setLogoAlphaLoading(false);
      //     setClassNameState("team-room");
      //     setShowTeamRoom(true);
      //     setShowAlphaRoom(false);
      //     setShowStakeRoom(false);
      //     setShowMobileDoor(false);
      //   }, 600);
      // }
      else if (mobileDoor === "STAKE") {
        setClassNameState("main-bg-after-door-open black-bg");
        setLogoAlphaLoading(true);
        setTimeout(function () {
          setLogoAlphaLoading(false);
          setClassNameState("team-room");
          setShowTeamRoom(false);
          setShowAlphaRoom(false);
          setShowStakeRoom(true);
          setShowMobileDoor(false);
        }, 600);
      }
      else {
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
      if (key == 'alpha') {
        setClassNameState("main-bg-after-door-open black-bg");
        setLogoAlphaLoading(true);
        setTimeout(function () {
          setClassNameState("alpha-room");
          setLogoAlphaLoading(false);
          setShowAlphaRoom(true);
          setShowStakeRoom(false);
          setShowMobileDoor(false);
        }, 600);
      }
      // else if (key == 'team') {
      //   setClassNameState("main-bg-after-door-open black-bg");
      //   setLogoAlphaLoading(true);
      //   setTimeout(function () {
      //     setClassNameState("team-room");
      //     setLogoAlphaLoading(false);
      //     setShowAlphaRoom(false);
      //     setShowTeamRoom(true);
      //     setShowStakeRoom(false);
      //     setShowMobileDoor(false);
      //   }, 600);
      // }
      else if (key == 'stake') {
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
        setTimeout(function() {
          if (roomOneInfoClass == "stake-room-info-one") {
            setRoomOneInfoClass("stake-room-info-one flip");
          }
          else {
            setRoomOneInfoClass("stake-room-info-one");
          }
          if (roomTwoInfoClass == "stake-room-info-one") {
            setRoomTwoInfoClass("stake-room-info-one flip");
          }
          else {
            setRoomTwoInfoClass("stake-room-info-one");
          }
          if (roomThreeInfoClass == "stake-room-info-one") {
            setRoomThreeInfoClass("stake-room-info-one flip");
          }
          else {
            setRoomThreeInfoClass("stake-room-info-one");
          }
          if (roomFourInfoClass == "stake-room-info-one") {
            setRoomFourInfoClass("stake-room-info-one flip");
          }
          else {
            setRoomFourInfoClass("stake-room-info-one");
          }
          if (roomFiveInfoClass == "stake-room-info-one") {
            setRoomFiveInfoClass("stake-room-info-one flip");
          }
          else {
            setRoomFiveInfoClass("stake-room-info-one");
          }
        },3000) 
      }
      else {
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

  const changeGlitchToken = async (val:any) => {
    setGlitchTokenVal(val);
    setAlphaTokenVal(val);
  };

  const swapFn =async (params:any) => {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    let mint = new PublicKey('57vavPcanGNxm9WYVnWyDNiwofxGniQHmTTocAeco3dk');
    let farm_manager = new PublicKey('UXX91ApKnrc1NyATPYqMJaDeJBQ3r9kSva1a4XTY3FD');
    let ata = await getAssociatedTokenAddress(
      mint, // mint
      wallet?.publicKey! // owner
    );
    let tx:any = new Transaction().add(
      createMintToCheckedInstruction(
        mint, // mint
        ata, // receiver (sholud be a token account)
        wallet?.publicKey!, // mint authority
        1e15, // amount. if your decimals is 8, you mint 10^8 for 1 token.
        8 // decimals
        // [signer1, signer2 ...], // only multisig account will use
      )
    )
    const sig_token = await sendTransaction(connection, wallet, tx.instructions, []);
    console.log(sig_token);
  }

  // const getFreeSol = async () => {
  //   var data = JSON.stringify({
  //     "jsonrpc": "2.0",
  //     "id": "eb5c5883-8d38-44cb-a7af-22ab62343a75",
  //     "method": "requestAirdrop",
  //     "params": [
  //       anchorWallet?.publicKey.toBase58(),
  //       1000000000
  //     ]
  //   });

  //   var xhr = new XMLHttpRequest();
  //   xhr.addEventListener("readystatechange", function() {
  //     if(this.readyState === 4) {
  //       setAlertState({
  //         open: true,
  //         message: '1 Sol transferred!',
  //         severity: 'success',
  //       });
  //     }
  //   });

  //   xhr.open("POST", "https://api.devnet.solana.com/");
  //   xhr.setRequestHeader("Content-Type", "application/json");

  //   xhr.send(data);
  // }

  return (
    <div id="main" className={classNameState}>
      <div id="wrapper">
        {isMobile && (
          //  <CheeseburgerMenu isOpen={menuOpen} closeCallback={this.closeMenu.bind(this)}>
          //   <MenuContent closeCallback={this.closeMenu.bind(this)} />
          // </CheeseburgerMenu>
          <div></div>
        )}
        {logoLoading && !logoAlphaLoading && (
          <div className="logo-loader-parent">
            <img alt="Alpha-logo" src={LogoWhite} className="pulse-animation" />
          </div>
        )}
        {!logoLoading &&
          !showMobileDoor && 
          !logoAlphaLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div className="white-paper-div">
              <a
                href="https://secret-alpha.gitbook.io/glitch/"
                target="_blank"
                rel="noreferrer"
                className="white-paper-anchor"
              >
                {" "}
              </a>
            </div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div
              onClick={() => openAlphaRoom('stake')}
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
        {!logoLoading && isMobile && showMobileDoor && !logoAlphaLoading && (
          <div className="mobile-room-div" onClick={() => openAlphaRoom('')}></div>
        )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div
              onClick={() => showToaster(5)}
              className="vault-room-div"
            ></div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showTeamRoom &&
          !showStakeRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div
              onClick={() => openAlphaRoom('alpha')}
              className="alpha-room-div"
            ></div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div onClick={() => openAlphaRoom('team')} className="team-room-div"></div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div onClick={closeForm} className="alpha-logo-div"></div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !showMobileDoor && (
            <div className="hologram-div">
              {/* onClick={openUpdates} */}
              <div className="smaller-holo-updates">
                {currentWl == "" && (
                  <label className="typing-text">Mint</label>
                )}
                {(
                  // <div className="Top-connected red">
                  //   <WalletDialogButton className="Inside-Connect-btn">
                  //     Connect
                  //   </WalletDialogButton>
                  // </div>
                  <div className="Top-connected green">
                    <button
                      className={
                        shouldMint ? "Outside-Mint-btn" : "Outside-Mint-btn"
                      }
                      // onClick={openUpdates}
                    >
                      Minted Out
                    </button>
                  </div>
                )}
                {/* {wallet.connected && currentWl != "" && (
                  <div className="Top-connected green">
                    <button
                      className={
                        shouldMint ? "Outside-Mint-btn" : "Outside-Mint-btn"
                      }
                      onClick={openUpdates}
                    >
                      Mint
                    </button>
                  </div>
                )} */}
              </div>
            </div>
          )}
          
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !logoAlphaLoading &&
          !isMobile && <div className="hologram-setup-div"></div>}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div>
              <img
                alt="Katana"
                src={KatanaImage}
                // onClick={createWhitelistAccountMultiple}
                onClick={() => showToaster(2)}
                className="katana-image"
              ></img>
            </div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div>
              <img
                alt="Pizza"
                src={PizzaImage}
                onClick={() => showToaster(1)}
                className="pizza-image"
              ></img>
            </div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div>
              <img
                alt="Sopha"
                onClick={updateWhitelistConfig}
                src={Sopha}
                className="sopha-image"
              ></img>
            </div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div>
              <div
                className="bean-bag-click"
                onClick={() => showToaster(4)}
              ></div>
              <img
                alt="Bean-bag"
                src={Beanbag}
                className="bean-bag-image"
              ></img>
            </div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <video autoPlay={true} loop muted className="fan-spinning-image">
              <source
                src={FanSpinning}
                className="fan-spinning-image"
                type="video/mp4"
              ></source>
              <source
                src={FanSpinning}
                className="fan-spinning-image"
                type="video/mp4"
              ></source>
              Your browser does not support HTML5 video.
            </video>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !logoAlphaLoading &&
          !isMobile && (
            // <div onClick={setCollection} className="light-flicker-image"></div>
            <div className="light-flicker-image"></div>
          )}
        {!logoLoading &&
          !showAlphaRoom &&
          !showStakeRoom &&
          !showTeamRoom &&
          !logoAlphaLoading &&
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <img
              alt="Sider"
              src={SophaSider}
              onClick={() =>setShowFarming(true)}
              className="sopha-sider-image"
            ></img>
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
          !showFixedStakingRoom && !showTokenSwapping &&
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
          !showFixedStakingRoom && !showTokenSwapping &&
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
          !showFixedStakingRoom && !showTokenSwapping &&
          !isMobile && (
            <div className="close-stake-room" onClick={closeAlphaRoom}>
              <img alt="close" src={CloseAlpha} />
            </div>
          )}
        {showTeamRoom &&
          !logoAlphaLoading &&
          !logoLoading &&
          !showMobileDoor &&
          !showFixedStakingRoom && !showTokenSwapping &&
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
              Eyes all around. <span className="strikethrough">Sex</span> Genius
              Sells.
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
                    Eyes all around. <span className="strikethrough">Sex</span>{" "}
                    Genius Sells.
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
                    He sees, He makes, He thinks, He creates. No world is too
                    far.
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
        {showAlphaRoom && !showTeamRoom && !showStakeRoom && !logoAlphaLoading && !logoLoading && !showMobileDoor && (
          <div className="Backdrop-other">
            <div
              className="alpha-room-phil-one"
              onClick={openFirstPhilAlphaRoom}
            >
              <div className="smaller-alpha-updates">
                <label className="typing-text story-line">The Story</label>
              </div>
            </div>
          </div>
        )}
        {showFixedStakingRoom && (
          <div className="Backdrop-other">
            <div className="fixed-staking-main-bg">
              <div className="pull-left full-width">
                <div className="stake-logo-parent">
                  <img src={LogoWhite} className="stake-logo" alt="" />
                  <img src={CloseAlpha} onClick={closeFixedStaking} className="stake-close-logo" alt="" />
                </div>
                <div className="stake-progress">
                  <ProgressBar bgcolor={"#6a1b9a"} completed={63} />
                </div>
                <div className="staking-process-parent">
                  <div className="unstaked-nfts-div">
                    <div className="staking-nft-display">
                    <div className="nft-parent-div">
                      {nfts && nfts.length > 0 && nfts.map(function (item:any, i:any) {
                        return (
                          <div className="nft-div" style={{borderColor: stakedNft == item ? "white": "transparent"}} onClick={() => setStakedNft(item)}>
                            <img src={item.link} />
                            <label>{item.name}</label>
                            {/* <label>{item.trait_type}</label> */}
                          </div>
                        );
                      })}
                    </div>
                    {stakedNft && 
                    <div className="stake-button-div"> 
                      <button className="nft-select-button" onClick={nextStepStake}>Stake Now</button>
                    </div>}
                    </div>
                  </div>
                  <div className="staked-nfts-div">
                    <div className="staking-nft-display">

                    </div>
                  </div>
                </div>
              </div> 
            </div>
          </div>
        )}
        {!showAlphaRoom && !showTeamRoom && showStakeRoom && !logoAlphaLoading && !logoLoading && !showMobileDoor && (
          <div className="">
            <div className="raffle-cave">

            </div>
            <div className="token-swapping" onClick={openTokenSwapping}>

            </div>
            <div className="staking-portal">
              <div className="staking-portal-parent">
              
              </div>
              <div className="adventure-staking-div">

              </div>
              <div className="fixed-staking-div" onClick={openFixedStaking}>

              </div>
            </div>
            {!wallet.connected &&
            <div className="staking-room-six">
              <WalletDialogButton className="Connect-Wallet-btn" onClick={closeStaking}>
                Connect Wallet
              </WalletDialogButton>
            </div> 
            }
            {/* {wallet.connected &&
            <div className="staking-room-six" onClick={openStaking}>
              <button className="outside-stake-btn">Stake Now</button>
            </div> 
            } */}
          </div>
        )}
        {showTokenSwapping && (
          <div className="Backdrop-other">
            <div className="fixed-staking-main-bg">
              <div className="pull-left full-width">
                <img src={CloseAlpha} onClick={closeTokenSwapping} className="swap-close-logo" alt="" />
                <div className="swapping-process-parent">
                  <MintNewFungibleToken></MintNewFungibleToken>
                </div>
              </div> 
            </div>
          </div>
        )}
        {showStaking && (
          <div className="Backdrop-other-mint">
            <OutsideClickHandler onOutsideClick={closeStaking}>
              <div className="stake-room-opened">
                <img className="stake-close-image" onClick={closeStaking} src={Close} />
                {nftStakeStep == 0 && 
                <div className="pull-left full-width full-height">
                    <div className="stake-room-header">
                      <h2>NFT Selection</h2>
                    </div>
                    <div className="nft-parent-div">
                      {nfts && nfts.length > 0 && nfts.map(function (item:any, i:any) {
                        return (
                          <div className="nft-div" style={{borderColor: stakedNft == item ? "white": "transparent"}} onClick={() => setStakedNft(item)}>
                            <img src={item.link} />
                            <label>{item.name}</label>
                          </div>
                        );
                      })}
                    </div>
                    {stakedNft && 
                    <div className="stake-button-div"> 
                      <button className="nft-select-button" onClick={nextStepStake}>Next</button>
                    </div>
                    }
                </div>
                }
                {nftStakeStep == 1 && 
                <div className="pull-left full-width full-height">
                    <div className="nft-deal-div">
                      <h2 className="deal-finalizing-text">Finalizing the Deal</h2>
                    </div>
                </div>
                }
                {nftStakeStep == 2 && 
                <div className="pull-left full-width full-height">
                    <div className="nft-parent-div">
                      <h2 className="stake-congrats-header">Congratulations !!!</h2>
                      <label className="stake-congrats-text">Your {stakedNft.name} has been<br/>successfully staked in<br/>{stakedCity}</label>
                    </div>
                </div>
                }
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
                    Jesse, venture out into the wild post-apocalyptic cyberpunk
                    world of Alphazex, traveling through various cities,
                    meandering through multiple adventures, just to answer a
                    single question...
                  </label>
                  <label className="typing-text m-t-15">
                    Throughout the world of Alphazex, there is only one
                    safeplace, one haven for Jesse and his friends. It's the
                    Alpha hood.{" "}
                  </label>
                  <label className="typing-text m-t-15">
                    Originally, what was one of the biggest laboratories in the
                    world for AI research, Alpha Labs was destroyed in the world
                    wars that kept on occurring, The not-so-okay wars, the Creck
                    wars, the cult vs tribe wars, and the once grand building of
                    Alpha Labs was destroyed, or that's what people thought.
                  </label>
                  <label className="typing-text m-t-15">
                    Goverments and rulers came and went, and even though the
                    existence of autonomous organizations was banned, one group
                    thrived in the ruins of the same building that was thought
                    to not exist. This organisation was, Secret Alpha.
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
            <OutsideClickHandler onOutsideClick={() =>closeFarming()}>
              {wallet.connected && 
              <div className="bigger-holo">
                <div className="stake-room-farm">
                  <div className="gen-dashboard-scroller">
                    <CreateFungibleToken/>
                    <InitFarmAlpha/>
                    <FundRewardAlpha/>
                    <AddToBankWhitelist/>
                    <div className="gen-farm-stats">
                      <div className="gen-farm-stats-left">
                        <input className="authorize-funder-reward-input" placeholder="NFT Mint" value={nftMint} onChange={event => setNftMint(event.target.value)} />
                      </div>
                      <div className="gen-farm-stats-right">
                        <button className="Inside-Farm-btn" onClick={addRaritiesToBank}>Add Rarities to Bank</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              }
              {!wallet.connected &&
              <div className="bigger-holo">
                <div className="holo-updates">
                  <div className="mint-inside-div">
                    <WalletDialogButton className="Connect-Wallet-btn">
                      Connect Wallet
                    </WalletDialogButton>
                  </div>
                </div>
              </div>
              }
            </OutsideClickHandler>
          </div>
        )}
        {!logoLoading && logoAlphaLoading && (
          <div className="logo-loader-parent-alpha">
            <img alt="Alpha-logo" src={LogoWhite} className="pulse-animation" />
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
  );
};

export default Home;
