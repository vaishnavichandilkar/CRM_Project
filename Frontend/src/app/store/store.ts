import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './slices/leadSlice';
import salesReducer from './slices/salesSlice';
import visitReducer from './slices/visitSlice';
import reportReducer from './slices/reportSlice';

export const store = configureStore({
  reducer: {
    leads: leadReducer,
    sales: salesReducer,
    visits: visitReducer,
    reports: reportReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
