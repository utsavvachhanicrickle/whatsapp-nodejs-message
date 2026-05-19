import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { defaultKeyWordsMessagesModules } from "../../modules/defaultKeyWordsMessagesModules";

// Fetch Default Keywords Messages
export const fetchdefaultKeywordsMessages = createAsyncThunk(
  "defaultKeywordsMessages/fetchdefaultKeywordsMessages",
  async (sessionId, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsMessagesModules.getdefaultKeyWordsMessages(
          sessionId,
        );

      return res.data.defaultKeyWordsMessages;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to fetch Default Keywords Messages",
      );
    }
  },
);

// Add Default Keywords Message
export const adddefaultKeywordsMessages = createAsyncThunk(
  "defaultKeywordsMessages/adddefaultKeywordsMessages",
  async ({ sessionId, formData }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsMessagesModules.adddefaultKeyWordsMessages(
          sessionId,
          formData,
        );

      return res.data.defaultKeywordsMessages;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to add Default Keywords Messages",
      );
    }
  },
);

// Update Default Keywords Message
export const updatedefaultKeywordsMessages = createAsyncThunk(
  "defaultKeywordsMessages/updatedefaultKeywordsMessages",
  async ({ sessionId, id, formData }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsMessagesModules.updatedefaultKeyWordsMessages(
          sessionId,
          id,
          formData,
        );

      return res.data.defaultKeywordsMessages;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to update Default Keywords Messages",
      );
    }
  },
);

// Delete Default Keywords Message
export const deletedefaultKeywordsMessages = createAsyncThunk(
  "defaultKeywordsMessages/deletedefaultKeywordsMessages",
  async ({ sessionId, id }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsMessagesModules.deleteDefaultKeyWordsMessages(
          sessionId,
          id,
        );

      return res.data.defaultKeywordsMessages;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to delete Default Keywords Messages",
      );
    }
  },
);

// Star Default Keywords Message
export const StardefaultKeywordsMessages = createAsyncThunk(
  "defaultKeywordsMessages/StardefaultKeywordsMessages",
  async ({ sessionId, id }, thunkAPI) => {
    try {
      const res =
        await defaultKeyWordsMessagesModules.starDefaultKeyWordsMessages(
          sessionId,
          id,
        );

      return res.data.defaultKeywordsMessages;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        "Failed to star Default Keywords Messages",
      );
    }
  },
);

const initialState = {
  defaultKeywordsMessages: [],
  loading: false,
  error: null,
};

const defaultKeyWordsMessagesSlice = createSlice({
  name: "defaultKeyWordsMessagesSlice",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      .addCase(fetchdefaultKeywordsMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchdefaultKeywordsMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultKeywordsMessages = action.payload;
      })
      .addCase(fetchdefaultKeywordsMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


	  .addCase(adddefaultKeywordsMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(adddefaultKeywordsMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.defaultKeywordsMessages.push(action.payload);
      })
      .addCase(adddefaultKeywordsMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


	  .addCase(updatedefaultKeywordsMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatedefaultKeywordsMessages.fulfilled, (state, action) => {
        state.loading = false;

        state.defaultKeywordsMessages =
          state.defaultKeywordsMessages.map((item) =>
            item._id === action.payload._id ? action.payload : item,
          );
      })
      .addCase(updatedefaultKeywordsMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


	  .addCase(deletedefaultKeywordsMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletedefaultKeywordsMessages.fulfilled, (state, action) => {
        state.loading = false;

        state.defaultKeywordsMessages =
          state.defaultKeywordsMessages.filter(
            (item) => item._id !== action.meta.arg.id,
          );
      })
      .addCase(deletedefaultKeywordsMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })


	  .addCase(StardefaultKeywordsMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(StardefaultKeywordsMessages.fulfilled, (state, action) => {
        state.loading = false;

        state.defaultKeywordsMessages =
          state.defaultKeywordsMessages.map((item) =>
            item._id === action.payload._id ? action.payload : item,
          );
      })
      .addCase(StardefaultKeywordsMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default defaultKeyWordsMessagesSlice.reducer;