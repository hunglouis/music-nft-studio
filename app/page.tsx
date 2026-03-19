"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function Home() {
  const [account, setAccount] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const connectWallet = async () => {
    if (typeof windows !=="undefined" && windows.ethereum) {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
  };else {
    alert("Vui lòng cài MetaMask");
  }
};   

  const mintNFT = async () => {
    if (typeof windows === "undefined") return;
    const provider = new ethers.BrowserProvider(windows.ethereum);
    const signer = await provider.getSigner();

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    const abi = [
      "function mintAndList(string memory tokenURI, uint256 price) public",
    ];

    const contract = new ethers.Contract(contractAddress, abi, signer);

    const tx = await contract.mintAndList(
      "https://example.com/metadata.json",
      ethers.parseEther(price)
    );

    await tx.wait();

    alert("Mint thành công!");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>🎼 Music NFT Studio</h1>

      <button onClick={connectWallet}>
        {account ? account : "Connect Wallet"}
      </button>

      <br /><br />

      <input
        placeholder="Tên bài hát"
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Giá (MATIC)"
        onChange={(e) => setPrice(e.target.value)}
      />

      <br /><br />

      <button onClick={mintNFT}>🚀 Mint NFT</button>
    </div>
  );
}
