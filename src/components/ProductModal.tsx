import React, { useState } from 'react';
import { X, Heart, ShoppingBag, ShieldCheck, Truck, Sparkles, Check, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  currencySymbol: string;
  isWishlisted: boolean;
  onClose: () => void;
  onToggleWishlist: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, finish?: string) => void;
  onOpenAIStudioWithProduct: (productName: string) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  currencySymbol,
  isWishlisted,
  onClose,
  onToggleWishlist,
  onAddToCart,
  onOpenAIStudioWithProduct,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(product.image);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const images = [product.image, product.secondaryImage].filter(Boolean) as string[];

  const handleAdd = () => {
    onAddToCart(product, quantity, product.finish);
    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#2A211B]/60 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div className="bg-[#F6F1EA] rounded-[8px] border border-[#D8C8B4] max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#2A211B] hover:text-[#8C6A43] bg-[#EFE6DA] hover:bg-[#E3D7C7] rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 p-6 lg:p-10">
          
          {/* Left Column: Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] bg-[#EFE6DA] rounded-[6px] border border-[#D8C8B4] overflow-hidden relative">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                onClick={() => onToggleWishlist(product)}
                className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                  isWishlisted ? 'bg-[#8C6A43] text-white' : 'bg-[#F6F1EA]/80 text-[#2A211B]'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-20 rounded-[4px] border overflow-hidden cursor-pointer transition-all ${
                      selectedImage === img ? 'border-[#8C6A43] ring-2 ring-[#8C6A43]/30' : 'border-[#D8C8B4] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Dimension Callout Box */}
            <div className="bg-[#EFE6DA] p-4 rounded-[6px] border border-[#D8C8B4] space-y-2 text-xs font-sans">
              <span className="font-serif text-sm text-[#010000] block font-medium">Specifications & Dimensions</span>
              <div className="grid grid-cols-2 gap-2 text-[#6F5F51]">
                <div>Height: <span className="font-mono text-[#010000] font-medium">{product.dimensions.height}</span></div>
                <div>Width: <span className="font-mono text-[#010000] font-medium">{product.dimensions.width}</span></div>
                <div>Depth: <span className="font-mono text-[#010000] font-medium">{product.dimensions.depth}</span></div>
                <div>Weight: <span className="font-mono text-[#010000] font-medium">{product.dimensions.weight}</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: PDP Info & Actions */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Edition */}
              <div className="flex items-center gap-2 text-xs font-sans text-[#8C6A43] font-medium uppercase tracking-widest">
                <span>{product.category}</span>
                <span>·</span>
                <span>{product.edition}</span>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="font-serif text-3xl lg:text-4xl text-[#010000] font-light leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs font-sans text-[#6F5F51] mt-1">{product.subtitle}</p>
              </div>

              {/* Rating & Price */}
              <div className="flex items-center justify-between py-3 border-y border-[#D8C8B4]">
                <div className="font-mono text-2xl font-semibold text-[#010000]">
                  {currencySymbol}{product.price.toLocaleString()}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-sans text-[#6F5F51]">
                  <Star className="w-4 h-4 text-[#8C6A43] fill-[#8C6A43]" />
                  <span className="font-mono font-medium text-[#010000]">{product.rating}</span>
                  <span>({product.reviewCount} Reviews)</span>
                </div>
              </div>

              {/* Description */}
              <p className="font-sans text-xs text-[#6F5F51] leading-relaxed">
                {product.description}
              </p>

              {/* Craftsmanship Notes */}
              <div className="bg-[#E3D7C7]/40 p-3 rounded-[4px] border border-[#D8C8B4] text-xs font-sans space-y-1">
                <span className="font-medium text-[#2A211B] block">Provenance & Material Notes</span>
                <p className="text-[#6F5F51] text-[11px]">{product.craftsmanshipNotes}</p>
              </div>

              {/* Finish Details */}
              <div className="text-xs font-sans space-y-1">
                <span className="text-[#6F5F51]">Material Finish: </span>
                <span className="font-medium text-[#010000]">{product.finish}</span>
              </div>

              {/* Delivery Lead Time */}
              <div className="flex items-center gap-2 text-xs font-sans text-[#8C6A43]">
                <Truck className="w-4 h-4 shrink-0" />
                <span>{product.leadTime}</span>
              </div>
            </div>

            {/* Actions Area */}
            <div className="space-y-4 pt-4 border-t border-[#D8C8B4]">
              
              {/* Quantity + Add to Cart Row */}
              <div className="flex items-center gap-4">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-[#D8C8B4] bg-[#EFE6DA] rounded-[4px]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-xs font-sans text-[#2A211B] hover:bg-[#D8C8B4] transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-mono font-medium text-[#010000]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-xs font-sans text-[#2A211B] hover:bg-[#D8C8B4] transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag CTA */}
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] text-xs font-sans uppercase tracking-widest font-medium py-3 px-6 rounded-[4px] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4 text-[#D9B98F]" />
                      <span>Added to Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 text-[#D9B98F]" />
                      <span>Add to Bag — {currencySymbol}{(product.price * quantity).toLocaleString()}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Secondary Action: AI Studio Room Pairing */}
              <button
                onClick={() => {
                  onClose();
                  onOpenAIStudioWithProduct(product.name);
                }}
                className="w-full bg-[#D8C8B4]/50 hover:bg-[#D9B98F]/30 text-[#010000] border border-[#D8C8B4] py-2.5 px-4 rounded-[4px] text-xs font-sans uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8C6A43]" />
                <span>Style This Piece with Nexora AI Studio</span>
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans text-[#6C6B6B] pt-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C6A43]" />
                  <span>5-Year Timber Guarantee</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8C6A43]" />
                  <span>White-Glove Delivery</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
