const BACKEND = "https://music-nft-studio.onrender.com";

export const getAudioURL = (tokenId, wallet, isOwner, preview) => {
  if (isOwner) {
    return `${BACKEND}/stream?tokenId=${tokenId}&user=${wallet}`;
  }
  return preview;
};
