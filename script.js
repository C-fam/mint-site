/****************************************
 *  C's Family NFT Frontend (Ethers.js v6)
 ****************************************/

// Monad Devnet config
const CONTRACT_ADDRESS = "0xC0113040C447204A22eC6f38898fd28cFeF9bD4C";
const REQUIRED_CHAIN_ID_DEC = 20143;

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

// On page load, check if MetaMask is installed
window.addEventListener("load", () => {
  console.log("Script loaded. Checking for MetaMask...");
  if (typeof window.ethereum === "undefined") {
    walletStatus.textContent = "No wallet found. Please install MetaMask.";
  }
});

// Connect wallet
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

    // Check chain ID
    const chainIdHex = await window.ethereum.request({ method: "eth_chainId" });
    console.log("chainIdHex:", chainIdHex);
    const chainIdDec = parseInt(chainIdHex, 16);

    if (chainIdDec !== REQUIRED_CHAIN_ID_DEC) {
      alert("Please switch to Monad Devnet (chainId 20143) and reconnect.");
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

// ▼▼▼ ここから変更なし ▼▼▼
mintBtn.addEventListener("click", async () => {
  console.log("Mint button clicked!");
  try {
    if (!csFamilyContract) {
      alert("Please connect your wallet on Monad Devnet first.");
      return;
    }

    console.log("Calling csFamilyContract.mint()...");
    const txResponse = await csFamilyContract.mint();
    console.log("Transaction sent. Waiting for confirmation...");

    const txReceipt = await txResponse.wait();
    console.log("Transaction confirmed:", txReceipt);

    // ----- ここから「alert」を置き換え -----
    // alert("NFT minted successfully!");

    // カスタムのポップアップを表示して「Share」ボタンを作る処理
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = "9999";

    const dialog = document.createElement("div");
    dialog.style.backgroundColor = "#fff";
    dialog.style.padding = "20px";
    dialog.style.borderRadius = "8px";
    dialog.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)";
    dialog.style.textAlign = "center";

    // メッセージ
    const message = document.createElement("p");
    message.textContent = "NFT minted successfully!";
    message.style.marginBottom = "1rem";
    dialog.appendChild(message);

    // シェア用の文字列
    const shareText = "Mint%20C%27s%20Family%20NFTs%20on%20the%20Monad%20Devnet%E2%80%94it%E2%80%99s%20faster%21%0A%F0%9F%91%89%20Mint%20here%3A%20https%3A%2F%2Fc-fam.github.io%2Fmint-site%2F%0ACreated%20by%20%40Cfamily_monad";
    // Twitterのintentリンク
    const tweetUrl =
      "https://x.com/intent/post?text=" + encodeURIComponent(shareText);

    // 「Share」ボタン
    const shareBtn = document.createElement("button");
    shareBtn.textContent = "Share on Twitter";
    shareBtn.style.padding = "0.5rem 1rem";
    shareBtn.style.cursor = "pointer";
    shareBtn.style.backgroundColor = "#1DA1F2";
    shareBtn.style.color = "#fff";
    shareBtn.style.border = "none";
    shareBtn.style.borderRadius = "4px";
    shareBtn.addEventListener("click", () => {
      window.open(tweetUrl, "_blank");
      document.body.removeChild(overlay);
    });
    dialog.appendChild(shareBtn);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    // ----- 置き換え終了 -----

    // Update minted count
    await updateMintedCount();

  } catch (error) {
    console.error("Mint error:", error);
    alert(error.message || "Mint failed.");
  }
});
// ▲▲▲ ここまで他の変更なし ▲▲▲

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
