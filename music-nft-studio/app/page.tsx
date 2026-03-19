import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}

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
