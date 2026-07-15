import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import * as pdfjsLib from "pdfjs-dist";
import { LogInWithAnonAadhaar, useAnonAadhaar } from "@anon-aadhaar/react";

//  PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function SmartInput({ onQrFound }: { onQrFound: (data: string) => void }) {
  // 🔴 MASTER SWITCH:
  // FALSE = Hackathon Demo (Old Camera UI, Simulated Proof)
  // TRUE = Real Product (Official SDK Popup, Real Proof)
  const REAL_MODE = true;
  
  const [anonAdhaar] = useAnonAadhaar();
 const [mode, setMode] = useState<"select" | "camera" | "file" | "processing" | "error">("select");
const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Processing...");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sdkButtonRef = useRef<HTMLDivElement>(null);

  // --- SDK LOGIN LISTENER (REAL MODE) ---
  useEffect(() => {
    if (REAL_MODE && anonAdhaar.status === "logged-in") {
      console.log("✅ Real SDK Login Detected!", anonAdhaar.anonAadhaarProofs);
      onQrFound(JSON.stringify(anonAdhaar.anonAadhaarProofs)); 
    }
  }, [anonAdhaar.status, onQrFound]);

  // --- CAMERA LOGIC (DEMO MODE) ---
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    if (!REAL_MODE && mode === "camera") {
       setTimeout(() => {
        const element = document.getElementById("reader");
        if(element) {
          scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
          );
          scanner.render(
            (decodedText) => {
              scanner?.clear();
              onQrFound(decodedText);
              setMode("select");
            },
            (error) => {/* ignore background errors */}
          );
        }
       }, 100);
    }
    return () => {
      if (scanner) scanner.clear().catch(console.error);
    };
  }, [mode, onQrFound]); 

  // --- SECURE PDF CONVERTER 🔐 (DEMO MODE ONLY) ---
  const convertPdfToImage = async (file: File): Promise<Blob> => {
    const masterBuffer = await file.arrayBuffer();

    const loadPdfStrict = async (password?: string) => {
      try {
        const bufferClone = masterBuffer.slice(0);
        const loadingTask = pdfjsLib.getDocument({ data: bufferClone, password: password });
        const pdf = await loadingTask.promise;
        await pdf.getPage(1); 
        return pdf;
      } catch (error: any) {
        if (error.name === "PasswordException" || error.message.includes("Password")) {
          throw new Error("PASSWORD_REQUIRED");
        }
        throw error;
      }
    };

    let pdf;
    try {
      setLoadingText("Checking PDF...");
      pdf = await loadPdfStrict();
    } catch (error: any) {
      if (error.message === "PASSWORD_REQUIRED") {
        const userPassword = window.prompt("🔒 This PDF is locked.\n\nPlease enter the password (e.g. 1234):");
        if (!userPassword) throw new Error("Password cancelled");

        try {
          setLoadingText("Unlocking..."); 
          pdf = await loadPdfStrict(userPassword);
        } catch (retryError: any) {
          if (retryError.name === "PasswordException" || retryError.message?.includes("Password")) {
             alert("❌ Incorrect password. Please try again."); 
             throw new Error("Handled: Incorrect password");
          } else {
             alert("⚠️ Password Accepted, but PDF failed to load.\n\nError: " + retryError.message);
             throw new Error("Handled: PDF Error");
          }
        }
      } else {
        throw error;
      }
    }

    setLoadingText("Scanning...");
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 3.0 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context!, viewport }).promise;

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("PDF conversion failed"));
      }, "image/png");
    });
  };

  // --- DEMO FILE UPLOAD HANDLER 🧠 ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setLoading(true);
      setMode("processing");
      const originalFile = e.target.files[0];
      e.target.value = ""; 

      try {
        if (originalFile.type === "application/pdf") {
          await convertPdfToImage(originalFile);
          alert("✅ PDF Unlocked! Extracting data...");
          onQrFound("DEMO_PDF_DATA");
        } else {
          setLoadingText("Scanning Image...");

          if (!REAL_MODE){
            try {
                  const html5QrCode = new Html5Qrcode("reader-hidden");
                  const decodedText = await html5QrCode.scanFile(originalFile, true);
                await new Promise((resolve) => setTimeout(resolve, 1500));
              onQrFound(decodedText);
              
            }catch(scanError){
              setErrorMessage("No valid QR code found in this image.");
              setMode("error");
              setTimeout(() => {
                setLoading(false);
                setMode("select");
              }, 2500);
              
              throw new Error("Handled: No QR Code found in image.");
            }
          }
        }
      } catch (err: any) {
        if (err.message.includes("Handled") || err.message === "Password cancelled") {
        } else {
          alert("⚠️ Error processing file. Please ensure it is a valid document.");
        }
      } 
    }
  };

  // --- DIRECT CLICK HANDLER FOR REAL MODE ---
  const triggerRealSdkPopup = () => {
    const btn = sdkButtonRef.current?.querySelector("button");
    if (btn) {
      btn.click();
    } else {
      alert("Still loading the ZK Engine... Please try again in a second.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100">
      
      {/* HEADER (Clean, Static, Professional) */}
      <div className="bg-gray-50 p-6 border-b border-gray-100 text-center">
        <h2 className="text-2xl font-black text-gray-900 mb-1">PrivaSetu Protocol</h2>
        <p className="text-xs text-gray-500 mb-2">Zero-Knowledge Age Verification</p>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          {REAL_MODE ? "🟢 LIVE MODE (Real SDK)" : "🔴 DEMO MODE (Simulation)"}
        </p>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="p-6 h-64 flex flex-col justify-center relative bg-white">
  
       {/* 1. REAL MODE UI (Single High-Tech Button + Hidden Ref) */}
       {mode === "select" && REAL_MODE && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            
            {/* The Custom UI the user sees (Now actually clickable!) */}
            <motion.div
              onClick={triggerRealSdkPopup}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex flex-col items-center justify-center w-full p-8 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl transition-all cursor-pointer overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-green-500 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <span className="text-5xl mb-3">🛡️</span>
              <span className="font-bold text-white text-lg tracking-wide">Initialize ZK Protocol</span>
              <p className="text-green-400 text-xs mt-2 font-mono">Status: Connected to SNARK Engine</p>
            </motion.div>

            {/* The Official SDK Button (Hidden safely off-screen) */}
            <div ref={sdkButtonRef} style={{ position: "absolute", top: -9999, left: -9999 }}>
               <LogInWithAnonAadhaar nullifierSeed={1234} />
            </div>

            <p className="text-[10px] text-gray-400 mt-4 text-center">Warning: Real cryptographic proving may take 1-3 minutes depending on device memory.</p>
          </div>
        )}

        {/* 2. DEMO MODE UI (Two Buttons for quick presentation) */}
        {mode === "select" && !REAL_MODE && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode("camera")}
              className="flex flex-col items-center justify-center p-6 bg-blue-50 border-2 border-blue-100 rounded-xl hover:bg-blue-100 transition-all shadow-sm"
            >
              <span className="text-4xl mb-2">📷</span>
              <span className="font-semibold text-blue-900">Scan Card</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode("file")}
              className="flex flex-col items-center justify-center p-6 bg-purple-50 border-2 border-purple-100 rounded-xl hover:bg-purple-100 transition-all shadow-sm"
            >
              {loading ? <span className="text-4xl mb-2 animate-spin">⚙️</span> : <span className="text-4xl mb-2">📂</span>}
              <span className="font-semibold text-purple-900">{loading ? "Processing" : "Upload File"}</span>
            </motion.button>
          </motion.div>
        )}

        {/* DEMO CAMERA SCREEN */}
        {mode === "camera" && !REAL_MODE && (
          <div className="text-center">
            <div id="reader" className="overflow-hidden rounded-lg mb-4 bg-black shadow-inner"></div>
            <button onClick={() => setMode("select")} className="text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors">← Back to Menu</button>
          </div>
        )}

        {/* DEMO UPLOAD SCREEN */}
        {mode === "file" && !REAL_MODE && (
          <div className="text-center">
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-10 bg-gray-50 mb-4 cursor-pointer hover:bg-gray-100 hover:border-blue-300 transition-all"
              onClick={() => !loading && fileInputRef.current?.click()} 
            >
              <span className="text-4xl block mb-2">📄</span>
              <span className="text-gray-600 font-bold text-lg">Click to Select File</span>
              <p className="text-xs text-gray-400 mt-2">Supports JPG, PNG, and PDF</p>
            </div>
            <button onClick={() => setMode("select")} className="text-sm text-gray-500 font-bold hover:text-gray-800 transition-colors">← Back to Menu</button>
          </div>
        )}

        {/* PROCESSING UI (Demo Mode) */}
        {mode === "processing" && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full border-2 border-dashed border-blue-200 rounded-xl bg-blue-50"
          >
             <div className="text-4xl mb-4 animate-bounce">🔐</div>
             <h3 className="font-bold text-blue-900">{loadingText}</h3>
          </motion.div>
        )}
        {/* ERROR UI (No more browser alerts!) */}
        {mode === "error" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center h-full border-2 border-dashed border-red-300 rounded-xl bg-red-50 p-6 text-center"
          >
             <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }} 
                transition={{ duration: 0.5 }}
                className="text-5xl mb-4"
             >
               ⚠️
             </motion.div>
             <h3 className="font-bold text-red-700 text-lg mb-2">Scan Failed</h3>
             <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          </motion.div>
        )}
        
        {/* HIDDEN FILE INPUT & SCANNER */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*, application/pdf" className="hidden" />
        <div id="reader-hidden" className="hidden"></div>
      </div>
    </div>
    
  );
}