/****************************************
 *  C's Family NFT Frontend
 *  (Ethers.js v6)
 ****************************************/

// Contract info
const CONTRACT_ADDRESS = "0x166de946D5B0DFDa72cc5ECccE3Bbcf9fee6C427";
const CONTRACT_ABI = [
  "function mint() external",
  "function mintedSoFar() external view returns (uint256)",
  "function leftToMint() external view returns (uint256)"
];

// For safer chain detection: we'll compare decimal chain IDs (20143).
const REQUIRED_CHAIN_ID_DEC = 20143;

// DOM elements
const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletStatus = document.getElementById("walletStatus");
const mintBtn = document.getElementById("mintBtn");
const mintedSoFarDisplay = document.getElementById("mintedSoFar");
const leftToMintDisplay = document.getElementById("leftToMint");

// Global variables
let provider, signer, csFamilyContract;

// On page load, just check if MetaMask is installed
window.addEventListener("load", () => {
  if (typeof window.ethereum === "undefined") {
    walletStatus.textContent = "No wallet found. Please install MetaMask.";
  }
});

// Connect wallet button
connectWalletBtn.addEventListener("click", async () => {
  if (!window.ethereum) {
    alert("No wallet provider found. Please install MetaMask.");
    return;
  }

  try {
    // Request accounts
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts.length === 0) {
      alert("No accounts returned. Please check your MetaMask.");
      return;
    }

    // Check chain ID to ensure user is on Monad Devnet
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    const chainIdDec = parseInt(chainIdHex, 16);
    if (chainIdDec !== REQUIRED_CHAIN_ID_DEC) {
      alert("Please switch to Monad Devnet (chainId 20143) in your wallet and then reconnect.");
      return;
    }

    // If chain is correct, continue
    const account = accounts[0];
    walletStatus.textContent = `Connected: ${account}`;

    // Setup Ethers with the browser provider
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    csFamilyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Update supply info immediately
    await updateSupplyInfo();

  } catch (error) {
    console.error(error);
    walletStatus.textContent = "Connection error";
  }
});

// Mint button
mintBtn.addEventListener("click", async () => {
  try {
    if (!csFamilyContract) {
      alert("Please connect your wallet on Monad Devnet first.");
      return;
    }

    // Call contract mint()
    const txResponse = await csFamilyContract.mint();
    // Wait for transaction confirmation
    const txReceipt = await txResponse.wait();

    alert("NFT minted successfully!");

    // Update supply info
    await updateSupplyInfo();

    // Open Monad Devnet explorer in a new tab with the transaction hash
    const explorerUrl = "https://explorer.monad-devnet.devnet101.com/tx/" + txReceipt.transactionHash;
    window.open(explorerUrl, "_blank");

  } catch (error) {
    console.error("Mint error:", error);
    alert(error.message || "Mint failed.");
  }
});

// Fetch mintedSoFar() & leftToMint() and update the display
async function updateSupplyInfo() {
  try {
    const mintedSoFar = await csFamilyContract.mintedSoFar();
    const leftToMint = await csFamilyContract.leftToMint();

    mintedSoFarDisplay.textContent = mintedSoFar.toString();
    leftToMintDisplay.textContent = leftToMint.toString();
  } catch (error) {
    console.error("Error updating supply info:", error);
  }
}
