import { buttonVariants } from "../../utils/schema";
import { SIGNUP, LOGIN } from "../app.routes.js";
export const authFields = {
  loginFields: [
    {
      type: "email",
      name: "email",
      placeholder: "Enter Email",
      required: true,
    },
    {
      type: "password",
      name: "password",
      placeholder: "Enter Password",
      required: true,
    },
  ],

  loginButtons: [
    {
      type: "submit",
      varint: buttonVariants.PRIMARY,
      label: "Sign In",
    },
  ],

  loginFooter: (navigate) => ({
    message: " Don’t have an account?",
    onClick: () => navigate(SIGNUP),
    spanText: "Sing Up",
  }),

  signUpFields: [
    {
      type: "text",
      name: "name",
      placeholder: "Enter Name",
      required: true,
    },
    {
      type: "email",
      name: "email",
      placeholder: "Enter Email",
      required: true,
    },
    {
      type: "password",
      name: "password",
      placeholder: "Enter Password",
      required: true,
    },
    {
      type: "password",
      name: "confirmPassword",
      placeholder: "Enter Confirm Password",
      required: true,
    },
  ],

  signUpButtons: [
    {
      type: "submit",
      varint: "primary",
      label: "Sign Up",
    },
  ],

  signUpFooter: (navigate) => ({
    message: "Already have an account?",
    onClick: () => navigate(LOGIN),
    spanText: "Login",
  }),
};
