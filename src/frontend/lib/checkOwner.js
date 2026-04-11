import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  network: Network.MATIC_MAINNET,
});

export async function isOwner(wallet, contract, tokenId) {
  const owners = await alchemy.nft.getOwnersForNft(
    contract,
    tokenId
  );

  return owners.owners.includes(wallet.toLowerCase());
}
