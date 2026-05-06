// Louis Music Heritage Protection System
export function applyHeritageLock(playerId, limit = 45) {
    const audio = document.getElementById(playerId);
    if (!audio) return;

    audio.addEventListener('timeupdate', function() {
        // Tạm thời để false. Sau này logic xác thực ví sẽ điều khiển biến này.
        let isVerifiedMember = false; 

        if (!isVerifiedMember && audio.currentTime >= limit) {
            audio.pause();
            audio.currentTime = 0;
            
            // Gọi hàm hiện Popup (sẽ định nghĩa ở dưới)
            showHeritagePopup();
            
            // Ẩn thanh player bar nếu có
            const playerBar = document.getElementById('music-player-bar');
            if(playerBar) playerBar.classList.add('translate-y-full');
        }
    });
}

// Chặn chuột phải toàn trang để hạn chế lưu nhạc trái phép
document.addEventListener('contextmenu', event => event.preventDefault());

// Thay đổi đoạn nút bấm trong Popup
const btnHtml = `
    <div class="flex flex-col gap-3">
        <!-- ƯU TIÊN MUA TẠI TRANG NHÀ -->
        <a href="/NFTMusicmarketplace/mint_page.php" 
           class="bg-cyan-500 text-black font-black py-4 rounded-full hover:bg-white transition shadow-lg">
            MUA TRỰC TIẾP TẠI HUNGLOUIS (ƯU TIÊN)
        </a>
        
        <!-- LỰA CHỌN THỨ HAI -->
        <a href="https://opensea.io" target="_blank" 
           class="border border-gray-500 text-gray-300 py-3 rounded-full hover:border-white hover:text-white transition text-sm">
            Mua tại OpenSea (Secondary Market)
        </a>
    </div>
`;

