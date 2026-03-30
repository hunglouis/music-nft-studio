'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { MY_COLLECTIONS} from './constants.js';
import * as XLSX from 'xlsx'; // Thêm dòng này ở đầu file page.js
// 1. Khởi tạo Supabase Client (Tự động lấy từ .env.local)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const moralisKey = process.env.NEXT_PUBLIC_MORALIS_API_KEY;
const walletAddress = process.env.NEXT_PUBLIC_MY_WALLET_ADDRESS;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Dán đoạn này ở trên cùng file, dưới các dòng import
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .spinning {
      animation: spin 3s linear infinite;
    }
    .paused {
      animation-play-state: paused;
    }
  `;
  document.head.appendChild(style);
}



const run = async () => {
  await Moralis.start({
    apiKey: moralisKey
  });

  const address = walletAddress;

  const response = await Moralis.EvmApi.nft.getWalletNFTs({
    chain: "eth", // hoặc bsc, polygon...
    address: address,
    format: "decimal",
    mediaItems: true
  });

  const data = response.raw.result;

  // Convert ra CSV
  const rows = data.map(nft => ({
    token_address: nft.token_address,
    token_id: nft.token_id,
    name: nft.name,
    symbol: nft.symbol,
    metadata: nft.metadata
  }));

  const csv = [
    Object.keys(rows[0]).join(","),
    ...rows.map(r => Object.values(r).join(","))
  ].join("\n");

  fs.writeFileSync("nft_metadata.csv", csv);
};

run();

export default function MusicNFTStudio() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Sẵn sàng đồng bộ');
  const [nfts, setNfts] = useState([]); //Thống nhất dùng nfts
    // 1. Quản lý ID của bài nhạc đang phát
  const [playingId, setPlayingId] = useState(null);
    // 2. Tạo đối tượng Audio để phát nhạc (chỉ tạo 1 lần)
  const [audioPlayer] = useState(typeof Audio !== 'undefined' ? new Audio() : null);
  const togglePlay = (nft) => {
    // Lấy trực tiếp từ cột audio_url trong bảng hunglouis
    const audioLink = nft.audio_url || nft.animation_url || `https://ipfs.io{nft.token_id}`;
	
	if (!audioLink) {
    alert("NFT này không chứa file nhạc!");
    return;
  }

    if (playingId === nft.id) {
      audioPlayer.pause();
      setPlayingId(null);
    } else {
      audioPlayer.src = audioLink;
      audioPlayer.play().catch(e => alert("Không thể phát file nhạc này:" +e.message));
      setPlayingId(nft.id);
    }
  };
		

  const fetchNFTs = async () => {
    if (!supabase) {
      alert("Lỗi: Thiếu cấu hình Supabase trong file .env.local!");
      return;
    }
    if (loading) return;

    setLoading(true);
	const {data}=await supabase.from('hunglouis').select('*').order('id',{ascending:false});
    setNfts([]); // Đổ dữ liệu vào nfts
    setStatus('Bắt đầu kết nối dữ liệu...');

    try {
      const list =[1,2,3,4,5]; // Danh sách 5 đợt lấy dữ liệu

      for (const i of list) {
        setStatus(`Đang tải bản nhạc số ${i}/5...`);

        // Lấy từng dòng khác nhau dựa trên vị trí (range)
        const { data, error } = await supabase
          .from('hunglouis')
          .select('*')
          .range(i - 1, i - 1); 

        if (error) throw error;

        if (data && data.length > 0) {
          // Cộng dồn dữ liệu mới vào danh sách hiện tại
          setNfts((prev) => [...prev, ...data]);
        }
            
        // Nghỉ 300ms giữa các lần gọi để tránh lỗi mạng/Preflight
        await new Promise((r) => setTimeout(r, 300));
      }
      setStatus('✅ Đã đồng bộ thành công 5 siêu phẩm!');
    } catch (err) {
      console.error("Lỗi:", err.message);
      setStatus('❌ Lỗi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🎵 Music NFT Studio</h1>
        <p style={{ color: '#94a3b8' }}>Bởi Hung Louis</p>
      </header>
      
      <div style={styles.controls}>
        <button 
          onClick={run} 
          disabled={loading} 
          style={{...styles.button, backgroundColor: loading ? '#475569' : '#4f46e5',cursor: loading ? 'not-allowed' : 'pointer'}}>{loading ? 'ĐANG ĐỒNG BỘ...' : '🔄 ĐỒNG BỘ 5 BỘ SƯU TẬP'}
        </button>
        <p style={styles.statusText}>{status}</p>
      </div>
      
    <div style={styles.grid}>
  {nfts.map((nft) => (
    <div key={nft.id} style={styles.card}>
      {/* Hiệu ứng đĩa xoay: Thêm class 'spinning' khi đang phát */}
      <div style={styles.albumDisk} className={playingId === nft.id ? 'spinning' : 'paused'}>
        <img 
          src={nft.item || nft.image_url || `https://IPFS.io`} 
          style={{ width: '60px', height: '60px', borderRadius: '50%', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} 
          alt="nft" 
        />
        <div style={styles.centerHole}></div>
      </div>

      <div style={styles.cardContent}>
        <h3 style={styles.nftName}>{nft.name}</h3>
        <p style={styles.artist}>Artist: {nft.artist || 'Hùng Louis'}</p>
        
        {/* Nút Play thực tế */}
        <button 
          onClick={() => togglePlay(nft)}
          style={{
            ...styles.playBtn,
            backgroundColor: playingId === nft.id ? '#ff4d4d' : '#1db954'
          }}
        >
          {playingId === nft.id ? '⏸ Pause' : '▶ Play Music'}
        </button>
        <div style={styles.badge}>ID: {nft.token_id}</div>
      </div>
    </div>
  ))}
</div>

    </div>
  );
}

// 2. Hệ thống Style chuyên nghiệp (Bê nguyên vào cuối file)
const styles = {
  container: {
    padding: '40px 20px',
    backgroundColor: '#0f172a', // Nền tối sang trọng
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    color: '#fff',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  title: {
    fontSize: '42px',
    fontWeight: '800',
    background: 'linear-gradient(to right, #818cf8, #c084fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '10px',
  },
  controls: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  button: {
    padding: '14px 32px',
    borderRadius: '100px',
    color: 'white',
    border: 'none',
    fontSize: '16px',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)',
  },
  statusText: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#94a3b8',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '24px',
    padding: '24px',
    border: '1px solid #334155',
    textAlign: 'center',
    transition: 'transform 0.3s ease',
  },
  albumDisk: {
    width: '140px',
    height: '140px',
    backgroundColor: '#000',
    borderRadius: '50%',
    margin: '0 auto 20px',
    background: 'repeating-radial-gradient(circle, #334155, #000 15px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
  },
  centerHole: {
    width: '25px',
    height: '25px',
    backgroundColor: '#0f172a',
    borderRadius: '50%',
    border: '5px solid #4f46e5',
  },
  cardContent: {
    textAlign: 'left',
  },
  nftName: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '8px',
    color: '#f8fafc',
  },
  artist: {
    fontSize: '14px',
    color: '#94a3b8',
    marginBottom: '15px',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 12px',
    backgroundColor: 'rgba(129, 140, 248, 0.2)',
    color: '#818cf8',
    borderRadius: '100px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  diskCenterImg: {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    border: '2px solid #1db954',
    zIndex: 2
  },
  playBtn: {
    marginTop: '10px',
    backgroundColor: '#1db954',
    color: 'white',
    border: 'none',
    padding: '8px 15px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  // Hiệu ứng xoay đĩa nhạc khi hover
  albumDisk: {
    // Thêm dòng này vào style albumDisk hiện tại của bạn:
    transition: 'transform 0.5s ease',
    animation: 'spin 5s linear infinite', // Xoay liên tục
  }
};

// Dán đoạn này vào file CSS hoặc thêm thẻ <style> trong page.js
