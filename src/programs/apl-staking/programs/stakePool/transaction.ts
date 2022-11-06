import {
  findAta,
  tryGetAccount,
  withFindOrInitAssociatedTokenAccount,
} from "cardinalCommon2011";
import { tokenManager } from "cardinalTokenManager179/dist/cjs/programs";
import { withRemainingAccountsForReturn } from "cardinalTokenManager179/dist/cjs/programs/tokenManager";
import {
  findMintManagerId,
  findTokenManagerAddress,
  tokenManagerAddressFromMint,
} from "cardinalTokenManager179/dist/cjs/programs/tokenManager/pda";
import * as metaplex from "mplTokenMetadata125";
import { BN } from "projectSerumAnchor0250";
import type { Wallet } from "saberhqSolanaContrib11244";
import type * as web3 from "@solana/web3.js";

import { getMintSupply } from "../../utils";
import { getRewardDistributor } from "../rewardDistributor/accounts";
import { findRewardDistributorId } from "../rewardDistributor/pda";
import { withClaimRewards } from "../rewardDistributor/transaction";
import {
  getPoolIdentifier,
  getStakeBooster,
  getStakeEntry,
  getStakePool,
} from "./accounts";
import { ReceiptType } from "./constants";
import {
  authorizeStakeEntry,
  boostStakeEntry,
  claimReceiptMint,
  closeStakeBooster,
  closeStakeEntry,
  closeStakePool,
  deauthorizeStakeEntry,
  initPoolIdentifier,
  initStakeBooster,
  initStakeEntry,
  initStakeMint,
  initStakePool,
  reassignStakeEntry,
  returnReceiptMint,
  stake,
  unstake,
  updateStakeBooster,
  updateStakePool,
  updateTotalStakeSeconds,
} from "./instruction";
import { findIdentifierId, findStakeBoosterId, findStakePoolId } from "./pda";
import {
  findStakeEntryIdFromMint,
  withRemainingAccountsForUnstake,
} from "./utils";
import { getPaymentManager } from "../../../apl-payment-manager/accounts";

/**
 * Add init pool identifier instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @returns Transaction, public key for the created pool identifier
 */
export const withInitPoolIdentifier = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [identifierId] = await findIdentifierId();
  transaction.add(
    initPoolIdentifier(connection, wallet, {
      identifierId: identifierId,
    })
  );
  return [transaction, identifierId];
};

export const withInitStakePool = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    requiresCollections?: web3.PublicKey[];
    requiresCreators?: web3.PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [identifierId] = await findIdentifierId();
  const identifierData = await tryGetAccount(() =>
    getPoolIdentifier(connection)
  );
  const identifier = identifierData?.parsed.count || new BN(1);

  if (!identifierData) {
    transaction.add(
      initPoolIdentifier(connection, wallet, {
        identifierId: identifierId,
      })
    );
  }

  const [stakePoolId] = await findStakePoolId(identifier);
  transaction.add(
    initStakePool(connection, wallet, {
      identifierId: identifierId,
      stakePoolId: stakePoolId,
      requiresCreators: params.requiresCreators || [],
      requiresCollections: params.requiresCollections || [],
      requiresAuthorization: params.requiresAuthorization,
      overlayText: params.overlayText || "",
      imageUri: params.imageUri || "",
      authority: wallet.publicKey,
      resetOnStake: params.resetOnStake || false,
      cooldownSeconds: params.cooldownSeconds,
      minStakeSeconds: params.minStakeSeconds,
      endDate: params.endDate,
    })
  );
  return [transaction, stakePoolId];
};

/**
 * Add init stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, public key for the created stake entry
 */
export const withInitStakeEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<[web3.Transaction, web3.PublicKey]> => {
  const [[stakeEntryId], originalMintMetadatId] = await Promise.all([
    findStakeEntryIdFromMint(
      connection,
      wallet.publicKey,
      params.stakePoolId,
      params.originalMintId
    ),
    metaplex.Metadata.getPDA(params.originalMintId),
  ]);

  transaction.add(
    await initStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      originalMintMetadatId: originalMintMetadatId,
    })
  );
  return [transaction, stakeEntryId];
};

/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 * Stake owner should call this
 */
export const withAuthorizeStakeEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  transaction.add(
    await authorizeStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    })
  );
  return transaction;
};

/**
 * Add authorize stake entry instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withDeauthorizeStakeEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  transaction.add(
    await deauthorizeStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      originalMintId: params.originalMintId,
    })
  );
  return transaction;
};

/**
 * Add init stake mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction, keypair of the created stake mint
 */
export const withInitStakeMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    stakeMintKeypair: web3.Keypair;
    name: string;
    symbol: string;
  }
): Promise<[web3.Transaction, web3.Keypair]> => {
  const [[mintManagerId], originalMintMetadataId, stakeMintMetadataId] =
    await Promise.all([
      findMintManagerId(params.stakeMintKeypair.publicKey),
      metaplex.Metadata.getPDA(params.originalMintId),
      metaplex.Metadata.getPDA(params.stakeMintKeypair.publicKey),
    ]);

  const stakeEntryStakeMintTokenAccountId = await findAta(
    params.stakeMintKeypair.publicKey,
    params.stakeEntryId,
    true
  );

  transaction.add(
    initStakeMint(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
      originalMintId: params.originalMintId,
      originalMintMetadatId: originalMintMetadataId,
      stakeEntryStakeMintTokenAccountId: stakeEntryStakeMintTokenAccountId,
      stakeMintId: params.stakeMintKeypair.publicKey,
      stakeMintMetadataId: stakeMintMetadataId,
      mintManagerId: mintManagerId,
      name: params.name,
      symbol: params.symbol,
    })
  );
  return [transaction, params.stakeMintKeypair];
};

/**
 * Add claim receipt mint instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withClaimReceiptMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    receiptMintId: web3.PublicKey;
    receiptType: ReceiptType;
  }
): Promise<web3.Transaction> => {
  if (
    params.receiptType === ReceiptType.Original &&
    (await getMintSupply(connection, params.receiptMintId)).gt(new BN(1))
  ) {
    throw new Error(
      "Fungible staking and locked reecipt type not supported yet"
    );
  }

  const tokenManagerReceiptMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.receiptMintId,
      (
        await findTokenManagerAddress(params.receiptMintId)
      )[0],
      wallet.publicKey,
      true
    );

  transaction.add(
    await claimReceiptMint(connection, wallet, {
      stakeEntryId: params.stakeEntryId,
      tokenManagerReceiptMintTokenAccountId:
        tokenManagerReceiptMintTokenAccountId,
      originalMintId: params.originalMintId,
      receiptMintId: params.receiptMintId,
      receiptType: params.receiptType,
    })
  );
  return transaction;
};

/**
 * Add stake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withStake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    userOriginalMintTokenAccountId: web3.PublicKey;
    amount?: BN;
  }
): Promise<web3.Transaction> => {
  const [stakeEntryId] = await findStakeEntryIdFromMint(
    connection,
    wallet.publicKey,
    params.stakePoolId,
    params.originalMintId
  );
  const stakeEntryOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  transaction.add(
    stake(connection, wallet, {
      stakeEntryId: stakeEntryId,
      stakePoolId: params.stakePoolId,
      originalMint: params.originalMintId,
      stakeEntryOriginalMintTokenAccountId:
        stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccountId: params.userOriginalMintTokenAccountId,
      amount: params.amount || new BN(1),
    })
  );

  return transaction;
};

/**
 * Add unstake instructions to a transaction
 * @param transaction
 * @param connection
 * @param wallet
 * @param params
 * @returns Transaction
 */
export const withUnstake = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    skipRewardMintTokenAccount?: boolean;
  }
): Promise<web3.Transaction> => {
  const [[stakeEntryId], [rewardDistributorId]] = await Promise.all([
    findStakeEntryIdFromMint(
      connection,
      wallet.publicKey,
      params.stakePoolId,
      params.originalMintId
    ),
    await findRewardDistributorId(params.stakePoolId),
  ]);

  const [stakeEntryData, rewardDistributorData] = await Promise.all([
    tryGetAccount(() => getStakeEntry(connection, stakeEntryId)),
    tryGetAccount(() => getRewardDistributor(connection, rewardDistributorId)),
  ]);

  if (!stakeEntryData) throw "Stake entry not found";

  const stakePoolData = await getStakePool(connection, params.stakePoolId);

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
    (stakeEntryData.parsed.originalMintClaimed ||
      stakeEntryData.parsed.stakeMintClaimed)
  ) {
    // return receipt mint if its claimed
    await withReturnReceiptMint(transaction, connection, wallet, {
      stakeEntryId: stakeEntryId,
    });
  }

  const stakeEntryOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      stakeEntryId,
      wallet.publicKey,
      true
    );

  const userOriginalMintTokenAccountId =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      params.originalMintId,
      wallet.publicKey,
      wallet.publicKey
    );

  const remainingAccounts = await withRemainingAccountsForUnstake(
    transaction,
    connection,
    wallet,
    stakeEntryId,
    stakeEntryData?.parsed.stakeMint
  );

  transaction.add(
    unstake(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      originalMintId: params.originalMintId,
      user: wallet.publicKey,
      stakeEntryOriginalMintTokenAccount: stakeEntryOriginalMintTokenAccountId,
      userOriginalMintTokenAccount: userOriginalMintTokenAccountId,
      remainingAccounts,
    })
  );

  // claim any rewards deserved
  if (rewardDistributorData) {
    await withClaimRewards(transaction, connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: stakeEntryId,
      lastStaker: wallet.publicKey,
      skipRewardMintTokenAccount: params.skipRewardMintTokenAccount,
    });
  }

  return transaction;
};

export const withUpdateStakePool = (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    requiresCollections?: web3.PublicKey[];
    requiresCreators?: web3.PublicKey[];
    requiresAuthorization?: boolean;
    overlayText?: string;
    imageUri?: string;
    resetOnStake?: boolean;
    cooldownSeconds?: number;
    minStakeSeconds?: number;
    endDate?: BN;
  }
): [web3.Transaction, web3.PublicKey] => {
  transaction.add(
    updateStakePool(connection, wallet, {
      stakePoolId: params.stakePoolId,
      requiresCreators: params.requiresCreators || [],
      requiresCollections: params.requiresCollections || [],
      requiresAuthorization: params.requiresAuthorization || false,
      overlayText: params.overlayText || "STAKED",
      imageUri: params.imageUri || "",
      authority: wallet.publicKey,
      resetOnStake: params.resetOnStake || false,
      cooldownSeconds: params.cooldownSeconds,
      minStakeSeconds: params.minStakeSeconds,
      endDate: params.endDate,
    })
  );
  return [transaction, params.stakePoolId];
};

export const withUpdateTotalStakeSeconds = (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: web3.PublicKey;
    lastStaker: web3.PublicKey;
  }
): web3.Transaction => {
  transaction.add(
    updateTotalStakeSeconds(connection, wallet, {
      stakEntryId: params.stakeEntryId,
      lastStaker: params.lastStaker,
    })
  );
  return transaction;
};

export const withReturnReceiptMint = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakeEntryId: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  const stakeEntryData = await tryGetAccount(() =>
    getStakeEntry(connection, params.stakeEntryId)
  );
  if (!stakeEntryData) {
    throw new Error(`Stake entry ${params.stakeEntryId.toString()} not found`);
  }

  if (
    !stakeEntryData.parsed.stakeMintClaimed &&
    !stakeEntryData.parsed.originalMintClaimed
  ) {
    console.log("No receipt mint to return");
    return transaction;
  }

  const receiptMint =
    stakeEntryData.parsed.stakeMint && stakeEntryData.parsed.stakeMintClaimed
      ? stakeEntryData.parsed.stakeMint
      : stakeEntryData.parsed.originalMint;

  const tokenManagerId = await tokenManagerAddressFromMint(
    connection,
    receiptMint
  );
  const tokenManagerData = await tryGetAccount(() =>
    tokenManager.accounts.getTokenManager(connection, tokenManagerId)
  );

  if (!tokenManagerData) {
    return transaction;
  }

  const remainingAccountsForReturn = await withRemainingAccountsForReturn(
    transaction,
    connection,
    wallet,
    tokenManagerData
  );

  transaction.add(
    await returnReceiptMint(connection, wallet, {
      stakeEntry: params.stakeEntryId,
      receiptMint: receiptMint,
      tokenManagerKind: tokenManagerData.parsed.kind,
      tokenManagerState: tokenManagerData.parsed.state,
      returnAccounts: remainingAccountsForReturn,
    })
  );
  return transaction;
};

export const withCloseStakePool = (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
  }
): web3.Transaction => {
  transaction.add(
    closeStakePool(connection, wallet, {
      stakePoolId: params.stakePoolId,
      authority: wallet.publicKey,
    })
  );
  return transaction;
};

export const withCloseStakeEntry = (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
  }
): web3.Transaction => {
  transaction.add(
    closeStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
      authority: wallet.publicKey,
    })
  );
  return transaction;
};

export const withReassignStakeEntry = (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeEntryId: web3.PublicKey;
    target: web3.PublicKey;
  }
): web3.Transaction => {
  transaction.add(
    reassignStakeEntry(connection, wallet, {
      stakePoolId: params.stakePoolId,
      stakeEntryId: params.stakeEntryId,
      target: params.target,
    })
  );
  return transaction;
};

export const withInitStakeBooster = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: web3.PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
    payer?: web3.PublicKey;
  }
): Promise<web3.Transaction> => {
  transaction.add(
    await initStakeBooster(connection, wallet, {
      ...params,
    })
  );
  return transaction;
};

export const withUpdateStakeBooster = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
    paymentAmount: BN;
    paymentMint: web3.PublicKey;
    boostSeconds: BN;
    startTimeSeconds: number;
  }
): Promise<web3.Transaction> => {
  transaction.add(
    await updateStakeBooster(connection, wallet, {
      ...params,
    })
  );
  return transaction;
};

export const withCloseStakeBooster = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
  }
): Promise<web3.Transaction> => {
  transaction.add(
    await closeStakeBooster(connection, wallet, {
      ...params,
    })
  );
  return transaction;
};

export const withBoostStakeEntry = async (
  transaction: web3.Transaction,
  connection: web3.Connection,
  wallet: Wallet,
  params: {
    stakePoolId: web3.PublicKey;
    stakeBoosterIdentifier?: BN;
    stakeEntryId: web3.PublicKey;
    originalMintId: web3.PublicKey;
    payerTokenAccount: web3.PublicKey;
    payer?: web3.PublicKey;
    secondsToBoost: BN;
  }
): Promise<web3.Transaction> => {
  const [stakeBoosterId] = await findStakeBoosterId(
    params.stakePoolId,
    params.stakeBoosterIdentifier
  );

  const stakeBooster = await getStakeBooster(connection, stakeBoosterId);
  const paymentManager = await getPaymentManager(
    connection,
    stakeBooster.parsed.paymentManager
  );
  const feeCollectorTokenAccount = await withFindOrInitAssociatedTokenAccount(
    transaction,
    connection,
    stakeBooster.parsed.paymentMint,
    paymentManager.parsed.feeCollector,
    params.payer ?? wallet.publicKey
  );
  const paymentRecipientTokenAccount =
    await withFindOrInitAssociatedTokenAccount(
      transaction,
      connection,
      stakeBooster.parsed.paymentMint,
      stakeBooster.parsed.paymentRecipient,
      params.payer ?? wallet.publicKey
    );
  transaction.add(
    await boostStakeEntry(connection, wallet, {
      ...params,
      paymentManager: stakeBooster.parsed.paymentManager,
      paymentRecipientTokenAccount: paymentRecipientTokenAccount,
      originalMintId: params.originalMintId,
      feeCollectorTokenAccount: feeCollectorTokenAccount,
    })
  );
  return transaction;
};
