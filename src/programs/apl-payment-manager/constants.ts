import type { AnchorTypes } from "saberhqAnchorContrib11244";
import { PublicKey } from "@solana/web3.js";

import * as PAYMENT_MANAGER_TYPES from "./idl/apl_payment_manager";

export const BASIS_POINTS_DIVISOR = 10000;
export const DEFAULT_BUY_SIDE_FEE_SHARE = 50;

export const PAYMENT_MANAGER_ADDRESS = new PublicKey(
  "APMT8qWbAUapzsBoxx1ACrt37JFWS76Bkn9PUre5ybyn"
);

export const CRANK_KEY = new PublicKey(
  "crkdpVWjHWdggGgBuSyAqSmZUmAjYLzD435tcLDRLXr"
);

export const PAYMENT_MANAGER_SEED = "payment-manager";
export const DEFAULT_PAYMENT_MANAGER_NAME = "apl";

export const PAYMENT_MANAGER_IDL = PAYMENT_MANAGER_TYPES.IDL;

export type PAYMENT_MANAGER_PROGRAM =
  PAYMENT_MANAGER_TYPES.AplPaymentManager;

export type PaymentManagerTypes = AnchorTypes<
  PAYMENT_MANAGER_PROGRAM,
  {
    tokenManager: PaymentManagerData;
  }
>;

type Accounts = PaymentManagerTypes["Accounts"];
export type PaymentManagerData = Accounts["paymentManager"];
