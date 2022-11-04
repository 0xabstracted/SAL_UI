import type { AnchorTypes } from "@saberhq/anchor-contrib";
import { PublicKey } from "@solana/web3.js";

import * as RECEIPT_MANAGER_TYPES from "../../idl/apl_receipt_manager";

export const RECEIPT_MANAGER_ADDRESS = new PublicKey(
  "ARMm8GbQqVmq4jNw4tYZWSC2BMVdSD31PDVKd6tchJik"
);

export const RECEIPT_MANAGER_SEED = "receipt-manager";
export const REWARD_RECEIPT_SEED = "reward-receipt";
export const RECEIPT_ENTRY_SEED = "receipt-entry";

export type RECEIPT_MANAGER_PROGRAM =
  RECEIPT_MANAGER_TYPES.aplReceiptManager;

export const RECEIPT_MANAGER_IDL = RECEIPT_MANAGER_TYPES.IDL;

export type RewardDistributorTypes = AnchorTypes<RECEIPT_MANAGER_PROGRAM>;

type Accounts = RewardDistributorTypes["Accounts"];
export type ReceiptManagerData = Accounts["receiptManager"];
export type RewardReceiptData = Accounts["rewardReceipt"];
export type ReceiptEntryData = Accounts["receiptEntry"];

export const RECEIPT_MANAGER_PAYMENT_MANAGER_NAME = "apl-receipt-manager";
export const RECEIPT_MANAGER_PAYMENT_MANAGER = new PublicKey(
  "FQJ2czigCYygS8v8trLU7TBAi7NjRN1h1C2vLAh2GYDi" // apl-receipt-manager
);
