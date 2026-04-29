import API from "./api.services";

export const groupServices = {
  getGroups: async (sessionId) => {
    try {
      const res = await API.get(`/api/group/list/${sessionId}`);
      return res.data.groups;
    } catch (error) {
      console.log(error);

      return [];
    }
  },
};
