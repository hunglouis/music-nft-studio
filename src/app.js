// Đặt logic này tại file quản lý trạng thái chính hoặc trang chào mừng
import React, { useState, useEffect } from 'react';

export const GalleryExperience = () => {
  const [audio] = useState(new Audio('duong_dan_nhac_hieu_hung_louis.mp3'));

  const handleEnterGallery = () => {
    // 1. Kích hoạt phát nhạc hiệu
    audio.play().catch(error => console.log("Trình duyệt yêu cầu tương tác trước khi phát nhạc:", error));
    
    // 2. Cấu hình tự động giảm âm lượng (Fade-out) và tắt sau đúng 60 giây
    setTimeout(() => {
      let fadeEffect = setInterval(() => {
        if (audio.volume > 0.1) {
          audio.volume -= 0.1;
        } else {
          clearInterval(fadeEffect);
          audio.pause();
        }
      }, 100); // Giảm dần âm lượng mỗi 100ms để tạo cảm giác tắt nhạc mượt mà
    }, 59000); // Bắt đầu giảm từ giây thứ 59

    // 3. Thực hiện lệnh chuyển màn hình đưa người dùng vào Galleries từ đây
    // navigation.navigate('MainGallery'); 
  };

  return (
    <button onClick={handleEnterGallery}>
      Bước vào Không gian Nghệ thuật
    </button>
  );
};
