const senshi = require("../senshi.json");
const goons = require("../goons.json");
const eeries = require("../eeries.json");
const uri =
  "https://shdw-drive.genesysgo.net/G3yrhqrpEXzt7mKaEoNRSeFSsxxBjS1a7BGYzg4VpkGz/invalid.json";

// var senshiDataArray = [];
// var goonsDataArray = [];
// var eeriesDataArray = [];

var eeriesDir = path.join(cwd, "EeriesDataDir");
var goonsDir = path.join(cwd, "GoonsDataDir");
var senshiDir = path.join(cwd, "SenshiDataDir");

fs.mkdirSync(eeriesDir, { recursive: true });
fs.mkdirSync(goonsDir, { recursive: true });
fs.mkdirSync(senshiDir, { recursive: true });
for (let index = 0; index < senshi.length; index++) {
  var senshiData = {
    mint_account: senshi[index],
    nft_data: {
      name: "Invalid NFT",
      symbol: "NAN",
      uri: uri,
      seller_fee_basis_points: 9500,
      creators: [
        {
          address: "7fSuPmCVqvp1Cmtwswy3tYkoPyi76dRfXdVHPjQYzjQJ",
          verified: true,
          share: 0,
        },
        {
          address: "SALThRKa8JFD3XoGbLshzg61kaBHFFCeggDH8ydNEaE",
          verified: false,
          share: 100,
        },
      ],
    },
    // },
  };
  // senshiDataArray.push(senshiData);

  var senshiDirPath = path.join(senshiDir, "mint.json");

  var senshiDirPathWithMint = senshiDirPath.replace("mint", senshi[index]);

  const senshiDataJsoned = JSON.stringify(senshiData);

  fs.writeFile(senshiDirPathWithMint, senshiDataJsoned, function (err: any) {
    if (err) {
      console.log(err);
    }
  });
}

for (let index = 0; index < goons.length; index++) {
  var goonsData = {
    mint_account: goons[index],
    nft_data: {
      name: "Invalid NFT",
      symbol: "NAN",
      uri: uri,
      seller_fee_basis_points: 9500,
      creators: [
        {
          address: "3yiLHGAJu5vyMzQTM5sAxasn75z5ERtGzRckhZ1S9J79",
          verified: true,
          share: 0,
        },
        {
          address: "SALThRKa8JFD3XoGbLshzg61kaBHFFCeggDH8ydNEaE",
          verified: false,
          share: 100,
        },
      ],
    },
  };
  // goonsDataArray.push(goonsData);

  var goonsDirPath = path.join(goonsDir, "mint.json");

  var goonsDirPathWithMint = goonsDirPath.replace("mint", goons[index]);

  const goonsDataJsoned = JSON.stringify(goonsData);

  fs.writeFile(goonsDirPathWithMint, goonsDataJsoned, function (err: any) {
    if (err) {
      console.log(err);
    }
  });
}

for (let index = 0; index < eeries.length; index++) {
  var eeriesData = {
    mint_account: eeries[index],
    nft_data: {
      name: "Invalid NFT",
      symbol: "NAN",
      uri: uri,
      seller_fee_basis_points: 9500,
      creators: [
        {
          address: "6NfPXKd6Vr3Vpxn2LqXxR2JYTxMDQeM6zahgiF4ob5e7",
          verified: true,
          share: 0,
        },
        {
          address: "SALThRKa8JFD3XoGbLshzg61kaBHFFCeggDH8ydNEaE",
          verified: false,
          share: 100,
        },
      ],
    },
  };
  // eeriesDataArray.push(eeriesData);
  var path = require("path");

  var eeriesDirPath = path.join(eeriesDir, "mint.json");

  var eeriesDirPathWithMint = eeriesDirPath.replace("mint", eeries[index]);

  const eeriesDataJsoned = JSON.stringify(eeriesData);

  fs.writeFile(eeriesDirPathWithMint, eeriesDataJsoned, function (err: any) {
    if (err) {
      console.log(err);
    }
  });
}
