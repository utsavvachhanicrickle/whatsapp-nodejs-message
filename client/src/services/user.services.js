// services/user.services.js
import API from "./api.services.js";

export const userServices = {
  getUsers: async () => {
    try {
      const res = await API.get("/api/user/getAllUsers");
      return res.data.users;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  addUser: async (name, phone, socketId) => {
    try {
      await API.post("/api/user/add", { name, phone, socketId });
      return phone;
    } catch (err) {
      console.error(err);
      return null;
    }
  },

  removeUser: async (phone, socketId) => {
    try {
      // console.log("phone : ", phone, socketId);
      return await API.delete(`/api/user/remove/${phone}`, {
        params: { socketId },
      }); 
      console.log("done");
      
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  login: async (formData) => {
    const { data } = await API.post("/api/user/login", formData);
    console.log(data);

    return data.user;
  },

  signup: async (formData) => {
    const { data } = await API.post("/api/user/signup", formData);
    return data;
  },
};
