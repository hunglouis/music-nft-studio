"use client";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const NFT_ADDRESS = "0x134631767F62f5E8aE3feF85306f4B950401AEd9";
const MARKET_ADDRESS = "0xeAaF6D56CB6A4382F5E1A5721177e27e9F6F3543";

const nftABI = [   {     "inputs": [],     "stateMutability": "nonpayable",     "type": "constructor"   },   {     "inputs": [       {         "internalType": "address",         "name": "sender",         "type": "address"       },       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       },       {         "internalType": "address",         "name": "owner",         "type": "address"       }     ],     "name": "ERC721IncorrectOwner",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "operator",         "type": "address"       },       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "ERC721InsufficientApproval",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "approver",         "type": "address"       }     ],     "name": "ERC721InvalidApprover",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "operator",         "type": "address"       }     ],     "name": "ERC721InvalidOperator",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "owner",         "type": "address"       }     ],     "name": "ERC721InvalidOwner",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "receiver",         "type": "address"       }     ],     "name": "ERC721InvalidReceiver",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "sender",         "type": "address"       }     ],     "name": "ERC721InvalidSender",     "type": "error"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "ERC721NonexistentToken",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "owner",         "type": "address"       }     ],     "name": "OwnableInvalidOwner",     "type": "error"   },   {     "inputs": [       {         "internalType": "address",         "name": "account",         "type": "address"       }     ],     "name": "OwnableUnauthorizedAccount",     "type": "error"   },   {     "inputs": [],     "name": "ReentrancyGuardReentrantCall",     "type": "error"   },   {     "anonymous": false,     "inputs": [       {         "indexed": true,         "internalType": "address",         "name": "owner",         "type": "address"       },       {         "indexed": true,         "internalType": "address",         "name": "approved",         "type": "address"       },       {         "indexed": true,         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "Approval",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": true,         "internalType": "address",         "name": "owner",         "type": "address"       },       {         "indexed": true,         "internalType": "address",         "name": "operator",         "type": "address"       },       {         "indexed": false,         "internalType": "bool",         "name": "approved",         "type": "bool"       }     ],     "name": "ApprovalForAll",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": true,         "internalType": "address",         "name": "previousOwner",         "type": "address"       },       {         "indexed": true,         "internalType": "address",         "name": "newOwner",         "type": "address"       }     ],     "name": "OwnershipTransferred",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": true,         "internalType": "address",         "name": "from",         "type": "address"       },       {         "indexed": true,         "internalType": "address",         "name": "to",         "type": "address"       },       {         "indexed": true,         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "Transfer",     "type": "event"   },   {     "inputs": [       {         "internalType": "address",         "name": "to",         "type": "address"       },       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "approve",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "owner",         "type": "address"       }     ],     "name": "balanceOf",     "outputs": [       {         "internalType": "uint256",         "name": "",         "type": "uint256"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "getApproved",     "outputs": [       {         "internalType": "address",         "name": "",         "type": "address"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "owner",         "type": "address"       },       {         "internalType": "address",         "name": "operator",         "type": "address"       }     ],     "name": "isApprovedForAll",     "outputs": [       {         "internalType": "bool",         "name": "",         "type": "bool"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "recipient",         "type": "address"       }     ],     "name": "mintNFT",     "outputs": [       {         "internalType": "uint256",         "name": "",         "type": "uint256"       }     ],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [],     "name": "name",     "outputs": [       {         "internalType": "string",         "name": "",         "type": "string"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "nextTokenId",     "outputs": [       {         "internalType": "uint256",         "name": "",         "type": "uint256"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "owner",     "outputs": [       {         "internalType": "address",         "name": "",         "type": "address"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "ownerOf",     "outputs": [       {         "internalType": "address",         "name": "",         "type": "address"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "platformAdmin",     "outputs": [       {         "internalType": "address",         "name": "",         "type": "address"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "platformFee",     "outputs": [       {         "internalType": "uint256",         "name": "",         "type": "uint256"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "renounceOwnership",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "from",         "type": "address"       },       {         "internalType": "address",         "name": "to",         "type": "address"       },       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "safeTransferFrom",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "from",         "type": "address"       },       {         "internalType": "address",         "name": "to",         "type": "address"       },       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       },       {         "internalType": "bytes",         "name": "data",         "type": "bytes"       }     ],     "name": "safeTransferFrom",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "operator",         "type": "address"       },       {         "internalType": "bool",         "name": "approved",         "type": "bool"       }     ],     "name": "setApprovalForAll",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "bytes4",         "name": "interfaceId",         "type": "bytes4"       }     ],     "name": "supportsInterface",     "outputs": [       {         "internalType": "bool",         "name": "",         "type": "bool"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "symbol",     "outputs": [       {         "internalType": "string",         "name": "",         "type": "string"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "tokenURI",     "outputs": [       {         "internalType": "string",         "name": "",         "type": "string"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "from",         "type": "address"       },       {         "internalType": "address",         "name": "to",         "type": "address"       },       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "transferFrom",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "address",         "name": "newOwner",         "type": "address"       }     ],     "name": "transferOwnership",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "stateMutability": "payable",     "type": "receive"   } ] ;

const marketABI = [   {     "inputs": [       {         "internalType": "address",         "name": "_nftContractAddress",         "type": "address"       },       {         "internalType": "uint256",         "name": "_feePercent",         "type": "uint256"       },       {         "internalType": "address",         "name": "_feeRecipient",         "type": "address"       }     ],     "stateMutability": "nonpayable",     "type": "constructor"   },   {     "inputs": [],     "name": "ReentrancyGuardReentrantCall",     "type": "error"   },   {     "anonymous": false,     "inputs": [       {         "indexed": false,         "internalType": "uint256",         "name": "newFeePercent",         "type": "uint256"       },       {         "indexed": false,         "internalType": "address",         "name": "newFeeRecipient",         "type": "address"       }     ],     "name": "FeeUpdated",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": false,         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "Minted",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": false,         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       },       {         "indexed": false,         "internalType": "address",         "name": "seller",         "type": "address"       }     ],     "name": "NFTCancelled",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": false,         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       },       {         "indexed": false,         "internalType": "address",         "name": "seller",         "type": "address"       },       {         "indexed": false,         "internalType": "uint256",         "name": "price",         "type": "uint256"       }     ],     "name": "NFTListed",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": false,         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       },       {         "indexed": false,         "internalType": "address",         "name": "buyer",         "type": "address"       },       {         "indexed": false,         "internalType": "address",         "name": "seller",         "type": "address"       },       {         "indexed": false,         "internalType": "uint256",         "name": "price",         "type": "uint256"       }     ],     "name": "NFTSold",     "type": "event"   },   {     "anonymous": false,     "inputs": [       {         "indexed": true,         "internalType": "address",         "name": "to",         "type": "address"       },       {         "indexed": false,         "internalType": "uint256",         "name": "amount",         "type": "uint256"       }     ],     "name": "Withdrawn",     "type": "event"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "buyNFT",     "outputs": [],     "stateMutability": "payable",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       }     ],     "name": "cancelListing",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [],     "name": "feePercent",     "outputs": [       {         "internalType": "uint256",         "name": "",         "type": "uint256"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "feeRecipient",     "outputs": [       {         "internalType": "address",         "name": "",         "type": "address"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "tokenId",         "type": "uint256"       },       {         "internalType": "uint256",         "name": "price",         "type": "uint256"       }     ],     "name": "listNFT",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "",         "type": "uint256"       }     ],     "name": "listings",     "outputs": [       {         "internalType": "address",         "name": "seller",         "type": "address"       },       {         "internalType": "uint256",         "name": "price",         "type": "uint256"       },       {         "internalType": "bool",         "name": "isActive",         "type": "bool"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [],     "name": "nftContract",     "outputs": [       {         "internalType": "contract IERC721",         "name": "",         "type": "address"       }     ],     "stateMutability": "view",     "type": "function"   },   {     "inputs": [       {         "internalType": "uint256",         "name": "_feePercent",         "type": "uint256"       },       {         "internalType": "address",         "name": "_feeRecipient",         "type": "address"       }     ],     "name": "updateFee",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   },   {     "inputs": [],     "name": "withdraw",     "outputs": [],     "stateMutability": "nonpayable",     "type": "function"   } ]

export default function Page() {
  const [wallet, setWallet] = useState(null);
  const [signer, setSigner] = useState(null);
  const [nfts, setNfts] = useState([]);
  const [status, setStatus] = useState("");

  // 🔌 CONNECT WALLET
  const connectWallet = async () => {
	  if (!window.ethereum) {
    alert("Cài MetaMask đi bro 😄");
	  return;}
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
	const accounts = await provider.send("eth_requestAccounts", []);

    setWallet(accounts[0]);
    setSigner(signer);
  };

  // 🎨 LOAD NFT (demo fake + sau sẽ thay bằng thật)
  useEffect(() => {
  if (window.ethereum) {
    console.log("MetaMask detected");
  } else {
    console.log("No wallet");
  }
}, []);
  useEffect(() => {
	const demo = Array.from({ length: 6 }).map((_, i) => ({
      tokenId: i,
      image: `https://picsum.photos/300?random=${i}`,
      price: "0.01"
    }));
    setNfts(demo);
	
  }, []);

  // 🟢 MINT
 const mintNFT = async () => {
  try {
    setStatus("📤 Đang upload ảnh...");

    // 🟢 upload ảnh
    const formData = new FormData();
    formData.append("file", selectedFile);

    const uploadRes = await fetch("/api/pinata", {
      method: "POST",
      body: formData,
    });

    const uploadJSON = await uploadRes.json();
    const imageIPFS = uploadJSON.image;

    // 🟡 tạo metadata
    setStatus("🧠 Đang tạo metadata...");

    const metadata = {
      name: nftData.name,
      description: nftData.desc,
      image: imageIPFS,
    };

    const metaRes = await fetch("/api/pinata-json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });
const tokenId = await contract.nextTokenId() - 1;
    const metaJSON = await metaRes.json();
    const tokenURI = metaJSON.uri;

    // 🔵 mint
    setStatus("🪙 Đang mint NFT...");

    const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

    const tx = await contract.mintNFT(tokenURI);
    await tx.wait();

    setStatus("🎉 Hoàn tất!");

  } catch (err) {
    console.error(err);
    setStatus("❌ Lỗi: " + err.message);
  }
};


  // 🟡 APPROVE
  const approve = async () => {
    const contract = new ethers.Contract(NFT_ADDRESS, nftABI, signer);
    const tx = await contract.setApprovalForAll(MARKET_ADDRESS, true);
    await tx.wait();
    setStatus("✅ Approved");
  };

  // 🟠 LIST
  const listNFT = async (id) => {
    const price = prompt("Nhập giá (ETH):");
    if (!price) return;

    const contract = new ethers.Contract(MARKET_ADDRESS, marketABI, signer);

    const tx = await contract.listItem(
      NFT_ADDRESS,
      id,
      ethers.parseEther(price)
    );

    await tx.wait();
    setStatus("📦 Đã list NFT");
  };

  // 🔵 BUY
  const buyNFT = async (id, price) => {
    const contract = new ethers.Contract(MARKET_ADDRESS, marketABI, signer);

    const tx = await contract.buyItem(NFT_ADDRESS, id, {
      value: ethers.parseEther(price),
    });

    await tx.wait();
    setStatus("💰 Mua thành công!");
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>🔥 ManhHung NFT Marketplace</h1>

      {!wallet ? (
        <button onClick={connectWallet}>
          🔌 Connect MetaMask
        </button>
      ) : (
        <>
          <p>👤 {wallet}</p>

          <button onClick={mintNFT}>🟢 Mint NFT</button>
          <button onClick={approve}>🟡 Approve</button>

          {/* GRID NFT */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "20px",
            marginTop: "20px"
          }}>
            {nfts.map((nft) => (
              <div key={nft.tokenId} style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "10px",
                background: "#fff",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
              }}>
                
                <img
                  src={nft.image}
                  style={{
                    width: "100%",
                    borderRadius: "10px"
                  }}
                />

                <h3>NFT #{nft.tokenId}</h3>
                <p>💰 {nft.price} MATIC</p>

                <button onClick={() => listNFT(nft.tokenId)}>
                  🟠 List
                </button>

                <button onClick={() => buyNFT(nft.tokenId, nft.price)}>
                  🔵 Buy
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <p style={{ marginTop: 20 }}>📢 {status}</p>
    </div>
  );
}


// --- HỆ THỐNG STYLES - BẢN GỐC ---
const styles = {
  container: { backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '120px 40px' },
  navbar: { position: 'fixed', top: '15px', left: '20px', right: '20px', backgroundColor: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'space-between', padding: '15px 30px', borderRadius: '100px', border: '1px solid #333', zIndex: 1000 },
  navLogo: { fontSize: '20px', fontWeight: '900' },
  visitBadge: { color: '#6366f1', fontSize: '11px', fontWeight: 'bold', border: '1px solid rgba(99,102,241,0.2)', padding: '5px 15px', borderRadius: '50px', backgroundColor: 'rgba(99,102,241,0.05)' },
  btnNav: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  sectionMax: { maxWidth: '650px', margin: '0 auto 60px' },
  cardGlass: { backgroundColor: 'rgba(255,255,255,0.03)', padding: '35px', borderRadius: '32px', border: '1px solid #222', backdropFilter: 'blur(15px)' },
  feeNotice: { backgroundColor: 'rgba(99, 102, 241, 0.03)', padding: '15px', borderRadius: '15px', marginBottom: '25px', border: '1px solid rgba(99, 102, 241, 0.1)' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '14px', color: '#fff', outline: 'none' },
  btnActionPrimary: { width: '100%', padding: '16px', backgroundColor: '#6366f1', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
  nftCard: { backgroundColor: '#111', borderRadius: '28px', overflow: 'hidden', border: '1px solid #222', transition: '0.4s' },
  imageWrapper: { position: 'relative', aspectRatio: '1/1' },
  nftImage: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' },
  playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(99, 102, 241, 0.9)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', cursor: 'pointer' },
  nftContent: { padding: '20px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' },
  btnBuy: { backgroundColor: '#fff', color: '#000', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  btnOffer: { backgroundColor: 'transparent', color: '#555', padding: '10px 20px', borderRadius: '12px', border: '1px solid #333' },
  sectionFull: { marginTop: '80px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '45px', borderRadius: '35px', border: '1px solid #222' },
  historyBox: { display: 'flex', flexDirection: 'column', gap: '18px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' },
  gridSmall: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' },
  nftCardSmall: { backgroundColor: '#000', borderRadius: '20px', border: '1px solid #222', overflow: 'hidden' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#111', padding: '35px', borderRadius: '30px', width: '380px', textAlign: 'center', border: '1px solid #333' },
  modalContentQR: { backgroundColor: '#111', padding: '35px', borderRadius: '30px', width: '420px', border: '1px solid #333' },
  fixedPlayer: { position: 'fixed', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(20px)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '25px', border: '1px solid #333', zIndex: 3000 },
  btnConnect: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  container: { backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '120px 40px 150px' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', position: 'fixed', top: '15px', left: '20px', right: '20px', backgroundColor: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(15px)', borderRadius: '100px', border: '1px solid #333', zIndex: 2000 },
  navLogo: { fontSize: '20px', fontWeight: '900' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  navItem: { color: '#888', fontSize: '14px', cursor: 'pointer' },
  authGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#111', padding: '5px 15px', borderRadius: '50px' },
  btnNavText: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px' },
  divider: { width: '1px', height: '15px', backgroundColor: '#333', margin: '0 15px' },
  btnConnect: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  
  mintSection: { maxWidth: '600px', margin: '0 auto 60px' },
  card: { backgroundColor: '#111', padding: '30px', borderRadius: '24px', border: '1px solid #222' },
  input: { width: '100%', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', color: '#fff' },
  btnMint: { width: '100%', padding: '15px', backgroundColor: '#6366f1', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' },
  btnDisabled: { width: '100%', padding: '15px', backgroundColor: '#333', color: '#888', borderRadius: '12px', border: 'none', marginTop: '20px' },
  statusText: { textAlign: 'center', marginTop: '10px', color: '#6366f1', fontSize: '13px' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
  nftCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: '0.4s' },
  imageWrapper: { position: 'relative', aspectRatio: '1/1' },
  nftImage: { width: '100%', height: '100%', objectFit: 'cover' },
  playOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: '0.3s', cursor: 'pointer' },
  playIcon: { width: '60px', height: '60px', backgroundColor: '#6366f1', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' },
  nftContent: { padding: '20px' },
  nftTitle: { fontSize: '18px', fontWeight: '800', marginBottom: '5px' },
  nftArtist: { fontSize: '13px', color: '#888', marginBottom: '15px' },
  nftFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceValue: { fontWeight: 'bold', color: '#6366f1' },
  btnBuySmall: { padding: '8px 15px', backgroundColor: '#fff', color: '#000', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },

  fixedPlayer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(15px)', padding: '15px 40px', borderTop: '1px solid #333', zIndex: 3000 },
  playerContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  trackInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  miniCover: { width: '50px', height: '50px', borderRadius: '8px' },
  miniTitle: { fontWeight: 'bold', fontSize: '14px' },
  miniArtist: { fontSize: '12px', color: '#888' },
  mainVideo: { height: '60px', borderRadius: '8px' },
  btnClose: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 },
  modalContent: { backgroundColor: '#111', padding: '40px', borderRadius: '32px', width: '400px', textAlign: 'center', border: '1px solid #333' },
  modalInput: { width: '100%', padding: '15px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' },
  btnActionPrimary: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' },
  
  toastContainer: { position: 'fixed', bottom: '100px', right: '30px', backgroundColor: '#6366f1', padding: '15px 25px', borderRadius: '15px', zIndex: 5000 },
  toastMessage: { color: '#fff', fontWeight: 'bold' },
  btnChat: {
    padding: '8px 15px',
    backgroundColor: '#0068ff', // Màu xanh Zalo đặc trưng
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
    transition: '0.3s',
  },
  input: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '15px',
  },
  customFileBtn: {
    display: 'block',
    padding: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '2px dashed rgba(99, 102, 241, 0.4)',
    borderRadius: '14px',
    color: '#6366f1',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '20px',
    transition: '0.3s',
  },
  btnMint: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(90deg, #6366f1, #a855f7)', // Gradient rực rỡ
    color: '#fff',
    borderRadius: '16px',
    border: 'none',
    fontWeight: '800',
    fontSize: '16px',
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s ease',
  },
  authInfo: { fontSize: '13px', color: '#888', marginBottom: '15px', textAlign: 'center' },
  uploadBox: { border: '2px dashed #333', borderRadius: '15px', padding: '20px', textAlign: 'center', marginBottom: '15px' },
  fileLabel: { cursor: 'pointer', color: '#6366f1', fontWeight: 'bold' },
  loginInvite: { padding: '40px', textAlign: 'center', backgroundColor: '#111', borderRadius: '25px', border: '1px solid #222' },
  nftStats: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', margin: '15px 0' },
  priceText: { color: '#6366f1', fontWeight: 'bold', fontSize: '15px' },
  btnZalo: { width: '100%', padding: '12px', backgroundColor: '#0068ff', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
// Thêm vào styles
  fileInputCustom: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#fff',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  loginInvite: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '24px',
    border: '1px dashed #333',
    maxWidth: '600px',
    margin: '0 auto 60px',
  },
  feeNotice: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    textAlign: 'left'
  },
  feeList: {
    fontSize: '12px',
    color: '#aaa',
    lineHeight: '1.8',
    paddingLeft: '20px',
    listStyleType: 'disc'
  },
  visitBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#6366f1',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  btnVietQR: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#fff',
    color: '#0056b3', // Màu xanh đặc trưng BIDV
    borderRadius: '12px',
    border: '1px solid #0056b3',
    fontWeight: 'bold',
    marginTop: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  historySection: { marginTop: '80px', padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid #222' },
  historyTitle: { fontSize: '24px', fontWeight: '800', marginBottom: '25px', textAlign: 'center' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #222' },
  txStatus: { backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', marginRight: '15px' },
  txNftName: { fontSize: '16px', color: '#fff' },
  txPrice: { color: '#6366f1', fontWeight: 'bold', marginLeft: '20px' },
  txTime: { color: '#555', fontSize: '12px', marginLeft: '20px' },
  qrModalContent: {
    backgroundColor: '#111',
    padding: '30px',
    borderRadius: '24px',
    width: '380px',
    textAlign: 'center',
    border: '1px solid #333',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  qrHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  qrDesc: { fontSize: '14px', color: '#aaa', marginBottom: '20px' },
  qrImageContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '20px' },
  qrImage: { width: '100%', height: 'auto', display: 'block' },
  btnDone: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#6366f1', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    fontWeight: 'bold', 
    marginTop: '15px',
    cursor: 'pointer'
  },

};