export default function NFTCard({ nft, onBuy }) {
  return (
    <div className="bg-gray-900 rounded-2xl p-4 hover:scale-105 transition">
      <img src={nft.image} className="rounded-xl mb-3" />

      <h2 className="font-bold">{nft.name}</h2>

      <audio controls className="w-full my-2">
        <source src={nft.audio} />
      </audio>

      <div className="flex justify-between mt-2">
        <span>{nft.price} MATIC</span>
        <button onClick={onBuy}>Buy</button>
      </div>
    </div>
  );
}
