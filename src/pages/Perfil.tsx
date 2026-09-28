import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
import type { User } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MenuConta from "../componentes/MenuConta";
import { auth } from "../firebase/firebase";
import styles from "./PaginaConta.module.css";

function authError(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  if (code === "auth/wrong-password" || code === "auth/invalid-credential") return "A senha atual não confere.";
  if (code === "auth/weak-password") return "A nova senha precisa ter pelo menos 6 caracteres.";
  if (code === "auth/requires-recent-login") return "Entre novamente na conta e tente de novo.";
  return "Não foi possível atualizar os dados. Confira os campos e tente novamente.";
}

function formatDate(value?: string) {
  if (!value) return "Não disponível";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Não disponível" : date.toLocaleDateString("pt-BR");
}

export default function Perfil() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(auth));
  const [username, setUsername] = useState("");
  const [savedName, setSavedName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!auth) {
      return;
    }
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUsername(currentUser?.displayName ?? "");
      setSavedName(currentUser?.displayName ?? "");
      setLoading(false);
    });
  }, []);

  const handleUsername = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !username.trim()) return;
    setSaving(true);
    setStatus("");
    setIsError(false);
    try {
      await updateProfile(user, { displayName: username.trim() });
      localStorage.setItem("consattentia-user-name", username.trim());
      setSavedName(username.trim());
      setStatus("Nome de usuário atualizado.");
    } catch (error) {
      setStatus(authError(error));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email) return;
    setStatus("");
    setIsError(false);
    if (newPassword.length < 6) {
      setStatus("A nova senha precisa ter pelo menos 6 caracteres.");
      setIsError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus("A confirmação da senha não corresponde.");
      setIsError(true);
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setStatus("Senha atualizada. Use a nova senha no próximo login.");
    } catch (error) {
      setStatus(authError(error));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <button className={styles.brand} type="button" onClick={() => navigate("/home")}>ConsAttentia</button>
        <MenuConta />
      </header>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Conta</p>
        <h1 className={styles.title}>Perfil</h1>
        <p className={styles.description}>Consulte seus dados e mantenha suas informações de acesso atualizadas.</p>

        {loading ? <p role="status">Carregando perfil...</p> : !user ? (
          <section className={styles.section}>
            <h2>Sessão não encontrada</h2>
            <p className={styles.hint}>Entre na sua conta para consultar e editar o perfil.</p>
            <button className={styles.button} type="button" onClick={() => navigate("/")}>Ir para login</button>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.section}>
              <h2>Dados da conta</h2>
              <dl className={styles.definitionList}>
                <dt>Nome</dt><dd>{savedName || "Não informado"}</dd>
                <dt>Email de login</dt><dd>{user.email || "Não informado"}</dd>
                <dt>Provedor</dt><dd>{user.providerData.map((provider) => provider.providerId).join(", ") || "Email e senha"}</dd>
                <dt>Email verificado</dt><dd>{user.emailVerified ? "Sim" : "Não"}</dd>
                <dt>Conta criada</dt><dd>{formatDate(user.metadata.creationTime)}</dd>
                <dt>UID</dt><dd>{user.uid}</dd>
                <dt>Senha</dt><dd>Protegida pelo Firebase; nunca exibida</dd>
              </dl>
              <p className={styles.hint}>O email continua sendo o identificador usado para entrar. O nome de usuário atualizado será exibido no aplicativo.</p>
            </section>

            <section className={styles.section}>
              <h2>Nome de usuário</h2>
              <form onSubmit={handleUsername}>
                <label className={styles.field}>
                  Nome exibido no aplicativo
                  <input className={styles.input} autoComplete="nickname" maxLength={60} required value={username} onChange={(event) => setUsername(event.target.value)} />
                </label>
                <button className={styles.button} type="submit" disabled={saving}>Salvar nome</button>
              </form>
            </section>

            <section className={`${styles.section} ${styles.sectionWide}`}>
              <h2>Alterar senha</h2>
              <form onSubmit={handlePassword}>
                <div className={styles.layout}>
                  <label className={styles.field}>
                    Senha atual
                    <input className={styles.input} type="password" autoComplete="current-password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                  </label>
                  <label className={styles.field}>
                    Nova senha
                    <input className={styles.input} type="password" autoComplete="new-password" minLength={6} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                  </label>
                  <label className={styles.field}>
                    Confirmar nova senha
                    <input className={styles.input} type="password" autoComplete="new-password" minLength={6} required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                  </label>
                </div>
                <button className={styles.button} type="submit" disabled={saving}>Atualizar senha</button>
              </form>
            </section>
            {status && <p className={`${styles.status} ${isError ? styles.statusError : ""}`} role={isError ? "alert" : "status"}>{status}</p>}
          </div>
        )}
      </div>
    </main>
  );
}