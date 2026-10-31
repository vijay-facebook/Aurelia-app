import React from 'react';
import { CheckCircle2, Truck, PackageCheck, Printer, ArrowRight, ShieldCheck } from 'lucide-react';

interface OrderConfirmationModalProps {
  orderDetails: any;
  currencySymbol: string;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderDetails,
  currencySymbol,
  onClose,
}) => {
  if (!orderDetails) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#2A211B]/60 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] rounded-[8px] border border-[#D8C8B4] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 lg:p-10 space-y-8 relative">
        
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-[#8C6A43]/15 text-[#8C6A43] rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#8C6A43] font-medium block">
            Reservation Confirmed
          </span>
          <h2 className="font-serif text-3xl lg:text-4xl text-[#010000] font-light">
            Thank You For Choosing Nexora
          </h2>
          <p className="text-xs text-[#6F5F51] max-w-md mx-auto">
            Your artisanal crate is being prepared by our master craftspeople. Order record <span className="font-mono font-medium text-[#010000]">{orderDetails.orderNumber}</span> has been created.
          </p>
        </div>

        {/* Order Status Tracker */}
        <div className="bg-[#EFE6DA] p-4 rounded-[6px] border border-[#D8C8B4] space-y-3">
          <span className="text-xs font-medium text-[#010000] block">Order Status & White-Glove Timeline</span>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-[#F6F1EA] p-2.5 rounded-[4px] border border-[#8C6A43]">
              <span className="block font-medium text-[#010000]">1. Confirmed</span>
              <span className="text-[10px] text-[#8C6A43]">Order Recorded</span>
            </div>
            <div className="bg-[#F6F1EA]/60 p-2.5 rounded-[4px] border border-[#D8C8B4]">
              <span className="block font-medium text-[#6F5F51]">2. Artisanal Crate</span>
              <span className="text-[10px] text-[#6F5F51]">In Inspection</span>
            </div>
            <div className="bg-[#F6F1EA]/60 p-2.5 rounded-[4px] border border-[#D8C8B4]">
              <span className="block font-medium text-[#6F5F51]">3. White-Glove</span>
              <span className="text-[10px] text-[#6F5F51]">Assembly Scheduled</span>
            </div>
          </div>
        </div>

        {/* Delivery Details Summary */}
        <div className="grid sm:grid-cols-2 gap-4 text-xs bg-[#EFE6DA] p-4 rounded-[6px] border border-[#D8C8B4]">
          <div>
            <span className="text-[#6F5F51] block text-[11px]">Recipient Name:</span>
            <span className="font-medium text-[#010000]">{orderDetails.customer.name}</span>
            
            <span className="text-[#6F5F51] block text-[11px] mt-2">Contact Phone:</span>
            <span className="font-medium text-[#010000]">{orderDetails.customer.phone}</span>
          </div>

          <div>
            <span className="text-[#6F5F51] block text-[11px]">Shipping Destination:</span>
            <span className="font-medium text-[#010000] block">{orderDetails.customer.address}</span>
            <span className="text-[#6F5F51]">{orderDetails.customer.city} {orderDetails.customer.postalCode}</span>

            <span className="text-[#6F5F51] block text-[11px] mt-2">Payment Terms:</span>
            <span className="font-medium text-[#8C6A43] uppercase">
              {orderDetails.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Credit Card / Reserve'}
            </span>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="space-y-3">
          <span className="font-serif text-lg text-[#010000] block">Itemized Summary</span>
          <div className="border border-[#D8C8B4] rounded-[6px] divide-y divide-[#D8C8B4] overflow-hidden">
            {orderDetails.items.map((item: any) => (
              <div key={item.product.id} className="p-3 bg-[#EFE6DA] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img src={item.product.image} alt={item.product.name} className="w-12 h-12 object-cover rounded-[2px]" referrerPolicy="no-referrer" />
                  <div>
                    <span className="font-serif text-sm font-normal text-[#010000] block">{item.product.name}</span>
                    <span className="text-[10px] text-[#6F5F51]">Qty: {item.quantity} · {item.product.material}</span>
                  </div>
                </div>
                <span className="font-mono font-medium text-[#010000]">
                  {currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Total */}
        <div className="p-4 bg-[#2A211B] text-[#F6F1EA] rounded-[6px] flex justify-between items-center text-sm font-serif">
          <div>
            <span className="text-xs font-sans text-[#D9B98F] block">Total Amount Due</span>
            <span className="text-xl font-mono text-white">{currencySymbol}{orderDetails.total.toLocaleString()}</span>
          </div>
          <button
            onClick={handlePrint}
            className="border border-[#D8C8B4] hover:bg-[#D8C8B4] hover:text-[#2A211B] text-[#F6F1EA] text-xs font-sans uppercase tracking-wider py-2 px-4 rounded-[4px] flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Action Button */}
        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] text-xs font-sans uppercase tracking-widest font-medium py-3 px-8 rounded-[4px] transition-all inline-flex items-center gap-2 shadow-md cursor-pointer"
          >
            <span>Return to Gallery</span>
            <ArrowRight className="w-4 h-4 text-[#D9B98F]" />
          </button>
        </div>

      </div>
    </div>
  );
};
