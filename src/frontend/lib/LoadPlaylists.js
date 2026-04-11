import { supabase } from "@/lib/supabase";

export const loadPlaylist = async (wallet) => {
  const { data } = await supabase
    .from("playlists")
    .select("*")
    .eq("wallet", wallet)
    .single();

  return data?.tracks || [];
};
