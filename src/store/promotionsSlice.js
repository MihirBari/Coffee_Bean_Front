import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// 1. Fetch active announcement for top banner (Public)
export const fetchActiveAnnouncement = createAsyncThunk(
  'promotions/fetchActiveAnnouncement',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/announcements/active`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 2. Fetch all coupons (Admin only)
export const fetchCoupons = createAsyncThunk(
  'promotions/fetchCoupons',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/coupons`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 3. Create new coupon (Admin only)
export const createCoupon = createAsyncThunk(
  'promotions/createCoupon',
  async (couponData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/coupons`, couponData, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4. Update coupon (Admin only)
export const updateCoupon = createAsyncThunk(
  'promotions/updateCoupon',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE}/coupons/${id}`, data, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 5. Delete coupon (Admin only)
export const deleteCoupon = createAsyncThunk(
  'promotions/deleteCoupon',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE}/coupons/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 6. Fetch all announcements (Admin only)
export const fetchAnnouncements = createAsyncThunk(
  'promotions/fetchAnnouncements',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/announcements`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 7. Save or create announcement (Admin only)
export const saveAnnouncement = createAsyncThunk(
  'promotions/saveAnnouncement',
  async (announcementData, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      let response;
      if (announcementData.id) {
        response = await axios.put(`${API_BASE}/announcements/${announcementData.id}`, announcementData, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
      } else {
        response = await axios.post(`${API_BASE}/announcements`, announcementData, {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
      }
      // Also refresh active announcement for top banner
      dispatch(fetchActiveAnnouncement());
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 8. Toggle announcement status (Admin only)
export const toggleAnnouncement = createAsyncThunk(
  'promotions/toggleAnnouncement',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(`${API_BASE}/announcements/${id}/toggle`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      dispatch(fetchActiveAnnouncement());
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 9. Delete announcement (Admin only)
export const deleteAnnouncement = createAsyncThunk(
  'promotions/deleteAnnouncement',
  async (id, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE}/announcements/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      dispatch(fetchActiveAnnouncement());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 10. Fetch Lightning Deal / Flash Sale (Public)
export const fetchLightningDeal = createAsyncThunk(
  'promotions/fetchLightningDeal',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/announcements/lightning-deal`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 11. Update Lightning Deal / Flash Sale (Admin only)
export const updateLightningDeal = createAsyncThunk(
  'promotions/updateLightningDeal',
  async (dealData, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE}/announcements/lightning-deal`, dealData, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      dispatch(fetchCoupons());
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 12. Toggle Lightning Deal (Admin only)
export const toggleLightningDeal = createAsyncThunk(
  'promotions/toggleLightningDeal',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(`${API_BASE}/announcements/lightning-deal/toggle`, {}, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 13. Quick Launch Flash Sale (Admin only)
export const launchFlashSale = createAsyncThunk(
  'promotions/launchFlashSale',
  async (saleData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/announcements/lightning-deal/launch`, saleData, {
        headers: { Authorization: token ? `Bearer ${token}` : '' }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  activeAnnouncement: null,
  lightningDeal: null,
  coupons: [],
  announcements: [],
  status: 'idle',
  error: null,
};

const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    dismissActiveAnnouncement: (state) => {
      state.activeAnnouncement = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Active announcement
      .addCase(fetchActiveAnnouncement.fulfilled, (state, action) => {
        state.activeAnnouncement = action.payload || null;
      })
      .addCase(fetchActiveAnnouncement.rejected, (state, action) => {
        state.activeAnnouncement = null;
        state.error = action.payload;
      })
      // Lightning Deals
      .addCase(fetchLightningDeal.fulfilled, (state, action) => {
        state.lightningDeal = action.payload || null;
      })
      .addCase(fetchLightningDeal.rejected, (state, action) => {
        state.lightningDeal = null;
      })
      .addCase(updateLightningDeal.fulfilled, (state, action) => {
        state.lightningDeal = action.payload;
      })
      .addCase(toggleLightningDeal.fulfilled, (state, action) => {
        state.lightningDeal = action.payload;
      })
      .addCase(launchFlashSale.fulfilled, (state, action) => {
        state.lightningDeal = action.payload;
      })
      // Coupons
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.coupons = action.payload;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const idx = state.coupons.findIndex(c => c.id === action.payload.id);
        if (idx !== -1) {
          state.coupons[idx] = action.payload;
        }
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(c => c.id !== action.payload);
      })
      // Announcements
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.announcements = action.payload;
      })
      .addCase(saveAnnouncement.fulfilled, (state, action) => {
        const idx = state.announcements.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) {
          state.announcements[idx] = action.payload;
        } else {
          state.announcements.unshift(action.payload);
        }
      })
      .addCase(toggleAnnouncement.fulfilled, (state, action) => {
        const idx = state.announcements.findIndex(a => a.id === action.payload.id);
        if (idx !== -1) {
          state.announcements[idx] = action.payload;
        }
      })
      .addCase(deleteAnnouncement.fulfilled, (state, action) => {
        state.announcements = state.announcements.filter(a => a.id !== action.payload);
      });
  },
});

export const { dismissActiveAnnouncement } = promotionsSlice.actions;
export default promotionsSlice.reducer;
