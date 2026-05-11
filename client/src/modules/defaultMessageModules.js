import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";

export const defaultMessageModules = {
  getDefaultMessages: () => API.get(APIENDPOINTS.GET_DEFAULT_MESSAGES),
  addDefaultMessage: (formData) => API.post(APIENDPOINTS.ADD_DEFAULT_MESSAGE, formData),
  updateDefaultMessage: (id, formData) => API.put(APIENDPOINTS.UPDATE_DEFAULT_MESSAGE(id), formData),
  deleteDefaultMessage: (id) => API.delete(APIENDPOINTS.DELETE_DEFAULT_MESSAGE(id)),
};
