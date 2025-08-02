import hre from "hardhat";
import fs from "fs";
const { ethers } = hre;

async function main() {
  // Check if we're on a live network and need private key
  const network = hre.network.name;
  if (network !== "hardhat" && network !== "localhost") {
    if (!process.env.PRIVATE_KEY) {
      throw new Error(
        `PRIVATE_KEY environment variable is required for deployment to ${network}.\n` +
        "Please create a .env file based on env.sample and set your private key."
      );
    }
  }

  const [deployer] = await ethers.getSigners();
  
  if (!deployer) {
    throw new Error("No deployer account found. Make sure your private key is correctly set.");
  }

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Deploy CTNFT
  console.log("\nDeploying CTNFT...");
  const CTNFT = await ethers.getContractFactory("CTNFT");
  const ctnft = await CTNFT.deploy();
  await ctnft.waitForDeployment();
  console.log("CTNFT deployed to:", await ctnft.getAddress());

  // Deploy CTNFT Reward
  console.log("\nDeploying CTNFT Reward...");
  const CTNFTReward = await ethers.getContractFactory("CTNFTReward");
  const ctnftReward = await CTNFTReward.deploy();
  await ctnftReward.waitForDeployment();
  console.log("CTNFT Reward deployed to:", await ctnftReward.getAddress());

  // Log deployment info
  console.log("\n=== Deployment Summary ===");
  console.log("CTNFT Address:", await ctnft.getAddress());
  console.log("CTNFT Reward Address:", await ctnftReward.getAddress());
  console.log("Deployer Address:", deployer.address);

  // Save deployment addresses to a file
  const deploymentInfo = {
    network: hre.network.name,
    ctnft: await ctnft.getAddress(),
    ctnftReward: await ctnftReward.getAddress(),
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    "deployment-addresses.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\nDeployment addresses saved to deployment-addresses.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
