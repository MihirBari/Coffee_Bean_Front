import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/marketplace';

const getAuthConfig = (getState) => {
  const token = getState().auth.token;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const fetchMyOrders = createAsyncThunk(
  'marketplace/fetchMyOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/my-orders`, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch customer orders');
    }
  }
);

export const fetchTracking = createAsyncThunk(
  'marketplace/fetchTracking',
  async (orderNumber, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/tracking/${orderNumber}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch tracking details');
    }
  }
);

export const submitReturnRequest = createAsyncThunk(
  'marketplace/submitReturnRequest',
  async (payload, { getState, rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/return-request`, payload, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit return request');
    }
  }
);

export const fetchReturnRequests = createAsyncThunk(
  'marketplace/fetchReturnRequests',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/return-requests`, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch return requests');
    }
  }
);

export const updateReturnStatus = createAsyncThunk(
  'marketplace/updateReturnStatus',
  async ({ id, status, resolution_notes }, { getState, rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE}/return-requests/${id}`, { status, resolution_notes }, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update return');
    }
  }
);

export const updateOrderFulfillment = createAsyncThunk(
  'marketplace/updateOrderFulfillment',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_BASE}/orders/${id}/tracking`, data, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update order fulfillment');
    }
  }
);

export const fetchAddresses = createAsyncThunk(
  'marketplace/fetchAddresses',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/addresses`, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'marketplace/addAddress',
  async (addressData, { getState, rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_BASE}/addresses`, addressData, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to save address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'marketplace/deleteAddress',
  async (id, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE}/addresses/${id}`, getAuthConfig(getState));
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete address');
    }
  }
);

export const fetchWallet = createAsyncThunk(
  'marketplace/fetchWallet',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/wallet`, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch wallet');
    }
  }
);

export const fetchCRMCustomers = createAsyncThunk(
  'marketplace/fetchCRMCustomers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_BASE}/crm-customers`, getAuthConfig(getState));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch CRM customers');
    }
  }
);

const initialState = {
  myOrders: [],
  myOrdersStatus: 'idle',
  activeTrackingData: null,
  returnRequests: [],
  addresses: [],
  wallet: { balance: 150, rupee_value: 150 },
  crmCustomers: [],
  isCustomerPortalOpen: false,
  portalTab: 'orders', // 'orders' | 'tracking' | 'addresses' | 'wallet'
  selectedTrackingOrderNumber: null,
  invoiceOrder: null, // order object to print
  beanCoinsApplied: false,
  coinDiscount: 50, // ₹50 off using 50 coins
};

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState,
  reducers: {
    openCustomerPortal: (state, action) => {
      state.isCustomerPortalOpen = true;
      if (action.payload?.tab) {
        state.portalTab = action.payload.tab;
      }
      if (action.payload?.orderNumber) {
        state.selectedTrackingOrderNumber = action.payload.orderNumber;
      }
    },
    closeCustomerPortal: (state) => {
      state.isCustomerPortalOpen = false;
      state.activeTrackingData = null;
    },
    setPortalTab: (state, action) => {
      state.portalTab = action.payload;
    },
    openInvoiceModal: (state, action) => {
      state.invoiceOrder = action.payload;
    },
    closeInvoiceModal: (state) => {
      state.invoiceOrder = null;
    },
    toggleBeanCoinsDiscount: (state) => {
      state.beanCoinsApplied = !state.beanCoinsApplied;
    },
    clearActiveTracking: (state) => {
      state.activeTrackingData = null;
      state.selectedTrackingOrderNumber = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.myOrders = action.payload;
        state.myOrdersStatus = 'succeeded';
      })
      .addCase(fetchTracking.fulfilled, (state, action) => {
        state.activeTrackingData = action.payload;
      })
      .addCase(submitReturnRequest.fulfilled, (state, action) => {
        const orderIdx = state.myOrders.findIndex((o) => o.id === action.payload.order_id);
        if (orderIdx !== -1) {
          state.myOrders[orderIdx].return_request = action.payload;
        }
      })
      .addCase(fetchReturnRequests.fulfilled, (state, action) => {
        state.returnRequests = action.payload;
      })
      .addCase(updateReturnStatus.fulfilled, (state, action) => {
        const idx = state.returnRequests.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) {
          state.returnRequests[idx] = action.payload;
        }
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses = action.payload;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        if (!action.payload) return;
        const payloadLine = (action.payload.address_line || '').toLowerCase().trim();
        const existingIdx = state.addresses.findIndex(
          (a) => a.id === action.payload.id || (payloadLine && (a.address_line || '').toLowerCase().trim() === payloadLine)
        );
        if (existingIdx !== -1) {
          state.addresses[existingIdx] = action.payload;
        } else {
          state.addresses.unshift(action.payload);
        }
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.wallet = action.payload;
      })
      .addCase(fetchCRMCustomers.fulfilled, (state, action) => {
        state.crmCustomers = action.payload;
      });
  }
});

export const {
  openCustomerPortal,
  closeCustomerPortal,
  setPortalTab,
  openInvoiceModal,
  closeInvoiceModal,
  toggleBeanCoinsDiscount,
  clearActiveTracking
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;
