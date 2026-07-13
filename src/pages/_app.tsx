import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

// 1. This is the Master Layout for the whole app.
// We have REMOVED the "Connect Wallet" button and the "Header".
// Now, it is just a pure Identity App.

export default function App({ Component, pageProps }: AppProps) {
  return (
    // We only keep this Provider. It loads the "ZK Circuits" needed to scan the QR.
    // It does NOT require a wallet connection.
    <AnonAadhaarProvider _useTestAadhaar={true}>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        
        {/* This renders your 'index.tsx' page directly, with no extra bars around it */}
        <Component {...pageProps} />
        
      </div>
    </AnonAadhaarProvider>
  );
}