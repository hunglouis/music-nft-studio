"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function NFTDetail() {
  const { id } = useParams();

  const [nft, setNFT] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  // 🔌 connect wallet
  const connectWallet = async () => {
    if (!window.ethereum) return;

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0].toLowerCase());
  };

  // 🔥 load NFT
  const loadNFT = async () => {
    const res = await fetch(
      `https://music-nft-studio.onrender.com/nfts/${id}`
    );

    const data = await res.json();
    setNFT(data);

    if (wallet && data.owner) {
      setIsOwner(wallet === data.owner.toLowerCase());
    }
  };

  // 🚀 realtime update
  useEffect(() => {
    loadNFT();

    const channel = supabase
      .channel("nft-detail")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "nfts",
          filter: `id=eq.${id}`,
        },
        () => {
          loadNFT();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [id, wallet]);

  // 🎧 PLAY AUDIO
  const handlePlay = async () => {
    if (!wallet) {
      alert("Connect wallet first");
      return;
    }

    const token = await fetch(
      "https://music-nft-studio.onrender.com/get-token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tokenId: id,
          user: wallet,
        }),
      }
    ).then((res) => res.text());

    const audio = new Audio(
      `https://music-nft-studio.onrender.com/stream?token=${token}`
    );

    audio.play();
  };

  // 💰 BUY
  const handleBuy = async () => {
    try {
      const { ethers } = await import("ethers");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        ["function buyNFT(uint256 tokenId) payable"],
        signer
      );

      const tx = await contract.buyNFT(id, {
        value: nft.price_wei,
      });

      await tx.wait();

      alert("Mua thành công 🎉");

    } catch (err) {
      console.error(err);
      alert("Buy failed");
    }
  };

  if (!nft) return <p>Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-2 gap-10">

      {/* 🎨 IMAGE */}
      <div>
        <img
          src={nft.image || "/placeholder.png"}
          className="rounded-2xl w-full"
        />
      </div>

      {/* 📄 INFO */}
      <div>
        <h1 className="text-3xl font-bold mb-4">
          NFT #{nft.id}
        </h1>

        <p className="text-gray-500">
          Owner: {nft.owner}
        </p>

        <button
          onClick={connectWallet}
          className="mt-3 bg-gray-200 px-4 py-2 rounded"
        >
          Connect Wallet
        </button>

        {/* 🎧 AUDIO */}
        <div className="mt-6">
          {isOwner ? (
            <button
              onClick={handlePlay}
              className="bg-green-500 text-white px-6 py-2 rounded-xl"
            >
              ▶ Play Full
            </button>
          ) : (
            <audio
              controls
              src={nft.preview_url}
              className="w-full"
            />
          )}
        </div>

        {/* 💰 BUY */}
        {nft.is_listed && (
          <div className="mt-6">
            <p className="text-xl font-bold">
              {Number(nft.price_wei) / 1e18} POL
            </p>

            <button
              onClick={handleBuy}
              className="mt-3 bg-black text-white px-6 py-2 rounded-xl"
            >
              Buy NFT
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
