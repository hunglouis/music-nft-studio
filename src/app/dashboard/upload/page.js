"use client";

import { useState } from "react";
import axios from "axios";

export default function Upload() {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    // 🧩 1. upload preview lên IPFS
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/pinata", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    const previewURL = `https://gateway.pinata.cloud/ipfs.io/${Hash}`;

    // 🧩 2. mint NFT
    const contract = await getContract();

    const tx = await contract.mintNFT(await contract.runner.getAddress());
    const receipt = await tx.wait();

    const tokenId = receipt.logs[0].topics[3];

    alert("Mint thành công ID: " + tokenId);
  };

  return (
    <div>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload & Mint</button>
    </div>
  );
}
