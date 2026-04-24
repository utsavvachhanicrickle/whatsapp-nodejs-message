import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { userServices } from "../../services/user.services";

export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, thunkAPI) => {
    try {
      return await userServices.getUsers();
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to fetch users");
    }
  },
);

export const addUser = createAsyncThunk(
  "user/addUser",
  async ({ phone, socketId, onSuccess }, thunkAPI) => {
    try {
      const newUser = await userServices.addUser(phone, phone, socketId);
      if (onSuccess) onSuccess(newUser);
      return newUser;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to add user");
    }
  },
);

export const removeUser = createAsyncThunk(
  "user/removeUser",
  async ({ phone, socketId }, thunkAPI) => {
    try {
      // console.log("slice i will called ", phone);

      await userServices.removeUser(phone, socketId);

      return phone;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to remove user");
    }
  },
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addUser.fulfilled, (state, action) => {
        state.users.push(action.payload);
      })

      .addCase(removeUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u !== action.payload);
        console.log("done");
        
      });
  },
});

export default userSlice.reducer;
