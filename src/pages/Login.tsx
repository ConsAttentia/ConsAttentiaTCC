import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../componentes/authErrors";
import { useAuth } from "../componentes/useAuth";
import { loginSchema } from "../schemas/formSchemas";
import type { LoginFormValues } from "../schemas/formSchemas";
import ModalMensagem from "../componentes/ModalMensagem";
import Gray from "../assets/Gray.png";
import FundoC from "../assets/fundoc.png";
import styles from "./Login.module.css";

export default function Login() {
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const { login, authError } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const submitLogin = async ({ email, password }: LoginFormValues) => {
    setModalMessage(null);
    try {
      await login(email, password);
      navigate("/home");
    } catch (error: unknown) {
      setModalMessage(getAuthErrorMessage(error));
    }
  };

  return (
    <div className={styles.background}>
      <div className={styles.shapeTop} />
      <div className={styles.shapeBottom} />
      <div className={styles.logo}>
        <img src={FundoC} alt="ConsAttentia" />
      </div>

      <form className={styles.card} onSubmit={handleSubmit(submitLogin)} noValidate>
        <img src={Gray} alt="" className={styles.icon} />
        <label className={styles.visuallyHidden} htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
          className={styles.input}
        />
        {errors.email && <span className={styles.fieldError} id="login-email-error" role="alert">{errors.email.message}</span>}
        <label className={styles.visuallyHidden} htmlFor="login-password">Senha</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
          className={styles.input}
        />
        {errors.password && <span className={styles.fieldError} id="login-password-error" role="alert">{errors.password.message}</span>}
        {authError && <p className={styles.fieldError} role="alert">{authError}</p>}
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Login"}
        </button>
      </form>

      <button onClick={() => navigate("/register")} className={styles.createAccount} type="button">
        Criar conta
      </button>

      {modalMessage && (
        <ModalMensagem message={modalMessage} onClose={() => setModalMessage(null)} />
      )}
    </div>
  );
}
