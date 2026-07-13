
   export const generateMockProof =  (qrData) => {
    //this generate random hex...using SHA-256 or poseidon hash
    const randomHex = Array.from({length: 64}, () =>
     Math.floor(Math.random() * 16).toString(16)
    ).join("");

     // 2. Create Timestamp
  const timestamp = new Date().toISOString();

    return {
      pi_a: ["0x123...", "0x456..."],
    pi_b: [["0x789...", "0xabc..."], ["0xdef...", "0x012..."]],
    pi_c: ["0x345...", "0x678..."],
    protocol: "groth16",
    curve: "bn128",
    //main to look real hash
    nullifier: `0x${randomHex}`,
     timestamp: timestamp,
    ageAbove18: true,
    };
   };
