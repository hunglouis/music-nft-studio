"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";

import { supabase } from "../lib/supabase";
import { MUSIC_NFT_ABI } from "../lib/MusicNFTAbi";

// ⚠️ THAY BẰNG MARKETPLACE ABI THẬT
const MARKETPLACE_ABI = [
  "function listItem(address nftContract,uint256 tokenId,uint256 price) external",
  "function buyItem(address nftContract,uint256 tokenId) external payable"
];

// ⚠️ THAY BẰNG MARKETPLACE ADDRESS THẬT
	const MARKETPLACE_ADDRESS =
  "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const MUSIC_NFT_ADDRESS =
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export default function MintIntoCollection() {

  const [collections, setCollections] = useState([]);

  const [selectedCollection, setSelectedCollection] = useState("");

  const [name, setName] = useState("");

  const [description, setDescription] = useState("");

  const [imageFile, setImageFile] = useState(null);

  const [audioFile, setAudioFile] = useState(null);

  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(false);

  // 🔥 LOAD COLLECTIONS
  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {

    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    setCollections(data || []);

    if (data && data.length > 0) {
      setSelectedCollection(data[0].contract_address);
    }
  }

  // 🔥 PINATA UPLOAD
  async function uploadToPinata(file) {

    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",

        headers: {
          pinata_api_key:
            process.env.NEXT_PUBLIC_PINATA_API_KEY,

          pinata_secret_api_key:
            process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
        },

        body: formData
      }
    );

    const data = await res.json();

    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  }

  // 🔥 METADATA UPLOAD
  async function uploadMetadata(metadata) {

    const res = await fetch(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          pinata_api_key:
            process.env.NEXT_PUBLIC_PINATA_API_KEY,

          pinata_secret_api_key:
            process.env.NEXT_PUBLIC_PINATA_SECRET_KEY
        },

        body: JSON.stringify(metadata)
      }
    );

    const data = await res.json();

    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  }

  // 🚀 MAIN FLOW
  async function mintNFT() {

    try {

      if (!window.ethereum) {
        alert("Please install MetaMask");
        return;
      }

      if (!selectedCollection) {
        alert("Please select collection");
        return;
      }

      if (!imageFile || !audioFile) {
        alert("Please upload image and audio");
        return;
      }

      setLoading(true);

      // 🔌 WALLET
      const provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      const walletAddress = await signer.getAddress();

      // 🧱 NFT CONTRACT
      const nftContract = new ethers.Contract(
        selectedCollection,
        MUSIC_NFT_ABI,
        signer
      );

      // 🏪 MARKETPLACE
      const marketplace = new ethers.Contract(
        MARKETPLACE_ADDRESS,
        MARKETPLACE_ABI,
        signer
      );

      // 🔥 UPLOAD IMAGE
      console.log("Uploading image...");
      const imageUrl = await uploadToPinata(imageFile);

      // 🔥 UPLOAD AUDIO
      console.log("Uploading audio...");
      const audioUrl = await uploadToPinata(audioFile);

      // 🔥 BUILD METADATA
      const metadata = {
        name: name,
        description: description,
        image: imageUrl,
        animation_url: audioUrl
      };

      // 🔥 UPLOAD METADATA
      console.log("Uploading metadata...");
      const metadataURI = await uploadMetadata(metadata);

      console.log("Metadata URI:", metadataURI);

      // 🚀 MINT
      console.log("Minting NFT...");

      const mintTx = await nftContract.mintNFT(
        walletAddress,
        metadataURI,
        500 // 5%
      );

      const mintReceipt = await mintTx.wait();

      console.log("Mint success:", mintReceipt);

      // 🔥 GET TOKEN ID
      const transferEvent = mintReceipt.logs.find(
        (log) =>
          log.topics[0] ===
          ethers.id(
            "Transfer(address,address,uint256)"
          )
      );

      const tokenId = parseInt(
        transferEvent.topics[3],
        16
      );

      console.log("Token ID:", tokenId);

      // 🔥 APPROVE MARKETPLACE
      console.log("Approving marketplace...");

      const approveTx =
        await nftContract.approve(
          MARKETPLACE_ADDRESS,
          tokenId
        );

      await approveTx.wait();

      // 🔥 LIST NFT
      console.log("Listing NFT...");

      const priceInWei =
        ethers.parseEther(price);

      const listTx =
        await marketplace.listItem(
          selectedCollection,
          tokenId,
          priceInWei
        );

      await listTx.wait();

      // 🔥 INSERT COLLECTION IF NOT EXISTS
      const { data: existingCollection } =
        await supabase
          .from("collections")
          .select("*")
          .eq(
            "contract_address",
            selectedCollection
          )
          .single();

      if (!existingCollection) {

        await supabase
          .from("collections")
          .insert({

            contract_address:
              selectedCollection,

            collection_name:
              "Music Collection",

            creator_address:
              walletAddress,

            item_count: 1
          });
      }

      // 🔥 INSERT ITEM
      await supabase
        .from("items")
        .insert({

          token_id: tokenId.toString(),

          contract_address:
            selectedCollection,

          name: name,

          description: description,

          image_url: imageUrl,

          audio_url: audioUrl,

          music_url: audioUrl,

          metadata_url: metadataURI,

          owner_address: walletAddress,

          creator_address: walletAddress,

          price: price,

          is_for_sale: true,

          source: "internal",

          status: "active"
        });

      // 🔥 AUTO REFRESH
      window.location.href = "/";

    } catch (err) {

      console.error(err);

      alert("Mint failed");

    } finally {

      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">
        Mint Music NFT
      </h1>

      {/* COLLECTION */}
      <select
        value={selectedCollection}
        onChange={(e) =>
          setSelectedCollection(
            e.target.value
          )
        }
        className="w-full border p-3 rounded mb-4"
      >
        {collections.map((c) => (
          <option
            key={c.id}
            value={c.contract_address}
          >
            {c.collection_name}
          </option>
        ))}
      </select>

      {/* NAME */}
      <input
        type="text"
        placeholder="NFT Name"
        value={name}
        onChange={(e) =>
          setName(e.target.value)
        }
        className="w-full border p-3 rounded mb-4"
      />

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) =>
          setDescription(
            e.target.value
          )
        }
        className="w-full border p-3 rounded mb-4"
      />

      {/* PRICE */}
      <input
        type="text"
        placeholder="Price in MATIC"
        value={price}
        onChange={(e) =>
          setPrice(e.target.value)
        }
        className="w-full border p-3 rounded mb-4"
      />

      {/* IMAGE */}
      <input
        type="file"
        accept="image/*"
        onChange={(e) =>
          setImageFile(
            e.target.files[0]
          )
        }
        className="w-full border p-3 rounded mb-4"
      />

      {/* AUDIO */}
      <input
        type="file"
        accept="audio/*"
        onChange={(e) =>
          setAudioFile(
            e.target.files[0]
          )
        }
        className="w-full border p-3 rounded mb-4"
      />

      {/* BUTTON */}
      <button
        onClick={mintNFT}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded w-full"
      >
        {loading
          ? "Minting..."
          : "Mint + List NFT"}
      </button>

    </div>
  );
}