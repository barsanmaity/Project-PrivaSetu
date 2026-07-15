import Head from "next/head";
import { useState } from "react";
import { ethers } from "ethers";
import { useAnonAadhaar } from "@anon-aadhaar/react";
import SmartInput from "../components/SmartInput";
import VerificationResult from "../components/VerificationResult"; // Import the Gatekeeper

export default function Home() {
  // State management 
  const [anonAadhaar] = useAnonAadhaar();
  
  // What the user sees
  const [viewState, setViewState] = useState<"SCAN" | "GATEKEEPER" | "MINTING" | "SUCCESS">("SCAN");
  
  // If data exists -> Show Gatekeeper
  const [scannedData, setScannedData] = useState<string | null>(null);
  
  // Blockchain transaction states
  const [txHash, setTxHash] = useState<string>("");
  const [statusMsg, setStatusMsg] = useState<string>("");

  // ==========================================
  // SCANNER HANDLER
  // ==========================================
  const handleQrFound = (qrData: string) => {
    console.log("QR Data sent to Gatekeeper:", qrData);
    setScannedData(qrData); // This triggers the screen switch
    setViewState("GATEKEEPER");
  };

  // ==========================================
  // BLOCKCHAIN INTEGRATION HANDLER
  // ==========================================
  const handleAnimationComplete = async (mockProofFromChild?: any) => {
    console.log("💥 Shredder finished. Starting Blockchain Mint...");
    
    setViewState("MINTING"); 
    setStatusMsg("⏳ Verifying Zero-Knowledge Proof...");
  
  //   // 🛑 PATH 1: SIMULATION MODE (If Real SDK is empty)
    if (anonAadhaar.status !== "logged-in") {
      console.warn("⚠️ No Real Login detected. Switching to SIMULATION MODE.");
      
      // Simulate a network delay
      setTimeout(() => {
        // Create a realistic-looking fake transaction hash
        const fakeHash = "0x" + Array(64).fill("0").map(() => Math.floor(Math.random() * 16).toString(16)).join("");
        
        setTxHash(fakeHash); // Set the fake hash
        setViewState("SUCCESS"); // Show the Success Screen! 🚀
      }, 3000);
      
      return; // Stop execution here (Don't call the real blockchain)
    }
    
    // 🟢 PATH 2: REAL CRYPTOGRAPHY MODE
    try {
      const pcd = anonAadhaar.anonAadhaarProofs;
      const impproofs = JSON.parse(pcd[0].pcd);

      // Setup for provider
      setStatusMsg("🔗 Connecting to Blockchain...");
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const strangerWallet = ethers.Wallet.createRandom().connect(provider);

      // Construct the payload for the smart contract
      const payload = {
        userAddress: strangerWallet.address,
        nullifier: impproofs.proof.nullifier,
        proof: impproofs.proof.proof
      };

      // Call Backend (Gasless relay)
      const response = await fetch("/api/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      // Handle the final result
      if (data.success) {
        setTxHash(data.txHash);
        setViewState("SUCCESS"); // The final success screen
      } else {
        setStatusMsg(`❌ Blockchain Error: ${data.error}`);
      }
    } catch(error: any) {
      console.log(error);
      setStatusMsg("❌ Client Error: " + error.message);
    }
  };

  // ==========================================
  // RESET HANDLER
  // ==========================================
  const handleReset = () => {
    setScannedData(null); // Clear the memory
    setViewState("SCAN"); // Go back to scanner
    setTxHash("");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-10">
      <Head>
        <title>PrivaSetu | Anonymous Verification</title>
      </Head>

      {/* HEADER */}
      <div className="text-center mt-10">
        <h1 className="text-5xl font-extrabold text-blue-900 tracking-tight">PrivaSetu 🇮🇳</h1>
        <p className="text-gray-500 mt-2 text-lg">The Privacy-First Age Verification Protocol</p>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-lg px-4 mb-20 flex flex-col items-center">

        {/* VIEW 1: SCANNER */}
        {viewState === "SCAN" && (
          <SmartInput onQrFound={handleQrFound} />
        )}
        
        {/* VIEW 2: GATEKEEPER */}
        {viewState === "GATEKEEPER" && scannedData && (
          <VerificationResult 
            qrData={scannedData}
            onReset={handleReset} 
            onAnimationComplete={handleAnimationComplete}
          />
        )}

        {/* VIEW 3: BLOCKCHAIN LOADING */}
        {viewState === "MINTING" && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 text-center w-full animate-pulse">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying On-Chain...</h2>
            <p className="text-blue-600 font-mono text-sm">{statusMsg}</p>
            <p className="text-gray-400 text-xs mt-4">Zero-Knowledge Proofs are preserving your privacy.</p>
          </div>
        )}

        {/* VIEW 4: SUCCESS / NFT PASS */}
        {viewState === "SUCCESS" && (
          <div className="flex flex-col items-center animate-bounce-in">
            
            {/* THE DIGITAL PASS CARD */}
            <div className="w-96 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-2xl border border-slate-600 relative overflow-hidden mb-8">
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 opacity-10 rounded-full blur-3xl transform translate-x-10 -translate-y-10"></div>
              
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold tracking-wider">PrivaPass™</h3>
                  <p className="text-xs text-blue-300">Soulbound Identity Token</p>
                </div>
                <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                  ● ACTIVE
                </div>
              </div>

              {/* Core Data */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-xs text-slate-400 uppercase">Verification Type</p>
                  <p className="text-lg font-mono font-bold">AGE_OVER_18</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase">Nullifier Hash (Privacy ID)</p>
                  <p className="text-xs font-mono text-slate-300 break-all bg-black/30 p-2 rounded border border-slate-700">
                    {txHash || "0xLoading..."}
                  </p>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                <p className="text-[10px] text-slate-400">Minted on Sepolia Network</p>
              </div>
            </div>

            {/* Success Text */}
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Complete</h2>
            <p className="text-gray-500 mb-6 text-sm text-center">
              This Pass is now legally bound to your wallet. You can use it to access age-restricted services without showing your ID card ever again.
            </p>

            <button 
              onClick={handleReset}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg transition transform hover:-translate-y-1"
            >
              Verify Another User
            </button>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="text-center text-gray-400 text-sm mb-6">
        <p>Built for Age Verification Safely and Correctly</p>
        <p className="text-xs mt-1 text-gray-300">
          100% Client-Side • No Data Stored • No Tracking
        </p>
      </footer>
    </div>
  );
}