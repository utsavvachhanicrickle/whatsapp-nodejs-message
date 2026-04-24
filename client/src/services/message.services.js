import API from "./api.services.js";

export const messageServices = {
  SendMessageServices: async (sessionId, number, message) => {
    try {
      await await API.post("api/message/send", {
        sessionId,
        number,
        message,
      });

      alert("Message sent");
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
      alert("Messages sends ");
    } catch (error) {
      console.error(error);
    }
  },
};
