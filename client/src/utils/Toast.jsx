import { toast as reactToast } from "react-toastify";

const getToastOptions = (options = {}) => {
  const isDark =
    options.darkMode !== undefined
      ? options.darkMode
      : localStorage.getItem("darkMode") === "true";

  return {
    theme: isDark ? "dark" : "light",
    ...options,
  };
};

const toast = {
  success: (message, options = {}) => {
    reactToast.success(message, getToastOptions(options));
  },

  error: (message, options = {}) => {
    reactToast.error(message, getToastOptions(options));
  },

  info: (message, options = {}) => {
    reactToast.info(message, getToastOptions(options));
  },

  warning: (message, options = {}) => {
    reactToast.warn(message, getToastOptions(options));
  },
};

export default toast;
