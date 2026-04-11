"use client";
import { loadPlaylist } from "@/lib/loadPlaylist";
import { useEffect } from "react";
import { usePlayer } from "@/context/PlayerContext";
import { usePlayer } from "@/context/PlayerContext";
import { isOwner } from "@/lib/checkOwner";
import { useEffect, useState } from "react";
import { getMusicNFTs } from "@/lib/alchemy";
import { usePlayer } from "@/context/PlayerContext";

export default function Home() {
  const [nfts, setNFTs] = useState([]);
  const [wallet, setWallet] = useState("");

  const { playTrack } = usePlayer();

  // 🔗 connect wallet
  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  };

  // 🎧 load NFT audio
  useEffect(() => {
    if (!wallet) return;
  useEffect(() => {
  if (!wallet) return;
   loadPlaylist(wallet).then((tracks) => {
    if (tracks.length) {
      setPlaylist(tracks);
    }
  });
}, [wallet]);
    getMusicNFTs(wallet).then(setNFTs);
  }, [wallet]);

  return (
    <div>

      {/* 🔗 CONNECT */}
      <button
        onClick={connectWallet}
        className="mb-6 bg-black text-white px-4 py-2 rounded"
      >
        Connect Wallet
      </button>
		<button
		onClick={() => savePlaylist(wallet, playlist)}
		>
		💾 Save Playlist
		</button>

      {/* 🎵 GRID */}
      <div className="grid grid-cols-4 gap-6">

        {nfts.map((nft, i) => (
          <div
            key={i}
            className="border rounded-xl overflow-hidden hover:shadow-lg transition"
          >

            {/* 🎨 IMAGE */}
            <button
  onClick={async () => {
    const owner = await isOwner(
      wallet,
      nft.contract,
      nft.id
    );

    let audioUrl;

    if (owner) {
      // 🔐 lấy link full từ backend
      const res = await fetch(
        "https://music-nft-studio.onrender.com/get-stream-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet,
            contract: nft.contract,
            tokenId: nft.id,
          }),
        }
      );

      const data = await res.json();
      audioUrl = data.url;

    } else {
      // 🎧 preview
      audioUrl = nft.audio;
    }
const { setPlaylist } = usePlayer();

    playTrack(
  {
    url: audioUrl,
    title: nft.title,
  },
  nfts.map(n => ({
    url: n.audio,
    title: n.title,
  }))
	);
  }}
  className="mt-2 w-full bg-black text-white py-2 rounded"
>
  ▶ Play
</button>

