import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";

export const messageModules = {
  sendMessage: (sessionId, number, message) => 
    API.post(APIENDPOINTS.SEND_MESSAGE, { sessionId, number, message }),
  sendMultipleMessages: (sessionId, multipleNumber, message) => 
    API.post(APIENDPOINTS.SEND_MULTIPLE_MESSAGES, { sessionId, multipleNumber, message }),
  sendMultipleGroupMessages: (sessionId, multipleGroup, message) => 
    API.post(APIENDPOINTS.SEND_MULTIPLE_GROUP_MESSAGES, { sessionId, multipleGroup, message }),
};
