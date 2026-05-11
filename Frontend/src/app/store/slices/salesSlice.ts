import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { salesService, Sale, SalesMetadata, PipelineStats, CreateSaleDto } from '../../../services/sales.service';

interface SalesState {
  freshSales: Sale[];
  resaleHistory: Sale[];
  pipelineStats: PipelineStats;
  metadata: SalesMetadata;
  loading: boolean;
  error: string | null;
}

const initialState: SalesState = {
  freshSales: [],
  resaleHistory: [],
  pipelineStats: {
    Lead: 0,
    Opportunity: 0,
    Sale: 0,
    Invoice: 0,
  },
  metadata: {
    customers: [],
    products: [],
  },
  loading: false,
  error: null,
};

export const fetchSalesData = createAsyncThunk(
  'sales/fetchData',
  async (purchaseCount: '1' | 'gt1') => {
    return await salesService.getSalesData(purchaseCount);
  }
);

export const fetchSalesMetadata = createAsyncThunk('sales/fetchMetadata', async () => {
  return await salesService.getSalesMetadata();
});

export const fetchPipelineStats = createAsyncThunk('sales/fetchPipelineStats', async () => {
  return await salesService.getPipelineStats();
});

export const createNewSale = createAsyncThunk(
  'sales/create',
  async (data: CreateSaleDto, { dispatch }) => {
    const result = await salesService.createSale(data);
    dispatch(fetchSalesData('1'));
    dispatch(fetchSalesData('gt1'));
    dispatch(fetchPipelineStats());
    return result;
  }
);

export const updateSaleStatus = createAsyncThunk(
  'sales/updateStatus',
  async ({ id, status }: { id: number; status: any }, { dispatch }) => {
    const result = await salesService.updateSaleStatus(id, status);
    dispatch(fetchSalesData('1'));
    dispatch(fetchSalesData('gt1'));
    dispatch(fetchPipelineStats());
    return result;
  }
);

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSalesData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSalesData.fulfilled, (state, action) => {
        state.loading = false;
        if (action.meta.arg === '1') {
          state.freshSales = action.payload;
        } else {
          state.resaleHistory = action.payload;
        }
      })
      .addCase(fetchSalesMetadata.fulfilled, (state, action) => {
        state.metadata = action.payload;
      })
      .addCase(fetchPipelineStats.fulfilled, (state, action) => {
        state.pipelineStats = action.payload;
      });
  },
});

export default salesSlice.reducer;
