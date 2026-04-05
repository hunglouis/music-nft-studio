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
  const [status, setStatus] = useState('Hệ thống sẵn sàng');
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
  const [userAddress, setUserAddress] = useState('');
  const CONTRACT_ADDRESS = "0xdde62b6454e09c2d9ee759d7d3926508efef44b7";
  
  const connectWallet = async () => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // 1. Yêu cầu kết nối ví MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const address = accounts[0];
      
      // 2. Rút gọn địa chỉ ví để hiển thị đẹp (ví dụ: 0x1234...abcd)
      const shortenedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      setUserAddress(shortenedAddress);
      
      // 3. Ghi nhận email/ví vào hệ thống
      setAuthEmail(address); 
      console.log("💎 Đã kết nối ví:", address);
    } catch (err) {
      console.error("Lỗi kết nối ví:", err);
    }
  } else {
    alert("Vui lòng cài đặt MetaMask để dùng tính năng này!");
  }
};


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
  // 1. TẠO LINK QR BIDV CHUẨN (KHÔNG LỖI ẢNH)
  const amount = Math.round(parseFloat(nft.price || 0) * 25500);
  const description = encodeURIComponent(`MUA NFT ${nft.name.toUpperCase()}`);
  
  // Link ảnh QR BIDV chính xác cho số TK 3120464627
  const qrUrl = `https://vietqr.io{amount}&addInfo=${description}&accountName=NGUYEN%20MANH%20HUNG`;
  
  setActiveQRUrl(qrUrl);
  setShowQRModal(true);

  // 2. GỬI EMAIL THÔNG BÁO TỰ ĐỘNG ĐẾN HÙNG LOUIS
  const templateParams = {
    nft_name: nft.name,
    price: nft.price,
    customer: authEmail || "Khách vãng lai",
    amount_vnd: amount.toLocaleString('vi-VN')
  };

  emailjs.send(
    'service_1dhjp6a',
    'template_fk98mhc',
    templateParams,
    'kQ7_6eXaohS_msZ-P'
  ).then(() => {
    console.log("📧 Đã gửi thư báo đơn hàng mới!");
  }).catch((err) => {
    console.error("Lỗi gửi email:", err);
  });
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
          <button style={styles.btnNav} onClick={connectWallet}>
			{userAddress ? `🦊 ${userAddress}` : (authEmail ? `👤 ${authEmail.substring(0,8)}...` : '🔗 Kết nối Ví')}
		  </button>

		  <button style={styles.btnNav} onClick={() => setShowAuthModal(true)}>
            {authEmail ? `👤 ${authEmail.substring(0,8)}...` : '📧 Đăng nhập'}
          </button>
        </div>
      </nav>

      {/* KHUNG PHÁT HÀNH - KÍNH MỜ */}
      <section style={styles.mintSection}>
        <div style={styles.card}>
			<div style={styles.policyBox}>
  <p>🛡️ <b>Chính sách SÀN GIAO DỊCH:</b></p>
  <ul style={{fontSize: '12px', color: '#888', textAlign: 'left'}}>
    <li>Phí duy trì hệ thống: <b>2.5%</b> (Trừ trực tiếp khi giao dịch thành công).</li>
    <li>Phí tác quyền nghệ sĩ: <b>5%</b> cho mọi giao dịch thứ cấp (Còn gọi là Hoa hồng tái bản).</li>
    <li>Nghệ sĩ tự chịu trách nhiệm về bản quyền âm nhạc đã tải lên.</li>
  </ul>
</div>

          <h2 style={styles.cardTitle}>Phát hành NFT và Niêm yết</h2>
          <p style={{color: '#888', fontSize: '12px', marginBottom: '15px'}}>
        Đang đăng bài với tư cách: <span style={{color: '#6366f1'}}>{authEmail}</span>
      </p>
		  <input style={styles.input} placeholder="Tên bản nhạc" onChange={e => setNftData({...nftData, name: e.target.value})} />
          <textarea style={{...styles.input, height: '60px', marginTop: '10px'}} placeholder="Mô tả" onChange={e => setNftData({...nftData, desc: e.target.value})} />
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
             <input type="number" style={styles.input} placeholder="Giá ETH" onChange={e => setNftData({...nftData, price: e.target.value})} />
             <input type="file" onChange={e => setSelectedFile(e.target.files)} />
          </div>
		  <div style={styles.fileUploadWrapper}>
  <label htmlFor="file-upload" style={styles.customFileBtn}>
    📁 {selectedFile ? selectedFile[0].name : "Chọn bản nhạc của bạn"}
  </label>
  <input 
    id="file-upload" 
    type="file" 
    style={{ display: 'none' }} // Ẩn cái nút mặc định xấu xí đi
    onChange={e => setSelectedFile(e.target.files)} 
  />
</div>
		  
          <button onClick={handleMint} disabled={loading} style={loading ? styles.btnDisabled : styles.btnMint}>
            {loading ? 'ĐANG XỬ LÝ...' : 'PHÁT HÀNH NGAY'}
			TẢI LÊN SÀN GIAO DỊCH
          </button>
          <p style={styles.statusText}>{status}</p>
        </div>
		
      </section>

{/* KHU VỰC DÀNH CHO NGHỆ SĨ */}
	  <section style={styles.mintSection}>
    {authEmail ? (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>🚀 Đăng tác phẩm lên Sàn</h2>
      <p style={styles.authInfo}>Đang đăng bài với tư cách: <b>{authEmail}</b></p>
      
      <input style={styles.input} placeholder="Tên bản nhạc..." onChange={e => setNftData({...nftData, name: e.target.value})} />
      <input type="number" style={styles.input} placeholder="Giá niêm yết (ETH)" onChange={e => setNftData({...nftData, price: e.target.value})} />
      
      <div style={styles.uploadBox}>
        <input type="file" id="file-upload" style={{display: 'none'}} onChange={e => setSelectedFile(e.target.files)} />
        <label htmlFor="file-upload" style={styles.fileLabel}>
          {selectedFile ? `✅ ${selectedFile.name}` : "📁 Chọn file nhạc/video (Max 50MB)"}
        </label>
      </div>

      <button onClick={handleMint} style={styles.btnMint}>XUẤT BẢN LÊN SÀN GIAO DỊCH</button>
    </div>
    ) : (
    <div style={styles.loginInvite}>
      <h3>🎤 Bạn là nghệ sĩ ? Bạn muốn giới thiệu tác phẩm của mình với các nhà sưu tập, các fan hâm mộ và công chúng. Bạn lo lắng - e ngại, sợ tác quyền của mình bị xâm phạm ?</h3>
      <p>Hãy đăng ký (tạo tài khoản) bằng Email hoặc ví crypto để tải lên tác phẩm của mình để được tiếp cận, chia sẻ với cộng đồng. Tác quyền của bạn sẽ được bảo vệ và tác phẩm của bạn sẽ được lưu truyền vĩnh viễn trên blockchain.</p>
      <button style={styles.btnConnect} onClick={() => setShowAuthModal(true)}>Đăng nhập ngay</button>
    </div>
    )}
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
                <span style={{color: '#6366f1', fontWeight: 'bold'}}>{nft.price} ETH</span>
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
              <span style={{color: '#6366f1', fontWeight: 'bold'}}>{tx.price} ETH</span>
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
		    <img 
  src={activeQRUrl} 
  alt="Mã QR BIDV"
  style={{
    width: '100%', 
    height: 'auto', 
    borderRadius: '15px', 
    backgroundColor: '#fff', // Nền trắng giúp QR dễ quét hơn
    padding: '15px',
	display: 'block'
  }}
  onError={(e) => {
    // Nếu vẫn lỗi, thử tải lại link đơn giản hơn
    e.target.src = `https://vietqr.io`;
  }}
/>

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
  fixedPlayer: { position: 'fixed', bottom: '20px', left: '20px', right: '20px', backgroundColor: 'rgba(15,15,15,0.9)', backdropFilter: 'blur(20px)', padding: '15px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '25px', border: '1px solid #333', zIndex: 3000 },
  btnConnect: { background: 'linear-gradient(90deg, #6366f1, #a855f7)', border: 'none', color: '#fff', padding: '8px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' },
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
  toastMessage: { color: '#fff', fontWeight: 'bold' },
  btnChat: {
    padding: '8px 15px',
    backgroundColor: '#0068ff', // Màu xanh Zalo đặc trưng
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '12px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    width: '100%',
    transition: '0.3s',
  },
  input: {
    width: '100%',
    padding: '14px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '14px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s ease',
    marginBottom: '15px',
  },
  customFileBtn: {
    display: 'block',
    padding: '12px',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    border: '2px dashed rgba(99, 102, 241, 0.4)',
    borderRadius: '14px',
    color: '#6366f1',
    textAlign: 'center',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginBottom: '20px',
    transition: '0.3s',
  },
  btnMint: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(90deg, #6366f1, #a855f7)', // Gradient rực rỡ
    color: '#fff',
    borderRadius: '16px',
    border: 'none',
    fontWeight: '800',
    fontSize: '16px',
    letterSpacing: '1px',
    cursor: 'pointer',
    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s ease',
  },
  authInfo: { fontSize: '13px', color: '#888', marginBottom: '15px', textAlign: 'center' },
  uploadBox: { border: '2px dashed #333', borderRadius: '15px', padding: '20px', textAlign: 'center', marginBottom: '15px' },
  fileLabel: { cursor: 'pointer', color: '#6366f1', fontWeight: 'bold' },
  loginInvite: { padding: '40px', textAlign: 'center', backgroundColor: '#111', borderRadius: '25px', border: '1px solid #222' },
  nftStats: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', margin: '15px 0' },
  priceText: { color: '#6366f1', fontWeight: 'bold', fontSize: '15px' },
  btnZalo: { width: '100%', padding: '12px', backgroundColor: '#0068ff', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
// Thêm vào styles
  fileInputCustom: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#6366f1',
    color: '#fff',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px'
  },
  loginInvite: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: '24px',
    border: '1px dashed #333',
    maxWidth: '600px',
    margin: '0 auto 60px',
  },
  feeNotice: {
    marginTop: '20px',
    padding: '20px',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(99, 102, 241, 0.2)',
    textAlign: 'left'
  },
  feeList: {
    fontSize: '12px',
    color: '#aaa',
    lineHeight: '1.8',
    paddingLeft: '20px',
    listStyleType: 'disc'
  },
  visitBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    color: '#6366f1',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  btnVietQR: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#fff',
    color: '#0056b3', // Màu xanh đặc trưng BIDV
    borderRadius: '12px',
    border: '1px solid #0056b3',
    fontWeight: 'bold',
    marginTop: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  historySection: { marginTop: '80px', padding: '40px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '32px', border: '1px solid #222' },
  historyTitle: { fontSize: '24px', fontWeight: '800', marginBottom: '25px', textAlign: 'center' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #222' },
  txStatus: { backgroundColor: '#10b981', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontSize: '10px', marginRight: '15px' },
  txNftName: { fontSize: '16px', color: '#fff' },
  txPrice: { color: '#6366f1', fontWeight: 'bold', marginLeft: '20px' },
  txTime: { color: '#555', fontSize: '12px', marginLeft: '20px' },
  qrModalContent: {
    backgroundColor: '#111',
    padding: '30px',
    borderRadius: '24px',
    width: '380px',
    textAlign: 'center',
    border: '1px solid #333',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(10px)',
  },
  qrHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  closeBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' },
  qrDesc: { fontSize: '14px', color: '#aaa', marginBottom: '20px' },
  qrImageContainer: { backgroundColor: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '20px' },
  qrImage: { width: '100%', height: 'auto', display: 'block' },
  btnDone: { 
    width: '100%', 
    padding: '12px', 
    backgroundColor: '#6366f1', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    fontWeight: 'bold', 
    marginTop: '15px',
    cursor: 'pointer'
  },

};
