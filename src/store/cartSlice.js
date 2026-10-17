import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE } from '../config/api';

// Async thunk to validate dynamic coupon code from database
export const validatePromoCode = createAsyncThunk(
  'cart/validatePromoCode',
  async ({ code, subtotal = 0 }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/coupons/validate`, {
        code,
        subtotal,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Invalid promo code');
    }
  }
);

const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('coffee_bean_cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    return [];
  }
};

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem('coffee_bean_cart', JSON.stringify(items));
  } catch (e) {
    // ignore
  }
};

const initialState = {
  items: loadCartFromStorage(),
  isOpen: false,
  isCheckoutOpen: false,
  promoCode: '',
  discountPercent: 0,
  notification: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, grindType = 'Whole Bean' } = action.payload;
      const cartKey = `${product.id}-${grindType}`;
      const existingIndex = state.items.findIndex((item) => item.cartKey === cartKey);

      if (existingIndex !== -1) {
        const newQty = state.items[existingIndex].quantity + quantity;
        state.items[existingIndex].quantity = Math.min(newQty, product.stock_quantity || 999);
      } else {
        state.items.push({
          cartKey,
          productId: product.id,
          name: product.name,
          tagline: product.tagline,
          price: parseFloat(product.price),
          image_url: product.image_url,
          origin: product.origin,
          roast_level: product.roast_level,
          grindType,
          quantity: Math.min(quantity, product.stock_quantity || 999),
          stock_quantity: product.stock_quantity,
        });
      }
      saveCartToStorage(state.items);
      state.notification = `Added "${product.name}" (${grindType}) to cart!`;
      state.isOpen = true; // Automatically open cart drawer for nice UX
    },
    removeFromCart: (state, action) => {
      const cartKey = action.payload;
      state.items = state.items.filter((item) => item.cartKey !== cartKey);
      saveCartToStorage(state.items);
    },
    updateQuantity: (state, action) => {
      const { cartKey, quantity } = action.payload;
      const item = state.items.find((i) => i.cartKey === cartKey);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.cartKey !== cartKey);
        } else {
          item.quantity = Math.min(quantity, item.stock_quantity || 999);
        }
      }
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      state.promoCode = '';
      state.discountPercent = 0;
      saveCartToStorage([]);
    },
    toggleCart: (state, action) => {
      state.isOpen = action.payload !== undefined ? action.payload : !state.isOpen;
    },
    openCheckout: (state) => {
      state.isCheckoutOpen = true;
      state.isOpen = false;
    },
    closeCheckout: (state) => {
      state.isCheckoutOpen = false;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    applyPromoCodeDirect: (state, action) => {
      const { code, discountPercent = 10, description = '' } = action.payload || {};
      const cleanCode = (code || '').trim().toUpperCase();
      state.promoCode = cleanCode;
      state.discountPercent = discountPercent;
      state.notification = `Promo code "${cleanCode}" applied: ${discountPercent}% OFF! ${description ? `(${description})` : ''}`;
    },
    removePromoCode: (state) => {
      state.promoCode = '';
      state.discountPercent = 0;
      state.notification = 'Promo code removed';
    },
    applyPromoCode: (state, action) => {
      const code = (action.payload || '').trim().toUpperCase();
      state.promoCode = code;
      if (code === 'COFFEE10' || code === 'BEAN10' || code === 'WELCOME10') {
        state.discountPercent = 10;
        state.notification = 'Promo code applied: 10% OFF!';
      } else if (code === 'ROAST15' || code === 'BARISTA' || code === 'ROASTLOVE' || code === 'SPECIAL15') {
        state.discountPercent = 15;
        state.notification = 'Promo code applied: 15% OFF!';
      } else if (code === 'FRIENDS20' || code === 'FRIENDS') {
        state.discountPercent = 20;
        state.notification = 'Friends & Family Code applied: 20% OFF!';
      } else {
        state.discountPercent = 0;
        state.notification = 'Invalid promo code';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.promoCode = action.payload.code;
        state.discountPercent = action.payload.discount_percent;
        state.notification = action.payload.message || `Promo code applied: ${action.payload.discount_percent}% OFF!`;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.promoCode = '';
        state.discountPercent = 0;
        state.notification = action.payload || 'Invalid promo code';
      });
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  toggleCart,
  openCheckout,
  closeCheckout,
  clearNotification,
  applyPromoCode,
  applyPromoCodeDirect,
  removePromoCode,
} = cartSlice.actions;

export default cartSlice.reducer;
