import React from "react";
import { authFields } from "../utils/constants/auhFields";
import FormField from "../components/Forms/FormField";
import { useNavigate } from "react-router-dom";
import { authModules } from "../modules/authModules";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/slices/authSlices";
import { toast } from "react-toastify";
import { HOME } from "../utils/app.routes";

function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (formData) => {
    try {
      const res = await authModules.signIn(formData);
      const user = res.data.user;

      dispatch(setAuth(user)); 
      toast.success("Login successful");

      navigate(HOME); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg)">
      <FormField
        header="Sign In"
        fields={authFields.loginFields}
        buttons={authFields.loginButtons}
        onSubmit={handleSubmit}
        footer={authFields.loginFooter(navigate)}
      />
    </div>
  );
}

export default LoginPage;