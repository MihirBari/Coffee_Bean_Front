import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Async Thunk to fetch products with filters
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/products`, { params });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async Thunk to add product (admin protected)
export const addProduct = createAsyncThunk(
  'products/addProduct',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/products`, formData, {
        headers: {
          'Content-Type': formData instanceof FormData ? 'multipart/form-data' : 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async Thunk to update product (admin protected)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE}/products/${id}`, data, {
        headers: {
          'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// Async Thunk for quick stock update (admin protected)
export const updateProductStock = createAsyncThunk(
  'products/updateProductStock',
  async ({ id, stock_quantity }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.patch(`${API_BASE}/products/${id}/stock`, { stock_quantity }, {
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

// Async Thunk to remove product image (admin protected)
export const removeProductImage = createAsyncThunk(
  'products/removeProductImage',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.delete(`${API_BASE}/products/${id}/image`, {
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

// Async Thunk to delete product (admin protected)
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE}/products/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        }
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  selectedProduct: null,
  filters: {
    roast: 'All',
    search: '',
    sort: 'featured',
    inStockOnly: false,
  },
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setSelectedProduct: (state, action) => {
      state.selectedProduct = action.payload;
    },
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        roast: 'All',
        search: '',
        sort: 'featured',
        inStockOnly: false,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
        state.items = [];
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProductStock.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].stock_quantity = action.payload.stock_quantity;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct.stock_quantity = action.payload.stock_quantity;
        }
      })
      .addCase(removeProductImage.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index].image_url = action.payload.image_url;
        }
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct.image_url = action.payload.image_url;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.selectedProduct?.id === action.payload) {
          state.selectedProduct = null;
        }
      });
  },
});

export const { setSelectedProduct, setFilter, resetFilters } = productsSlice.actions;
export default productsSlice.reducer;
