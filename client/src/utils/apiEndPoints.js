export const APIENDPOINTS = {
  // Auth & User Endpoints
  GET_USERS: "/api/user/getAllUsers",
  ADD_USER: "/api/user/add",
  REMOVE_USER: (phone) => `/api/user/remove/${phone}`,
  SIGNIN: "/api/user/login",
  SIGNUP: "/api/user/signup",
  LOGOUT: "/api/user/logout",
  REFRESH_TOKEN: "/api/user/refresh",

  // Contact Endpoints
  GET_CONTACTS: "/api/contact/get-all",
  ADD_CONTACT: "/api/contact/add",
  UPDATE_CONTACT: (id) => `/api/contact/update/${id}`,
  DELETE_CONTACT: (id) => `/api/contact/delete/${id}`,
  BULK_UPLOAD_CONTACTS: "/api/contact/bulk-upload",
  BULK_DELETE_CONTACTS: "/api/contact/bulk-delete",

  // Default Message Endpoints
  GET_DEFAULT_MESSAGES: "/api/default-message/get-all",
  ADD_DEFAULT_MESSAGE: "/api/default-message/add",
  UPDATE_DEFAULT_MESSAGE: (id) => `/api/default-message/update/${id}`,
  DELETE_DEFAULT_MESSAGE: (id) => `/api/default-message/delete/${id}`,

  // Group Endpoints
  GET_GROUPS: (sessionId) => `/api/group/list/${sessionId}`,

  // Message Endpoints
  SEND_MESSAGE: "api/message/send",
  SEND_MULTIPLE_MESSAGES: "api/message/multiple-send",
  SEND_MULTIPLE_GROUP_MESSAGES: "api/group/send/multiples",
  GET_CHATS: (sessionId) => `api/message/${sessionId}/chats`,
  GET_MESSAGES: (sessionId, contactWhatsappId) => `api/message/${sessionId}/messages/${contactWhatsappId}`,
};
