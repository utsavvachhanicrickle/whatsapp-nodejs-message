import { createSlice } from "@reduxjs/toolkit";
import { userServices } from "../../services/user.services";

const initialState = {
  authData: JSON.parse(localStorage.getItem("profile")) || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      if (!action.payload) return;
      localStorage.setItem("profile", JSON.stringify(action.payload));
      console.log(action);

      state.authData = action.payload;
    },
    logout: (state) => {
      console.log("called");
      localStorage.removeItem("profile");
      state.authData = false;
    },
  },
});

export const { setAuth, logout } = authSlice.actions;

export default authSlice.reducer;
