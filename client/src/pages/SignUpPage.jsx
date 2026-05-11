import FormField from "../components/Forms/FormField";
import { authFields } from "../utils/constants/auhFields";
import { useNavigate } from "react-router-dom";
import { authModules } from "../modules/authModules";
import { toast } from "react-toastify";
import { LOGIN } from "../utils/app.routes";

function SignUpPage() {
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    try {
      if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match");
      }

      await authModules.signUp(formData);

      toast.success("Account created");
      navigate(LOGIN);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--bg)">
      <FormField
        header="Sign Up"
        fields={authFields.signUpFields}
        buttons={authFields.signUpButtons}
        onSubmit={handleSubmit}
        footer={authFields.signUpFooter(navigate)}
      />
    </div>
  );
}

export default SignUpPage;
