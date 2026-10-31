import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2, ArrowRight, Check, Plus, RefreshCw } from 'lucide-react';
import { Product } from '../types';

interface StudioAIModalProps {
  isOpen: boolean;
  initialQuery?: string;
  products: Product[];
  currencySymbol: string;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
}

export const StudioAIModal: React.FC<StudioAIModalProps> = ({
  isOpen,
  initialQuery = '',
  products,
  currencySymbol,
  onClose,
  onAddToCart,
  onQuickView,
}) => {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState(initialQuery || '');
  const [spaceType, setSpaceType] = useState('Living Sanctuary');
  const [preferredStyle, setPreferredStyle] = useState('Artisanal Minimalist');
  const [budget, setBudget] = useState('Bespoke ($5,000+)');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const spaceTypes = ['Living Sanctuary', 'Dining Gallery', 'Bedroom Oasis', 'Executive Office', 'Architectural Lounge'];
  const styleMoods = ['Artisanal Minimalist', 'Warm Brutalist', 'Modern Japandi', 'Mediterranean Organic'];
  const budgetScopes = ['Curated ($2,000 – $5,000)', 'Bespoke ($5,000 – $10,000)', 'Unlimited ($10,000+)'];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/studio-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt || 'Provide a holistic spatial design plan using Nexora items.',
          spaceType,
          preferredStyle,
          budget,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to connect to Studio AI');
      }

      setAiResult(data.text);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Error generating interior consultation. Please verify GEMINI_API_KEY.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#2A211B]/60 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] rounded-[8px] border border-[#D8C8B4] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-[#D8C8B4] bg-[#EFE6DA] flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2A211B] text-[#D9B98F] flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl text-[#010000] font-normal">
                Nexora Studio AI — Interior & Spatial Concierge
              </h3>
              <p className="text-xs text-[#6F5F51]">
                Powered by Gemini 3.8 Flash · Architectural material pairing & spatial composition
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#2A211B] hover:text-[#8C6A43] bg-[#F6F1EA] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 lg:p-8 space-y-8 flex-1 overflow-y-auto">
          
          {/* Preset Selectors Form */}
          <form onSubmit={handleSubmit} className="space-y-6 bg-[#EFE6DA] p-5 rounded-[6px] border border-[#D8C8B4]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Space Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2A211B] block">Space Type</label>
                <select
                  value={spaceType}
                  onChange={(e) => setSpaceType(e.target.value)}
                  className="w-full bg-[#F6F1EA] text-xs text-[#010000] p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                >
                  {spaceTypes.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Aesthetic Mood */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2A211B] block">Design Vibe</label>
                <select
                  value={preferredStyle}
                  onChange={(e) => setPreferredStyle(e.target.value)}
                  className="w-full bg-[#F6F1EA] text-xs text-[#010000] p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                >
                  {styleMoods.map((sm) => (
                    <option key={sm} value={sm}>{sm}</option>
                  ))}
                </select>
              </div>

              {/* Budget Scope */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#2A211B] block">Budget Range</label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-[#F6F1EA] text-xs text-[#010000] p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                >
                  {budgetScopes.map((bs) => (
                    <option key={bs} value={bs}>{bs}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Prompt Text Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#2A211B] block">
                Describe Your Room, Architectural Features, or Preferences
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. My living room has concrete floors, floor-to-ceiling windows, and plaster walls. Recommend warm solid oak seating and brass lighting to balance the cool concrete..."
                  className="w-full bg-[#F6F1EA] text-xs text-[#010000] p-3 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] placeholder:text-[#6F5F51]/60"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] text-xs uppercase tracking-widest font-medium py-3 px-6 rounded-[4px] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D9B98F]" />
                    <span>Analyzing Spatial Composition...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D9B98F]" />
                    <span>Generate Spatial Styling Plan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message if any */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs p-4 rounded-[4px]">
              {errorMsg}
            </div>
          )}

          {/* AI Output Section */}
          {aiResult && (
            <div className="space-y-6 animate-fade-in border-t border-[#D8C8B4] pt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans uppercase tracking-widest text-[#8C6A43] font-medium flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Custom Studio AI Recommendation
                </span>
                <button
                  onClick={handleSubmit}
                  className="text-xs text-[#2A211B] hover:text-[#8C6A43] flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Regenerate Plan</span>
                </button>
              </div>

              {/* Formatted Output Text */}
              <div className="bg-white p-6 rounded-[6px] border border-[#D8C8B4] space-y-4 font-sans text-xs text-[#2A211B] leading-relaxed whitespace-pre-line shadow-sm">
                {aiResult}
              </div>

              {/* Recommended Catalog Products Row */}
              <div className="space-y-3">
                <h4 className="font-serif text-2xl text-[#010000]">Suggested Nexora Artifacts</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.slice(0, 3).map((p) => (
                    <div key={p.id} className="bg-[#EFE6DA] p-3 rounded-[6px] border border-[#D8C8B4] flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-16 h-16 object-cover rounded-[4px] shrink-0" referrerPolicy="no-referrer" />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-serif text-sm text-[#010000] truncate">{p.name}</h5>
                        <div className="font-mono text-xs text-[#010000]">{currencySymbol}{p.price.toLocaleString()}</div>
                        <button
                          onClick={() => onAddToCart(p)}
                          className="mt-1 text-[10px] uppercase tracking-wider text-[#8C6A43] hover:text-[#2A211B] font-medium flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to Bag</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
