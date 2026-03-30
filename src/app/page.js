'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// 1. Khởi tạo Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MusicNFTStudio() {
  // --- CÁC BIẾN TRẠNG THÁI (STATE) ---
  const [status, setStatus] = useState('Hệ thống sẵn sàng');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nftData, setNftData] = useState({ name: '', desc: '', artist: 'Hùng Louis', price: '0.01' });
  
  const [currentTrack, setCurrentTrack] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [manualWallet, setManualWallet] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  // Tự động tải dữ liệu khi mở trang
  useEffect(() => { fetchNFTs(); }, []);

  // --- CÁC HÀM XỬ LÝ LOGIC ---
  const fetchNFTs = async () => {
    const { data } = await supabase.from('hunglouis').select('*').order('created_at', { ascending: false });
    setNfts(data || []);
  };

  const showNotification = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };

  const handleMintOneClick = async () => {
    if (!selectedFile || !nftData.name) return showNotification("⚠️ Vui lòng nhập tên và chọn file!");
    setLoading(true);
    setStatus('🚀 Đang đẩy lên IPFS...');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile[0]);
      const res = await axios.post("https://api.pinata.cloud", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_KEY.trim(),
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET.trim(),
        }
      });
      const autoCID = res.data.IpfsHash;
      const { error } = await supabase.from('hunglouis').insert([{ 
          name: nftData.name, 
          description: nftData.desc,
          hunglouis_id: autoCID, 
          image_url: `https://gateway.pinata.cloud{autoCID}`,
          artist: nftData.artist,
          price: nftData.price,
          created_at: new Date()
      }]);
      if (error) throw error;
      showNotification("🎉 Phát hành NFT thành công!");
      setNftData({ name: '', desc: '', artist: 'Hùng Louis', price: '0.01' });
      setSelectedFile(null);
      fetchNFTs();
    } catch (err) { showNotification("❌ Lỗi: " + err.message); }
    finally { setLoading(false); setStatus('Sẵn sàng'); }
  };

  const connectMetamask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setManualWallet(accounts[0]);
        showNotification("🦊 Đã kết nối ví Metamask!");
      } catch (err) { showNotification("❌ Từ chối kết nối!"); }
    } else { alert("Vui lòng cài Metamask!"); }
  };

  const handleRegisterUser = async () => {
    if (!authEmail) return showNotification("⚠️ Nhập Email trước bạn ơi!");
    const { error } = await supabase.from('profiles').insert([{ email: authEmail, wallet_address: manualWallet }]);
    if (error) showNotification("❌ Lỗi: " + error.message);
    else { showNotification("🎉 Đăng ký thành công!"); setShowAuthModal(false); }
  };

  // --- GIAO DIỆN CHÍNH ---
  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: `
        .nft-card-hover:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3); border-color: #6366f1 !important; }
      `}} />

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>HÙNG LOUIS <span style={{color: '#6366f1'}}>STUDIO</span></div>
        <div style={styles.navLinks}>
          <span style={styles.navItem}>Khám phá</span>
          <div style={styles.authGroup}>
            <button style={styles.btnNavText} onClick={() => setShowAuthModal(true)}>📧 Login</button>
            <div style={styles.divider}></div>
            <button style={styles.btnConnect} onClick={connectMetamask}>🦊 Connect</button>
          </div>
        </div>
      </nav>

      {/* MINT SECTION */}
      <section style={styles.mintSection}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Phát hành NFT "One-Click"</h2>
          <input style={styles.input} placeholder="Tên bản nhạc" onChange={e => setNftData({...nftData, name: e.target.value})} />
          <textarea style={{...styles.input, height: '60px', marginTop: '10px'}} placeholder="Mô tả" onChange={e => setNftData({...nftData, desc: e.target.value})} />
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
             <input type="number" style={styles.input} placeholder="Giá MATIC" onChange={e => setNftData({...nftData, price: e.target.value})} />
             <input type="file" onChange={e => setSelectedFile(e.target.files)} />
          </div>
          <button onClick={handleMintOneClick} disabled={loading} style={loading ? styles.btnDisabled : styles.btnMint}>
            {loading ? 'ĐANG XỬ LÝ...' : 'PHÁT HÀNH NGAY'}
          </button>
          <p style={styles.statusText}>{status}</p>
        </div>
      </section>

      {/* GRID MARKETPLACE */}
      <div style={styles.grid}>
        {nfts.map((nft) => (
          <div key={nft.id} style={styles.nftCard} className="nft-card-hover">
            <div style={styles.imageWrapper}>
              <img src={nft.image_url} style={styles.nftImage} alt="NFT" />
              <div style={styles.playOverlay} onClick={() => setCurrentTrack(nft)}>
                <div style={styles.playIcon}>▶</div>
              </div>
            </div>
            <div style={styles.nftContent}>
              <h4 style={styles.nftTitle}>{nft.name}</h4>
              <p style={styles.nftArtist}>By {nft.artist}</p>
              <div style={styles.nftFooter}>
                <div style={styles.priceContainer}>
                   <span style={styles.priceLabel}>Giá</span>
                   <div style={styles.priceValue}>{nft.price || '0.01'} MATIC</div>
                </div>
                <button style={styles.btnBuySmall} onClick={() => setCurrentTrack(nft)}>Sở hữu</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FIXED PLAYER */}
      {currentTrack && (
        <div style={styles.fixedPlayer}>
          <div style={styles.playerContent}>
            <div style={styles.trackInfo}>
              <img src={currentTrack.image_url} style={styles.miniCover} alt="cover" />
              <div><div style={styles.miniTitle}>{currentTrack.name}</div><div style={styles.miniArtist}>{currentTrack.artist}</div></div>
            </div>
            <video key={currentTrack.image_url} src={currentTrack.image_url} controls autoPlay style={styles.mainVideo} />
            <button onClick={() => setCurrentTrack(null)} style={styles.btnClose}>✕</button>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showAuthModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Ghi danh Thành viên</h2>
            <input type="email" placeholder="Email của bạn" style={styles.modalInput} onChange={e => setAuthEmail(e.target.value)} />
            <input type="text" placeholder="Địa chỉ ví Metamask" style={{...styles.modalInput, marginTop: '10px'}} value={manualWallet} onChange={e => setManualWallet(e.target.value)} />
            <button style={styles.btnActionPrimary} onClick={handleRegisterUser}>HOÀN TẤT ĐĂNG KÝ</button>
            <button style={{background: 'none', border: 'none', color: '#555', marginTop: '15px', cursor: 'pointer'}} onClick={() => setShowAuthModal(false)}>Để sau</button>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div style={styles.toastContainer}>
          <div style={styles.toastMessage}>✨ {toast.message}</div>
        </div>
      )}

    </div>
  );
}

// --- HỆ THỐNG STYLE ---
const styles = {
  container: { backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '120px 40px 150px' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', position: 'fixed', top: '15px', left: '20px', right: '20px', backgroundColor: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(15px)', borderRadius: '100px', border: '1px solid #333', zIndex: 2000 },
  navLogo: { fontSize: '20px', fontWeight: '900' },
  navLinks: { display: 'flex', gap: '20px', alignItems: 'center' },
  navItem: { color: '#888', fontSize: '14px', cursor: 'pointer' },
  authGroup: { display: 'flex', alignItems: 'center', backgroundColor: '#111', padding: '5px 15px', borderRadius: '50px' },
  btnNavText: { background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px' },
  divider: { width: '1px', height: '15px', backgroundColor: '#333', margin: '0 15px' },
  btnConnect: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  
  mintSection: { maxWidth: '600px', margin: '0 auto 60px' },
  card: { backgroundColor: '#111', padding: '30px', borderRadius: '24px', border: '1px solid #222' },
  input: { width: '100%', padding: '12px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '10px', color: '#fff' },
  btnMint: { width: '100%', padding: '15px', backgroundColor: '#6366f1', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' },
  btnDisabled: { width: '100%', padding: '15px', backgroundColor: '#333', color: '#888', borderRadius: '12px', border: 'none', marginTop: '20px' },
  statusText: { textAlign: 'center', marginTop: '10px', color: '#6366f1', fontSize: '13px' },

  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
  nftCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid #222', overflow: 'hidden', backdropFilter: 'blur(10px)', transition: '0.4s' },
  imageWrapper: { position: 'relative', aspectRatio: '1/1' },
  nftImage: { width: '100%', height: '100%', objectFit: 'cover' },
  playOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', opacity: 0, transition: '0.3s', cursor: 'pointer' },
  playIcon: { width: '60px', height: '60px', backgroundColor: '#6366f1', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px' },
  nftContent: { padding: '20px' },
  nftTitle: { fontSize: '18px', fontWeight: '800', marginBottom: '5px' },
  nftArtist: { fontSize: '13px', color: '#888', marginBottom: '15px' },
  nftFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  priceValue: { fontWeight: 'bold', color: '#6366f1' },
  btnBuySmall: { padding: '8px 15px', backgroundColor: '#fff', color: '#000', borderRadius: '10px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },

  fixedPlayer: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(15px)', padding: '15px 40px', borderTop: '1px solid #333', zIndex: 3000 },
  playerContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  trackInfo: { display: 'flex', alignItems: 'center', gap: '15px' },
  miniCover: { width: '50px', height: '50px', borderRadius: '8px' },
  miniTitle: { fontWeight: 'bold', fontSize: '14px' },
  miniArtist: { fontSize: '12px', color: '#888' },
  mainVideo: { height: '60px', borderRadius: '8px' },
  btnClose: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 4000 },
  modalContent: { backgroundColor: '#111', padding: '40px', borderRadius: '32px', width: '400px', textAlign: 'center', border: '1px solid #333' },
  modalInput: { width: '100%', padding: '15px', backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', color: '#fff' },
  btnActionPrimary: { width: '100%', padding: '15px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', marginTop: '20px', cursor: 'pointer' },
  
  toastContainer: { position: 'fixed', bottom: '100px', right: '30px', backgroundColor: '#6366f1', padding: '15px 25px', borderRadius: '15px', zIndex: 5000 },
  toastMessage: { color: '#fff', fontWeight: 'bold' }
};
