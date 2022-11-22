import React, { useEffect } from "react";

import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Connection, PublicKey } from "@solana/web3.js";
import { ShdwDrive } from "@shadow-drive/sdk";
import {
  AnchorWallet,
  useAnchorWallet,
  useConnection,
} from "@solana/wallet-adapter-react";
const uriListSenshi = require("./senshiIdMissingArray");
const UpdateCreatorInURIShdwDrive = () => {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();
  // useEffect(() => {
  //   (async () => {
  //     if (wallet?.publicKey) {
  //     }
  //   })();
  // }, [wallet?.publicKey]);
  const updateCreators = async () => {
    if (wallet) {
      const drive = await new ShdwDrive(connection, wallet).init();
      let uriArrSenshi = [];
      for (let index = 0; index < uriListSenshi.length; index++) {
        var uri: any = uriListSenshi[index];
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
          if (this.readyState === 4) {
            uriArrSenshi.push(JSON.parse(this.responseText));
          }
        });
        xhr.open("GET", uri);
        xhr.send();
      }

      for (let index = 0; index < uriArrSenshi.length; index++) {
        let senshiCreators = [
          {
            address: "9hNdhn6XXWApBZoue8po3UevA3wx4PTEVXnT7WQ7aM7p",
            share: 50,
          },
          {
            address: "E2NyWnSHgTJ69h24fYabjWt6HK23AsUmtynRFWKNcca2",
            share: 40,
          },
          { address: "om1rBL3aBQhQARsiQKopcao2YhyFr7bfrj23rmsDCgp", share: 10 },
        ];
        let data = drive.editFile(
          new PublicKey("2GNQauoUQUZRT6vgJSqqFkVe6Bd76P1ZjNxvjcany98V"),
          uriListSenshi[index],
          senshiCreators, 
          "v2"
        );
      }
    }
  };

  return (
    <div>
      <div className="gen-farm-stats">
        <div className="gen-farm-stats-left">
          <button className="Inside-Farm-btn" onClick={() => updateCreators()}>
            Get URIs
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCreatorInURIShdwDrive;
