import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleWishlistDrawer, toggleWishlist } from '../store/authSlice';
import { addToCart } from '../store/cartSlice';
import { trackPageView } from '../services/analytics';
import BeanoMascot from './BeanoMascot';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';

export default function WishlistDrawer() {
  const dispatch = useDispatch();
  const { wishlist, wishlistDrawerOpen, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (wishlistDrawerOpen) {
      trackPageView('/wishlist', 'Saved Coffee Gummies Wishlist');
    }
  }, [wishlistDrawerOpen]);

  if (!wishlistDrawerOpen) return null;

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1, grindType: 'Single Canister (5 Gummies)' }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in selection:bg-[#4D0E12] selection:text-[#F5EFC6]">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(toggleWishlistDrawer(false))}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#231815] border-l-2 border-[#4A2E27] text-[#F5EFC6] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#4A2E27] flex items-center justify-between bg-[#2F201C]/80">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6]">
                <Heart className="w-5 h-5 text-red-400 fill-red-400" />
              </div>
              <div>
                <h2 className="font-headline font-black text-lg text-[#F5EFC6] uppercase">Saved Gummies</h2>
                <span className="font-subhead text-xs text-[#A5BCD6]">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in wishlist
                </span>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleWishlistDrawer(false))}
              className="p-2 rounded-full hover:bg-[#4A2E27] text-[#F5EFC6]/80 hover:text-[#F5EFC6] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll">
            {wishlist.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-24 mx-auto mb-4 flex items-center justify-center p-2 bg-[#18100E] rounded-3xl border border-[#4A2E27] shadow-xl">
                  <BeanoMascot className="w-full h-full" strokeColor="#A5BCD6" />
                </div>
                <h3 className="font-headline font-bold text-lg text-[#F5EFC6] mb-1 uppercase">Your Wishlist is Empty</h3>
                <p className="font-body text-xs text-[#A5BCD6] italic max-w-xs mx-auto mb-4">
                  "Béano says: Tap the heart icon on any coffee gummy flavor to save it here for later!"
                </p>
              </div>
            ) : (
              wishlist.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-[#2F201C] border border-[#4A2E27] flex items-center space-x-4"
                >
                  <img
                    src={item.image_url || '/assets/brand/packaging-canisters.jpg'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#18100E] border border-[#4A2E27] flex-shrink-0"
                    onError={(e) => {
                      e.target.src = '/assets/brand/packaging-canisters.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-headline font-bold text-xs text-[#F5EFC6] truncate uppercase">{item.name}</h4>
                    <span className="font-subhead text-[11px] text-[#A5BCD6] block mb-2">₹{parseFloat(item.price).toFixed(2)}</span>
                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="px-3 py-1.5 rounded-lg bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] text-[10px] font-headline font-bold uppercase tracking-wider flex items-center space-x-1 border border-[#F5EFC6]/20 transition-all active:scale-95"
                    >
                      <ShoppingBag className="w-3 h-3 text-[#A5BCD6]" />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                  <button
                    onClick={() => dispatch(toggleWishlist(item))}
                    className="p-1.5 text-red-400 hover:text-red-300 transition-colors"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-[#4A2E27] bg-[#2F201C]/60 text-center font-subhead text-[11px] text-[#A5BCD6]">
            The Bean Co. • Chew The Brew™
          </div>

        </div>
      </div>
    </div>
  );
}
