import path from "path";
import fs from "fs";
import { ethers } from "hardhat";
import { Contract } from "ethers";

async function main() {

  const PD = await ethers.deployContract("PizzaDelivery");
  const pd = await PD.waitForDeployment();
  await saveFrontendFiles(pd);
}
// we add this part to save artifacts and address
async function saveFrontendFiles(pd: Contract) {
  const contractsDir = path.join(__dirname, "/../frontend/src/contracts");
  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }
  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ PD: await pd.getAddress() }, null, 2)
  );
  // `artifacts` is a helper property provided by Hardhat to read artifacts
  const PDArtifact = artifacts.readArtifactSync("PizzaDelivery");
  fs.writeFileSync(
    contractsDir + "/PD.json",
    JSON.stringify(PDArtifact, null, 2)
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });