const hre = require("hardhat");

async function main() {
  console.log("Deploying CTNFT contract to Sepolia testnet...");

  const CTNFT = await hre.ethers.getContractFactory("CTNFT");
  const ctnft = await CTNFT.deploy();

  await ctnft.waitForDeployment();

  const contractAddress = await ctnft.getAddress();
  console.log("CTNFT contract deployed to:", contractAddress);
  
  console.log("\nAdd this to your .env.local file:");
  console.log(`CTNFT_CONTRACT_ADDRESS=${contractAddress}`);

  // Verify contract on Etherscan (optional)
  if (hre.network.name === "sepolia") {
    console.log("\nWaiting for block confirmations...");
    await ctnft.deploymentTransaction().wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
