"use client";

import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

export default function Player({ url, title }) {
  const waveformRef = useRef(null);
  const waveRef = useRef(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // 🎧 INIT WAVESURFER
  useEffect(() => {
    if (!url || !waveformRef.current) return;

    if (waveRef.current) {
      waveRef.current.destroy();
    }

    waveRef.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#ccc",
      progressColor: "#000",
      height: 60,
      cursorColor: "#000",
    });

    waveRef.current.load(url);

    // ⏱ READY
    waveRef.current.on("ready", () => {
      setDuration(waveRef.current.getDuration());
    });

    // ⏱ UPDATE TIME
    waveRef.current.on("audioprocess", () => {
      setCurrentTime(waveRef.current.getCurrentTime());
    });

    waveRef.current.on("seek", () => {
      setCurrentTime(waveRef.current.getCurrentTime());
    });

  }, [url]);

  // ▶️ PLAY / PAUSE
  const togglePlay = () => {
    waveRef.current.playPause();
    setPlaying(!playing);
  };

  // 🎯 SEEK BAR
  const handleSeek = (e) => {
    const percent = e.target.value;
    waveRef.current.seekTo(percent / 100);
  };

  // ⏱ FORMAT TIME
  const formatTime = (time) => {
    if (!time) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="fixed bottom-0 left-64 right-0 
      bg-white border-t p-4">

      <div className="flex flex-col gap-2">

        {/* 🎵 TITLE */}
        <div className="font-semibold">
          {title}
        </div>

        {/* 🌊 WAVEFORM */}
        <div ref={waveformRef}></div>

        {/* ⏱ PROGRESS BAR */}
        <div className="flex items-center gap-2">

          <span className="text-xs w-10">
            {formatTime(currentTime)}
          </span>

          <input
            type="range"
            min="0"
            max="100"
            value={
              duration
                ? (currentTime / duration) * 100
                : 0
            }
            onChange={handleSeek}
            className="flex-1"
          />

          <span className="text-xs w-10">
            {formatTime(duration)}
          </span>

        </div>

        {/* ▶️ CONTROL */}
        <div>
          <button
            onClick={togglePlay}
            className="bg-black text-white px-4 py-2 rounded-full"
          >
            {playing ? "Pause" : "Play"}
          </button>
        </div>

      </div>
    </div>
  );
}
