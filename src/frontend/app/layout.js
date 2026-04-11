import { PlayerProvider } from "@/context/PlayerContext";
import PlayerBar from "@/components/PlayerBar";
import Sidebar from "@/components/Sidebar";

<body>
  <PlayerProvider>
    {children}
    <PlayerBar />
  </PlayerProvider>
</body>
