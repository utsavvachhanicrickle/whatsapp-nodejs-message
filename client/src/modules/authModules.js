import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";

export const authModules = {
  getUsers: () => API.get(APIENDPOINTS.GET_USERS),
  addUser: (formData) => API.post(APIENDPOINTS.ADD_USER, formData),
  removeUser: (phone, socketId) => API.delete(APIENDPOINTS.REMOVE_USER(phone), { params: { socketId } }),
  signIn: (formData) => API.post(APIENDPOINTS.SIGNIN, formData),
  signUp: (formData) => API.post(APIENDPOINTS.SIGNUP, formData),
  logout: () => API.delete(APIENDPOINTS.LOGOUT),
};
