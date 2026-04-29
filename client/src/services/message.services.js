import API from "./api.services.js";
import toast from "../utils/Toast.jsx";

export const messageServices = {
  SendMessageServices: async (sessionId, number, message) => {
    try {
      await await API.post("api/message/send", {
        sessionId,
        number,
        message,
      });

      toast.success("Message sent");
    } catch (err) {
      console.error(err);
    }
  },
  SendMultipleMessagesServices: async (sessionId, multipleNumber, message) => {
    try {
      await API.post("api/message/multiple-send", {
        sessionId,
        multipleNumber,
        message,
      });
      toast.success("Messages sends ");
    } catch (error) {
      toast.error(error);
      console.error(error);
    }
  },
  SendMultipleGroupMessagesServices: async (
    sessionId,
    multipleGroup,
    message,
  ) => {
    try {
      await API.post("api/group/send/multiples", {
        sessionId,
        multipleGroup,
        message,
      });
      toast.success(response.data.message || "Messages sent successfully!");
    } catch (error) {
      toast.error(error);
      console.error(error);
    }
  },
};
