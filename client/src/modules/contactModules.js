import { APIENDPOINTS } from "../utils/apiEndPoints.js";
import API from "../services";

export const contactModules = {
  getContacts: () => API.get(APIENDPOINTS.GET_CONTACTS),
  addContact: (formData) => API.post(APIENDPOINTS.ADD_CONTACT, formData),
  updateContact: (id, formData) => API.put(APIENDPOINTS.UPDATE_CONTACT(id), formData),
  deleteContact: (id) => API.delete(APIENDPOINTS.DELETE_CONTACT(id)),
  bulkUploadContacts: (contacts) => API.post(APIENDPOINTS.BULK_UPLOAD_CONTACTS, contacts),
  bulkDeleteContacts: (contacts) => API.post(APIENDPOINTS.BULK_DELETE_CONTACTS, contacts),
};
