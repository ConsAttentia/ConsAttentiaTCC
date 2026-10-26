export function getAuthErrorMessage(error: unknown, context?: "profile"): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return context === "profile" ? "A senha atual não confere." : "Email ou senha inválidos.";
    case "auth/email-already-in-use":
      return "Este email já está cadastrado.";
    case "auth/invalid-email":
      return "Informe um email válido.";
    case "auth/weak-password":
      return "A senha deve ter pelo menos 6 caracteres.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    case "auth/network-request-failed":
      return "Falha de conexão. Verifique sua internet e tente novamente.";
    case "auth/operation-not-allowed":
      return "Este método de autenticação não está habilitado no Firebase.";
    case "auth/requires-recent-login":
      return "Entre novamente na conta e tente de novo.";
    default:
      if (code.startsWith("auth/")) {
        return "Ocorreu um erro de autenticação. Tente novamente.";
      }
      return error instanceof Error && error.message
        ? error.message
        : "Não foi possível concluir a autenticação. Tente novamente.";
  }
}
