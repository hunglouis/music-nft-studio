async function addTokenToMetaMask() {
  try {
    const wasAdded = await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', 
        options: {
          address: '0x...', // Địa chỉ Contract Token của bạn
          symbol: 'TKN',    // Ký hiệu Token (viết hoa)
          decimals: 18,     // Số thập phân của token
          image: 'https://example.com', // Đường dẫn URL chứa logo (bắt buộc là link HTTPS công khai)
        },
      },
    });
    if (wasAdded) {
      console.log('Token đã được thêm thành công vào MetaMask!');
    }
  } catch (error) {
    console.error(error);
  }
}
