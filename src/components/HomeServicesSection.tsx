import React, { useState } from 'react';
import { Home, MapPin, Clock, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

interface HomeServicesSectionProps {
  onBookHomeService: (serviceTitle: string) => void;
  onShowToast: (message: string) => void;
}

export const HomeServicesSection: React.FC<HomeServicesSectionProps> = ({ onBookHomeService, onShowToast }) => {
  const { config } = useConfig();
  const [locationPin, setLocationPin] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeResult, setPincodeResult] = useState<{ available: boolean; message: string } | null>(null);

  if (!config.sectionsVisibility.homeServices) return null;

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationPin.trim()) return;

    setIsCheckingPincode(true);
    setPincodeResult(null);

    setTimeout(() => {
      setIsCheckingPincode(false);
      const clean = locationPin.trim().toLowerCase();
      const supportedAreas = config.businessInfo.atHomeServedAreas?.map(a => a.toLowerCase()) || ['bandra', 'juhu', 'khar', 'worli', 'colaba'];
      
      const isAvailable = supportedAreas.some((area) => clean.includes(area) || area.includes(clean));

      if (isAvailable || clean.length >= 6) {
        setPincodeResult({
          available: true,
          message: `Great news! At-Home service is available in your area (${locationPin.toUpperCase()}). Senior artists can be dispatched.`,
        });
        onShowToast('At-Home service available in your area!');
      } else {
        setPincodeResult({
          available: false,
          message: `We currently service select locations (${config.businessInfo.atHomeServedAreas?.join(', ') || 'Mumbai'}). Contact concierge for special requests.`,
        });
      }
    }, 600);
  };

  return (
    <section id="home-services" className="py-24 lg:py-32 bg-[#1D1612] text-[#F6F1EA] font-sans relative overflow-hidden border-t border-[#3A2F27]">
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-[#D9B98F]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D9B98F] font-medium block mb-3">
              {config.headings.homeServicesEyebrow}
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F6F1EA] tracking-tight leading-[1.05]">
              {config.headings.homeServicesTitle}
            </h2>
          </div>
          <p className="text-sm lg:text-base text-[#D8C8B4]/80 font-light max-w-md leading-relaxed">
            Experience the same rigorous hygiene, professional Dyson equipment, organic botanical products, and senior artists in the comfort of your home or hotel suite.
          </p>
        </div>

        {/* Pincode / Area Checker Box */}
        <div className="bg-[#261E19] border border-[#3A2F27] rounded-[12px] p-6 lg:p-8 mb-16 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#15100D] border border-[#3A2F27] flex items-center justify-center text-[#D9B98F] shrink-0 mt-1">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-light text-[#F6F1EA] mb-1">
                Check At-Home Availability
              </h3>
              <p className="text-xs text-[#D8C8B4]/70 font-light">
                Enter your area name or pincode to verify stylist dispatch.
              </p>
            </div>
          </div>

          <form onSubmit={handleCheckPincode} className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Enter Area / Pincode"
              value={locationPin}
              onChange={(e) => setLocationPin(e.target.value)}
              className="bg-[#15100D] border border-[#3A2F27] focus:border-[#D9B98F] text-[#F6F1EA] px-4 py-3 rounded-[4px] text-xs outline-none w-full sm:w-64 placeholder:text-[#D8C8B4]/40"
              required
            />
            <button
              type="submit"
              disabled={isCheckingPincode}
              className="bg-[#D9B98F] hover:bg-[#AE9472] text-[#1D1612] px-6 py-3 rounded-[4px] text-xs font-sans uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              {isCheckingPincode ? 'Checking...' : 'Check Availability'}
            </button>
          </form>
        </div>

        {pincodeResult && (
          <div className={`p-5 rounded-[8px] mb-12 flex items-center gap-3 text-xs sm:text-sm animate-fade-in ${
            pincodeResult.available 
              ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-200' 
              : 'bg-amber-950/40 border border-amber-500/40 text-amber-200'
          }`}>
            <ShieldCheck className="w-5 h-5 shrink-0 text-[#D9B98F]" />
            <span>{pincodeResult.message}</span>
          </div>
        )}

        {/* Home Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {config.homeServices.map((service) => (
            <div
              key={service.id}
              className="bg-[#261E19] border border-[#3A2F27] hover:border-[#D9B98F]/50 rounded-[8px] overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden bg-[#15100D]">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1D1612] via-transparent to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-[#F6F1EA] bg-[#1D1612]/85 backdrop-blur-md px-2.5 py-1 rounded-[4px] border border-[#D8C8B4]/20">
                    <Clock className="w-3 h-3 text-[#D9B98F]" />
                    <span>{service.duration}</span>
                  </div>

                  <div className="absolute top-3 right-3 text-[10px] uppercase tracking-wider font-semibold text-[#1D1612] bg-[#D9B98F] px-2.5 py-1 rounded-[4px]">
                    At-Home
                  </div>
                </div>

                <div className="p-6">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#D9B98F] font-medium block mb-1">
                    {service.subtitle}
                  </span>
                  <h3 className="font-serif text-xl font-light text-[#F6F1EA] group-hover:text-[#D9B98F] transition-colors leading-snug mb-3">
                    {service.title}
                  </h3>
                  <p className="text-xs text-[#D8C8B4]/70 font-light leading-relaxed mb-6">
                    {service.description}
                  </p>

                  <ul className="space-y-2 mb-6 pt-4 border-t border-[#3A2F27]">
                    {service.includes?.map((inc, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-[#D8C8B4] font-light">
                        <Check className="w-3.5 h-3.5 text-[#D9B98F] shrink-0 mt-0.5" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-6 pt-0">
                <div className="pt-4 border-t border-[#3A2F27] flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-wider text-[#D8C8B4]/60">At-Home Fee</span>
                  <span className="font-serif text-2xl text-[#F6F1EA] font-normal">{service.price}</span>
                </div>

                <button
                  onClick={() => onBookHomeService(`${service.title} (${service.price} - At-Home)`)}
                  className="w-full bg-[#D9B98F] hover:bg-[#AE9472] text-[#1D1612] py-3 rounded-[4px] text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group/btn"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Book At-Home Service</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
