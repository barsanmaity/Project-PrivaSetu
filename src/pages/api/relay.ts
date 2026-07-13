import type { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";

// 1. Setup the Provider (Connects to Sepolia)
const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

// 2. Setup the Relayer Wallet (Your Private Key pays the gas)
const privateKey = process.env.PRIVATE_KEY;
if (!privateKey) {
  throw new Error("❌ PRIVATE_KEY is missing in .env.local");
}
const wallet = new ethers.Wallet(privateKey, provider);

// 3. Setup the Contract
// The address comes from your .env.local file
const contractAddress = process.env.NEXT_PUBLIC_PRIVAPASS_ADDRESS;

// This is the specific function we want to call on your smart contract
const ABI = [
  "function verifyUser(address user, uint256 nullifier, uint256[8] memory proof) external"
];

const contract = new ethers.Contract(contractAddress!, ABI, wallet);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userAddress, nullifier, proof } = req.body;

    console.log(`🚀 Relayer: Verifying user ${userAddress}...`);

    // 4. Send the Transaction
    // The wallet (YOU) signs this transaction and pays the gas fee.
    // The user pays $0.
    const tx = await contract.verifyUser(userAddress, nullifier, proof, {
        gasLimit: 500000
    });
    
    console.log(`⏳ Transaction sent: ${tx.hash}`);
    
    // Wait for the transaction to be confirmed on the blockchain
    await tx.wait();

    console.log(`✅ Success! User verified on-chain.`);
    
    res.status(200).json({ 
      success: true, 
      txHash: tx.hash 
    });

  } catch (error: any) {
    console.error("❌ Relayer Error:", error);
    res.status(500).json({ error: error.message || "Relayer failed" });
  }
}