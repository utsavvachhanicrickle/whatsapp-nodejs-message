import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";
import toast from "../utils/Toast";
import { MESSAGES } from "../utils/Messages";

export const defaultKeyWordsModules = {
  getDefaultKeyWords: async (sessionId) => {
    const res = await API.get(APIENDPOINTS.GET_DEFAULT_KEYWORDS(sessionId));
    return res;
  },
  addDefaultKeyWords: async (sessionId, formData) => {
    try {
      const res = API.post(
        APIENDPOINTS.ADD_DEFAULT_KEYWORDS(sessionId),
        formData,
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_ADDED_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_ADDED_ERROR);
      throw error;
    }
  },
  updateDefaultKeyWords: async (sessionId, id, formData) => {
    try {
      const res = API.put(
        APIENDPOINTS.UPDATE_DEFAULT_KEYWORDS(sessionId, id),
        formData,
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_UPDATE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_UPDATE_ERROR);
      throw error;
    }
  },
  deleteDefaultKeyWords: async (sessionId, id) => {
    try {
      const res = API.delete(
        APIENDPOINTS.DELETE_DEFAULT_KEYWORDS(sessionId, id),
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_DELETE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_DELETE_ERROR);
      throw error;
    }
  },
};
