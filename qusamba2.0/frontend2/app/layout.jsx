import {
  Geist,
  Geist_Mono,
  Great_Vibes,
  Nanum_Myeongjo,
  Open_Sans,
  Tenor_Sans,
} from "next/font/google";
import "./globals.css";
import "@fontsource/nanum-myeongjo";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { WishlistProvider } from "@/contexts/wishlist-context";
import { ToastProvider } from "@/components/ui/toast";
import LayoutWrapper from "@/components/layout-wrapper";

const openSans = Open_Sans({
 
  subsets: ["latin"],
});
export const tenorSans = Tenor_Sans({
  variable: "--font-tenor-sans",
  weight: "400",      
  subsets: ["latin"],
});

export const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const metadata = {
  title: "Qusamba - Elegant Bangles for Every Occasion",
  description:
    "Discover our handcrafted collection of beautiful bangles that add the perfect finishing touch to any outfit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* <body className={` not-[]:${""}  ml-auto mr-auto antialiased`}></body> */}
      <body className={` ${tenorSans.className} tracking-  ml-auto mr-auto antialiased`}>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
        
      </body>
    </html>
  );
}
