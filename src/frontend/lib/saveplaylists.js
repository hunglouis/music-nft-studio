import { supabase } from "@/lib/supabase";

export const savePlaylist = async (wallet, playlist) => {
  await supabase.from("playlists").insert([
    {
      wallet,
      name: "My Playlist",
      tracks: playlist,
    },
  ]);
};
