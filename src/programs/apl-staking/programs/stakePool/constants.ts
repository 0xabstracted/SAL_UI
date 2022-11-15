import type { AnchorTypes } from "saberhqAnchorContrib11244";
import { PublicKey } from "@solana/web3.js";

import * as STAKE_POOL_TYPES from "../../idl/apl_stake_pool";

export const STAKE_POOL_ADDRESS = new PublicKey(
  "aspcC9JJWDxCC1yQSw4Pv2o95VyCEHP7ek4CvqKmBox"
);

export const STAKE_POOL_SEED = "stake-pool";

export const STAKE_ENTRY_SEED = "stake-entry";

export const IDENTIFIER_SEED = "identifier";

export const STAKE_AUTHORIZATION_SEED = "stake-authorization";

export const STAKE_BOOSTER_SEED = "stake-booster";

export const AUTHORITY_OFFSET = 25;
export const STAKER_OFFSET = 82;
export const POOL_OFFSET = 9;

export type STAKE_POOL_PROGRAM = STAKE_POOL_TYPES.aplStakePool;

export const STAKE_POOL_IDL = STAKE_POOL_TYPES.IDL;

export type StakePoolTypes = AnchorTypes<STAKE_POOL_PROGRAM>;

type Accounts = StakePoolTypes["Accounts"];
export type StakePoolData = Accounts["stakePool"];
export type StakeEntryData = Accounts["stakeEntry"];
export type IdentifierData = Accounts["identifier"];
export type StakeAuthorizationData = Accounts["stakeAuthorizationRecord"];
export type StakeBoosterData = Accounts["stakeBooster"];

export const STAKE_BOOSTER_PAYMENT_MANAGER_NAME = "apl-stake-booster";
export const STAKE_BOOSTER_PAYMENT_MANAGER = new PublicKey(
  "CuEDMUqgkGTVcAaqEDHuVR848XN38MPsD11JrkxcGD6a" // apl-stake-booster
);

export enum ReceiptType {
  // Receive the original mint wrapped in a token manager
  Original = 1,
  // Receive a receipt mint wrapped in a token manager
  Receipt = 2,
  // Receive nothing
  None = 3,
}