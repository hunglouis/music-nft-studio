"use client";

import { createContext, useContext, useRef, useState } from "react";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off");
  const playTrack = (track, list) => {
    setPlaylist(list);
    const index = list.findIndex(t => t.url === track.url);
    setCurrentIndex(index);
    setIsPlaying(true);
  };

  const nextTrack = () => {
  if (shuffle) {
    const random = Math.floor(Math.random() * playlist.length);
    setCurrentIndex(random);
    return;
  }
if (currentIndex < playlist.length - 1) {
    setCurrentIndex(prev => prev + 1);
  } else if (repeat === "all") {
    setCurrentIndex(0);
  }

  };

  const prevTrack = () => {
  if (currentIndex > 0) {
    setCurrentIndex(prev => prev - 1);
  }
};
const {
  ...
  shuffle,
  setShuffle,
  repeat,
  setRepeat,
} = usePlayer();
}
  return (
    <PlayerContext.Provider
      value={{
        audioRef,
        playlist,
        currentIndex,
        isPlaying,
        setIsPlaying,
        playTrack,
        nextTrack,
        prevTrack,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);
