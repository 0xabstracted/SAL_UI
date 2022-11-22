import * as anchor from "projectSerumAnchor0250";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

const GetNftsbyOwnerAndCollection = () => {
  const wallet = useWallet();
  const getNFTs = async () => {
    if (wallet && wallet.connected) {
      const connection = new Connection(
        "https://snowy-bitter-morning.solana-mainnet.quiknode.pro/2ee3936ffb2e6eb3f43c125c79bd112c0318cc67/"
      );
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet)
      );
      const mfer = new PublicKey(
        "DEnLudKMtZ93dFHfsVY9aykGyXVUPRWFaHso75DUakCS"
      );
      const allNfts = await metaplex
        .nfts()
        .findAllByOwner({ owner: mfer })
        .run();
      console.log(allNfts);
      var spec = await metaplex
        .nfts()
        .findByMint({
          mintAddress: new PublicKey(
            "HyKBQScJwz7EY9EM7qbZ21MpSeU39N91p2x444vkiWB1"
          ),
        })
        .run();
      console.log(spec);

      const largestAccountInfo = await connection.getAccountInfo(
        new PublicKey("HyKBQScJwz7EY9EM7qbZ21MpSeU39N91p2x444vkiWB1")
      );
      // console.log(
      //   "largestAccountInfo Type",
      //   typeof largestAccountInfo?
      // );
      try {
        console.log(
          "largestAccountInfo 1 ",
          largestAccountInfo?.owner.toBase58()
        );
      } catch (error) {
        console.log("largestAccountInfo 2 ", largestAccountInfo);
      }

      let eeries_nfts: any = [];
      let goon_nfts: any = [];
      let senshi_nfts: any = [];
      for (let index = 0; index < allNfts.length; index++) {
        const nft: any = allNfts[index];
        // const mint_info = await getMint(connection, nft.mintAddress);
        // console.log("Freeze Authority account : ", mint_info);
        // console.log(
        //   "Mint Authority account : ",
        //   mint_info.mintAuthority?.toBase58()
        // );
        // console.log(
        //   "Freeze Authority account : ",
        //   mint_info.freezeAuthority?.toBase58()
        // );

        var creators = nft.creators;

        if (
          creators[0].address.toBase58() ===
            "6NfPXKd6Vr3Vpxn2LqXxR2JYTxMDQeM6zahgiF4ob5e7" &&
          nft.collection.verified
        ) {
          eeries_nfts.push(nft.mintAddress.toBase58());
          // var unverifyEeriesParams = {
          //   mintAddress: nft.mintAddress,
          //   collectionMintAddress: new PublicKey(
          //     "FEcbEmARCo5LaYdkxwcxtCWUJoLndAJFX6vRyfouMTRQ"
          //   ),
          // };
          // var tx_eeries = await metaplex
          //   .nfts()
          //   .unverifyCollection(unverifyEeriesParams)
          //   .run();
        }
        if (
          creators[0].address.toBase58() ===
            "3yiLHGAJu5vyMzQTM5sAxasn75z5ERtGzRckhZ1S9J79" &&
          nft.collection.verified
        ) {
          goon_nfts.push(nft.mintAddress.toBase58());
          // var unverifyGoonParams = {
          //   mintAddress: nft.mintAddress,
          //   collectionMintAddress: new PublicKey(
          //     "2ibwZP5hNUSPoHz15aWBPYR4Q4fX12v5ko1Y5hz2fRQf"
          //   ),
          // };
          // var tx_goon = await metaplex
          //   .nfts()
          //   .unverifyCollection(unverifyGoonParams)
          //   .run();
        }
        if (
          creators[0].address.toBase58() ===
            "7fSuPmCVqvp1Cmtwswy3tYkoPyi76dRfXdVHPjQYzjQJ" &&
          nft.collection.verified
        ) {
          senshi_nfts.push(nft.mintAddress.toBase58());
          // var unverifySenshiParams = {
          //   mintAddress: nft.mintAddress,
          //   collectionMintAddress: new PublicKey(
          //     "WEr7RsgmY5ZPX2TMBhmMe3AmWx18sMjNxEfHSh5Ue9k"
          //   ),
          // };
          // var tx_senshi = await metaplex
          //   .nfts()
          //   .unverifyCollection(unverifySenshiParams)
          //   .run();
        }
      }
      console.log("eeries_nfts", eeries_nfts);
      console.log("goon_nfts", goon_nfts);
      console.log("senshi_nfts", senshi_nfts);
    }
  };

  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => getNFTs()}>
            Get mfer Nfts
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetNftsbyOwnerAndCollection;
