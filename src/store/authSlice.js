import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE } from '../config/api';

// Helper to load token and user from localStorage
const storedToken = localStorage.getItem('coffee_bean_token');
let storedUser = null;
try {
  const u = localStorage.getItem('coffee_bean_user');
  if (u) storedUser = JSON.parse(u);
} catch (e) {
  storedUser = null;
}

// Thunk: Customer Login
export const loginCustomer = createAsyncThunk(
  'auth/loginCustomer',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Customer Register
export const registerCustomer = createAsyncThunk(
  'auth/registerCustomer',
  async ({ name, email, password, verification_token, hp_website, client_loaded_at }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, { 
        name, 
        email, 
        password, 
        verification_token,
        hp_website,
        client_loaded_at
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Send Email Verification OTP
export const sendVerificationOtp = createAsyncThunk(
  'auth/sendVerificationOtp',
  async ({ email, purpose, hp_website }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/send-otp`, { 
        email, 
        purpose: purpose || 'order_checkout',
        hp_website
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Verify Email OTP Code
export const verifyEmailOtp = createAsyncThunk(
  'auth/verifyEmailOtp',
  async ({ email, otp, purpose }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/verify-otp`, { 
        email, 
        otp, 
        purpose: purpose || 'order_checkout' 
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Helper to remember verified emails across sessions
function rememberVerifiedEmail(email) {
  if (!email) return;
  try {
    const list = JSON.parse(localStorage.getItem('coffee_bean_verified_emails') || '[]');
    const normalized = email.trim().toLowerCase();
    if (!list.includes(normalized)) {
      list.push(normalized);
      localStorage.setItem('coffee_bean_verified_emails', JSON.stringify(list));
    }
  } catch (e) {}
}

// Thunk: Check if email is already verified in DB
export const checkEmailVerification = createAsyncThunk(
  'auth/checkEmailVerification',
  async (email, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/check-verification`, { params: { email } });
      return { email, ...response.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Admin Login
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/admin-login`, { email, password });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Fetch Wishlist
export const fetchWishlist = createAsyncThunk(
  'auth/fetchWishlist',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return [];
      const response = await axios.get(`${API_BASE}/auth/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Thunk: Toggle Wishlist
export const toggleWishlist = createAsyncThunk(
  'auth/toggleWishlist',
  async (product, { getState, dispatch, rejectWithValue }) => {
    try {
      const { token, wishlist } = getState().auth;
      if (!token) return rejectWithValue('Not authenticated');

      const isAlreadyInWishlist = wishlist.some((item) => item.id === product.id);

      if (isAlreadyInWishlist) {
        await axios.delete(`${API_BASE}/auth/wishlist/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { action: 'removed', productId: product.id };
      } else {
        await axios.post(`${API_BASE}/auth/wishlist`, { product_id: product.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return { action: 'added', product };
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  user: storedUser,
  token: storedToken,
  isAuthenticated: !!storedToken && !!storedUser,
  isAdmin: !!storedUser && storedUser.role === 'admin',
  status: 'idle',
  error: null,
  authModalOpen: false,
  authModalMode: 'login', // 'login' | 'register'
  authPromptReason: '', // e.g. 'Please sign in to add this item to your cart'
  pendingAction: null, // callback data after login
  wishlist: [],
  wishlistDrawerOpen: false,
  verificationToken: null,
  verifiedEmail: null,
  isEmailVerified: storedUser?.is_email_verified === 1,
  otpSent: false,
  otpLoading: false,
  otpError: null,
  devOtp: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (state, action) => {
      state.authModalOpen = true;
      state.authModalMode = action.payload?.mode || 'login';
      state.authPromptReason = action.payload?.reason || '';
      state.pendingAction = action.payload?.pendingAction || null;
      state.error = null;
    },
    closeAuthModal: (state) => {
      state.authModalOpen = false;
      state.authPromptReason = '';
      state.error = null;
      state.pendingAction = null;
    },
    setAuthModalMode: (state, action) => {
      state.authModalMode = action.payload;
      state.error = null;
    },
    setVerificationProof: (state, action) => {
      state.verificationToken = action.payload.token;
      state.verifiedEmail = action.payload.email;
      state.isEmailVerified = true;
    },
    resetVerification: (state) => {
      state.verificationToken = null;
      state.verifiedEmail = null;
      state.otpSent = false;
      state.otpLoading = false;
      state.otpError = null;
      state.devOtp = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.wishlist = [];
      state.verificationToken = null;
      state.verifiedEmail = null;
      state.isEmailVerified = false;
      localStorage.removeItem('coffee_bean_token');
      localStorage.removeItem('coffee_bean_user');
    },
    toggleWishlistDrawer: (state, action) => {
      state.wishlistDrawerOpen = action.payload !== undefined ? action.payload : !state.wishlistDrawerOpen;
    },
    clearAuthError: (state) => {
      state.error = null;
      state.otpError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Customer Login
      .addCase(loginCustomer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAdmin = action.payload.user.role === 'admin';
        state.isEmailVerified = action.payload.user.is_email_verified === 1;
        state.authModalOpen = false;
        if (action.payload.user?.is_email_verified === 1) {
          rememberVerifiedEmail(action.payload.user.email);
        }
        localStorage.setItem('coffee_bean_token', action.payload.token);
        localStorage.setItem('coffee_bean_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Customer Register
      .addCase(registerCustomer.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerCustomer.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAdmin = false;
        state.isEmailVerified = action.payload.user.is_email_verified === 1;
        state.authModalOpen = false;
        if (action.payload.user?.is_email_verified === 1) {
          rememberVerifiedEmail(action.payload.user.email);
        }
        localStorage.setItem('coffee_bean_token', action.payload.token);
        localStorage.setItem('coffee_bean_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerCustomer.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Send Verification OTP
      .addCase(sendVerificationOtp.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(sendVerificationOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.devOtp = action.payload.dev_otp || null;
      })
      .addCase(sendVerificationOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })

      // Verify Email OTP
      .addCase(verifyEmailOtp.pending, (state) => {
        state.otpLoading = true;
        state.otpError = null;
      })
      .addCase(verifyEmailOtp.fulfilled, (state, action) => {
        state.otpLoading = false;
        state.verificationToken = action.payload.verification_token;
        state.verifiedEmail = action.payload.email;
        state.isEmailVerified = true;
        state.otpError = null;
        rememberVerifiedEmail(action.payload.email);
        if (state.user && state.user.email.toLowerCase() === action.payload.email.toLowerCase()) {
          state.user.is_email_verified = 1;
          localStorage.setItem('coffee_bean_user', JSON.stringify(state.user));
        }
      })
      .addCase(verifyEmailOtp.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpError = action.payload;
      })

      // Check Email Verification status from server
      .addCase(checkEmailVerification.fulfilled, (state, action) => {
        if (action.payload.is_verified) {
          state.isEmailVerified = true;
          state.verifiedEmail = action.payload.email;
          rememberVerifiedEmail(action.payload.email);
          if (state.user && state.user.email?.toLowerCase() === action.payload.email.toLowerCase()) {
            state.user.is_email_verified = 1;
            localStorage.setItem('coffee_bean_user', JSON.stringify(state.user));
          }
        } else {
          state.isEmailVerified = false;
          if (state.user && state.user.email?.toLowerCase() === action.payload.email.toLowerCase()) {
            state.user.is_email_verified = 0;
            localStorage.setItem('coffee_bean_user', JSON.stringify(state.user));
          }
        }
      })

      // Admin Login
      .addCase(loginAdmin.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isAdmin = true;
        localStorage.setItem('coffee_bean_token', action.payload.token);
        localStorage.setItem('coffee_bean_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch Wishlist
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.wishlist = action.payload;
      })

      // Toggle Wishlist
      .addCase(toggleWishlist.fulfilled, (state, action) => {
        if (action.payload.action === 'removed') {
          state.wishlist = state.wishlist.filter((item) => item.id !== action.payload.productId);
        } else if (action.payload.action === 'added') {
          state.wishlist.unshift(action.payload.product);
        }
      });
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  setAuthModalMode,
  setVerificationProof,
  resetVerification,
  logout,
  toggleWishlistDrawer,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;
