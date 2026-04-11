import { useState } from "react";

export default function useWallet() {
  const [wallet, setWallet] = useState(null);

  const connect = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  };

  return { wallet, connect };
}
