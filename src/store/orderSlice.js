import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_BASE } from '../config/api';

// Place new order (Customer authenticated)
export const placeOrder = createAsyncThunk(
  'orders/placeOrder',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/orders`, orderData, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch all orders (Admin only)
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/orders`, {
        params,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Update order status (Admin only)
export const updateOrderStatus = createAsyncThunk(
  'orders/updateOrderStatus',
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(`${API_BASE}/orders/${id}/status`, { status }, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Fetch dashboard statistics (Admin only)
export const fetchDashboardStats = createAsyncThunk(
  'orders/fetchDashboardStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/stats/dashboard`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  dashboardStats: null,
  status: 'idle',
  error: null,
  orderSuccess: false,
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
      state.orderSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
        state.orderSuccess = true;
        state.orders.unshift(action.payload);
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      // Dashboard Stats
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
