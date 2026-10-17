import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE } from '../config/api';

// Fetch comprehensive analytics dashboard
export const fetchAnalyticsDashboard = createAsyncThunk(
  'analytics/fetchDashboard',
  async (timeRange = '7d', { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/analytics/dashboard`, {
        params: { timeRange },
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Quick restock product action from Stock Planning tab
export const restockProductFromPlanning = createAsyncThunk(
  'analytics/restockProduct',
  async ({ productId, newStock }, { getState, dispatch, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(
        `${API_BASE}/products/${productId}/stock`,
        { stock_quantity: newStock },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );
      // Refresh current analytics view
      const currentRange = getState().analytics.timeRange;
      dispatch(fetchAnalyticsDashboard(currentRange));
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  data: null,
  timeRange: '7d',
  status: 'idle',
  error: null,
};

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    setTimeRange: (state, action) => {
      state.timeRange = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnalyticsDashboard.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAnalyticsDashboard.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchAnalyticsDashboard.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { setTimeRange } = analyticsSlice.actions;
export default analyticsSlice.reducer;
