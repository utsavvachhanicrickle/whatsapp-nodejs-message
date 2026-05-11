import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";
import toast from "../utils/Toast";
import { MESSAGES } from "../utils/Messages";

export const authModules = {
  signIn: async (formData) => {
    try {
      const res = await API.post(APIENDPOINTS.SIGNIN, formData);
      toast.success(MESSAGES.LOGIN_SUCCESS);
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || MESSAGES.LOGIN_ERROR);
      throw err;
    }
  },

  signUp: async (formData) => {
    try {
      const res = await API.post(APIENDPOINTS.SIGNUP, formData);
      toast.success(MESSAGES.SIGNUP_SUCCESS);
      return res;
    } catch (err) {
      toast.error(err?.response?.data?.message || MESSAGES.SIGNUP_ERROR);
      throw err;
    }
  },

  logout: async () => {
    try {
      const res = await API.post(APIENDPOINTS.LOGOUT);
      toast.success(MESSAGES.LOGOUT_SUCCESS);
      return res;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  getUsers: () => API.get(APIENDPOINTS.GET_USERS),

  addUser: (formData) => API.post(APIENDPOINTS.ADD_USER, formData),

  removeUser: (phone) => API.delete(APIENDPOINTS.REMOVE_USER(phone)),
};
