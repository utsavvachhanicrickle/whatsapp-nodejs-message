import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";

export const groupModules = {
  getGroups: (sessionId) => API.get(APIENDPOINTS.GET_GROUPS(sessionId)),
};
