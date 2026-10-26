import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { getAuthErrorMessage } from "../componentes/authErrors";
import { useAuth } from "../componentes/useAuth";
import { registerSchema } from "../schemas/formSchemas";
import type { RegisterFormValues } from "../schemas/formSchemas";
import ModalMensagem from "../componentes/ModalMensagem";
import Gray from "../assets/Gray.png";
import FundoC from "../assets/fundoc.png";
import styles from "./Register.module.css";

export default function Register() {
  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const { register: createAccount, authError } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const submitRegistration = async ({ name, email, password }: RegisterFormValues) => {
    setModalMessage(null);
    try {
      await createAccount(name, email, password);
      reset();
      setModalMessage("Cadastro concluído ✅");
      window.setTimeout(() => navigate("/login"), 1200);
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

      <form className={styles.card} onSubmit={handleSubmit(submitRegistration)} noValidate>
        <img src={Gray} alt="" className={styles.icon} />
        <label className={styles.visuallyHidden} htmlFor="register-name">Nome</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          placeholder="Nome"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          {...register("name")}
          className={styles.input}
        />
        {errors.name && <span className={styles.fieldError} id="register-name-error" role="alert">{errors.name.message}</span>}
        <label className={styles.visuallyHidden} htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
          className={styles.input}
        />
        {errors.email && <span className={styles.fieldError} id="register-email-error" role="alert">{errors.email.message}</span>}
        <label className={styles.visuallyHidden} htmlFor="register-password">Senha</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Senha"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "register-password-error" : undefined}
          {...register("password")}
          className={styles.input}
        />
        {errors.password && <span className={styles.fieldError} id="register-password-error" role="alert">{errors.password.message}</span>}
        {authError && <p className={styles.fieldError} role="alert">{authError}</p>}
        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Cadastrando..." : "Cadastrar"}
        </button>
      </form>

      <button onClick={() => navigate("/login")} className={styles.createAccount} type="button">
        Já tenho uma conta
      </button>

      {modalMessage && (
        <ModalMensagem message={modalMessage} onClose={() => setModalMessage(null)} />
      )}
    </div>
  );
}
