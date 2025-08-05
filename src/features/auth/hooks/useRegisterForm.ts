import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/hooks";
import { registerSchema, type RegisterFormData } from "@/lib/validations/schemas";
import { registerUser } from "../thunks/registerThunk";

export function useRegisterForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await dispatch(registerUser(data.email, data.password));
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  return {
    form,
    onSubmit,
  };
}
