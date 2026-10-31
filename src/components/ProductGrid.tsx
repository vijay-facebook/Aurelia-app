import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import { Product, FilterState } from '../types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currencySymbol: string;
  wishlistIds: string[];
  onToggleWishlist: (product: Product) => void;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  currencySymbol,
  wishlistIds,
  onToggleWishlist,
  onQuickView,
  onAddToCart,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    material: 'All',
    sortBy: 'featured',
    searchQuery: '',
    inStockOnly: false,
  });

  const categories = ['All', 'Furniture', 'Lighting', 'Ceramics', 'Textiles'];
  const materials = ['All', 'Solid European Oak', 'Brushed Brass', 'Travertine', 'Amber Glass', 'Raw Linen', 'Terracotta'];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.category !== 'All' && p.category !== filters.category) return false;
        if (filters.material !== 'All' && !p.material.toLowerCase().includes(filters.material.toLowerCase())) return false;
        if (filters.inStockOnly && !p.inStock) return false;
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.subtitle.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.material.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        return 0; // featured default
      });
  }, [products, filters]);

  const resetFilters = () => {
    setFilters({
      category: 'All',
      material: 'All',
      sortBy: 'featured',
      searchQuery: '',
      inStockOnly: false,
    });
  };

  return (
    <section id="collection" className="py-16 max-w-[1680px] mx-auto px-6 lg:px-12">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#8C6A43] font-medium block mb-2">
            Catalog & Masterpieces
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-light text-[#010000]">
            The Curated Collection
          </h2>
        </div>

        <p className="font-sans text-sm text-[#6F5F51] max-w-md">
          Every piece is produced in limited studio runs using natural timbers, hand-cast brass, and hand-honed travertine marble.
        </p>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#EFE6DA] p-4 lg:p-6 rounded-[6px] border border-[#D8C8B4] mb-10 flex flex-col gap-4">
        
        {/* Top Row: Category Tabs */}
        <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2 border-b border-[#D8C8B4]/60">
          <div className="flex items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({ ...filters, category: cat })}
                className={`px-4 py-2 text-xs font-sans uppercase tracking-wider rounded-[4px] transition-all cursor-pointer whitespace-nowrap ${
                  filters.category === cat
                    ? 'bg-[#2A211B] text-[#F6F1EA] font-medium shadow-sm'
                    : 'text-[#6F5F51] hover:text-[#010000] hover:bg-[#E3D7C7]/50'
                }`}
              >
                {cat === 'All' ? 'All Artifacts' : cat}
              </button>
            ))}
          </div>

          <div className="text-xs font-sans text-[#6F5F51] shrink-0 font-mono">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'Artifact' : 'Artifacts'}
          </div>
        </div>

        {/* Bottom Row: Search, Material Filter, Sort, Stock Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          
          {/* Search Input */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-[#8C6A43] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by keyword, material (e.g. Travertine, Brass)..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full bg-[#F6F1EA] text-xs text-[#010000] pl-9 pr-4 py-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] transition-colors placeholder:text-[#6F5F51]/60 font-sans"
            />
          </div>

          {/* Material Dropdown */}
          <div className="lg:col-span-3">
            <select
              value={filters.material}
              onChange={(e) => setFilters({ ...filters, material: e.target.value })}
              className="w-full bg-[#F6F1EA] text-xs text-[#010000] px-3 py-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] transition-colors font-sans cursor-pointer"
            >
              <option value="All">All Materials & Finishes</option>
              {materials.filter(m => m !== 'All').map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="lg:col-span-2">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="w-full bg-[#F6F1EA] text-xs text-[#010000] px-3 py-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] transition-colors font-sans cursor-pointer"
            >
              <option value="featured">Featured Order</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="lg:col-span-2 flex justify-end">
            <button
              onClick={resetFilters}
              className="w-full text-xs font-sans text-[#8C6A43] hover:text-[#2A211B] flex items-center justify-center gap-1.5 py-2 px-3 border border-[#D8C8B4] rounded-[4px] bg-[#F6F1EA] hover:bg-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* Product Grid display */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currencySymbol={currencySymbol}
              isWishlisted={wishlistIds.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onQuickView={onQuickView}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#EFE6DA] rounded-[6px] border border-[#D8C8B4] p-12 text-center space-y-4">
          <p className="font-serif text-2xl text-[#010000]">No Artifacts Match Your Search Criteria</p>
          <p className="font-sans text-xs text-[#6F5F51] max-w-md mx-auto">
            Try adjusting your search terms or material filters to explore our full artisanal catalog.
          </p>
          <button
            onClick={resetFilters}
            className="bg-[#2A211B] text-[#F6F1EA] px-6 py-2.5 rounded-[4px] text-xs uppercase tracking-wider font-sans hover:bg-[#1D1612] transition-colors cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </section>
  );
};
