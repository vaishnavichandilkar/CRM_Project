import { configureStore } from '@reduxjs/toolkit';
import leadReducer from './slices/leadSlice';
import salesReducer from './slices/salesSlice';
import visitReducer from './slices/visitSlice';
import reportReducer from './slices/reportSlice';
import customModuleReducer from './slices/customModuleSlice';

export const store = configureStore({
  reducer: {
    leads: leadReducer,
    sales: salesReducer,
    visits: visitReducer,
    reports: reportReducer,
    customModules: customModuleReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
