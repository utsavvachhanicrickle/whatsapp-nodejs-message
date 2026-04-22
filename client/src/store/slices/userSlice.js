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
  }
);

export const addUser = createAsyncThunk(
  "user/addUser",
  async ({ phone, socketId, onSuccess }, thunkAPI) => {
    try {
      const newUser = await userServices.addUser(phone, phone, socketId);

      // optional callback for UI (you used this in HomePage)
      if (onSuccess) onSuccess(newUser);

      return newUser;
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to add user");
    }
  }
);

export const removeUser = createAsyncThunk(
  "user/removeUser",
  async (phone, thunkAPI) => {
    try {
      await userServices.removeUser(phone);
      return phone; 
    } catch (err) {
      return thunkAPI.rejectWithValue("Failed to remove user");
    }
  }
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
        state.users = state.users.filter(
          (u) => u.phone !== action.payload
        );
      });
  },
});

export default userSlice.reducer;