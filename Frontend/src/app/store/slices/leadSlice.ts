import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { leadsService, Lead, CreateLeadDto, LeadStats } from '../../services/leadService';
import { toast } from 'sonner';

interface LeadState {
  leadsList: Lead[];
  stats: LeadStats;
  eligibleStaff: { id: number; firstName: string; lastName: string }[];
  loading: boolean;
  error: string | null;
}

const initialState: LeadState = {
  leadsList: [],
  stats: {
    Open: 0,
    'In Progress': 0,
    Won: 0,
    Lost: 0,
  },
  eligibleStaff: [],
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk('leads/fetchAll', async () => {
  return await leadsService.getAllLeads();
});

export const fetchLeadStats = createAsyncThunk('leads/fetchStats', async () => {
  return await leadsService.getStats();
});

export const fetchEligibleStaff = createAsyncThunk('leads/fetchStaff', async () => {
  return await leadsService.getEligibleStaff();
});

export const createNewLead = createAsyncThunk(
  'leads/create', 
  async (data: CreateLeadDto, { dispatch }) => {
    const result = await leadsService.createLead(data);
    toast.success('Lead created successfully');
    dispatch(fetchLeads());
    dispatch(fetchLeadStats());
    return result;
  }
);

export const scheduleNewCall = createAsyncThunk(
  'leads/scheduleCall',
  async (data: any, { dispatch }) => {
    const result = await leadsService.scheduleCall(data);
    toast.success('Call scheduled successfully');
    dispatch(fetchLeads()); 
    return result;
  }
);

export const updateLeadStatus = createAsyncThunk(
  'leads/updateStatus',
  async ({ id, status }: { id: number; status: any }, { dispatch }) => {
    const result = await leadsService.updateLeadStatus(id, status);
    toast.success('Status updated');
    dispatch(fetchLeads());
    dispatch(fetchLeadStats());
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
      .addCase(fetchLeadStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(fetchEligibleStaff.fulfilled, (state, action) => {
        state.eligibleStaff = action.payload;
      });
  },
});

export default leadSlice.reducer;
