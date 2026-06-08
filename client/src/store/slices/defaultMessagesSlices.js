import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { defaultMessageModules } from "../../modules/defaultMessageModules";

export const fetchDefaultMessage = createAsyncThunk(
  "defaultMessage/fetch",
  async (_, thunkAPI) => {
    try {
      const res = await defaultMessageModules.getDefaultMessages();
      return res.data.defaultMessage;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch messages");
    }
  },
);

export const addDefaultMessage = createAsyncThunk(
  "defaultMessage/add",
  async (formData, thunkAPI) => {
    try {
      const res = await defaultMessageModules.addDefaultMessage(formData);
      return res.data.defaultMessage;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to add message");
    }
  },
);

export const updateDefaultMessage = createAsyncThunk(
  "defaultMessage/update",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await defaultMessageModules.updateDefaultMessage(id, formData);
      return res.data.defaultMessage;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to update message");
    }
  },
);

export const deleteDefaultMessage = createAsyncThunk(
  "defaultMessage/delete",
  async (id, thunkAPI) => {
    try {
      await defaultMessageModules.deleteDefaultMessage(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to delete message");
    }
  },
);

const defaultMessageSlice = createSlice({
  name: "defaultMessage",
  initialState: { defaultMessages: [], loading: false, error: null },
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchDefaultMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDefaultMessage.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultMessages = action.payload;
      })
      .addCase(fetchDefaultMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addDefaultMessage.fulfilled, (state, action) => {
        state.defaultMessages.push(action.payload);
      })

      .addCase(updateDefaultMessage.fulfilled, (state, action) => {
        const index = state.defaultMessages.findIndex(
          (m) => m._id === action.payload._id,
        );
        if (index !== -1) {
          state.defaultMessages[index] = action.payload;
        }
      })

      .addCase(deleteDefaultMessage.fulfilled, (state, action) => {
        state.defaultMessages = state.defaultMessages.filter((m) => m._id !== action.payload);
      });
  },
});

export default defaultMessageSlice.reducer;
