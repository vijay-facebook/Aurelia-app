import React, { useState } from 'react';
import { X, Trash2, ArrowRight, ShieldCheck, Truck, Check, Sparkles, CreditCard, Banknote } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currencySymbol: string;
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckoutComplete: (orderDetails: any) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  items,
  currencySymbol,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutComplete,
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Checkout Step State: 'cart' | 'checkout'
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');

  // Checkout Form State
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeShippingThreshold = 1500;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 150;
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discountAmount + shippingFee;

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'NEXORA10') {
      setAppliedDiscount(10);
      setPromoError('');
    } else {
      setPromoError('Invalid promo code. Use NEXORA10 for 10% off.');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name || !customer.phone || !customer.address) {
      alert('Please fill in your delivery name, phone, and shipping address.');
      return;
    }

    const orderNumber = `NEX-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderDetails = {
      orderNumber,
      items: [...items],
      total,
      subtotal,
      shippingFee,
      discountAmount,
      paymentMethod,
      customer,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    };

    onCheckoutComplete(orderDetails);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#2A211B]/60 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] w-full max-w-md h-full shadow-2xl border-l border-[#D8C8B4] flex flex-col justify-between overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#D8C8B4] bg-[#EFE6DA] flex items-center justify-between sticky top-0 z-10">
          <div>
            <h3 className="font-serif text-2xl text-[#010000] font-light">
              {step === 'cart' ? 'Shopping Bag' : 'Delivery & Payment'}
            </h3>
            <span className="text-xs text-[#6F5F51]">
              {items.length} {items.length === 1 ? 'Selected Artifact' : 'Selected Artifacts'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#2A211B] hover:text-[#8C6A43] bg-[#F6F1EA] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          
          {step === 'cart' ? (
            <>
              {/* Free Shipping Progress Bar */}
              <div className="bg-[#EFE6DA] p-3.5 rounded-[6px] border border-[#D8C8B4] space-y-2 text-xs">
                <div className="flex justify-between text-[#2A211B]">
                  <span>White-Glove Shipping</span>
                  <span className="font-medium font-mono">
                    {remainingForFreeShipping === 0
                      ? 'Complimentary Shipping Unlocked!'
                      : `Add ${currencySymbol}${remainingForFreeShipping.toLocaleString()} for Free Delivery`}
                  </span>
                </div>
                <div className="w-full bg-[#D8C8B4] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8C6A43] h-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="bg-[#EFE6DA] p-3 rounded-[6px] border border-[#D8C8B4] flex items-center gap-4"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded-[4px] shrink-0 bg-[#E3D7C7]"
                        referrerPolicy="no-referrer"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-serif text-base text-[#010000] font-normal truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-[#6F5F51] truncate">{item.product.material}</p>
                        
                        <div className="font-mono text-xs font-semibold text-[#010000]">
                          {currencySymbol}{(item.product.price * item.quantity).toLocaleString()}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center border border-[#D8C8B4] bg-[#F6F1EA] rounded-[2px]">
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-0.5 text-xs text-[#2A211B] hover:bg-[#D8C8B4] cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-mono font-medium">{item.quantity}</span>
                            <button
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-0.5 text-xs text-[#2A211B] hover:bg-[#D8C8B4] cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-[#6C6B6B] hover:text-red-700 transition-colors cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <p className="font-serif text-2xl text-[#010000]">Your Bag is Empty</p>
                  <p className="text-xs text-[#6F5F51]">Explore our collection to reserve handcrafted artifacts.</p>
                </div>
              )}

              {/* Promo Code Input */}
              {items.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-[#D8C8B4]">
                  <span className="text-xs font-medium text-[#2A211B]">Promo or Studio Code</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try NEXORA10"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 bg-[#EFE6DA] text-xs uppercase text-[#010000] px-3 py-2 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    />
                    <button
                      onClick={handleApplyPromo}
                      className="bg-[#2A211B] text-[#F6F1EA] text-xs uppercase px-4 py-2 rounded-[4px] font-medium hover:bg-[#1D1612] cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedDiscount > 0 && (
                    <span className="text-[11px] text-emerald-800 font-medium block">
                      ✓ 10% Studio Discount Applied!
                    </span>
                  )}
                  {promoError && (
                    <span className="text-[11px] text-red-700 block">{promoError}</span>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Checkout Step Form */
            <form onSubmit={handlePlaceOrder} className="space-y-5 text-xs">
              <div className="space-y-3 bg-[#EFE6DA] p-4 rounded-[6px] border border-[#D8C8B4]">
                <span className="font-serif text-base text-[#010000] font-medium block">Payment Method</span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-[4px] border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#8C6A43] bg-[#F6F1EA] text-[#010000] font-medium ring-1 ring-[#8C6A43]'
                        : 'border-[#D8C8B4] text-[#6F5F51] hover:bg-[#F6F1EA]'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-[#8C6A43]" />
                    <div>
                      <span className="block text-xs">Cash on Delivery</span>
                      <span className="text-[10px] text-[#6F5F51]">Pay upon white-glove setup</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-[4px] border text-left flex items-center gap-2 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-[#8C6A43] bg-[#F6F1EA] text-[#010000] font-medium ring-1 ring-[#8C6A43]'
                        : 'border-[#D8C8B4] text-[#6F5F51] hover:bg-[#F6F1EA]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-[#8C6A43]" />
                    <div>
                      <span className="block text-xs">Credit Card / Reserve</span>
                      <span className="text-[10px] text-[#6F5F51]">Instant reservation lock</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="space-y-3 bg-[#EFE6DA] p-4 rounded-[6px] border border-[#D8C8B4]">
                <span className="font-serif text-base text-[#010000] font-medium block">White-Glove Delivery Details</span>
                
                <div className="space-y-2">
                  <div>
                    <label className="text-[11px] text-[#6F5F51] block mb-1">Recipient Full Name *</label>
                    <input
                      required
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      placeholder="e.g. Lady Eleanor Vance"
                      className="w-full bg-[#F6F1EA] text-xs p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#6F5F51] block mb-1">Phone Number (for verification) *</label>
                    <input
                      required
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="e.g. +1 (555) 019-2834"
                      className="w-full bg-[#F6F1EA] text-xs p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#6F5F51] block mb-1">Shipping Address *</label>
                    <textarea
                      required
                      rows={2}
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      placeholder="Street address, apartment, suite or estate name"
                      className="w-full bg-[#F6F1EA] text-xs p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-[#6F5F51] block mb-1">City</label>
                      <input
                        type="text"
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        placeholder="e.g. London"
                        className="w-full bg-[#F6F1EA] text-xs p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#6F5F51] block mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={customer.postalCode}
                        onChange={(e) => setCustomer({ ...customer, postalCode: e.target.value })}
                        placeholder="e.g. SW1A 1AA"
                        className="w-full bg-[#F6F1EA] text-xs p-2.5 rounded-[4px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="w-1/3 bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#2A211B] py-3 rounded-[4px] font-medium uppercase text-xs cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] py-3 rounded-[4px] font-medium uppercase text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Confirm Order</span>
                  <ArrowRight className="w-4 h-4 text-[#D9B98F]" />
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Drawer Footer (Subtotal & Actions) */}
        {items.length > 0 && (
          <div className="p-6 border-t border-[#D8C8B4] bg-[#EFE6DA] space-y-4">
            
            <div className="space-y-1.5 text-xs font-sans">
              <div className="flex justify-between text-[#6F5F51]">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-[#010000]">
                  {currencySymbol}{subtotal.toLocaleString()}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-800">
                  <span>Studio Discount (10%)</span>
                  <span className="font-mono font-medium">
                    -{currencySymbol}{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#6F5F51]">
                <span>White-Glove Delivery</span>
                <span className="font-mono font-medium text-[#010000]">
                  {shippingFee === 0 ? 'Complimentary' : `${currencySymbol}${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between text-sm font-serif font-bold text-[#010000] pt-2 border-t border-[#D8C8B4]">
                <span>Total Amount</span>
                <span className="font-mono text-base">
                  {currencySymbol}{total.toLocaleString()}
                </span>
              </div>
            </div>

            {step === 'cart' && (
              <button
                onClick={() => setStep('checkout')}
                className="w-full bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] uppercase text-xs tracking-widest font-medium py-3.5 rounded-[4px] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#D9B98F]" />
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-[#6C6B6B]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8C6A43]" />
              <span>30-Day In-Home Trial · 5-Year Structural Warranty</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
