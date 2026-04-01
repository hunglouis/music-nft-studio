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
  const PLATFORM_ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;
  const [status, setStatus] = useState('Hệ thống sẵn sàng');
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nftData, setNftData] = useState({ name: '', desc: '', artist: 'Hùng Louis', price: '0.01' });
  const [transactions, setTransactions] = useState([]);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [manualWallet, setManualWallet] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });
  const [totalVisits, setTotalVisits] = useState(0);

  // Tự động tải dữ liệu khi mở trang
  useEffect(() => { fetchNFTs(); }, []);
  useEffect(() => {
	  // Thêm vào useEffect để lấy dữ liệu
  const fetchTransactions = async () => {
  const { data } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(5);
  setTransactions(data || []);
  };
  const fetchAndIncrementVisits = async () => {
    // 1. Lấy số hiện tại
    const { data, error } = await supabase.from('site_stats').select('views').single();
    const newCount = (data?.views || 0) + 1;
    setTotalVisits(newCount);
    // 2. Cập nhật lại số mới
    await supabase.from('site_stats').update({ views: newCount }).eq('id', 1);
	};
  fetchAndIncrementVisits();
	}, []);

  // --- CÁC HÀM XỬ LÝ LOGIC ---
  const recordTransaction = async (nft, buyerEmail) => {
	
  const {error} = await supabase.from('transactions').insert([{
    nft_name: nft.name,
    buyer: authEmail || "Khách vãng lai",
    price: nft.price,
    type: "Mua nhạc"
	}]);
  fetchTransactions(); // Cập nhật danh sách hiển thị
	};

  const fetchNFTs = async () => {
    const { data } = await supabase.from('hunglouis').select('*').order('created_at', { ascending: false });
    setNfts(data || []);
	};
  // Hàm tăng lượt nghe tự động
  const incrementPlayCount = async (nft) => {
  const { error } = await supabase
    .from('hunglouis')
    .update({ views: (nft.views || 0) + 1 })
    .eq('id', nft.id);
  if (!error) fetchNFTs(); // Load lại để cập nhật con số trên màn hình
  };
	// Hàm mở Zalo chat (Cấu trúc chuẩn 2024)
  const openZaloChat = (nft) => {
  const sdt = "0778018931"; // <--- THAY SỐ CỦA BẠN VÀO ĐÂY
  const message = `Tôi quan tâm bản nhạc: ${nft.name} trên sàn Mạnh Hùng NFT.`;
  window.open(`https://zalo.me{sdt}?text=${encodeURIComponent(message)}`, '_blank');
  };
  const showNotification = (msg) => {
    setToast({ show: true, message: msg });
    setTimeout(() => setToast({ show: false, message: '' }), 4000);
  };
  const handleBuyNFT = async (nft) => {
  // 1. Tính toán phí sàn (Platform Fee)
  const price = parseFloat(nft.price || 0.01);
  const platformFee = price * 0.025; // 2.5% phí sàn
  const sellerProceeds = price - platformFee;

  showNotification(`💎 Đang khởi tạo giao dịch cho: ${nft.name}`);
  
  // Tạm thời hiện thông báo để bạn thấy phí được chia đúng
  alert(`Tổng: ${price} MATIC\n- Phí sàn (Hùng Louis): ${platformFee.toFixed(4)}\n- Người bán nhận: ${sellerProceeds.toFixed(4)}`);
  
  // Bước tiếp theo sẽ là gọi Smart Contract ở đây
  };
const handleVietQR = (nft) => {
  const MY_BANK = "BIDV"; 
  const MY_ACCOUNT = "3120464627"; // Số tài khoản của Hùng Louis
  const RATE = 25500; // Tỷ giá MATIC/VNĐ (Bạn có thể điều chỉnh)
  const amount = Math.round(nft.price * RATE); 
  const description = encodeURIComponent(`MUA NFT ${nft.name.toUpperCase()}`);
  
  // Link tạo mã QR chuẩn Napas
  const qrUrl = `https://vietqr.io{MY_BANK}-${MY_ACCOUNT}-compact2.jpg?amount=${amount}&addInfo=${description}&accountName=NGUYEN%20MANH%20HUNG`;
  
  window.open(qrUrl, '_blank');
  showNotification("🏦 Đã khởi tạo mã QR thanh toán BIDV!");
};


  const handleMintOneClick = async () => {
    if (!selectedFile || !nftData.name) return showNotification("⚠️ Vui lòng nhập tên và chọn file!");
    setLoading(true);
    setStatus('🚀 Đang đẩy lên IPFS...');
    try {
      const formData = new FormData();
      formData.append('file', selectedFile[0]);
	 // Dòng 75: Phải có /pinning/pinFileToIPFS ở cuối link
	const res = await axios.post(`https://api.pinata.cloud/pinning/pinFileToIPFS`, formData, {
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
		  creator_email: authEmail, // <--- LƯU EMAIL NGƯỜI ĐĂNG
          image_url: `https://Gateway.pinata.cloud/ipfs/${autoCID}`,
		  status: 'active', // Hoặc 'pending' nếu bạn muốn duyệt thủ công
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
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletAddress(accounts[0]); // Tự động điền vào ô input
        showNotification("🦊 Đã kết nối ví thành công!");
    } else {
		alert("Vui lòng cài Metamask!"); 
	}
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
        .nft-card-hover:hover { transform: translateY(-10px); background-color: rgba(99, 102, 241, 0.05) !important; box-shadow: 0 20px 40px rgba(99, 102, 241, 0.3); border-color: #6366f1 !important; }
      `}} />

      {/* NAVBAR */}
      <nav style={styles.navbar}>
        <div style={styles.navLogo}>HÙNG LOUIS <span style={{color: '#6366f1'}}>STUDIO</span></div>
        <div style={styles.navStats}>
  <span style={styles.visitBadge}>👁️ {totalVisits.toLocaleString()} lượt ghé thăm</span>
</div>

		<div style={styles.navLinks}>
          <span style={styles.navItem}>Khám phá</span>
          <div style={styles.authGroup}>
            <button style={styles.btnNavText} onClick={() => setShowAuthModal(true)}>📧 Login</button>
            <div style={styles.divider}></div>
            <button style={styles.btnConnect} onClick={(connectMetamask)}>🦊 Connect</button>
          </div>
        </div>
      </nav>

      {/* MINT SECTION */}
      <section style={styles.mintSection}>
        <div style={styles.card}>
			<div style={styles.policyBox}>
  <p>🛡️ <b>Quy định sàn:</b></p>
  <ul style={{fontSize: '12px', color: '#888', textAlign: 'left'}}>
    <li>Phí duy trì hệ thống: <b>2.5%</b> (Trừ trực tiếp khi giao dịch thành công).</li>
    <li>Phí tác quyền nghệ sĩ: <b>5%</b> cho mọi giao dịch thứ cấp (Còn gọi là Hoa hồng tái bản).</li>
    <li>Nghệ sĩ tự chịu trách nhiệm về bản quyền âm nhạc đã tải lên.</li>
  </ul>
</div>

          <h2 style={styles.cardTitle}>Phát hành NFT "One-Click"</h2>
          <p style={{color: '#888', fontSize: '12px', marginBottom: '15px'}}>
        Đang đăng bài với tư cách: <span style={{color: '#6366f1'}}>{authEmail}</span>
      </p>
		  <input style={styles.input} placeholder="Tên bản nhạc" onChange={e => setNftData({...nftData, name: e.target.value})} />
          <textarea style={{...styles.input, height: '60px', marginTop: '10px'}} placeholder="Mô tả" onChange={e => setNftData({...nftData, desc: e.target.value})} />
          <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
             <input type="number" style={styles.input} placeholder="Giá MATIC" onChange={e => setNftData({...nftData, price: e.target.value})} />
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
		  
          <button onClick={handleMintOneClick} disabled={loading} style={loading ? styles.btnDisabled : styles.btnMint}>
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
      <input type="number" style={styles.input} placeholder="Giá niêm yết (MATIC)" onChange={e => setNftData({...nftData, price: e.target.value})} />
      
      <div style={styles.uploadBox}>
        <input type="file" id="file-upload" style={{display: 'none'}} onChange={e => setSelectedFile(e.target.files)} />
        <label htmlFor="file-upload" style={styles.fileLabel}>
          {selectedFile ? `✅ ${selectedFile.name}` : "📁 Chọn file nhạc/video (Max 50MB)"}
        </label>
      </div>

      <button onClick={handleMintOneClick} style={styles.btnMint}>XUẤT BẢN LÊN SÀN GIAO DỊCH</button>
    </div>
    ) : (
    <div style={styles.loginInvite}>
      <h3>🎤 Bạn là nghệ sĩ ? Bạn muốn giới thiệu tác phẩm của mình với các nhà sưu tập, các fan hâm mộ và công chúng. Bạn lo lắng - e ngại, sợ tác quyền của mình bị xâm phạm ?</h3>
      <p>Hãy đăng ký (tạo tài khoản) bằng Email hoặc ví crypto để tải lên tác phẩm của mình để được tiếp cận, chia sẻ với cộng đồng. Tác quyền của bạn sẽ được bảo vệ và lưu truyền vĩnh viễn trên blockchain.</p>
      <button style={styles.btnConnect} onClick={() => setShowAuthModal(true)}>Đăng nhập ngay</button>
    </div>
    )}
	  </section>

      {/* GRID MARKETPLACE */}
      <div style={styles.grid}>
        {nfts.map((nft) => (
          <div key={nft.id} style={styles.nftCard} className="nft-card-hover">
            <div style={styles.imageWrapper}>
              <img src={nft.image_url} style={styles.nftImage} />
              <div style={styles.playOverlay} onClick={() => { setCurrentTrack(nft); incrementPlayCount(nft); }}>
				  <div style={styles.playIcon}>▶</div>
			  </div>
            </div>
            <div style={styles.nftContent}>
              <h4 style={styles.nftTitle}>{nft.name}</h4>
              <p style={styles.nftArtist}>Nghệ sĩ: {nft.creator_email || "Mạnh Hùng"}</p>
              
	    	   <div style={styles.nftStats}>
				  <span>🎧 {nft.views || 0} lượt nghe</span>
				  <span style={styles.priceText}>{nft.price || '0.01'} MATIC</span>
			   </div>
			  
			  <div style={styles.nftFooter}>
                <div style={styles.priceContainer}>
                   <span style={styles.priceLabel}>Giá</span>
                   <div style={styles.priceValue}>{nft.price || '0.01'} MATIC</div>
                </div>
				
				<button style={styles.btnZalo} onClick={() => openZaloChat(nft)}>
					💬 Hỏi mua qua Zalo
				</button>
                <button style={styles.btnBuySmall} onClick={() => handleBuyNFT(nft)}>Sở hữu</button>
				<button style={styles.btnVietQR} onClick={() => handleVietQR(nft)}>🏦 Mua bằng VNĐ (VietQR)</button>

				<button 
					style={styles.btnZalo} 
					onClick={() => {
						const sdt = "0778018931"; // <-- THAY SỐ CỦA BẠN VÀO ĐÂY (Viết liền, không cách)
						// Cấu pháp link Zalo cá nhân chuẩn nhất
						window.open(`https://zalo.me{sdt}?text=${loiNhan}`, '_blank'); 
					 }}
				>
					  💬 Hỏi giá qua Zalo
				</button>

			  </div>
            </div>
          </div>
        ))}
      </div>
// Giao diện hiển thị (Dán dưới Grid NFT)
<section style={styles.historySection}>
  <h3 style={styles.historyTitle}>💎 Hoạt động giao dịch mới nhất</h3>
  <div style={styles.historyTable}>
    {transactions.map((tx) => (
      <div key={tx.id} style={styles.historyItem}>
        <div style={styles.txInfo}>
          <span style={styles.txStatus}>🛍️ Đã bán</span>
          <b style={styles.txNftName}>{tx.nft_name}</b>
        </div>
        <div style={styles.txDetails}>
          <span style={styles.txBuyer}>Sở hữu bởi: {tx.buyer.substring(0, 8)}...</span>
          <span style={styles.txPrice}>{tx.price} MATIC</span>
          <span style={styles.txTime}>{new Date(tx.created_at).toLocaleTimeString()}</span>
        </div>
      </div>
    ))}
  </div>
</section>
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
            <input type="email" placeholder="Email của bạn" style={styles.modalInput} onChange={e => setAuthEmail(e.target.value)}
			/>
           
			<input type="text" placeholder="0x... hoặc kết nối ví" style={{...styles.modalInput, marginTop: '10px'}}
			value={walletAddress} //Kết nối với biến
			onChange={(e) => setWalletAddress(e.target.value)} //Cho phép gõ thủ công
			/>
            <button style={styles.btnActionPrimary} onClick={handleRegisterUser}>HOÀN TẤT ĐĂNG KÝ</button>
            <button style={{background: 'none', border: 'none', color: '#555', marginTop: '15px', cursor: 'pointer'}} onClick={(connectMetamask) => setShowAuthModal(false)}>Để sau</button>
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

