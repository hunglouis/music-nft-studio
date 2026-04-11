import { Alchemy, Network } from "alchemy-sdk";

const alchemy = new Alchemy({
  apiKey: "YOUR_ALCHEMY_API_KEY",
  network: Network.MATIC_MAINNET,
});

// 🔥 convert IPFS → HTTP
function ipfsToHttp(url) {
  if (!url) return "";
  if (url.startsWith("ipfs://")) {
    return "https://gateway.pinata.cloud/ipfs/" + url.replace("ipfs://", "");
  }
  return url;
}

// 🎧 LOAD NFT CÓ AUDIO
export async function getMusicNFTs(wallet) {
  const res = await alchemy.nft.getNftsForOwner(wallet);

  return res.ownedNfts
    .map((nft) => {
      const metadata = nft.rawMetadata || {};

      return {
        id: nft.tokenId,
        contract: nft.contract.address,

        title: metadata.name || nft.title || "No name",

        image: ipfsToHttp(
          metadata.image ||
          nft.media?.[0]?.gateway
        ),

        audio: ipfsToHttp(
          metadata.animation_url
        ),
      };
    })
    // 🔥 CHỈ GIỮ NFT CÓ NHẠC
    .filter((nft) => nft.audio);
}
