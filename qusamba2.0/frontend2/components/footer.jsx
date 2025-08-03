import { greatVibes } from "@/app/layout";
import { cn } from "@/lib/utils";
import { Heart, Instagram, Facebook, Twitter } from "lucide-react";

const footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className={cn("font-serif text-4xl font-semibold mb-4", greatVibes.className)}>Qusamba</h3>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Crafting timeless jewelry pieces that celebrate life's most precious moments with elegance and sophistication.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-6 w-6 hover:text-rose-red-light cursor-pointer transition-colors" />
              <Facebook className="h-6 w-6 hover:text-rose-red-light cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 hover:text-rose-red-light cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Collections</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Care Instructions</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="font-semibold mb-4">Customer Care</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Warranty</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2024 Lumina. All rights reserved.
          </p>
          <p className="text-primary-foreground/60 text-sm flex items-center mt-4 md:mt-0">
            Made with <Heart className="h-4 w-4 mx-1 text-rose-red" /> for jewelry lovers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default footer;