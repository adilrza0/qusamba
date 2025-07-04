import {
  Geist,
  Geist_Mono,
  Great_Vibes,
  Nanum_Myeongjo,
} from "next/font/google";
import "./globals.css";
import "@fontsource/nanum-myeongjo";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import Footer from "@/components/footer";

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Qusamba - Elegant Bangles for Every Occasion",
  description:
    "Discover our handcrafted collection of beautiful bangles that add the perfect finishing touch to any outfit.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={` not-[]:${greatVibes.className} ml-auto mr-auto antialiased`}>
        <AuthProvider>
         <CartProvider>
            <Navbar />
            {children}
            <Footer />
            </CartProvider>
            </AuthProvider>
        
      </body>
    </html>
  );
}
