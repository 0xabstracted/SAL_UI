import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";

const GetURIOfNFTs = () => {
  const wallet = useWallet();
  const getURIs = async () => {
    if (wallet && wallet.connected) {
      const connection = new Connection(
        "https://snowy-bitter-morning.solana-mainnet.quiknode.pro/"
      );
      const metaplex = Metaplex.make(connection).use(
        walletAdapterIdentity(wallet)
      );
      const goons = new PublicKey(
        "3yiLHGAJu5vyMzQTM5sAxasn75z5ERtGzRckhZ1S9J79"
      );
      const senshi = new PublicKey(
        "7fSuPmCVqvp1Cmtwswy3tYkoPyi76dRfXdVHPjQYzjQJ"
      );
      const eeries = new PublicKey(
        "6NfPXKd6Vr3Vpxn2LqXxR2JYTxMDQeM6zahgiF4ob5e7"
      );
      const goonsNfts = await metaplex
        .nfts()
        .findAllByCreator({ creator: goons })
        .run();
      console.log(goonsNfts);
      const senshiNfts = await metaplex
        .nfts()
        .findAllByCreator({ creator: senshi })
        .run();
      console.log(senshiNfts);
      const eeriesNfts = await metaplex
        .nfts()
        .findAllByCreator({ creator: eeries })
        .run();
      console.log(eeriesNfts);

      let goonsUriAll: any = [];
      let senshiUriAll: any = [];
      let eeriesUriAll: any = [];
      for (let index = 0; index < goonsNfts.length; index++) {
        let nft: any = goonsNfts[index];
        var goonsUri = {
          mintAddress: nft.mintAddress,
          uri: nft.uri,
        };
        goonsUriAll.push(goonsUri);
      }
      for (let index = 0; index < senshiNfts.length; index++) {
        let nft: any = senshiNfts[index];
        var senshiUri = {
          mintAddress: nft.mintAddress,
          uri: nft.uri,
        };
        senshiUriAll.push(senshiUri);
      }
      for (let index = 0; index < eeriesNfts.length; index++) {
        let nft: any = eeriesNfts[index];
        var eeriesUri = {
          mintAddress: nft.mintAddress,
          uri: nft.uri,
        };
        eeriesUriAll.push(eeriesUri);
      }
      console.log("eeriesUriAll", eeriesUriAll);
      console.log("senshiUriAll", senshiUriAll);
      console.log("goonsUriAll", goonsUriAll);
    }
  };

  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => getURIs()}>
            Get URIs
          </button>
        </div>
      </div>
    </div>
  );
};

export default GetURIOfNFTs;
