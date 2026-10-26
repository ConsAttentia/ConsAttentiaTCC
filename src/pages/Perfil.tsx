import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MenuConta from "../componentes/MenuConta";
import { downloadTestHistoryPdf, getTestHistory, testHistoryUpdatedEvent } from "../componentes/historicoTestes";
import type { TestHistoryEntry } from "../componentes/historicoTestes";
import { getAuthErrorMessage } from "../componentes/authErrors";
import { useAuth } from "../componentes/useAuth";
import { passwordChangeSchema, usernameSchema } from "../schemas/formSchemas";
import type { PasswordChangeFormValues, UsernameFormValues } from "../schemas/formSchemas";
import styles from "./PaginaConta.module.css";

function formatDate(value?: string) {
  if (!value) return "Não disponível";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Não disponível" : date.toLocaleDateString("pt-BR");
}

function formatCompletedAt(value: Date | null) {
  return value
    ? value.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    : "Data não disponível";
}

interface HistoryLoadResult {
  userId: string;
  entries: TestHistoryEntry[];
  error: string | null;
}

export default function Perfil() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [savedNameUpdate, setSavedNameUpdate] = useState<{ userId: string; name: string } | null>(null);
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [historyResult, setHistoryResult] = useState<HistoryLoadResult | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const {
    register: registerUsername,
    handleSubmit: handleUsernameSubmit,
    formState: { errors: usernameErrors },
  } = useForm<UsernameFormValues>({
    resolver: zodResolver(usernameSchema),
    values: { username: user?.displayName ?? "" },
  });
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordChangeFormValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const savedName = savedNameUpdate && savedNameUpdate.userId === user?.uid
    ? savedNameUpdate.name
    : user?.displayName ?? "";
  const historyMatchesUser = user !== null && historyResult?.userId === user.uid;
  const historyLoading = Boolean(user && !historyMatchesUser);
  const historyError = historyMatchesUser ? historyResult?.error ?? "" : "";
  const testHistory = historyMatchesUser ? historyResult?.entries ?? [] : [];

  useEffect(() => {
    if (!user) return;
    let isActive = true;
    const loadHistory = () => {
      void getTestHistory(user.uid).then((entries) => {
        if (!isActive) return;
        setHistoryResult({ userId: user.uid, entries, error: null });
      }).catch(() => {
        if (!isActive) return;
        setHistoryResult({
          userId: user.uid,
          entries: [],
          error: "Não foi possível carregar o histórico salvo neste navegador.",
        });
      });
    };

    const onHistoryUpdated = (event: Event) => {
      const updatedUserId = (event as CustomEvent<{ userId: string }>).detail?.userId;
      if (updatedUserId === user.uid) loadHistory();
    };

    loadHistory();
    window.addEventListener(testHistoryUpdatedEvent, onHistoryUpdated);
    window.addEventListener("focus", loadHistory);
    return () => {
      isActive = false;
      window.removeEventListener(testHistoryUpdatedEvent, onHistoryUpdated);
      window.removeEventListener("focus", loadHistory);
    };
  }, [user]);

  const handleUsername = async ({ username }: UsernameFormValues) => {
    if (!user) return;
    setSaving(true);
    setStatus("");
    setIsError(false);
    try {
      await updateProfile(user, { displayName: username });
      localStorage.setItem("consattentia-user-name", username);
      setSavedNameUpdate({ userId: user.uid, name: username });
      setStatus("Nome de usuário atualizado.");
    } catch (error) {
      setStatus(getAuthErrorMessage(error, "profile"));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async ({ currentPassword, newPassword }: PasswordChangeFormValues) => {
    if (!user?.email) return;
    setStatus("");
    setIsError(false);
    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      resetPassword();
      setStatus("Senha atualizada. Use a nova senha no próximo login.");
    } catch (error) {
      setStatus(getAuthErrorMessage(error, "profile"));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async (entry: TestHistoryEntry) => {
    setDownloadingId(entry.id);
    setDownloadError("");
    try {
      await downloadTestHistoryPdf(entry);
    } catch {
      setDownloadError(`Não foi possível gerar o relatório de ${entry.testName}. Tente novamente.`);
    } finally {
      setDownloadingId(null);
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
            <button className={styles.button} type="button" onClick={() => navigate("/login")}>Ir para login</button>
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
              <form onSubmit={handleUsernameSubmit(handleUsername)} noValidate>
                <label className={styles.field}>
                  Nome exibido no aplicativo
                  <input
                    className={styles.input}
                    autoComplete="nickname"
                    aria-invalid={Boolean(usernameErrors.username)}
                    aria-describedby={usernameErrors.username ? "profile-username-error" : undefined}
                    {...registerUsername("username")}
                  />
                </label>
                {usernameErrors.username && <p className={styles.fieldError} id="profile-username-error" role="alert">{usernameErrors.username.message}</p>}
                <button className={styles.button} type="submit" disabled={saving}>Salvar nome</button>
              </form>
            </section>

            <section className={`${styles.section} ${styles.sectionWide}`}>
              <h2>Alterar senha</h2>
              <form onSubmit={handlePasswordSubmit(handlePassword)} noValidate>
                <div className={styles.layout}>
                  <label className={styles.field}>
                    Senha atual
                    <input
                      className={styles.input}
                      type="password"
                      autoComplete="current-password"
                      aria-invalid={Boolean(passwordErrors.currentPassword)}
                      aria-describedby={passwordErrors.currentPassword ? "profile-current-password-error" : undefined}
                      {...registerPassword("currentPassword")}
                    />
                    {passwordErrors.currentPassword && <span className={styles.fieldError} id="profile-current-password-error" role="alert">{passwordErrors.currentPassword.message}</span>}
                  </label>
                  <label className={styles.field}>
                    Nova senha
                    <input
                      className={styles.input}
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(passwordErrors.newPassword)}
                      aria-describedby={passwordErrors.newPassword ? "profile-new-password-error" : undefined}
                      {...registerPassword("newPassword")}
                    />
                    {passwordErrors.newPassword && <span className={styles.fieldError} id="profile-new-password-error" role="alert">{passwordErrors.newPassword.message}</span>}
                  </label>
                  <label className={styles.field}>
                    Confirmar nova senha
                    <input
                      className={styles.input}
                      type="password"
                      autoComplete="new-password"
                      aria-invalid={Boolean(passwordErrors.confirmPassword)}
                      aria-describedby={passwordErrors.confirmPassword ? "profile-confirm-password-error" : undefined}
                      {...registerPassword("confirmPassword")}
                    />
                    {passwordErrors.confirmPassword && <span className={styles.fieldError} id="profile-confirm-password-error" role="alert">{passwordErrors.confirmPassword.message}</span>}
                  </label>
                </div>
                <button className={styles.button} type="submit" disabled={saving}>Atualizar senha</button>
              </form>
            </section>
            <section className={`${styles.section} ${styles.sectionWide}`}>
              <h2>Histórico de testes</h2>
              <p className={styles.hint}>O histórico fica salvo apenas neste navegador e nesta conta. Os PDFs são gerados no momento do download.</p>
              {historyLoading ? (
                <p className={styles.status} role="status">Carregando histórico...</p>
              ) : historyError ? (
                <p className={styles.statusError} role="alert">{historyError}</p>
              ) : testHistory.length === 0 ? (
                <p className={styles.hint}>Nenhum teste concluído foi registrado neste navegador para esta conta ainda.</p>
              ) : (
                <ul className={styles.historyList}>
                  {testHistory.map((entry) => (
                    <li className={styles.historyItem} key={entry.id}>
                      <div className={styles.historySummary}>
                        <h3>{entry.testName}</h3>
                        <p>{formatCompletedAt(entry.completedAt)}</p>
                        <p>{entry.score} pontos · {entry.attempts} tentativas · {entry.duration}</p>
                        {entry.details.length > 0 && (
                          <dl className={styles.historyDetails}>
                            {entry.details.map(([label, value]) => (
                              <div key={label}>
                                <dt>{label}</dt>
                                <dd>{value}</dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </div>
                      <button
                        className={styles.button}
                        type="button"
                        disabled={downloadingId !== null}
                        onClick={() => void handleDownload(entry)}
                      >
                        {downloadingId === entry.id ? "Gerando PDF..." : "Baixar PDF"}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {downloadError && <p className={styles.statusError} role="alert">{downloadError}</p>}
            </section>
            {status && <p className={`${styles.status} ${isError ? styles.statusError : ""}`} role={isError ? "alert" : "status"}>{status}</p>}
          </div>
        )}
      </div>
    </main>
  );
}