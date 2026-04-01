'use client';
import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// 1. ĐỊA CHỈ "CỖ MÁY" SÀN GIAO DỊCH (SMART CONTRACT CHỦ)
const SMARTCONTRACT_ADDRESS = "0xdde62b6454e09c2d9ee759d7d3926508efef44b7";

// 2. ĐỊA CHỈ VÍ CHỦ SÀN NHẬN PHÍ 2.5% (TỪ FILE .ENV)
const PLATFORM_ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MusicNFTStudio() {
  // --- HỆ THỐNG BIẾN TRẠNG THÁI (STATES) ---
  const [nfts, setNfts] = useState([]);
  const [myCollection, setMyCollection] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [totalVisits, setTotalVisits] = useState(0);
  const [authEmail, setAuthEmail] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [activeQRUrl, setActiveQRUrl] = useState('');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nftData, setNftData] = useState({ name: '', price: '0.01' });
  const [loading, setLoading] = useState(false);
  const CONTRACT_ADDRESS = "0xdde62b6454e09c2d9ee759d7d3926508efef44b7";

  // --- TỰ ĐỘNG TẢI DỮ LIỆU ---
  useEffect(() => {
    fetchNFTs();
    fetchTransactions();
    handleVisitorCount();
  }, []);

  useEffect(() => {
    if (authEmail) fetchMyCollection();
  }, [authEmail]);

  const fetchNFTs = async () => {
    const { data } = await supabase.from('hunglouis').select('*').order('created_at', { ascending: false });
    setNfts(data || []);
  };

  const fetchTransactions = async () => {
    const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5);
    setTransactions(data || []);
  };

  const fetchMyCollection = async () => {
    const { data } = await supabase.from('hunglouis').select('*').eq('owner_email', authEmail);
    setMyCollection(data || []);
  };

  const handleVisitorCount = async () => {
    const { data, error } = await supabase.from('site_stats').select('views').eq('id', 1).single();
    if (data && !error) {
      const newCount = data.views + 1;
      setTotalVisits(newCount);
      await supabase.from('site_stats').update({ views: newCount }).eq('id', 1);
    }
  };

  // --- THANH TOÁN VIETQR BIDV ---
  const handleVietQR = (nft) => {
	const MY_BANK = "BIDV";
	const MY_ACCOUNT = "3120464627"; // Số tài khoản chuẩn của bạn  
    // Đảm bảo lấy giá chuẩn, nếu không có thì mặc định 0.01
  const price = parseFloat(nft.price || 0.01);
  const amount = Math.round(price * 25500); // Tỷ giá quy đổi
  const description = encodeURIComponent(`MUA NFT ${nft.name.toUpperCase()}`);
    // SỬA DÒNG NÀY: Bắt buộc dùng dấu huyền ` ` (cạnh phím số 1) để bao quanh link
  const url = `https://vietqr.io{MY_BANK}-${MY_ACCOUNT}-compact2.jpg?amount=${amount}&addInfo=${description}&accountName=NGUYEN%20MANH%20HUNG`;
    setActiveQRUrl(url);
    setShowQRModal(true);
    // Ghi nhận giao dịch nháp
    recordTransaction(nft);
  };

  const recordTransaction = async (nft) => {
    await supabase.from('transactions').insert([{
      nft_name: nft.name,
      buyer: authEmail || "Khách vãng lai",
      price: nft.price,
      type: "Sale"
    }]);
    fetchTransactions();
  };

  const handleMint = async () => {
    if (!selectedFile || !nftData.name) return alert("Vui lòng nhập tên và chọn file!");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const res = await axios.post("https://pinata.cloud", formData, {
        headers: {
          'pinata_api_key': process.env.NEXT_PUBLIC_PINATA_KEY,
          'pinata_secret_api_key': process.env.NEXT_PUBLIC_PINATA_SECRET,
        }
      });
      await supabase.from('hunglouis').insert([{
        name: nftData.name,
        price: nftData.price,
        image_url: `https://pinata.cloud{res.data.IpfsHash}`,
        creator_email: authEmail,
        is_for_sale: true,
        created_at: new Date()
      }]);
      alert("🎉 Phát hành thành công!");
      fetchNFTs();
    } catch (e) { alert("Lỗi tải lên: " + e.message); }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* NAVBAR PHIÊN BẢN SANG TRỌNG */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>HÙNG LOUIS <span style={{color: '#6366f1'}}>STUDIO</span></div>
        <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
          <div style={styles.visitBadge}>👁️ {totalVisits.toLocaleString()} lượt ghé thăm</div>
          <button style={styles.btnNav} onClick={() => setShowAuthModal(true)}>
            {authEmail ? `👤 ${authEmail.substring(0,8)}...` : '📧 Đăng nhập'}
          </button>
        </div>
      </nav>

      {/* KHUNG PHÁT HÀNH - KÍNH MỜ */}
      <section style={styles.sectionMax}>
        <div style={styles.cardGlass}>
          <h2 style={{textAlign: 'center', marginBottom: '20px'}}>🚀 Phát hành NFT & Niêm yết Sàn</h2>
          <div style={styles.feeNotice}>
            <p style={{color: '#6366f1', fontWeight: 'bold', fontSize: '14px'}}>🛡️ QUY ĐỊNH SÀN:</p>
            <ul style={{fontSize: '11px', color: '#888', paddingLeft: '20px'}}>
              <li>Phí duy trì: 2.5% | Phí tác quyền: 5%</li>
              <li>Nghệ sĩ chịu trách nhiệm 100% bản quyền âm nhạc.</li>
            </ul>
          </div>
          <input style={styles.input} placeholder="Tên bản nhạc..." onChange={e => setNftData({...nftData, name: e.target.value})} />
          <input style={styles.input} type="number" placeholder="Giá niêm yết (MATIC)" onChange={e => setNftData({...nftData, price: e.target.value})} />
          <input type="file" onChange={e => setSelectedFile(e.target.files)} style={{margin: '10px 0', color: '#888'}} />
          <button style={styles.btnActionPrimary} onClick={handleMint} disabled={loading}>
            {loading ? 'ĐANG XỬ LÝ...' : 'PHÁT HÀNH NGAY'}
          </button>
        </div>
      </section>

      {/* GRID MARKETPLACE CHÍNH */}
      <div style={styles.grid}>
        {nfts.map((nft) => (
          <div key={nft.id} style={styles.nftCard} className="nft-card-hover">
            <div style={styles.imageWrapper}>
              <img src={nft.image_url} style={styles.nftImage} onClick={() => { setCurrentTrack(nft); }} />
              <div style={styles.playOverlay} onClick={() => setCurrentTrack(nft)}>▶</div>
            </div>
            <div style={styles.nftContent}>
              <h4 style={{marginBottom: '5px'}}>{nft.name}</h4>
              <p style={{fontSize: '12px', color: '#666'}}>Nghệ sĩ: {nft.creator_email || 'Hùng Louis'}</p>
              <div style={styles.cardFooter}>
                <span style={{color: '#6366f1', fontWeight: 'bold'}}>{nft.price} MATIC</span>
                {nft.is_for_sale ? (
                  <button style={styles.btnBuy} onClick={() => handleVietQR(nft)}>🏦 Mua VNĐ</button>
                ) : (
                  <button style={styles.btnOffer}>🤝 Đề nghị</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* LỊCH SỬ GIAO DỊCH */}
      <section style={styles.sectionFull}>
        <h3 style={{textAlign: 'center', marginBottom: '25px', color: '#6366f1'}}>💎 Hoạt động giao dịch mới nhất</h3>
        <div style={styles.historyBox}>
          {transactions.map(tx => (
            <div key={tx.id} style={styles.historyRow}>
              <span>🛍️ <b>{tx.nft_name}</b> vừa được sở hữu bởi <i>{tx.buyer.substring(0,10)}...</i></span>
              <span style={{color: '#6366f1', fontWeight: 'bold'}}>{tx.price} MATIC</span>
            </div>
          ))}
        </div>
      </section>

      {/* BỘ SƯU TẬP CÁ NHÂN */}
      {authEmail && (
        <section style={styles.sectionFull}>
          <h2 style={{textAlign: 'center', marginBottom: '25px'}}>🎨 Bộ sưu tập của bạn</h2>
          <div style={styles.gridSmall}>
            {myCollection.map(item => (
              <div key={item.id} style={styles.nftCardSmall}>
                <img src={item.image_url} style={{width:'100%', height:'120px', objectFit:'cover'}} />
                <p style={{padding:'10px', fontSize:'12px', color: '#fff'}}>{item.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* POPUP VIETQR & LOGIN (TÁCH BIỆT) */}
      {showQRModal && (
        <div style={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
          <div style={styles.modalContentQR} onClick={e => e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'15px'}}>
              <h3 style={{margin:0}}>Thanh toán BIDV</h3>
              <button onClick={() => setShowQRModal(false)} style={{background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'24px'}}>✕</button>
            </div>
		    <img src={activeQRUrl} style={{width: '100%', borderRadius: '15px', backgroundColor:'#fff', padding:'10px'}} />
            <p style={{fontSize:'12px', color:'#aaa', marginTop:'15px', textAlign:'center'}}>Quét mã để sở hữu bản quyền NFT</p>
            <button style={styles.btnActionPrimary} onClick={() => setShowQRModal(false)} style={{marginTop:'15px'}}></button>
          </div>
        </div>
      )}

      {showAuthModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAuthModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3>Đăng nhập Nghệ sĩ</h3>
            <input style={styles.input} placeholder="Email của bạn" onChange={e => setAuthEmail(e.target.value)} />
            <button style={styles.btnActionPrimary} onClick={() => setShowAuthModal(false)}>VÀO SÀN</button>
          </div>
        </div>
      )}

      {/* FIXED PLAYER */}
      {currentTrack && (
        <div style={styles.fixedPlayer}>
          <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
            <img src={currentTrack.image_url} style={{width:'50px', height:'50px', borderRadius:'10px'}} />
            <div><b style={{fontSize:'14px'}}>{currentTrack.name}</b></div>
          </div>
          <video src={currentTrack.image_url} autoPlay controls style={{height:'45px', borderRadius: '10px'}} />
          <button onClick={() => setCurrentTrack(null)} style={{background:'none', border:'none', color:'#fff', fontSize:'20px'}}>✕</button>
        </div>
      )}
    </div>
  );
}

// --- HỆ THỐNG STYLES - BẢN GỐC ---
const styles = {
  container: { backgroundColor: '#050505', color: '#fff', minHeight: '100vh', padding: '120px 40px' },
  navbar: { position: 'fixed', top: '15px', left: '20px', right: '20px', backgroundColor: 'rgba(15, 15, 15, 0.8)', backdropFilter: 'blur(15px)', display: 'flex', justifyContent: 'space-between', padding: '15px 30px', borderRadius: '100px', border: '1px solid #333', zIndex: 1000 },
  navLogo: { fontSize: '20px', fontWeight: '900' },
  visitBadge: { color: '#6366f1', fontSize: '11px', fontWeight: 'bold', border: '1px solid rgba(99,102,241,0.2)', padding: '5px 15px', borderRadius: '50px', backgroundColor: 'rgba(99,102,241,0.05)' },
  btnNav: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
  sectionMax: { maxWidth: '650px', margin: '0 auto 60px' },
  cardGlass: { backgroundColor: 'rgba(255,255,255,0.03)', padding: '35px', borderRadius: '32px', border: '1px solid #222', backdropFilter: 'blur(15px)' },
  feeNotice: { backgroundColor: 'rgba(99, 102, 241, 0.03)', padding: '15px', borderRadius: '15px', marginBottom: '25px', border: '1px solid rgba(99, 102, 241, 0.1)' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', backgroundColor: '#000', border: '1px solid #333', borderRadius: '14px', color: '#fff', outline: 'none' },
  btnActionPrimary: { width: '100%', padding: '16px', backgroundColor: '#6366f1', color: '#fff', borderRadius: '16px', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' },
  nftCard: { backgroundColor: '#111', borderRadius: '28px', overflow: 'hidden', border: '1px solid #222', transition: '0.4s' },
  imageWrapper: { position: 'relative', aspectRatio: '1/1' },
  nftImage: { width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' },
  playOverlay: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'rgba(99, 102, 241, 0.9)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', cursor: 'pointer' },
  nftContent: { padding: '20px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' },
  btnBuy: { backgroundColor: '#fff', color: '#000', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer' },
  btnOffer: { backgroundColor: 'transparent', color: '#555', padding: '10px 20px', borderRadius: '12px', border: '1px solid #333' },
  sectionFull: { marginTop: '80px', backgroundColor: 'rgba(255,255,255,0.01)', padding: '45px', borderRadius: '35px', border: '1px solid #222' },
  historyBox: { display: 'flex', flexDirection: 'column', gap: '18px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #1a1a1a' },
  gridSmall: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '25px' },
  nftCardSmall: { backgroundColor: '#000', borderRadius: '20px', border: '1px solid #222', overflow: 'hidden' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#111', padding: '35px', borderRadius: '30px', width: '380px', textAlign: 'center', border: '1px solid #333' },
  modalContentQR: { backgroundColor: '#111', padding: '35px', borderRadius: '30px', width: '420px', border: '1px solid #333' },
  fixedPlayer: { position: 'fixed', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(20px)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '25px', border: '1px solid #333', zIndex: 3000 }
};
