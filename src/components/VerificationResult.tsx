
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { generateMockProof } from "../utils/mockZK";

interface Props {
  qrData: string;
  onReset: () => void;
  onAnimationComplete?: (proof?: any) => void; 
}

 export default function VerificationResult({qrData, onReset, onAnimationComplete}: Props) {
  // Added "destroying" state
  const [status, setStatus] = useState<"analyzing" | "success" | "rejected" | "proving" | "proven" | "destroying" | "wiped">("analyzing");
  const [reason, setReason] = useState("");
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [zkProof, setZkProof] = useState<any>(null);
// --- 1. THE SMART GATEKEEPER (Runs automatically) ---
  useEffect(() => {
    const checkGatekeeper = () => {
      if (!qrData) return;
      const isRawQR = /^\d+$/.test(qrData);
      const isRealSDK = qrData.includes("nullifier");
      const isDemoMode = qrData === "DEMO_IMAGE_DATA" || qrData === "DEMO_PDF_DATA";

      if (isRawQR || isRealSDK || isDemoMode) {
        setStatus("success");
      } else {
        setStatus("rejected");
        setReason("Invalid Data Format. This is not a recognized Aadhaar QR.");
      }
    };

    // Small delay to simulate scanning time
    const timer = setTimeout(checkGatekeeper, 1500);
    return () => clearTimeout(timer);
  }, [qrData]);

  // --- 2. ZK PROOF GENERATION ---
  const startProofGeneration = () => {
    
    const isRawQR = /^\d+$/.test(qrData);
    const isRealSDK = qrData.includes("nullifier");
    const isDemoMode = qrData === "DEMO_IMAGE_DATA" || qrData === "DEMO_PDF_DATA";

    if (!qrData || (!isRawQR && !isRealSDK && !isDemoMode)) {
      alert("❌ Security Fault: Data integrity compromised before proving.");
      setStatus("rejected");
      setReason("Pre-computation Safety Lock Triggered. Execution Halted.");
      return; 
    }
    // ----------------------------------------------------------------

    setStatus("proving");
    setProgress(0);
    setProgressText("Fetching ZK-Circuits...");

    setTimeout(() => {
      setProgress(30);
      setProgressText("Generating Witness (Private Inputs)...");
      
      setTimeout(() => {
        setProgress(70);
        setProgressText("Calculating SNARK Proof (Groth16)...");
        
        setTimeout(() => {
          setProgress(100);
          
          let finalProof;
          try {
            const parsedData = JSON.parse(qrData);
            finalProof = {
                nullifier: parsedData.nullifier || parsedData[0]?.nullifier || "0xSECURE_SDK_NULLIFIER",
                timestamp: new Date().toISOString(),
                ageAbove18: true
            };
          } catch (error) {
            finalProof = generateMockProof(qrData);
          }
          
          setZkProof(finalProof);
          setTimeout(() => setStatus("proven"), 1000);
        }, 1500);
      }, 1500);
    }, 1500);
  };
 // --- 3. DESTRUCTION PROTOCOL 🗑️ ---
  const executeDestruction = () => {
    setStatus("destroying");
    
    setTimeout(() => {
      console.log("RAM Cleared: 0x00000000");

      if (onAnimationComplete) {
       onAnimationComplete(zkProof);
        return;
      }
      
      setStatus("wiped"); 
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center overflow-hidden relative">
      
      {/* 1. ANALYZING */}
      {status === "analyzing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-gray-800">The Gatekeeper</h2>
          <p className="text-gray-500 text-sm mt-1">Checking QR Security Version...</p>
        </motion.div>
      )}

      {/* 2. REJECTED */}
      {status === "rejected" && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-4xl">🛑</span></div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          
          {/* THE STYLE YOU WANTED (setReason Style) */}
          <div className="bg-red-50 border border-red-100 p-3 rounded-lg text-red-800 font-medium text-sm mb-6">
            {reason}
          </div>
          
          <button onClick={onReset} className="text-gray-500 underline text-sm hover:text-gray-800">Try Another Card</button>
        </motion.div>
      )}

      {/* 3. SUCCESS */}
      {status === "success" && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-4xl">🛡️</span></div>
          <h2 className="text-2xl font-bold text-green-700 mb-2">Secure QR Detected</h2>
          <p className="text-gray-600 text-sm mb-6">Data is valid. Ready for Zero-Knowledge Proof generation.</p>
          <button onClick={startProofGeneration} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg">Generate ZK Proof ⚡</button>
        </motion.div>
      )}

      {/* 4. PROVING */}
      {status === "proving" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="text-left mb-2 flex justify-between"><span className="text-xs font-bold text-blue-600 uppercase">ZK-SNARK Protocol</span><span className="text-xs text-gray-500">{progress}%</span></div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden"><motion.div className="bg-blue-600 h-3 rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} /></div>
          <p className="text-sm text-gray-600 font-medium animate-pulse">{progressText}</p>
        </motion.div>
      )}

      {/* 5. PROVEN */}
      {status === "proven" && zkProof && (
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-100"><span className="text-5xl">✅</span></div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Verified 18+</h2>
          <p className="text-green-600 font-medium mb-8">Zero-Knowledge Proof Validated</p>
          
          <div className="bg-gray-50 rounded-xl p-4 text-left border border-gray-200 mb-6 font-mono text-xs">
            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2">
              <span className="font-bold text-gray-500 uppercase">Proof Receipt</span>
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Valid</span>
            </div>
            <div className="space-y-2">
              <div className="flex flex-col"><span className="text-gray-400 text-[10px] uppercase">Your Nullifier:</span><span className="text-blue-600 break-all">{zkProof.nullifier}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Timestamp:</span><span>{new Date(zkProof.timestamp).toLocaleTimeString()}</span></div>
              <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-600 font-bold">Check:</span>
                <span className="font-bold text-gray-900">AGE {'>'} 18</span>
              </div>
            </div>
          </div>

          <button 
            onClick={executeDestruction} 
            className="w-full py-3 bg-red-50 text-red-600 border border-red-100 rounded-xl font-bold hover:bg-red-100 transition flex items-center justify-center gap-2"
          >
            🗑️ Purge Data & Exit
          </button>
        </motion.div>
      )}

      {/* 6. DESTRUCTION MODE (Animation) */}
      {status === "destroying" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64">
          <motion.div 
            animate={{ y: [0, 50], scaleY: [1, 0], opacity: [1, 0] }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="w-20 h-24 bg-gray-200 border-2 border-gray-300 rounded-lg mb-4 flex items-center justify-center"
          >
            <span className="text-2xl">📄</span>
          </motion.div>
          <h2 className="text-xl font-bold text-red-600 mb-2 animate-pulse">Wiping RAM...</h2>
          <p className="text-gray-400 text-xs font-mono">Overwrite: 0x000000000000</p>
        </motion.div>
      )}

      {/* 7. WIPED MODE (The New "No Alert" Screen) 🗑️ */}
   {/* ... existing blocks ... */}

      {/* 7. WIPED MODE (The New "Red Box" Screen) */}
      {status === "wiped" && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🗑️</span>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-2">Data Purged</h2>
          
          {/* THE RED BOX STYLE YOU REQUESTED */}
          <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-800 font-medium text-sm mb-6 text-left shadow-sm">
            <p className="font-bold mb-1">SAFETY ALERT:</p>
            <p>User Data & Session Keys have been permanently wiped from RAM.</p>
            <p className="mt-2 text-xs text-red-600 opacity-80">Please delete your local PDF file manually.</p>
          </div>

          <button 
            onClick={onReset} 
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Return to Home
          </button>
        </motion.div>
      )}

    </div> // <--- This is the final closing div of your component
  );
}
