import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";
import toast from "../utils/Toast";
import { MESSAGES } from "../utils/Messages";

export const defaultMessageModules = {
  getDefaultMessages: () => API.get(APIENDPOINTS.GET_DEFAULT_MESSAGES),

  addDefaultMessage: async (formData) => {
    try {
      const res = await API.post(APIENDPOINTS.ADD_DEFAULT_MESSAGE, formData);
      toast.success(MESSAGES.DEFAULT_MESSAGE_ADDED_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.DEFAULT_MESSAGE_ADDED_ERROR);
      throw err;
    }
  },

  updateDefaultMessage: async (id, formData) => {
    try {
      const res = await API.put(APIENDPOINTS.UPDATE_DEFAULT_MESSAGE(id), formData);
      toast.success(MESSAGES.DEFAULT_MESSAGE_UPDATED_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.SOMETHING_WENT_WRONG);
      throw err;
    }
  },

  deleteDefaultMessage: async (id) => {
    try {
      const res = await API.delete(APIENDPOINTS.DELETE_DEFAULT_MESSAGE(id));
      toast.success(MESSAGES.DEFAULT_MESSAGE_DELETED_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.SOMETHING_WENT_WRONG);
      throw err;
    }
  },
};
