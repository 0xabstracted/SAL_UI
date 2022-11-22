createConfig();
createBuild();

const fs = require("fs");
const cwd = process.cwd();
const path = require("path");

const withOthers = allStolen.filter(
  (a: any) => !mferStolen.some((b: any) => a === b)
);
const withMfer = allStolen.filter((a: any) =>
  mferStolen.some((b: any) => a === b)
);

const withMferData = JSON.stringify(withMfer);
writeToFile(withMferPath, withMferData);

const withOthersData = JSON.stringify(withOthers);
writeToFile(withOthersPath, withOthersData);

function writeToFile(filePath: any, data: string) {
  const fs = require("fs");
  fs.writeFile(filePath, data, function (err: any) {
    if (err) {
      console.log(err);
    }
  });
}
function checkAndCreateDirectory(dirPath: string) {
  const fs = require("fs");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createConfig(configPath: string) {
  let configSubDir = configPath.split("/");
  let csd = cwd;
  for (let index = 0; index < configSubDir.length; index++) {
    csd = path.join(csd, configSubDir[index]);
    checkAndCreateDirectory(csd);
  }

  const allStolenPath = path.join(csd, "allStolen.json");
  const mferStolenPath = path.join(csd, "mferStolen.json");
  const allStolen = require(allStolenPath);
  const mferStolen = require(mferStolenPath);
}

function createBuild(buildPath: undefined) {
  const cwd = process.cwd();
  const path = require("path");
  const Build = path.join(cwd, "Build");
  checkAndCreateDirectory(Build);

  const swanBuildPath = path.join(Build, "swanBuild");
  checkAndCreateDirectory(swanBuildPath);

  const AllStolenNFTsBuild = path.join(swanBuildPath, "AllStolenNFTs");
  checkAndCreateDirectory(AllStolenNFTsBuild);
  const withMferPath = path.join(AllStolenNFTsBuild, "withMfer.json");
  const withOthersPath = path.join(AllStolenNFTsBuild, "withOthers.json");
}
