import { Sparkles, Heart } from "lucide-react";

const DiscountStrip = () => {
  return (
    <div
      className=" top-0 left-0 right-0 z-50 bg-primary text-primary-foreground py-3 px-4 text-center relative overflow-hidden"
      style={{
       
        backgroundSize: "200% 100%",
        animation: "shimmer 2s ease-in-out infinite",
      }}
    >
      <div className="flex items-center justify-center space-x-2 relative z-10">
        <Heart className="h-4 w-4 animate-pulse" />
        <p className="font-medium text-sm">
          Valentine's Special: 25% Off Rose Collection | Free Shipping on All
          Orders
        </p>
        <Sparkles className="h-4 w-4 animate-pulse" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-left"></div>
    </div>
  );
};

export default DiscountStrip;
