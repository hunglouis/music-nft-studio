"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useParams } from "next/navigation";

const CONTRACT_ADDRESS = "0x5c42045d492261a155dA84ea2730C91516484BDA";

const abi = [
  "function ownerOf(uint256) view returns (address)"
];

export default function NFTDetail() {
  const { id } = useParams();

  const [wallet, setWallet] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [nft, setNft] = useState({
    name: "Music NFT",
    image: "/demo.jpg",
    preview: "/preview.mp3",
    price: "0.1"
  });

  // 🔗 connect wallet
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setWallet(accounts[0]);
  };

  // 🔎 load owner từ blockchain
  useEffect(() => {
    const loadOwner = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

      const ownerAddress = await contract.ownerOf(id);

      setOwner(ownerAddress);

      if (wallet) {
        setIsOwner(ownerAddress.toLowerCase() === wallet.toLowerCase());
      }
    };

    loadOwner();
  }, [wallet, id]);

  // 🎧 audio URL
  const BACKEND = "https://music-nft-studio.onrender.com";

  const audioURL = isOwner
    ? `${BACKEND}/stream?tokenId=${id}&user=${wallet}`
    : nft.preview;

  // 💰 BUY FLOW
  const handleBuy = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        [
          "function safeTransferFrom(address from, address to, uint256 tokenId) payable"
        ],
        signer
      );

      alert("🔔 Confirm giao dịch trên MetaMask");

      const tx = await contract.safeTransferFrom(
        owner,
        wallet,
        id,
        {
          value: ethers.parseEther(nft.price)
        }
      );

      await tx.wait();

      alert("🎉 Mua thành công!");

    } catch (err) {
      console.error(err);
      alert("❌ Lỗi: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl">🎧 NFT Detail</h1>

        {!wallet ? (
          <button onClick={connectWallet}>Connect</button>
        ) : (
          <span>{wallet.slice(0,6)}...</span>
        )}
      </div>

      {/* CONTENT */}
      <div className="grid md:grid-cols-2 gap-10">

        {/* IMAGE */}
        <img src={nft.image} className="rounded-2xl" />

        {/* INFO */}
        <div>
          <h2 className="text-3xl font-bold">{nft.name}</h2>

          <p className="text-gray-400 mt-2">
            Owner: {owner}
          </p>

          {/* AUDIO */}
          <audio controls controlsList="nodownload" className="w-full mt-4">
            <source src={audioURL} />
          </audio>

          {/* PRICE */}
          <p className="text-green-400 text-xl mt-4">
            {nft.price} MATIC
          </p>

          {/* BUY BUTTON */}
          {!isOwner && wallet && (
            <button
              onClick={handleBuy}
              className="bg-green-500 px-6 py-3 rounded-xl mt-4"
            >
              Buy NFT
            </button>
          )}

          {isOwner && (
            <p className="mt-4 text-yellow-400">
              Bạn là owner NFT này
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
