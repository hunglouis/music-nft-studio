import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Đảm bảo bạn đã có file globals.css, nếu không hãy xóa dòng này

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Music NFT Studio",
  description: "Cổng kết nối ví Web3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
