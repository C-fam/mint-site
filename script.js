/****************************************
 *  C's Family NFT Frontend (Ethers.js v6)
 ****************************************/

/* -------- Config -------- */
const CONTRACT_ADDRESS   = "0xFca9b4c373f0AF8676e3F35B2cDdD5B1f519cd7a";
const REQUIRED_CHAIN_ID  = 20143;              // Monad Devnet (decimal)
const REQUIRED_CHAIN_HEX = "0x4E8F";           // 20143 in hex
const MAX_SUPPLY         = 1000;

const CONTRACT_ABI = [
  "function mint(address to) external returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

/* -------- DOM -------- */
const $ = (id) => document.getElementById(id);
const connectBtn  = $("connectWalletBtn");
const walletTxt   = $("walletStatus");
const mintBtn     = $("mintBtn");
const mintedLabel = $("mintedSoFar");

/* -------- State -------- */
let provider, signer, nft;

/* -------- Helpers -------- */
const toast = (msg) => alert(msg); // ★簡易ポップアップ（お好みで置換）

/* -------- Init -------- */
window.addEventListener("load", async () => {
  if (!window.ethereum) {
    walletTxt.textContent = "No wallet found. Install MetaMask.";
    return;
  }
  await updateMintedCount(); // read-only OK
});

/* -------- Connect Wallet -------- */
connectBtn.addEventListener("click", async () => {
  if (!window.ethereum) return toast("No wallet provider detected.");

  try {
    /* 1. チェーン確認 (自動追加) */
    const currentChain = await window.ethereum.request({ method: "eth_chainId" });
    if (parseInt(currentChain, 16) !== REQUIRED_CHAIN_ID) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: REQUIRED_CHAIN_HEX,
          chainName: "Monad Devnet",
          rpcUrls: ["https://devnet-rpc.monad.xyz"],
          nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
          blockExplorerUrls: ["https://devnet.monadexplorer.com"]
        }]
      }); // ユーザー承認待ち
    }

    /* 2. アカウント要求 */
    const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
    walletTxt.textContent = `Connected: ${account.slice(0,6)}…${account.slice(-4)}`;

    /* 3. Provider & Contract */
    provider = new ethers.BrowserProvider(window.ethereum);
    signer   = await provider.getSigner();
    nft      = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    mintBtn.disabled = false;               // ミント可能
    await updateMintedCount();

  } catch (err) {
    console.error(err);
    toast(err.message || "Wallet connection failed.");
  }
});

/* -------- Mint -------- */
mintBtn.addEventListener("click", async () => {
  if (!nft) return toast("Connect wallet first.");

  try {
    mintBtn.disabled = true; mintBtn.textContent = "Minting…";

    const tx = await nft.mint(await signer.getAddress());
    const receipt = await tx.wait();

    console.log("Minted! receipt:", receipt);
    toast("NFT minted successfully!");

    await updateMintedCount();
  } catch (err) {
    console.error(err);
    toast(err.message || "Mint failed.");
  } finally {
    mintBtn.disabled = false; mintBtn.textContent = "Mint Now";
  }
});

/* -------- Helpers -------- */
async function updateMintedCount() {
  try {
    const tmpProvider = provider ?? new ethers.JsonRpcProvider("https://devnet-rpc.monad.xyz");
    const readNft = nft ?? new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, tmpProvider);
    const minted  = Number(await readNft.totalSupply());

    /* tokenId=0 対応で「発行済み数 = 次 mint 予定 id」 */
    mintedLabel.textContent = `${minted} / ${MAX_SUPPLY}`;
  } catch (err) {
    console.error("updateMintedCount:", err);
  }
}
