import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  authData: JSON.parse(localStorage.getItem("profile")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      localStorage.setItem("profile", JSON.stringify(action.payload));
      state.authData = action.payload;
    },
    logout: (state) => {
      localStorage.removeItem("profile");
      state.authData = null;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;