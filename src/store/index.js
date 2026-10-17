import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import productsReducer from './productsSlice';
import cartReducer from './cartSlice';
import orderReducer from './orderSlice';
import analyticsReducer from './analyticsSlice';
import promotionsReducer from './promotionsSlice';
import settingsReducer from './settingsSlice';
import marketplaceReducer from './marketplaceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: orderReducer,
    analytics: analyticsReducer,
    promotions: promotionsReducer,
    settings: settingsReducer,
    marketplace: marketplaceReducer,
  },
});

export default store;
