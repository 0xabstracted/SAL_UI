const Config = path.join(cwd, "Config");

if (!fs.existsSync(Config)) {
  fs.mkdirSync(Config, { recursive: true });
}

const getMissingURInIdsConfigPath = path.join(
  Config,
  "getMissingURInIdsConfig"
);
if (!fs.existsSync(getMissingURInIdsConfigPath)) {
  fs.mkdirSync(getMissingURInIdsConfigPath, { recursive: true });
}

const URI = path.join(getMissingURInIdsConfigPath, "URI");

const goonsURIAllPath = path.join(URI, "goonsURIAll.json");
const eeriesURIAllPath = path.join(URI, "eeriesURIAll.json");
const senshiURIAllPath = path.join(URI, "senshiURIAll.json");

const goons = require(goonsURIAllPath);
const eeries = require(eeriesURIAllPath);
const senshi = require(senshiURIAllPath);

const Build = path.join(cwd, "Build");
if (!fs.existsSync(Build)) {
  fs.mkdirSync(Build, { recursive: true });
}

const getMissingURInIdsBuildPath = path.join(
  Build,
  "getMissingURInIdsBuildPath"
);
if (!fs.existsSync(getMissingURInIdsBuildPath)) {
  fs.mkdirSync(getMissingURInIdsBuildPath, { recursive: true });
}

const ExID = path.join(getMissingURInIdsBuildPath, "ExID");
const ExURI = path.join(getMissingURInIdsBuildPath, "ExURI");
const MiID = path.join(getMissingURInIdsBuildPath, "MiID");
const MiURI = path.join(getMissingURInIdsBuildPath, "MiURI");

if (!fs.existsSync(ExID)) {
  fs.mkdirSync(ExID, { recursive: true });
}
if (!fs.existsSync(ExURI)) {
  fs.mkdirSync(ExURI, { recursive: true });
}
if (!fs.existsSync(MiID)) {
  fs.mkdirSync(MiID, { recursive: true });
}
if (!fs.existsSync(MiURI)) {
  fs.mkdirSync(MiURI, { recursive: true });
}

const goonsExIdPath = path.join(ExID, "goonsExId.json");
const senshiExIdPath = path.join(ExID, "senshiExId.json");
const eeriesExIdPath = path.join(ExID, "eeriesExId.json");

const goonsExURIPath = path.join(ExURI, "goonsExURI.json");
const senshiExURIPath = path.join(ExURI, "senshiExURI.json");
const eeriesExURIPath = path.join(ExURI, "eeriesExURI.json");

const goonsMiIdPath = path.join(MiID, "goonsMiId.json");
const senshiMiIdPath = path.join(MiID, "senshiMiId.json");
const eeriesMiIdPath = path.join(MiID, "eeriesMiId.json");

const goonsMiURIPath = path.join(MiURI, "goonsMiURI.json");
const senshiMiURIPath = path.join(MiURI, "senshiMiURI.json");
const eeriesMiURIPath = path.join(MiURI, "goonsMiURI.json");

const goonsCommonURI =
  "https://shdw-drive.genesysgo.net/7qtmTrgXkRThdEWHSDypVEB1q4uDeSTuvxthUYuYRYNr/";

const eeriesCommonURI =
  "https://shdw-drive.genesysgo.net/8fgVbRSTj8DqidjZ6ahwJktRVjDxKfJSJn5RUupLydSp/";

const senshiCommonURI =
  "https://shdw-drive.genesysgo.net/2GNQauoUQUZRT6vgJSqqFkVe6Bd76P1ZjNxvjcany98V/";

const invalidURI =
  "https://shdw-drive.genesysgo.net/G3yrhqrpEXzt7mKaEoNRSeFSsxxBjS1a7BGYzg4VpkGz/invalid.json";

let goonsExId = [];
for (let index = 0; index < goons.length; index++) {
  if (goons[index].uri !== invalidURI) {
    let id = goons[index].uri.replace(goonsCommonURI, "").replace(".json", "");
    goonsExId.push(parseInt(id));
  }
}
goonsExId.sort(function (a, b) {
  return a - b;
});

let goonsExIdWTF = writeToFile(goonsExIdPath, JSON.stringify(goonsExId));

let goonsExURI = [];
for (let index = 0; index < goonsExId.length; index++) {
  goonsExURI.push(
    [goonsCommonURI, goonsExId[index].toString(), ".json"].join("")
  );
}
let goonsExURIWTF = writeToFile(goonsExURIPath, JSON.stringify(goonsExURI));

let goonsMiId = findMissedNum(goonsExId, 500);

let goonsMiIdWTF = writeToFile(goonsMiIdPath, JSON.stringify(goonsMiId));

let goonsMiURI = [];
for (let index = 0; index < goonsMiId.length; index++) {
  goonsMiURI.push(
    [goonsCommonURI, goonsMiId[index].toString(), ".json"].join("")
  );
}
let goonsMiURIWTF = writeToFile(goonsMiURIPath, JSON.stringify(goonsMiURI));

let senshiExId = [];
for (let index = 0; index < senshi.length; index++) {
  if (senshi[index].uri !== invalidURI) {
    let id = senshi[index].uri
      .replace(senshiCommonURI, "")
      .replace(".json", "");
    senshiExId.push(parseInt(id));
  }
}
senshiExId.sort(function (a, b) {
  return a - b;
});

let senshiExIdWTF = writeToFile(senshiExIdPath, JSON.stringify(senshiExId));

let senshiExURI = [];
for (let index = 0; index < senshiExId.length; index++) {
  senshiExURI.push(
    [senshiCommonURI, senshiExId[index].toString(), ".json"].join("")
  );
}
let senshiExURIWTF = writeToFile(senshiExURIPath, JSON.stringify(senshiExURI));

let senshiMiId = findMissedNum(senshiExId, 500);

let senshiMiIdWTF = writeToFile(senshiMiIdPath, JSON.stringify(senshiMiId));

let senshiMiURI = [];
for (let index = 0; index < senshiMiId.length; index++) {
  senshiMiURI.push(
    [senshiCommonURI, senshiMiId[index].toString(), ".json"].join("")
  );
}
let senshiMiURIWTF = writeToFile(senshiMiURIPath, JSON.stringify(senshiMiURI));

let eeriesExId = [];
for (let index = 0; index < eeries.length; index++) {
  if (eeries[index].uri !== invalidURI) {
    let id = eeries[index].uri
      .replace(eeriesCommonURI, "")
      .replace(".json", "");
    eeriesExId.push(parseInt(id));
  }
}
eeriesExId.sort(function (a, b) {
  return a - b;
});

let eeriesExIdWTF = writeToFile(eeriesExIdPath, JSON.stringify(eeriesExId));

let eeriesExURI = [];
for (let index = 0; index < eeriesExId.length; index++) {
  eeriesExURI.push(
    [eeriesCommonURI, eeriesExId[index].toString(), ".json"].join("")
  );
}
let eeriesExURIWTF = writeToFile(eeriesExURIPath, JSON.stringify(eeriesExURI));

let eeriesMiId = findMissedNum(eeriesExId, 500);

let eeriesMiIdWTF = writeToFile(eeriesMiIdPath, JSON.stringify(eeriesMiId));

let eeriesMiURI = [];
for (let index = 0; index < eeriesMiId.length; index++) {
  eeriesMiURI.push(
    [eeriesCommonURI, eeriesMiId[index].toString(), ".json"].join("")
  );
}
let eeriesMiURIWTF = writeToFile(eeriesMiURIPath, JSON.stringify(eeriesMiURI));

function findMissedNum(arrayOfNumbers, n) {
  if (arrayOfNumbers.length === n) {
    console.log("no number is missed");
  }
  let MiNumbers = [];
  for (let index = 0; index < n; index++) {
    if (!arrayOfNumbers.includes(index)) {
      MiNumbers.push(index);
    }
  }
  return MiNumbers;
}

function writeToFile(path, data) {
  fs.writeFile(path, data, function (err) {
    if (err) {
      console.log(err);
    }
  });
}
