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
  getChats: async (sessionId) => {
    try {
      const res = await API.get(APIENDPOINTS.GET_CHATS(sessionId));
      return res.data.contactIds;
    } catch (error) {
      console.error("Error fetching chats:", error);
      return [];
    }
  },
  getMessages: async (sessionId, contactWhatsappId) => {
    try {
      const res = await API.get(APIENDPOINTS.GET_MESSAGES(sessionId, contactWhatsappId));
      return res.data.messages;
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  },
  assignChat: async (sessionId, chatId, email) => {
    try {
      const res = await API.post("/api/assignment/assign", { sessionId, chatId, email });
      toast.success(res.data.message);
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign chat");
      throw error;
    }
  },
  getChatAssignment: async (sessionId, chatId) => {
    try {
      const res = await API.get(`/api/assignment/assignment/${sessionId}/${chatId}`);
      return res.data.assignment;
    } catch (error) {
      console.error("Error fetching chat assignment:", error);
      return null;
    }
  },
  getAssignedChats: async () => {
    try {
      const res = await API.get("/api/assignment/assignments/me");
      return res.data.chats;
    } catch (error) {
      console.error("Error fetching assigned chats:", error);
      return [];
    }
  },
  getNotes: async (sessionId, chatId, userId = null) => {
    try {
      const url = userId
        ? `/api/assignment/notes/${sessionId}/${chatId}?userId=${userId}`
        : `/api/assignment/notes/${sessionId}/${chatId}`;
      const res = await API.get(url);
      return res.data.notes;
    } catch (error) {
      console.error("Error fetching notes:", error);
      return "";
    }
  },
  saveNotes: async (sessionId, chatId, notes, userId = null) => {
    try {
      const payload = { sessionId, chatId, notes };
      if (userId) payload.userId = userId;
      const res = await API.post("/api/assignment/notes", payload);
      toast.success("Notes saved successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save notes");
      throw error;
    }
  },
  getNotesUsers: async (sessionId, chatId) => {
    try {
      const res = await API.get(`/api/assignment/notes/users/${sessionId}/${chatId}`);
      return res.data.users;
    } catch (error) {
      console.error("Error fetching notes users:", error);
      throw error;
    }
  },
};
