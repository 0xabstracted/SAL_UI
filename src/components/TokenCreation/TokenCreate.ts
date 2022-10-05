import {
    clusterApiUrl,
    Connection,
    Keypair,
  } from "@solana/web3.js";
  import {
    createMint, getMint,
  } from "@solana/spl-token";
  import * as bs58 from "bs58";
  
  (async () => {
    // connection
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
    // 5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8
    const feePayer = Keypair.fromSecretKey(
      bs58.decode(
        "588FU4PktJWfGfxtzpAAXywSNt74AvtroVzGfKkVN1LwRuvHwKGr851uH8czM5qm4iqLbs1kKoMKtMJG4ATR7Ld2"
      )
    );
  
    // G2FAbFQPFa5qKXCetoFZQEvF9BVvCKbvUZvodpVidnoY
    const alice = Keypair.fromSecretKey(
      bs58.decode(
        "4NMwxzmYj2uvHuq8xoqhY8RXg63KSVJM1DXkpbmkUY7YQWuoyQgFnnzn6yo3CMnqZasnNPNuAT2TLwQsCaKkUddp"
      )
    );
  
    // 1) use build-in function
    let mintPubkey = await createMint(
      connection, // conneciton
      feePayer, // fee payer
      alice.publicKey, // mint authority
      alice.publicKey, // freeze authority (you can use `null` to disable it. when you disable it, you can't turn it on again)
      8, // decimals,
    );
    console.log(`mint: ${mintPubkey.toBase58()}`);
    let mintAccount = await getMint(connection, mintPubkey);

    let tokenAccountPubkey = await createAssociatedTokenAccount(
      connection, // connection
      feePayer, // fee payer
      mintPubkey, // mint
      alice.publicKey // owner,
    );
    let tokenAccount = await getAccount(connection, tokenAccountPubkey);
    let tokenAmount = await connection.getTokenAccountBalance(tokenAccountPubkey);


  })();
  