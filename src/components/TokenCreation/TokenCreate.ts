import {
    clusterApiUrl,
    Connection,
    Keypair,
    Transaction,
  } from "@solana/web3.js";
  import {
    closeAccount,
    createAssociatedTokenAccount,
    createBurnCheckedInstruction,
    createCloseAccountInstruction,
    createMint, getAccount, getMint, mintToChecked, transferChecked,
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
    let txhash = await mintToChecked(
      connection, // connection
      feePayer, // fee payer
      mintPubkey, // mint
      tokenAccountPubkey, // receiver (sholud be a token account)
      alice, // mint authority
      1e8, // amount. if your decimals is 8, you mint 10^8 for 1 token.
      8 // decimals
    );
    let txhash1 = await transferChecked(
      connection, // connection
      feePayer, // payer
      tokenAccountXPubkey, // from (should be a token account)
      mintPubkey, // mint
      tokenAccountYPubkey, // to (should be a token account)
      alice, // from's owner
      1e8, // amount, if your deciamls is 8, send 10^8 for 1 token
      8 // decimals
    );      
    let tx = new Transaction().add(
      createBurnCheckedInstruction(
        tokenAccountPubkey, // token account
        mintPubkey, // mint
        alice.publicKey, // owner of token account
        1e8, // amount, if your deciamls is 8, 10^8 for 1 token
        8 // decimals
      )
    );
    {
      let txhash = await closeAccount(
        connection, // connection
        feePayer, // payer
        tokenAccountPubkey, // token account which you want to close
        alice.publicKey, // destination
        alice // owner of token account
      );
    }
    
    // or
    
    // 2) compose by yourself
    {
      let tx = new Transaction().add(
        createCloseAccountInstruction(
          tokenAccountPubkey, // token account which you want to close
          alice.publicKey, // destination
          alice.publicKey // owner of token account
        )
      );
    }
      

  })();
  