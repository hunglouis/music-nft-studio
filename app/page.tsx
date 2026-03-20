import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function MusicNFTStudioPro() {
  const [song, setSong] = useState({
    title: "",
    lyrics: "",
    description: "",
    metadata: "",
  });

  const [songs, setSongs] = useState([]);

  // Simulate API save
  const saveSong = () => {
    const newSongs = [...songs, song];
    setSongs(newSongs);
    localStorage.setItem("songs", JSON.stringify(newSongs));
  };

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("songs") || "[]");
    setSongs(saved);
  }, []);

  const generateMetadata = () => {
    const meta = JSON.stringify({
      title: song.title,
      description: song.description,
      artist: "Manh Hung",
      type: "Music NFT",
      format: "MP3/MP4",
      blockchain: "Polygon",
    }, null, 2);

    setSong({ ...song, metadata: meta });
  };

  return (
    <div className="p-6 grid gap-6">
      <h1 className="text-3xl font-bold">🚀 Music NFT Studio Pro</h1>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2 className="font-semibold">1. Song Studio</h2>
          <Input
            placeholder="Song Title"
            value={song.title}
            onChange={(e) => setSong({ ...song, title: e.target.value })}
          />
          <Textarea
            placeholder="Lyrics"
            value={song.lyrics}
            onChange={(e) => setSong({ ...song, lyrics: e.target.value })}
          />
          <Button onClick={saveSong}>Save Song</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2 className="font-semibold">2. NFT Description</h2>
          <Textarea
            placeholder="Write description..."
            value={song.description}
            onChange={(e) => setSong({ ...song, description: e.target.value })}
          />
          <Button onClick={generateMetadata}>Generate Metadata</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2 className="font-semibold">3. Metadata (JSON)</h2>
          <Textarea value={song.metadata} readOnly />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2 className="font-semibold">4. NFT Actions</h2>
          <Button>Connect Wallet</Button>
          <Button>Mint NFT</Button>
          <Button>Upload to IPFS</Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 grid gap-4">
          <h2 className="font-semibold">5. My Songs</h2>
          {songs.map((s, i) => (
            <div key={i} className="border p-2 rounded">
              <strong>{s.title}</strong>
              <p className="text-sm">{s.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
