import API from "./api.services";

export const defaultMessagesServices = {
  getDefaultMessages: async () => {
    try {
      const res = await API.get("/api/default-message/get-all");
      return res.data.defaultMessage;
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  addDefaultMessages: async (FormData) => {
    try {
      const res = await API.post("/api/default-message/add", FormData);
      return res.data.defaultMessage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  deleteDefaultMessage: async (id) => {
    try {
      const res = await API.delete(`/api/default-message/delete/${id}`);
      return res.data.defaultMessage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  updateDefaultMessage: async (id, FormData) => {
    try {
      const res = await API.put(`/api/default-message/update/${id}`, FormData);
      return res.data.defaultMessage;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
