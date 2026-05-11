import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { contactModules } from "../../modules/contactModules";

export const fetchContactSlice = createAsyncThunk(
  "contact/fetchContact",
  async (_, thunkAPI) => {
    try {
      const res = await contactModules.getContacts();
      return res.data.contacts;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to fetch contacts");
    }
  },
);

export const addContactSlice = createAsyncThunk(
  "contact/addContact",
  async (formData, thunkAPI) => {
    try {
      const res = await contactModules.addContact(formData);
      return res.data.newContact;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to add contact");
    }
  },
);

export const updateContactSlice = createAsyncThunk(
  "contact/updateContact",
  async ({ id, formData }, thunkAPI) => {
    try {
      const res = await contactModules.updateContact(id, formData);
      return res.data.updatedContact;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to update contact");
    }
  },
);

export const deleteContactSlice = createAsyncThunk(
  "contact/deleteContact",
  async (id, thunkAPI) => {
    try {
      await contactModules.deleteContact(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue("Failed to delete contact");
    }
  },
);

export const bulkUploadContactsSlice = createAsyncThunk(
  "contact/bulkUploadContacts",
  async (contacts, thunkAPI) => {
    try {
      const res = await contactModules.bulkUploadContacts({ contacts });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Bulk upload failed");
    }
  },
);

export const bulkDeleteContactsSlice = createAsyncThunk(
  "contact/bulkDeleteCntacts",
  async (contacts, thunkAPI) => {
    try {
      const res = await contactModules.bulkDeleteContacts({ contacts });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue("Bulk Delete failed");
    }
  },
);

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    contacts: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchContactSlice.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContactSlice.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContactSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addContactSlice.fulfilled, (state, action) => {
        state.contacts.push(action.payload);
      })

      .addCase(updateContactSlice.fulfilled, (state, action) => {
        const index = state.contacts.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })

      .addCase(deleteContactSlice.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter((c) => c._id !== action.payload);
      })

      .addCase(bulkUploadContactsSlice.fulfilled, (state, action) => {
        state.contacts = [...state.contacts, ...action.payload.createdContacts];
        state.loading = false;
      })
      .addCase(bulkUploadContactsSlice.pending, (state) => {
        state.loading = true;
      })
      .addCase(bulkUploadContactsSlice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(bulkDeleteContactsSlice.fulfilled, (state, action) => {
        state.loading = false;        
        const deletedIds = action.payload.map((c) => c);

        state.contacts = state.contacts.filter(
          (c) => !deletedIds.includes(c._id),
        );
      });
  },
});

export default contactSlice.reducer;
