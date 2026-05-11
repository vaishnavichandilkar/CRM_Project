import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadsService, Lead, CreateLeadDto } from '../../../services/leads.service';

interface LeadState {
  leadsList: Lead[];
  availableSalesReps: { id: number; name: string }[];
  loading: boolean;
  error: string | null;
}

const initialState: LeadState = {
  leadsList: [],
  availableSalesReps: [],
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk('leads/fetchAll', async () => {
  return await leadsService.getAllLeads();
});

export const fetchSalesReps = createAsyncThunk('leads/fetchSalesReps', async () => {
  return await leadsService.getSalesReps();
});

export const createNewLead = createAsyncThunk('leads/create', async (data: CreateLeadDto, { dispatch }) => {
  const result = await leadsService.createLead(data);
  dispatch(fetchLeads()); // Re-fetch to update table and stats
  return result;
});

export const updateExistingLead = createAsyncThunk(
  'leads/update',
  async ({ id, data }: { id: number; data: any }, { dispatch }) => {
    const result = await leadsService.updateLead(id, data);
    dispatch(fetchLeads());
    return result;
  }
);

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leadsList = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(fetchSalesReps.fulfilled, (state, action) => {
        state.availableSalesReps = action.payload;
      });
  },
});

export default leadSlice.reducer;
