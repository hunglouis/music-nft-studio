"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PlusSquare,
  User,
  Music,
  Moon,
  Sun
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const path = usePathname();
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  const menu = [
    { name: "Home", href: "/", icon: Home },
    { name: "Create", href: "/create", icon: PlusSquare },
    { name: "Profile", href: "/profile", icon: User },
    { name: "My NFTs", href: "/my-nfts", icon: Music },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 
      bg-white dark:bg-[#0d0d0d] 
      border-r dark:border-gray-800
      p-5 flex flex-col justify-between">

      {/* 🔥 LOGO */}
      <div>
       
