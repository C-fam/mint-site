/****************************************
 *  C's Family NFT Frontend (Ethers.js v6)
 ****************************************/

//--------------[Monad Devnet]-------------- 
const CONTRACT_ADDRESS = "0x166de946D5B0DFDa72cc5ECccE3Bbcf9fee6C427";
const REQUIRED_CHAIN_ID_DEC = 20143; 
// ---------------------------------------

/*
// --------------[Sepolia]--------------
const CONTRACT_ADDRESS = "0x1314EdC0D8119C0bbd75bb6151cc837e5Ea2BfE1";
const REQUIRED_CHAIN_ID_DEC = 11155111; 
// ---------------------------------------
*/

// ABI
const CONTRACT_ABI = [
  "function mint() external",
  "function mintedSoFar() external view returns (uint256)"
];

// DOM elements
const connectWalletBtn = document.getElementById("connectWalletBtn");
const walletStatus = document.getElementById("walletStatus");
const mintBtn = document.getElementById("mintBtn");
const mintedSoFarDisplay = document.getElementById("mintedSoFar");

// Global variables
let provider, signer, csFamilyContract;

// On page load, just check if MetaMask is installed
window.addEventListener("load", () => {
  console.log("Script loaded. Checking for MetaMask...");
  if (typeof window.ethereum === "undefined") {
    walletStatus.textContent = "No wallet found. Please install MetaMask.";
  }
});

// Connect wallet button
connectWalletBtn.addEventListener("click", async () => {
  console.log("Connect Wallet button clicked!");
  if (!window.ethereum) {
    alert("No wallet provider found. Please install MetaMask.");
    return;
  }

  try {
    // Request accounts
    console.log("Requesting eth_requestAccounts...");
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Accounts returned:", accounts);

    if (accounts.length === 0) {
      alert("No accounts returned. Please check your MetaMask.");
      return;
    }

    // Check chain ID to ensure user is on Sepolia
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    console.log("chainIdHex:", chainIdHex);

    const chainIdDec = parseInt(chainIdHex, 16);
    if (chainIdDec !== REQUIRED_CHAIN_ID_DEC) {
      alert("Please switch to Sepolia (chainId 11155111) in your wallet and then reconnect.");
      return;
    }

    // If chain is correct, continue
    const account = accounts[0];
    walletStatus.textContent = `Connected: ${account}`;

    // Setup Ethers with the browser provider
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    csFamilyContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    // Update minted count
    await updateMintedCount();

  } catch (error) {
    console.error("Connect wallet error:", error);
    walletStatus.textContent = "Connection error";
  }
});

// Mint button
mintBtn.addEventListener("click", async () => {
  console.log("Mint button clicked!");
  try {
    if (!csFamilyContract) {
      alert("Please connect your wallet on Sepolia first.");
      return;
    }

    console.log("Calling csFamilyContract.mint()...");
    const txResponse = await csFamilyContract.mint();
    console.log("Transaction sent. Waiting for confirmation...");
    const txReceipt = await txResponse.wait();
    console.log("Transaction confirmed:", txReceipt);

    alert("NFT minted successfully!");

    // Update minted count
    await updateMintedCount();

    // Open Sepolia Etherscan in a new tab with the transaction hash
    const explorerUrl = "https://sepolia.etherscan.io/tx/" + txReceipt.transactionHash;
    window.open(explorerUrl, "_blank");

  } catch (error) {
    console.error("Mint error:", error);
    alert(error.message || "Mint failed.");
  }
});

// Fetch mintedSoFar() and display "X / 50"
async function updateMintedCount() {
  try {
    console.log("Fetching mintedSoFar()...");
    const mintedSoFar = await csFamilyContract.mintedSoFar();
    console.log("mintedSoFar:", mintedSoFar.toString());

    mintedSoFarDisplay.textContent = mintedSoFar.toString();
  } catch (error) {
    console.error("Error updating minted count:", error);
  }
}
