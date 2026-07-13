const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting deployment...");

  // 1. Get the Contract Factory
  // Make sure this name matches the "class" name inside your .sol file!
  const PrivaPass = await hre.ethers.getContractFactory("Privapass");

  // 2. Deploy the Contract
  console.log("⏳ Sending transaction to the network...");
  const privaPass = await PrivaPass.deploy();

  // 3. Wait for the transaction to be mined
  await privaPass.waitForDeployment();

  // 4. Print the Success Message
  const address = await privaPass.getAddress();
  console.log("✅ Success! Contract deployed to:", address);
  console.log("👉 COPY THIS ADDRESS! You will need it for your .env.local file.");
}

// Standard error handling pattern
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});