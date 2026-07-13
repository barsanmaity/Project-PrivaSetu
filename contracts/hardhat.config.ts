import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

// Load .env file from the parent directory
dotenv.config({ path: "../.env.local" }); 

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://1rpc.io/sepolia",
      chainId: 11155111,
      // Uses your PRIVATE_KEY from the .env file
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;