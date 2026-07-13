# 🛡️ PrivaSetu Protocol

> **The Privacy-First Zero-Knowledge Age Verification dApp**
>

PrivaSetu is a decentralized, client-side age verification protocol built on top of the official **Anon Aadhaar SDK**. It allows Indian citizens to cryptographically prove their age (>18) to platforms without ever revealing their name, date of birth, Aadhaar number, or biometric data.

## 🚀 The Vision

Traditional identity verification requires users to hand over highly sensitive government documents (like PDFs or physical cards) to centralized servers, creating massive honeypots for data breaches.

PrivaSetu leverages **Zero-Knowledge Proofs (ZK-SNARKs)** to shift the verification process entirely to the user's local device. The server only receives a mathematically verified "True/False" receipt, ensuring 100% data privacy.

---

## 🏗️ Core Architecture & "The Flex"

Integrating ZK cryptography into a modern web app presents significant hardware challenges. PrivaSetu was engineered with a **Dual-State Architecture** to handle these physical constraints gracefully.

### 1. Production Cryptography (Real Mode)

The protocol uses the `AnonAadhaarProvider` to execute a heavy client-side **Groth16 Prover** via WebAssembly (Wasm).

* It intercepts the Indian Government's RSA-2048 digital signature from the Aadhaar secure QR code.
* It generates a ZK-SNARK proof locally, proving the RSA signature is valid and the calculated age is >18.
* **The Challenge:** Generating ZK circuits locally demands massive, contiguous RAM allocations (often 1GB+), which frequently triggers `WebAssembly.Memory.grow()` crashes on standard 8GB laptops.

### 2. Smart Fallback UI (Demo Mode)

To ensure a flawless user experience on hardware-constrained devices (or during live hackathon presentations), PrivaSetu implements a seamless `REAL_MODE` toggle.

* When hardware limits are hit, the UI gracefully falls back to a deterministic simulation of the ZK-proving process.
* It maintains the exact UI flow, cryptographic time-delays, and receipt generation, ensuring the UX remains uninterrupted while bypassing the Wasm memory crash.

---

## 🔐 Security: "Defense in Depth" Gatekeeper

PrivaSetu does not blindly trust user input. It utilizes a **Double-Layered Security Gatekeeper** to protect the WebAssembly engine from malicious data or DoS attacks.

* **Layer 1 (UI Intercept):** An asynchronous React `useEffect` instantly analyzes uploaded documents or camera scans. If the data is not a valid Secure BigInt (`/^\d+$/`) or recognized SDK JSON, it physically blocks the user from reaching the proving stage.
* **Layer 2 (Pre-Computation Lock):** Right before the heavy Groth16 math is triggered, a secondary function verifies state integrity. If the DOM was manipulated, the execution halts, saving the device from processing poisoned circuits.
* **Automatic Memory Purge:** Upon successful verification, all session keys and local data are permanently overwritten (`0x00000000`) and purged from RAM.

---

## 💻 Tech Stack

* **Framework:** Next.js / React (TypeScript)
* **Cryptography:** Anon Aadhaar SDK (Circom, SnarkJS, Groth16)
* **Styling:** Tailwind CSS & Framer Motion (Animations)
* **Hardware Interfacing:** `html5-qrcode` (Custom Headless Scanning)

---

## 🛠️ Getting Started (Local Development)

If you have a machine with 16GB+ RAM and wish to run the real Wasm cryptographic circuits locally:

**1. Clone the repository**

```bash
git clone [https://github.com/YOUR_USERNAME/Project-PrivaSetu.git](https://github.com/YOUR_USERNAME/Project-PrivaSetu.git)
cd Project-PrivaSetu
```
