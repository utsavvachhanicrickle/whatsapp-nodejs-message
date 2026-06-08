import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";
import toast from "../utils/Toast";
import { MESSAGES } from "../utils/Messages";

export const contactModules = {
  getContacts: async (sessionId) => {
    try {
      const url = sessionId
        ? `${APIENDPOINTS.GET_CONTACTS}?sessionId=${sessionId}`
        : APIENDPOINTS.GET_CONTACTS;
      const res = await API.get(url);
      return res;
    } catch (err) {
      toast.error(MESSAGES.CONTACT_FETCH_ERROR);
      throw err;
    }
  },

  addContact: async (formData) => {
    try {
      const res = await API.post(APIENDPOINTS.ADD_CONTACT, formData);
      toast.success(MESSAGES.CONTACT_ADDED_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.CONTACT_ADDED_ERROR);
      throw err;
    }
  },

  updateContact: async (id, formData) => {
    try {
      const res = await API.put(APIENDPOINTS.UPDATE_CONTACT(id), formData);
      toast.success(MESSAGES.CONTACT_UPDATED_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.CONTACT_UPDATED_ERROR);
      throw err;
    }
  },

  deleteContact: async (id) => {
    try {
      const res = await API.delete(APIENDPOINTS.DELETE_CONTACT(id));
      toast.success(MESSAGES.CONTACT_DELETED_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.CONTACT_DELETED_ERROR);
      throw err;
    }
  },

  bulkUploadContacts: async (contacts) => {
    try {
      const res = await API.post(APIENDPOINTS.BULK_UPLOAD_CONTACTS, contacts);
      toast.success(MESSAGES.BULK_UPLOAD_SUCCESS);
      return res;
    } catch (err) {
      toast.error(MESSAGES.BULK_UPLOAD_ERROR);
      throw err;
    }
  },

  bulkDeleteContacts: async (contacts) => {
    try {
      const chunkSize = 50;
      const deletedIds = [];
      for (let i = 0; i < contacts.contacts.length; i += chunkSize) {
        const chunk = contacts.contacts.slice(i, i + chunkSize);

        const res = await API.post(APIENDPOINTS.BULK_DELETE_CONTACTS, {
          contacts: chunk,
        });
        deletedIds.push(...res.data.deletedId);
      }
      toast.success(MESSAGES.BULK_DELETE_SUCCESS);
      return deletedIds;
    } catch (err) {
      toast.error(MESSAGES.BULK_DELETE_ERROR);
      throw err;
    }
  },
};
