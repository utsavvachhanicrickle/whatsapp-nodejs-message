import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";
import toast from "../utils/Toast.jsx";
import { MESSAGES } from "../utils/Messages.js";

export const messageModules = {
  sendMessage: async (sessionId, number, message) => {
    try {
      const res = await API.post(APIENDPOINTS.SEND_MESSAGE, { sessionId, number, message });
      toast.success(MESSAGES.SINGLE_MESSAGE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(error.response?.data?.message || MESSAGES.SINGLE_MESSAGE_ERROR);
      throw error;
    }
  },
  sendMultipleMessages: async (sessionId, multipleNumber, message) => {
    try {
      const res = await API.post(APIENDPOINTS.SEND_MULTIPLE_MESSAGES, { sessionId, multipleNumber, message });
      toast.success(MESSAGES.MULTIPLE_MESSAGE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(error.response?.data?.message || MESSAGES.MULTIPLE_MESSAGE_ERROR);
      throw error;
    }
  },
  sendMultipleGroupMessages: async (sessionId, multipleGroup, message) => {
    try {
      const res = await API.post(APIENDPOINTS.SEND_MULTIPLE_GROUP_MESSAGES, { sessionId, multipleGroup, message });
      toast.success(MESSAGES.GROUP_MESSAGE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(error.response?.data?.message || MESSAGES.GROUP_MESSAGE_ERROR);
      throw error;
    }
  },
};
