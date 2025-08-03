"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import DiscountStrip from "@/components/DiscountStrip";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  
  // Check if current path is admin-related
  const isAdminRoute = pathname.startsWith('/admin');
  
  return (
    <>
      {!isAdminRoute && <DiscountStrip />}
      {!isAdminRoute && <Navbar />}
      <div >
        {children}
      </div>
      {!isAdminRoute && <Footer />}
    </>
  );
}
