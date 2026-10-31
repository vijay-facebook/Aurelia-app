import React from 'react';
import { X, Heart, ShoppingBag, Trash2, Eye, ArrowRight, Sparkles } from 'lucide-react';
import { Product } from '../types';

interface WishlistDrawerProps {
  isOpen: boolean;
  wishlistIds: string[];
  products: Product[];
  currencySymbol: string;
  onClose: () => void;
  onRemoveFromWishlist: (product: Product) => void;
  onClearWishlist: () => void;
  onMoveToCart: (product: Product) => void;
  onMoveAllToCart: (wishlistProducts: Product[]) => void;
  onQuickView: (product: Product) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  wishlistIds,
  products,
  currencySymbol,
  onClose,
  onRemoveFromWishlist,
  onClearWishlist,
  onMoveToCart,
  onMoveAllToCart,
  onQuickView,
}) => {
  if (!isOpen) return null;

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));
  const totalValue = wishlistedProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2A211B]/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] w-full max-w-md h-full shadow-2xl border-l border-[#D8C8B4] flex flex-col justify-between overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#D8C8B4] bg-[#EFE6DA] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8C6A43]/15 text-[#8C6A43] flex items-center justify-center">
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-[#010000] font-light">
                Saved Artifacts
              </h3>
              <span className="text-xs text-[#6F5F51]">
                {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'Saved Item' : 'Saved Items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {wishlistedProducts.length > 0 && (
              <button
                onClick={onClearWishlist}
                className="text-xs text-[#6F5F51] hover:text-red-700 underline px-2 py-1 transition-colors cursor-pointer"
                title="Clear entire wishlist"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-[#2A211B] hover:text-[#8C6A43] bg-[#F6F1EA] rounded-full transition-colors cursor-pointer"
              aria-label="Close wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {wishlistedProducts.length > 0 ? (
            <div className="space-y-4">
              {wishlistedProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#EFE6DA] p-3.5 rounded-[6px] border border-[#D8C8B4] flex items-center gap-4 transition-all hover:border-[#8C6A43]/50"
                >
                  {/* Thumbnail Image */}
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-cover rounded-[4px] shrink-0 bg-[#E3D7C7] cursor-pointer"
                    onClick={() => onQuickView(product)}
                    referrerPolicy="no-referrer"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-[#8C6A43] uppercase tracking-wider font-medium">
                      <span>{product.category}</span>
                      <span>{product.inStock ? 'In Stock' : 'Pre-order'}</span>
                    </div>

                    <h4
                      onClick={() => onQuickView(product)}
                      className="font-serif text-base text-[#010000] font-normal truncate cursor-pointer hover:text-[#8C6A43] transition-colors"
                    >
                      {product.name}
                    </h4>

                    <p className="text-[11px] text-[#6F5F51] truncate">{product.material}</p>

                    <div className="font-mono text-xs font-semibold text-[#010000]">
                      {currencySymbol}{product.price.toLocaleString()}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#D8C8B4]/60">
                      <button
                        onClick={() => onMoveToCart(product)}
                        className="bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-[2px] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3 text-[#D9B98F]" />
                        <span>Move to Bag</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onQuickView(product)}
                          className="p-1 text-[#6F5F51] hover:text-[#010000] transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRemoveFromWishlist(product)}
                          className="p-1 text-[#6F5F51] hover:text-red-700 transition-colors cursor-pointer"
                          title="Remove from wishlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EFE6DA] text-[#8C6A43] flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <p className="font-serif text-2xl text-[#010000]">Your Wishlist is Empty</p>
              <p className="text-xs text-[#6F5F51] max-w-xs mx-auto">
                Save your favorite solid oak furniture, travertine tables, and brass lighting fixtures while browsing.
              </p>
              <button
                onClick={onClose}
                className="bg-[#2A211B] text-[#F6F1EA] text-xs uppercase tracking-wider font-sans px-6 py-2.5 rounded-[4px] hover:bg-[#1D1612] transition-colors cursor-pointer"
              >
                Explore Catalog
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {wishlistedProducts.length > 0 && (
          <div className="p-6 border-t border-[#D8C8B4] bg-[#EFE6DA] space-y-4">
            <div className="flex justify-between items-center text-xs font-sans">
              <span className="text-[#6F5F51]">Total Value of Saved Artifacts</span>
              <span className="font-serif font-bold text-[#010000] font-mono text-base">
                {currencySymbol}{totalValue.toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => onMoveAllToCart(wishlistedProducts)}
              className="w-full bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] uppercase text-xs tracking-widest font-medium py-3.5 rounded-[4px] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#D9B98F]" />
              <span>Move All ({wishlistedProducts.length}) to Shopping Bag</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
