use client
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

// CONFIG
const PINATA_JWT = "YOUR_PINATA_JWT";
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function MusicNFTMarketplace() {
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [songs, setSongs] = useState([]);

  const [song, setSong] = useState({ title: "", description: "", price: "" });
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    loadSongs();
  }, []);

  const signIn = async () => {
    await supabase.auth.signInWithOtp({ email: prompt("Email:") });
    alert("Check email to login");
  };

  const loadSongs = async () => {
    const { data } = await supabase.from("songs").select("*");
    setSongs(data || []);
  };

  const saveSong = async () => {
    await supabase.from("songs").insert([
      {
        title: song.title,
        description: song.description,
        price: song.price,
        user_id: user.id,
      },
    ]);
    loadSongs();
  };

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${PINATA_JWT}` },
      body: formData,
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  const mintAndList = async () => {
    const audioUrl = await uploadFile(audioFile);

    const metadata = {
      name: song.title,
      description: song.description,
      animation_url: audioUrl,
    };

    const metaRes = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify(metadata),
    });

    const metaData = await metaRes.json();
    const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metaData.IpfsHash}`;

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const contractAddress = "YOUR_CONTRACT_ADDRESS";
    const abi = [
      "function mint(address to, string memory tokenURI) public returns (uint256)",
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.mint(account, metadataUrl);
    await tx.wait();

    await supabase.from("songs").update({ nft_url: metadataUrl }).eq("title", song.title);

    alert("NFT Minted & Listed!");
    loadSongs();
  };

  const buyNFT = async (item) => {
    alert("Implement smart contract payment here (next step)");
  };

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold">💰 Music NFT Marketplace</h1>

      <Button onClick={signIn}>{user ? user.email : "Login"}</Button>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <Input placeholder="Song Title" onChange={(e) => setSong({ ...song, title: e.target.value })} />
          <Textarea placeholder="Description" onChange={(e) => setSong({ ...song, description: e.target.value })} />
          <Input placeholder="Price (MATIC)" onChange={(e) => setSong({ ...song, price: e.target.value })} />
          <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />

          <Button onClick={connectWallet}>Connect Wallet</Button>
          <Button onClick={mintAndList}>🚀 Mint & List NFT</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-bold">Marketplace</h2>
          {songs.map((s, i) => (
            <div key={i} className="border p-3 rounded mb-2">
              <strong>{s.title}</strong>
              <p>{s.description}</p>
              <p>Price: {s.price} MATIC</p>
              {s.nft_url && <a href={s.nft_url}>View NFT</a>}
              <Button onClick={() => buyNFT(s)}>Buy</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
