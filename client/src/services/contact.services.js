import API from "./api.services";

export const contactServices = {
  getContact: async () => {
    try {
      const res = await API.get("/api/contact/get-all");
      console.log(res);
      return res.data.contacts;
    } catch (error) {
      console.error(err);
      return [];
    }
  },
  addContact: async (formData) => {
    try {
      const res = await API.post("/api/contact/add", formData);
      return res.data.newContact;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  updateContact: async (id, formData) => {
    try {
      const res = await API.put(`/api/contact/update/${id}`, formData);
      return res.data.updatedContact;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  deleteContact: async (id) => {
    try {
      const res = await API.delete(`/api/contact/delete/${id}`);
      return res.data.deletedId || id;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  bulkUploadPDF: async (formData) => {
    try {
      const res = await API.post("/api/user/bulk-upload-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
