import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { defaultKeyWordsModules } from "../../modules/defaultKeyWordsModules";

export const fetchDefaultKeywords = createAsyncThunk(
  "defaultKeywords/fetchDefaultKeywords",
  async (sessionId, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsModules.getDefaultKeyWords(sessionId);
      return res.data.result;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to fetch Default Keywords",
      );
    }
  },
);

export const addDefaultKeyWords = createAsyncThunk(
  "defaultKeywords/addDefaultKeyWords",
  async ({ sessionId, formData }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsModules.addDefaultKeyWords(
          sessionId,
          formData,
        );

      return res.data.result;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to add Default Keywords",
      );
    }
  },
);

export const updateDefaultKeyWords = createAsyncThunk(
  "defaultKeywords/updateDefaultKeyWords",
  async ({ sessionId, id, formData }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsModules.updateDefaultKeyWords(
          sessionId,
          id,
          formData,
        );

      return res.data.result;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to update Default Keywords",
      );
    }
  },
);

export const deleteDefaultKeyWords = createAsyncThunk(
  "defaultKeywords/deleteDefaultKeyWords",
  async ({ sessionId, id }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsModules.deleteDefaultKeyWords(
          sessionId,
          id,
        );

      return res.data.result;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to delete Default Keywords",
      );
    }
  },
);


const defaultKeyWordsSlice = createSlice({
  name: "defaultKeyWordsSlice",

  initialState: {
    defaultKeywords: [],
    loading: false,
    error: null,
  },

  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchDefaultKeywords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDefaultKeywords.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultKeywords = action.payload;
      })
      .addCase(fetchDefaultKeywords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addDefaultKeyWords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addDefaultKeyWords.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultKeywords.push(action.payload);
      })
      .addCase(addDefaultKeyWords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateDefaultKeyWords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDefaultKeyWords.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultKeywords = state.defaultKeywords.map((item) =>
          item._id === action.payload._id
            ? action.payload
            : item
        );
      })
      .addCase(updateDefaultKeyWords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteDefaultKeyWords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDefaultKeyWords.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultKeywords =
          state.defaultKeywords.filter(
            (item) => item._id !== action.meta.arg.id
          );
      })
      .addCase(deleteDefaultKeyWords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default defaultKeyWordsSlice.reducer;