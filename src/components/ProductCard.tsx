import React from 'react';
import { Heart, Eye, Plus, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  currencySymbol: string;
  isWishlisted: boolean;
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  currencySymbol,
  isWishlisted,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  return (
    <div className="group bg-[#EFE6DA] rounded-[6px] border border-[#D8C8B4] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1">
      {/* Top Image Container */}
      <div className="relative aspect-[4/3] w-full bg-[#E3D7C7] overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Badge (if exists) */}
        {product.badge && (
          <span className="absolute top-3 left-3 bg-[#2A211B] text-[#F6F1EA] text-[10px] font-sans uppercase tracking-widest px-2.5 py-1 rounded-[2px]">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-[#8C6A43] text-white'
              : 'bg-[#F6F1EA]/80 text-[#2A211B] hover:bg-[#F6F1EA]'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Hover Quick View Overlay Action */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-[#2A211B]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-[#F6F1EA] hover:bg-white text-[#2A211B] text-xs font-sans uppercase tracking-wider px-3 py-1.5 rounded-[2px] flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
        {/* Unboxed Metadata */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-sans text-[#6F5F51]">
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.material.split(' ')[0]}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-[100px]">{product.edition}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-xl lg:text-2xl text-[#010000] font-normal cursor-pointer hover:text-[#8C6A43] transition-colors leading-snug line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="text-xs font-sans text-[#6F5F51] line-clamp-1">{product.subtitle}</p>
        </div>

        {/* Rating & Price Row */}
        <div className="pt-2 border-t border-[#D8C8B4]/70 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] font-sans text-[#6F5F51]">
              <Star className="w-3 h-3 text-[#8C6A43] fill-[#8C6A43]" />
              <span className="font-mono text-[#010000] font-medium">{product.rating}</span>
              <span>({product.reviewCount})</span>
            </div>
            <div className="font-mono text-base font-semibold text-[#010000] mt-0.5">
              {currencySymbol}{product.price.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            className="bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] hover:text-[#D9B98F] p-2.5 rounded-[4px] transition-all flex items-center justify-center cursor-pointer shadow-sm"
            title="Add to Bag"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
