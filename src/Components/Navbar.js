export default function Navbar({ wallet, connect }) {
  return (
    <div className="flex justify-between p-4">
      <h1>🎧 Music NFT</h1>

      {!wallet ? (
        <button onClick={connect}>Connect</button>
      ) : (
        <span>{wallet.slice(0,6)}...</span>
      )}
    </div>
  );
}
