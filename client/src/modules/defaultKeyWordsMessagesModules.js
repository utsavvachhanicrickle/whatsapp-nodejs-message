import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";
import toast from "../utils/Toast";
import { MESSAGES } from "../utils/Messages";

export const defaultKeyWordsMessagesModules = {
  getdefaultKeyWordsMessages: async (sessionId) => {
    const res = await API.get(APIENDPOINTS.GET_DEFAULT_KEYWORDS_MESSAGES(sessionId));
    return res;
  },
  adddefaultKeyWordsMessages: async (sessionId, formData) => {
    try {
      const res = API.post(
        APIENDPOINTS.ADD_DEFAULT_KEYWORDS_MESSAGES(sessionId),
        formData,
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_ADDED_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_ADDED_ERROR);
      throw error;
    }
  },
  updatedefaultKeyWordsMessages: async (sessionId, id, formData) => {
    try {
      const res = API.put(
        APIENDPOINTS.UPDATE_DEFAULT_KEYWORDS_MESSAGES(sessionId, id),
        formData,
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_UPDATE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_UPDATE_ERROR);
      throw error;
    }
  },
  deleteDefaultKeyWordsMessages: async (sessionId, id) => {
    try {
      const res = API.delete(
        APIENDPOINTS.DELETE_DEFAULT_KEYWORDS_MESSAGES(sessionId, id),
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_DELETE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_DELETE_ERROR);
      throw error;
    }
  },
  starDefaultKeyWordsMessages: async (sessionId, id) => {
    try {
      const res = API.put(
        APIENDPOINTS.STAR_DEFAULT_KEYWORDS_MESSAGES(sessionId, id),
      );
      toast.success(MESSAGES.DEFAULTKEYWORD_DELETE_SUCCESS);
      return res;
    } catch (error) {
      toast.error(MESSAGES.DEFAULTKEYWORD_DELETE_ERROR);
      throw error;
    }
  },
};
