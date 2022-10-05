import { PublicKey, clusterApiUrl } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor"

export const MAGIC_HAT_CREATOR = new anchor.web3.PublicKey(
  "H18mLh2oW73KBqRZ53La54qBafEaXBm9bXVefhKnMfXH"
);

export const MAGIC_HAT_ID = new anchor.web3.PublicKey(
  "86Yz2W2gh8gyupVhGuX9VxhNV6JoGQqD3RZzixajc4TZ"
);

export const MAGIC_HAT_PROGRAM_V2_ID = new anchor.web3.PublicKey(
  "JBw14YzhNTQGqUX54MatDgxDrCPopKf4EGcJHoHfq5ha"
);

export const FARM_ID = new anchor.web3.PublicKey("78yzdAb2quRrZWgQi114jdJrsroscWfV3AdVDQYsTFt8");

export const MAHANOTHIA_FARM_ID = new anchor.web3.PublicKey("9oc6wxJwAkiB3rj6rSniAJYmtNbVjKmZkj4dLY7CjYvm");

export const SAN_CHETOS_FARM_ID = new anchor.web3.PublicKey("78yzdAb2quRrZWgQi114jdJrsroscWfV3AdVDQYsTFt8");

export const MAGNEXIA_FARM_ID = new anchor.web3.PublicKey("78yzdAb2quRrZWgQi114jdJrsroscWfV3AdVDQYsTFt8");

export const RAUDCHERI_FARM_ID = new anchor.web3.PublicKey("78yzdAb2quRrZWgQi114jdJrsroscWfV3AdVDQYsTFt8");

export const BASEMENT_FARM_ID = new anchor.web3.PublicKey("78yzdAb2quRrZWgQi114jdJrsroscWfV3AdVDQYsTFt8");



export const REWARD_MINT = new anchor.web3.PublicKey('x4zmbszSajZe8Qg8H1J9s1hMsrDTYjPDe4qp8fJcgMa');

export const FEE_WALLET = new anchor.web3.PublicKey('Bi4UpEtKxnHwCw7b9xkMCouGT6xLNm8nixs2fTmxTevs');

export const COLLECTION_ID = new anchor.web3.PublicKey("EtaEw6kTxgfSPNy1cWRXQ8DFcVCxQo9V1bjJqytMubfs");

export const SYSVAR_CLOCK_PUBKEY = new anchor.web3.PublicKey(
  "SysvarC1ock11111111111111111111111111111111"
);

export const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

export const SYSVAR_EPOCH_SCHEDULE_PUBKEY = new anchor.web3.PublicKey(
  "SysvarEpochSchedu1e111111111111111111111111"
);

export const SYSVAR_INSTRUCTIONS_PUBKEY = new anchor.web3.PublicKey(
  "Sysvar1nstructions1111111111111111111111111"
);

export const SYSVAR_RECENT_BLOCKHASHES_PUBKEY = new anchor.web3.PublicKey(
  "SysvarRecentB1ockHashes11111111111111111111"
);

export const SYSVAR_RENT_PUBKEY = new anchor.web3.PublicKey(
  "SysvarRent111111111111111111111111111111111"
);

export const SYSVAR_REWARDS_PUBKEY = new anchor.web3.PublicKey(
  "SysvarRewards111111111111111111111111111111"
);

export const SYSVAR_SLOT_HASHES_PUBKEY = new anchor.web3.PublicKey(
  "SysvarRecentB1ockHashes11111111111111111111"
);

export const SYSVAR_SLOT_HISTORY_PUBKEY = new anchor.web3.PublicKey(
  "SysvarS1otHistory11111111111111111111111111"
);

export const SYSVAR_STAKE_HISTORY_PUBKEY = new anchor.web3.PublicKey(
  "SysvarStakeHistory1111111111111111111111111"
);

export const pdaSeed = "wallet-whitelist";

export const pdaWhitelistSeed = "whitelist-config";

export const network = clusterApiUrl("devnet");

export const connectionsOptions = {
  preflightCommitment: "processed",
};

export const GOG_TIME = 1656435600;
export const WL_TIME = 1656437400;
export const PUBLIC_TIME = 1656442800;
export const COMMUNITY_TIME = 1656434400;

export const GOG_PRICE = 1.69;
export const OG_PRICE = 1.9;
export const WL_PRICE = 1.9;
export const PUBLIC_PRICE = 2.29;
export const COMMUNITY_PRICE = 0.01;