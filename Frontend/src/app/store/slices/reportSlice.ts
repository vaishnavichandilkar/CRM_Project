import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { reportsService, ReportData } from '../../../services/reports.service';

interface ReportFilters {
  dateRange: string;
  region: string;
  productId: string;
}

interface ReportState {
  data: ReportData | null;
  filters: ReportFilters;
  loading: boolean;
  error: string | null;
}

const initialState: ReportState = {
  data: null,
  filters: {
    dateRange: 'last-30-days',
    region: 'all',
    productId: 'all',
  },
  loading: false,
  error: null,
};

export const fetchReportData = createAsyncThunk(
  'reports/fetchData',
  async (argFilters: Partial<ReportFilters> | undefined, { getState }) => {
    const { reports } = getState() as { reports: ReportState };
    const finalFilters = { ...reports.filters, ...argFilters };
    return await reportsService.getReportData(finalFilters);
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ReportFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReportData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchReportData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchReportData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch report data';
      });
  },
});

export const { setFilters } = reportSlice.actions;
export default reportSlice.reducer;
