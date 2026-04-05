'use client';
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

// 1. CẤU HÌNH HỆ THỐNG
const SMARTCONTRACT_ADDRESS = "0xdde62b6454e09c2d9ee759d7d3926508efef44b7";
const PLATFORM_ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET;

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function MusicNFTStudio() {
    // --- STATES ---
    const [ethPriceUSD, setEthPriceUSD] = useState(2065); // Giá mặc định nếu API lỗi
	const [order, setOrder] = useState(null);
    const [nfts, setNfts] = useState([]);
    const [authEmail, setAuthEmail] = useState('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [activeQRUrl, setActiveQRUrl] = useState('');
    const [userWalletAddress, setUserWalletAddress] = useState('');

    useEffect(() => {
        fetchNFTs();
    }, []);
	const fetchETHPrice = async () => {
  try {
    const res = await axios.get('https://coingecko.com');
    const price = res.data.ethereum.usd;
    setEthPriceUSD(price);
    console.log("🚀 Giá ETH mới nhất:", price, "USD");
  } catch (err) {
    console.error("Không lấy được giá ETH mới:", err);
  }
};

// Tự động cập nhật mỗi 5 phút
useEffect(() => {
  fetchETHPrice();
  const interval = setInterval(fetchETHPrice, 300000); 
  return () => clearInterval(interval);
}, []);

    const fetchNFTs = async () => {
        const { data } = await supabase.from('hunglouis').select('*').order('created_at', { ascending: false });
        setNfts(data || []);
    };

    const connectWallet = async () => {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const address = accounts[0];
                setUserWalletAddress(`${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
                setAuthEmail(address);
            } catch (err) {
                console.error("Lỗi kết nối ví:", err);
            }
        } else {
            alert("Vui lòng cài đặt MetaMask!");
        }
    };

    // HÀM XỬ LÝ MUA HÀNG & HIỆN QR
    const handleBuyNFT = async (nft) => {
        try {
            const paymentContent = `MH${Math.floor(100000 + Math.random() * 900000)}`;
            const amountVND = Math.round(parseFloat(nft.price) * ethPriceUSD * 25500);

            // 1. Lưu đơn hàng
            const { data, error } = await supabase
                .from('order')
                .insert([{
                    nft_id: nft.id,
                    buyer_address: userWalletAddress,
                    amount: amountVND,
                    payment_content: paymentContent,
                    status: 'pending'
                }])
                .select().single();

            if (error) throw error;

            // 2. Tạo Link VietQR chuẩn
            const MY_BANK = "BIDV";
            const MY_ACC = "3120464627";
            const qrUrl = `https://vietqr.io{amountVND}&addInfo=${paymentContent}&accountName=NGUYEN%20MANH%20HUNG`;


            setOrder(data);
            setActiveQRUrl(qrUrl);
            setShowQRModal(true);

        } catch (err) {
            console.error("Lỗi mua hàng:", err);
            alert("Có lỗi xảy ra khi tạo đơn hàng.");
        }
    };

    // --- GIAO DIỆN (PHẦN QUAN TRỌNG NHẤT) ---
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>ManhHung Marketplace</h1>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                {!userWalletAddress ? (
                    <button onClick={connectWallet} style={styles.button}>Kết nối ví Metamask</button>
                ) : (
                    <p>Ví của bạn: <b>{userWalletAddress}</b></p>
                )}
            </div>

            {/* DANH SÁCH NFT */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                {nfts.map((nft) => (
                    <div key={nft.id} style={styles.card}>
                        <img src={nft.image_url} alt={nft.name} style={{ width: '100%', borderRadius: '8px' }} />
                        <h3>{nft.name}</h3>
                        <p>Giá: {nft.price} ETH (~{(nft.price * ethPriceUSD * 25500).toLocaleString()} VNĐ)</p>
                        <button onClick={() => handleBuyNFT(nft)} style={styles.buyButton}>Mua bằng VNĐ (VietQR)</button>
                    </div>
                ))}
            </div>

            {/* MODAL HIỆN MÃ QR */}
            {showQRModal && (
                <div style={styles.modalOverlay} onClick={() => setShowQRModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <h3>Thanh toán BIDV</h3>
                            <button onClick={() => setShowQRModal(false)} style={{ border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
                        </div>
                        <div style={{ textAlign: 'center', margin: '20px 0' }}>
                            <img src={activeQRUrl} alt="QR Code" style={{ width: '100%', maxWidth: '250px' }} />
                            <p style={{ marginTop: '10px', fontWeight: 'bold', color: '#d32f2f' }}>
                                Số tiền: {order?.amount.toLocaleString()} VNĐ
                            </p>
                            <p style={{ fontSize: '12px', color: '#666' }}>Nội dung: {order?.payment_content}</p>
                        </div>
                        <p style={{ fontSize: '13px', textAlign: 'center', fontStyle: 'italic' }}>
                            Vui lòng không thay đổi nội dung chuyển khoản để hệ thống tự động nhận diện.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- HỆ THỐNG STYLES - BẢN GỐC ---
const styles = {
    button: { padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    card: { backgroundColor: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' },
    buyButton: { width: '100%', padding: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
    // Dòng 365 của bạn sẽ nằm ở đây, hãy đảm bảo có dấu phẩy ở cuối dòng buyButton phía trên
    modalOverlay: { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.7)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1000 
    },
    modalContent: { 
        backgroundColor: '#fff', 
        padding: '25px', 
        borderRadius: '15px', 
        width: '90%', 
        maxWidth: '400px' 
    },
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


