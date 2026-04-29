import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { groupServices } from "../../services/group.services";

export const fetchGroups = createAsyncThunk(
  "group/fetchGroups",
  async (sessionId, thunkAPI) => {
    try {
      const res = await groupServices.getGroups(sessionId);
      return res;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch Groups");
    }
  },
);

const groupSlice = createSlice({
  name: "group",
  initialState: {
    groups: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.groups = action.payload;
      })
      .addCase(fetchGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default groupSlice.reducer;
