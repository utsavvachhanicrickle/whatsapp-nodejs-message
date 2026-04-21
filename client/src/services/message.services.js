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
};
