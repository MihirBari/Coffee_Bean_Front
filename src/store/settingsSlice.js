import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE } from '../config/api';

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/settings`);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateStoreSettings = createAsyncThunk(
  'settings/updateStoreSettings',
  async (settingsData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const response = await axios.put(`${API_BASE}/settings`, settingsData, config);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
    }
  }
);

const initialState = {
  settings: {
    delivery_charge: 55,
    free_delivery_item_threshold: 2, // More than 2 items (i.e. 3+) is free
    free_delivery_min_order: 500, // Orders >= 500 are free delivery
    return_window_days: 7,
    return_policy_title: '7-Day Roastery Freshness & Replacement Guarantee',
    return_policy_summary: 'Hassle-free 7-day returns for damaged tins, broken seals, or defective items with 100% refund or free replacement.',
    return_policy_content: 'We craft every canister of The Bean Co. Coffee Gummies using specialty Arabica extract and plant-based pectin. If your order arrives damaged, unsealed, broken, with a missing seal, or with quality defects, you are eligible for an immediate free replacement dispatch or 100% refund within 7 calendar days of delivery.',
    roastery_helpline: '+91 98765 43210',
    support_email: 'info@thebean.company'
  },
  isReturnModalOpen: false,
  status: 'idle',
  error: null,
  updateSuccess: false
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    openReturnPolicyModal: (state) => {
      state.isReturnModalOpen = true;
    },
    closeReturnPolicyModal: (state) => {
      state.isReturnModalOpen = false;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
        state.status = 'succeeded';
      })
      .addCase(updateStoreSettings.fulfilled, (state, action) => {
        state.settings = { ...state.settings, ...action.payload };
        state.updateSuccess = true;
      });
  }
});

export const { openReturnPolicyModal, closeReturnPolicyModal, clearUpdateSuccess } = settingsSlice.actions;

export default settingsSlice.reducer;
