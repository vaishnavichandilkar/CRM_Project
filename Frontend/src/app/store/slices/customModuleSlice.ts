import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomField {
  name: string;
  dataType: string;
  validationRules?: any;
}

interface CustomModuleState {
  builder: {
    name: string;
    description: string;
    icon: string;
    fields: CustomField[];
  };
  modules: any[];
  loading: boolean;
  error: string | null;
}

const initialState: CustomModuleState = {
  builder: {
    name: '',
    description: '',
    icon: 'LayoutDashboard',
    fields: [],
  },
  modules: [],
  loading: false,
  error: null,
};

const customModuleSlice = createSlice({
  name: 'customModules',
  initialState,
  reducers: {
    updateBuilder: (state, action: PayloadAction<Partial<CustomModuleState['builder']>>) => {
      state.builder = { ...state.builder, ...action.payload };
    },
    addField: (state) => {
      state.builder.fields.push({ name: '', dataType: 'string' });
    },
    updateField: (state, action: PayloadAction<{ index: number; field: Partial<CustomField> }>) => {
      state.builder.fields[action.index] = { ...state.builder.fields[action.index], ...action.payload.field };
    },
    removeField: (state, action: PayloadAction<number>) => {
      state.builder.fields.splice(action.payload, 1);
    },
    resetBuilder: (state) => {
      state.builder = initialState.builder;
    },
    setModules: (state, action: PayloadAction<any[]>) => {
      state.modules = action.payload;
    },
  },
});

export const { updateBuilder, addField, updateField, removeField, resetBuilder, setModules } = customModuleSlice.actions;
export default customModuleSlice.reducer;
