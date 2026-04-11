"use client";

import { useEffect, useState } from "react";
import { usePlayer } from "@/context/PlayerContext";
const {
  ...
  shuffle,
  setShuffle,
  repeat,
  setRepeat,
} = usePlayer();

export default function PlayerBar() {
  const {
    audioRef,
    playlist,
    currentIndex,
    isPlaying,
    setIsPlaying,
    nextTrack,
    prevTrack,
  } = usePlayer();

  const current = playlist[currentIndex];

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, currentIndex]);

  const onTimeUpdate = () => {
    const percent =
      (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setProgress(percent || 0);
  };

  const onEnded = () => {
  if (repeat === "one") {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    return;
  }

  nextTrack();
};

  if (!current) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-black text-white p-3 flex items-center gap-4">

      <div className="w-40 truncate">{current.title}</div>

      <button onClick={prevTrack}>⏮</button>

      <button onClick={() => setIsPlaying(!isPlaying)}>
        {isPlaying ? "⏸" : "▶"}
      </button>

      <button onClick={nextTrack}>⏭</button>
		<button onClick={() => setShuffle(!shuffle)}>
  🔀
</button>

<button
  onClick={() =>
    setRepeat(
      repeat === "off"
        ? "all"
        : repeat === "all"
        ? "one"
        : "off"
    )
  }
>
  🔁 {repeat}
</button>

      <input
        type="range"
        value={progress}
        onChange={(e) => {
          const time =
            (e.target.value / 100) * audioRef.current.duration;
          audioRef.current.currentTime = time;
        }}
        className="w-full"
      />

      <audio
        ref={audioRef}
        src={current.url}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />
    </div>
  );
}
