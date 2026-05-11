import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { visitsService, Visit, VisitMetadata, VisitStats, CreateVisitDto, VisitStatus } from '../../../services/visits.service';

interface VisitState {
  visitsList: Visit[];
  stats: VisitStats;
  metadata: VisitMetadata;
  loading: boolean;
  error: string | null;
}

const initialState: VisitState = {
  visitsList: [],
  stats: {
    totalScheduled: 0,
    completedToday: 0,
    followUps: 0,
    totalAllowance: 0,
  },
  metadata: {
    customers: [],
    salesReps: [],
  },
  loading: false,
  error: null,
};

export const fetchVisits = createAsyncThunk('visits/fetchAll', async () => {
  return await visitsService.getVisits();
});

export const fetchVisitMetadata = createAsyncThunk('visits/fetchMetadata', async () => {
  return await visitsService.getVisitMetadata();
});

export const fetchVisitStats = createAsyncThunk('visits/fetchStats', async () => {
  return await visitsService.getVisitStats();
});

export const createNewVisit = createAsyncThunk(
  'visits/create',
  async (data: CreateVisitDto, { dispatch }) => {
    const result = await visitsService.createVisit(data);
    dispatch(fetchVisits());
    dispatch(fetchVisitStats());
    return result;
  }
);

export const updateVisitStatus = createAsyncThunk(
  'visits/updateStatus',
  async ({ id, status }: { id: number; status: VisitStatus }, { dispatch }) => {
    const result = await visitsService.updateStatus(id, status);
    dispatch(fetchVisits());
    dispatch(fetchVisitStats());
    return result;
  }
);

const visitSlice = createSlice({
  name: 'visits',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVisits.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVisits.fulfilled, (state, action) => {
        state.loading = false;
        state.visitsList = action.payload;
      })
      .addCase(fetchVisitMetadata.fulfilled, (state, action) => {
        state.metadata = action.payload;
      })
      .addCase(fetchVisitStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export default visitSlice.reducer;
