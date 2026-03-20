import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ethers } from "ethers";

// ⚠️ SET YOUR PINATA JWT HERE
const PINATA_JWT = "YOUR_PINATA_JWT";

export default function MusicNFTStudioPro() {
  const [account, setAccount] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [minting, setMinting] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const [ipfsData, setIpfsData] = useState({
    metadata: "",
    audio: "",
    video: "",
  });

  const [song, setSong] = useState({
    title: "",
    lyrics: "",
    description: "",
  });

  const [songs, setSongs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("songs") || "[]");
    setSongs(saved);
  }, []);

  const saveSong = () => {
    const newSongs = [...songs, song];
    setSongs(newSongs);
    localStorage.setItem("songs", JSON.stringify(newSongs));
  };

  // 🔗 CONNECT WALLET
  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);
    } else {
      alert("Install MetaMask");
    }
  };

  // 📤 Upload file to IPFS
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    const data = await res.json();
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  };

  // 🚀 FULL 1-CLICK PROCESS
  const mintAll = async () => {
    if (!account) return alert("Connect wallet first");
    if (!audioFile) return alert("Upload audio file");

    try {
      setUploading(true);

      // 1. Upload audio
      const audioUrl = await uploadFile(audioFile);

      // 2. Upload video (optional)
      let videoUrl = "";
      if (videoFile) {
        videoUrl = await uploadFile(videoFile);
      }

      // 3. Create metadata
      const metadata = {
        name: song.title,
        description: song.description,
        image: videoUrl || audioUrl,
        animation_url: videoUrl || audioUrl,
        attributes: [
          { trait_type: "Genre", value: "Boston" },
          { trait_type: "Mood", value: "Sentimental" }
        ]
      };

      // 4. Upload metadata
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

      setIpfsData({ metadata: metadataUrl, audio: audioUrl, video: videoUrl });

      setUploading(false);
      setMinting(true);

      // 5. Mint NFT
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contractAddress = "YOUR_CONTRACT_ADDRESS";
      const abi = [
        "function mint(address to, string memory tokenURI) public returns (uint256)",
      ];

      const contract = new ethers.Contract(contractAddress, abi, signer);

      const tx = await contract.mint(account, metadataUrl);
      await tx.wait();

      setMinting(false);

      alert("🎉 NFT Minted Successfully!");
    } catch (err) {
      console.error(err);
      alert("Process failed");
      setUploading(false);
      setMinting(false);
    }
  };

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold">🚀 Music NFT Studio Pro</h1>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2>1. Song Info</h2>
          <Input
            placeholder="Song Title"
            value={song.title}
            onChange={(e) => setSong({ ...song, title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={song.description}
            onChange={(e) => setSong({ ...song, description: e.target.value })}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2>2. Upload Files</h2>
          <Input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />
          <Input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files[0])} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2>3. Web3 Actions</h2>
          <Button onClick={connectWallet}>
            {account ? `Connected: ${account.slice(0, 6)}...` : "Connect Wallet"}
          </Button>

          <Button onClick={mintAll} disabled={uploading || minting}>
            {uploading ? "Uploading to IPFS..." : minting ? "Minting NFT..." : "🚀 1-Click Mint NFT"}
          </Button>

          {ipfsData.metadata && (
            <div className="text-sm text-green-600">
              Metadata: {ipfsData.metadata}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
