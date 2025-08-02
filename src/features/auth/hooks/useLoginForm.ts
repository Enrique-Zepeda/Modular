import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppDispatch } from "@/hooks";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormData } from "@/lib/validations/schemas";
import { loginWithGoogle, loginUser } from "../thunks";

export function useLoginForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [loginLoading, setLoginLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email, password },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setLoginLoading(true);
      const result = await dispatch(loginUser(data.email, data.password));
      if (result?.success === true) navigate("/dashboard");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await dispatch(loginWithGoogle());
    } finally {
      setGoogleLoading(false);
    }
  };

  return {
    form,
    email,
    password,
    setEmail,
    setPassword,
    onSubmit,
    handleGoogleLogin,
    loginLoading,
    googleLoading,
  };
}
